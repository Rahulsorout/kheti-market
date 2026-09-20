import express from "express";
const router = express.Router();

import protect from "../middleware/authMiddleware";

const {
  createProduct,
  getAllProducts,
  getProducts,
  updateProduct,
  deleteProduct,
  searchProducts
} = require("../controllers/productController");


// CREATE product (farmer only)
router.post("/", protect, createProduct);

// GET all products (public)
router.get("/", getAllProducts);

// GET logged-in farmer's products
router.get("/my", protect, getProducts);

// UPDATE product
router.put("/:id", protect, updateProduct);

// DELETE product
router.delete("/:id", protect, deleteProduct);

router.get("/search", searchProducts);


export default router;
