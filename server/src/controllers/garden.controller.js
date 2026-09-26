import {
  getGarden,
  createGarden,
  updateGarden,
} from "../services/garden.service.js";
import * as gardenService from "../services/garden.service.js";

function validateGardenDetails(name, description) {
  if (typeof name === "string" && name.trim().length > 100) {
    return "El nombre del jardín debe tener como máximo 100 caracteres.";
  }
  if (description !== undefined && description !== null) {
    if (typeof description !== "string") return "La descripción debe ser texto o estar vacía.";
    if (description.length > 500) return "La descripción del jardín debe tener como máximo 500 caracteres.";
  }
  return null;
}

export async function getMyGarden(request, response, next) {
  try {
    const garden = await getGarden(
      request.supabase,
      request.user.id
    );

    if (!garden) {
      return response.status(404).json({
        status: "error",
        message: "No se encontró tu jardín. Créalo desde Perfil y jardín para continuar.",
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

    const validationError = validateGardenDetails(name, description);
    if (validationError) {
      return response.status(400).json({ status: "error", message: validationError });
    }

    if (
      typeof name !== "string" ||
      name.trim().length === 0
    ) {
      return response.status(400).json({
        status: "error",
        message: "Escribe el nombre del jardín; no puede contener solo espacios.",
      });
    }

    if (typeof isPublic !== "boolean") {
      return response.status(400).json({
        status: "error",
        message: "Selecciona si tu jardín será público o privado.",
      });
    }

    const existingGarden = await getGarden(
      request.supabase,
      request.user.id
    );

    if (existingGarden) {
      return response.status(409).json({
        status: "error",
        message: "Ya tienes un jardín. Puedes modificarlo desde Perfil y jardín.",
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

    const validationError = validateGardenDetails(name, description);
    if (validationError) {
      return response.status(400).json({ status: "error", message: validationError });
    }

    if (
      name !== undefined &&
      (typeof name !== "string" || name.trim().length === 0)
    ) {
      return response.status(400).json({
        status: "error",
        message: "Escribe el nombre del jardín; no puede contener solo espacios.",
      });
    }

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      return response.status(400).json({
        status: "error",
        message: "La descripción debe ser texto o estar vacía.",
      });
    }

    if (
      isPublic !== undefined &&
      typeof isPublic !== "boolean"
    ) {
      return response.status(400).json({
        status: "error",
        message: "Selecciona si tu jardín será público o privado.",
      });
    }

    const existingGarden = await getGarden(
      request.supabase,
      request.user.id
    );

    if (!existingGarden) {
      return response.status(404).json({
        status: "error",
        message: "No se encontró tu jardín. Créalo desde Perfil y jardín para continuar.",
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

export async function deleteMyGarden(request, response, next) {
  try {
    const deleted = await gardenService.deleteGarden(
      request.supabase,
      request.user.id
    );

    if (!deleted) {
      return response.status(404).json({
        status: "error",
        message: "No se encontró tu jardín. Créalo desde Perfil y jardín para continuar.",
      });
    }

    return response.status(200).json({
      status: "success",
      message: "Garden deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
}
