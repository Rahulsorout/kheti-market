import express from "express";
import { register, login } from "../../controllers/authController.js";
import {rateLimit} from "../../middleware/rateLimiter.js";

const router = express.Router();

// POST /api/v1/auth/register
router.post("/register", register);

// 10 login/register attempts per minute
router.post(
  "/login",
  rateLimit({ limit: 10, windowMs: 60 * 1000 }),
  login
);


export default router;
