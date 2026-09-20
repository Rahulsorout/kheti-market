import express from "express";

import {
  getMessages,
  sendMessage
} from "../../controllers/chatController.js";

import {
  protect
} from "../../middleware/authMiddleware.js";

import {
  validateObjectId
} from "../../middleware/validateObjectId.js";

const router = express.Router();


// Get Messages
router.get(
  "/contracts/:id/messages",
  protect,
  validateObjectId("id"),
  getMessages
);


// Send Message
router.post(
  "/contracts/:id/messages",
  protect,
  validateObjectId("id"),
  sendMessage
);

export default router;