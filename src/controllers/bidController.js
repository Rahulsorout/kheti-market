import mongoose from "mongoose";

import Bid from "../models/bid.js";
import CropListing from "../models/cropListing.js";
import Contract from "../models/contract.js";
import Order from "../models/order.js";
import { getIO } from "../socket.js";

import {
  success,
  failure
} from "../utils/response.js";

import {
  ERROR_CODES
} from "../utils/errorCodes.js";

import {
  logAudit
} from "../utils/auditLogger.js";


// ===============================
// Place Bid
// POST /api/v1/listings/:id/bids
// ===============================

export const placeBid = async (req, res) => {
  try {

    if (req.user.role !== "BUYER") {
      return failure(
        res,
        "Only buyers can place bids",
        403
      );
    }


    const {
      price,
      quantity,
      deliveryDate
    } = req.body;


    if (
      price == null ||
      quantity == null ||
      !deliveryDate
    ) {
      return failure(
        res,
        "Price, quantity and delivery date are required",
        400
      );
    }


    if (price <= 0 || quantity <= 0) {
      return failure(
        res,
        "Price and quantity must be greater than zero",
        400
      );
    }


    const listing =
      await CropListing.findById(
        req.params.id
      );


    if (!listing) {
      return failure(
        res,
        "Listing not found",
        404
      );
    }


    if (listing.status !== "ACTIVE") {
      return failure(
        res,
        "Listing is not available",
        409
      );
    }


    if (quantity > listing.quantity) {
      return failure(
        res,
        "Bid quantity exceeds available quantity",
        400
      );
    }


    const bid = await Bid.create({
  listing: listing._id,
  buyer: req.user._id,
  price,
  quantity,
  deliveryDate,
  status: "PENDING"
});

await bid.populate("buyer", "name email");

const io = getIO();

io.to(`farmer:${listing.farmer}`).emit("newBid", {
  bidId: bid._id,
  listingId: listing._id,
  buyer: bid.buyer,
  price: bid.price,
  quantity: bid.quantity,
  deliveryDate: bid.deliveryDate,
  status: bid.status
});


    return success(
      res,
      bid,
      201
    );

  } catch (err) {

    console.error(
      "PLACE BID ERROR:",
      err
    );

    return failure(
      res,
      "Failed to place bid",
      500
    );
  }
};


// ===============================
// Get Bids for My Listing
// GET /api/v1/listings/:id/bids
// ===============================

export const getBidsForListing =
  async (req, res) => {

    try {

      const listing =
        await CropListing.findById(
          req.params.id
        );


      if (!listing) {
        return failure(
          res,
          "Listing not found",
          404
        );
      }


      if (
        listing.farmer.toString() !==
        req.user._id.toString()
      ) {
        return failure(
          res,
          {
            code:
              ERROR_CODES.FORBIDDEN,
            message:
              "You are not allowed to perform this action"
          },
          403
        );
      }


      const bids =
        await Bid.find({
          listing: listing._id
        })
          .populate(
            "buyer",
            "name email phone profile"
          )
          .sort({
            createdAt: -1
          });


      return success(
        res,
        bids
      );

    } catch (err) {

      console.error(
        "GET BIDS ERROR:",
        err
      );

      return failure(
        res,
        "Failed to fetch bids",
        500
      );
    }
  };


// ===============================
// Accept Bid
// POST /api/v1/bids/:bidId/accept
// ===============================

export const acceptBid = async (
  req,
  res
) => {

  const session =
    await mongoose.startSession();

  session.startTransaction();


  try {

    if (req.user.role !== "FARMER") {
      await session.abortTransaction();

      return failure(
        res,
        "Only farmers can accept bids",
        403
      );
    }


    const bid =
      await Bid.findById(
        req.params.bidId
      ).session(session);


    if (!bid) {
      await session.abortTransaction();

      return failure(
        res,
        "Bid not found",
        404
      );
    }


    if (bid.status !== "PENDING") {
      await session.abortTransaction();

      return failure(
        res,
        {
          code:
            ERROR_CODES.BID_ALREADY_ACCEPTED,
          message:
            "This bid is no longer available",
          details: {
            bidId:
              req.params.bidId
          }
        },
        409
      );
    }


    // Find listing

    const listing =
      await CropListing.findById(
        bid.listing
      ).session(session);


    if (!listing) {
      await session.abortTransaction();

      return failure(
        res,
        "Listing not found",
        404
      );
    }


    // Only listing owner can accept

    if (
      listing.farmer.toString() !==
      req.user._id.toString()
    ) {
      await session.abortTransaction();

      return failure(
        res,
        {
          code:
            ERROR_CODES.FORBIDDEN,
          message:
            "You are not allowed to perform this action"
        },
        403
      );
    }


    // Listing must be active

    if (listing.status !== "ACTIVE") {
      await session.abortTransaction();

      return failure(
        res,
        "Listing is no longer available",
        409
      );
    }


    // Check quantity

    if (
      bid.quantity >
      listing.quantity
    ) {
      await session.abortTransaction();

      return failure(
        res,
        "Insufficient listing quantity",
        409
      );
    }


    // --------------------------------
    // Accept selected bid
    // --------------------------------

    bid.status = "ACCEPTED";

    await bid.save({
      session
    });


    // --------------------------------
    // Reject other bids
    // --------------------------------

    await Bid.updateMany(
      {
        listing: bid.listing,
        _id: {
          $ne: bid._id
        },
        status: "PENDING"
      },
      {
        $set: {
          status: "REJECTED"
        }
      },
      {
        session
      }
    );


    // --------------------------------
    // Update listing
    // --------------------------------

    listing.quantity -=
      bid.quantity;


    if (listing.quantity === 0) {
      listing.status =
        "CONTRACTED";
    }


    await listing.save({
      session
    });


   // --------------------------------
// Create Order
// --------------------------------

const orderDocs = await Order.create(
  [
    {
      listing: listing._id,
      farmer: listing.farmer,
      buyer: bid.buyer,
      quantity: bid.quantity,
      totalPrice: bid.price * bid.quantity,
      status: "PENDING"
    }
  ],
  {
    session
  }
);

const createdOrder = orderDocs[0];


// --------------------------------
// Create Contract
// --------------------------------

const contractDocs =
  await Contract.create(
    [
      {
        farmer:
          listing.farmer,

        buyer:
          bid.buyer,

        listing:
          listing._id,

        bid:
          bid._id,

        order:
          createdOrder._id,

        cropName:
          listing.cropName,

        price:
          bid.price,

        quantity:
          bid.quantity,

        deliveryDate:
          bid.deliveryDate,

        status:
          "CREATED"
      }
    ],
    {
      session
    }
  );

const contract =
  contractDocs[0];

      // --------------------------------
// Create Order for accepted bid
// --------------------------------

// const order =
//   await Order.create(
//     [
//       {
//         listing: listing._id,
//         farmer: listing.farmer,
//         buyer: bid.buyer,
//         quantity: bid.quantity,
//         totalPrice:
//           bid.price * bid.quantity,
//         status: "PENDING"
//       }
//     ],
//     {
//       session
//     }
//   );

// const createdOrder = order[0];


    // --------------------------------
    // Audit
    // --------------------------------

    await logAudit({
      req,

      entityType: "BID",

      entityId: bid._id,

      action: "ACCEPT_BID",

      metadata: {
        contractId:
          contract._id
      }
    });


    await session.commitTransaction();
    const io = getIO();

io.to(`buyer:${bid.buyer}`).emit("bidUpdated", {
  bidId: bid._id,
  listingId: listing._id,
  status: bid.status,
  contractId: contract._id,
  orderId: createdOrder._id
});
io.to(`buyer:${bid.buyer}`).emit("orderCreated", {
  orderId: createdOrder._id,
  contractId: contract._id,
  listingId: listing._id,
  status: createdOrder.status
});

    return success(
  res,
  {
    bidId: bid._id,
    contractId: contract._id,
    orderId: createdOrder._id
  }
);

  } catch (err) {

    console.error(
      "ACCEPT BID ERROR:",
      err
    );


    await session.abortTransaction();


    return failure(
      res,
      "Failed to accept bid",
      500
    );

  } finally {

    session.endSession();

  }
};


// ===============================
// Reject Bid
// POST /api/v1/bids/:bidId/reject
// ===============================

export const rejectBid = async (
  req,
  res
) => {

  try {

    const bid =
      await Bid.findById(
        req.params.bidId
      );


    if (!bid) {
      return failure(
        res,
        "Bid not found",
        404
      );
    }


    const listing =
      await CropListing.findById(
        bid.listing
      );


    if (!listing) {
      return failure(
        res,
        "Listing not found",
        404
      );
    }


    if (
      listing.farmer.toString() !==
      req.user._id.toString()
    ) {
      return failure(
        res,
        "Forbidden",
        403
      );
    }


    if (bid.status !== "PENDING") {
      return failure(
        res,
        "Bid already processed",
        409
      );
    }


    bid.status =
      "REJECTED";


    await bid.save();
    const io = getIO();

io.to(`buyer:${bid.buyer}`).emit("bidUpdated", {
  bidId: bid._id,
  listingId: bid.listing,
  status: bid.status
});


    return success(
      res,
      {
        message:
          "Bid rejected"
      }
    );

  } catch (err) {

    console.error(
      "REJECT BID ERROR:",
      err
    );

    return failure(
      res,
      "Failed to reject bid",
      500
    );
  }
};


// ===============================
// Counter Bid
// POST /api/v1/bids/:bidId/counter
// ===============================

export const counterBid = async (
  req,
  res
) => {

  try {

    const {
      price
    } = req.body;


    if (
      price == null ||
      price <= 0
    ) {
      return failure(
        res,
        "Valid price is required",
        400
      );
    }


    const bid =
      await Bid.findById(
        req.params.bidId
      );


    if (!bid) {
      return failure(
        res,
        "Bid not found",
        404
      );
    }


    const listing =
      await CropListing.findById(
        bid.listing
      );


    if (!listing) {
      return failure(
        res,
        "Listing not found",
        404
      );
    }


    if (
      listing.farmer.toString() !==
      req.user._id.toString()
    ) {
      return failure(
        res,
        "Forbidden",
        403
      );
    }


    if (bid.status !== "PENDING") {
      return failure(
        res,
        "Bid already processed",
        409
      );
    }


    bid.price =
      price;


    bid.status =
      "COUNTERED";


    await bid.save();


    return success(
      res,
      bid
    );

  } catch (err) {

    console.error(
      "COUNTER BID ERROR:",
      err
    );

    return failure(
      res,
      "Failed to counter bid",
      500
    );
  }
};