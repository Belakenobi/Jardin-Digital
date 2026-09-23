import {
  beforeAll,
  describe,
  expect,
  test,
} from "@jest/globals";
import request from "supertest";

let app;

beforeAll(async () => {
  process.env.SUPABASE_URL = "http://127.0.0.1:54321";
  process.env.SUPABASE_PUBLISHABLE_KEY = "test-publishable-key";

  ({ default: app } = await import("../../src/app.js"));
});

describe("GET /api/health", () => {
  test("responds with the API health status", async () => {
    const response = await request(app)
      .get("/api/health")
      .expect(200);

    expect(response.body).toEqual({
      status: "ok",
      message: "Digital Garden API is running",
    });
  });
});
