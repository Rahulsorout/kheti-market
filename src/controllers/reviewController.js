import Review from "../models/review.js";
import Order from "../models/order.js";


// ------------------------------------
// Create Review
// ------------------------------------

export const createReview = async (
  req,
  res
) => {
  try {
    if (req.user.role !== "BUYER") {
      return res.status(403).json({
        message:
          "Only buyers can submit reviews"
      });
    }

    const {
      orderId,
      rating,
      comment
    } = req.body;

    if (!orderId || !rating) {
      return res.status(400).json({
        message:
          "Order ID and rating are required"
      });
    }

    if (
      rating < 1 ||
      rating > 5
    ) {
      return res.status(400).json({
        message:
          "Rating must be between 1 and 5"
      });
    }

    const order =
      await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    // Make sure this buyer owns the order
    if (
      order.buyer.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You cannot review this order"
      });
    }

    // Review only after delivery
    if (order.status !== "DELIVERED") {
      return res.status(400).json({
        message:
          "You can review an order only after delivery"
      });
    }

    // Prevent duplicate review
    const existingReview =
      await Review.findOne({
        order: order._id
      });

    if (existingReview) {
      return res.status(409).json({
        message:
          "You have already reviewed this order",
        review: existingReview
      });
    }

    const review =
      await Review.create({
        order: order._id,
        buyer: order.buyer,
        farmer: order.farmer,
        rating,
        comment
      });

    const populatedReview =
      await Review.findById(
        review._id
      )
        .populate(
          "buyer",
          "name email"
        )
        .populate(
          "farmer",
          "name email"
        )
        .populate(
          "order",
          "quantity totalPrice status"
        );

    return res.status(201).json({
      message:
        "Review submitted successfully",
      review: populatedReview
    });

  } catch (error) {
    console.error(
      "CREATE REVIEW ERROR:",
      error
    );

    return res.status(500).json({
      message: "Cannot create review"
    });
  }
};


// ------------------------------------
// Get reviews for farmer
// ------------------------------------

export const getFarmerReviews =
  async (req, res) => {
    try {
      const reviews =
        await Review.find({
          farmer: req.params.farmerId
        })
          .populate(
            "buyer",
            "name"
          )
          .populate(
            "order",
            "quantity totalPrice status"
          )
          .sort({
            createdAt: -1
          });

      const totalReviews =
        reviews.length;

      const averageRating =
        totalReviews === 0
          ? 0
          : reviews.reduce(
              (sum, review) =>
                sum + review.rating,
              0
            ) / totalReviews;

      return res.json({
        averageRating:
          Number(
            averageRating.toFixed(2)
          ),
        totalReviews,
        reviews
      });

    } catch (error) {
      console.error(
        "GET FARMER REVIEWS ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Cannot fetch farmer reviews"
      });
    }
  };


// ------------------------------------
// Get review for an order
// ------------------------------------

export const getOrderReview =
  async (req, res) => {
    try {
      const review =
        await Review.findOne({
          order: req.params.orderId
        })
          .populate(
            "buyer",
            "name email"
          )
          .populate(
            "farmer",
            "name email"
          );

      if (!review) {
        return res.status(404).json({
          message: "Review not found"
        });
      }

      const userId =
        req.user._id.toString();

      const isBuyer =
        review.buyer._id.toString() ===
        userId;

      const isFarmer =
        review.farmer._id.toString() ===
        userId;

      if (!isBuyer && !isFarmer) {
        return res.status(403).json({
          message:
            "You cannot view this review"
        });
      }

      return res.json(review);

    } catch (error) {
      console.error(
        "GET ORDER REVIEW ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Cannot fetch order review"
      });
    }
  };