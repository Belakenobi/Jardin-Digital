import multer from "multer";

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const storage = multer.memoryStorage();

const fileFilter = (req, file, callback) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    const error = new Error(
      "Solo se permiten imágenes JPG, PNG o WEBP."
    );

    error.statusCode = 400;

    return callback(error);
  }

  callback(null, true);
};

export const uploadGalleryImage = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter,
});
