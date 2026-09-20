import mongoose from "mongoose";

const ChatMessageSchema = new mongoose.Schema(
  {
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contract",
      required: true,
      index: true
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },

    read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

ChatMessageSchema.index({
  contract: 1,
  createdAt: -1
});

const ChatMessage = mongoose.model(
  "ChatMessage",
  ChatMessageSchema
);

export default ChatMessage;