import express from "express";
const router = express.Router();

import protect  from "../middleware/authMiddleware";
import {
  getNotifications,
  markAsRead
} from "../controllers/notificationController";

router.get("/", protect, getNotifications);
router.put("/:id/read", protect, markAsRead);

export default router;
