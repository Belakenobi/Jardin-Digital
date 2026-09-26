import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getMyGarden,
  createMyGarden,
  deleteMyGarden,
  updateMyGarden,
} from "../controllers/garden.controller.js";

const router = Router();

router.get("/", authenticate, getMyGarden);
router.post("/", authenticate, createMyGarden);
router.patch("/", authenticate, updateMyGarden);
router.delete("/", authenticate, deleteMyGarden);

export default router;
