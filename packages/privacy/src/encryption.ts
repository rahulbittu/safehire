/**
 * Field-level encryption helpers for sensitive data.
 *
 * Uses AES-256-GCM for symmetric encryption with Node.js crypto.
 * Uses HMAC-SHA-256 for one-way hashing.
 *
 * KEY MANAGEMENT:
 * - Encryption key is loaded from FIELD_ENCRYPTION_KEY env var (32 bytes, hex-encoded)
 * - Hash pepper is loaded from HASH_PEPPER env var
 * - In production, these should come from a KMS (AWS KMS, GCP KMS, Vault)
 * - Key rotation is NOT yet implemented — see REMAINING GAPS below
 *
 * REMAINING GAPS (not production-ready):
 * - No key rotation strategy
 * - No KMS integration (keys come from env vars)
 * - No key versioning in ciphertext format
 * - File-upload encryption is not implemented
 */
import { createCipheriv, createDecipheriv, randomBytes, createHmac } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit IV for GCM
const AUTH_TAG_LENGTH = 16;

function isRealSecurityRequired(): boolean {
  const env = process.env.APP_ENV;
  return env === "staging" || env === "production";
}

/**
 * Get the 32-byte encryption key from environment.
 * Falls back to a deterministic dev key in development/test.
 * Throws in staging/production if FIELD_ENCRYPTION_KEY is not set.
 */
function getEncryptionKey(): Buffer {
  const keyHex = process.env.FIELD_ENCRYPTION_KEY;
  if (keyHex) {
    const key = Buffer.from(keyHex, "hex");
    if (key.length !== 32) {
      throw new Error("FIELD_ENCRYPTION_KEY must be exactly 32 bytes (64 hex chars)");
    }
    return key;
  }

  if (isRealSecurityRequired()) {
    throw new Error(
      `[${process.env.APP_ENV?.toUpperCase()}] FIELD_ENCRYPTION_KEY is required. ` +
      `Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
    );
  }

  // DEV FALLBACK: deterministic key derived from a fixed string.
  // NOT SECURE — for local development and tests only.
  const devKey = createHmac("sha256", "safehire-dev-encryption-key")
    .update("dev-field-key")
    .digest();
  return devKey; // 32 bytes from HMAC-SHA-256
}

/**
 * Get the hash pepper from environment.
 * Throws in staging/production if HASH_PEPPER is not set.
 */
function getHashPepper(): string {
  const pepper = process.env.HASH_PEPPER;
  if (pepper) return pepper;

  if (isRealSecurityRequired()) {
    throw new Error(
      `[${process.env.APP_ENV?.toUpperCase()}] HASH_PEPPER is required. ` +
      `Set a strong random string as the HMAC pepper.`
    );
  }

  return "safehire-dev-hash-pepper";
}

/**
 * Encrypt a field value using AES-256-GCM.
 *
 * Output format: "enc:v1:<base64(iv + ciphertext + authTag)>"
 * - iv: 12 bytes
 * - authTag: 16 bytes (appended after ciphertext)
 *
 * @param plaintext - The value to encrypt
 * @returns Encrypted string with version prefix
 */
export function encryptField(plaintext: string): string {
  if (!plaintext) return "";

  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf-8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Pack: iv + encrypted + authTag
  const packed = Buffer.concat([iv, encrypted, authTag]);
  return `enc:v1:${packed.toString("base64")}`;
}

/**
 * Decrypt an AES-256-GCM encrypted field value.
 *
 * @param ciphertext - Encrypted string with "enc:v1:" prefix
 * @returns Decrypted plaintext
 */
export function decryptField(ciphertext: string): string {
  if (!ciphertext) return "";

  const match = ciphertext.match(/^enc:v1:(.+)$/);
  if (!match) {
    throw new Error("Invalid ciphertext format — expected 'enc:v1:' prefix");
  }

  const packed = Buffer.from(match[1], "base64");
  if (packed.length < IV_LENGTH + AUTH_TAG_LENGTH + 1) {
    throw new Error("Ciphertext too short");
  }

  const key = getEncryptionKey();
  const iv = packed.subarray(0, IV_LENGTH);
  const authTag = packed.subarray(packed.length - AUTH_TAG_LENGTH);
  const encrypted = packed.subarray(IV_LENGTH, packed.length - AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf-8");
}

/**
 * One-way HMAC-SHA-256 hash for identity deduplication.
 * Uses a server-side pepper to prevent rainbow table attacks.
 *
 * CRITICAL: Raw Aadhaar numbers must NEVER be stored or logged.
 *
 * @param value - The identity number to hash
 * @returns Hex-encoded HMAC hash with version prefix
 */
export function hashField(value: string): string {
  if (!value) throw new Error("Cannot hash empty value");

  // Normalize: trim whitespace, remove spaces/dashes
  const normalized = value.trim().replace(/[\s-]/g, "");

  const pepper = getHashPepper();
  const hash = createHmac("sha256", pepper)
    .update(normalized)
    .digest("hex");

  return `hmac:v1:${hash}`;
}
