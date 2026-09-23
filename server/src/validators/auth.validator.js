const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email) {
  if (typeof email !== "string" || email.trim() === "") {
    return "Escribe tu correo electrónico.";
  }

  if (!EMAIL_PATTERN.test(email.trim())) {
    return "Escribe un correo electrónico válido, por ejemplo nombre@dominio.com.";
  }

  return null;
}

function validatePassword(password) {
  if (typeof password !== "string" || password.trim() === "") {
    return "Escribe tu contraseña.";
  }

  if (password.length < 8) {
    return "La contraseña debe tener al menos 8 caracteres.";
  }

  return null;
}

function validateDisplayName(displayName) {
  if (typeof displayName !== "string" || displayName.trim() === "") {
    return "Escribe tu nombre; no puede contener solo espacios.";
  }

  if (displayName.trim().length > 80) {
    return "El nombre debe tener como máximo 80 caracteres.";
  }

  return null;
}

export function validateRegistration(body = {}) {
  const errors = {};

  const emailError = validateEmail(body.email);
  const passwordError = validatePassword(body.password);
  const displayNameError = validateDisplayName(body.displayName);

  if (emailError) {
    errors.email = emailError;
  }

  if (passwordError) {
    errors.password = passwordError;
  }

  if (displayNameError) {
    errors.displayName = displayNameError;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: {
      email: typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "",
      password: typeof body.password === "string"
        ? body.password
        : "",
      displayName: typeof body.displayName === "string"
        ? body.displayName.trim()
        : "",
    },
  };
}

export function validateLogin(body = {}) {
  const errors = {};

  const emailError = validateEmail(body.email);

  if (emailError) {
    errors.email = emailError;
  }

  if (
    typeof body.password !== "string" ||
    body.password.trim() === ""
  ) {
    errors.password = "Escribe tu contraseña.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: {
      email: typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "",
      password: typeof body.password === "string"
        ? body.password
        : "",
    },
  };
}
