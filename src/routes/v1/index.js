import express from "express";

import authRoutes from "./auth.js";
import userRoutes from "./user.js";
import listingRoutes from "./listing.js";
import orderRoutes from "./order.js";
import bidRoutes from "./bid.js";
import contractRoutes from "./contract.js";
import paymentRoutes from "./payment.js";
import shipmentRoutes from "./shipment.js";
import chatRoutes from "./chat.js";
import reviewRoutes from "./review.js";
import adminRoutes from "./admin.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/listings", listingRoutes);
router.use("/orders", orderRoutes);

router.use("/", bidRoutes);
router.use("/contracts", contractRoutes);
router.use("/", paymentRoutes);
router.use("/", shipmentRoutes);
router.use("/", chatRoutes);
router.use("/", reviewRoutes);
router.use("/admin", adminRoutes);

export default router;