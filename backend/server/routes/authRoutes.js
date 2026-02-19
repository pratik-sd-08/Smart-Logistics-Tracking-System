import express from "express";
import { register, login, logout, getDrivers } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.get(
  "/drivers",
  protect,
  authorizeRoles("admin"),
  getDrivers
);

export default router;
