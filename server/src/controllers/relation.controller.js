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
        message: "Selecciona una nota de origen.",
      });
    }

    if (
      typeof targetNoteId !== "string" ||
      targetNoteId.trim().length === 0
    ) {
      return response.status(400).json({
        status: "error",
        message: "Selecciona una nota de destino.",
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
        message: "No se encontró tu jardín. Créalo desde Perfil y jardín para continuar.",
      });
    }

    if (result.status === "same_note") {
      return response.status(400).json({
        status: "error",
        message:
          "Una nota no puede relacionarse consigo misma. Selecciona otra nota.",
      });
    }

    if (result.status === "source_not_found") {
      return response.status(404).json({
        status: "error",
        message: "La nota de origen ya no está disponible. Selecciona otra nota.",
      });
    }

    if (result.status === "target_not_found") {
      return response.status(404).json({
        status: "error",
        message: "La nota de destino ya no está disponible. Selecciona otra nota.",
      });
    }

    if (result.status === "already_exists") {
      return response.status(409).json({
        status: "error",
        message: "Estas notas ya tienen esa relación. Selecciona otra nota.",
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
        message: "No se encontró la nota. Actualiza la lista e inténtalo de nuevo.",
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
        message: "No se encontró la relación. Actualiza la lista e inténtalo de nuevo.",
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
