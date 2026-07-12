import { EmployeeOnlyBadge } from "@/components/auth/PasswordGateScreen";
import { ListCard, SectionLabel } from "@/components/ui-hub/ListCard";
import { searchHitRedirectPath, type SearchHit } from "@/lib/search-index";

export function SearchResultsList({
  results,
  employeeAuthenticated,
  emptyMessage = "該当する結果がありません",
}: {
  results: SearchHit[];
  employeeAuthenticated: boolean;
  emptyMessage?: string;
}) {
  if (results.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-6 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <>
      <SectionLabel>{results.length}件の結果</SectionLabel>
      <div className="flex flex-col gap-2">
        {results.map((result) => {
          const needsEmployeeAuth = result.employeeOnly && !employeeAuthenticated;
          return (
            <ListCard
              key={result.id}
              to={needsEmployeeAuth ? "/employee-login" : result.to}
              params={needsEmployeeAuth ? undefined : result.params}
              search={needsEmployeeAuth ? { redirect: searchHitRedirectPath(result) } : undefined}
              title={result.title}
              subtitle={result.subtitle}
              trailing={result.employeeOnly ? <EmployeeOnlyBadge /> : undefined}
            />
          );
        })}
      </div>
    </>
  );
}
