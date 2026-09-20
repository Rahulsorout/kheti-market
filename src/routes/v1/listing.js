import express from "express";
import {
  createListing,
  browseListings,
  getListingDetail,
  deleteListing
} from "../../controllers/listingController.js";

import { protect} from "../../middleware/authMiddleware.js";
import { validateObjectId } from "../../middleware/validateObjectId.js";

const router = express.Router();

// Create Listing (Farmer)
router.post("/", protect, createListing);

// Browse Listings
router.get("/", browseListings);

router.get("/:id", validateObjectId("id"), getListingDetail);
router.delete("/:id", protect, validateObjectId("id"), deleteListing);


export default router;
