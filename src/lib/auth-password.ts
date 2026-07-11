const PBKDF2_ITERATIONS = 310_000;
const encoder = new TextEncoder();

function bytesToBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes));
}

function base64ToBytes(value: string): Uint8Array | null {
  try {
    return new Uint8Array(Buffer.from(value.trim(), "base64"));
  } catch {
    return null;
  }
}

async function derivePasswordHash(password: string, salt: Uint8Array, iterations: number) {
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    keyMaterial,
    256,
  );
  return new Uint8Array(bits);
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a[index] ^ b[index];
  }
  return mismatch === 0;
}

export async function hashAccessPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePasswordHash(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2-sha256$${PBKDF2_ITERATIONS}$${bytesToBase64(salt)}$${bytesToBase64(hash)}`;
}

export async function verifyAccessPassword(password: string, storedHash: string) {
  const parts = storedHash.split("$").map((part) => part.trim());
  if (parts.length !== 4) {
    return false;
  }

  const [scheme, iterationsValue, saltValue, hashValue] = parts;
  if (scheme !== "pbkdf2-sha256" || !iterationsValue || !saltValue || !hashValue) {
    return false;
  }

  const iterations = Number(iterationsValue);
  if (!Number.isFinite(iterations) || iterations <= 0) {
    return false;
  }

  const salt = base64ToBytes(saltValue);
  const expected = base64ToBytes(hashValue);
  if (!salt || !expected) {
    return false;
  }

  try {
    const actual = await derivePasswordHash(password, salt, iterations);
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
