import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { extractNotionId } from "@notionhq/client";

const ENV_KEY = "NOTION_EMPLOYEE_WORK_DATABASE_ID";
const input = process.argv[2]?.trim();

if (!input) {
  process.stderr.write(
    "Usage: node scripts/set-notion-employee-work-database-id.mjs <notion-database-url-or-id>\n",
  );
  process.exit(1);
}

const extracted = extractNotionId(input);
if (!extracted) {
  process.stderr.write("Error: Notion database ID could not be extracted from the input.\n");
  process.exit(1);
}

const databaseId = extracted.replace(/-/g, "");
const envPath = join(process.cwd(), ".env");
const lines = readFileSync(envPath, "utf8").split("\n");
let found = false;

const updated = lines.map((line) => {
  if (!line.startsWith(`${ENV_KEY}=`)) {
    return line;
  }

  found = true;
  return `${ENV_KEY}=${databaseId}`;
});

if (!found) {
  process.stderr.write(`Error: ${ENV_KEY} was not found in .env.\n`);
  process.exit(1);
}

writeFileSync(envPath, updated.join("\n"));
process.stdout.write(`${ENV_KEY} を .env に設定しました。\n`);
process.stdout.write("開発サーバーを再起動してください。\n");
