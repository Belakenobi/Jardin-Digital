import { createSupabaseClient } from "../config/supabase.js";

function getBearerToken(request) {
  const authorizationHeader = request.get("authorization");

  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader
    .trim()
    .split(/\s+/);

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

export async function authenticate(request, response, next) {
  const accessToken = getBearerToken(request);

  if (!accessToken) {
    return response.status(401).json({
      status: "error",
      message: "Inicia sesión para continuar.",
    });
  }

  try {
    const supabaseAuth = createSupabaseClient();

    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser(accessToken);

    if (authError || !user) {
      return response.status(401).json({
        status: "error",
        message: "Tu sesión ha expirado. Inicia sesión nuevamente.",
      });
    }

    const supabaseUser = createSupabaseClient(accessToken);

    const { data: profile, error: profileError } =
      await supabaseUser
        .from("profiles")
        .select("id, display_name, role")
        .eq("id", user.id)
        .single();

    if (profileError || !profile) {
      console.error(
        "Authenticated user profile was not available:",
        profileError?.message
      );

      return response.status(403).json({
        status: "error",
        message: "No se pudo acceder a tu perfil. Intenta iniciar sesión nuevamente.",
      });
    }

    request.user = {
      id: user.id,
      email: user.email,
      displayName: profile.display_name,
      role: profile.role,
    };

    request.supabase = supabaseUser;

    return next();

  } catch (error) {
    return next(error);
  }
}

export function authorizeRoles(...allowedRoles) {
  return (request, response, next) => {
    if (!request.user) {
      return response.status(401).json({
        status: "error",
        message: "Inicia sesión para continuar.",
      });
    }

    if (!allowedRoles.includes(request.user.role)) {
      return response.status(403).json({
        status: "error",
        message: "No tienes permiso para realizar esta acción.",
      });
    }

    return next();
  };
}
