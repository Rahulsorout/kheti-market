import Payment from "../models/payment.js";
import Order from "../models/order.js";


// Create payment
export const createPayment = async (req, res) => {
  try {
    if (req.user.role !== "BUYER") {
      return res.status(403).json({
        message: "Only buyers can make payments"
      });
    }

    const { orderId, method } = req.body;

    if (!orderId || !method) {
      return res.status(400).json({
        message: "Order ID and payment method are required"
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    // Make sure this order belongs to the buyer
    if (
      order.buyer.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You cannot pay for this order"
      });
    }

    // Check if payment already exists
    const existingPayment =
      await Payment.findOne({
        order: order._id
      });

    if (existingPayment) {
      return res.status(409).json({
        message: "Payment already exists for this order",
        payment: existingPayment
      });
    }

    const payment = await Payment.create({
      order: order._id,
      buyer: order.buyer,
      farmer: order.farmer,
      amount: order.totalPrice,
      method,
      status: "PENDING"
    });

    return res.status(201).json({
      message: "Payment created successfully",
      payment
    });

  } catch (error) {
    console.error(
      "CREATE PAYMENT ERROR:",
      error
    );

    return res.status(500).json({
      message: "Cannot create payment"
    });
  }
};


// Get payment by order
export const getPaymentByOrder = async (
  req,
  res
) => {
  try {
    const payment = await Payment.findOne({
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

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found"
      });
    }

    const userId = req.user._id.toString();

    const isBuyer =
      payment.buyer._id.toString() === userId;

    const isFarmer =
      payment.farmer._id.toString() === userId;

    if (!isBuyer && !isFarmer) {
      return res.status(403).json({
        message: "You cannot view this payment"
      });
    }

    return res.json(payment);

  } catch (error) {
    console.error(
      "GET PAYMENT ERROR:",
      error
    );

    return res.status(500).json({
      message: "Cannot fetch payment"
    });
  }
};


// Mark payment as paid
export const markPaymentAsPaid = async (
  req,
  res
) => {
  try {
    if (req.user.role !== "BUYER") {
      return res.status(403).json({
        message: "Only buyers can complete payments"
      });
    }

    const payment =
      await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found"
      });
    }

    if (
      payment.buyer.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You cannot update this payment"
      });
    }

    if (payment.status === "PAID") {
      return res.status(400).json({
        message: "Payment is already completed"
      });
    }

    payment.status = "PAID";

    payment.transactionId =
      `TXN-${Date.now()}-${Math.floor(
        Math.random() * 10000
      )}`;

    await payment.save();

    return res.json({
      message: "Payment completed successfully",
      payment
    });

  } catch (error) {
    console.error(
      "MARK PAYMENT ERROR:",
      error
    );

    return res.status(500).json({
      message: "Cannot complete payment"
    });
  }
};