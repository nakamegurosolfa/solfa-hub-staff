export type NotionRichText = {
  plain_text: string;
  href?: string | null;
  annotations: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
  };
};

export type NotionBlock = {
  id: string;
  type:
    | "heading_1"
    | "heading_2"
    | "heading_3"
    | "paragraph"
    | "bulleted_list_item"
    | "numbered_list_item"
    | "quote"
    | "callout"
    | "divider"
    | "toggle"
    | "image"
    | "video"
    | "embed"
    | "table"
    | "table_row"
    | "bookmark"
    | "unsupported";
  richText: NotionRichText[];
  children?: NotionBlock[];
  icon?: string;
  imageUrl?: string;
  imageSourceType?: "file" | "external";
  imageCaption?: string;
  mediaUrl?: string;
  mediaCaption?: string;
  tableWidth?: number;
  hasColumnHeader?: boolean;
  hasRowHeader?: boolean;
  cells?: NotionRichText[][];
  bookmarkUrl?: string;
};

export type ManualSummary = {
  id: string;
  title: string;
  category?: string;
  employeeOnly: boolean;
  displayOrder?: number;
  searchTags: string[];
  updatedAt?: string;
  lastEditedAt?: string;
};

export type ManualDetail = ManualSummary & {
  blocks: NotionBlock[];
};

export type ManualPageSummary = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  employeeOnly: boolean;
  lastEditedAt?: string;
};

export type ManualPageDetail = {
  id: string;
  title: string;
  blocks: NotionBlock[];
  lastEditedAt?: string;
};

export type ManualRootPage = {
  id: string;
  title: string;
};

export const COCKTAIL_PREPARATION_METHODS = ["Build", "Stir", "Shake"] as const;

export type CocktailPreparationMethod = (typeof COCKTAIL_PREPARATION_METHODS)[number];

export type CocktailSummary = {
  id: string;
  name: string;
  imageUrl?: string;
  price?: string;
  category?: string;
  employeeOnly: boolean;
  orderFrequency?: string;
  learningPriority?: string;
  limitedTime: boolean;
  displayOrder?: number;
  ingredientTags: string[];
  glass?: string;
  ice?: string;
  difficulty?: string;
  recommended: boolean;
  preparationMethod?: CocktailPreparationMethod;
  recipeText?: string;
  lastEditedAt?: string;
};

export type CocktailDetail = CocktailSummary & {
  blocks: NotionBlock[];
};
