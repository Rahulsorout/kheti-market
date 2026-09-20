import express from "express";

import {
  createShipment,
  getShipmentByOrder,
  updateShipmentStatus
} from "../../controllers/shipmentController.js";

import {
  protect
} from "../../middleware/authMiddleware.js";

const router = express.Router();


// Create shipment
router.post(
  "/shipments",
  protect,
  createShipment
);


// Get shipment by order
router.get(
  "/shipments/order/:orderId",
  protect,
  getShipmentByOrder
);


// Update shipment status
router.patch(
  "/shipments/:id/status",
  protect,
  updateShipmentStatus
);

export default router;