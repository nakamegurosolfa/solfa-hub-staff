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
    version: "ver.1.3.0",
    date: "2026-07-18",
    changes: [
      "カクテルレシピに「テストモード」を追加",
      "S〜Dランクから複数選択して出題可能",
      "10問、20問、全問から問題数を選択可能",
      "全問題終了後に自己採点できる機能を追加",
      "間違えたカクテルのレシピだけを結果画面で確認可能",
      "テストモードをカクテル検索欄の下に追加",
    ],
  },
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
