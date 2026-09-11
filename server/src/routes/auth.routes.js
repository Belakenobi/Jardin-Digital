import { Router } from "express";
import {
  getAdminAccess,
  getCurrentUser,
  login,
  register,
} from "../controllers/auth.controller.js";
import {
  authenticate,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", authenticate, getCurrentUser);

router.get(
  "/admin/check",
  authenticate,
  authorizeRoles("admin"),
  getAdminAccess
);

export default router;
