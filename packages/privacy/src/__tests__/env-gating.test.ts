import { describe, it, expect, afterEach, vi } from "vitest";

describe("Encryption environment gating", () => {
  const originalAppEnv = process.env.APP_ENV;
  const originalEncKey = process.env.FIELD_ENCRYPTION_KEY;
  const originalPepper = process.env.HASH_PEPPER;

  afterEach(() => {
    // Restore env
    if (originalAppEnv === undefined) delete process.env.APP_ENV;
    else process.env.APP_ENV = originalAppEnv;
    if (originalEncKey === undefined) delete process.env.FIELD_ENCRYPTION_KEY;
    else process.env.FIELD_ENCRYPTION_KEY = originalEncKey;
    if (originalPepper === undefined) delete process.env.HASH_PEPPER;
    else process.env.HASH_PEPPER = originalPepper;
    vi.resetModules();
  });

  async function loadModule() {
    return await import("../encryption");
  }

  describe("Development environment (default)", () => {
    it("allows encryption with dev fallback key", async () => {
      delete process.env.APP_ENV;
      delete process.env.FIELD_ENCRYPTION_KEY;
      const { encryptField, decryptField } = await loadModule();
      const encrypted = encryptField("test data");
      expect(encrypted).toMatch(/^enc:v1:/);
      expect(decryptField(encrypted)).toBe("test data");
    });

    it("allows hashing with dev fallback pepper", async () => {
      delete process.env.APP_ENV;
      delete process.env.HASH_PEPPER;
      const { hashField } = await loadModule();
      const hash = hashField("test-value");
      expect(hash).toMatch(/^hmac:v1:[a-f0-9]{64}$/);
    });
  });

  describe("Production environment", () => {
    it("throws when FIELD_ENCRYPTION_KEY is missing", async () => {
      process.env.APP_ENV = "production";
      delete process.env.FIELD_ENCRYPTION_KEY;
      const { encryptField } = await loadModule();
      expect(() => encryptField("test")).toThrow("FIELD_ENCRYPTION_KEY is required");
    });

    it("throws when HASH_PEPPER is missing", async () => {
      process.env.APP_ENV = "production";
      delete process.env.HASH_PEPPER;
      const { hashField } = await loadModule();
      expect(() => hashField("test")).toThrow("HASH_PEPPER is required");
    });

    it("works when real keys are provided", async () => {
      process.env.APP_ENV = "production";
      // Generate a 32-byte hex key
      const crypto = await import("crypto");
      process.env.FIELD_ENCRYPTION_KEY = crypto.randomBytes(32).toString("hex");
      process.env.HASH_PEPPER = "real-production-pepper-value";

      const { encryptField, decryptField, hashField } = await loadModule();

      const encrypted = encryptField("production data");
      expect(encrypted).toMatch(/^enc:v1:/);
      expect(decryptField(encrypted)).toBe("production data");

      const hash = hashField("identity-number");
      expect(hash).toMatch(/^hmac:v1:[a-f0-9]{64}$/);
    });
  });

  describe("Staging environment", () => {
    it("throws when FIELD_ENCRYPTION_KEY is missing", async () => {
      process.env.APP_ENV = "staging";
      delete process.env.FIELD_ENCRYPTION_KEY;
      const { encryptField } = await loadModule();
      expect(() => encryptField("test")).toThrow("FIELD_ENCRYPTION_KEY is required");
    });
  });
});
