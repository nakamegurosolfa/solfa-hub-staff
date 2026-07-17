import { Link } from "@tanstack/react-router";
import { Brain } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CocktailTestModeCard() {
  return (
    <section className="mt-4 rounded-3xl border border-primary/30 bg-primary/[0.05] px-5 py-5">
      <div className="flex items-start gap-4">
        <span
          className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl"
          style={{ backgroundColor: "var(--color-primary)1F" }}
          aria-hidden
        >
          <Brain className="h-7 w-7 text-primary" strokeWidth={1.6} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[17px] font-semibold tracking-tight">🧠 テストモード</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            ランク別のカクテルテストに挑戦できます。
            <br />
            S〜Dランクを選択して知識を確認しましょう。
          </p>
          <Button
            asChild
            className="mt-4 h-11 w-full rounded-2xl text-[15px] font-semibold sm:w-auto sm:min-w-[160px]"
          >
            <Link to="/cocktails/test">テストを始める</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
