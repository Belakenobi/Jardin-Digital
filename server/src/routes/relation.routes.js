import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  createMyRelation,
  getMyNoteRelations,
  deleteMyRelation,
} from "../controllers/relation.controller.js";

const router = Router();

router.post("/", authenticate, createMyRelation);

router.get(
  "/note/:noteId",
  authenticate,
  getMyNoteRelations
);

router.delete(
  "/:id",
  authenticate,
  deleteMyRelation
);

export default router;
