import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getMyNotes,
  createMyNote,
  getMyNoteById,
  updateMyNote,
  deleteMyNote,
} from "../controllers/note.controller.js";

const router = Router();

router.get("/", authenticate, getMyNotes);
router.post("/", authenticate, createMyNote);

router.get("/:id", authenticate, getMyNoteById);
router.patch("/:id", authenticate, updateMyNote);
router.delete("/:id", authenticate, deleteMyNote);

export default router;
