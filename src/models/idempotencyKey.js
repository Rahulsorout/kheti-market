import mongoose from "mongoose";

const idempotencyKeySchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    endpoint: { type: String, required: true },

    // Stored response
    responseStatus: { type: Number, required: true },
    responseBody: { type: Object, required: true }
  },
  { timestamps: true }
);

// A key is unique per user + endpoint
idempotencyKeySchema.index({ key: 1, user: 1, endpoint: 1 }, { unique: true });

export default mongoose.model("IdempotencyKey", idempotencyKeySchema);
