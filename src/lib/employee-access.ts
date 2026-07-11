export const EMPLOYEE_ONLY_MARKER = "【社員専用】";

const EMPLOYEE_ACCESS_MARKERS = [EMPLOYEE_ONLY_MARKER, "【社員用】"] as const;

export function isEmployeeOnly(...values: (string | undefined)[]): boolean {
  return values.some((value) => value?.includes(EMPLOYEE_ONLY_MARKER));
}

export function requiresEmployeeAuth(...values: (string | undefined)[]): boolean {
  return values.some((value) =>
    EMPLOYEE_ACCESS_MARKERS.some((marker) => value?.includes(marker)),
  );
}
