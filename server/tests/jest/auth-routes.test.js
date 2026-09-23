import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";
import request from "supertest";

const createSupabaseClient = jest.fn();

jest.unstable_mockModule("../../src/config/supabase.js", () => ({
  createSupabaseClient,
  default: {},
}));

let app;

beforeAll(async () => {
  ({ default: app } = await import("../../src/app.js"));
});

function createProfileClient(profile) {
  return {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: profile, error: null }),
        }),
      }),
    }),
  };
}

function mockAuthenticatedRequest(role) {
  const getUser = jest.fn().mockResolvedValue({
    data: {
      user: { id: "user-1", email: "name@example.com" },
    },
    error: null,
  });
  const scopedClient = createProfileClient({
    id: "user-1",
    display_name: "Isabella",
    role,
  });

  createSupabaseClient.mockImplementation((accessToken) => (
    accessToken
      ? scopedClient
      : { auth: { getUser } }
  ));

  return { getUser, scopedClient };
}

describe("authentication and authorization routes", () => {
  beforeEach(() => {
    createSupabaseClient.mockReset();
  });

  test("GET /api/auth/me returns 401 without a token", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .expect(401);

    expect(response.body).toEqual({
      status: "error",
      message: "Inicia sesión para continuar.",
    });
    expect(createSupabaseClient).not.toHaveBeenCalled();
  });

  test("GET /api/auth/me returns 401 for a token rejected by Supabase", async () => {
    const getUser = jest.fn().mockResolvedValue({
      data: { user: null },
      error: { message: "Invalid token" },
    });
    createSupabaseClient.mockReturnValue({ auth: { getUser } });

    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalid-token")
      .expect(401);

    expect(getUser).toHaveBeenCalledWith("invalid-token");
    expect(response.body.message).toMatch(/sesión ha expirado/);
  });

  test("GET /api/auth/me returns the user built from auth and profile data", async () => {
    const { getUser } = mockAuthenticatedRequest("user");

    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer valid-token")
      .expect(200);

    expect(getUser).toHaveBeenCalledWith("valid-token");
    expect(response.body).toEqual({
      status: "success",
      data: {
        user: {
          id: "user-1",
          email: "name@example.com",
          displayName: "Isabella",
          role: "user",
        },
      },
    });
  });

  test("GET /api/auth/admin/check returns 403 for a non-admin user", async () => {
    mockAuthenticatedRequest("user");

    const response = await request(app)
      .get("/api/auth/admin/check")
      .set("Authorization", "Bearer user-token")
      .expect(403);

    expect(response.body).toEqual({
      status: "error",
      message: "No tienes permiso para realizar esta acción.",
    });
  });

  test("GET /api/auth/admin/check allows an administrator", async () => {
    mockAuthenticatedRequest("admin");

    const response = await request(app)
      .get("/api/auth/admin/check")
      .set("Authorization", "Bearer admin-token")
      .expect(200);

    expect(response.body).toEqual({
      status: "success",
      message: "Administrator access granted",
      data: {
        user: {
          id: "user-1",
          email: "name@example.com",
          displayName: "Isabella",
          role: "admin",
        },
      },
    });
  });
});
