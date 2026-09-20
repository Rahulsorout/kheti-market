import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true
    },

    action: {
      type: String,
      index: true
    },

    entityType: {
      type: String,
      index: true
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId
    },

    requestId: {
      type: String,
      index: true
    },

    metadata: Object
  },
  {
    timestamps: true
  }
);

AuditLogSchema.index({
  entityType: 1,
  entityId: 1
});

const AuditLog = mongoose.model("AuditLog", AuditLogSchema);

export default AuditLog;