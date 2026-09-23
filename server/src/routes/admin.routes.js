import { Router } from "express";

import {
  getSummary,
  getUsers,
} from "../controllers/admin.controller.js";
import {
  authenticate,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate, authorizeRoles("admin"));

router.get("/summary", getSummary);
router.get("/users", getUsers);

export default router;
