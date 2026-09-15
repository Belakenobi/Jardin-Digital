export async function getProfile(supabase, userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, role, created_at, updated_at")
    .eq("id", userId)
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    displayName: data.display_name,
    role: data.role,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function updateProfile(supabase, userId, displayName) {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
    })
    .eq("id", userId)
    .select("id, display_name, role, created_at, updated_at")
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    displayName: data.display_name,
    role: data.role,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
