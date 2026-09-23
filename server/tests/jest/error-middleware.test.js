import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";

import { errorHandler } from "../../src/middleware/error.middleware.js";

function createResponse() {
  const response = {
    status: jest.fn(),
    json: jest.fn(),
  };

  response.status.mockReturnValue(response);
  response.json.mockReturnValue(response);

  return response;
}

function handle(error) {
  const response = createResponse();

  errorHandler(error, {}, response, jest.fn());

  return {
    status: response.status.mock.calls[0][0],
    body: response.json.mock.calls[0][0],
  };
}

describe("errorHandler", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test.each([
    ["LIMIT_FILE_SIZE", /máximo 5 MB/],
    ["LIMIT_UNEXPECTED_FILE", /una sola imagen/],
    ["ANOTHER_MULTER_ERROR", /No se pudo procesar la imagen/],
  ])("translates Multer error %s", (code, message) => {
    expect(handle({ name: "MulterError", code })).toEqual({
      status: 400,
      body: {
        status: "error",
        message: expect.stringMatching(message),
      },
    });
  });

  test.each([
    ["invalid_credentials", 400, /correo o la contraseña/],
    ["email_not_confirmed", 403, /Confirma tu correo/],
    ["email_exists", 409, /Ya existe una cuenta/],
    ["user_already_exists", 409, /Ya existe una cuenta/],
    ["email_address_invalid", 400, /correo electrónico válido/],
    ["weak_password", 400, /requisitos de seguridad/],
    ["signup_disabled", 403, /registro de cuentas no está disponible/],
    ["over_request_rate_limit", 429, /demasiados intentos/],
    ["over_email_send_rate_limit", 429, /demasiados correos/],
    ["23505", 409, /registro ya existe/],
    ["23514", 400, /no cumple los requisitos/],
    ["22P02", 400, /valor.*no es válido/],
    ["23503", 400, /elemento asociado ya no está disponible/],
    ["42501", 403, /No tienes permiso/],
  ])("translates known provider code %s", (code, status, message) => {
    expect(handle({ code, message: "Provider details" })).toEqual({
      status,
      body: {
        status: "error",
        message: expect.stringMatching(message),
      },
    });
  });

  test("translates malformed JSON errors", () => {
    expect(handle({
      type: "entity.parse.failed",
      status: 400,
      message: "Parser details",
    })).toEqual({
      status: 400,
      body: {
        status: "error",
        message: expect.stringMatching(/No se pudieron leer los datos/),
      },
    });
  });

  test("translates oversized request errors", () => {
    expect(handle({
      type: "entity.too.large",
      status: 413,
      message: "Parser details",
    })).toEqual({
      status: 413,
      body: {
        status: "error",
        message: expect.stringMatching(/contenido es demasiado grande/),
      },
    });
  });

  test("uses statusCode for a generic client error and preserves its message", () => {
    expect(handle({ statusCode: 422, message: "Corrige el dato enviado." })).toEqual({
      status: 422,
      body: {
        status: "error",
        message: "Corrige el dato enviado.",
      },
    });
  });

  test("falls back to status for a generic client error", () => {
    expect(handle({ status: 404, message: "Resource not found" })).toEqual({
      status: 404,
      body: {
        status: "error",
        message: "Resource not found",
      },
    });
  });

  test("hides provider details from generic authentication errors", () => {
    const result = handle({
      __isAuthError: true,
      status: 401,
      message: "Private provider details",
    });

    expect(result.status).toBe(401);
    expect(result.body.message).toMatch(/No se pudo verificar tu acceso/);
    expect(result.body.message).not.toContain("Private provider details");
  });

  test.each([
    [new Error("Private database details")],
    [{ status: 500, message: "Private service details" }],
    [{ status: "400", message: "Invalid non-integer status" }],
    [{ status: 399, message: "Outside client range" }],
  ])("returns 500 and hides unexpected details", (error) => {
    const result = handle(error);

    expect(result.status).toBe(500);
    expect(result.body).toEqual({
      status: "error",
      message: "No se pudo completar la solicitud. Inténtalo de nuevo más tarde.",
    });
    expect(result.body.message).not.toContain(error.message);
  });
});
