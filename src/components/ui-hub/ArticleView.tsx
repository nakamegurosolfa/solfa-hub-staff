import type { Article } from "@/data/content";

export function ArticleView({ article, accent = "var(--color-primary)" }: { article: Article; accent?: string }) {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">{article.title}</h1>
      {article.summary ? (
        <p className="mt-1 text-sm text-muted-foreground">{article.summary}</p>
      ) : null}

      <div className="mt-5 flex flex-col gap-4">
        {article.sections.map((section) => (
          <section key={section.heading} className="card-surface p-5">
            <h2
              className="mb-3 text-xs font-semibold uppercase tracking-wider"
              style={{ color: accent }}
            >
              {section.heading}
            </h2>
            <ul className="space-y-3">
              {section.body.map((line, i) => (
                <li key={i} className="flex items-start gap-3 text-[15px] leading-relaxed">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: accent }}
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
