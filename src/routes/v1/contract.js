import express from "express";
import {
  getMyContracts,
  getContractDetail,
  updateContractStatus
} from "../../controllers/contractController.js";

import { protect } from "../../middleware/authMiddleware.js";
import { validateObjectId } from "../../middleware/validateObjectId.js";

const router = express.Router();

// Get My Contracts
router.get("/", protect, getMyContracts);

router.get("/:id", protect, validateObjectId("id"), getContractDetail);
router.post("/:id/status", protect, validateObjectId("id"), updateContractStatus);


export default router;
