import { createSupabaseClient } from "../config/supabase.js";

export async function registerUser({
  email,
  password,
  displayName,
}) {
  const supabaseAuth = createSupabaseClient();

  const { data, error } = await supabaseAuth.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  });

  if (error) {
    throw error;
  }

  return {
    user: data.user,
    session: data.session,
  };
}
