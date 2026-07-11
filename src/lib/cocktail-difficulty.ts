export function formatDifficulty(difficulty?: string) {
  if (!difficulty?.trim()) return undefined;

  const trimmed = difficulty.trim();
  const filled = (trimmed.match(/★/g) ?? []).length;
  if (filled === 0) return trimmed;

  if (filled <= 3) {
    return "★".repeat(filled) + "☆".repeat(3 - filled);
  }

  return "★".repeat(filled);
}
