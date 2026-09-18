import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import { uploadGalleryImage } from "../middleware/upload.middleware.js";
import {
  createGalleryImage,
  getGalleryImages,
  updateGalleryImage,
  deleteGalleryImage,
} from "../controllers/gallery.controller.js";

const router = Router();
router.get(
  "/",
  authenticate,
  getGalleryImages
);

router.post(
  "/",
  authenticate,
  uploadGalleryImage.single("image"),
  createGalleryImage
);

router.patch(
  "/:id",
  authenticate,
  updateGalleryImage
);

router.delete(
  "/:id",
  authenticate,
  deleteGalleryImage
);

export default router;
