import {
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
  loginUser,
  refreshUserSession,
  registerUser,
} = await import("../../src/services/auth.service.js");

describe("auth service", () => {
  beforeEach(() => {
    createSupabaseClient.mockReset();
  });

  test("registers a user and returns Supabase user and session data", async () => {
    const user = { id: "user-1", email: "name@example.com" };
    const session = { access_token: "access-token" };
    const signUp = jest.fn().mockResolvedValue({
      data: { user, session },
      error: null,
    });
    createSupabaseClient.mockReturnValue({ auth: { signUp } });

    await expect(registerUser({
      email: "name@example.com",
      password: "password123",
      displayName: "Isabella",
    })).resolves.toEqual({ user, session });

    expect(createSupabaseClient).toHaveBeenCalledWith();
    expect(signUp).toHaveBeenCalledWith({
      email: "name@example.com",
      password: "password123",
      options: {
        data: { display_name: "Isabella" },
      },
    });
  });

  test("preserves null user and session returned during registration", async () => {
    const signUp = jest.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    });
    createSupabaseClient.mockReturnValue({ auth: { signUp } });

    await expect(registerUser({
      email: "name@example.com",
      password: "password123",
      displayName: "Isabella",
    })).resolves.toEqual({ user: null, session: null });
  });

  test("throws a Supabase registration error unchanged", async () => {
    const error = { code: "signup_disabled", message: "Sign up disabled" };
    const signUp = jest.fn().mockResolvedValue({ data: null, error });
    createSupabaseClient.mockReturnValue({ auth: { signUp } });

    await expect(registerUser({
      email: "name@example.com",
      password: "password123",
      displayName: "Isabella",
    })).rejects.toBe(error);
  });

  test("logs in and returns Supabase user and session data", async () => {
    const user = { id: "user-1", email: "name@example.com" };
    const session = { access_token: "access-token" };
    const signInWithPassword = jest.fn().mockResolvedValue({
      data: { user, session },
      error: null,
    });
    createSupabaseClient.mockReturnValue({ auth: { signInWithPassword } });

    await expect(loginUser({
      email: "name@example.com",
      password: "password123",
    })).resolves.toEqual({ user, session });

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "name@example.com",
      password: "password123",
    });
  });

  test("preserves null user and session returned during login", async () => {
    const signInWithPassword = jest.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    });
    createSupabaseClient.mockReturnValue({ auth: { signInWithPassword } });

    await expect(loginUser({
      email: "name@example.com",
      password: "password123",
    })).resolves.toEqual({ user: null, session: null });
  });

  test("throws a Supabase login error unchanged", async () => {
    const error = { code: "invalid_credentials", message: "Invalid login" };
    const signInWithPassword = jest.fn().mockResolvedValue({ data: null, error });
    createSupabaseClient.mockReturnValue({ auth: { signInWithPassword } });

    await expect(loginUser({
      email: "name@example.com",
      password: "wrong-password",
    })).rejects.toBe(error);
  });

  test("refreshes and returns Supabase user and session data", async () => {
    const user = { id: "user-1", email: "name@example.com" };
    const session = { access_token: "new-access-token" };
    const refreshSession = jest.fn().mockResolvedValue({
      data: { user, session },
      error: null,
    });
    createSupabaseClient.mockReturnValue({ auth: { refreshSession } });

    await expect(refreshUserSession("refresh-token")).resolves.toEqual({
      user,
      session,
    });
    expect(refreshSession).toHaveBeenCalledWith({
      refresh_token: "refresh-token",
    });
  });

  test("preserves null user and session returned during refresh", async () => {
    const refreshSession = jest.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    });
    createSupabaseClient.mockReturnValue({ auth: { refreshSession } });

    await expect(refreshUserSession("refresh-token")).resolves.toEqual({
      user: null,
      session: null,
    });
  });

  test("throws a Supabase refresh error unchanged", async () => {
    const error = { code: "invalid_refresh_token", message: "Invalid refresh" };
    const refreshSession = jest.fn().mockResolvedValue({ data: null, error });
    createSupabaseClient.mockReturnValue({ auth: { refreshSession } });

    await expect(refreshUserSession("bad-refresh-token")).rejects.toBe(error);
  });
});
