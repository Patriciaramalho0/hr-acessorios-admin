import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

export const createServerClient = () => {
  const cookieStore = cookies();
  
  const safeCookies = {
    get: (name: string) => {
      try {
        return cookieStore.get(name);
      } catch (e) {
        return undefined;
      }
    },
    getAll: () => {
      try {
        return cookieStore.getAll();
      } catch (e) {
        return [];
      }
    },
    set: () => {},
    remove: () => {},
  };

  // Chaves inseridas diretamente para evitar falhas de leitura do ambiente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://glatszezwrvxiktwqjwg.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsYXRzemV6d3J2eGlrdHdxandnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3Mzg2MjQsImV4cCI6MjEwOTMxNDYyNH0.7diN8N6m4J7s8JWmkoTpiAqjRQnYbYqSqBh922XQCrk";

  return createServerComponentClient<Database>(
    {
      cookies: () => safeCookies as any,
    },
    {
      supabaseUrl,
      supabaseKey,
    }
  );
};