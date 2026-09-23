import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";
import request from "supertest";

const createSupabaseClient = jest.fn();
const databaseClient = { from: jest.fn() };
const publicClient = { marker: "public-test-client" };

const getGarden = jest.fn();
const createGarden = jest.fn();
const updateGarden = jest.fn();
const getNotes = jest.fn();
const createNote = jest.fn();
const getNoteById = jest.fn();
const updateNote = jest.fn();
const deleteNote = jest.fn();
const createRelation = jest.fn();
const getRelationsForNote = jest.fn();
const deleteRelation = jest.fn();
const createGalleryImageService = jest.fn();
const getGalleryImagesService = jest.fn();
const updateGalleryImageService = jest.fn();
const deleteGalleryImageService = jest.fn();
const getPublicGardens = jest.fn();
const getPublicGarden = jest.fn();

jest.unstable_mockModule("../../src/config/supabase.js", () => ({
  createSupabaseClient,
  default: databaseClient,
}));
jest.unstable_mockModule("../../src/services/garden.service.js", () => ({
  getGarden,
  createGarden,
  updateGarden,
}));
jest.unstable_mockModule("../../src/services/note.service.js", () => ({
  getNotes,
  createNote,
  getNoteById,
  updateNote,
  deleteNote,
}));
jest.unstable_mockModule("../../src/services/relation.service.js", () => ({
  createRelation,
  getRelationsForNote,
  deleteRelation,
}));
jest.unstable_mockModule("../../src/services/gallery.service.js", () => ({
  createGalleryImageService,
  getGalleryImagesService,
  updateGalleryImageService,
  deleteGalleryImageService,
}));
jest.unstable_mockModule("../../src/services/public.service.js", () => ({
  getPublicGardens,
  getPublicGarden,
}));

let app;

beforeAll(async () => {
  ({ default: app } = await import("../../src/app.js"));
});

function createProfileClient(role = "user") {
  return {
    marker: "scoped-client",
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: "user-1",
              display_name: "Isabella",
              role,
            },
            error: null,
          }),
        }),
      }),
    }),
  };
}

function authenticateRequests(role = "user") {
  const getUser = jest.fn().mockResolvedValue({
    data: { user: { id: "user-1", email: "name@example.com" } },
    error: null,
  });
  const scopedClient = createProfileClient(role);
  createSupabaseClient.mockImplementation((accessToken) => (
    accessToken ? scopedClient : { auth: { getUser } }
  ));
  return scopedClient;
}

describe("representative HTTP CRUD integration", () => {
  beforeEach(() => {
    for (const mock of [
      createSupabaseClient,
      getGarden, createGarden, updateGarden,
      getNotes, createNote, getNoteById, updateNote, deleteNote,
      createRelation, getRelationsForNote, deleteRelation,
      createGalleryImageService, getGalleryImagesService,
      updateGalleryImageService, deleteGalleryImageService,
      getPublicGardens, getPublicGarden,
    ]) {
      mock.mockReset();
    }
    createSupabaseClient.mockReturnValue(publicClient);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("POST /api/garden connects auth, route and creation controller", async () => {
    const scopedClient = authenticateRequests();
    const garden = { id: "garden-1", name: "Mi jardín", isPublic: false };
    getGarden.mockResolvedValue(null);
    createGarden.mockResolvedValue(garden);

    const response = await request(app)
      .post("/api/garden")
      .set("Authorization", "Bearer valid-token")
      .send({ name: "  Mi jardín  " })
      .expect(201);

    expect(createGarden).toHaveBeenCalledWith(scopedClient, "user-1", {
      name: "Mi jardín",
      description: null,
      isPublic: false,
    });
    expect(response.body).toEqual({
      status: "success",
      message: "Garden created successfully",
      garden,
    });
  });

  test("GET /api/notes connects auth, query filter and listing controller", async () => {
    const scopedClient = authenticateRequests();
    const notes = [{ id: "note-1", maturity: "tree" }];
    getNotes.mockResolvedValue(notes);

    const response = await request(app)
      .get("/api/notes?maturity=tree")
      .set("Authorization", "Bearer valid-token")
      .expect(200);

    expect(getNotes).toHaveBeenCalledWith(scopedClient, "user-1", "tree");
    expect(response.body).toEqual({ status: "success", notes });
  });

  test("POST /api/relations connects auth, body and relation controller", async () => {
    const scopedClient = authenticateRequests();
    const relation = {
      id: "relation-1",
      sourceNoteId: "source-1",
      targetNoteId: "target-1",
    };
    createRelation.mockResolvedValue({ status: "created", relation });

    const response = await request(app)
      .post("/api/relations")
      .set("Authorization", "Bearer valid-token")
      .send({ sourceNoteId: "source-1", targetNoteId: "target-1" })
      .expect(201);

    expect(createRelation).toHaveBeenCalledWith(
      scopedClient,
      "user-1",
      "source-1",
      "target-1"
    );
    expect(response.body.relation).toEqual(relation);
  });

  test("POST /api/gallery accepts PNG multipart data and reaches the controller", async () => {
    const scopedClient = authenticateRequests();
    const image = { id: "image-1", description: "Diagrama", noteId: "note-1" };
    createGalleryImageService.mockResolvedValue(image);

    const response = await request(app)
      .post("/api/gallery")
      .set("Authorization", "Bearer valid-token")
      .field("description", "Diagrama")
      .field("noteId", "note-1")
      .attach("image", Buffer.from("local-image"), {
        filename: "diagram.png",
        contentType: "image/png",
      })
      .expect(201);

    expect(createGalleryImageService).toHaveBeenCalledWith(expect.objectContaining({
      supabase: scopedClient,
      userId: "user-1",
      description: "Diagrama",
      noteId: "note-1",
      file: expect.objectContaining({
        originalname: "diagram.png",
        mimetype: "image/png",
        buffer: expect.any(Buffer),
      }),
    }));
    expect(response.body).toEqual({ status: "success", data: image });
  });

  test("POST /api/gallery rejects a disallowed MIME before the service", async () => {
    authenticateRequests();
    jest.spyOn(console, "error").mockImplementation(() => {});

    const response = await request(app)
      .post("/api/gallery")
      .set("Authorization", "Bearer valid-token")
      .attach("image", Buffer.from("plain text"), {
        filename: "notes.txt",
        contentType: "text/plain",
      })
      .expect(400);

    expect(createGalleryImageService).not.toHaveBeenCalled();
    expect(response.body).toEqual({
      status: "error",
      message: "Solo se permiten imágenes JPG, PNG o WEBP.",
    });
  });

  test("GET /api/public/gardens connects the public route without authentication", async () => {
    const gardens = [{ id: "garden-1", name: "Jardín público" }];
    getPublicGardens.mockResolvedValue(gardens);

    const response = await request(app)
      .get("/api/public/gardens")
      .expect(200);

    expect(getPublicGardens).toHaveBeenCalledTimes(1);
    expect(response.body).toEqual({
      status: "success",
      data: { gardens },
    });
  });

  test("GET /api/public/gardens/:id preserves the public 404 contract", async () => {
    getPublicGarden.mockResolvedValue(null);

    const response = await request(app)
      .get("/api/public/gardens/private-garden")
      .expect(404);

    expect(getPublicGarden).toHaveBeenCalledWith(
      publicClient,
      "private-garden"
    );
    expect(response.body).toEqual({
      status: "error",
      message: "Este jardín no está disponible o ya no es público.",
    });
  });
});
