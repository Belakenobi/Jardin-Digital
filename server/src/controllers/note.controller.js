import {
  getNotes,
  createNote,
  getNoteById,
  updateNote,
  deleteNote,
} from "../services/note.service.js";

const VALID_MATURITY = [
  "seed",
  "budding",
  "tree",
];

export async function getMyNotes(
  request,
  response,
  next
) {
  try {
    const { maturity } = request.query;

    if (
      maturity !== undefined &&
      !VALID_MATURITY.includes(maturity)
    ) {
      return response.status(400).json({
        status: "error",
        message:
          "Selecciona una madurez válida: Semilla, Brote o Árbol.",
      });
    }

    const notes = await getNotes(
      request.supabase,
      request.user.id,
      maturity
    );

    if (notes === null) {
      return response.status(404).json({
        status: "error",
        message: "No se encontró tu jardín. Créalo desde Perfil y jardín para continuar.",
      });
    }

    return response.status(200).json({
      status: "success",
      notes,
    });
  } catch (error) {
    return next(error);
  }
}

export async function createMyNote(
  request,
  response,
  next
) {
  try {
    const {
      title,
      content = "",
      maturity = "seed",
    } = request.body;

    if (typeof title === "string" && title.trim().length > 200) {
      return response.status(400).json({
        status: "error",
        message: "El título de la nota debe tener como máximo 200 caracteres.",
      });
    }

    if (
      typeof title !== "string" ||
      title.trim().length === 0
    ) {
      return response.status(400).json({
        status: "error",
        message: "Escribe el título de la nota; no puede contener solo espacios.",
      });
    }

    if (typeof content !== "string") {
      return response.status(400).json({
        status: "error",
        message: "El contenido de la nota debe ser texto.",
      });
    }

    if (!VALID_MATURITY.includes(maturity)) {
      return response.status(400).json({
        status: "error",
        message:
          "Selecciona una madurez válida: Semilla, Brote o Árbol.",
      });
    }

    const note = await createNote(
      request.supabase,
      request.user.id,
      {
        title: title.trim(),
        content,
        maturity,
      }
    );

    if (!note) {
      return response.status(404).json({
        status: "error",
        message:
          "Crea tu jardín desde Perfil y jardín antes de agregar notas.",
      });
    }

    return response.status(201).json({
      status: "success",
      message: "Note created successfully",
      note,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getMyNoteById(
  request,
  response,
  next
) {
  try {
    const note = await getNoteById(
      request.supabase,
      request.user.id,
      request.params.id
    );

    if (!note) {
      return response.status(404).json({
        status: "error",
        message: "No se encontró la nota. Actualiza la lista e inténtalo de nuevo.",
      });
    }

    return response.status(200).json({
      status: "success",
      note,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateMyNote(
  request,
  response,
  next
) {
  try {
    const { title, content, maturity } =
      request.body;

    if (typeof title === "string" && title.trim().length > 200) {
      return response.status(400).json({
        status: "error",
        message: "El título de la nota debe tener como máximo 200 caracteres.",
      });
    }

    if (
      title !== undefined &&
      (
        typeof title !== "string" ||
        title.trim().length === 0
      )
    ) {
      return response.status(400).json({
        status: "error",
        message:
          "Escribe el título de la nota; no puede contener solo espacios.",
      });
    }

    if (
      content !== undefined &&
      typeof content !== "string"
    ) {
      return response.status(400).json({
        status: "error",
        message:
          "El contenido de la nota debe ser texto.",
      });
    }

    if (
      maturity !== undefined &&
      !VALID_MATURITY.includes(maturity)
    ) {
      return response.status(400).json({
        status: "error",
        message:
          "Selecciona una madurez válida: Semilla, Brote o Árbol.",
      });
    }

    const note = await updateNote(
      request.supabase,
      request.user.id,
      request.params.id,
      {
        title:
          typeof title === "string"
            ? title.trim()
            : undefined,
        content,
        maturity,
      }
    );

    if (!note) {
      return response.status(404).json({
        status: "error",
        message: "No se encontró la nota. Actualiza la lista e inténtalo de nuevo.",
      });
    }

    return response.status(200).json({
      status: "success",
      message: "Note updated successfully",
      note,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteMyNote(
  request,
  response,
  next
) {
  try {
    const note = await deleteNote(
      request.supabase,
      request.user.id,
      request.params.id
    );

    if (!note) {
      return response.status(404).json({
        status: "error",
        message: "No se encontró la nota. Actualiza la lista e inténtalo de nuevo.",
      });
    }

    return response.status(200).json({
      status: "success",
      message: "Note deleted successfully",
      note,
    });
  } catch (error) {
    return next(error);
  }
}
