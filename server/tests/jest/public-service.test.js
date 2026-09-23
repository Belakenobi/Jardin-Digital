import {
  describe,
  expect,
  test,
} from "@jest/globals";

import {
  getPublicGarden,
  getPublicGardens,
} from "../../src/services/public.service.js";
import {
  createQuery,
  createSupabaseSequence,
} from "./helpers/supabase-query.js";

const publicGardenRow = {
  id: "garden-1",
  user_id: "user-1",
  name: "Jardín público",
  description: "Ideas compartidas",
  is_public: true,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-02-01T00:00:00.000Z",
};

const noteRow = {
  id: "note-1",
  garden_id: "garden-1",
  title: "Nota pública",
  content: "Contenido",
  maturity: "tree",
  created_at: "2026-01-02T00:00:00.000Z",
  updated_at: "2026-02-02T00:00:00.000Z",
};

const relationRow = {
  id: "relation-1",
  garden_id: "garden-1",
  source_note_id: "note-1",
  target_note_id: "note-2",
  created_at: "2026-01-03T00:00:00.000Z",
};

describe("public service", () => {
  test("lists six-or-fewer public gardens with owners and maturity counts", async () => {
    const secondGarden = {
      id: "garden-2",
      user_id: "user-without-profile",
      name: "Otro jardín",
      description: null,
      updated_at: "2026-01-15T00:00:00.000Z",
    };
    const gardens = createQuery({
      data: [publicGardenRow, secondGarden],
      error: null,
    });
    const profiles = createQuery({
      data: [{ id: "user-1", display_name: "Isabella" }],
      error: null,
    });
    const counts = [2, 1, 3, 0, 4, 1].map((count) =>
      createQuery({ count, error: null })
    );
    const mock = createSupabaseSequence([gardens, profiles, ...counts]);

    await expect(getPublicGardens(mock.client)).resolves.toEqual([
      {
        id: "garden-1",
        name: "Jardín público",
        description: "Ideas compartidas",
        owner: { id: "user-1", displayName: "Isabella" },
        noteCount: 6,
        maturityCounts: { seed: 2, budding: 1, tree: 3 },
        updatedAt: "2026-02-01T00:00:00.000Z",
      },
      {
        id: "garden-2",
        name: "Otro jardín",
        description: null,
        owner: null,
        noteCount: 5,
        maturityCounts: { seed: 0, budding: 4, tree: 1 },
        updatedAt: "2026-01-15T00:00:00.000Z",
      },
    ]);

    expect(gardens.select).toHaveBeenCalledWith(
      "id, user_id, name, description, updated_at"
    );
    expect(gardens.eq).toHaveBeenCalledWith("is_public", true);
    expect(gardens.order).toHaveBeenCalledWith("updated_at", { ascending: false });
    expect(gardens.limit).toHaveBeenCalledWith(6);
    expect(profiles.in).toHaveBeenCalledWith("id", ["user-1", "user-without-profile"]);

    for (let index = 0; index < counts.length; index += 1) {
      const gardenId = index < 3 ? "garden-1" : "garden-2";
      const maturity = ["seed", "budding", "tree"][index % 3];
      expect(counts[index].select).toHaveBeenCalledWith("id", {
        count: "exact",
        head: true,
      });
      expect(counts[index].eq.mock.calls).toEqual([
        ["garden_id", gardenId],
        ["maturity", maturity],
      ]);
    }
  });

  test("returns an empty public list without loading profiles or counts", async () => {
    const gardens = createQuery({ data: [], error: null });
    const mock = createSupabaseSequence([gardens]);

    await expect(getPublicGardens(mock.client)).resolves.toEqual([]);
    expect(mock.from).toHaveBeenCalledTimes(1);
  });

  test("propagates public garden and profile query errors", async () => {
    const gardensError = { message: "Gardens failed" };
    const gardensMock = createSupabaseSequence([
      createQuery({ data: null, error: gardensError }),
    ]);
    await expect(getPublicGardens(gardensMock.client)).rejects.toBe(gardensError);

    const profilesError = { message: "Profiles failed" };
    const profilesMock = createSupabaseSequence([
      createQuery({ data: [publicGardenRow], error: null }),
      createQuery({ data: null, error: profilesError }),
    ]);
    await expect(getPublicGardens(profilesMock.client)).rejects.toBe(profilesError);
  });

  test("propagates a maturity count error", async () => {
    const countError = { message: "Count failed" };
    const mock = createSupabaseSequence([
      createQuery({ data: [publicGardenRow], error: null }),
      createQuery({ data: [{ id: "user-1", display_name: "Isabella" }], error: null }),
      createQuery({ count: null, error: countError }),
      createQuery({ count: 0, error: null }),
      createQuery({ count: 0, error: null }),
    ]);

    await expect(getPublicGardens(mock.client)).rejects.toBe(countError);
  });

  test("gets a public garden with owner, notes and relations", async () => {
    const garden = createQuery({ data: publicGardenRow, error: null });
    const profile = createQuery({
      data: { id: "user-1", display_name: "Isabella" },
      error: null,
    });
    const notes = createQuery({ data: [noteRow], error: null });
    const relations = createQuery({ data: [relationRow], error: null });
    const mock = createSupabaseSequence([garden, profile, notes, relations]);

    await expect(getPublicGarden(mock.client, "garden-1")).resolves.toEqual({
      garden: {
        id: "garden-1",
        userId: "user-1",
        name: "Jardín público",
        description: "Ideas compartidas",
        isPublic: true,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-02-01T00:00:00.000Z",
      },
      owner: { id: "user-1", displayName: "Isabella" },
      notes: [{
        id: "note-1",
        gardenId: "garden-1",
        title: "Nota pública",
        content: "Contenido",
        maturity: "tree",
        createdAt: "2026-01-02T00:00:00.000Z",
        updatedAt: "2026-02-02T00:00:00.000Z",
      }],
      relations: [{
        id: "relation-1",
        gardenId: "garden-1",
        sourceNoteId: "note-1",
        targetNoteId: "note-2",
        createdAt: "2026-01-03T00:00:00.000Z",
      }],
    });

    expect(garden.eq.mock.calls).toEqual([
      ["id", "garden-1"],
      ["is_public", true],
    ]);
    expect(profile.eq).toHaveBeenCalledWith("id", "user-1");
    expect(notes.eq).toHaveBeenCalledWith("garden_id", "garden-1");
    expect(notes.order).toHaveBeenCalledWith("updated_at", { ascending: false });
    expect(relations.eq).toHaveBeenCalledWith("garden_id", "garden-1");
  });

  test("returns null for a private or nonexistent garden", async () => {
    const mock = createSupabaseSequence([
      createQuery({ data: null, error: null }),
    ]);

    await expect(getPublicGarden(mock.client, "private-garden")).resolves.toBeNull();
    expect(mock.from).toHaveBeenCalledTimes(1);
  });

  test("returns a public garden with a null owner when its profile is unavailable", async () => {
    const mock = createSupabaseSequence([
      createQuery({ data: publicGardenRow, error: null }),
      createQuery({ data: null, error: null }),
      createQuery({ data: [], error: null }),
      createQuery({ data: [], error: null }),
    ]);

    const result = await getPublicGarden(mock.client, "garden-1");
    expect(result.owner).toBeNull();
    expect(result.notes).toEqual([]);
    expect(result.relations).toEqual([]);
  });

  test("propagates the initial public garden lookup error", async () => {
    const error = { message: "Garden lookup failed" };
    const mock = createSupabaseSequence([
      createQuery({ data: null, error }),
    ]);
    await expect(getPublicGarden(mock.client, "garden-1")).rejects.toBe(error);
  });

  test.each([
    ["profile", 0],
    ["notes", 1],
    ["relations", 2],
  ])("propagates a public %s query error", async (_name, errorIndex) => {
    const error = { message: `${_name} failed` };
    const results = [
      { data: { id: "user-1", display_name: "Isabella" }, error: null },
      { data: [], error: null },
      { data: [], error: null },
    ];
    results[errorIndex] = { data: null, error };
    const mock = createSupabaseSequence([
      createQuery({ data: publicGardenRow, error: null }),
      ...results.map(createQuery),
    ]);

    await expect(getPublicGarden(mock.client, "garden-1")).rejects.toBe(error);
  });
});
