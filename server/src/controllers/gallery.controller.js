import {
  createGalleryImageService,
  getGalleryImagesService,
  updateGalleryImageService,
  deleteGalleryImageService,
} from "../services/gallery.service.js";

export const createGalleryImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "Image file is required",
      });
    }

    const { description, noteId } = req.body;


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
