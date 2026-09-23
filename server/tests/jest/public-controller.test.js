import {
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";

import { createRequest, createResponse } from "./helpers/controller.js";

const getPublicGardens = jest.fn();
const getPublicGarden = jest.fn();
const createSupabaseClient = jest.fn();

jest.unstable_mockModule("../../src/services/public.service.js", () => ({
  getPublicGardens,
  getPublicGarden,
}));
jest.unstable_mockModule("../../src/config/supabase.js", () => ({
  createSupabaseClient,
  default: {},
}));

const {
  getPublicGardenById,
  listPublicGardens,
} = await import("../../src/controllers/public.controller.js");

describe("public controller", () => {
  beforeEach(() => {
    getPublicGardens.mockReset();
    getPublicGarden.mockReset();
    createSupabaseClient.mockReset();
  });

  test("lists public gardens using a public Supabase client", async () => {
    const publicClient = { scope: "public" };
    const gardens = [{ id: "garden-1", name: "Público" }];
    createSupabaseClient.mockReturnValue(publicClient);
    getPublicGardens.mockResolvedValue(gardens);
    const response = createResponse();

    await listPublicGardens(createRequest(), response, jest.fn());

    expect(createSupabaseClient).toHaveBeenCalledWith();
    expect(getPublicGardens).toHaveBeenCalledWith(publicClient);
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      status: "success",
      data: { gardens },
    });
  });

  test("forwards public listing errors", async () => {
    const error = new Error("Public list failed");
    createSupabaseClient.mockReturnValue({ scope: "public" });
    getPublicGardens.mockRejectedValue(error);
    const next = jest.fn();
    await listPublicGardens(createRequest(), createResponse(), next);
    expect(next).toHaveBeenCalledWith(error);
  });

  test("returns public garden detail using the route id", async () => {
    const publicClient = { scope: "public" };
    const data = { garden: { id: "garden-1" }, notes: [], relations: [] };
    createSupabaseClient.mockReturnValue(publicClient);
    getPublicGarden.mockResolvedValue(data);
    const response = createResponse();

    await getPublicGardenById(
      createRequest({ params: { gardenId: "garden-1" } }),
      response,
      jest.fn()
    );

    expect(getPublicGarden).toHaveBeenCalledWith(publicClient, "garden-1");
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({ status: "success", data });
  });

  test("returns 404 for a private or unavailable garden", async () => {
    createSupabaseClient.mockReturnValue({ scope: "public" });
    getPublicGarden.mockResolvedValue(null);
    const response = createResponse();
    await getPublicGardenById(
      createRequest({ params: { gardenId: "private-garden" } }),
      response,
      jest.fn()
    );
    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({
      status: "error",
      message: "Este jardín no está disponible o ya no es público.",
    });
  });

  test("forwards public detail errors", async () => {
    const error = new Error("Public detail failed");
    createSupabaseClient.mockReturnValue({ scope: "public" });
    getPublicGarden.mockRejectedValue(error);
    const next = jest.fn();
    await getPublicGardenById(
      createRequest({ params: { gardenId: "garden-1" } }),
      createResponse(),
      next
    );
    expect(next).toHaveBeenCalledWith(error);
  });
});
