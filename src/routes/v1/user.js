import express from "express";

import {
  getMyProfile,
  updateMyProfile,

  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserBlock,
  toggleUserStatus,
  verifyUser,
  deleteUser,
} from "../../controllers/userController.js";

import { protect } from "../../middleware/authMiddleware.js";
import { adminOnly } from "../../middleware/adminMiddleware.js";

const router = express.Router();


// =====================================================
// NORMAL USER ROUTES
// =====================================================

router.get(
  "/me",
  protect,
  getMyProfile
);

router.put(
  "/me",
  protect,
  updateMyProfile
);


// =====================================================
// ADMIN ROUTES
// =====================================================

// GET all users
router.get(
  "/admin/all",
  protect,
  adminOnly,
  getAllUsers
);


// GET individual user
router.get(
  "/admin/:id",
  protect,
  adminOnly,
  getUserById
);


// Change role
router.patch(
  "/admin/:id/role",
  protect,
  adminOnly,
  updateUserRole
);


// Block / unblock
router.patch(
  "/admin/:id/block",
  protect,
  adminOnly,
  toggleUserBlock
);


// Activate / deactivate
router.patch(
  "/admin/:id/status",
  protect,
  adminOnly,
  toggleUserStatus
);


// Verify / unverify
router.patch(
  "/admin/:id/verify",
  protect,
  adminOnly,
  verifyUser
);


// Delete
router.delete(
  "/admin/:id",
  protect,
  adminOnly,
  deleteUser
);


export default router;