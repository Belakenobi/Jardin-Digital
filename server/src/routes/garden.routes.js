import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getMyGarden,
  createMyGarden,
  updateMyGarden,
} from "../controllers/garden.controller.js";

const router = Router();

router.get("/", authenticate, getMyGarden);
router.post("/", authenticate, createMyGarden);
router.patch("/", authenticate, updateMyGarden);

export default router;
