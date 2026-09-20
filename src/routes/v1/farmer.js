import express from "express";
const router = express.Router();

import protect from "../middleware/authMiddleware";
import authorizeRoles from "../middleware/roleMiddleware";
import { getAvailableContracts } from "../controllers/farmerController";

// Only farmers can access these routes
router.get(
  "/contracts",
  protect,
  authorizeRoles("farmer"),
  getAvailableContracts
);

export default router;
