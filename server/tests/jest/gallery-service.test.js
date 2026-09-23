import {
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";

import {
  createGalleryImageService,
  deleteGalleryImageService,
  getGalleryImagesService,
  updateGalleryImageService,
} from "../../src/services/gallery.service.js";
import {
  createQuery,
  createSupabaseSequence,
} from "./helpers/supabase-query.js";

const imageRow = {
  id: "image-1",
  garden_id: "garden-1",
  storage_path: "user-1/generated.png",
  description: "Una imagen",
  note_id: "note-1",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-02-01T00:00:00.000Z",
};

const expectedImage = {
  id: "image-1",
  gardenId: "garden-1",
  storagePath: "user-1/generated.png",
  description: "Una imagen",
  noteId: "note-1",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-02-01T00:00:00.000Z",
};

const gardenQuery = (result = { data: { id: "garden-1" }, error: null }) =>
  createQuery(result);

const noteValidationQuery = (result = { data: { id: "note-1" }, error: null }) =>
  createQuery(result);

function createStorage({
  uploadResult = { error: null },
  removeResult = { error: null },
  signedResults = [],
} = {}) {
  const upload = jest.fn().mockResolvedValue(uploadResult);
  const remove = jest.fn().mockResolvedValue(removeResult);
  const createSignedUrl = jest.fn();
  for (const result of signedResults) {
    createSignedUrl.mockResolvedValueOnce(result);
  }
  const bucket = { upload, remove, createSignedUrl };
  const from = jest.fn().mockReturnValue(bucket);

  return {
    storage: { from },
    from,
    upload,
    remove,
    createSignedUrl,
  };
}

function expectHttpError(error, statusCode, message) {
  expect(error).toMatchObject({ statusCode });
  expect(error.message).toMatch(message);
}

describe("gallery service", () => {
  test("uploads, registers and maps an image without an associated note", async () => {
    const storage = createStorage();
    const insertedRow = { ...imageRow, description: "Descripción", note_id: null };
    const insert = createQuery({ data: insertedRow, error: null });
    const mock = createSupabaseSequence([gardenQuery(), insert], {
      storage: storage.storage,
    });
    const file = {
      originalname: "PHOTO.PNG",
      mimetype: "image/png",
      buffer: Buffer.from("image"),
    };

    const result = await createGalleryImageService({
      supabase: mock.client,
      userId: "user-1",
      file,
      description: "  Descripción  ",
      noteId: undefined,
    });

    expect(result).toEqual({
      ...expectedImage,
      description: "Descripción",
      noteId: null,
    });
    expect(storage.from).toHaveBeenCalledWith("gallery");
    expect(storage.upload).toHaveBeenCalledTimes(1);
    const [storagePath, buffer, options] = storage.upload.mock.calls[0];
    expect(storagePath).toMatch(/^user-1\/[0-9a-f-]+\.png$/);
    expect(buffer).toBe(file.buffer);
    expect(options).toEqual({ contentType: "image/png", upsert: false });
    expect(insert.insert).toHaveBeenCalledWith({
      garden_id: "garden-1",
      storage_path: storagePath,
      description: "Descripción",
      note_id: null,
    });
  });

  test("validates an associated note belongs to the garden before upload", async () => {
    const storage = createStorage();
    const note = noteValidationQuery();
    const insert = createQuery({ data: imageRow, error: null });
    const mock = createSupabaseSequence([gardenQuery(), note, insert], {
      storage: storage.storage,
    });

    await createGalleryImageService({
      supabase: mock.client,
      userId: "user-1",
      file: {
        originalname: "image.webp",
        mimetype: "image/webp",
        buffer: Buffer.from("image"),
      },
      description: "Una imagen",
      noteId: "note-1",
    });

    expect(note.eq.mock.calls).toEqual([
      ["id", "note-1"],
      ["garden_id", "garden-1"],
    ]);
    expect(insert.insert.mock.calls[0][0]).toMatchObject({ note_id: "note-1" });
  });

  test("returns a meaningful 404 when image creation has no garden", async () => {
    const storage = createStorage();
    const mock = createSupabaseSequence([
      gardenQuery({ data: null, error: null }),
    ], { storage: storage.storage });

    try {
      await createGalleryImageService({
        supabase: mock.client,
        userId: "user-1",
        file: { originalname: "image.png", mimetype: "image/png", buffer: Buffer.alloc(0) },
      });
      throw new Error("Expected createGalleryImageService to reject");
    } catch (error) {
      expectHttpError(error, 404, /No se encontró tu jardín/);
    }
    expect(storage.upload).not.toHaveBeenCalled();
  });

  test("rejects a note outside the garden before touching Storage", async () => {
    const storage = createStorage();
    const mock = createSupabaseSequence([
      gardenQuery(), noteValidationQuery({ data: null, error: null }),
    ], { storage: storage.storage });

    await expect(createGalleryImageService({
      supabase: mock.client,
      userId: "user-1",
      file: { originalname: "image.png", mimetype: "image/png", buffer: Buffer.alloc(0) },
      noteId: "other-note",
    })).rejects.toMatchObject({ statusCode: 400 });
    expect(storage.upload).not.toHaveBeenCalled();
  });

  test("propagates note-validation and upload errors", async () => {
    const noteError = { message: "Note lookup failed" };
    const noteStorage = createStorage();
    const noteMock = createSupabaseSequence([
      gardenQuery(), noteValidationQuery({ data: null, error: noteError }),
    ], { storage: noteStorage.storage });
    await expect(createGalleryImageService({
      supabase: noteMock.client,
      userId: "user-1",
      file: { originalname: "image.png", mimetype: "image/png", buffer: Buffer.alloc(0) },
      noteId: "note-1",
    })).rejects.toBe(noteError);

    const uploadError = { message: "Upload failed" };
    const uploadStorage = createStorage({ uploadResult: { error: uploadError } });
    const uploadMock = createSupabaseSequence([gardenQuery()], {
      storage: uploadStorage.storage,
    });
    await expect(createGalleryImageService({
      supabase: uploadMock.client,
      userId: "user-1",
      file: { originalname: "image.png", mimetype: "image/png", buffer: Buffer.alloc(0) },
    })).rejects.toBe(uploadError);
    expect(uploadMock.from).toHaveBeenCalledTimes(1);
  });

  test("removes the uploaded object when database registration fails", async () => {
    const storage = createStorage();
    const databaseError = { message: "Insert failed" };
    const insert = createQuery({ data: null, error: databaseError });
    const mock = createSupabaseSequence([gardenQuery(), insert], {
      storage: storage.storage,
    });

    await expect(createGalleryImageService({
      supabase: mock.client,
      userId: "user-1",
      file: { originalname: "image.jpg", mimetype: "image/jpeg", buffer: Buffer.alloc(0) },
      description: "   ",
    })).rejects.toBe(databaseError);

    const storagePath = storage.upload.mock.calls[0][0];
    expect(insert.insert.mock.calls[0][0]).toMatchObject({
      description: null,
      note_id: null,
    });
    expect(storage.remove).toHaveBeenCalledWith([storagePath]);
  });

  test("lists images with one-hour signed URLs and mapped metadata", async () => {
    const second = { ...imageRow, id: "image-2", storage_path: "user-1/two.png" };
    const storage = createStorage({ signedResults: [
      { data: { signedUrl: "https://signed.test/one" }, error: null },
      { data: { signedUrl: "https://signed.test/two" }, error: null },
    ] });
    const list = createQuery({ data: [imageRow, second], error: null });
    const mock = createSupabaseSequence([gardenQuery(), list], {
      storage: storage.storage,
    });

    await expect(getGalleryImagesService({ supabase: mock.client, userId: "user-1" }))
      .resolves.toEqual([
        { ...expectedImage, imageUrl: "https://signed.test/one" },
        { ...expectedImage, id: "image-2", storagePath: "user-1/two.png", imageUrl: "https://signed.test/two" },
      ]);

    expect(list.eq).toHaveBeenCalledWith("garden_id", "garden-1");
    expect(list.order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(storage.createSignedUrl.mock.calls).toEqual([
      ["user-1/generated.png", 60 * 60],
      ["user-1/two.png", 60 * 60],
    ]);
  });

  test("returns an empty gallery without requesting signed URLs", async () => {
    const storage = createStorage();
    const mock = createSupabaseSequence([
      gardenQuery(), createQuery({ data: [], error: null }),
    ], { storage: storage.storage });

    await expect(getGalleryImagesService({ supabase: mock.client, userId: "user-1" }))
      .resolves.toEqual([]);
    expect(storage.createSignedUrl).not.toHaveBeenCalled();
  });

  test("propagates gallery listing and signed URL errors", async () => {
    const listError = { message: "List failed" };
    const listStorage = createStorage();
    const listMock = createSupabaseSequence([
      gardenQuery(), createQuery({ data: null, error: listError }),
    ], { storage: listStorage.storage });
    await expect(getGalleryImagesService({ supabase: listMock.client, userId: "user-1" }))
      .rejects.toBe(listError);

    const signedError = { message: "Sign failed" };
    const signedStorage = createStorage({ signedResults: [
      { data: null, error: signedError },
    ] });
    const signedMock = createSupabaseSequence([
      gardenQuery(), createQuery({ data: [imageRow], error: null }),
    ], { storage: signedStorage.storage });
    await expect(getGalleryImagesService({ supabase: signedMock.client, userId: "user-1" }))
      .rejects.toBe(signedError);
  });

  test("returns 404 when listing images without a garden", async () => {
    const storage = createStorage();
    const mock = createSupabaseSequence([
      gardenQuery({ data: null, error: null }),
    ], { storage: storage.storage });
    await expect(getGalleryImagesService({ supabase: mock.client, userId: "user-1" }))
      .rejects.toMatchObject({ statusCode: 404 });
  });

  test("propagates an error while resolving the gallery owner's garden", async () => {
    const error = { message: "Garden lookup failed" };
    const storage = createStorage();
    const mock = createSupabaseSequence([
      gardenQuery({ data: null, error }),
    ], { storage: storage.storage });

    await expect(getGalleryImagesService({ supabase: mock.client, userId: "user-1" }))
      .rejects.toBe(error);
    expect(storage.from).not.toHaveBeenCalled();
  });

  test("updates description and note metadata for an owned image", async () => {
    const storage = createStorage();
    const find = createQuery({ data: { id: "image-1" }, error: null });
    const updatedRow = { ...imageRow, description: null, note_id: "note-2" };
    const update = createQuery({ data: updatedRow, error: null });
    const mock = createSupabaseSequence([
      gardenQuery(), noteValidationQuery({ data: { id: "note-2" }, error: null }),
      find, update,
    ], { storage: storage.storage });

    await expect(updateGalleryImageService({
      supabase: mock.client,
      userId: "user-1",
      imageId: "image-1",
      description: "   ",
      noteId: "note-2",
    })).resolves.toEqual({
      ...expectedImage,
      description: null,
      noteId: "note-2",
    });

    expect(find.eq.mock.calls).toEqual([
      ["id", "image-1"],
      ["garden_id", "garden-1"],
    ]);
    expect(update.update).toHaveBeenCalledWith({
      description: null,
      note_id: "note-2",
    });
    expect(update.eq.mock.calls).toEqual([
      ["id", "image-1"],
      ["garden_id", "garden-1"],
    ]);
  });

  test("supports a description-only update without validating a note", async () => {
    const storage = createStorage();
    const find = createQuery({ data: { id: "image-1" }, error: null });
    const update = createQuery({ data: imageRow, error: null });
    const mock = createSupabaseSequence([gardenQuery(), find, update], {
      storage: storage.storage,
    });

    await updateGalleryImageService({
      supabase: mock.client,
      userId: "user-1",
      imageId: "image-1",
      description: " Una imagen ",
      noteId: undefined,
    });

    expect(update.update).toHaveBeenCalledWith({ description: "Una imagen" });
  });

  test("clears an image note association when noteId is an empty string", async () => {
    const storage = createStorage();
    const find = createQuery({ data: { id: "image-1" }, error: null });
    const update = createQuery({ data: { ...imageRow, note_id: null }, error: null });
    const mock = createSupabaseSequence([gardenQuery(), find, update], {
      storage: storage.storage,
    });

    await expect(updateGalleryImageService({
      supabase: mock.client,
      userId: "user-1",
      imageId: "image-1",
      noteId: "",
    })).resolves.toMatchObject({ noteId: null });

    expect(update.update).toHaveBeenCalledWith({ note_id: null });
    expect(mock.from.mock.calls.map(([table]) => table)).toEqual([
      "gardens",
      "gallery_images",
      "gallery_images",
    ]);
  });

  test("rejects update when image is missing or no metadata changed", async () => {
    const storage = createStorage();
    const missingMock = createSupabaseSequence([
      gardenQuery(), createQuery({ data: null, error: null }),
    ], { storage: storage.storage });
    await expect(updateGalleryImageService({
      supabase: missingMock.client,
      userId: "user-1",
      imageId: "missing",
      description: "Nueva",
    })).rejects.toMatchObject({ statusCode: 404 });

    const unchangedMock = createSupabaseSequence([
      gardenQuery(), createQuery({ data: { id: "image-1" }, error: null }),
    ], { storage: storage.storage });
    await expect(updateGalleryImageService({
      supabase: unchangedMock.client,
      userId: "user-1",
      imageId: "image-1",
    })).rejects.toMatchObject({ statusCode: 400 });
  });

  test("propagates image lookup and update database errors", async () => {
    const storage = createStorage();
    const findError = { message: "Find failed" };
    const findMock = createSupabaseSequence([
      gardenQuery(), createQuery({ data: null, error: findError }),
    ], { storage: storage.storage });
    await expect(updateGalleryImageService({
      supabase: findMock.client, userId: "user-1", imageId: "image-1", description: "Nueva",
    })).rejects.toBe(findError);

    const updateError = { message: "Update failed" };
    const updateMock = createSupabaseSequence([
      gardenQuery(), createQuery({ data: { id: "image-1" }, error: null }),
      createQuery({ data: null, error: updateError }),
    ], { storage: storage.storage });
    await expect(updateGalleryImageService({
      supabase: updateMock.client, userId: "user-1", imageId: "image-1", description: "Nueva",
    })).rejects.toBe(updateError);
  });

  test("returns 404 when updating an image without a garden", async () => {
    const storage = createStorage();
    const mock = createSupabaseSequence([
      gardenQuery({ data: null, error: null }),
    ], { storage: storage.storage });
    await expect(updateGalleryImageService({
      supabase: mock.client, userId: "user-1", imageId: "image-1", description: "Nueva",
    })).rejects.toMatchObject({ statusCode: 404 });
  });

  test("removes an owned Storage object before deleting its database row", async () => {
    const storage = createStorage();
    const find = createQuery({
      data: { id: "image-1", storage_path: "user-1/generated.png" },
      error: null,
    });
    const deletion = createQuery({ error: null });
    const mock = createSupabaseSequence([gardenQuery(), find, deletion], {
      storage: storage.storage,
    });

    await expect(deleteGalleryImageService({
      supabase: mock.client, userId: "user-1", imageId: "image-1",
    })).resolves.toEqual({ message: "Gallery image deleted successfully" });

    expect(storage.remove).toHaveBeenCalledWith(["user-1/generated.png"]);
    expect(deletion.delete).toHaveBeenCalledTimes(1);
    expect(deletion.eq.mock.calls).toEqual([
      ["id", "image-1"],
      ["garden_id", "garden-1"],
    ]);
  });

  test("rejects deletion for missing garden or image", async () => {
    const storage = createStorage();
    const noGarden = createSupabaseSequence([
      gardenQuery({ data: null, error: null }),
    ], { storage: storage.storage });
    await expect(deleteGalleryImageService({
      supabase: noGarden.client, userId: "user-1", imageId: "image-1",
    })).rejects.toMatchObject({ statusCode: 404 });

    const noImage = createSupabaseSequence([
      gardenQuery(), createQuery({ data: null, error: null }),
    ], { storage: storage.storage });
    await expect(deleteGalleryImageService({
      supabase: noImage.client, userId: "user-1", imageId: "image-1",
    })).rejects.toMatchObject({ statusCode: 404 });
  });

  test("propagates find, Storage removal and database deletion errors", async () => {
    const findError = { message: "Find failed" };
    const storage = createStorage();
    const findMock = createSupabaseSequence([
      gardenQuery(), createQuery({ data: null, error: findError }),
    ], { storage: storage.storage });
    await expect(deleteGalleryImageService({
      supabase: findMock.client, userId: "user-1", imageId: "image-1",
    })).rejects.toBe(findError);

    const storageError = { message: "Remove failed" };
    const failingStorage = createStorage({ removeResult: { error: storageError } });
    const storageMock = createSupabaseSequence([
      gardenQuery(), createQuery({ data: { id: "image-1", storage_path: "path" }, error: null }),
    ], { storage: failingStorage.storage });
    await expect(deleteGalleryImageService({
      supabase: storageMock.client, userId: "user-1", imageId: "image-1",
    })).rejects.toBe(storageError);
    expect(storageMock.from).toHaveBeenCalledTimes(2);

    const deleteError = { message: "Delete failed" };
    const deleteStorage = createStorage();
    const deleteMock = createSupabaseSequence([
      gardenQuery(), createQuery({ data: { id: "image-1", storage_path: "path" }, error: null }),
      createQuery({ error: deleteError }),
    ], { storage: deleteStorage.storage });
    await expect(deleteGalleryImageService({
      supabase: deleteMock.client, userId: "user-1", imageId: "image-1",
    })).rejects.toBe(deleteError);
  });
});
