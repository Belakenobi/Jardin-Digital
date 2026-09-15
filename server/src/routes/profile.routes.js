import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getMyProfile, updateMyProfile } from "../controllers/profile.controller.js";

const router = Router();

router.get("/", authenticate, getMyProfile);
router.patch("/", authenticate, updateMyProfile);



export default router;
