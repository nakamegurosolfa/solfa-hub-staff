import { stdin, stdout, stderr } from "node:process";

import { hashAccessPassword } from "../src/lib/auth-password.ts";

async function readHiddenPassword(prompt) {
  if (!stdin.isTTY) {
    stderr.write("Error: 対話入力にはターミナル（TTY）が必要です。\n");
    process.exit(1);
  }

  return new Promise((resolve) => {
    stdout.write(prompt);

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

stderr.write(
  "パスワードを入力してください（入力内容は表示されません）。\n" +
    "アプリ共通用・社員専用のどちらにも同じ手順でハッシュを生成できます。\n",
);

const password = await readHiddenPassword("Password: ");
const confirm = await readHiddenPassword("Confirm: ");

if (!password) {
  stderr.write("Error: パスワードが空です。\n");
  process.exit(1);
}

if (password !== confirm) {
  stderr.write("Error: 確認用パスワードが一致しません。\n");
  process.exit(1);
}

const hash = await hashAccessPassword(password);
stdout.write(`${hash}\n`);
