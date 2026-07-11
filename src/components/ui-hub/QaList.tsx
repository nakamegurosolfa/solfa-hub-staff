import { HelpCircle } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { NotionBlockList } from "@/components/ui-hub/NotionContent";
import { SectionLabel } from "@/components/ui-hub/ListCard";
import { formatUpdateDate } from "@/lib/update-history";
import type { QaCategoryGroup } from "@/lib/qa-types";

const QA_COLOR = "#4DD6A6";

export function QaList({ groups }: { groups: QaCategoryGroup[] }) {
  if (groups.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-6 text-center text-sm text-muted-foreground">
        Q&Aが見つかりません。
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <section key={group.category}>
          <SectionLabel>{group.category}</SectionLabel>
          <div className="overflow-hidden rounded-3xl border border-border bg-[var(--color-surface)]">
            <Accordion type="multiple" className="px-1">
              {group.items.map((item) => (
                <AccordionItem key={item.id} value={item.id} className="border-border/60 px-4 last:border-b-0">
                  <AccordionTrigger className="gap-3 py-4 text-left text-[15px] font-semibold leading-snug hover:no-underline">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: QA_COLOR + "1F", color: QA_COLOR }} aria-hidden>
                      <HelpCircle className="h-4 w-4" strokeWidth={2} />
                    </span>
                    <span className="min-w-0 flex-1">{item.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 pl-12 text-muted-foreground">
                    <NotionBlockList
                      blocks={item.answerBlocks}
                      accent={QA_COLOR}
                      paragraphClassName="text-[14px] leading-relaxed text-muted-foreground"
                      bulletClassName="text-[14px] leading-relaxed text-muted-foreground"
                      bulletListClassName="space-y-2"
                      numberedListClassName="space-y-2"
                      containerClassName="flex flex-col gap-2"
                    />
                    {item.updatedAt ? (
                      <p className="mt-3 text-xs text-muted-foreground/70">更新: {formatUpdateDate(item.updatedAt)}</p>
                    ) : null}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      ))}
    </div>
  );
}
