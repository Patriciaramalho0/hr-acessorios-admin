"use server";

export async function toggleStaffPublishedStatus(
  _staffId: string,
  _currentPublishedStatus: boolean
) {
  return { dbError: "A área de equipe está desativada nesta loja." };
}
