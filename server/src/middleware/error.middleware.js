export function errorHandler(error, _request, response, _next) {
  console.error("Request failed:", {
    name: error.name,
    message: error.message,
    status: error.status,
    statusCode: error.statusCode,
    code: error.code,
  });

  if (error.name === "MulterError") {
    const multerMessages = {
      LIMIT_FILE_SIZE: "La imagen debe pesar como máximo 5 MB.",
      LIMIT_UNEXPECTED_FILE: "Selecciona una sola imagen JPG, PNG o WEBP.",
    };

    return response.status(400).json({
      status: "error",
      message: multerMessages[error.code] ?? "No se pudo procesar la imagen. Selecciona un archivo JPG, PNG o WEBP de hasta 5 MB.",
    });
  }

  const knownErrors = {
    invalid_credentials: [400, "El correo o la contraseña son incorrectos. Revisa tus datos."],
    email_not_confirmed: [403, "Confirma tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada."],
    email_exists: [409, "Ya existe una cuenta con este correo. Inicia sesión o usa otro correo."],
    user_already_exists: [409, "Ya existe una cuenta con este correo. Inicia sesión o usa otro correo."],
    email_address_invalid: [400, "Escribe un correo electrónico válido, por ejemplo nombre@dominio.com."],
    weak_password: [400, "La contraseña no cumple los requisitos de seguridad. Usa una contraseña más larga que combine mayúsculas, minúsculas, números y símbolos."],
    signup_disabled: [403, "El registro de cuentas no está disponible en este momento. Inténtalo más tarde."],
    over_request_rate_limit: [429, "Has realizado demasiados intentos. Espera unos minutos antes de volver a intentarlo."],
    over_email_send_rate_limit: [429, "Se han solicitado demasiados correos. Espera unos minutos y revisa tu bandeja de entrada."],
    '23505': [409, "Este registro ya existe. Actualiza la página y revisa los datos."],
    '23514': [400, "Algún campo no cumple los requisitos. Revisa los valores y los límites de caracteres indicados."],
    '22P02': [400, "Uno de los valores seleccionados no es válido. Actualiza la página y vuelve a seleccionarlo."],
    '23503': [400, "El elemento asociado ya no está disponible. Actualiza la página y selecciona otro."],
    '42501': [403, "No tienes permiso para realizar esta acción."],
  };

  if (Object.hasOwn(knownErrors, error.code)) {
    const [status, message] = knownErrors[error.code];
    return response.status(status).json({ status: "error", message });
  }

  if (error.type === "entity.parse.failed") {
    return response.status(400).json({ status: "error", message: "No se pudieron leer los datos enviados. Revisa el formulario e inténtalo de nuevo." });
  }

  if (error.type === "entity.too.large") {
    return response.status(413).json({ status: "error", message: "El contenido es demasiado grande. Reduce su tamaño e inténtalo de nuevo." });
  }

  const errorStatus = error.statusCode ?? error.status;

  const isClientError =
    Number.isInteger(errorStatus) &&
    errorStatus >= 400 &&
    errorStatus < 500;

  const statusCode = isClientError
    ? errorStatus
    : 500;

  const message = !isClientError
    ? "No se pudo completar la solicitud. Inténtalo de nuevo más tarde."
    : error.__isAuthError
      ? "No se pudo verificar tu acceso. Revisa tus datos e inténtalo de nuevo más tarde."
      : error.message;

  return response.status(statusCode).json({
    status: "error",
    message,
  });
}
