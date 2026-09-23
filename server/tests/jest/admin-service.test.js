import {
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";

import {
  getAdminSummary,
  getAdminUsers,
} from "../../src/services/admin.service.js";

function createThenableCountQuery(result) {
  const promise = Promise.resolve(result);
  const query = {
    eq: jest.fn(),
    select: jest.fn(),
    then: promise.then.bind(promise),
  };

  query.eq.mockReturnValue(query);
  query.select.mockReturnValue(query);

  return query;
}

function createSummaryClient(results) {
  const queries = results.map(createThenableCountQuery);
  let queryIndex = 0;
  const from = jest.fn(() => queries[queryIndex++]);

  return {
    supabase: { from },
    from,
    queries,
  };
}

function createUsersClient({ profilesResult, gardensResult }) {
  const order = jest.fn().mockResolvedValue(profilesResult);
  const profilesSelect = jest.fn().mockReturnValue({ order });
  const gardensSelect = jest.fn().mockResolvedValue(gardensResult);
  const from = jest.fn((table) => {
    if (table === "profiles") {
      return { select: profilesSelect };
    }

    if (table === "gardens") {
      return { select: gardensSelect };
    }

    throw new Error(`Unexpected table: ${table}`);
  });

  return {
    supabase: { from },
    from,
    profilesSelect,
    gardensSelect,
    order,
  };
}

describe("admin service", () => {
  test("builds the administrative summary from exact table counts", async () => {
    const mock = createSummaryClient([
      { count: 3, error: null },
      { count: 2, error: null },
      { count: 1, error: null },
      { count: null, error: null },
      { count: 8, error: null },
      { count: 5, error: null },
      { count: 4, error: null },
    ]);

    await expect(getAdminSummary(mock.supabase)).resolves.toEqual({
      userCount: 3,
      gardenCount: 2,
      publicGardenCount: 1,
      privateGardenCount: 0,
      noteCount: 8,
      relationCount: 5,
      galleryImageCount: 4,
    });

    expect(mock.from.mock.calls.map(([table]) => table)).toEqual([
      "profiles",
      "gardens",
      "gardens",
      "gardens",
      "notes",
      "note_relations",
      "gallery_images",
    ]);
    for (const query of mock.queries) {
      expect(query.select).toHaveBeenCalledWith("id", {
        count: "exact",
        head: true,
      });
    }
    expect(mock.queries[2].eq).toHaveBeenCalledWith("is_public", true);
    expect(mock.queries[3].eq).toHaveBeenCalledWith("is_public", false);
    expect(mock.queries[0].eq).not.toHaveBeenCalled();
  });

  test("rejects the summary when any Supabase count fails", async () => {
    const error = { code: "42501", message: "Count denied" };
    const mock = createSummaryClient([
      { count: null, error },
      { count: 0, error: null },
      { count: 0, error: null },
      { count: 0, error: null },
      { count: 0, error: null },
      { count: 0, error: null },
      { count: 0, error: null },
    ]);

    await expect(getAdminSummary(mock.supabase)).rejects.toBe(error);
  });

  test("joins profiles with their gardens and transforms returned fields", async () => {
    const mock = createUsersClient({
      profilesResult: {
        data: [
          {
            id: "user-1",
            display_name: "Isabella",
            role: "admin",
            created_at: "2026-01-01T00:00:00.000Z",
          },
          {
            id: "user-2",
            display_name: "Marina",
            role: "user",
            created_at: "2026-02-01T00:00:00.000Z",
          },
        ],
        error: null,
      },
      gardensResult: {
        data: [{
          id: "garden-1",
          user_id: "user-1",
          name: "Jardín público",
          is_public: true,
        }],
        error: null,
      },
    });

    await expect(getAdminUsers(mock.supabase)).resolves.toEqual([
      {
        id: "user-1",
        displayName: "Isabella",
        role: "admin",
        createdAt: "2026-01-01T00:00:00.000Z",
        garden: {
          id: "garden-1",
          name: "Jardín público",
          isPublic: true,
        },
      },
      {
        id: "user-2",
        displayName: "Marina",
        role: "user",
        createdAt: "2026-02-01T00:00:00.000Z",
        garden: null,
      },
    ]);

    expect(mock.from).toHaveBeenCalledWith("profiles");
    expect(mock.profilesSelect).toHaveBeenCalledWith(
      "id, display_name, role, created_at"
    );
    expect(mock.order).toHaveBeenCalledWith("created_at", {
      ascending: false,
    });
    expect(mock.from).toHaveBeenCalledWith("gardens");
    expect(mock.gardensSelect).toHaveBeenCalledWith(
      "id, user_id, name, is_public"
    );
  });

  test("returns an empty user list when both queries are empty", async () => {
    const mock = createUsersClient({
      profilesResult: { data: [], error: null },
      gardensResult: { data: [], error: null },
    });

    await expect(getAdminUsers(mock.supabase)).resolves.toEqual([]);
  });

  test("throws a profiles query error before transforming users", async () => {
    const error = { code: "42501", message: "Profiles denied" };
    const mock = createUsersClient({
      profilesResult: { data: null, error },
      gardensResult: { data: [], error: null },
    });

    await expect(getAdminUsers(mock.supabase)).rejects.toBe(error);
  });

  test("throws a gardens query error before joining users", async () => {
    const error = { code: "42501", message: "Gardens denied" };
    const mock = createUsersClient({
      profilesResult: { data: [], error: null },
      gardensResult: { data: null, error },
    });

    await expect(getAdminUsers(mock.supabase)).rejects.toBe(error);
  });
});
