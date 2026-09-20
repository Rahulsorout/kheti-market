
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["FARMER", "BUYER", "ADMIN"],
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      unique: true,
      index: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    phone: String,

    profile: {
      location: {
        type: String,
        index: true,
      },

      companyName: String, // buyer

      landSize: Number, // farmer

      crops: [String],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

UserSchema.index({
  role: 1,
  "profile.location": 1,
});

const User = mongoose.model("User", UserSchema);

export default User;
