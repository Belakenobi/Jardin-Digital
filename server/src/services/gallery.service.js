import { randomUUID } from "node:crypto";
import path from "node:path";

const getUserGardenId = async (supabase, userId) => {
  const { data, error } = await supabase
    .from("gardens")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.id ?? null;
};

const validateNoteBelongsToGarden = async (
  supabase,
  noteId,
  gardenId
) => {
  if (!noteId) {
    return;
  }

  const { data, error } = await supabase
    .from("notes")
    .select("id")
    .eq("id", noteId)
    .eq("garden_id", gardenId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    const validationError = new Error(
      "La nota seleccionada no está en tu jardín. Selecciona otra nota."
    );

    validationError.statusCode = 400;

    throw validationError;
  }
};

export const createGalleryImageService = async ({
  supabase,
  userId,
  file,
  description,
  noteId,
}) => {
  const gardenId = await getUserGardenId(
    supabase,
    userId
  );

  if (!gardenId) {
    const error = new Error("No se encontró tu jardín. Créalo desde Perfil y jardín para continuar.");
    error.statusCode = 404;
    throw error;
  }

  await validateNoteBelongsToGarden(
    supabase,
    noteId,
    gardenId
  );

  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  const fileName = `${randomUUID()}${extension}`;
  const storagePath = `${userId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("gallery")
    .upload(storagePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data, error } = await supabase
    .from("gallery_images")
    .insert({
      garden_id: gardenId,
      storage_path: storagePath,
      description: description?.trim() || null,
      note_id: noteId || null,
    })
    .select(
      "id, garden_id, storage_path, description, note_id, created_at, updated_at"
    )
    .single();

  if (error) {
    await supabase.storage
      .from("gallery")
      .remove([storagePath]);

    throw error;
  }

  return {
    id: data.id,
    gardenId: data.garden_id,
    storagePath: data.storage_path,
    description: data.description,
    noteId: data.note_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

export const getGalleryImagesService = async ({
  supabase,
  userId,
}) => {
  const gardenId = await getUserGardenId(
    supabase,
    userId
  );

  if (!gardenId) {
    const error = new Error("No se encontró tu jardín. Créalo desde Perfil y jardín para continuar.");
    error.statusCode = 404;
    throw error;
  }

  const { data, error } = await supabase
    .from("gallery_images")
    .select(
      "id, garden_id, storage_path, description, note_id, created_at, updated_at"
    )
    .eq("garden_id", gardenId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const images = await Promise.all(
    data.map(async (image) => {
      const { data: signedData, error: signedError } =
        await supabase.storage
          .from("gallery")
          .createSignedUrl(
            image.storage_path,
            60 * 60
          );

      if (signedError) {
        throw signedError;
      }

      return {
        id: image.id,
        gardenId: image.garden_id,
        storagePath: image.storage_path,
        description: image.description,
        noteId: image.note_id,
        imageUrl: signedData.signedUrl,
        createdAt: image.created_at,
        updatedAt: image.updated_at,
      };
    })
  );

  return images;
};

export const updateGalleryImageService = async ({
  supabase,
  userId,
  imageId,
  description,
  noteId,
}) => {
  const gardenId = await getUserGardenId(
    supabase,
    userId
  );

  if (!gardenId) {
    const error = new Error("No se encontró tu jardín. Créalo desde Perfil y jardín para continuar.");
    error.statusCode = 404;
    throw error;
  }

  await validateNoteBelongsToGarden(
    supabase,
    noteId,
    gardenId
  );

  const { data: existingImage, error: existingError } =
    await supabase
      .from("gallery_images")
      .select("id")
      .eq("id", imageId)
      .eq("garden_id", gardenId)
      .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (!existingImage) {
    const error = new Error("No se encontró la imagen. Actualiza la galería e inténtalo de nuevo.");
    error.statusCode = 404;
    throw error;
  }

  const updateData = {};

  if (description !== undefined) {
    updateData.description =
      description?.trim() || null;
  }

  if (noteId !== undefined) {
    updateData.note_id = noteId || null;
  }

  if (Object.keys(updateData).length === 0) {
    const error = new Error(
      "Modifica la descripción o la nota asociada antes de guardar."
    );
    error.statusCode = 400;
    throw error;
  }

  const { data, error } = await supabase
    .from("gallery_images")
    .update(updateData)
    .eq("id", imageId)
    .eq("garden_id", gardenId)
    .select(
      "id, garden_id, storage_path, description, note_id, created_at, updated_at"
    )
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    gardenId: data.garden_id,
    storagePath: data.storage_path,
    description: data.description,
    noteId: data.note_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

export const deleteGalleryImageService = async ({
  supabase,
  userId,
  imageId,
}) => {
  const gardenId = await getUserGardenId(
    supabase,
    userId
  );

  if (!gardenId) {
    const error = new Error("No se encontró tu jardín. Créalo desde Perfil y jardín para continuar.");
    error.statusCode = 404;
    throw error;
  }

  const { data: image, error: findError } =
    await supabase
      .from("gallery_images")
      .select("id, storage_path")
      .eq("id", imageId)
      .eq("garden_id", gardenId)
      .maybeSingle();

  if (findError) {
    throw findError;
  }

  if (!image) {
    const error = new Error("No se encontró la imagen. Actualiza la galería e inténtalo de nuevo.");
    error.statusCode = 404;
    throw error;
  }

  const { error: storageError } = await supabase.storage
    .from("gallery")
    .remove([image.storage_path]);

  if (storageError) {
    throw storageError;
  }

  const { error: deleteError } = await supabase
    .from("gallery_images")
    .delete()
    .eq("id", imageId)
    .eq("garden_id", gardenId);

  if (deleteError) {
    throw deleteError;
  }

  return {
    message: "Gallery image deleted successfully",
  };
};
