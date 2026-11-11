/**
 * Formata valores monetários em Real brasileiro (BRL).
 * @param amount - Valor a ser formatado.
 * @returns Valor formatado em R$.
 */
export const formatAmount = (amount: string | number): string => {
  const amountInNumber =
    typeof amount === "string" ? Number(amount) : amount;

  if (!Number.isFinite(amountInNumber)) {
    return "R$ 0,00";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amountInNumber);
};