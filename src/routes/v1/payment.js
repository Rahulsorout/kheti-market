import express from "express";

import {
  createPayment,
  getPaymentByOrder,
  markPaymentAsPaid
} from "../../controllers/paymentController.js";

import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();


// Create payment
router.post(
  "/payments",
  protect,
  createPayment
);


// Get payment for an order
router.get(
  "/payments/order/:orderId",
  protect,
  getPaymentByOrder
);


// Complete payment
router.patch(
  "/payments/:id/pay",
  protect,
  markPaymentAsPaid
);


export default router;