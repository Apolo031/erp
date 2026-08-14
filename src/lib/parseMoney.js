/** Extrae el valor numérico de un texto tipo "$3.450.000" para poder sumarlo/ordenarlo. */
export function parseMoney(text) {
  if (!text) return 0;
  const digits = String(text).replace(/[^0-9]/g, '');
  return digits ? Number(digits) : 0;
}
