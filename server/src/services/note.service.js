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

function mapNote(note) {
  return {
    id: note.id,
    gardenId: note.garden_id,
    title: note.title,
    content: note.content,
    maturity: note.maturity,
    createdAt: note.created_at,
    updatedAt: note.updated_at,
  };
}

export async function getNotes(
  supabase,
  userId,
  maturity
) {
  const gardenId = await getUserGardenId(
    supabase,
    userId
  );

  if (!gardenId) {
    return null;
  }

  let query = supabase
    .from("notes")
    .select(
      "id, garden_id, title, content, maturity, created_at, updated_at"
    )
    .eq("garden_id", gardenId)
    .order("updated_at", { ascending: false });

  if (maturity) {
    query = query.eq("maturity", maturity);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data.map(mapNote);
}


export async function createNote(
  supabase,
  userId,
  { title, content, maturity }
) {
  const gardenId = await getUserGardenId(
    supabase,
    userId
  );

  if (!gardenId) {
    return null;
  }

  const { data, error } = await supabase
    .from("notes")
    .insert({
      garden_id: gardenId,
      title,
      content,
      maturity,
    })
    .select(
      "id, garden_id, title, content, maturity, created_at, updated_at"
    )
    .single();

  if (error) {
    throw error;
  }

  return mapNote(data);
}

export async function getNoteById(
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

  const { data, error } = await supabase
    .from("notes")
    .select(
      "id, garden_id, title, content, maturity, created_at, updated_at"
    )
    .eq("id", noteId)
    .eq("garden_id", gardenId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapNote(data) : null;
}

export async function updateNote(
  supabase,
  userId,
  noteId,
  { title, content, maturity }
) {
  const existingNote = await getNoteById(
    supabase,
    userId,
    noteId
  );

  if (!existingNote) {
    return null;
  }

  const updates = {};

  if (title !== undefined) {
    updates.title = title;
  }

  if (content !== undefined) {
    updates.content = content;
  }

  if (maturity !== undefined) {
    updates.maturity = maturity;
  }

  const { error } = await supabase
    .from("notes")
    .update(updates)
    .eq("id", noteId);

  if (error) {
    throw error;
  }

  return getNoteById(
    supabase,
    userId,
    noteId
  );
}

export async function deleteNote(
  supabase,
  userId,
  noteId
) {
  const existingNote = await getNoteById(
    supabase,
    userId,
    noteId
  );

  if (!existingNote) {
    return null;
  }

  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", noteId);

  if (error) {
    throw error;
  }

  return existingNote;
}
