import Shipment from "../models/shipment.js";
import Order from "../models/order.js";
import Payment from "../models/payment.js";
import { getIO } from "../socket.js";


// ------------------------------------
// Create shipment
// ------------------------------------

export const createShipment = async (
  req,
  res
) => {
  try {
    if (req.user.role !== "FARMER") {
      return res.status(403).json({
        message:
          "Only farmers can create shipments"
      });
    }

    const { orderId, carrier } =
      req.body;

    if (!orderId) {
      return res.status(400).json({
        message: "Order ID is required"
      });
    }

    const order =
      await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    // Check farmer ownership
    if (
      order.farmer.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You cannot create shipment for this order"
      });
    }

    // Payment must exist
    const payment =
      await Payment.findOne({
        order: order._id
      });

    if (!payment) {
      return res.status(400).json({
        message:
          "Payment has not been created for this order"
      });
    }

    if (payment.status !== "PAID") {
      return res.status(400).json({
        message:
          "Payment must be completed before shipment"
      });
    }

    // Shipment already exists
    const existingShipment =
      await Shipment.findOne({
        order: order._id
      });

    if (existingShipment) {
      return res.status(409).json({
        message:
          "Shipment already exists for this order",
        shipment: existingShipment
      });
    }

    const trackingNumber =
      `KM-${Date.now()}-${Math.floor(
        Math.random() * 10000
      )}`;

    const shipment =
      await Shipment.create({
        order: order._id,
        buyer: order.buyer,
        farmer: order.farmer,
        trackingNumber,
        carrier:
          carrier ||
          "KhetiMarket Logistics",
        status: "CREATED"
      });
      const io = getIO();

io.to(`order:${order._id}`).emit(
  "shipmentCreated",
  {
    orderId: order._id,
    shipmentId: shipment._id,
    trackingNumber: shipment.trackingNumber,
    carrier: shipment.carrier,
    status: shipment.status
  }
);

    return res.status(201).json({
      message:
        "Shipment created successfully",
      shipment
    });

  } catch (error) {
    console.error(
      "CREATE SHIPMENT ERROR:",
      error
    );

    return res.status(500).json({
      message: "Cannot create shipment"
    });
  }
};


// ------------------------------------
// Get shipment by order
// ------------------------------------

export const getShipmentByOrder = async (
  req,
  res
) => {
  try {
    const shipment =
      await Shipment.findOne({
        order: req.params.orderId
      })
        .populate(
          "order",
          "quantity totalPrice status"
        )
        .populate(
          "buyer",
          "name email phone"
        )
        .populate(
          "farmer",
          "name email phone"
        );

    if (!shipment) {
      return res.status(404).json({
        message: "Shipment not found"
      });
    }

    const userId =
      req.user._id.toString();

    const isBuyer =
      shipment.buyer._id.toString() ===
      userId;

    const isFarmer =
      shipment.farmer._id.toString() ===
      userId;

    if (!isBuyer && !isFarmer) {
      return res.status(403).json({
        message:
          "You cannot view this shipment"
      });
    }

    return res.json(shipment);

  } catch (error) {
    console.error(
      "GET SHIPMENT ERROR:",
      error
    );

    return res.status(500).json({
      message: "Cannot fetch shipment"
    });
  }
};


// ------------------------------------
// Update shipment status
// ------------------------------------

export const updateShipmentStatus =
  async (req, res) => {
    try {
      if (req.user.role !== "FARMER") {
        return res.status(403).json({
          message:
            "Only farmers can update shipment status"
        });
      }

      const { status } =
        req.body;

      const shipment =
        await Shipment.findById(
          req.params.id
        );

      if (!shipment) {
        return res.status(404).json({
          message: "Shipment not found"
        });
      }

      if (
        shipment.farmer.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          message:
            "You cannot update this shipment"
        });
      }

      const allowedTransitions = {
        CREATED: ["SHIPPED"],
        SHIPPED: ["IN_TRANSIT"],
        IN_TRANSIT: [
          "OUT_FOR_DELIVERY"
        ],
        OUT_FOR_DELIVERY: [
          "DELIVERED"
        ],
        DELIVERED: []
      };

      const allowedNextStatuses =
        allowedTransitions[
          shipment.status
        ] || [];

      if (
        !allowedNextStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          message:
            `Cannot change shipment from ${shipment.status} to ${status}`
        });
      }

      shipment.status = status;

      if (status === "SHIPPED") {
        shipment.shippedAt =
          new Date();
      }

      if (status === "DELIVERED") {
        shipment.deliveredAt =
          new Date();
      }

      await shipment.save();

      // Update order status too
      const order =
        await Order.findById(
          shipment.order
        );

      if (order) {
        if (status === "SHIPPED") {
          order.status = "SHIPPED";
        }

        if (status === "DELIVERED") {
          order.status = "DELIVERED";
        }

        await order.save();

        const io = getIO();

io.to(`order:${order._id}`)
  .emit(
    "orderStatusUpdated",
    {
      orderId: order._id,
      status: order.status
    }
  );

io.to(`order:${order._id}`)
  .emit(
    "shipmentStatusUpdated",
    {
      orderId: order._id,
      shipmentId: shipment._id,
      status: shipment.status,
      shippedAt: shipment.shippedAt,
      deliveredAt: shipment.deliveredAt
    }
  );
      }

      return res.json({
        message:
          "Shipment status updated successfully",
        shipment
      });

    } catch (error) {
      console.error(
        "UPDATE SHIPMENT ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Cannot update shipment status"
      });
    }
  };