import { describe, it, expect, afterEach, vi } from "vitest";

// We need to test the environment gating behavior of dev auth.
// The middleware module reads process.env.APP_ENV at function call time.

describe("Environment gating of dev auth", () => {
  const originalEnv = process.env.APP_ENV;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.APP_ENV;
    } else {
      process.env.APP_ENV = originalEnv;
    }
    vi.resetModules();
  });

  async function loadModule() {
    // Re-import to get fresh module evaluation
    return await import("../middleware");
  }

  describe("isDevAuthAllowed", () => {
    it("returns true when APP_ENV is not set (defaults to development)", async () => {
      delete process.env.APP_ENV;
      const { isDevAuthAllowed } = await loadModule();
      expect(isDevAuthAllowed()).toBe(true);
    });

    it("returns true when APP_ENV=development", async () => {
      process.env.APP_ENV = "development";
      const { isDevAuthAllowed } = await loadModule();
      expect(isDevAuthAllowed()).toBe(true);
    });

    it("returns true when APP_ENV=test", async () => {
      process.env.APP_ENV = "test";
      const { isDevAuthAllowed } = await loadModule();
      expect(isDevAuthAllowed()).toBe(true);
    });

    it("returns false when APP_ENV=staging", async () => {
      process.env.APP_ENV = "staging";
      const { isDevAuthAllowed } = await loadModule();
      expect(isDevAuthAllowed()).toBe(false);
    });

    it("returns false when APP_ENV=production", async () => {
      process.env.APP_ENV = "production";
      const { isDevAuthAllowed } = await loadModule();
      expect(isDevAuthAllowed()).toBe(false);
    });
  });

  describe("createDevToken", () => {
    it("creates token in development", async () => {
      process.env.APP_ENV = "development";
      const { createDevToken } = await loadModule();
      const token = createDevToken("user-1", "worker");
      expect(token).toBeTruthy();
      expect(token.split(".")).toHaveLength(2);
    });

    it("throws in production", async () => {
      process.env.APP_ENV = "production";
      const { createDevToken } = await loadModule();
      expect(() => createDevToken("user-1", "worker")).toThrow("BLOCKED");
    });

    it("throws in staging", async () => {
      process.env.APP_ENV = "staging";
      const { createDevToken } = await loadModule();
      expect(() => createDevToken("user-1", "worker")).toThrow("BLOCKED");
    });
  });

  describe("verifyDevToken", () => {
    it("verifies valid token in development", async () => {
      process.env.APP_ENV = "development";
      const { createDevToken, verifyDevToken } = await loadModule();
      const token = createDevToken("user-1", "worker");
      const payload = verifyDevToken(token);
      expect(payload).not.toBeNull();
      expect(payload!.sub).toBe("user-1");
    });

    it("returns null for valid token in production (dev auth blocked)", async () => {
      // Create token in dev mode
      process.env.APP_ENV = "development";
      const devModule = await loadModule();
      const token = devModule.createDevToken("user-1", "worker");

      // Try to verify in production mode
      process.env.APP_ENV = "production";
      const prodModule = await loadModule();
      const result = prodModule.verifyDevToken(token);
      expect(result).toBeNull();
    });
  });

  describe("extractSession", () => {
    it("rejects dev tokens in production", async () => {
      // Create token in dev mode
      process.env.APP_ENV = "development";
      const devModule = await loadModule();
      const token = devModule.createDevToken("user-1", "hirer");

      // Try to extract session in production mode
      process.env.APP_ENV = "production";
      const prodModule = await loadModule();
      const session = await prodModule.extractSession({
        authorization: `Bearer ${token}`,
      });
      expect(session).toBeNull();
    });

    it("accepts dev tokens in development", async () => {
      process.env.APP_ENV = "development";
      const { createDevToken, extractSession } = await loadModule();
      const token = createDevToken("user-1", "hirer");
      const session = await extractSession({
        authorization: `Bearer ${token}`,
      });
      expect(session).not.toBeNull();
      expect(session!.authMode).toBe("dev");
    });

    it("accepts dev tokens in test environment", async () => {
      process.env.APP_ENV = "test";
      const { createDevToken, extractSession } = await loadModule();
      const token = createDevToken("user-1", "admin");
      const session = await extractSession({
        authorization: `Bearer ${token}`,
      });
      expect(session).not.toBeNull();
      expect(session!.role).toBe("admin");
    });
  });
});
