// src/models/contract.js

import mongoose from "mongoose";

const ContractSchema = new mongoose.Schema(
  {
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

    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CropListing",
      required: true
    },

    bid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bid"
    },
    order: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Order",
  index: true
},

    cropName: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    deliveryDate: {
      type: Date
    },

    status: {
      type: String,
      enum: [
        "CREATED",
        "IN_PROGRESS",
        "SHIPPED",
        "DELIVERED",
        "COMPLETED",
        "DISPUTED",
        "CANCELLED"
      ],
      default: "CREATED",
      index: true
    }
  },
  {
    timestamps: true
  }
);


ContractSchema.index({
  farmer: 1,
  status: 1
});

ContractSchema.index({
  buyer: 1,
  status: 1
});


const Contract = mongoose.model(
  "Contract",
  ContractSchema
);



export default Contract;