import { timingSafeEqual } from "node:crypto";
import { getCookie, setCookie } from "@tanstack/react-start/server";

import {
  createAuthSessionPayload,
  createSignedAuthToken,
  readSessionSecretFromEnv,
  verifySignedAuthToken,
} from "@/lib/auth-session-token";
import type { BreakEntry } from "@/lib/breaks-types";
import { getRuntimeEnv } from "@/lib/notion-env";

export type BreakAdminAuthResult =
  | { success: true }
  | { success: false; error: string };

const BREAK_ADMIN_COOKIE_NAME = "solfa_break_admin_auth";
const BREAK_ADMIN_AUTH_VERSION = "break-admin-v1";
const BREAK_ADMIN_SESSION_MAX_AGE = 60 * 60 * 12;

function readSessionSecret() {
  return readSessionSecretFromEnv(() => getRuntimeEnv("SESSION_SECRET"));
}

function baseCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

function secureCompare(input: string, expected: string): boolean {
  const inputBuffer = Buffer.from(input);
  const expectedBuffer = Buffer.from(expected);

  if (inputBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(inputBuffer, expectedBuffer);
}

function isManualCorrectionChange(before: BreakEntry, after: BreakEntry): boolean {
  if (before.startAt !== null && before.startAt !== after.startAt) {
    return true;
  }

  if (before.endAt !== null && before.endAt !== after.endAt) {
    return true;
  }

  return false;
}

export function requiresManualBreakCorrectionAuth(before: BreakEntry[], after: BreakEntry[]): boolean {
  return before.some((entry, index) => isManualCorrectionChange(entry, after[index] ?? entry));
}

export async function establishBreakAdminSession() {
  const secret = readSessionSecret();
  const token = await createSignedAuthToken(
    secret,
    createAuthSessionPayload(BREAK_ADMIN_SESSION_MAX_AGE, BREAK_ADMIN_AUTH_VERSION),
  );
  setCookie(BREAK_ADMIN_COOKIE_NAME, token, baseCookieOptions());
}

export async function hasBreakAdminAuth() {
  return verifySignedAuthToken(
    readSessionSecret(),
    getCookie(BREAK_ADMIN_COOKIE_NAME),
    BREAK_ADMIN_AUTH_VERSION,
  );
}

export async function requireBreakAdminAuth() {
  const authenticated = await hasBreakAdminAuth();
  if (!authenticated) {
    throw new Response("Break admin authentication required", { status: 403 });
  }
}

export function verifyBreakAdminPassword(password: string): BreakAdminAuthResult {
  const configuredPassword = getRuntimeEnv("BREAK_ADMIN_PASSWORD");

  if (!configuredPassword) {
    return {
      success: false,
      error: "社員パスワードが設定されていません。管理者に確認してください。",
    };
  }

  if (!secureCompare(password, configuredPassword)) {
    return { success: false, error: "パスワードが違います" };
  }

  return { success: true };
}
