export function normalizePhone(input: string | null | undefined): string {
  if (!input) return "";
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("82")) {
    digits = "0" + digits.slice(2);
  }
  return digits;
}
