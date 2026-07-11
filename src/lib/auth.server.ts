import { deleteCookie, getCookie, getRequestIP, setCookie } from "@tanstack/react-start/server";

import { verifyAccessPassword } from "@/lib/auth-password";
import {
  createAuthSessionPayload,
  createSignedAuthToken,
  readRequiredAuthVersion,
  readSessionSecretFromEnv,
  verifySignedAuthToken,
} from "@/lib/auth-session-token";
import { getRuntimeEnv } from "@/lib/notion-env";

export const AUTH_ERROR_MESSAGE = "パスワードが違います";

export type AuthStatus = {
  appAuthenticated: boolean;
  employeeAuthenticated: boolean;
};

const APP_COOKIE_NAME = "solfa_app_auth";
const EMPLOYEE_COOKIE_NAME = "solfa_employee_auth";
const APP_SESSION_MAX_AGE = 60 * 60 * 24 * 30;
const EMPLOYEE_SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 5;

type RateLimitEntry = {
  failures: number;
  blockedUntil: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

function readSessionSecret() {
  return readSessionSecretFromEnv(() => getRuntimeEnv("SESSION_SECRET"));
}

function readAppAuthVersion() {
  return readRequiredAuthVersion(() => getRuntimeEnv("APP_AUTH_VERSION"), "APP_AUTH_VERSION");
}

function readEmployeeAuthVersion() {
  return readRequiredAuthVersion(() => getRuntimeEnv("EMPLOYEE_AUTH_VERSION"), "EMPLOYEE_AUTH_VERSION");
}

function readAppPasswordHash() {
  const hash = process.env.APP_ACCESS_PASSWORD_HASH?.trim();
  if (!hash) {
    throw new Error("APP_ACCESS_PASSWORD_HASH is not configured.");
  }
  return hash;
}

function readEmployeePasswordHash() {
  const hash = getRuntimeEnv("EMPLOYEE_ACCESS_PASSWORD_HASH");
  if (!hash) {
    throw new Error("EMPLOYEE_ACCESS_PASSWORD_HASH is not configured.");
  }
  return hash;
}

function isProductionRequest() {
  return process.env.NODE_ENV === "production";
}

function baseCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProductionRequest(),
    path: "/",
    maxAge,
  };
}

async function createSessionCookie(name: string, maxAge: number, version: string) {
  const secret = readSessionSecret();
  const token = await createSignedAuthToken(secret, createAuthSessionPayload(maxAge, version));
  setCookie(name, token, baseCookieOptions(maxAge));
}

async function hasValidAppSessionCookie(value = getCookie(APP_COOKIE_NAME)) {
  return verifySignedAuthToken(readSessionSecret(), value, readAppAuthVersion());
}

async function hasValidEmployeeSessionCookie(value = getCookie(EMPLOYEE_COOKIE_NAME)) {
  return verifySignedAuthToken(readSessionSecret(), value, readEmployeeAuthVersion());
}

function getRateLimitKey(scope: "app" | "employee") {
  return `${scope}:${getRequestIP({ xForwardedFor: true }) ?? "unknown"}`;
}

function assertNotRateLimited(scope: "app" | "employee") {
  const entry = rateLimitStore.get(getRateLimitKey(scope));
  if (entry && entry.blockedUntil > Date.now()) {
    throw new Response(AUTH_ERROR_MESSAGE, { status: 429 });
  }
}

function recordFailedAttempt(scope: "app" | "employee") {
  const key = getRateLimitKey(scope);
  const entry = rateLimitStore.get(key) ?? { failures: 0, blockedUntil: 0 };
  entry.failures += 1;

  if (entry.failures >= RATE_LIMIT_MAX_ATTEMPTS) {
    entry.blockedUntil = Date.now() + RATE_LIMIT_WINDOW_MS;
    entry.failures = 0;
  }

  rateLimitStore.set(key, entry);
}

function clearFailedAttempts(scope: "app" | "employee") {
  rateLimitStore.delete(getRateLimitKey(scope));
}

export async function getAuthStatus(): Promise<AuthStatus> {
  const [appAuthenticated, employeeAuthenticated] = await Promise.all([
    hasValidAppSessionCookie(),
    hasValidEmployeeSessionCookie(),
  ]);

  return { appAuthenticated, employeeAuthenticated };
}

export async function loginWithAppPassword(password: string) {
  assertNotRateLimited("app");

  const valid = await verifyAccessPassword(password.trim(), readAppPasswordHash());
  if (!valid) {
    recordFailedAttempt("app");
    return { success: false as const, error: AUTH_ERROR_MESSAGE };
  }

  clearFailedAttempts("app");
  await createSessionCookie(APP_COOKIE_NAME, APP_SESSION_MAX_AGE, readAppAuthVersion());
  return { success: true as const };
}

export async function loginWithEmployeePassword(password: string) {
  assertNotRateLimited("employee");

  const appAuthenticated = await hasValidAppSessionCookie();
  if (!appAuthenticated) {
    return { success: false as const, error: AUTH_ERROR_MESSAGE };
  }

  const valid = await verifyAccessPassword(password, readEmployeePasswordHash());
  if (!valid) {
    recordFailedAttempt("employee");
    return { success: false as const, error: AUTH_ERROR_MESSAGE };
  }

  clearFailedAttempts("employee");
  await createSessionCookie(EMPLOYEE_COOKIE_NAME, EMPLOYEE_SESSION_MAX_AGE, readEmployeeAuthVersion());
  return { success: true as const };
}

export function clearAuthCookies() {
  const options = baseCookieOptions(0);
  deleteCookie(APP_COOKIE_NAME, options);
  deleteCookie(EMPLOYEE_COOKIE_NAME, options);
}

export async function requireAppAuth() {
  const authenticated = await hasValidAppSessionCookie();
  if (!authenticated) {
    throw new Response("Unauthorized", { status: 401 });
  }
}

export async function requireEmployeeAuth() {
  await requireAppAuth();
  const authenticated = await hasValidEmployeeSessionCookie();
  if (!authenticated) {
    throw new Response("Employee authentication required", { status: 403 });
  }
}

export async function hasEmployeeAuth() {
  return hasValidEmployeeSessionCookie();
}

export async function hasAppAuthFromCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) return false;

  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((part) => {
      const [name, ...rest] = part.trim().split("=");
      return [name, decodeURIComponent(rest.join("="))];
    }),
  );

  return hasValidAppSessionCookie(cookies[APP_COOKIE_NAME]);
}
