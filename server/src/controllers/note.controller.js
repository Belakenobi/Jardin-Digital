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
          "Maturity must be seed, budding or tree",
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
        message: "Garden not found",
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

    if (
      typeof title !== "string" ||
      title.trim().length === 0
    ) {
      return response.status(400).json({
        status: "error",
        message: "Note title is required",
      });
    }

    if (typeof content !== "string") {
      return response.status(400).json({
        status: "error",
        message: "Note content must be a string",
      });
    }

    if (!VALID_MATURITY.includes(maturity)) {
      return response.status(400).json({
        status: "error",
        message:
          "Maturity must be seed, budding or tree",
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
          "Garden not found. Create a garden before creating notes",
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
        message: "Note not found",
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
          "Note title must be a non-empty string",
      });
    }

    if (
      content !== undefined &&
      typeof content !== "string"
    ) {
      return response.status(400).json({
        status: "error",
        message:
          "Note content must be a string",
      });
    }

    if (
      maturity !== undefined &&
      !VALID_MATURITY.includes(maturity)
    ) {
      return response.status(400).json({
        status: "error",
        message:
          "Maturity must be seed, budding or tree",
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
        message: "Note not found",
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
        message: "Note not found",
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
