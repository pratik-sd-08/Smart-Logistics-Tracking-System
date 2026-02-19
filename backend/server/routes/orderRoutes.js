import express from "express";
import {
  createOrder,
  updateStatus,
  getOrders,
  deleteOrder,
  updateOrder
} from "../controllers/orderController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/", protect, createOrder);
router.get("/", protect, getOrders);

router.put(
  "/status/:id",
  protect,
  authorize("admin", "driver"),
  updateStatus
);

router.put("/update/:id", protect, updateOrder);

router.delete("/:id", protect, deleteOrder);

export default router;
