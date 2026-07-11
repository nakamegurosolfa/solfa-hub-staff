import type { NotionBlock } from "@/lib/notion-types";

const HIDDEN_HEADING_TITLES = new Set(["スクリーンショット"]);

function blockPlainText(block: NotionBlock): string {
  return block.richText.map((item) => item.plain_text).join("").trim();
}

function headingLevel(block: NotionBlock): number | null {
  if (block.type === "heading_1") return 1;
  if (block.type === "heading_2") return 2;
  if (block.type === "heading_3") return 3;
  return null;
}

function isHiddenHeading(title: string): boolean {
  return HIDDEN_HEADING_TITLES.has(title.trim());
}

function hasMeaningfulContent(block: NotionBlock): boolean {
  if (block.type === "divider") return false;
  if (block.type === "image") return Boolean(block.imageUrl || block.id);
  if (block.type === "video" || block.type === "embed") return Boolean(block.mediaUrl);
  if (block.type === "table") return (block.children?.length ?? 0) > 0;
  if (block.type === "bookmark") return Boolean(block.bookmarkUrl);
  if (blockPlainText(block)) return true;
  if (block.children?.some(hasMeaningfulContent)) return true;
  return false;
}

function splitIntoSections(blocks: NotionBlock[]) {
  const sections: NotionBlock[][] = [];
  let current: NotionBlock[] = [];

  for (const block of blocks) {
    if ((block.type === "heading_1" || block.type === "heading_2") && current.length > 0) {
      sections.push(current);
      current = [block];
      continue;
    }
    current.push(block);
  }

  if (current.length > 0) sections.push(current);
  return sections.length > 0 ? sections : [blocks];
}

function stripHiddenHeadingSections(blocks: NotionBlock[]): NotionBlock[] {
  const result: NotionBlock[] = [];
  let skipping = false;
  let skipLevel = 99;

  for (const block of blocks) {
    const level = headingLevel(block);
    const title = blockPlainText(block);

    if (level !== null) {
      if (isHiddenHeading(title)) {
        skipping = true;
        skipLevel = level;
        continue;
      }

      if (skipping && level <= skipLevel) {
        skipping = false;
      }
    }

    if (skipping) continue;

    result.push(
      block.children?.length
        ? { ...block, children: stripHiddenHeadingSections(block.children) }
        : block,
    );
  }

  return result;
}

function removeEmptyOtherSections(blocks: NotionBlock[]): NotionBlock[] {
  return splitIntoSections(blocks)
    .filter((section) => !isOtherWrapperSection(section))
    .flat();
}

function isOtherWrapperSection(section: NotionBlock[]): boolean {
  const hasOtherHeading = section.some(
    (block) =>
      (block.type === "heading_1" || block.type === "heading_2") && blockPlainText(block) === "その他",
  );
  if (!hasOtherHeading) return false;

  return !section.some((block) => {
    if ((block.type === "heading_1" || block.type === "heading_2") && blockPlainText(block) === "その他") {
      return false;
    }
    return hasMeaningfulContent(block);
  });
}

/** Removes Notion screenshot appendix sections from manual page bodies. */
export function filterManualNotionBlocks(blocks: NotionBlock[]): NotionBlock[] {
  return removeEmptyOtherSections(stripHiddenHeadingSections(blocks));
}
