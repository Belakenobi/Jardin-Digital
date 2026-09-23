import {
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";

import {
  createGarden,
  getGarden,
  updateGarden,
} from "../../src/services/garden.service.js";

const gardenRow = {
  id: "garden-1",
  user_id: "user-1",
  name: "Mi jardín",
  description: "Notas de estudio",
  is_public: true,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-02-01T00:00:00.000Z",
};

const expectedGarden = {
  id: "garden-1",
  userId: "user-1",
  name: "Mi jardín",
  description: "Notas de estudio",
  isPublic: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-02-01T00:00:00.000Z",
};

function createGetBuilder(result) {
  const maybeSingle = jest.fn().mockResolvedValue(result);
  const eq = jest.fn().mockReturnValue({ maybeSingle });
  const select = jest.fn().mockReturnValue({ eq });

  return { select, eq, maybeSingle };
}

function expectGetQuery(builder, userId = "user-1") {
  expect(builder.select).toHaveBeenCalledWith(
    "id, user_id, name, description, is_public, created_at, updated_at"
  );
  expect(builder.eq).toHaveBeenCalledWith("user_id", userId);
  expect(builder.maybeSingle).toHaveBeenCalledTimes(1);
}

describe("garden service", () => {
  test("gets the owner's garden and transforms database fields", async () => {
    const builder = createGetBuilder({ data: gardenRow, error: null });
    const from = jest.fn().mockReturnValue(builder);

    await expect(getGarden({ from }, "user-1")).resolves.toEqual(expectedGarden);

    expect(from).toHaveBeenCalledWith("gardens");
    expectGetQuery(builder);
  });

  test("returns null when the owner does not have a garden", async () => {
    const builder = createGetBuilder({ data: null, error: null });
    const from = jest.fn().mockReturnValue(builder);

    await expect(getGarden({ from }, "user-1")).resolves.toBeNull();
    expectGetQuery(builder);
  });

  test("throws the Supabase get-garden error unchanged", async () => {
    const error = { code: "42501", message: "Read denied" };
    const builder = createGetBuilder({ data: null, error });
    const from = jest.fn().mockReturnValue(builder);

    await expect(getGarden({ from }, "user-1")).rejects.toBe(error);
  });

  test("creates a garden for the owner and returns the reloaded garden", async () => {
    const insert = jest.fn().mockResolvedValue({ error: null });
    const getBuilder = createGetBuilder({ data: gardenRow, error: null });
    const from = jest.fn()
      .mockReturnValueOnce({ insert })
      .mockReturnValueOnce(getBuilder);

    await expect(createGarden({ from }, "user-1", {
      name: "Mi jardín",
      description: "Notas de estudio",
      isPublic: true,
    })).resolves.toEqual(expectedGarden);

    expect(from).toHaveBeenNthCalledWith(1, "gardens");
    expect(insert).toHaveBeenCalledWith({
      user_id: "user-1",
      name: "Mi jardín",
      description: "Notas de estudio",
      is_public: true,
    });
    expect(from).toHaveBeenNthCalledWith(2, "gardens");
    expectGetQuery(getBuilder);
  });

  test("throws an insert error without attempting to reload the garden", async () => {
    const error = { code: "23505", message: "Garden already exists" };
    const insert = jest.fn().mockResolvedValue({ error });
    const from = jest.fn().mockReturnValue({ insert });

    await expect(createGarden({ from }, "user-1", {
      name: "Mi jardín",
      description: null,
      isPublic: false,
    })).rejects.toBe(error);

    expect(from).toHaveBeenCalledTimes(1);
  });

  test("updates every supplied garden field and returns the reloaded garden", async () => {
    const updateEq = jest.fn().mockResolvedValue({ error: null });
    const update = jest.fn().mockReturnValue({ eq: updateEq });
    const updatedRow = {
      ...gardenRow,
      name: "Jardín actualizado",
      description: null,
      is_public: false,
    };
    const getBuilder = createGetBuilder({ data: updatedRow, error: null });
    const from = jest.fn()
      .mockReturnValueOnce({ update })
      .mockReturnValueOnce(getBuilder);

    await expect(updateGarden({ from }, "user-1", {
      name: "Jardín actualizado",
      description: null,
      isPublic: false,
    })).resolves.toEqual({
      ...expectedGarden,
      name: "Jardín actualizado",
      description: null,
      isPublic: false,
    });

    expect(update).toHaveBeenCalledWith({
      name: "Jardín actualizado",
      description: null,
      is_public: false,
    });
    expect(updateEq).toHaveBeenCalledWith("user_id", "user-1");
    expectGetQuery(getBuilder);
  });

  test("omits undefined garden fields from a partial update", async () => {
    const updateEq = jest.fn().mockResolvedValue({ error: null });
    const update = jest.fn().mockReturnValue({ eq: updateEq });
    const updatedRow = { ...gardenRow, name: "Solo nombre" };
    const getBuilder = createGetBuilder({ data: updatedRow, error: null });
    const from = jest.fn()
      .mockReturnValueOnce({ update })
      .mockReturnValueOnce(getBuilder);

    await updateGarden({ from }, "user-1", {
      name: "Solo nombre",
      description: undefined,
      isPublic: undefined,
    });

    expect(update).toHaveBeenCalledWith({ name: "Solo nombre" });
    expect(updateEq).toHaveBeenCalledWith("user_id", "user-1");
  });

  test("throws an update error without attempting to reload the garden", async () => {
    const error = { code: "42501", message: "Update denied" };
    const updateEq = jest.fn().mockResolvedValue({ error });
    const update = jest.fn().mockReturnValue({ eq: updateEq });
    const from = jest.fn().mockReturnValue({ update });

    await expect(updateGarden({ from }, "user-1", {
      description: "Nueva descripción",
    })).rejects.toBe(error);

    expect(update).toHaveBeenCalledWith({
      description: "Nueva descripción",
    });
    expect(updateEq).toHaveBeenCalledWith("user_id", "user-1");
    expect(from).toHaveBeenCalledTimes(1);
  });
});
