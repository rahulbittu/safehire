import { describe, it, expect } from "vitest";
import { encryptField, decryptField, hashField } from "../encryption";

describe("encryptField / decryptField (AES-256-GCM)", () => {
  it("round-trips a simple string", () => {
    const original = "Hello, this is sensitive data";
    const encrypted = encryptField(original);
    const decrypted = decryptField(encrypted);
    expect(decrypted).toBe(original);
  });

  it("round-trips unicode text", () => {
    const original = "यह एक परीक्षण है। मराठी: हे एक चाचणी आहे।";
    const encrypted = encryptField(original);
    const decrypted = decryptField(encrypted);
    expect(decrypted).toBe(original);
  });

  it("round-trips long text", () => {
    const original = "A".repeat(10000);
    const encrypted = encryptField(original);
    const decrypted = decryptField(encrypted);
    expect(decrypted).toBe(original);
  });

  it("encrypted output has enc:v1: prefix", () => {
    const encrypted = encryptField("test");
    expect(encrypted).toMatch(/^enc:v1:/);
  });

  it("returns empty string for empty input", () => {
    expect(encryptField("")).toBe("");
    expect(decryptField("")).toBe("");
  });

  it("throws on invalid ciphertext format", () => {
    expect(() => decryptField("not-valid-format")).toThrow("Invalid ciphertext format");
  });

  it("throws on old placeholder format", () => {
    expect(() => decryptField("enc:placeholder:dGVzdA==")).toThrow("Invalid ciphertext format");
  });

  it("produces different ciphertext for same plaintext (random IV)", () => {
    const enc1 = encryptField("same message");
    const enc2 = encryptField("same message");
    expect(enc1).not.toBe(enc2);
    // But both decrypt to the same value
    expect(decryptField(enc1)).toBe("same message");
    expect(decryptField(enc2)).toBe("same message");
  });

  it("detects tampering (GCM auth tag)", () => {
    const encrypted = encryptField("secure data");
    // Tamper with the base64 payload
    const parts = encrypted.split("enc:v1:");
    const buf = Buffer.from(parts[1], "base64");
    buf[buf.length - 1] ^= 0xff; // flip last byte of auth tag
    const tampered = `enc:v1:${buf.toString("base64")}`;
    expect(() => decryptField(tampered)).toThrow();
  });
});

describe("hashField (HMAC-SHA-256)", () => {
  it("returns a hash with hmac:v1: prefix", () => {
    const hash = hashField("123456789012");
    expect(hash).toMatch(/^hmac:v1:[a-f0-9]{64}$/);
  });

  it("produces consistent output for same input", () => {
    const hash1 = hashField("test-value");
    const hash2 = hashField("test-value");
    expect(hash1).toBe(hash2);
  });

  it("produces different output for different inputs", () => {
    const hash1 = hashField("value-one");
    const hash2 = hashField("value-two");
    expect(hash1).not.toBe(hash2);
  });

  it("normalizes input (trims whitespace, removes dashes)", () => {
    const hash1 = hashField("1234-5678-9012");
    const hash2 = hashField("123456789012");
    expect(hash1).toBe(hash2);
  });

  it("throws on empty input", () => {
    expect(() => hashField("")).toThrow("Cannot hash empty value");
  });

  it("hash is 64 hex characters (256 bits)", () => {
    const hash = hashField("test");
    const hexPart = hash.replace("hmac:v1:", "");
    expect(hexPart.length).toBe(64);
  });
});
