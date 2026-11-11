
import {
  createBrowserClient as createSupabaseBrowserClient,
} from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local."
  );
}

export function createBrowserClient() {
  return createSupabaseBrowserClient<Database>(
    supabaseUrl!,
    supabaseAnonKey!
  );
}

export const supabase = createClient<Database>(
  supabaseUrl!,
  supabaseAnonKey!
);
