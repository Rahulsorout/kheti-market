import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
      index: true
    },

    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    method: {
      type: String,
      enum: ["COD", "UPI", "CARD", "BANK_TRANSFER"],
      required: true
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "PAID",
        "FAILED",
        "REFUNDED"
      ],
      default: "PENDING",
      index: true
    },

    transactionId: {
  type: String,
  unique: true,
  sparse: true
}
  },
  {
    timestamps: true
  }
);

PaymentSchema.index({
  buyer: 1,
  status: 1
});

PaymentSchema.index({
  farmer: 1,
  status: 1
});

const Payment = mongoose.model(
  "Payment",
  PaymentSchema
);

export default Payment;