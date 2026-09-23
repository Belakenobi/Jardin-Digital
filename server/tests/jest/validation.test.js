import {
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";

import {
  validateLogin,
  validateRegistration,
} from "../../src/validators/auth.validator.js";
import { updateMyProfile } from "../../src/controllers/profile.controller.js";
import {
  createMyGarden,
  updateMyGarden,
} from "../../src/controllers/garden.controller.js";
import {
  createMyNote,
  getMyNotes,
  updateMyNote,
} from "../../src/controllers/note.controller.js";
import {
  createGalleryImage,
  updateGalleryImage,
} from "../../src/controllers/gallery.controller.js";
import { createMyRelation } from "../../src/controllers/relation.controller.js";

function createResponse() {
  const response = {
    status: jest.fn(),
    json: jest.fn(),
  };

  response.status.mockReturnValue(response);
  response.json.mockReturnValue(response);

  return response;
}

const forbiddenSupabase = new Proxy({}, {
  get(_target, property) {
    throw new Error(`Validation accessed Supabase through ${String(property)}`);
  },
});

async function expectEarlyRejection({
  controller,
  body = {},
  message,
  request = {},
}) {
  const response = createResponse();
  const next = jest.fn();

  await controller({
    body,
    file: {},
    params: {},
    query: {},
    user: { id: "test-user" },
    supabase: forbiddenSupabase,
    ...request,
  }, response, next);

  expect(response.status).toHaveBeenCalledWith(400);
  expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
    status: "error",
    message: expect.stringMatching(message),
  }));
  expect(next).not.toHaveBeenCalled();
}

describe("auth validators", () => {
  test("accepts and normalizes a valid registration at documented boundaries", () => {
    const result = validateRegistration({
      email: " NAME@example.com ",
      password: "12345678",
      displayName: ` ${"a".repeat(80)} `,
    });

    expect(result).toEqual({
      isValid: true,
      errors: {},
      data: {
        email: "name@example.com",
        password: "12345678",
        displayName: "a".repeat(80),
      },
    });
  });

  test("reports every missing registration field and normalizes it safely", () => {
    expect(validateRegistration()).toEqual({
      isValid: false,
      errors: {
        email: "Escribe tu correo electrónico.",
        password: "Escribe tu contraseña.",
        displayName: "Escribe tu nombre; no puede contener solo espacios.",
      },
      data: {
        email: "",
        password: "",
        displayName: "",
      },
    });
  });

  test("rejects incorrect registration field types", () => {
    const result = validateRegistration({
      email: 42,
      password: [],
      displayName: {},
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual({
      email: "Escribe tu correo electrónico.",
      password: "Escribe tu contraseña.",
      displayName: "Escribe tu nombre; no puede contener solo espacios.",
    });
    expect(result.data).toEqual({
      email: "",
      password: "",
      displayName: "",
    });
  });

  test("rejects blank registration strings", () => {
    const result = validateRegistration({
      email: "   ",
      password: "        ",
      displayName: "   ",
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.email).toMatch(/correo electrónico/);
    expect(result.errors.password).toMatch(/contraseña/);
    expect(result.errors.displayName).toMatch(/nombre/);
  });

  test("rejects a malformed registration email", () => {
    const result = validateRegistration({
      email: "invalid@",
      password: "12345678",
      displayName: "Isabella",
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual({
      email: expect.stringMatching(/correo electrónico válido/),
    });
  });

  test("rejects a registration password below eight characters", () => {
    const result = validateRegistration({
      email: "name@example.com",
      password: "1234567",
      displayName: "Isabella",
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual({
      password: expect.stringMatching(/al menos 8/),
    });
  });

  test("rejects a display name above eighty trimmed characters", () => {
    const result = validateRegistration({
      email: "name@example.com",
      password: "12345678",
      displayName: ` ${"a".repeat(81)} `,
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual({
      displayName: expect.stringMatching(/máximo 80/),
    });
  });

  test("accepts login without applying the registration password minimum", () => {
    expect(validateLogin({
      email: " NAME@example.com ",
      password: "short",
    })).toEqual({
      isValid: true,
      errors: {},
      data: {
        email: "name@example.com",
        password: "short",
      },
    });
  });

  test("reports missing login fields", () => {
    expect(validateLogin()).toEqual({
      isValid: false,
      errors: {
        email: "Escribe tu correo electrónico.",
        password: "Escribe tu contraseña.",
      },
      data: {
        email: "",
        password: "",
      },
    });
  });

  test("rejects incorrect login types and normalizes them safely", () => {
    expect(validateLogin({ email: {}, password: 12345678 })).toEqual({
      isValid: false,
      errors: {
        email: "Escribe tu correo electrónico.",
        password: "Escribe tu contraseña.",
      },
      data: {
        email: "",
        password: "",
      },
    });
  });

  test("rejects malformed email and blank password during login", () => {
    const result = validateLogin({
      email: "invalid@",
      password: "   ",
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.email).toMatch(/correo electrónico válido/);
    expect(result.errors.password).toMatch(/contraseña/);
  });
});

describe("controller validation rejects before services or storage", () => {
  const cases = [
    ["missing profile name", updateMyProfile, {}, /Escribe tu nombre/],
    ["non-text profile name", updateMyProfile, { displayName: 12 }, /Escribe tu nombre/],
    ["blank profile name", updateMyProfile, { displayName: "  " }, /Escribe tu nombre/],
    ["long profile name", updateMyProfile, { displayName: "a".repeat(81) }, /máximo 80/],

    ["missing garden name", createMyGarden, {}, /nombre del jardín/],
    ["non-text garden name", createMyGarden, { name: 12 }, /nombre del jardín/],
    ["blank garden name", createMyGarden, { name: " " }, /nombre del jardín/],
    ["long garden name", createMyGarden, { name: "a".repeat(101) }, /máximo 100/],
    ["long garden description", createMyGarden, { name: "Jardín", description: "a".repeat(501) }, /máximo 500/],
    ["non-text garden description", createMyGarden, { name: "Jardín", description: {} }, /descripción debe ser texto/],
    ["non-boolean garden visibility", createMyGarden, { name: "Jardín", isPublic: "yes" }, /público o privado/],
    ["blank updated garden name", updateMyGarden, { name: " " }, /nombre del jardín/],
    ["non-text updated garden name", updateMyGarden, { name: 12 }, /nombre del jardín/],
    ["long updated garden name", updateMyGarden, { name: "a".repeat(101) }, /máximo 100/],
    ["long updated garden description", updateMyGarden, { description: "a".repeat(501) }, /máximo 500/],
    ["non-text updated garden description", updateMyGarden, { description: {} }, /descripción debe ser texto/],
    ["non-boolean updated garden visibility", updateMyGarden, { isPublic: "yes" }, /público o privado/],

    ["missing note title", createMyNote, {}, /título de la nota/],
    ["non-text note title", createMyNote, { title: 12 }, /título de la nota/],
    ["blank note title", createMyNote, { title: "  " }, /título de la nota/],
    ["long note title", createMyNote, { title: "a".repeat(201) }, /máximo 200/],
    ["non-text note content", createMyNote, { title: "Nota", content: {} }, /contenido de la nota debe ser texto/],
    ["invalid note maturity", createMyNote, { title: "Nota", maturity: "invalid" }, /Semilla, Brote o Árbol/],
    ["blank updated note title", updateMyNote, { title: "  " }, /título de la nota/],
    ["non-text updated note title", updateMyNote, { title: 12 }, /título de la nota/],
    ["long updated note title", updateMyNote, { title: "a".repeat(201) }, /máximo 200/],
    ["non-text updated note content", updateMyNote, { content: {} }, /contenido de la nota debe ser texto/],
    ["invalid updated note maturity", updateMyNote, { maturity: "invalid" }, /Semilla, Brote o Árbol/],

    ["long image description", createGalleryImage, { description: "a".repeat(1001) }, /máximo 1000/],
    ["non-text image description", createGalleryImage, { description: {} }, /descripción debe ser texto/],
    ["invalid image note", createGalleryImage, { noteId: [] }, /Selecciona una nota válida/],
    ["long updated image description", updateGalleryImage, { description: "a".repeat(1001) }, /máximo 1000/],
    ["non-text updated image description", updateGalleryImage, { description: {} }, /descripción debe ser texto/],
    ["invalid updated image note", updateGalleryImage, { noteId: [] }, /Selecciona una nota válida/],

    ["missing relation source", createMyRelation, {}, /nota de origen/],
    ["non-text relation source", createMyRelation, { sourceNoteId: [] }, /nota de origen/],
    ["blank relation source", createMyRelation, { sourceNoteId: "  " }, /nota de origen/],
    ["missing relation target", createMyRelation, { sourceNoteId: "source" }, /nota de destino/],
    ["non-text relation target", createMyRelation, { sourceNoteId: "source", targetNoteId: {} }, /nota de destino/],
    ["blank relation target", createMyRelation, { sourceNoteId: "source", targetNoteId: "  " }, /nota de destino/],
  ];

  test.each(cases)("rejects %s", async (_name, controller, body, message) => {
    await expectEarlyRejection({ controller, body, message });
  });

  test("rejects an invalid notes filter before reading Supabase", async () => {
    await expectEarlyRejection({
      controller: getMyNotes,
      message: /Semilla, Brote o Árbol/,
      request: { query: { maturity: "invalid" } },
    });
  });

  test("requires an image before validating gallery metadata", async () => {
    await expectEarlyRejection({
      controller: createGalleryImage,
      message: /Selecciona una imagen/,
      request: { file: undefined },
    });
  });
});
