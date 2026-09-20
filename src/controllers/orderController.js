import Order from "../models/order.js";
import CropListing from "../models/cropListing.js";
import { getIO } from "../socket.js";

// Create a new order
// POST /api/v1/orders
// Buyer only
export const createOrder = async (req, res) => {
  try {
    // Only BUYER can place an order
    if (req.user.role !== "BUYER") {
      return res.status(403).json({
        message: "Only buyers can place orders"
      });
    }

    const { listingId, quantity } = req.body;

    // Validate input
    if (!listingId || !quantity) {
      return res.status(400).json({
        message: "Listing ID and quantity are required"
      });
    }

    // Find listing
    const listing = await CropListing.findById(listingId);

    if (!listing) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    // Check listing status
    if (listing.status !== "ACTIVE") {
      return res.status(400).json({
        message: "This product is not available"
      });
    }

    // Check quantity
    if (quantity > listing.quantity) {
      return res.status(400).json({
        message: "Not enough product quantity available"
      });
    }

    // Calculate total price
    const totalPrice = quantity * listing.minPrice;

    // Create order
    const order = await Order.create({
      listing: listing._id,
      farmer: listing.farmer,
      buyer: req.user._id,
      quantity,
      totalPrice,
      status: "PENDING"
    });

    // Reduce available quantity
    listing.quantity -= quantity;

    // If nothing remains, mark listing as contracted
    if (listing.quantity === 0) {
      listing.status = "CONTRACTED";
    }

    await listing.save();

    return res.status(201).json({
      message: "Order placed successfully",
      order
    });

  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);

    return res.status(500).json({
      message: "Cannot create order"
    });
  }
};


// Farmer Dashboard
// GET /api/v1/orders/dashboard/farmer
export const farmerDashboard = async (req, res) => {
  try {
    if (req.user.role !== "FARMER") {
      return res.status(403).json({
        message: "Only farmers can access this dashboard"
      });
    }

    const totalOrders = await Order.countDocuments({
      farmer: req.user._id
    });

    const delivered = await Order.countDocuments({
      farmer: req.user._id,
      status: "DELIVERED"
    });

    const pending = await Order.countDocuments({
      farmer: req.user._id,
      status: "PENDING"
    });

    return res.json({
      totalOrders,
      delivered,
      pending
    });

  } catch (error) {
    console.error("FARMER DASHBOARD ERROR:", error);

    return res.status(500).json({
      message: "Cannot fetch farmer dashboard"
    });
  }
};

// Get orders for logged-in farmer
// GET /api/v1/orders
export const getMyOrders = async (req, res) => {
  try {
    if (req.user.role !== "FARMER") {
      return res.status(403).json({
        message: "Only farmers can access their orders"
      });
    }

    const orders = await Order.find({
      farmer: req.user._id
    })
      .populate(
        "listing",
        "cropName quantity unit minPrice location"
      )
      .populate(
        "buyer",
        "name email phone"
      )
      .sort({ createdAt: -1 });

    return res.json(orders);

  } catch (error) {
    console.error("GET FARMER ORDERS ERROR:", error);

    return res.status(500).json({
      message: "Cannot fetch orders"
    });
  }
};
// Update order status
// PATCH /api/v1/orders/:id/status
// Farmer only
export const updateOrderStatus = async (req, res) => {
  try {
    if (req.user.role !== "FARMER") {
      return res.status(403).json({
        message: "Only farmers can update order status"
      });
    }

    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    // Farmer can update only their own orders
    if (order.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You cannot update this order"
      });
    }

    // Allowed next status for each current status
    const allowedTransitions = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["SHIPPED", "CANCELLED"],
      SHIPPED: ["DELIVERED"],
      DELIVERED: [],
      CANCELLED: []
    };

    const allowedNextStatuses =
      allowedTransitions[order.status];

    if (!allowedNextStatuses.includes(status)) {
      return res.status(400).json({
        message:
          `Cannot change order from ${order.status} to ${status}`
      });
    }

    order.status = status;

await order.save();

const io = getIO();

io.to(`order:${order._id}`).emit(
  "orderStatusUpdated",
  {
    orderId: order._id,
    status: order.status
  }
);

return res.json({
  message: "Order status updated successfully",
  order
});

  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);

    return res.status(500).json({
      message: "Cannot update order status"
    });
  }
};

// Get orders for logged-in buyer
// GET /api/v1/orders/buyer
// Buyer only
export const getBuyerOrders = async (req, res) => {
  try {
    if (req.user.role !== "BUYER") {
      return res.status(403).json({
        message: "Only buyers can access their orders"
      });
    }

    const orders = await Order.find({
      buyer: req.user._id
    })
      .populate(
        "listing",
        "cropName quantity unit minPrice location"
      )
      .populate(
        "farmer",
        "name email phone"
      )
      .sort({ createdAt: -1 });

    return res.json(orders);

  } catch (error) {
    console.error("GET BUYER ORDERS ERROR:", error);

    return res.status(500).json({
      message: "Cannot fetch buyer orders"
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate(
        "listing",
        "cropName quantity unit minPrice location expectedHarvestDate"
      )
      .populate("buyer", "name email phone")
      .populate("farmer", "name email phone");

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    const buyerId = order.buyer?._id?.toString();
    const farmerId = order.farmer?._id?.toString();
    const userId = req.user._id.toString();

    if (buyerId !== userId && farmerId !== userId) {
      return res.status(403).json({
        message: "You cannot view this order"
      });
    }

    return res.json(order);

  } catch (error) {
    console.error("GET ORDER BY ID ERROR:", error);

    return res.status(500).json({
      message: "Cannot fetch order"
    });
  }
};