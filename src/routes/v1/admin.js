import express from "express";
import {
  getAllUsers,
  blockUser,
  getAllContracts,
  forceCloseContract,
  getAuditLogs
} from "../../controllers/adminController.js";

import { protect} from "../../middleware/authMiddleware.js";
import { validateObjectId } from "../../middleware/validateObjectId.js";

const router = express.Router();

// All routes are admin only
router.use(protect);

// Get all users
router.get("/users", getAllUsers);

// Block user
router.post("/users/:id/block", blockUser);

// Get all contracts
router.get("/contracts", getAllContracts);

// Force close contract
router.post("/contracts/:id/force-close", forceCloseContract);

// Get audit logs
router.get("/audit-logs", getAuditLogs);

export default router;
