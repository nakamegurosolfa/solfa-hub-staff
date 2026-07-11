import {
  cocktailBadgeClassName,
  learningPriorityTone,
  orderFrequencyTone,
} from "@/lib/cocktail-meta-badges";

type CocktailBadgeFields = {
  learningPriority?: string;
  orderFrequency?: string;
};

export function CocktailCardBadges({ learningPriority, orderFrequency }: CocktailBadgeFields) {
  if (!learningPriority && !orderFrequency) return null;

  return (
    <>
      {learningPriority ? (
        <span className={cocktailBadgeClassName(learningPriorityTone(learningPriority), "card")}>
          {learningPriority}
        </span>
      ) : null}
      {orderFrequency ? (
        <span className={cocktailBadgeClassName(orderFrequencyTone(orderFrequency), "card")}>
          注文頻度：{orderFrequency}
        </span>
      ) : null}
    </>
  );
}

export function CocktailValueBadge({
  value,
  kind,
  size = "card",
}: {
  value: string;
  kind: "learningPriority" | "orderFrequency";
  size?: "card" | "detail";
}) {
  const tone = kind === "learningPriority" ? learningPriorityTone(value) : orderFrequencyTone(value);
  return <span className={cocktailBadgeClassName(tone, size)}>{value}</span>;
}
