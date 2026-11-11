import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type { FetchStaffParams, FetchStaffResponse, StaffRolesDropdown, SBStaff } from "./types";
import { isAdminUser } from "@/lib/supabase/admin";

// A loja atual não possui as tabelas legadas de equipe.
export async function fetchStaff(_client: SupabaseClient<Database>, { page = 1, limit = 10 }: FetchStaffParams): Promise<FetchStaffResponse> {
  return { data: [], pagination: { limit, current: 1, items: 0, pages: 0, next: null, prev: null } };
}
export async function fetchStaffRolesDropdown(_client: SupabaseClient<Database>): Promise<StaffRolesDropdown[]> { return []; }
export async function fetchStaffDetails(client: SupabaseClient<Database>): Promise<SBStaff | null> {
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user || !isAdminUser(user)) return null;
  return { id: user.id, email: user.email ?? "", name: user.user_metadata?.name ?? user.email ?? "", phone: user.user_metadata?.phone ?? null, image_url: user.user_metadata?.image_url ?? null, created_at: user.created_at, role_id: 0, published: true, joining_date: user.created_at, updated_at: user.updated_at ?? user.created_at };
}
