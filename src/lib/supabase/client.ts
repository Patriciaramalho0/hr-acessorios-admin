import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://glatszezwrvxiktwqjwg.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsYXRzemV6d3J2eGlrdHdxandnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3Mzg2MjQsImV4cCI6MjEwOTMxNDYyNH0.7diN8N6m4J7s8JWmkoTpiAqjRQnYbYqSqBh922XQCrk";

export function createBrowserClient() {
  return createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);