import {
  createAuthSessionPayload,
  createSignedAuthToken,
  verifySignedAuthToken,
} from "../src/lib/auth-session-token.ts";

const secret = "test-session-secret";

async function run() {
  const appTokenV1 = await createSignedAuthToken(secret, createAuthSessionPayload(3600, "1"));
  const employeeTokenV1 = await createSignedAuthToken(secret, createAuthSessionPayload(3600, "1"));

  const appValidV1 = await verifySignedAuthToken(secret, appTokenV1, "1");
  const appInvalidV2 = await verifySignedAuthToken(secret, appTokenV1, "2");
  const employeeValidV1 = await verifySignedAuthToken(secret, employeeTokenV1, "1");
  const employeeInvalidV2 = await verifySignedAuthToken(secret, employeeTokenV1, "2");

  const tampered = appTokenV1.replace(/.$/, appTokenV1.endsWith("a") ? "b" : "a");
  const tamperedInvalid = await verifySignedAuthToken(secret, tampered, "1");

  const results = [
    ["APP v1 token accepts v1", appValidV1],
    ["APP v1 token rejects v2", !appInvalidV2],
    ["Employee v1 token accepts v1", employeeValidV1],
    ["Employee v1 token rejects v2", !employeeInvalidV2],
    ["Tampered token rejected", !tamperedInvalid],
  ];

  for (const [label, ok] of results) {
    console.log(`${ok ? "PASS" : "FAIL"}: ${label}`);
    if (!ok) process.exitCode = 1;
  }
}

await run();
