import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearBreakAdminAuthenticated,
  isBreakAdminAuthenticated,
  setBreakAdminAuthenticated,
} from "@/lib/break-admin-session";

function createSessionStorageMock() {
  const store = new Map<string, string>();

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    get length() {
      return store.size;
    },
  };
}

describe("break admin session", () => {
  beforeEach(() => {
    vi.stubGlobal("sessionStorage", createSessionStorageMock());
  });

  afterEach(() => {
    clearBreakAdminAuthenticated();
    vi.unstubAllGlobals();
  });

  it("stores only an authenticated flag", () => {
    expect(isBreakAdminAuthenticated()).toBe(false);

    setBreakAdminAuthenticated();

    expect(isBreakAdminAuthenticated()).toBe(true);
    expect(sessionStorage.getItem("breakAdminAuthenticated")).toBe("true");
    expect(sessionStorage.length).toBe(1);
  });
});
