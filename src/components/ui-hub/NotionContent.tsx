import type { NotionBlock, NotionRichText } from "@/lib/notion-types";
import { NotionImage } from "@/components/ui-hub/NotionImage";
import { NotionMediaPlayer } from "@/components/ui-hub/NotionMediaPlayer";

function RichText({ items, className }: { items: NotionRichText[]; className?: string }) {
  if (items.length === 0) return null;

  return (
    <span className={className}>
      {items.map((item, index) => {
        let content: React.ReactNode = item.plain_text;

        if (item.annotations.code) {
          content = (
            <code className="rounded-md bg-[var(--color-surface-2)] px-1.5 py-0.5 text-[13px]">{content}</code>
          );
        }
        if (item.annotations.bold) content = <strong>{content}</strong>;
        if (item.annotations.italic) content = <em>{content}</em>;
        if (item.annotations.strikethrough) content = <s>{content}</s>;
        if (item.annotations.underline) content = <u>{content}</u>;

        if (item.href) {
          content = (
            <a href={item.href} className="text-primary underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
              {content}
            </a>
          );
        }

        return <span key={`${index}-${item.plain_text.slice(0, 12)}`}>{content}</span>;
      })}
    </span>
  );
}

function effectiveColumnCount(rows: NotionBlock[], tableWidth: number) {
  let lastUsed = 0;

  for (const row of rows) {
    for (let index = 0; index < (row.cells?.length ?? 0); index += 1) {
      if (row.cells?.[index]?.some((item) => item.plain_text.trim())) {
        lastUsed = Math.max(lastUsed, index + 1);
      }
    }
  }

  const width = tableWidth || rows[0]?.cells?.length || 0;
  return Math.min(width, Math.max(lastUsed, 1));
}

function TableBlock({ block }: { block: NotionBlock }) {
  const rows = block.children?.filter((child) => child.type === "table_row") ?? [];
  const columnCount = effectiveColumnCount(rows, block.tableWidth ?? 0);

  if (rows.length === 0 || columnCount === 0) return null;

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-[480px] border-collapse text-[14px]">
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.id} className="border-b border-border/60 last:border-0">
              {Array.from({ length: columnCount }, (_, cellIndex) => {
                const cell = row.cells?.[cellIndex] ?? [];
                const isHeader =
                  (block.hasColumnHeader && rowIndex === 0) || (block.hasRowHeader && cellIndex === 0);
                const CellTag = isHeader ? "th" : "td";

                return (
                  <CellTag
                    key={`${row.id}-${cellIndex}`}
                    className={`px-3 py-2.5 align-top text-left ${
                      isHeader ? "bg-[var(--color-surface-2)] font-semibold" : "text-foreground/90"
                    } ${cellIndex < columnCount - 1 ? "border-r border-border/40" : ""}`}
                  >
                    {cell.length > 0 ? <RichText items={cell} /> : null}
                  </CellTag>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BlockList({
  blocks,
  accent,
  bulletClassName = "text-[15px] leading-relaxed",
  paragraphClassName = "text-[15px] leading-relaxed text-foreground/90",
  bulletListClassName = "space-y-3",
  numberedListClassName = "space-y-3",
  containerClassName = "flex flex-col gap-4",
  formatListItemText,
}: {
  blocks: NotionBlock[];
  accent: string;
  bulletClassName?: string;
  paragraphClassName?: string;
  bulletListClassName?: string;
  numberedListClassName?: string;
  containerClassName?: string;
  formatListItemText?: (text: string) => React.ReactNode;
}) {
  const nodes: React.ReactNode[] = [];
  let bulletGroup: NotionBlock[] = [];
  let numberedGroup: NotionBlock[] = [];

  const renderListItemContent = (block: NotionBlock) => {
    const text = block.richText.map((item) => item.plain_text).join("").trim();

    return (
      <span>
        <span className={formatListItemText ? "flex w-full items-baseline justify-between gap-4" : undefined}>
          {formatListItemText ? formatListItemText(text) : <RichText items={block.richText} />}
        </span>
        {block.children?.length ? (
          <div className="mt-3 pl-1">
            <BlockList
              blocks={block.children}
              accent={accent}
              bulletClassName={bulletClassName}
              paragraphClassName={paragraphClassName}
              bulletListClassName={bulletListClassName}
              numberedListClassName={numberedListClassName}
              containerClassName={containerClassName}
              formatListItemText={formatListItemText}
            />
          </div>
        ) : null}
      </span>
    );
  };

  const flushBullets = () => {
    if (bulletGroup.length === 0) return;
    nodes.push(
      <ul key={`bullets-${bulletGroup[0]?.id}`} className={bulletListClassName}>
        {bulletGroup.map((block) => (
          <li key={block.id} className={`flex items-start gap-3 ${bulletClassName}`}>
            <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
            {renderListItemContent(block)}
          </li>
        ))}
      </ul>,
    );
    bulletGroup = [];
  };

  const flushNumbered = () => {
    if (numberedGroup.length === 0) return;
    nodes.push(
      <ol key={`numbered-${numberedGroup[0]?.id}`} className={numberedListClassName}>
        {numberedGroup.map((block, index) => (
          <li key={block.id} className={`flex items-start gap-3 ${bulletClassName}`}>
            <span
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-semibold"
              style={{ backgroundColor: accent + "22", color: accent }}
            >
              {index + 1}
            </span>
            {renderListItemContent(block)}
          </li>
        ))}
      </ol>,
    );
    numberedGroup = [];
  };

  for (const block of blocks) {
    if (block.type === "bulleted_list_item") {
      flushNumbered();
      bulletGroup.push(block);
      continue;
    }

    if (block.type === "numbered_list_item") {
      flushBullets();
      numberedGroup.push(block);
      continue;
    }

    flushBullets();
    flushNumbered();

    const text = block.richText.map((item) => item.plain_text).join("").trim();

    switch (block.type) {
      case "heading_1":
        nodes.push(
          <h2 key={block.id} className="text-2xl font-bold tracking-tight">
            <RichText items={block.richText} />
          </h2>,
        );
        break;
      case "heading_2":
        nodes.push(
          <h3 key={block.id} className="text-xl font-semibold tracking-tight">
            <RichText items={block.richText} />
          </h3>,
        );
        break;
      case "heading_3":
        nodes.push(
          <h4
            key={block.id}
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: accent }}
          >
            <RichText items={block.richText} />
          </h4>,
        );
        break;
      case "paragraph":
        if (text) {
          nodes.push(
            <p key={block.id} className={paragraphClassName}>
              <RichText items={block.richText} />
            </p>,
          );
        }
        break;
      case "quote":
        nodes.push(
          <blockquote
            key={block.id}
            className="rounded-2xl border border-border bg-[var(--color-surface-2)] px-4 py-3 text-[15px] leading-relaxed text-muted-foreground"
          >
            <RichText items={block.richText} />
          </blockquote>,
        );
        break;
      case "callout":
        nodes.push(
          <div
            key={block.id}
            className="flex gap-3 rounded-2xl border border-primary/25 bg-primary/[0.06] px-4 py-3 text-[15px] leading-relaxed"
          >
            <span aria-hidden>{block.icon ?? "💡"}</span>
            <div>
              <RichText items={block.richText} />
            </div>
          </div>,
        );
        break;
      case "divider":
        nodes.push(<hr key={block.id} className="border-border/70" />);
        break;
      case "toggle":
        nodes.push(
          <details key={block.id} className="rounded-2xl border border-border bg-[var(--color-surface-2)] px-4 py-3">
            <summary className="cursor-pointer text-[15px] font-medium">
              <RichText items={block.richText} />
            </summary>
            {block.children?.length ? (
              <div className="mt-3 flex flex-col gap-3 border-t border-border/60 pt-3">
                <BlockList blocks={block.children} accent={accent} />
              </div>
            ) : null}
          </details>,
        );
        break;
      case "image":
        if (block.imageUrl || block.id) {
          nodes.push(<NotionImage key={block.id} block={block} />);
        }
        break;
      case "video":
      case "embed":
        if (block.mediaUrl) {
          nodes.push(
            <NotionMediaPlayer key={block.id} url={block.mediaUrl} caption={block.mediaCaption} />,
          );
        }
        break;
      case "table":
        nodes.push(<TableBlock key={block.id} block={block} />);
        break;
      case "bookmark":
        if (block.bookmarkUrl) {
          nodes.push(
            <a
              key={block.id}
              href={block.bookmarkUrl}
              target="_blank"
              rel="noreferrer"
              className="block rounded-2xl border border-border bg-[var(--color-surface-2)] px-4 py-3 transition-colors hover:border-primary/40"
            >
              <span className="text-sm font-medium text-primary underline-offset-2">{block.bookmarkUrl}</span>
              {block.richText.length > 0 ? (
                <p className="mt-1 text-[13px] text-muted-foreground">
                  <RichText items={block.richText} />
                </p>
              ) : null}
            </a>,
          );
        }
        break;
      case "table_row":
        break;
      default:
        if (block.children?.length) {
          nodes.push(
            <BlockList
              key={`${block.id}-children`}
              blocks={block.children}
              accent={accent}
              bulletClassName={bulletClassName}
              paragraphClassName={paragraphClassName}
              bulletListClassName={bulletListClassName}
              numberedListClassName={numberedListClassName}
              containerClassName={containerClassName}
              formatListItemText={formatListItemText}
            />,
          );
        }
        break;
    }
  }

  flushBullets();
  flushNumbered();

  return <div className={containerClassName}>{nodes}</div>;
}

export function NotionBlockList({
  blocks,
  accent = "#B58BFF",
  bulletClassName,
  paragraphClassName,
  bulletListClassName,
  numberedListClassName,
  containerClassName,
  formatListItemText,
}: {
  blocks: NotionBlock[];
  accent?: string;
  bulletClassName?: string;
  paragraphClassName?: string;
  bulletListClassName?: string;
  numberedListClassName?: string;
  containerClassName?: string;
  formatListItemText?: (text: string) => React.ReactNode;
}) {
  if (blocks.length === 0) return null;
  return (
    <BlockList
      blocks={blocks}
      accent={accent}
      bulletClassName={bulletClassName}
      paragraphClassName={paragraphClassName}
      bulletListClassName={bulletListClassName}
      numberedListClassName={numberedListClassName}
      containerClassName={containerClassName}
      formatListItemText={formatListItemText}
    />
  );
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

export function NotionContent({
  blocks,
  accent = "#B58BFF",
}: {
  blocks: NotionBlock[];
  accent?: string;
}) {
  if (blocks.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-6 text-center text-sm text-muted-foreground">
        このページには表示できる内容がありません。
      </p>
    );
  }

  const sections = splitIntoSections(blocks);

  return (
    <div className="mt-5 flex flex-col gap-4">
      {sections.map((section, index) => (
        <section key={`section-${index}`} className="card-surface p-5">
          <BlockList blocks={section} accent={accent} />
        </section>
      ))}
    </div>
  );
}
