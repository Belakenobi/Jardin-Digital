import {
  createGalleryImageService,
  getGalleryImagesService,
  updateGalleryImageService,
  deleteGalleryImageService,
} from "../services/gallery.service.js";

function validateImageDetails(description, noteId) {
  if (description !== undefined && description !== null) {
    if (typeof description !== "string") return "La descripción debe ser texto o estar vacía.";
    if (description.trim().length > 1000) return "La descripción de la imagen debe tener como máximo 1000 caracteres.";
  }
  if (noteId !== undefined && noteId !== null && typeof noteId !== "string") {
    return "Selecciona una nota válida o deja la imagen sin nota asociada.";
  }
  return null;
}

export const createGalleryImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "Selecciona una imagen JPG, PNG o WEBP de hasta 5 MB.",
      });
    }

    const { description, noteId } = req.body;

    const validationError = validateImageDetails(description, noteId);
    if (validationError) {
      return res.status(400).json({ status: "error", message: validationError });
    }

    const image = await createGalleryImageService({
      supabase: req.supabase,
      userId: req.user.id,
      file: req.file,
      description,
      noteId,
    });

    return res.status(201).json({
      status: "success",
      data: image,
    });
  } catch (error) {
    next(error);
  }
};

export const getGalleryImages = async (
  req,
  res,
  next
) => {
  try {
    const images = await getGalleryImagesService({
      supabase: req.supabase,
      userId: req.user.id,
    });

    return res.status(200).json({
      status: "success",
      images,
    });
  } catch (error) {
    next(error);
  }
};

export const updateGalleryImage = async (
  req,
  res,
  next
) => {
  try {
    const { description, noteId } = req.body;

    const validationError = validateImageDetails(description, noteId);
    if (validationError) {
      return res.status(400).json({ status: "error", message: validationError });
    }

    const image = await updateGalleryImageService({
      supabase: req.supabase,
      userId: req.user.id,
      imageId: req.params.id,
      description,
      noteId,
    });

    return res.status(200).json({
      status: "success",
      data: image,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteGalleryImage = async (
  req,
  res,
  next
) => {
  try {
    const result = await deleteGalleryImageService({
      supabase: req.supabase,
      userId: req.user.id,
      imageId: req.params.id,
    });

    return res.status(200).json({
      status: "success",
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};
