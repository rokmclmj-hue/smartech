export function formatSalutation(name: string | null | undefined, fallback = "담당자"): string {
  const trimmed = name?.trim();
  return trimmed ? `${trimmed}님` : `${fallback}님`;
}
