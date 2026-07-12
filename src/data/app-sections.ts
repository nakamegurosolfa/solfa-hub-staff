/**
 * solfa MANUAL APP — product structure
 *
 * Goal: staff reach the right info in 3 taps or fewer during service.
 * Prioritize simplicity over information volume.
 */

import type { CategoryItem } from "@/data/categories";

export type AppSectionId = "cocktails" | "manuals" | "rules" | "organization" | "about";

export type HomeCardId = "cocktails" | "manuals" | "qa" | "updates";

export type HomeSection = {
  id: HomeCardId;
  to: string;
  emoji: string;
  title: string;
  description: string;
  color: string;
};

export const EMPLOYEE_WORK_PATH = "/employee-work";

export const EMPLOYEE_WORK_LABEL = "社員業務";

export const APP_VERSION = "ver.1.1.0";

export const APP_TAGLINE = "あなたの業務をいつでもサポートします。";

export const SEARCH_PLACEHOLDER = "カクテル・マニュアルを検索";

export const HOME_SEARCH_BUTTON_LABEL = "カクテル・マニュアルを検索する";

export const homeSections: HomeSection[] = [
  {
    id: "cocktails",
    to: "/cocktails",
    emoji: "🍸",
    title: "カクテルレシピ",
    description: "ドリンクレシピ・材料・作り方",
    color: "var(--color-primary)",
  },
  {
    id: "manuals",
    to: "/manuals",
    emoji: "📖",
    title: "業務マニュアル",
    description: "営業・受付・バー・清掃",
    color: "#B58BFF",
  },
  {
    id: "qa",
    to: "/qa",
    emoji: "❓",
    title: "Q&A",
    description: "営業中の困りごと・トラブル対応",
    color: "#4DD6A6",
  },
  {
    id: "updates",
    to: "/updates",
    emoji: "🕒",
    title: "更新履歴",
    description: "最近追加・更新された内容",
    color: "#6B9FFF",
  },
];

export const sectionLabels: Record<AppSectionId, string> = {
  cocktails: "カクテルレシピ",
  manuals: "業務マニュアル",
  rules: "店のルール",
  organization: "会社組織図",
  about: "solfaとは",
};

const organizationPageTitles = new Set(["会社組織図"]);
const aboutPageTitles = new Set(["はじめに"]);

export function classifyNotionPageTitle(title: string): AppSectionId {
  if (organizationPageTitles.has(title)) return "organization";
  if (aboutPageTitles.has(title)) return "about";
  return "manuals";
}

export const shopRulesCategories: CategoryItem[] = [
  {
    id: "service",
    emoji: "🤝",
    title: "接客",
    description: "接客の基本・言葉遣い",
    color: "#4DD6A6",
  },
  {
    id: "appearance",
    emoji: "👔",
    title: "身だしなみ",
    description: "服装・身だしなみのルール",
    color: "#4DD6A6",
  },
  {
    id: "prohibited",
    emoji: "🚫",
    title: "禁止事項",
    description: "してはいけないこと",
    color: "#4DD6A6",
  },
  {
    id: "other-rules",
    emoji: "📋",
    title: "その他店舗ルール",
    description: "その他の店舗ルール",
    color: "#4DD6A6",
  },
];

export const aboutCategories: CategoryItem[] = [
  {
    id: "store-intro",
    emoji: "🏠",
    title: "店舗紹介",
    description: "solfaの店舗について",
    color: "#FFB86B",
  },
  {
    id: "concept",
    emoji: "✨",
    title: "コンセプト",
    description: "solfaのコンセプト",
    color: "#FFB86B",
  },
  {
    id: "values",
    emoji: "💡",
    title: "大切にしている考え方",
    description: "solfaが大切にしていること",
    color: "#FFB86B",
  },
];
