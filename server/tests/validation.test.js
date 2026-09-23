import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateLogin, validateRegistration } from '../src/validators/auth.validator.js';
import { updateMyProfile } from '../src/controllers/profile.controller.js';
import { createMyGarden, updateMyGarden } from '../src/controllers/garden.controller.js';
import { createMyNote, updateMyNote } from '../src/controllers/note.controller.js';
import { createGalleryImage, updateGalleryImage } from '../src/controllers/gallery.controller.js';
import { createMyRelation } from '../src/controllers/relation.controller.js';
import { errorHandler } from '../src/middleware/error.middleware.js';

test('registration reports each invalid field and accepts the documented boundaries', () => {
  const invalid = validateRegistration({ email: 'invalid@', password: 'short', displayName: '   ' });
  assert.equal(invalid.isValid, false);
  assert.match(invalid.errors.email, /correo electrónico válido/);
  assert.match(invalid.errors.password, /al menos 8/);
  assert.match(invalid.errors.displayName, /nombre/);
  assert.equal(validateRegistration({ email: ' NAME@example.com ', password: '12345678', displayName: 'a'.repeat(80) }).isValid, true);
  assert.match(validateRegistration({ displayName: 'a'.repeat(81) }).errors.displayName, /máximo 80/);
  assert.match(validateRegistration({ password: '        ' }).errors.password, /contraseña/);
  assert.equal(validateLogin({ email: 'name@example.com', password: 'short' }).isValid, true);
});

function captureResponse() {
  return {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

const invalidForms = [
  ['empty profile name', updateMyProfile, { displayName: '  ' }, /Escribe tu nombre/],
  ['long profile name', updateMyProfile, { displayName: 'a'.repeat(81) }, /máximo 80/],
  ['empty garden name', createMyGarden, { name: ' ' }, /nombre del jardín/],
  ['long garden name', createMyGarden, { name: 'a'.repeat(101) }, /máximo 100/],
  ['long updated garden name', updateMyGarden, { name: 'a'.repeat(101) }, /máximo 100/],
  ['long garden description', createMyGarden, { name: 'Jardín', description: 'a'.repeat(501) }, /máximo 500/],
  ['long updated garden description', updateMyGarden, { description: 'a'.repeat(501) }, /máximo 500/],
  ['non-text garden description', createMyGarden, { name: 'Jardín', description: {} }, /descripción debe ser texto/],
  ['empty note title', createMyNote, { title: '  ' }, /título de la nota/],
  ['long note title', createMyNote, { title: 'a'.repeat(201) }, /máximo 200/],
  ['long updated note title', updateMyNote, { title: 'a'.repeat(201) }, /máximo 200/],
  ['invalid maturity', createMyNote, { title: 'Nota', maturity: 'invalid' }, /Semilla, Brote o Árbol/],
  ['non-text note content', updateMyNote, { content: {} }, /contenido de la nota debe ser texto/],
  ['long image description', createGalleryImage, { description: 'a'.repeat(1001) }, /máximo 1000/],
  ['long updated image description', updateGalleryImage, { description: 'a'.repeat(1001) }, /máximo 1000/],
  ['non-text image description', updateGalleryImage, { description: {} }, /descripción debe ser texto/],
  ['invalid associated note', updateGalleryImage, { noteId: [] }, /Selecciona una nota válida/],
  ['missing relation source', createMyRelation, {}, /nota de origen/],
  ['missing relation target', createMyRelation, { sourceNoteId: 'source' }, /nota de destino/],
];

for (const [name, controller, body, message] of invalidForms) {
  test(`rejects ${name} before accessing the database or storage`, async () => {
    const response = captureResponse();
    await controller({ body, file: {}, params: {}, user: { id: 'test-user' } }, response, (error) => {
      assert.fail(`Validation should have handled the request: ${error.message}`);
    });
    assert.equal(response.statusCode, 400);
    assert.match(response.body.message, message);
  });
}

test('missing image gets an actionable message', async () => {
  const response = captureResponse();
  await createGalleryImage({ body: {} }, response, assert.fail);
  assert.equal(response.statusCode, 400);
  assert.match(response.body.message, /Selecciona una imagen/);
});

test('middleware translates provider errors and hides unexpected server details', (t) => {
  t.mock.method(console, 'error', () => {});
  const cases = [
    [{ code: 'invalid_credentials', status: 400 }, 400, /correo o la contraseña/],
    [{ code: 'email_not_confirmed', status: 400 }, 403, /Confirma tu correo/],
    [{ code: 'user_already_exists', status: 422 }, 409, /Ya existe una cuenta/],
    [{ code: 'over_email_send_rate_limit', status: 429 }, 429, /Espera unos minutos/],
    [{ name: 'MulterError', code: 'LIMIT_FILE_SIZE' }, 400, /máximo 5 MB/],
    [{ code: '23505' }, 409, /ya existe/],
    [{ code: '23514' }, 400, /requisitos/],
    [{ type: 'entity.too.large', status: 413 }, 413, /demasiado grande/],
    [{ type: 'entity.parse.failed', status: 400 }, 400, /No se pudieron leer/],
    [{ __isAuthError: true, status: 400, message: 'Provider details' }, 400, /No se pudo verificar/],
    [new Error('Private database details'), 500, /Inténtalo de nuevo más tarde/],
  ];
  for (const [error, status, message] of cases) {
    const response = captureResponse();
    errorHandler(error, {}, response, () => {});
    assert.equal(response.statusCode, status);
    assert.match(response.body.message, message);
  }
});
