import {
  loginUser,
  refreshUserSession,
  registerUser,
} from "../services/auth.service.js";

import {
  validateLogin,
  validateRegistration,
} from "../validators/auth.validator.js";

function formatSession(session) {
  if (!session) {
    return null;
  }

  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    tokenType: session.token_type,
    expiresAt: session.expires_at,
  };
}

export async function register(
  request,
  response,
  next
) {
  const validation = validateRegistration(
    request.body
  );

  if (!validation.isValid) {
    return response.status(400).json({
      status: "error",
      message: "Invalid registration data",
      errors: validation.errors,
    });
  }

  try {
    const { user, session } =
      await registerUser(validation.data);

    return response.status(201).json({
      status: "success",
      message: session
        ? "User registered successfully"
        : "User registered. Check your email to confirm your account.",
      data: {
        user: user
          ? {
              id: user.id,
              email: user.email,
            }
          : null,
        session: formatSession(session),
        requiresEmailConfirmation: !session,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function login(
  request,
  response,
  next
) {
  const validation = validateLogin(request.body);

  if (!validation.isValid) {
    return response.status(400).json({
      status: "error",
      message: "Invalid login data",
      errors: validation.errors,
    });
  }

  try {
    const { user, session } =
      await loginUser(validation.data);

    if (!user || !session) {
      const error = new Error(
        "Authentication session was not created"
      );

      error.status = 500;

      throw error;
    }

    return response.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          email: user.email,
        },
        session: formatSession(session),
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function refreshSession(
  request,
  response,
  next
) {
  const { refreshToken } = request.body;

  if (
    !refreshToken ||
    typeof refreshToken !== "string"
  ) {
    return response.status(400).json({
      status: "error",
      message: "Refresh token is required",
    });
  }

  try {
    const { user, session } =
      await refreshUserSession(refreshToken);

    if (!session) {
      const error = new Error(
        "Session could not be refreshed"
      );

      error.status = 401;

      throw error;
    }

    return response.status(200).json({
      status: "success",
      message: "Session refreshed successfully",
      data: {
        user: user
          ? {
              id: user.id,
              email: user.email,
            }
          : null,
        session: formatSession(session),
      },
    });
  } catch (error) {
    return next(error);
  }
}

export function getCurrentUser(
  request,
  response
) {
  return response.status(200).json({
    status: "success",
    data: {
      user: request.user,
    },
  });
}

export function getAdminAccess(
  request,
  response
) {
  return response.status(200).json({
    status: "success",
    message: "Administrator access granted",
    data: {
      user: request.user,
    },
  });
}
