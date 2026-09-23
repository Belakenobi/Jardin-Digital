import {
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";

import {
  getProfile,
  updateProfile,
} from "../../src/services/profile.service.js";

const profileRow = {
  id: "user-1",
  display_name: "Isabella",
  role: "user",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-02-01T00:00:00.000Z",
};

const expectedProfile = {
  id: "user-1",
  displayName: "Isabella",
  role: "user",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-02-01T00:00:00.000Z",
};

function createGetProfileClient(result) {
  const single = jest.fn().mockResolvedValue(result);
  const eq = jest.fn().mockReturnValue({ single });
  const select = jest.fn().mockReturnValue({ eq });
  const from = jest.fn().mockReturnValue({ select });

  return {
    supabase: { from },
    from,
    select,
    eq,
    single,
  };
}

function createUpdateProfileClient(result) {
  const single = jest.fn().mockResolvedValue(result);
  const select = jest.fn().mockReturnValue({ single });
  const eq = jest.fn().mockReturnValue({ select });
  const update = jest.fn().mockReturnValue({ eq });
  const from = jest.fn().mockReturnValue({ update });

  return {
    supabase: { from },
    from,
    update,
    eq,
    select,
    single,
  };
}

describe("profile service", () => {
  test("gets a profile by owner id and transforms database fields", async () => {
    const mock = createGetProfileClient({ data: profileRow, error: null });

    await expect(getProfile(mock.supabase, "user-1")).resolves.toEqual(expectedProfile);

    expect(mock.from).toHaveBeenCalledWith("profiles");
    expect(mock.select).toHaveBeenCalledWith(
      "id, display_name, role, created_at, updated_at"
    );
    expect(mock.eq).toHaveBeenCalledWith("id", "user-1");
    expect(mock.single).toHaveBeenCalledTimes(1);
  });

  test("throws the Supabase get-profile error unchanged", async () => {
    const error = { code: "PGRST116", message: "Profile not found" };
    const mock = createGetProfileClient({ data: null, error });

    await expect(getProfile(mock.supabase, "missing-user")).rejects.toBe(error);
    expect(mock.eq).toHaveBeenCalledWith("id", "missing-user");
  });

  test("updates the display name and transforms the returned profile", async () => {
    const updatedRow = {
      ...profileRow,
      display_name: "Isabella García",
    };
    const mock = createUpdateProfileClient({ data: updatedRow, error: null });

    await expect(
      updateProfile(mock.supabase, "user-1", "Isabella García")
    ).resolves.toEqual({
      ...expectedProfile,
      displayName: "Isabella García",
    });

    expect(mock.from).toHaveBeenCalledWith("profiles");
    expect(mock.update).toHaveBeenCalledWith({
      display_name: "Isabella García",
    });
    expect(mock.eq).toHaveBeenCalledWith("id", "user-1");
    expect(mock.select).toHaveBeenCalledWith(
      "id, display_name, role, created_at, updated_at"
    );
    expect(mock.single).toHaveBeenCalledTimes(1);
  });

  test("throws the Supabase update-profile error unchanged", async () => {
    const error = { code: "42501", message: "Update denied" };
    const mock = createUpdateProfileClient({ data: null, error });

    await expect(
      updateProfile(mock.supabase, "user-1", "New name")
    ).rejects.toBe(error);
    expect(mock.update).toHaveBeenCalledWith({ display_name: "New name" });
  });
});
