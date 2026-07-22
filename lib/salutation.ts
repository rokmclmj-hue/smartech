export function formatSalutation(
  name: string | null | undefined,
  title?: string | null,
  fallback = "담당자"
): string {
  const trimmedName = name?.trim();
  if (!trimmedName) return `${fallback}님`;
  const trimmedTitle = title?.trim();
  return trimmedTitle ? `${trimmedName} ${trimmedTitle}님` : `${trimmedName}님`;
}
