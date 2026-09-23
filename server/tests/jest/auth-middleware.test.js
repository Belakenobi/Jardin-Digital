import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";

const createSupabaseClient = jest.fn();

jest.unstable_mockModule("../../src/config/supabase.js", () => ({
  createSupabaseClient,
  default: {},
}));

const {
  authenticate,
  authorizeRoles,
} = await import("../../src/middleware/auth.middleware.js");

function createResponse() {
  const response = {
    status: jest.fn(),
    json: jest.fn(),
  };

  response.status.mockReturnValue(response);
  response.json.mockReturnValue(response);

  return response;
}

function createRequest(authorization) {
  return {
    get: jest.fn((header) => (
      header === "authorization" ? authorization : undefined
    )),
  };
}

function createProfileClient(result) {
  const single = jest.fn().mockResolvedValue(result);
  const eq = jest.fn().mockReturnValue({ single });
  const select = jest.fn().mockReturnValue({ eq });
  const from = jest.fn().mockReturnValue({ select });

  return {
    client: { from },
    from,
    select,
    eq,
    single,
  };
}

describe("authenticate", () => {
  beforeEach(() => {
    createSupabaseClient.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test.each([
    [undefined],
    [""],
    ["Basic access-token"],
    ["Bearer"],
    ["Bearer   "],
  ])("returns 401 when Authorization is absent or malformed: %s", async (header) => {
    const request = createRequest(header);
    const response = createResponse();
    const next = jest.fn();

    await authenticate(request, response, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({
      status: "error",
      message: "Inicia sesión para continuar.",
    });
    expect(createSupabaseClient).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 401 when Supabase rejects the token", async () => {
    const getUser = jest.fn().mockResolvedValue({
      data: { user: null },
      error: { message: "Invalid token" },
    });
    createSupabaseClient.mockReturnValue({ auth: { getUser } });

    const response = createResponse();
    const next = jest.fn();
    await authenticate(createRequest("Bearer invalid-token"), response, next);

    expect(getUser).toHaveBeenCalledWith("invalid-token");
    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({
      status: "error",
      message: "Tu sesión ha expirado. Inicia sesión nuevamente.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 401 when token validation has no error but no user", async () => {
    const getUser = jest.fn().mockResolvedValue({
      data: { user: null },
      error: null,
    });
    createSupabaseClient.mockReturnValue({ auth: { getUser } });

    const response = createResponse();
    const next = jest.fn();
    await authenticate(createRequest("Bearer orphan-token"), response, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 403 when the authenticated user's profile query fails", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    const getUser = jest.fn().mockResolvedValue({
      data: { user: { id: "user-1", email: "name@example.com" } },
      error: null,
    });
    const profile = createProfileClient({
      data: null,
      error: { message: "Profile query failed" },
    });
    createSupabaseClient
      .mockReturnValueOnce({ auth: { getUser } })
      .mockReturnValueOnce(profile.client);

    const response = createResponse();
    const next = jest.fn();
    await authenticate(createRequest("Bearer valid-token"), response, next);

    expect(createSupabaseClient).toHaveBeenNthCalledWith(1);
    expect(createSupabaseClient).toHaveBeenNthCalledWith(2, "valid-token");
    expect(profile.from).toHaveBeenCalledWith("profiles");
    expect(profile.select).toHaveBeenCalledWith("id, display_name, role");
    expect(profile.eq).toHaveBeenCalledWith("id", "user-1");
    expect(response.status).toHaveBeenCalledWith(403);
    expect(consoleError).toHaveBeenCalledWith(
      "Authenticated user profile was not available:",
      "Profile query failed"
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 403 when the authenticated user has no profile", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const getUser = jest.fn().mockResolvedValue({
      data: { user: { id: "user-1", email: "name@example.com" } },
      error: null,
    });
    const profile = createProfileClient({ data: null, error: null });
    createSupabaseClient
      .mockReturnValueOnce({ auth: { getUser } })
      .mockReturnValueOnce(profile.client);

    const response = createResponse();
    const next = jest.fn();
    await authenticate(createRequest("Bearer valid-token"), response, next);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(response.json).toHaveBeenCalledWith({
      status: "error",
      message: "No se pudo acceder a tu perfil. Intenta iniciar sesión nuevamente.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("attaches the authenticated user and scoped client before calling next", async () => {
    const getUser = jest.fn().mockResolvedValue({
      data: { user: { id: "user-1", email: "name@example.com" } },
      error: null,
    });
    const profile = createProfileClient({
      data: {
        id: "user-1",
        display_name: "Isabella",
        role: "admin",
      },
      error: null,
    });
    createSupabaseClient
      .mockReturnValueOnce({ auth: { getUser } })
      .mockReturnValueOnce(profile.client);

    const request = createRequest("  bEaReR   valid-token  ");
    const response = createResponse();
    const next = jest.fn();
    await authenticate(request, response, next);

    expect(request.user).toEqual({
      id: "user-1",
      email: "name@example.com",
      displayName: "Isabella",
      role: "admin",
    });
    expect(request.supabase).toBe(profile.client);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
    expect(response.status).not.toHaveBeenCalled();
  });

  test("forwards unexpected authentication errors to next", async () => {
    const error = new Error("Unexpected auth failure");
    createSupabaseClient.mockImplementation(() => {
      throw error;
    });

    const response = createResponse();
    const next = jest.fn();
    await authenticate(createRequest("Bearer valid-token"), response, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(response.status).not.toHaveBeenCalled();
  });
});

describe("authorizeRoles", () => {
  test("returns 401 when authentication has not attached a user", () => {
    const response = createResponse();
    const next = jest.fn();

    authorizeRoles("admin")({}, response, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({
      status: "error",
      message: "Inicia sesión para continuar.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 403 when the user's role is not allowed", () => {
    const response = createResponse();
    const next = jest.fn();

    authorizeRoles("admin")({ user: { role: "user" } }, response, next);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(response.json).toHaveBeenCalledWith({
      status: "error",
      message: "No tienes permiso para realizar esta acción.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("calls next when the user's role is among the allowed roles", () => {
    const response = createResponse();
    const next = jest.fn();

    authorizeRoles("admin", "editor")(
      { user: { role: "admin" } },
      response,
      next
    );

    expect(next).toHaveBeenCalledTimes(1);
    expect(response.status).not.toHaveBeenCalled();
  });
});
