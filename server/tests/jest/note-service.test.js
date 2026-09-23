import {
  describe,
  expect,
  test,
} from "@jest/globals";

import {
  createNote,
  deleteNote,
  getNoteById,
  getNotes,
  updateNote,
} from "../../src/services/note.service.js";
import {
  createQuery,
  createSupabaseSequence,
} from "./helpers/supabase-query.js";

const noteRow = {
  id: "note-1",
  garden_id: "garden-1",
  title: "Primera nota",
  content: "Contenido",
  maturity: "seed",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-02-01T00:00:00.000Z",
};

const expectedNote = {
  id: "note-1",
  gardenId: "garden-1",
  title: "Primera nota",
  content: "Contenido",
  maturity: "seed",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-02-01T00:00:00.000Z",
};

const gardenQuery = (result = { data: { id: "garden-1" }, error: null }) =>
  createQuery(result);

const noteQuery = (result = { data: noteRow, error: null }) =>
  createQuery(result);

function expectGardenLookup(query, userId = "user-1") {
  expect(query.select).toHaveBeenCalledWith("id");
  expect(query.eq).toHaveBeenCalledWith("user_id", userId);
  expect(query.maybeSingle).toHaveBeenCalledTimes(1);
}

describe("note service", () => {
  test("lists the owner's notes ordered by most recently updated", async () => {
    const garden = gardenQuery();
    const notes = createQuery({
      data: [noteRow, { ...noteRow, id: "note-2", title: "Segunda nota" }],
      error: null,
    });
    const mock = createSupabaseSequence([garden, notes]);

    await expect(getNotes(mock.client, "user-1")).resolves.toEqual([
      expectedNote,
      { ...expectedNote, id: "note-2", title: "Segunda nota" },
    ]);

    expect(mock.from.mock.calls.map(([table]) => table)).toEqual(["gardens", "notes"]);
    expectGardenLookup(garden);
    expect(notes.select).toHaveBeenCalledWith(
      "id, garden_id, title, content, maturity, created_at, updated_at"
    );
    expect(notes.eq).toHaveBeenCalledWith("garden_id", "garden-1");
    expect(notes.order).toHaveBeenCalledWith("updated_at", { ascending: false });
    expect(notes.eq).toHaveBeenCalledTimes(1);
  });

  test("filters listed notes by maturity when requested", async () => {
    const notes = createQuery({ data: [noteRow], error: null });
    const mock = createSupabaseSequence([gardenQuery(), notes]);

    await getNotes(mock.client, "user-1", "seed");

    expect(notes.eq.mock.calls).toEqual([
      ["garden_id", "garden-1"],
      ["maturity", "seed"],
    ]);
  });

  test("returns null without querying notes when the user has no garden", async () => {
    const garden = gardenQuery({ data: null, error: null });
    const mock = createSupabaseSequence([garden]);

    await expect(getNotes(mock.client, "user-1")).resolves.toBeNull();
    expect(mock.from).toHaveBeenCalledTimes(1);
  });

  test("propagates an error while resolving the user's garden", async () => {
    const error = { code: "42501", message: "Garden lookup denied" };
    const mock = createSupabaseSequence([gardenQuery({ data: null, error })]);

    await expect(getNotes(mock.client, "user-1")).rejects.toBe(error);
  });

  test("propagates an error from the notes listing query", async () => {
    const error = { code: "42501", message: "Notes denied" };
    const mock = createSupabaseSequence([
      gardenQuery(),
      createQuery({ data: null, error }),
    ]);

    await expect(getNotes(mock.client, "user-1")).rejects.toBe(error);
  });

  test("creates and maps a note in the user's garden", async () => {
    const insert = noteQuery();
    const mock = createSupabaseSequence([gardenQuery(), insert]);

    await expect(createNote(mock.client, "user-1", {
      title: "Primera nota",
      content: "Contenido",
      maturity: "seed",
    })).resolves.toEqual(expectedNote);

    expect(insert.insert).toHaveBeenCalledWith({
      garden_id: "garden-1",
      title: "Primera nota",
      content: "Contenido",
      maturity: "seed",
    });
    expect(insert.select).toHaveBeenCalledWith(
      "id, garden_id, title, content, maturity, created_at, updated_at"
    );
    expect(insert.single).toHaveBeenCalledTimes(1);
  });

  test("does not create a note when the user has no garden", async () => {
    const mock = createSupabaseSequence([gardenQuery({ data: null, error: null })]);

    await expect(createNote(mock.client, "user-1", {
      title: "Nota",
      content: "",
      maturity: "seed",
    })).resolves.toBeNull();
    expect(mock.from).toHaveBeenCalledTimes(1);
  });

  test("propagates an insert-note error", async () => {
    const error = { code: "23514", message: "Invalid maturity" };
    const insert = createQuery({ data: null, error });
    const mock = createSupabaseSequence([gardenQuery(), insert]);

    await expect(createNote(mock.client, "user-1", {
      title: "Nota",
      content: "",
      maturity: "invalid",
    })).rejects.toBe(error);
  });

  test("gets a note only when id and owned garden both match", async () => {
    const note = noteQuery();
    const mock = createSupabaseSequence([gardenQuery(), note]);

    await expect(getNoteById(mock.client, "user-1", "note-1"))
      .resolves.toEqual(expectedNote);

    expect(note.eq.mock.calls).toEqual([
      ["id", "note-1"],
      ["garden_id", "garden-1"],
    ]);
    expect(note.maybeSingle).toHaveBeenCalledTimes(1);
  });

  test("returns null when an owned note is not found", async () => {
    const mock = createSupabaseSequence([
      gardenQuery(),
      noteQuery({ data: null, error: null }),
    ]);

    await expect(getNoteById(mock.client, "user-1", "missing-note"))
      .resolves.toBeNull();
  });

  test("returns null without querying notes when getting by id without a garden", async () => {
    const mock = createSupabaseSequence([
      gardenQuery({ data: null, error: null }),
    ]);

    await expect(getNoteById(mock.client, "user-1", "note-1"))
      .resolves.toBeNull();
    expect(mock.from).toHaveBeenCalledTimes(1);
  });

  test("propagates an owned-note lookup error", async () => {
    const error = { code: "42501", message: "Note lookup denied" };
    const mock = createSupabaseSequence([
      gardenQuery(),
      noteQuery({ data: null, error }),
    ]);

    await expect(getNoteById(mock.client, "user-1", "note-1")).rejects.toBe(error);
  });

  test("updates supplied note fields and returns the reloaded owned note", async () => {
    const firstLookup = noteQuery();
    const update = createQuery({ error: null });
    const updatedRow = {
      ...noteRow,
      title: "Actualizada",
      content: "Nuevo contenido",
      maturity: "tree",
    };
    const secondLookup = noteQuery({ data: updatedRow, error: null });
    const mock = createSupabaseSequence([
      gardenQuery(), firstLookup,
      update,
      gardenQuery(), secondLookup,
    ]);

    await expect(updateNote(mock.client, "user-1", "note-1", {
      title: "Actualizada",
      content: "Nuevo contenido",
      maturity: "tree",
    })).resolves.toEqual({
      ...expectedNote,
      title: "Actualizada",
      content: "Nuevo contenido",
      maturity: "tree",
    });

    expect(update.update).toHaveBeenCalledWith({
      title: "Actualizada",
      content: "Nuevo contenido",
      maturity: "tree",
    });
    expect(update.eq).toHaveBeenCalledWith("id", "note-1");
    expect(secondLookup.eq.mock.calls).toContainEqual(["garden_id", "garden-1"]);
  });

  test("omits undefined fields from a partial note update", async () => {
    const update = createQuery({ error: null });
    const mock = createSupabaseSequence([
      gardenQuery(), noteQuery(),
      update,
      gardenQuery(), noteQuery(),
    ]);

    await updateNote(mock.client, "user-1", "note-1", {
      title: "Solo título",
      content: undefined,
      maturity: undefined,
    });

    expect(update.update).toHaveBeenCalledWith({ title: "Solo título" });
  });

  test("does not update a note outside the user's garden", async () => {
    const mock = createSupabaseSequence([
      gardenQuery(),
      noteQuery({ data: null, error: null }),
    ]);

    await expect(updateNote(mock.client, "user-1", "missing-note", {
      title: "No permitido",
    })).resolves.toBeNull();
    expect(mock.from).toHaveBeenCalledTimes(2);
  });

  test("propagates an update-note error without reloading", async () => {
    const error = { code: "42501", message: "Update denied" };
    const update = createQuery({ error });
    const mock = createSupabaseSequence([
      gardenQuery(), noteQuery(), update,
    ]);

    await expect(updateNote(mock.client, "user-1", "note-1", {
      content: "Nuevo contenido",
    })).rejects.toBe(error);
    expect(mock.consumedQueries()).toBe(3);
  });

  test("deletes an owned note and returns its pre-delete representation", async () => {
    const deletion = createQuery({ error: null });
    const mock = createSupabaseSequence([
      gardenQuery(), noteQuery(), deletion,
    ]);

    await expect(deleteNote(mock.client, "user-1", "note-1"))
      .resolves.toEqual(expectedNote);

    expect(deletion.delete).toHaveBeenCalledTimes(1);
    expect(deletion.eq).toHaveBeenCalledWith("id", "note-1");
  });

  test("does not delete a note that is not owned or does not exist", async () => {
    const mock = createSupabaseSequence([
      gardenQuery(),
      noteQuery({ data: null, error: null }),
    ]);

    await expect(deleteNote(mock.client, "user-1", "missing-note"))
      .resolves.toBeNull();
    expect(mock.from).toHaveBeenCalledTimes(2);
  });

  test("propagates a delete-note error", async () => {
    const error = { code: "42501", message: "Delete denied" };
    const deletion = createQuery({ error });
    const mock = createSupabaseSequence([
      gardenQuery(), noteQuery(), deletion,
    ]);

    await expect(deleteNote(mock.client, "user-1", "note-1")).rejects.toBe(error);
  });
});
