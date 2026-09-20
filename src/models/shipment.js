import mongoose from "mongoose";

const ShipmentSchema = new mongoose.Schema(
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

    trackingNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    carrier: {
      type: String,
      required: true,
      default: "KhetiMarket Logistics"
    },

    status: {
      type: String,
      enum: [
        "CREATED",
        "SHIPPED",
        "IN_TRANSIT",
        "OUT_FOR_DELIVERY",
        "DELIVERED"
      ],
      default: "CREATED",
      index: true
    },

    shippedAt: {
      type: Date,
      default: null
    },

    deliveredAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

ShipmentSchema.index({
  buyer: 1,
  status: 1
});

ShipmentSchema.index({
  farmer: 1,
  status: 1
});

const Shipment = mongoose.model(
  "Shipment",
  ShipmentSchema
);

export default Shipment;