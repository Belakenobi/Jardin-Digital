import { Router } from "express";

import {
  getPublicGardenById,
  listPublicGardens,
} from "../controllers/public.controller.js";

const router = Router();

router.get("/gardens", listPublicGardens);

router.get(
  "/gardens/:gardenId",
  getPublicGardenById
);

export default router;
