import express from "express";

import {
  createOrder,
  farmerDashboard,
  getMyOrders,
  getBuyerOrders,
  updateOrderStatus,
  getOrderById
} from "../../controllers/orderController.js";

import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Buyer places order
router.post("/", protect, createOrder);

// Farmer gets their orders
router.get("/", protect, getMyOrders);

// Buyer gets their orders
router.get("/buyer", protect, getBuyerOrders);

// Farmer dashboard
router.get("/dashboard/farmer", protect, farmerDashboard);

// Farmer updates order status
router.patch("/:id/status", protect, updateOrderStatus);
router.get("/:id", protect, getOrderById);

export default router;