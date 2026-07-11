import { stdin, stdout, stderr } from "node:process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { verifyAccessPassword } from "../src/lib/auth-password.ts";

function readAppAccessPasswordHash() {
  for (const line of readFileSync(join(process.cwd(), ".env"), "utf8").split("\n")) {
    const prefix = "APP_ACCESS_PASSWORD_HASH=";
    if (!line.startsWith(prefix)) continue;

    let value = line.slice(prefix.length).trim().replace(/\r$/, "");
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    return value || undefined;
  }

  return undefined;
}

async function readHiddenPassword() {
  if (!stdin.isTTY) {
    stderr.write("Error: 対話入力にはターミナル（TTY）が必要です。\n");
    process.exit(1);
  }

  return new Promise((resolve) => {
    stdout.write("Password: ");

    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    let password = "";

    const onData = (chunk) => {
      const char = chunk.toString();

      switch (char) {
        case "\n":
        case "\r":
        case "\u0004":
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener("data", onData);
          stdout.write("\n");
          resolve(password);
          break;
        case "\u0003":
          stdin.setRawMode(false);
          stdout.write("\n");
          process.exit(130);
          break;
        case "\u007f":
        case "\b":
          if (password.length > 0) {
            password = password.slice(0, -1);
          }
          break;
        default:
          if (char >= " " && char <= "~") {
            password += char;
          }
          break;
      }
    };

    stdin.on("data", onData);
  });
}

const hash = readAppAccessPasswordHash();
if (!hash) {
  stderr.write("Error: APP_ACCESS_PASSWORD_HASH が見つかりません。\n");
  process.exit(1);
}

const password = await readHiddenPassword();
const matched = await verifyAccessPassword(password.trim(), hash);
stdout.write(`${matched ? "一致" : "不一致"}\n`);
