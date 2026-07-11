import type { NotionBlock } from "@/lib/notion-types";
import type { QaItem } from "@/lib/qa-types";

const QUESTION_PREFIX = /^Q[\.．]\s*/i;
const ANSWER_MARKER = /^A[\.．]\s*$/i;

function blockText(block: NotionBlock): string {
  return block.richText.map((item) => item.plain_text).join("").trim();
}

function isQuestionBlock(block: NotionBlock): boolean {
  if (block.type !== "heading_1" && block.type !== "heading_2" && block.type !== "heading_3") {
    return false;
  }
  return QUESTION_PREFIX.test(blockText(block));
}

function isAnswerMarker(block: NotionBlock): boolean {
  if (block.type !== "heading_1" && block.type !== "heading_2" && block.type !== "heading_3" && block.type !== "paragraph") {
    return false;
  }
  return ANSWER_MARKER.test(blockText(block));
}

function isSectionHeading(block: NotionBlock): boolean {
  if (block.type !== "heading_1" && block.type !== "heading_2") return false;
  const text = blockText(block);
  return Boolean(text) && !isQuestionBlock(block);
}

function extractQuestionText(block: NotionBlock): string {
  return blockText(block).replace(QUESTION_PREFIX, "").trim();
}

function isAnswerBoundary(block: NotionBlock): boolean {
  return isQuestionBlock(block) || isSectionHeading(block);
}

export function extractQaFromBlocks(
  blocks: NotionBlock[],
  context: { manualId: string; manualTitle: string; updatedAt?: string },
): QaItem[] {
  const items: QaItem[] = [];
  let sectionCategory: string | null = null;

  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];

    if (isSectionHeading(block)) {
      sectionCategory = blockText(block);
      continue;
    }

    if (!isQuestionBlock(block)) continue;

    const question = extractQuestionText(block);
    if (!question) continue;

    let answerIndex = index + 1;
    while (answerIndex < blocks.length && !isAnswerMarker(blocks[answerIndex]) && !isAnswerBoundary(blocks[answerIndex])) {
      answerIndex += 1;
    }

    if (answerIndex >= blocks.length || !isAnswerMarker(blocks[answerIndex])) continue;

    const answerBlocks: NotionBlock[] = [];
    for (let cursor = answerIndex + 1; cursor < blocks.length; cursor += 1) {
      const candidate = blocks[cursor];
      if (isAnswerBoundary(candidate)) break;
      answerBlocks.push(candidate);
    }

    if (answerBlocks.length === 0) continue;

    items.push({
      id: `${context.manualId}-${block.id}`,
      category: sectionCategory ?? context.manualTitle,
      question,
      answerBlocks,
      updatedAt: context.updatedAt,
      manualId: context.manualId,
    });
  }

  return items;
}
