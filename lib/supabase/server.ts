import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.URL;
const supabaseServiceRole =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceRole) {
  throw new Error(
    "Missing Supabase server env vars. Set SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY (or URL/SERVICE_ROLE)."
  );
}

export const supabaseServer = createClient(supabaseUrl, supabaseServiceRole, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
