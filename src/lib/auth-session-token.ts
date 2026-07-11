type AuthSessionPayload = {
  exp: number;
  v: string;
};

function readSessionSecretFromEnv(getSecret: () => string | undefined) {
  const secret = getSecret();
  if (!secret) {
    throw new Error("SESSION_SECRET is not configured.");
  }
  return secret;
}

function bytesToBase64Url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function signPayload(payload: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return bytesToBase64Url(new Uint8Array(signature));
}

async function verifyPayload(payload: string, signature: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );

  try {
    return await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlToBytes(signature),
      new TextEncoder().encode(payload),
    );
  } catch {
    return false;
  }
}

export async function createSignedAuthToken(
  secret: string,
  payload: AuthSessionPayload,
): Promise<string> {
  const encodedPayload = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await signPayload(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

export async function verifySignedAuthToken(
  secret: string,
  token: string | undefined,
  expectedVersion: string,
): Promise<boolean> {
  if (!token) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const valid = await verifyPayload(payload, signature, secret);
  if (!valid) return false;

  try {
    const decoded = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload))) as Partial<AuthSessionPayload>;
    return (
      typeof decoded.exp === "number" &&
      decoded.exp > Date.now() &&
      typeof decoded.v === "string" &&
      decoded.v === expectedVersion
    );
  } catch {
    return false;
  }
}

export function readRequiredAuthVersion(
  getVersion: () => string | undefined,
  envName: "APP_AUTH_VERSION" | "EMPLOYEE_AUTH_VERSION",
) {
  const version = getVersion()?.trim();
  if (!version) {
    throw new Error(`${envName} is not configured.`);
  }
  return version;
}

export function createAuthSessionPayload(maxAgeSeconds: number, version: string): AuthSessionPayload {
  return {
    exp: Date.now() + maxAgeSeconds * 1000,
    v: version,
  };
}

export { readSessionSecretFromEnv };
