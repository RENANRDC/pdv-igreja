export function formatarCaixa(caixa?: string) {
  if (caixa === "caixa01") return "CAIXA 1"
  if (caixa === "caixa02") return "CAIXA 2"
  return caixa || "-"
}