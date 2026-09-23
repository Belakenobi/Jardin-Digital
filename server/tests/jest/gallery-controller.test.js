import {
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";

import { createRequest, createResponse } from "./helpers/controller.js";

const createGalleryImageService = jest.fn();
const getGalleryImagesService = jest.fn();
const updateGalleryImageService = jest.fn();
const deleteGalleryImageService = jest.fn();

jest.unstable_mockModule("../../src/services/gallery.service.js", () => ({
  createGalleryImageService,
  getGalleryImagesService,
  updateGalleryImageService,
  deleteGalleryImageService,
}));

const {
  createGalleryImage,
  deleteGalleryImage,
  getGalleryImages,
  updateGalleryImage,
} = await import("../../src/controllers/gallery.controller.js");

const image = {
  id: "image-1",
  description: "Descripción",
  noteId: "note-1",
};

describe("gallery controller", () => {
  beforeEach(() => {
    createGalleryImageService.mockReset();
    getGalleryImagesService.mockReset();
    updateGalleryImageService.mockReset();
    deleteGalleryImageService.mockReset();
  });

  test("passes file, metadata and authenticated context when creating an image", async () => {
    createGalleryImageService.mockResolvedValue(image);
    const file = {
      originalname: "image.png",
      mimetype: "image/png",
      buffer: Buffer.from("image"),
    };
    const request = createRequest({
      file,
      body: { description: "Descripción", noteId: "note-1" },
    });
    const response = createResponse();

    await createGalleryImage(request, response, jest.fn());

    expect(createGalleryImageService).toHaveBeenCalledWith({
      supabase: request.supabase,
      userId: "user-1",
      file,
      description: "Descripción",
      noteId: "note-1",
    });
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith({ status: "success", data: image });
  });

  test("forwards gallery creation errors", async () => {
    const error = new Error("Create image failed");
    createGalleryImageService.mockRejectedValue(error);
    const next = jest.fn();
    await createGalleryImage(createRequest({
      file: { originalname: "image.png" },
      body: {},
    }), createResponse(), next);
    expect(next).toHaveBeenCalledWith(error);
  });

  test("lists gallery images for the authenticated user", async () => {
    getGalleryImagesService.mockResolvedValue([image]);
    const request = createRequest();
    const response = createResponse();
    await getGalleryImages(request, response, jest.fn());
    expect(getGalleryImagesService).toHaveBeenCalledWith({
      supabase: request.supabase,
      userId: "user-1",
    });
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({ status: "success", images: [image] });
  });

  test("forwards gallery listing errors", async () => {
    const error = new Error("List images failed");
    getGalleryImagesService.mockRejectedValue(error);
    const next = jest.fn();
    await getGalleryImages(createRequest(), createResponse(), next);
    expect(next).toHaveBeenCalledWith(error);
  });

  test("passes route and metadata when updating an image", async () => {
    const updated = { ...image, description: null, noteId: null };
    updateGalleryImageService.mockResolvedValue(updated);
    const request = createRequest({
      params: { id: "image-1" },
      body: { description: "", noteId: "" },
    });
    const response = createResponse();

    await updateGalleryImage(request, response, jest.fn());

    expect(updateGalleryImageService).toHaveBeenCalledWith({
      supabase: request.supabase,
      userId: "user-1",
      imageId: "image-1",
      description: "",
      noteId: "",
    });
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({ status: "success", data: updated });
  });

  test("forwards gallery update errors", async () => {
    const error = new Error("Update image failed");
    updateGalleryImageService.mockRejectedValue(error);
    const next = jest.fn();
    await updateGalleryImage(createRequest({
      params: { id: "image-1" },
      body: {},
    }), createResponse(), next);
    expect(next).toHaveBeenCalledWith(error);
  });

  test("deletes an image and returns the service message", async () => {
    deleteGalleryImageService.mockResolvedValue({
      message: "Gallery image deleted successfully",
    });
    const request = createRequest({ params: { id: "image-1" } });
    const response = createResponse();
    await deleteGalleryImage(request, response, jest.fn());
    expect(deleteGalleryImageService).toHaveBeenCalledWith({
      supabase: request.supabase,
      userId: "user-1",
      imageId: "image-1",
    });
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      status: "success",
      message: "Gallery image deleted successfully",
    });
  });

  test("forwards gallery deletion errors", async () => {
    const error = new Error("Delete image failed");
    deleteGalleryImageService.mockRejectedValue(error);
    const next = jest.fn();
    await deleteGalleryImage(
      createRequest({ params: { id: "image-1" } }),
      createResponse(),
      next
    );
    expect(next).toHaveBeenCalledWith(error);
  });
});
