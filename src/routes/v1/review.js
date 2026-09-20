import express from "express";

import {
  createReview,
  getFarmerReviews,
  getOrderReview
} from "../../controllers/reviewController.js";

import {
  protect
} from "../../middleware/authMiddleware.js";

const router = express.Router();


// Create review
router.post(
  "/reviews",
  protect,
  createReview
);


// Get reviews for farmer
router.get(
  "/reviews/farmer/:farmerId",
  protect,
  getFarmerReviews
);


// Get review for order
router.get(
  "/reviews/order/:orderId",
  protect,
  getOrderReview
);

export default router;