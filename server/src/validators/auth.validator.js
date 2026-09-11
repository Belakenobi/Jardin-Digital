const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email) {
  if (typeof email !== "string" || email.trim() === "") {
    return "Email is required";
  }

  if (!EMAIL_PATTERN.test(email.trim())) {
    return "Email format is invalid";
  }

  return null;
}

function validatePassword(password) {
  if (typeof password !== "string" || password === "") {
    return "Password is required";
  }

  if (password.length < 8) {
    return "Password must contain at least 8 characters";
  }

  return null;
}

function validateDisplayName(displayName) {
  if (typeof displayName !== "string" || displayName.trim() === "") {
    return "Display name is required";
  }

  if (displayName.trim().length > 80) {
    return "Display name must contain 80 characters or fewer";
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
    body.password === ""
  ) {
    errors.password = "Password is required";
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
