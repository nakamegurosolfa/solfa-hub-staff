import { readFileSync } from "node:fs";
import { join } from "node:path";

type RuntimeEnv = Record<string, string | undefined>;

let runtimeEnv: RuntimeEnv = {};

const ENV_KEYS = [
  "NOTION_TOKEN",
  "NOTION_PAGE_ID",
  "NOTION_COCKTAIL_DATABASE_ID",
  "NOTION_MANUAL_DATABASE_ID",
  "NOTION_EMPLOYEE_WORK_DATABASE_ID",
  "NOTION_LOST_ITEMS_DATABASE_ID",
  "NOTION_BREAKS_DATABASE_ID",
  "APP_ACCESS_PASSWORD_HASH",
  "EMPLOYEE_ACCESS_PASSWORD_HASH",
  "SESSION_SECRET",
  "APP_AUTH_VERSION",
  "EMPLOYEE_AUTH_VERSION",
  "RESEND_API_KEY",
  "RESEND_FROM",
  "BREAK_REPORT_TO",
  "BREAK_ADMIN_PASSWORD",
] as const;

function parseDotenvLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return undefined;

  const separatorIndex = trimmed.indexOf("=");
  if (separatorIndex <= 0) return undefined;

  const key = trimmed.slice(0, separatorIndex).trim();
  let value = trimmed.slice(separatorIndex + 1).trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return value ? { key, value } : undefined;
}

function readLocalDotenvFile(): RuntimeEnv {
  if (process.env.NODE_ENV === "production") {
    return {};
  }

  const parsed: RuntimeEnv = {};

  for (const filename of [".env", ".env.local"]) {
    try {
      const envPath = join(process.cwd(), filename);
      for (const line of readFileSync(envPath, "utf8").split("\n")) {
        const entry = parseDotenvLine(line);
        if (!entry || !ENV_KEYS.includes(entry.key as (typeof ENV_KEYS)[number])) continue;
        parsed[entry.key] = entry.value;
      }
    } catch {
      // file may not exist
    }
  }

  return parsed;
}

export function setNotionRuntimeEnv(env: unknown) {
  const next: RuntimeEnv = {};

  if (env && typeof env === "object") {
    for (const key of ENV_KEYS) {
      const value = (env as RuntimeEnv)[key];
      if (typeof value === "string" && value.trim()) {
        next[key] = value.trim();
      }
    }
  }

  for (const key of ENV_KEYS) {
    const fromProcess = process.env[key]?.trim();
    if (fromProcess) {
      next[key] = fromProcess;
    }
  }

  const localDotenv = readLocalDotenvFile();
  for (const key of ENV_KEYS) {
    const value = localDotenv[key];
    if (value) {
      next[key] = value;
    }
  }

  runtimeEnv = next;

  for (const key of ENV_KEYS) {
    const value = runtimeEnv[key];
    if (value) {
      process.env[key] = value;
    }
  }
}

setNotionRuntimeEnv({});

export function getRuntimeEnv(key: (typeof ENV_KEYS)[number]): string | undefined {
  return (runtimeEnv[key] ?? process.env[key]?.trim()) || undefined;
}
