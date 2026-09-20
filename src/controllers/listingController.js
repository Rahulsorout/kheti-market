import CropListing from "../models/cropListing.js";
import Bid from "../models/bid.js";
import { success, failure } from "../utils/response.js";
import {
  encodeCursor,
  decodeCursor,
  applyCursor
} from "../utils/cursorPagination.js";

// ===============================
// Create Listing (Farmer only)
// POST /api/v1/listings
// ===============================
export const createListing = async (req, res) => {
  try {
    const { cropName, quantity, expectedHarvestDate, minPrice, location } = req.body;

    if (!cropName || !quantity || !expectedHarvestDate || !minPrice || !location) {
      return failure(res, "Missing required fields", 400);
    }

    const listing = await CropListing.create({
      cropName,
      quantity,
      expectedHarvestDate,
      minPrice,
      location,
      farmer: req.user._id
    });

    return success(res, listing, 201);
  } catch (err) {
    console.error(err);
    return failure(res, "Invalid input", 400);
  }
};



// ===============================
// Browse Listings (Search + Filter + Sort + Cursor Pagination)
// GET /api/v1/listings
// ===============================
export const browseListings = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const cursor = req.query.cursor;

    const {
      crop,
      location,
      minQuantity,
      maxQuantity,
      minPrice,
      maxPrice,
      fromDate,
      toDate,
      sort
    } = req.query;

    // -----------------------
    // 1. Build Mongo Filter
    // -----------------------
    const filter = {};

    if (crop) {
      filter.cropName = new RegExp(crop, "i");
    }

    if (location) {
      filter.location = new RegExp(location, "i");
    }

    if (minQuantity || maxQuantity) {
      filter.quantity = {};
      if (minQuantity) filter.quantity.$gte = Number(minQuantity);
      if (maxQuantity) filter.quantity.$lte = Number(maxQuantity);
    }

    if (minPrice || maxPrice) {
      filter.minPrice = {};
      if (minPrice) filter.minPrice.$gte = Number(minPrice);
      if (maxPrice) filter.minPrice.$lte = Number(maxPrice);
    }

    if (fromDate || toDate) {
      filter.expectedHarvestDate = {};
      if (fromDate) filter.expectedHarvestDate.$gte = new Date(fromDate);
      if (toDate) filter.expectedHarvestDate.$lte = new Date(toDate);
    }

    // -----------------------
    // 2. Sorting
    // -----------------------
    const sortMap = {
      price_asc: { minPrice: 1, _id: -1 },
      price_desc: { minPrice: -1, _id: -1 },
      date_asc: { expectedHarvestDate: 1, _id: -1 },
      latest: { createdAt: -1, _id: -1 }
    };

    const sortOption = sortMap[sort] || sortMap.latest;

    // -----------------------
    // 3. Build Query
    // -----------------------
    let query = CropListing.find(filter)
  .populate("farmer", "name profile")
  .sort(sortOption);

    // Apply cursor pagination
    if (cursor) {
      const decoded = decodeCursor(cursor);
      if (decoded) {
        query = applyCursor(query, decoded);
      }
    }

    // Fetch one extra to detect hasMore
    const items = await query.limit(limit + 1);

    let hasMore = false;
    let nextCursor = null;

    if (items.length > limit) {
      hasMore = true;
      const lastItem = items[limit - 1];
      nextCursor = encodeCursor(lastItem);
      items.pop();
    }

    // -----------------------
    // 4. Response
    // -----------------------
    return res.json({
      success: true,
      data: {
        items,
        nextCursor,
        hasMore
      },
      error: null
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      data: null,
      error: "Failed to fetch listings"
    });
  }
};



// ===============================
// Get Listing Detail
// GET /api/v1/listings/:id
// ===============================
export const getListingDetail = async (req, res) => {
  try {
    const listing = await CropListing.findById(req.params.id)
      .populate("farmer", "name location");

    if (!listing) {
      return failure(res, "Listing not found", 404);
    }

    return success(res, listing);
  } catch (err) {
    console.error(err);
    return failure(res, "Invalid listing id", 400);
  }
};

// ===============================
// Delete Listing
// DELETE /api/v1/listings/:id
// ❌ 409 if bids already exist
// ===============================
export const deleteListing = async (req, res) => {
  try {
    const listing = await CropListing.findById(req.params.id);

    if (!listing) {
      return failure(res, "Listing not found", 404);
    }

    // Only owner farmer can delete
    if (listing.farmer.toString() !== req.user._id.toString()) {
      return failure(res, "Forbidden", 403);
    }

    // Check if bids exist
    const bidCount = await Bid.countDocuments({ crop: listing._id });
    if (bidCount > 0) {
      return failure(res, "Cannot delete listing. Bids already exist.", 409);
    }

    await listing.deleteOne();

    return success(res, { message: "Listing deleted successfully" });
  } catch (err) {
    console.error(err);
    return failure(res, "Failed to delete listing", 500);
  }
};
