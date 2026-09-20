import User from "../models/user.js";
import Contract from "../models/contract.js";
import AuditLog from "../models/auditLog.js";
import { success, failure } from "../utils/response.js";

// ===============================
// Get All Users
// GET /api/v1/admin/users
// ===============================
export const getAllUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = Math.min(parseInt(req.query.pageSize) || 50, 200);

  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    User.find().skip(skip).limit(pageSize).select("-password"),
    User.countDocuments()
  ]);

  return success(res, {
    items,
    page,
    pageSize,
    total
  });
};


// ===============================
// Block User
// POST /api/v1/admin/users/:id/block
// ===============================
export const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return failure(res, "User not found", 404);
    }

    user.isBlocked = true;
    await user.save();

    // Audit log
    await AuditLog.create({
      entityType: "USER",
      entityId: user._id,
      action: "BLOCK_USER",
      performedBy: req.user._id
    });

    return success(res, { message: "User blocked successfully" });
  } catch (err) {
    console.error(err);
    return failure(res, "Failed to block user", 500);
  }
};

// ===============================
// Get All Contracts
// GET /api/v1/admin/contracts
// ===============================
export const getAllContracts = async (req, res) => {
  try {
    const contracts = await Contract.find()
      .populate("farmer", "name email")
      .populate("buyer", "name email")
      .populate("crop");

    return success(res, contracts);
  } catch (err) {
    console.error(err);
    return failure(res, "Failed to fetch contracts", 500);
  }
};

// ===============================
// Force Close Contract
// POST /api/v1/admin/contracts/:id/force-close
// ===============================
export const forceCloseContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return failure(res, "Contract not found", 404);
    }

    if (contract.status === "COMPLETED" || contract.status === "CANCELLED") {
      return failure(res, "Contract already closed", 409);
    }

    contract.status = "CANCELLED";
    await contract.save();

    // Audit log
    await AuditLog.create({
      entityType: "CONTRACT",
      entityId: contract._id,
      action: "FORCE_CLOSE",
      performedBy: req.user._id
    });

    return success(res, { message: "Contract force-closed" });
  } catch (err) {
    console.error(err);
    return failure(res, "Failed to force close contract", 500);
  }
};

// ===============================
// View Audit Logs
// GET /api/v1/admin/audit-logs?entityType=CONTRACT
// ===============================
export const getAuditLogs = async (req, res) => {
  try {
    const { entityType } = req.query;

    const filter = {};
    if (entityType) {
      filter.entityType = entityType;
    }

    const logs = await AuditLog.find(filter)
      .populate("performedBy", "name email role")
      .sort({ createdAt: -1 });

    return success(res, logs);
  } catch (err) {
    console.error(err);
    return failure(res, "Failed to fetch audit logs", 500);
  }
};
