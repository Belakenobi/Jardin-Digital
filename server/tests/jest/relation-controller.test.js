import {
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";

import { createRequest, createResponse } from "./helpers/controller.js";

const createRelation = jest.fn();
const getRelationsForNote = jest.fn();
const deleteRelation = jest.fn();

jest.unstable_mockModule("../../src/services/relation.service.js", () => ({
  createRelation,
  getRelationsForNote,
  deleteRelation,
}));

const {
  createMyRelation,
  deleteMyRelation,
  getMyNoteRelations,
} = await import("../../src/controllers/relation.controller.js");

const relation = {
  id: "relation-1",
  sourceNoteId: "source-1",
  targetNoteId: "target-1",
};

describe("relation controller", () => {
  beforeEach(() => {
    createRelation.mockReset();
    getRelationsForNote.mockReset();
    deleteRelation.mockReset();
  });

  test("creates a relation using trimmed source and target ids", async () => {
    createRelation.mockResolvedValue({ status: "created", relation });
    const request = createRequest({
      body: { sourceNoteId: "  source-1  ", targetNoteId: "  target-1  " },
    });
    const response = createResponse();

    await createMyRelation(request, response, jest.fn());

    expect(createRelation).toHaveBeenCalledWith(
      request.supabase,
      "user-1",
      "source-1",
      "target-1"
    );
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith({
      status: "success",
      message: "Relation created successfully",
      relation,
    });
  });

  test.each([
    ["garden_not_found", 404, /No se encontró tu jardín/],
    ["same_note", 400, /no puede relacionarse consigo misma/],
    ["source_not_found", 404, /nota de origen ya no está disponible/],
    ["target_not_found", 404, /nota de destino ya no está disponible/],
    ["already_exists", 409, /ya tienen esa relación/],
  ])("maps service status %s to HTTP %s", async (status, httpStatus, message) => {
    createRelation.mockResolvedValue({ status });
    const response = createResponse();

    await createMyRelation(createRequest({
      body: { sourceNoteId: "source-1", targetNoteId: "target-1" },
    }), response, jest.fn());

    expect(response.status).toHaveBeenCalledWith(httpStatus);
    expect(response.json).toHaveBeenCalledWith({
      status: "error",
      message: expect.stringMatching(message),
    });
  });

  test("forwards relation creation errors", async () => {
    const error = new Error("Relation creation failed");
    createRelation.mockRejectedValue(error);
    const next = jest.fn();
    await createMyRelation(createRequest({
      body: { sourceNoteId: "source-1", targetNoteId: "target-1" },
    }), createResponse(), next);
    expect(next).toHaveBeenCalledWith(error);
  });

  test("returns incoming and outgoing relations for the route note", async () => {
    const relations = { outgoing: [relation], incoming: [] };
    getRelationsForNote.mockResolvedValue(relations);
    const request = createRequest({ params: { noteId: "source-1" } });
    const response = createResponse();

    await getMyNoteRelations(request, response, jest.fn());

    expect(getRelationsForNote).toHaveBeenCalledWith(
      request.supabase,
      "user-1",
      "source-1"
    );
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({ status: "success", relations });
  });

  test("returns 404 when the route note is unavailable", async () => {
    getRelationsForNote.mockResolvedValue(null);
    const response = createResponse();
    await getMyNoteRelations(
      createRequest({ params: { noteId: "missing" } }),
      response,
      jest.fn()
    );
    expect(response.status).toHaveBeenCalledWith(404);
  });

  test("forwards relation query errors", async () => {
    const error = new Error("Relations failed");
    getRelationsForNote.mockRejectedValue(error);
    const next = jest.fn();
    await getMyNoteRelations(
      createRequest({ params: { noteId: "source-1" } }),
      createResponse(),
      next
    );
    expect(next).toHaveBeenCalledWith(error);
  });

  test("deletes a relation using route and owner data", async () => {
    deleteRelation.mockResolvedValue(relation);
    const request = createRequest({ params: { id: "relation-1" } });
    const response = createResponse();
    await deleteMyRelation(request, response, jest.fn());
    expect(deleteRelation).toHaveBeenCalledWith(request.supabase, "user-1", "relation-1");
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      status: "success",
      message: "Relation deleted successfully",
      relation,
    });
  });

  test("returns 404 when deleting an unavailable relation", async () => {
    deleteRelation.mockResolvedValue(null);
    const response = createResponse();
    await deleteMyRelation(
      createRequest({ params: { id: "missing" } }),
      response,
      jest.fn()
    );
    expect(response.status).toHaveBeenCalledWith(404);
  });

  test("forwards relation deletion errors", async () => {
    const error = new Error("Delete failed");
    deleteRelation.mockRejectedValue(error);
    const next = jest.fn();
    await deleteMyRelation(
      createRequest({ params: { id: "relation-1" } }),
      createResponse(),
      next
    );
    expect(next).toHaveBeenCalledWith(error);
  });
});
