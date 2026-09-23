function mapGarden(garden) {
  return {
    id: garden.id,
    userId: garden.user_id,
    name: garden.name,
    description: garden.description,
    isPublic: garden.is_public,
    createdAt: garden.created_at,
    updatedAt: garden.updated_at,
  };
}

function mapProfile(profile) {
  return {
    id: profile.id,
    displayName: profile.display_name,
  };
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

function mapRelation(relation) {
  return {
    id: relation.id,
    gardenId: relation.garden_id,
    sourceNoteId: relation.source_note_id,
    targetNoteId: relation.target_note_id,
    createdAt: relation.created_at,
  };
}

export async function getPublicGardens(supabase) {
  const { data: gardens, error: gardensError } =
    await supabase
      .from("gardens")
      .select("id, user_id, name, description, updated_at")
      .eq("is_public", true)
      .order("updated_at", { ascending: false })
      .limit(6);

  if (gardensError) {
    throw gardensError;
  }

  if (gardens.length === 0) {
    return [];
  }

  const { data: profiles, error: profilesError } =
    await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", gardens.map((garden) => garden.user_id));

  if (profilesError) {
    throw profilesError;
  }

  return Promise.all(gardens.map(async (garden) => {
    const maturities = ["seed", "budding", "tree"];

    // Count visible notes without downloading their content or hitting row limits.
    const counts = await Promise.all(maturities.map(async (maturity) => {
      const { count, error } = await supabase
        .from("notes")
        .select("id", { count: "exact", head: true })
        .eq("garden_id", garden.id)
        .eq("maturity", maturity);

      if (error) {
        throw error;
      }

      return count;
    }));

    const owner = profiles.find((profile) => profile.id === garden.user_id);

    return {
      id: garden.id,
      name: garden.name,
      description: garden.description,
      owner: owner ? mapProfile(owner) : null,
      noteCount: counts.reduce((total, count) => total + count, 0),
      maturityCounts: Object.fromEntries(
        maturities.map((maturity, index) => [maturity, counts[index]])
      ),
      updatedAt: garden.updated_at,
    };
  }));
}

export async function getPublicGarden(
  supabase,
  gardenId
) {
  const { data: garden, error: gardenError } =
    await supabase
      .from("gardens")
      .select(
        "id, user_id, name, description, is_public, created_at, updated_at"
      )
      .eq("id", gardenId)
      .eq("is_public", true)
      .maybeSingle();

  if (gardenError) {
    throw gardenError;
  }

  if (!garden) {
    return null;
  }

  const [
    profileResult,
    notesResult,
    relationsResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, display_name")
      .eq("id", garden.user_id)
      .maybeSingle(),

    supabase
      .from("notes")
      .select(
        "id, garden_id, title, content, maturity, created_at, updated_at"
      )
      .eq("garden_id", garden.id)
      .order("updated_at", {
        ascending: false,
      }),

    supabase
      .from("note_relations")
      .select(
        "id, garden_id, source_note_id, target_note_id, created_at"
      )
      .eq("garden_id", garden.id),
  ]);

  if (profileResult.error) {
    throw profileResult.error;
  }

  if (notesResult.error) {
    throw notesResult.error;
  }

  if (relationsResult.error) {
    throw relationsResult.error;
  }

  return {
    garden: mapGarden(garden),

    owner: profileResult.data
      ? mapProfile(profileResult.data)
      : null,

    notes: notesResult.data.map(mapNote),

    relations:
      relationsResult.data.map(mapRelation),
  };
}
