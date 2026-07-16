/** マニュアル等の Notion 更新日表示（Asia/Tokyo） */
export function formatUpdateDate(iso: string) {
  return new Date(iso).toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "numeric",
    day: "numeric",
  });
}

/** 更新履歴のリリース日表示（YYYY-MM-DD → 2026年7月15日） */
export function formatReleaseDate(dateKey: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) return dateKey;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return `${year}年${month}月${day}日`;
}
