export type CategoryItem = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  color: string;
};

export const cocktailCategories: CategoryItem[] = [
  {
    id: "classic",
    emoji: "🍸",
    title: "定番カクテル",
    description: "よく作るレシピ",
    color: "var(--color-primary)",
  },
  {
    id: "highball",
    emoji: "🥃",
    title: "ハイボール",
    description: "ハイボール系ドリンク",
    color: "var(--color-primary)",
  },
  {
    id: "sour",
    emoji: "🍋",
    title: "サワー",
    description: "サワー系ドリンク",
    color: "var(--color-primary)",
  },
  {
    id: "shot",
    emoji: "🥂",
    title: "ショット",
    description: "ショット・一気飲み",
    color: "var(--color-primary)",
  },
  {
    id: "non-alcohol",
    emoji: "🥤",
    title: "ノンアル",
    description: "ノンアルコールドリンク",
    color: "var(--color-primary)",
  },
];

export const staffManualCategories: CategoryItem[] = [
  {
    id: "opening",
    emoji: "🔑",
    title: "開店準備",
    description: "営業開始前のチェック",
    color: "#B58BFF",
  },
  {
    id: "service",
    emoji: "🎵",
    title: "営業中",
    description: "接客・オペレーション",
    color: "#B58BFF",
  },
  {
    id: "closing",
    emoji: "🌙",
    title: "閉店作業",
    description: "片付け・締め処理",
    color: "#B58BFF",
  },
  {
    id: "register",
    emoji: "💴",
    title: "レジ・会計",
    description: "お会計の手順",
    color: "#B58BFF",
  },
  {
    id: "cleaning",
    emoji: "🧹",
    title: "清掃",
    description: "日常・定期清掃",
    color: "#B58BFF",
  },
];

export const suppliesCategories: CategoryItem[] = [
  {
    id: "bar-tools",
    emoji: "🍶",
    title: "バー用品",
    description: "シェイカー・グラス等",
    color: "#4DD6A6",
  },
  {
    id: "consumables",
    emoji: "🧻",
    title: "消耗品",
    description: "ナプキン・ストロー等",
    color: "#4DD6A6",
  },
  {
    id: "food-drink",
    emoji: "🍋",
    title: "食材・ドリンク",
    description: "発注・在庫管理",
    color: "#4DD6A6",
  },
  {
    id: "purchase-links",
    emoji: "🔗",
    title: "備品購入リンク",
    description: "オンライン発注先",
    color: "#4DD6A6",
  },
];

export const organizationCategories: CategoryItem[] = [
  {
    id: "head-office",
    emoji: "🏢",
    title: "本社",
    description: "経営・管理部門",
    color: "#6B9FFF",
  },
  {
    id: "store-staff",
    emoji: "👔",
    title: "店舗スタッフ",
    description: "フロア・バー体制",
    color: "#6B9FFF",
  },
  {
    id: "contacts",
    emoji: "📞",
    title: "連絡先一覧",
    description: "担当者・連絡先",
    color: "#6B9FFF",
  },
];

export const troubleCategories: CategoryItem[] = [
  {
    id: "equipment",
    emoji: "⚙️",
    title: "設備トラブル",
    description: "機材・設備の不具合",
    color: "var(--color-emergency)",
  },
  {
    id: "guest",
    emoji: "💬",
    title: "お客様対応",
    description: "クレーム・体調不良",
    color: "var(--color-emergency)",
  },
  {
    id: "safety",
    emoji: "🆘",
    title: "安全・緊急",
    description: "火災・停電・怪我",
    color: "var(--color-emergency)",
  },
  {
    id: "emergency-contacts",
    emoji: "📱",
    title: "緊急連絡先",
    description: "担当者・外部連絡先",
    color: "var(--color-emergency)",
  },
];

export function findCategory(list: CategoryItem[], id: string) {
  return list.find((c) => c.id === id);
}
