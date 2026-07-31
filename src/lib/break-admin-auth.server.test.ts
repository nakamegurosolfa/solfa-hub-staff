import { afterEach, describe, expect, it } from "vitest";

import {
  requiresManualBreakCorrectionAuth,
  verifyBreakAdminPassword,
} from "@/lib/break-admin-auth.server";
import { createEmptyBreakEntries } from "@/lib/breaks-types";
import { setNotionRuntimeEnv } from "@/lib/notion-env";

describe("requiresManualBreakCorrectionAuth", () => {
  it("allows starting and ending breaks without manual correction auth", () => {
    const before = createEmptyBreakEntries();
    const afterStart = before.map((entry, index) =>
      index === 0 ? { startAt: "12:00", endAt: null } : entry,
    );
    const afterEnd = afterStart.map((entry, index) =>
      index === 0 ? { ...entry, endAt: "12:45" } : entry,
    );

    expect(requiresManualBreakCorrectionAuth(before, afterStart)).toBe(false);
    expect(requiresManualBreakCorrectionAuth(afterStart, afterEnd)).toBe(false);
  });

  it("requires manual correction auth when existing times change", () => {
    const before = createEmptyBreakEntries().map((entry, index) =>
      index === 0 ? { startAt: "12:00", endAt: "12:45" } : entry,
    );
    const afterStartChange = before.map((entry, index) =>
      index === 0 ? { ...entry, startAt: "12:05" } : entry,
    );
    const afterEndChange = before.map((entry, index) =>
      index === 0 ? { ...entry, endAt: "12:50" } : entry,
    );

    expect(requiresManualBreakCorrectionAuth(before, afterStartChange)).toBe(true);
    expect(requiresManualBreakCorrectionAuth(before, afterEndChange)).toBe(true);
  });
});

describe("verifyBreakAdminPassword", () => {
  afterEach(() => {
    setNotionRuntimeEnv({});
    delete process.env.BREAK_ADMIN_PASSWORD;
  });

  it("returns configured error when password env is missing", () => {
    const result = verifyBreakAdminPassword("secret");

    expect(result).toEqual({
      success: false,
      error: "社員パスワードが設定されていません。管理者に確認してください。",
    });
  });

  it("rejects incorrect passwords", () => {
    setNotionRuntimeEnv({ BREAK_ADMIN_PASSWORD: "correct-password" });

    const result = verifyBreakAdminPassword("wrong-password");

    expect(result).toEqual({
      success: false,
      error: "パスワードが違います",
    });
  });

  it("accepts the configured password", () => {
    setNotionRuntimeEnv({ BREAK_ADMIN_PASSWORD: "correct-password" });

    const result = verifyBreakAdminPassword("correct-password");

    expect(result).toEqual({ success: true });
  });
});
