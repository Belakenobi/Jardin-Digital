import {
  createRelation,
  getRelationsForNote,
  deleteRelation,
} from "../services/relation.service.js";

export async function createMyRelation(
  request,
  response,
  next
) {
  try {
    const {
      sourceNoteId,
      targetNoteId,
    } = request.body;

    if (
      typeof sourceNoteId !== "string" ||
      sourceNoteId.trim().length === 0
    ) {
      return response.status(400).json({
        status: "error",
        message: "Source note id is required",
      });
    }

    if (
      typeof targetNoteId !== "string" ||
      targetNoteId.trim().length === 0
    ) {
      return response.status(400).json({
        status: "error",
        message: "Target note id is required",
      });
    }

    const result = await createRelation(
      request.supabase,
      request.user.id,
      sourceNoteId.trim(),
      targetNoteId.trim()
    );

    if (result.status === "garden_not_found") {
      return response.status(404).json({
        status: "error",
        message: "Garden not found",
      });
    }

    if (result.status === "same_note") {
      return response.status(400).json({
        status: "error",
        message:
          "A note cannot be related to itself",
      });
    }

    if (result.status === "source_not_found") {
      return response.status(404).json({
        status: "error",
        message: "Source note not found",
      });
    }

    if (result.status === "target_not_found") {
      return response.status(404).json({
        status: "error",
        message: "Target note not found",
      });
    }

    if (result.status === "already_exists") {
      return response.status(409).json({
        status: "error",
        message: "Relation already exists",
      });
    }

    return response.status(201).json({
      status: "success",
      message: "Relation created successfully",
      relation: result.relation,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getMyNoteRelations(
  request,
  response,
  next
) {
  try {
    const relations = await getRelationsForNote(
      request.supabase,
      request.user.id,
      request.params.noteId
    );

    if (!relations) {
      return response.status(404).json({
        status: "error",
        message: "Note not found",
      });
    }

    return response.status(200).json({
      status: "success",
      relations,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteMyRelation(
  request,
  response,
  next
) {
  try {
    const relation = await deleteRelation(
      request.supabase,
      request.user.id,
      request.params.id
    );

    if (!relation) {
      return response.status(404).json({
        status: "error",
        message: "Relation not found",
      });
    }

    return response.status(200).json({
      status: "success",
      message: "Relation deleted successfully",
      relation,
    });
  } catch (error) {
    return next(error);
  }
}
