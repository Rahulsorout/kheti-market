import mongoose from "mongoose";
const CropListingSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },

  cropName: { type: String, index: true },
  quantity: { type: Number, required: true },
  unit: { type: String, default: "kg" },

  expectedHarvestDate: { type: Date, index: true },
  minPrice: { type: Number },

  location: { type: String, index: true },

  status: { type: String, enum: ["ACTIVE", "CONTRACTED", "CANCELLED"], default: "ACTIVE", index: true }

}, { timestamps: true });

CropListingSchema.index({ createdAt: -1, _id: -1 });
CropListingSchema.index({ minPrice: 1, _id: -1 });
CropListingSchema.index({ expectedHarvestDate: 1, _id: -1 });
CropListingSchema.index({ quantity: 1 });
// CropListingSchema.index({ cropName: 1 });
// CropListingSchema.index({ location: 1 });


const CropListing = mongoose.model("CropListing", CropListingSchema);

export default CropListing;