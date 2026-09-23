async function countRows(supabase, table, configureQuery) {
  let query = supabase
    .from(table)
    .select("id", { count: "exact", head: true });

  if (configureQuery) {
    query = configureQuery(query);
  }

  const { count, error } = await query;

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function getAdminSummary(supabase) {
  const [
    userCount,
    gardenCount,
    publicGardenCount,
    privateGardenCount,
    noteCount,
    relationCount,
    galleryImageCount,
  ] = await Promise.all([
    countRows(supabase, "profiles"),
    countRows(supabase, "gardens"),
    countRows(supabase, "gardens", (query) =>
      query.eq("is_public", true)
    ),
    countRows(supabase, "gardens", (query) =>
      query.eq("is_public", false)
    ),
    countRows(supabase, "notes"),
    countRows(supabase, "note_relations"),
    countRows(supabase, "gallery_images"),
  ]);

  return {
    userCount,
    gardenCount,
    publicGardenCount,
    privateGardenCount,
    noteCount,
    relationCount,
    galleryImageCount,
  };
}

export async function getAdminUsers(supabase) {
  const [profilesResult, gardensResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, display_name, role, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("gardens")
      .select("id, user_id, name, is_public"),
  ]);

  if (profilesResult.error) {
    throw profilesResult.error;
  }

  if (gardensResult.error) {
    throw gardensResult.error;
  }

  const gardensByUserId = new Map(
    gardensResult.data.map((garden) => [garden.user_id, garden])
  );

  return profilesResult.data.map((profile) => {
    const garden = gardensByUserId.get(profile.id);

    return {
      id: profile.id,
      displayName: profile.display_name,
      role: profile.role,
      createdAt: profile.created_at,
      garden: garden
        ? {
            id: garden.id,
            name: garden.name,
            isPublic: garden.is_public,
          }
        : null,
    };
  });
}
