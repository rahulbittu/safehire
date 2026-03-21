import { describe, it, expect, vi } from "vitest";
import { AuditLogger } from "../audit";

// Mock Supabase client
function createMockClient() {
  const insertedRows: Record<string, unknown>[] = [];
  const mockClient = {
    from: vi.fn().mockReturnValue({
      insert: vi.fn((row: Record<string, unknown>) => {
        insertedRows.push(row);
        return Promise.resolve({ error: null });
      }),
    }),
  };
  return { client: mockClient as any, insertedRows };
}

describe("AuditLogger", () => {
  describe("logDataAccess", () => {
    it("logs data access with correct fields", async () => {
      const { client, insertedRows } = createMockClient();
      const logger = new AuditLogger(client);

      await logger.logDataAccess({
        actorId: "hirer-1",
        resourceType: "trust_card",
        resourceId: "worker-1",
        fieldsAccessed: ["trust_card_summary"],
      });

      expect(insertedRows).toHaveLength(1);
      expect(insertedRows[0].actor_id).toBe("hirer-1");
      expect(insertedRows[0].action).toBe("data_access");
      expect(insertedRows[0].resource_type).toBe("trust_card");
      expect(insertedRows[0].resource_id).toBe("worker-1");
      expect((insertedRows[0].metadata as Record<string, unknown>).fieldsAccessed).toEqual(["trust_card_summary"]);
    });

    it("logs expanded access with consented fields", async () => {
      const { client, insertedRows } = createMockClient();
      const logger = new AuditLogger(client);

      await logger.logDataAccess({
        actorId: "hirer-1",
        resourceType: "trust_card",
        resourceId: "worker-1",
        fieldsAccessed: ["full_name", "skills", "experience_years"],
      });

      expect(insertedRows).toHaveLength(1);
      const metadata = insertedRows[0].metadata as Record<string, unknown>;
      expect(metadata.fieldsAccessed).toEqual(["full_name", "skills", "experience_years"]);
    });
  });

  describe("logConsentChange", () => {
    it("logs consent grant", async () => {
      const { client, insertedRows } = createMockClient();
      const logger = new AuditLogger(client);

      await logger.logConsentChange({
        actorId: "worker-1",
        consentId: "consent-1",
        action: "granted",
        workerId: "worker-1",
        hirerId: "hirer-1",
      });

      expect(insertedRows).toHaveLength(1);
      expect(insertedRows[0].action).toBe("consent_granted");
      expect(insertedRows[0].resource_type).toBe("consent_grant");
      expect(insertedRows[0].resource_id).toBe("consent-1");
    });

    it("logs consent revocation", async () => {
      const { client, insertedRows } = createMockClient();
      const logger = new AuditLogger(client);

      await logger.logConsentChange({
        actorId: "worker-1",
        consentId: "consent-1",
        action: "revoked",
        workerId: "worker-1",
        hirerId: "hirer-1",
      });

      expect(insertedRows).toHaveLength(1);
      expect(insertedRows[0].action).toBe("consent_revoked");
    });
  });

  describe("log (generic)", () => {
    it("logs generic audit events", async () => {
      const { client, insertedRows } = createMockClient();
      const logger = new AuditLogger(client);

      await logger.log({
        actorId: "user-1",
        action: "consent_request_created",
        resourceType: "consent_request",
        resourceId: "req-1",
        metadata: { workerId: "worker-1", fields: ["full_name"] },
      });

      expect(insertedRows).toHaveLength(1);
      expect(insertedRows[0].action).toBe("consent_request_created");
      expect(insertedRows[0].resource_type).toBe("consent_request");
    });
  });

  describe("Error handling", () => {
    it("does not throw when audit log write fails", async () => {
      const mockClient = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockResolvedValue({ error: { message: "DB error" } }),
        }),
      };

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const logger = new AuditLogger(mockClient as any);

      // Should not throw
      await logger.logDataAccess({
        actorId: "user-1",
        resourceType: "test",
        resourceId: "test-1",
        fieldsAccessed: [],
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to write audit log:",
        { message: "DB error" }
      );
      consoleSpy.mockRestore();
    });
  });

  describe("Sensitive access logging coverage", () => {
    it("logs when hirer views trust card without consent (limited view)", async () => {
      const { client, insertedRows } = createMockClient();
      const logger = new AuditLogger(client);

      // Simulate hirer viewing a trust card without consent
      await logger.logDataAccess({
        actorId: "hirer-1",
        resourceType: "trust_card",
        resourceId: "worker-1",
        fieldsAccessed: ["trust_card_summary"],
      });

      expect(insertedRows).toHaveLength(1);
      expect(insertedRows[0].action).toBe("data_access");
      const fields = (insertedRows[0].metadata as Record<string, unknown>).fieldsAccessed;
      expect(fields).toEqual(["trust_card_summary"]);
    });

    it("logs when hirer views trust card with consent (expanded view)", async () => {
      const { client, insertedRows } = createMockClient();
      const logger = new AuditLogger(client);

      // Simulate hirer viewing with consent
      await logger.logDataAccess({
        actorId: "hirer-1",
        resourceType: "trust_card",
        resourceId: "worker-1",
        fieldsAccessed: ["full_name", "skills", "experience_years", "verified_at"],
      });

      expect(insertedRows).toHaveLength(1);
      const fields = (insertedRows[0].metadata as Record<string, unknown>).fieldsAccessed;
      expect(fields).toContain("full_name");
      expect(fields).toContain("skills");
      expect(fields).not.toContain("encrypted_aadhaar_hash");
    });

    it("includes timestamp in every audit entry", async () => {
      const { client, insertedRows } = createMockClient();
      const logger = new AuditLogger(client);

      await logger.log({
        actorId: "user-1",
        action: "test_action",
        resourceType: "test",
        resourceId: "test-1",
      });

      expect(insertedRows[0].created_at).toBeTruthy();
      // Should be a valid ISO date
      expect(new Date(insertedRows[0].created_at as string).getTime()).toBeGreaterThan(0);
    });
  });
});
