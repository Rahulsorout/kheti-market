import AuditLog from "../models/auditLog.js";

export const logAudit = async ({
  req,
  entityType,
  entityId,
  action,
  metadata = null
}) => {
  try {
    await AuditLog.create({
      requestId: req.requestId,
      entityType,
      entityId,
      action,
      performedBy: req.user?._id || null,
      metadata
    });
  } catch (err) {
    // Audit log failure should NEVER break main flow
    console.error("⚠️ Audit log failed:", err);
  }
};
