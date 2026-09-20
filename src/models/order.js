import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CropListing",
      required: true,
      index: true
    },

    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED"
      ],
      default: "PENDING",
      index: true
    }
  },
  {
    timestamps: true
  }
);

OrderSchema.index({ farmer: 1, status: 1 });
OrderSchema.index({ buyer: 1, status: 1 });

const Order = mongoose.model("Order", OrderSchema);

export default Order;