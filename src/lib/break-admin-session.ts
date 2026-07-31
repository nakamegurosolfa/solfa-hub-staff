const BREAK_ADMIN_AUTHENTICATED_KEY = "breakAdminAuthenticated";
const BREAK_ADMIN_AUTHENTICATED_VALUE = "true";

export function isBreakAdminAuthenticated(): boolean {
  if (typeof sessionStorage === "undefined") {
    return false;
  }

  return sessionStorage.getItem(BREAK_ADMIN_AUTHENTICATED_KEY) === BREAK_ADMIN_AUTHENTICATED_VALUE;
}

export function setBreakAdminAuthenticated(): void {
  sessionStorage.setItem(BREAK_ADMIN_AUTHENTICATED_KEY, BREAK_ADMIN_AUTHENTICATED_VALUE);
}

export function clearBreakAdminAuthenticated(): void {
  sessionStorage.removeItem(BREAK_ADMIN_AUTHENTICATED_KEY);
}
