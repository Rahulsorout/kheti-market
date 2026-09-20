import Payment from "../models/payment.js";
import Contract from "../models/contract.js";
import { success, failure } from "../utils/response.js";

// ===============================
// Create Payment Record
// POST /api/v1/contracts/:id/payment
// ===============================
export const createPaymentRecord = async (req, res) => {
  try {
    const { method } = req.body;

    if (!method) {
      return failure(res, "Payment method is required", 400);
    }

    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return failure(res, "Contract not found", 404);
    }

    // Only participants can create/view payment
    const isFarmer = contract.farmer.toString() === req.user._id.toString();
    const isBuyer = contract.buyer.toString() === req.user._id.toString();
    if (!isFarmer && !isBuyer) {
      return failure(res, "Forbidden", 403);
    }

    // Check if payment already exists
    const existing = await Payment.findOne({ contract: contract._id });
    if (existing) {
      return failure(res, "Payment already exists for this contract", 409);
    }

    const payment = await Payment.create({
      contract: contract._id,
      method,
      status: "PENDING"
    });

    return success(res, payment, 201);
  } catch (err) {
    console.error(err);
    return failure(res, "Failed to create payment", 500);
  }
};

// ===============================
// Mark Paid (Buyer only)
// POST /api/v1/payments/:id/mark-paid
// ===============================
export const markPaymentPaid = async (req, res) => {
  try {
    const { referenceId } = req.body;

    if (!referenceId) {
      return failure(res, "referenceId is required", 400);
    }

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return failure(res, "Payment not found", 404);
    }
    if (payment.status === "PAID") {
  throw new appError({
    status: 409,
    code: ERROR_CODES.PAYMENT_ALREADY_MARKED,
    message: "Payment already marked as PAID"
  });
}


    const contract = await Contract.findById(payment.contract);

    // Only buyer can mark paid
    if (contract.buyer.toString() !== req.user._id.toString()) {
      return failure(res, "Only buyer can mark payment as paid", 403);
    }

    if (payment.status === "PAID") {
      return failure(res, "Payment already marked as PAID", 409);
    }

    // Update payment
    payment.status = "PAID";
    payment.referenceId = referenceId;
    await payment.save();

    // Move contract to PAID if currently CREATED
    if (contract.status === "CREATED") {
      contract.status = "PAID";
      await contract.save();
    }

    return success(res, payment);
  } catch (err) {
    console.error(err);
    return failure(res, "Failed to mark payment paid", 500);
  }
};

// ===============================
// Get Payment Status
// GET /api/v1/contracts/:id/payment
// ===============================
export const getPaymentStatus = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return failure(res, "Contract not found", 404);
    }

    // Only participants can view
    const isFarmer = contract.farmer.toString() === req.user._id.toString();
    const isBuyer = contract.buyer.toString() === req.user._id.toString();
    if (!isFarmer && !isBuyer) {
      return failure(res, "Forbidden", 403);
    }

    const payment = await Payment.findOne({ contract: contract._id });

    if (!payment) {
      return success(res, { status: "NOT_CREATED" });
    }

    return success(res, payment);
  } catch (err) {
    console.error(err);
    return failure(res, "Failed to fetch payment status", 500);
  }
};
