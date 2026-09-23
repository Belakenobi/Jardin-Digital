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

const databaseFrom = jest.fn();
const createSupabaseClient = jest.fn();

jest.unstable_mockModule("../../src/config/supabase.js", () => ({
  createSupabaseClient,
  default: { from: databaseFrom },
}));

let app;

beforeAll(async () => {
  ({ default: app } = await import("../../src/app.js"));
});

function mockDatabaseResult(result) {
  const limit = jest.fn().mockResolvedValue(result);
  const select = jest.fn().mockReturnValue({ limit });
  databaseFrom.mockReturnValue({ select });
  return { select, limit };
}

describe("base HTTP behavior", () => {
  beforeEach(() => {
    databaseFrom.mockReset();
    createSupabaseClient.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("GET /api/health/database reports a successful database check", async () => {
    const query = mockDatabaseResult({ error: null });

    const response = await request(app)
      .get("/api/health/database")
      .expect(200);

    expect(databaseFrom).toHaveBeenCalledWith("profiles");
    expect(query.select).toHaveBeenCalledWith("id");
    expect(query.limit).toHaveBeenCalledWith(1);
    expect(response.body).toEqual({
      status: "ok",
      message: "Database connection successful",
    });
  });

  test("GET /api/health/database reports a provider error as unavailable", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    mockDatabaseResult({ error: { message: "Provider unavailable" } });

    const response = await request(app)
      .get("/api/health/database")
      .expect(503);

    expect(consoleError).toHaveBeenCalledWith(
      "Database health check failed:",
      "Provider unavailable"
    );
    expect(response.body).toEqual({
      status: "error",
      message: "Database connection failed",
    });
  });

  test("GET /api/health/database hides unexpected failure details", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    databaseFrom.mockImplementation(() => {
      throw new Error("Private connection details");
    });

    const response = await request(app)
      .get("/api/health/database")
      .expect(500);

    expect(consoleError).toHaveBeenCalledWith(
      "Unexpected database error:",
      "Private connection details"
    );
    expect(response.body).toEqual({
      status: "error",
      message: "Unexpected server error",
    });
  });

  test("an unknown API route returns the JSON 404 contract", async () => {
    const response = await request(app)
      .get("/api/does-not-exist")
      .expect(404);

    expect(response.body).toEqual({
      status: "error",
      message: "Endpoint not found",
    });
    expect(response.headers["x-powered-by"]).toBeUndefined();
  });

  test("malformed JSON reaches the shared error middleware", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});

    const response = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send('{"email":')
      .expect(400);

    expect(response.body).toEqual({
      status: "error",
      message: "No se pudieron leer los datos enviados. Revisa el formulario e inténtalo de nuevo.",
    });
  });

  test("CORS answers a configured-origin preflight cleanly", async () => {
    const response = await request(app)
      .options("/api/health")
      .set("Origin", "http://localhost:5173")
      .set("Access-Control-Request-Method", "GET")
      .expect(204);

    expect(response.headers["access-control-allow-origin"])
      .toBe("http://localhost:5173");
    expect(response.headers["access-control-allow-methods"])
      .toBe("GET,POST,PATCH,DELETE");
  });
});
