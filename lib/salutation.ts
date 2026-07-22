export function formatSalutation(
  name: string | null | undefined,
  title?: string | null,
  fallback = "담당자"
): string {
  const trimmedName = name?.trim().replace(/ ?님$/, "");
  if (!trimmedName) return `${fallback}님`;
  const trimmedTitle = title?.trim().replace(/ ?님$/, "");
  return trimmedTitle ? `${trimmedName} ${trimmedTitle}님` : `${trimmedName}님`;
}
