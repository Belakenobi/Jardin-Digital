export async function getGarden(supabase, userId) {
  const { data, error } = await supabase
    .from("gardens")
    .select(
      "id, user_id, name, description, is_public, created_at, updated_at"
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    description: data.description,
    isPublic: data.is_public,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function createGarden(
  supabase,
  userId,
  { name, description, isPublic }
) {
  const { error } = await supabase
    .from("gardens")
    .insert({
      user_id: userId,
      name,
      description,
      is_public: isPublic,
    });

  if (error) {
    throw error;
  }

  return getGarden(supabase, userId);
}

export async function updateGarden(
  supabase,
  userId,
  { name, description, isPublic }
) {
  const updates = {};

  if (name !== undefined) {
    updates.name = name;
  }

  if (description !== undefined) {
    updates.description = description;
  }

  if (isPublic !== undefined) {
    updates.is_public = isPublic;
  }

  const { error } = await supabase
    .from("gardens")
    .update(updates)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return getGarden(supabase, userId);
}
