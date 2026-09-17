async function getUserGardenId(supabase, userId) {
  const { data, error } = await supabase
    .from("gardens")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.id ?? null;
}

async function getUserNote(
  supabase,
  gardenId,
  noteId
) {
  const { data, error } = await supabase
    .from("notes")
    .select("id, title")
    .eq("id", noteId)
    .eq("garden_id", gardenId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
}

function mapRelation(relation) {
  return {
    id: relation.id,
    gardenId: relation.garden_id,
    sourceNoteId: relation.source_note_id,
    targetNoteId: relation.target_note_id,
    createdAt: relation.created_at,
  };
}

export async function createRelation(
  supabase,
  userId,
  sourceNoteId,
  targetNoteId
) {
  const gardenId = await getUserGardenId(
    supabase,
    userId
  );

  if (!gardenId) {
    return {
      status: "garden_not_found",
    };
  }

  if (sourceNoteId === targetNoteId) {
    return {
      status: "same_note",
    };
  }

  const sourceNote = await getUserNote(
    supabase,
    gardenId,
    sourceNoteId
  );

  if (!sourceNote) {
    return {
      status: "source_not_found",
    };
  }

  const targetNote = await getUserNote(
    supabase,
    gardenId,
    targetNoteId
  );

  if (!targetNote) {
    return {
      status: "target_not_found",
    };
  }

  const { data: existingRelation, error: existingError } =
    await supabase
      .from("note_relations")
      .select("id")
      .eq("garden_id", gardenId)
      .eq("source_note_id", sourceNoteId)
      .eq("target_note_id", targetNoteId)
      .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existingRelation) {
    return {
      status: "already_exists",
    };
  }

  const { data, error } = await supabase
    .from("note_relations")
    .insert({
      garden_id: gardenId,
      source_note_id: sourceNoteId,
      target_note_id: targetNoteId,
    })
    .select(
      "id, garden_id, source_note_id, target_note_id, created_at"
    )
    .single();

  if (error) {
    throw error;
  }

  return {
    status: "created",
    relation: mapRelation(data),
  };
}

export async function getRelationsForNote(
  supabase,
  userId,
  noteId
) {
  const gardenId = await getUserGardenId(
    supabase,
    userId
  );

  if (!gardenId) {
    return null;
  }

  const note = await getUserNote(
    supabase,
    gardenId,
    noteId
  );

  if (!note) {
    return null;
  }

  const { data: outgoing, error: outgoingError } =
    await supabase
      .from("note_relations")
      .select(
        "id, garden_id, source_note_id, target_note_id, created_at"
      )
      .eq("garden_id", gardenId)
      .eq("source_note_id", noteId)
      .order("created_at", { ascending: false });

  if (outgoingError) {
    throw outgoingError;
  }

  const { data: incoming, error: incomingError } =
    await supabase
      .from("note_relations")
      .select(
        "id, garden_id, source_note_id, target_note_id, created_at"
      )
      .eq("garden_id", gardenId)
      .eq("target_note_id", noteId)
      .order("created_at", { ascending: false });

  if (incomingError) {
    throw incomingError;
  }

  return {
    outgoing: outgoing.map(mapRelation),
    incoming: incoming.map(mapRelation),
  };
}

export async function deleteRelation(
  supabase,
  userId,
  relationId
) {
  const gardenId = await getUserGardenId(
    supabase,
    userId
  );

  if (!gardenId) {
    return null;
  }

  const { data: existingRelation, error: findError } =
    await supabase
      .from("note_relations")
      .select(
        "id, garden_id, source_note_id, target_note_id, created_at"
      )
      .eq("id", relationId)
      .eq("garden_id", gardenId)
      .maybeSingle();

  if (findError) {
    throw findError;
  }

  if (!existingRelation) {
    return null;
  }

  const { error } = await supabase
    .from("note_relations")
    .delete()
    .eq("id", relationId)
    .eq("garden_id", gardenId);

  if (error) {
    throw error;
  }

  return mapRelation(existingRelation);
}
