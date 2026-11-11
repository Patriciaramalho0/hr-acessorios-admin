import type { User } from "@supabase/supabase-js";
export function isAdminUser(user: Pick<User, "id"> | null): boolean {
  const adminId = process.env.ADMIN_USER_ID?.trim();
  return Boolean(adminId && user && user.id === adminId);
}
export async function requireAdmin(client: { auth: { getUser: () => Promise<{ data: { user: User | null }; error: unknown }> } }) {
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !isAdminUser(user)) throw new Error("Acesso administrativo não autorizado.");
  return user!;
}
