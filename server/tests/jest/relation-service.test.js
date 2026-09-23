import {
  describe,
  expect,
  test,
} from "@jest/globals";

import {
  createRelation,
  deleteRelation,
  getRelationsForNote,
} from "../../src/services/relation.service.js";
import {
  createQuery,
  createSupabaseSequence,
} from "./helpers/supabase-query.js";

const relationRow = {
  id: "relation-1",
  garden_id: "garden-1",
  source_note_id: "source-1",
  target_note_id: "target-1",
  created_at: "2026-01-01T00:00:00.000Z",
};

const expectedRelation = {
  id: "relation-1",
  gardenId: "garden-1",
  sourceNoteId: "source-1",
  targetNoteId: "target-1",
  createdAt: "2026-01-01T00:00:00.000Z",
};

const gardenQuery = (result = { data: { id: "garden-1" }, error: null }) =>
  createQuery(result);

const ownedNoteQuery = (id, result = { data: { id, title: id }, error: null }) =>
  createQuery(result);

const relationQuery = (result = { data: relationRow, error: null }) =>
  createQuery(result);

describe("relation service", () => {
  test("reports when relation creation has no owner garden", async () => {
    const mock = createSupabaseSequence([
      gardenQuery({ data: null, error: null }),
    ]);

    await expect(createRelation(mock.client, "user-1", "source-1", "target-1"))
      .resolves.toEqual({ status: "garden_not_found" });
    expect(mock.from).toHaveBeenCalledTimes(1);
  });

  test("rejects a self-relation before querying either note", async () => {
    const mock = createSupabaseSequence([gardenQuery()]);

    await expect(createRelation(mock.client, "user-1", "note-1", "note-1"))
      .resolves.toEqual({ status: "same_note" });
    expect(mock.from).toHaveBeenCalledTimes(1);
  });

  test("reports when the source note is outside the owner's garden", async () => {
    const source = ownedNoteQuery("source-1", { data: null, error: null });
    const mock = createSupabaseSequence([gardenQuery(), source]);

    await expect(createRelation(mock.client, "user-1", "source-1", "target-1"))
      .resolves.toEqual({ status: "source_not_found" });
    expect(source.eq.mock.calls).toEqual([
      ["id", "source-1"],
      ["garden_id", "garden-1"],
    ]);
  });

  test("reports when the target note is outside the owner's garden", async () => {
    const mock = createSupabaseSequence([
      gardenQuery(),
      ownedNoteQuery("source-1"),
      ownedNoteQuery("target-1", { data: null, error: null }),
    ]);

    await expect(createRelation(mock.client, "user-1", "source-1", "target-1"))
      .resolves.toEqual({ status: "target_not_found" });
  });

  test("reports an existing directed relation without inserting a duplicate", async () => {
    const existing = createQuery({ data: { id: "relation-1" }, error: null });
    const mock = createSupabaseSequence([
      gardenQuery(),
      ownedNoteQuery("source-1"),
      ownedNoteQuery("target-1"),
      existing,
    ]);

    await expect(createRelation(mock.client, "user-1", "source-1", "target-1"))
      .resolves.toEqual({ status: "already_exists" });
    expect(existing.eq.mock.calls).toEqual([
      ["garden_id", "garden-1"],
      ["source_note_id", "source-1"],
      ["target_note_id", "target-1"],
    ]);
    expect(mock.from).toHaveBeenCalledTimes(4);
  });

  test("creates and maps a relation after validating both owned notes", async () => {
    const existing = createQuery({ data: null, error: null });
    const insert = relationQuery();
    const mock = createSupabaseSequence([
      gardenQuery(),
      ownedNoteQuery("source-1"),
      ownedNoteQuery("target-1"),
      existing,
      insert,
    ]);

    await expect(createRelation(mock.client, "user-1", "source-1", "target-1"))
      .resolves.toEqual({
        status: "created",
        relation: expectedRelation,
      });

    expect(insert.insert).toHaveBeenCalledWith({
      garden_id: "garden-1",
      source_note_id: "source-1",
      target_note_id: "target-1",
    });
    expect(insert.select).toHaveBeenCalledWith(
      "id, garden_id, source_note_id, target_note_id, created_at"
    );
    expect(insert.single).toHaveBeenCalledTimes(1);
  });

  test.each([
    ["garden lookup", [gardenQuery({ data: null, error: { message: "garden error" } })], "garden error"],
    ["source lookup", [gardenQuery(), ownedNoteQuery("source-1", { data: null, error: { message: "source error" } })], "source error"],
    ["target lookup", [gardenQuery(), ownedNoteQuery("source-1"), ownedNoteQuery("target-1", { data: null, error: { message: "target error" } })], "target error"],
    ["duplicate lookup", [gardenQuery(), ownedNoteQuery("source-1"), ownedNoteQuery("target-1"), createQuery({ data: null, error: { message: "duplicate error" } })], "duplicate error"],
    ["insert", [gardenQuery(), ownedNoteQuery("source-1"), ownedNoteQuery("target-1"), createQuery({ data: null, error: null }), relationQuery({ data: null, error: { message: "insert error" } })], "insert error"],
  ])("propagates a relation creation %s error", async (_stage, queries, message) => {
    const mock = createSupabaseSequence(queries);

    await expect(createRelation(mock.client, "user-1", "source-1", "target-1"))
      .rejects.toMatchObject({ message });
  });

  test("gets and maps outgoing and incoming relations for an owned note", async () => {
    const outgoing = createQuery({ data: [relationRow], error: null });
    const incomingRow = {
      ...relationRow,
      id: "relation-2",
      source_note_id: "other-note",
      target_note_id: "source-1",
    };
    const incoming = createQuery({ data: [incomingRow], error: null });
    const mock = createSupabaseSequence([
      gardenQuery(), ownedNoteQuery("source-1"), outgoing, incoming,
    ]);

    await expect(getRelationsForNote(mock.client, "user-1", "source-1"))
      .resolves.toEqual({
        outgoing: [expectedRelation],
        incoming: [{
          ...expectedRelation,
          id: "relation-2",
          sourceNoteId: "other-note",
          targetNoteId: "source-1",
        }],
      });

    expect(outgoing.eq.mock.calls).toEqual([
      ["garden_id", "garden-1"],
      ["source_note_id", "source-1"],
    ]);
    expect(incoming.eq.mock.calls).toEqual([
      ["garden_id", "garden-1"],
      ["target_note_id", "source-1"],
    ]);
    expect(outgoing.order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(incoming.order).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  test("returns null relations when the user has no garden", async () => {
    const mock = createSupabaseSequence([gardenQuery({ data: null, error: null })]);
    await expect(getRelationsForNote(mock.client, "user-1", "note-1"))
      .resolves.toBeNull();
  });

  test("returns null relations when the note is not owned", async () => {
    const mock = createSupabaseSequence([
      gardenQuery(), ownedNoteQuery("note-1", { data: null, error: null }),
    ]);
    await expect(getRelationsForNote(mock.client, "user-1", "note-1"))
      .resolves.toBeNull();
  });

  test("propagates an outgoing relations query error", async () => {
    const error = { message: "Outgoing failed" };
    const mock = createSupabaseSequence([
      gardenQuery(), ownedNoteQuery("note-1"), createQuery({ data: null, error }),
    ]);
    await expect(getRelationsForNote(mock.client, "user-1", "note-1"))
      .rejects.toBe(error);
  });

  test("propagates an incoming relations query error", async () => {
    const error = { message: "Incoming failed" };
    const mock = createSupabaseSequence([
      gardenQuery(), ownedNoteQuery("note-1"),
      createQuery({ data: [], error: null }),
      createQuery({ data: null, error }),
    ]);
    await expect(getRelationsForNote(mock.client, "user-1", "note-1"))
      .rejects.toBe(error);
  });

  test("deletes and returns an owned relation", async () => {
    const find = relationQuery();
    const deletion = createQuery({ error: null });
    const mock = createSupabaseSequence([gardenQuery(), find, deletion]);

    await expect(deleteRelation(mock.client, "user-1", "relation-1"))
      .resolves.toEqual(expectedRelation);

    expect(find.eq.mock.calls).toEqual([
      ["id", "relation-1"],
      ["garden_id", "garden-1"],
    ]);
    expect(deletion.delete).toHaveBeenCalledTimes(1);
    expect(deletion.eq.mock.calls).toEqual([
      ["id", "relation-1"],
      ["garden_id", "garden-1"],
    ]);
  });

  test("returns null when deleting without a garden or matching relation", async () => {
    const noGarden = createSupabaseSequence([gardenQuery({ data: null, error: null })]);
    await expect(deleteRelation(noGarden.client, "user-1", "relation-1"))
      .resolves.toBeNull();

    const missing = createSupabaseSequence([
      gardenQuery(), relationQuery({ data: null, error: null }),
    ]);
    await expect(deleteRelation(missing.client, "user-1", "relation-1"))
      .resolves.toBeNull();
  });

  test("propagates relation lookup and delete errors", async () => {
    const findError = { message: "Find failed" };
    const findMock = createSupabaseSequence([
      gardenQuery(), relationQuery({ data: null, error: findError }),
    ]);
    await expect(deleteRelation(findMock.client, "user-1", "relation-1"))
      .rejects.toBe(findError);

    const deleteError = { message: "Delete failed" };
    const deleteMock = createSupabaseSequence([
      gardenQuery(), relationQuery(), createQuery({ error: deleteError }),
    ]);
    await expect(deleteRelation(deleteMock.client, "user-1", "relation-1"))
      .rejects.toBe(deleteError);
  });
});
