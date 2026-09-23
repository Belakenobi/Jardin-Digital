import {
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";

import {
  createRequest,
  createResponse,
} from "./helpers/controller.js";

const getAdminSummary = jest.fn();
const getAdminUsers = jest.fn();
const getProfile = jest.fn();
const updateProfile = jest.fn();

jest.unstable_mockModule("../../src/services/admin.service.js", () => ({
  getAdminSummary,
  getAdminUsers,
}));
jest.unstable_mockModule("../../src/services/profile.service.js", () => ({
  getProfile,
  updateProfile,
}));

const { getSummary, getUsers } = await import("../../src/controllers/admin.controller.js");
const { getMyProfile, updateMyProfile } = await import("../../src/controllers/profile.controller.js");

describe("admin controller", () => {
  beforeEach(() => {
    getAdminSummary.mockReset();
    getAdminUsers.mockReset();
  });

  test("returns the administrative summary from the scoped client", async () => {
    const summary = { userCount: 3, noteCount: 8 };
    getAdminSummary.mockResolvedValue(summary);
    const request = createRequest();
    const response = createResponse();
    const next = jest.fn();

    await getSummary(request, response, next);

    expect(getAdminSummary).toHaveBeenCalledWith(request.supabase);
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      status: "success",
      data: { summary },
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("forwards summary service errors", async () => {
    const error = new Error("Summary failed");
    getAdminSummary.mockRejectedValue(error);
    const response = createResponse();
    const next = jest.fn();

    await getSummary(createRequest(), response, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(response.status).not.toHaveBeenCalled();
  });

  test("returns the administrative user list", async () => {
    const users = [{ id: "user-1", role: "admin" }];
    getAdminUsers.mockResolvedValue(users);
    const request = createRequest();
    const response = createResponse();

    await getUsers(request, response, jest.fn());

    expect(getAdminUsers).toHaveBeenCalledWith(request.supabase);
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      status: "success",
      data: { users },
    });
  });

  test("forwards user-list service errors", async () => {
    const error = new Error("Users failed");
    getAdminUsers.mockRejectedValue(error);
    const next = jest.fn();

    await getUsers(createRequest(), createResponse(), next);
    expect(next).toHaveBeenCalledWith(error);
  });
});

describe("profile controller", () => {
  beforeEach(() => {
    getProfile.mockReset();
    updateProfile.mockReset();
  });

  test("returns the authenticated user's profile", async () => {
    const profile = { id: "user-1", displayName: "Isabella", role: "user" };
    getProfile.mockResolvedValue(profile);
    const request = createRequest();
    const response = createResponse();

    await getMyProfile(request, response, jest.fn());

    expect(getProfile).toHaveBeenCalledWith(request.supabase, "user-1");
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({ status: "success", profile });
  });

  test("forwards profile lookup errors", async () => {
    const error = new Error("Profile failed");
    getProfile.mockRejectedValue(error);
    const next = jest.fn();

    await getMyProfile(createRequest(), createResponse(), next);
    expect(next).toHaveBeenCalledWith(error);
  });

  test("trims and updates the authenticated user's display name", async () => {
    const profile = { id: "user-1", displayName: "Isabella García" };
    updateProfile.mockResolvedValue(profile);
    const request = createRequest({ body: { displayName: "  Isabella García  " } });
    const response = createResponse();

    await updateMyProfile(request, response, jest.fn());

    expect(updateProfile).toHaveBeenCalledWith(
      request.supabase,
      "user-1",
      "Isabella García"
    );
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      status: "success",
      message: "Profile updated successfully",
      profile,
    });
  });

  test("forwards profile update errors", async () => {
    const error = new Error("Update failed");
    updateProfile.mockRejectedValue(error);
    const next = jest.fn();

    await updateMyProfile(
      createRequest({ body: { displayName: "Isabella" } }),
      createResponse(),
      next
    );
    expect(next).toHaveBeenCalledWith(error);
  });
});
