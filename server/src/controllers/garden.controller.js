import {
  getGarden,
  createGarden,
  updateGarden,
} from "../services/garden.service.js";

export async function getMyGarden(request, response, next) {
  try {
    const garden = await getGarden(
      request.supabase,
      request.user.id
    );

    if (!garden) {
      return response.status(404).json({
        status: "error",
        message: "Garden not found",
      });
    }

    return response.status(200).json({
      status: "success",
      garden,
    });
  } catch (error) {
    return next(error);
  }
}

export async function createMyGarden(request, response, next) {
  try {
    const {
      name,
      description = null,
      isPublic = false,
    } = request.body;

    if (
      typeof name !== "string" ||
      name.trim().length === 0
    ) {
      return response.status(400).json({
        status: "error",
        message: "Garden name is required",
      });
    }

    if (typeof isPublic !== "boolean") {
      return response.status(400).json({
        status: "error",
        message: "isPublic must be a boolean",
      });
    }

    const existingGarden = await getGarden(
      request.supabase,
      request.user.id
    );

    if (existingGarden) {
      return response.status(409).json({
        status: "error",
        message: "User already has a garden",
      });
    }

    const garden = await createGarden(
      request.supabase,
      request.user.id,
      {
        name: name.trim(),
        description,
        isPublic,
      }
    );

    return response.status(201).json({
      status: "success",
      message: "Garden created successfully",
      garden,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateMyGarden(request, response, next) {
  try {
    const { name, description, isPublic } = request.body;

    if (
      name !== undefined &&
      (typeof name !== "string" || name.trim().length === 0)
    ) {
      return response.status(400).json({
        status: "error",
        message: "Garden name must be a non-empty string",
      });
    }

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      return response.status(400).json({
        status: "error",
        message: "description must be a string or null",
      });
    }

    if (
      isPublic !== undefined &&
      typeof isPublic !== "boolean"
    ) {
      return response.status(400).json({
        status: "error",
        message: "isPublic must be a boolean",
      });
    }

    const existingGarden = await getGarden(
      request.supabase,
      request.user.id
    );

    if (!existingGarden) {
      return response.status(404).json({
        status: "error",
        message: "Garden not found",
      });
    }

    const garden = await updateGarden(
      request.supabase,
      request.user.id,
      {
        name:
          typeof name === "string"
            ? name.trim()
            : undefined,
        description,
        isPublic,
      }
    );

    return response.status(200).json({
      status: "success",
      message: "Garden updated successfully",
      garden,
    });
  } catch (error) {
    return next(error);
  }
}
