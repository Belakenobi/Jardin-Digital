import { jest } from "@jest/globals";

export function createResponse() {
  const response = {
    status: jest.fn(),
    json: jest.fn(),
  };

  response.status.mockReturnValue(response);
  response.json.mockReturnValue(response);

  return response;
}

export function createRequest(overrides = {}) {
  return {
    body: {},
    params: {},
    query: {},
    user: { id: "user-1" },
    supabase: { scope: "mock-user-client" },
    ...overrides,
  };
}
