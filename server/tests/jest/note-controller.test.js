import {
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";

import { createRequest, createResponse } from "./helpers/controller.js";

const getNotes = jest.fn();
const createNote = jest.fn();
const getNoteById = jest.fn();
const updateNote = jest.fn();
const deleteNote = jest.fn();

jest.unstable_mockModule("../../src/services/note.service.js", () => ({
  getNotes,
  createNote,
  getNoteById,
  updateNote,
  deleteNote,
}));

const {
  createMyNote,
  deleteMyNote,
  getMyNoteById,
  getMyNotes,
  updateMyNote,
} = await import("../../src/controllers/note.controller.js");

const note = {
  id: "note-1",
  gardenId: "garden-1",
  title: "Nota",
  content: "Contenido",
  maturity: "seed",
};

describe("note controller", () => {
  beforeEach(() => {
    getNotes.mockReset();
    createNote.mockReset();
    getNoteById.mockReset();
    updateNote.mockReset();
    deleteNote.mockReset();
  });

  test("lists notes using the authenticated user and maturity filter", async () => {
    getNotes.mockResolvedValue([note]);
    const request = createRequest({ query: { maturity: "seed" } });
    const response = createResponse();

    await getMyNotes(request, response, jest.fn());

    expect(getNotes).toHaveBeenCalledWith(request.supabase, "user-1", "seed");
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({ status: "success", notes: [note] });
  });

  test("passes undefined maturity when listing without a filter", async () => {
    getNotes.mockResolvedValue([]);
    const request = createRequest();
    await getMyNotes(request, createResponse(), jest.fn());
    expect(getNotes).toHaveBeenCalledWith(request.supabase, "user-1", undefined);
  });

  test("returns 404 when notes cannot resolve the user's garden", async () => {
    getNotes.mockResolvedValue(null);
    const response = createResponse();
    await getMyNotes(createRequest(), response, jest.fn());
    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringMatching(/No se encontró tu jardín/),
    }));
  });

  test("forwards note listing errors", async () => {
    const error = new Error("List failed");
    getNotes.mockRejectedValue(error);
    const next = jest.fn();
    await getMyNotes(createRequest(), createResponse(), next);
    expect(next).toHaveBeenCalledWith(error);
  });

  test("creates a note with trimmed title and default content and maturity", async () => {
    createNote.mockResolvedValue(note);
    const request = createRequest({ body: { title: "  Nota  " } });
    const response = createResponse();

    await createMyNote(request, response, jest.fn());

    expect(createNote).toHaveBeenCalledWith(request.supabase, "user-1", {
      title: "Nota",
      content: "",
      maturity: "seed",
    });
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith({
      status: "success",
      message: "Note created successfully",
      note,
    });
  });

  test("passes explicit content and maturity while creating", async () => {
    createNote.mockResolvedValue({ ...note, maturity: "tree" });
    const request = createRequest({
      body: { title: "Nota", content: "Texto", maturity: "tree" },
    });
    await createMyNote(request, createResponse(), jest.fn());
    expect(createNote).toHaveBeenCalledWith(request.supabase, "user-1", {
      title: "Nota",
      content: "Texto",
      maturity: "tree",
    });
  });

  test("returns 404 when creating a note without a garden", async () => {
    createNote.mockResolvedValue(null);
    const response = createResponse();
    await createMyNote(
      createRequest({ body: { title: "Nota" } }),
      response,
      jest.fn()
    );
    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringMatching(/Crea tu jardín/),
    }));
  });

  test("forwards note creation errors", async () => {
    const error = new Error("Create failed");
    createNote.mockRejectedValue(error);
    const next = jest.fn();
    await createMyNote(
      createRequest({ body: { title: "Nota" } }),
      createResponse(),
      next
    );
    expect(next).toHaveBeenCalledWith(error);
  });

  test("gets a note using its route parameter and owner id", async () => {
    getNoteById.mockResolvedValue(note);
    const request = createRequest({ params: { id: "note-1" } });
    const response = createResponse();
    await getMyNoteById(request, response, jest.fn());
    expect(getNoteById).toHaveBeenCalledWith(request.supabase, "user-1", "note-1");
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({ status: "success", note });
  });

  test("returns 404 when a requested note is missing", async () => {
    getNoteById.mockResolvedValue(null);
    const response = createResponse();
    await getMyNoteById(
      createRequest({ params: { id: "missing" } }),
      response,
      jest.fn()
    );
    expect(response.status).toHaveBeenCalledWith(404);
  });

  test("forwards single-note lookup errors", async () => {
    const error = new Error("Lookup failed");
    getNoteById.mockRejectedValue(error);
    const next = jest.fn();
    await getMyNoteById(createRequest({ params: { id: "note-1" } }), createResponse(), next);
    expect(next).toHaveBeenCalledWith(error);
  });

  test("updates a note using route, owner and normalized body values", async () => {
    const updated = { ...note, title: "Actualizada", maturity: "tree" };
    updateNote.mockResolvedValue(updated);
    const request = createRequest({
      params: { id: "note-1" },
      body: { title: "  Actualizada  ", content: "Nuevo", maturity: "tree" },
    });
    const response = createResponse();

    await updateMyNote(request, response, jest.fn());

    expect(updateNote).toHaveBeenCalledWith(request.supabase, "user-1", "note-1", {
      title: "Actualizada",
      content: "Nuevo",
      maturity: "tree",
    });
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      status: "success",
      message: "Note updated successfully",
      note: updated,
    });
  });

  test("passes undefined title during a content-only update", async () => {
    updateNote.mockResolvedValue(note);
    const request = createRequest({
      params: { id: "note-1" },
      body: { content: "Solo contenido" },
    });
    await updateMyNote(request, createResponse(), jest.fn());
    expect(updateNote).toHaveBeenCalledWith(request.supabase, "user-1", "note-1", {
      title: undefined,
      content: "Solo contenido",
      maturity: undefined,
    });
  });

  test("returns 404 when updating a missing note", async () => {
    updateNote.mockResolvedValue(null);
    const response = createResponse();
    await updateMyNote(
      createRequest({ params: { id: "missing" }, body: { content: "Nuevo" } }),
      response,
      jest.fn()
    );
    expect(response.status).toHaveBeenCalledWith(404);
  });

  test("forwards note update errors", async () => {
    const error = new Error("Update failed");
    updateNote.mockRejectedValue(error);
    const next = jest.fn();
    await updateMyNote(
      createRequest({ params: { id: "note-1" }, body: { content: "Nuevo" } }),
      createResponse(),
      next
    );
    expect(next).toHaveBeenCalledWith(error);
  });

  test("deletes a note using route and owner data", async () => {
    deleteNote.mockResolvedValue(note);
    const request = createRequest({ params: { id: "note-1" } });
    const response = createResponse();
    await deleteMyNote(request, response, jest.fn());
    expect(deleteNote).toHaveBeenCalledWith(request.supabase, "user-1", "note-1");
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      status: "success",
      message: "Note deleted successfully",
      note,
    });
  });

  test("returns 404 when deleting a missing note", async () => {
    deleteNote.mockResolvedValue(null);
    const response = createResponse();
    await deleteMyNote(createRequest({ params: { id: "missing" } }), response, jest.fn());
    expect(response.status).toHaveBeenCalledWith(404);
  });

  test("forwards note deletion errors", async () => {
    const error = new Error("Delete failed");
    deleteNote.mockRejectedValue(error);
    const next = jest.fn();
    await deleteMyNote(createRequest({ params: { id: "note-1" } }), createResponse(), next);
    expect(next).toHaveBeenCalledWith(error);
  });
});
