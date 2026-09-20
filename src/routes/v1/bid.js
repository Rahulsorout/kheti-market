import express from "express";

import {
  placeBid,
  getBidsForListing,
  acceptBid,
  rejectBid,
  counterBid
} from "../../controllers/bidController.js";

import { protect } from "../../middleware/authMiddleware.js";
import { validateObjectId } from "../../middleware/validateObjectId.js";

const router = express.Router();


// Buyer places bid
router.post(
  "/listings/:id/bids",
  protect,
  validateObjectId("id"),
  placeBid
);


// Farmer gets bids
router.get(
  "/listings/:id/bids",
  protect,
  validateObjectId("id"),
  getBidsForListing
);


// Farmer accepts bid
router.post(
  "/bids/:bidId/accept",
  protect,
  validateObjectId("bidId"),
  acceptBid
);


// Farmer rejects bid
router.post(
  "/bids/:bidId/reject",
  protect,
  validateObjectId("bidId"),
  rejectBid
);


// Farmer counters bid
router.post(
  "/bids/:bidId/counter",
  protect,
  validateObjectId("bidId"),
  counterBid
);

export default router;