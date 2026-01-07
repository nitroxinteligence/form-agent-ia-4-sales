import { createClient } from "@supabase/supabase-js";

export function getSupabaseServerClient() {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.URL;
  const supabaseServiceRole =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SERVICE_ROLE;

  if (!supabaseUrl || !supabaseServiceRole) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
