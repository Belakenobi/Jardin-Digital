import {
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";

const registerUser = jest.fn();
const loginUser = jest.fn();
const refreshUserSession = jest.fn();

jest.unstable_mockModule("../../src/services/auth.service.js", () => ({
  registerUser,
  loginUser,
  refreshUserSession,
}));

const {
  getAdminAccess,
  getCurrentUser,
  login,
  refreshSession,
  register,
} = await import("../../src/controllers/auth.controller.js");

function createResponse() {
  const response = {
    status: jest.fn(),
    json: jest.fn(),
  };

  response.status.mockReturnValue(response);
  response.json.mockReturnValue(response);

  return response;
}

const session = {
  access_token: "access-token",
  refresh_token: "refresh-token",
  token_type: "bearer",
  expires_at: 123456789,
};

const formattedSession = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  tokenType: "bearer",
  expiresAt: 123456789,
};

describe("auth controller", () => {
  beforeEach(() => {
    registerUser.mockReset();
    loginUser.mockReset();
    refreshUserSession.mockReset();
  });

  test("rejects invalid registration data without calling the service", async () => {
    const response = createResponse();
    const next = jest.fn();

    await register({ body: {} }, response, next);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
      status: "error",
      message: "Revisa los datos para crear tu cuenta.",
      errors: expect.objectContaining({
        email: expect.any(String),
        password: expect.any(String),
        displayName: expect.any(String),
      }),
    }));
    expect(registerUser).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test("registers a user, normalizes input and formats the session", async () => {
    const user = { id: "user-1", email: "name@example.com" };
    registerUser.mockResolvedValue({ user, session });
    const response = createResponse();
    const next = jest.fn();

    await register({
      body: {
        email: " NAME@example.com ",
        password: "password123",
        displayName: " Isabella ",
      },
    }, response, next);

    expect(registerUser).toHaveBeenCalledWith({
      email: "name@example.com",
      password: "password123",
      displayName: "Isabella",
    });
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith({
      status: "success",
      message: "User registered successfully",
      data: {
        user,
        session: formattedSession,
        requiresEmailConfirmation: false,
      },
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("reports email confirmation when registration has no session", async () => {
    registerUser.mockResolvedValue({
      user: { id: "user-1", email: "name@example.com" },
      session: null,
    });
    const response = createResponse();

    await register({
      body: {
        email: "name@example.com",
        password: "password123",
        displayName: "Isabella",
      },
    }, response, jest.fn());

    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
      message: "User registered. Check your email to confirm your account.",
      data: expect.objectContaining({
        session: null,
        requiresEmailConfirmation: true,
      }),
    }));
  });

  test("allows registration response data to contain a null user", async () => {
    registerUser.mockResolvedValue({ user: null, session });
    const response = createResponse();

    await register({
      body: {
        email: "name@example.com",
        password: "password123",
        displayName: "Isabella",
      },
    }, response, jest.fn());

    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ user: null }),
    }));
  });

  test("forwards registration service errors to next", async () => {
    const error = new Error("Registration failed");
    registerUser.mockRejectedValue(error);
    const response = createResponse();
    const next = jest.fn();

    await register({
      body: {
        email: "name@example.com",
        password: "password123",
        displayName: "Isabella",
      },
    }, response, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(response.status).not.toHaveBeenCalled();
  });

  test("rejects invalid login data without calling the service", async () => {
    const response = createResponse();
    const next = jest.fn();

    await login({ body: {} }, response, next);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
      status: "error",
      message: "Revisa tu correo y contraseña.",
    }));
    expect(loginUser).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test("logs in a user and formats the session", async () => {
    const user = { id: "user-1", email: "name@example.com" };
    loginUser.mockResolvedValue({ user, session });
    const response = createResponse();

    await login({
      body: { email: " NAME@example.com ", password: "password123" },
    }, response, jest.fn());

    expect(loginUser).toHaveBeenCalledWith({
      email: "name@example.com",
      password: "password123",
    });
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      status: "success",
      message: "Login successful",
      data: { user, session: formattedSession },
    });
  });

  test.each([
    [{ user: null, session }, "missing user"],
    [{ user: { id: "user-1", email: "name@example.com" }, session: null }, "missing session"],
  ])("forwards an internal error when login returns %s", async (result) => {
    loginUser.mockResolvedValue(result);
    const response = createResponse();
    const next = jest.fn();

    await login({
      body: { email: "name@example.com", password: "password123" },
    }, response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toMatchObject({
      message: "Authentication session was not created",
      status: 500,
    });
    expect(response.status).not.toHaveBeenCalled();
  });

  test("forwards login service errors to next", async () => {
    const error = new Error("Login failed");
    loginUser.mockRejectedValue(error);
    const response = createResponse();
    const next = jest.fn();

    await login({
      body: { email: "name@example.com", password: "password123" },
    }, response, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  test.each([
    [undefined],
    [""],
    [123],
  ])("rejects an absent or non-string refresh token: %s", async (refreshToken) => {
    const response = createResponse();
    const next = jest.fn();

    await refreshSession({ body: { refreshToken } }, response, next);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      status: "error",
      message: "Refresh token is required",
    });
    expect(refreshUserSession).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test("refreshes a session and formats its user and tokens", async () => {
    const user = { id: "user-1", email: "name@example.com" };
    refreshUserSession.mockResolvedValue({ user, session });
    const response = createResponse();

    await refreshSession({ body: { refreshToken: "refresh-token" } }, response, jest.fn());

    expect(refreshUserSession).toHaveBeenCalledWith("refresh-token");
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      status: "success",
      message: "Session refreshed successfully",
      data: { user, session: formattedSession },
    });
  });

  test("allows a refreshed session to contain a null user", async () => {
    refreshUserSession.mockResolvedValue({ user: null, session });
    const response = createResponse();

    await refreshSession({ body: { refreshToken: "refresh-token" } }, response, jest.fn());

    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
      data: {
        user: null,
        session: formattedSession,
      },
    }));
  });

  test("forwards a 401 error when refresh returns no session", async () => {
    refreshUserSession.mockResolvedValue({
      user: { id: "user-1", email: "name@example.com" },
      session: null,
    });
    const response = createResponse();
    const next = jest.fn();

    await refreshSession({ body: { refreshToken: "refresh-token" } }, response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toMatchObject({
      message: "Session could not be refreshed",
      status: 401,
    });
  });

  test("forwards refresh service errors to next", async () => {
    const error = new Error("Refresh failed");
    refreshUserSession.mockRejectedValue(error);
    const response = createResponse();
    const next = jest.fn();

    await refreshSession({ body: { refreshToken: "refresh-token" } }, response, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  test("returns the current authenticated user", () => {
    const user = { id: "user-1", role: "user" };
    const response = createResponse();

    getCurrentUser({ user }, response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      status: "success",
      data: { user },
    });
  });

  test("returns successful administrator access", () => {
    const user = { id: "admin-1", role: "admin" };
    const response = createResponse();

    getAdminAccess({ user }, response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      status: "success",
      message: "Administrator access granted",
      data: { user },
    });
  });
});
