import {
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";

import { createRequest, createResponse } from "./helpers/controller.js";

const getGarden = jest.fn();
const createGarden = jest.fn();
const updateGarden = jest.fn();

jest.unstable_mockModule("../../src/services/garden.service.js", () => ({
  getGarden,
  createGarden,
  updateGarden,
}));

const {
  createMyGarden,
  getMyGarden,
  updateMyGarden,
} = await import("../../src/controllers/garden.controller.js");

describe("garden controller", () => {
  beforeEach(() => {
    getGarden.mockReset();
    createGarden.mockReset();
    updateGarden.mockReset();
  });

  test("returns the authenticated user's garden", async () => {
    const garden = { id: "garden-1", name: "Mi jardín" };
    getGarden.mockResolvedValue(garden);
    const request = createRequest();
    const response = createResponse();

    await getMyGarden(request, response, jest.fn());

    expect(getGarden).toHaveBeenCalledWith(request.supabase, "user-1");
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({ status: "success", garden });
  });

  test("returns 404 when the authenticated user has no garden", async () => {
    getGarden.mockResolvedValue(null);
    const response = createResponse();

    await getMyGarden(createRequest(), response, jest.fn());

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
      status: "error",
      message: expect.stringMatching(/No se encontró tu jardín/),
    }));
  });

  test("forwards garden lookup errors", async () => {
    const error = new Error("Garden lookup failed");
    getGarden.mockRejectedValue(error);
    const next = jest.fn();
    await getMyGarden(createRequest(), createResponse(), next);
    expect(next).toHaveBeenCalledWith(error);
  });

  test("creates a garden with trimmed name and default optional values", async () => {
    const garden = { id: "garden-1", name: "Mi jardín", isPublic: false };
    getGarden.mockResolvedValue(null);
    createGarden.mockResolvedValue(garden);
    const request = createRequest({ body: { name: "  Mi jardín  " } });
    const response = createResponse();

    await createMyGarden(request, response, jest.fn());

    expect(getGarden).toHaveBeenCalledWith(request.supabase, "user-1");
    expect(createGarden).toHaveBeenCalledWith(request.supabase, "user-1", {
      name: "Mi jardín",
      description: null,
      isPublic: false,
    });
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith({
      status: "success",
      message: "Garden created successfully",
      garden,
    });
  });

  test("returns 409 instead of creating a second garden", async () => {
    getGarden.mockResolvedValue({ id: "existing-garden" });
    const response = createResponse();

    await createMyGarden(
      createRequest({ body: { name: "Otro jardín", isPublic: true } }),
      response,
      jest.fn()
    );

    expect(response.status).toHaveBeenCalledWith(409);
    expect(createGarden).not.toHaveBeenCalled();
  });

  test("forwards errors while checking or creating a garden", async () => {
    const lookupError = new Error("Lookup failed");
    getGarden.mockRejectedValueOnce(lookupError);
    const lookupNext = jest.fn();
    await createMyGarden(
      createRequest({ body: { name: "Jardín" } }),
      createResponse(),
      lookupNext
    );
    expect(lookupNext).toHaveBeenCalledWith(lookupError);

    const createError = new Error("Create failed");
    getGarden.mockResolvedValueOnce(null);
    createGarden.mockRejectedValueOnce(createError);
    const createNext = jest.fn();
    await createMyGarden(
      createRequest({ body: { name: "Jardín" } }),
      createResponse(),
      createNext
    );
    expect(createNext).toHaveBeenCalledWith(createError);
  });

  test("updates supplied garden fields and trims its name", async () => {
    const garden = { id: "garden-1", name: "Actualizado", isPublic: true };
    getGarden.mockResolvedValue({ id: "garden-1" });
    updateGarden.mockResolvedValue(garden);
    const request = createRequest({
      body: {
        name: "  Actualizado  ",
        description: "Nueva descripción",
        isPublic: true,
      },
    });
    const response = createResponse();

    await updateMyGarden(request, response, jest.fn());

    expect(updateGarden).toHaveBeenCalledWith(request.supabase, "user-1", {
      name: "Actualizado",
      description: "Nueva descripción",
      isPublic: true,
    });
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      status: "success",
      message: "Garden updated successfully",
      garden,
    });
  });

  test("passes undefined name during a description-only update", async () => {
    getGarden.mockResolvedValue({ id: "garden-1" });
    updateGarden.mockResolvedValue({ id: "garden-1", description: "Nueva" });
    const request = createRequest({ body: { description: "Nueva" } });

    await updateMyGarden(request, createResponse(), jest.fn());

    expect(updateGarden).toHaveBeenCalledWith(request.supabase, "user-1", {
      name: undefined,
      description: "Nueva",
      isPublic: undefined,
    });
  });

  test("returns 404 instead of updating a missing garden", async () => {
    getGarden.mockResolvedValue(null);
    const response = createResponse();
    await updateMyGarden(
      createRequest({ body: { description: "Nueva" } }),
      response,
      jest.fn()
    );
    expect(response.status).toHaveBeenCalledWith(404);
    expect(updateGarden).not.toHaveBeenCalled();
  });

  test("forwards garden update errors", async () => {
    const error = new Error("Update failed");
    getGarden.mockResolvedValue({ id: "garden-1" });
    updateGarden.mockRejectedValue(error);
    const next = jest.fn();
    await updateMyGarden(
      createRequest({ body: { description: "Nueva" } }),
      createResponse(),
      next
    );
    expect(next).toHaveBeenCalledWith(error);
  });
});
