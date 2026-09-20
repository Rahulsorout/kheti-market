import mongoose from "mongoose";
const BidSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: "CropListing", index: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },

  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  deliveryDate: { type: Date },

  status: { type: String, enum: ["PENDING", "ACCEPTED", "REJECTED", "COUNTERED", "EXPIRED"], default: "PENDING", index: true }

}, { timestamps: true });

BidSchema.index({ listing: 1, status: 1 });
BidSchema.index({ buyer: 1, createdAt: -1 });

const Bid = mongoose.model("Bid", BidSchema);

export default Bid;
