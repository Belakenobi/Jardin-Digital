import { registerUser } from "../services/auth.service.js";
import { validateRegistration } from "../validators/auth.validator.js";

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

export async function register(request, response, next) {
  const validation = validateRegistration(request.body);

  if (!validation.isValid) {
    return response.status(400).json({
      status: "error",
      message: "Invalid registration data",
      errors: validation.errors,
    });
  }

  try {
    const { user, session } = await registerUser(validation.data);

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
