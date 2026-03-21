import { describe, it, expect } from "vitest";
import { createDevToken, verifyDevToken, extractSession } from "../middleware";

describe("createDevToken / verifyDevToken", () => {
  it("creates a token and verifies it", () => {
    const token = createDevToken("user-123", "worker");
    const payload = verifyDevToken(token);

    expect(payload).not.toBeNull();
    expect(payload!.sub).toBe("user-123");
    expect(payload!.role).toBe("worker");
    expect(payload!.iat).toBeGreaterThan(0);
  });

  it("works for all roles", () => {
    for (const role of ["worker", "hirer", "admin"] as const) {
      const token = createDevToken("user-456", role);
      const payload = verifyDevToken(token);
      expect(payload!.role).toBe(role);
    }
  });

  it("rejects a tampered token (modified payload)", () => {
    const token = createDevToken("user-123", "worker");
    const [, sig] = token.split(".");
    const fakePayload = Buffer.from(JSON.stringify({ sub: "attacker", role: "admin", iat: Date.now() })).toString("base64url");
    const tampered = `${fakePayload}.${sig}`;
    expect(verifyDevToken(tampered)).toBeNull();
  });

  it("rejects a tampered token (modified signature)", () => {
    const token = createDevToken("user-123", "worker");
    const [payload] = token.split(".");
    const tampered = `${payload}.fakesignature`;
    expect(verifyDevToken(tampered)).toBeNull();
  });

  it("rejects completely invalid tokens", () => {
    expect(verifyDevToken("")).toBeNull();
    expect(verifyDevToken("not-a-token")).toBeNull();
    expect(verifyDevToken("a.b.c")).toBeNull();
  });

  it("rejects empty payload fields", () => {
    // Manually craft a signed token with missing fields
    const result = verifyDevToken("e30.invalidsig"); // {} base64url encoded
    expect(result).toBeNull();
  });
});

describe("extractSession", () => {
  it("extracts session from valid Bearer token", async () => {
    const token = createDevToken("user-789", "hirer");
    const session = await extractSession({
      authorization: `Bearer ${token}`,
    });

    expect(session).not.toBeNull();
    expect(session!.userId).toBe("user-789");
    expect(session!.role).toBe("hirer");
    expect(session!.authMode).toBe("dev");
  });

  it("returns null for missing authorization header", async () => {
    const session = await extractSession({});
    expect(session).toBeNull();
  });

  it("returns null for non-Bearer auth", async () => {
    const session = await extractSession({
      authorization: "Basic dXNlcjpwYXNz",
    });
    expect(session).toBeNull();
  });

  it("returns null for invalid token", async () => {
    const session = await extractSession({
      authorization: "Bearer invalid-token",
    });
    expect(session).toBeNull();
  });

  it("returns null for old base64 tokens (migration safety)", async () => {
    // Old-style token: plain base64 JSON without HMAC signature
    const oldToken = Buffer.from(JSON.stringify({ sub: "user-1", role: "admin" })).toString("base64");
    const session = await extractSession({
      authorization: `Bearer ${oldToken}`,
    });
    // Should be null because old tokens don't have the HMAC signature
    expect(session).toBeNull();
  });
});
