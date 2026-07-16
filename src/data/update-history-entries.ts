/**
 * アプリ更新履歴（固定データ）
 *
 * 新しいバージョンをリリースしたら、先頭にエントリを追加してください。
 * entries[0] が最新として表示されます。
 */
export type UpdateHistoryEntry = {
  /** 例: "ver.1.2.0" */
  version: string;
  /** リリース日（YYYY-MM-DD、Asia/Tokyo 基準） */
  date: string;
  /** 更新内容（箇条書き） */
  changes: string[];
};

export const UPDATE_HISTORY_ENTRIES: UpdateHistoryEntry[] = [
  {
    version: "ver.1.2.0",
    date: "2026-07-15",
    changes: [
      "アプリ名を「solfa STAFF APP」に変更",
      "休憩管理を Notion 連携に変更（全端末でデータ共有）",
      "忘れ物管理機能を追加",
    ],
  },
  {
    version: "ver.1.1.0",
    date: "2026-07-13",
    changes: [
      "休憩管理機能を追加（記録・確認・営業締めメール送信）",
      "休憩管理アイコンを茶器に変更",
    ],
  },
  {
    version: "ver.1.0.0",
    date: "2026-07-10",
    changes: [
      "solfa スタッフ向け業務マニュアルアプリを公開",
      "カクテルレシピ・業務マニュアル・Q&A・社員業務に対応",
    ],
  },
];
