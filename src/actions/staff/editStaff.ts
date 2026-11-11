"use server";

export async function editStaff(
  _staffId: string,
  _formData: FormData
) {
  return { dbError: "A edição de equipe está desativada nesta loja." };
}
