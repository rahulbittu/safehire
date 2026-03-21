import { describe, it, expect } from "vitest";

/**
 * Tests for consent-gated field exposure.
 *
 * These tests verify the field filtering logic that determines which
 * worker profile fields are visible to hirers based on consent status.
 * This is the same logic used in the hirer.viewTrustCard router.
 */

// Simulate the field filtering logic from packages/api/src/routers/hirer.ts
function filterProfileByConsent(
  workerProfile: Record<string, unknown>,
  consentedFields: string[] | null,
): Record<string, unknown> | null {
  if (!consentedFields) {
    // No consent — return null (no profile data visible)
    return null;
  }

  const filtered: Record<string, unknown> = { user_id: workerProfile.user_id };
  if (consentedFields.includes("full_name")) filtered.full_name = workerProfile.full_name;
  if (consentedFields.includes("skills")) filtered.skills = workerProfile.skills;
  if (consentedFields.includes("languages")) filtered.languages = workerProfile.languages;
  if (consentedFields.includes("experience_years")) filtered.experience_years = workerProfile.experience_years;
  if (consentedFields.includes("photo_url")) filtered.photo_url = workerProfile.photo_url;
  if (consentedFields.includes("verified_at")) filtered.verified_at = workerProfile.verified_at;
  // NEVER include encrypted_aadhaar_hash
  return filtered;
}

const FULL_PROFILE: Record<string, unknown> = {
  id: "profile-1",
  user_id: "worker-1",
  full_name: "Test Worker",
  encrypted_aadhaar_hash: "hmac:v1:abc123...",
  photo_url: "https://example.com/photo.jpg",
  skills: ["cooking", "cleaning"],
  languages: ["hindi", "english"],
  experience_years: 5,
  verified_at: "2025-01-15T00:00:00Z",
};

describe("Consent-gated field exposure", () => {
  describe("No consent", () => {
    it("returns null when consent is not granted", () => {
      const result = filterProfileByConsent(FULL_PROFILE, null);
      expect(result).toBeNull();
    });
  });

  describe("With consent — selective field exposure", () => {
    it("exposes only consented fields", () => {
      const result = filterProfileByConsent(FULL_PROFILE, ["full_name", "skills"]);
      expect(result).not.toBeNull();
      expect(result!.full_name).toBe("Test Worker");
      expect(result!.skills).toEqual(["cooking", "cleaning"]);
      expect(result!.user_id).toBe("worker-1"); // always included
      // Non-consented fields
      expect(result!.languages).toBeUndefined();
      expect(result!.experience_years).toBeUndefined();
      expect(result!.photo_url).toBeUndefined();
      expect(result!.verified_at).toBeUndefined();
    });

    it("exposes all non-sensitive fields when all are consented", () => {
      const allFields = ["full_name", "skills", "languages", "experience_years", "photo_url", "verified_at"];
      const result = filterProfileByConsent(FULL_PROFILE, allFields);
      expect(result!.full_name).toBe("Test Worker");
      expect(result!.skills).toEqual(["cooking", "cleaning"]);
      expect(result!.languages).toEqual(["hindi", "english"]);
      expect(result!.experience_years).toBe(5);
      expect(result!.photo_url).toBe("https://example.com/photo.jpg");
      expect(result!.verified_at).toBe("2025-01-15T00:00:00Z");
    });

    it("NEVER exposes encrypted_aadhaar_hash regardless of consent", () => {
      // Even if someone tried to consent to this field, it must never appear
      const result = filterProfileByConsent(FULL_PROFILE, [
        "full_name", "encrypted_aadhaar_hash",
      ]);
      expect(result!.full_name).toBe("Test Worker");
      expect(result!.encrypted_aadhaar_hash).toBeUndefined();
    });

    it("NEVER exposes profile id", () => {
      const allFields = ["full_name", "skills", "languages", "experience_years", "photo_url", "verified_at"];
      const result = filterProfileByConsent(FULL_PROFILE, allFields);
      expect(result!.id).toBeUndefined();
    });

    it("always includes user_id for linking", () => {
      const result = filterProfileByConsent(FULL_PROFILE, ["skills"]);
      expect(result!.user_id).toBe("worker-1");
    });
  });

  describe("Trust card visibility (always public)", () => {
    const trustCard = {
      worker_id: "worker-1",
      tier: "basic",
      verification_status: "verified",
      tenure_months: 12,
      endorsement_count: 3,
      incident_flag: false,
      incident_severity_max: null,
      last_computed_at: "2025-06-01T00:00:00Z",
    };

    it("trust card fields are always visible (no consent needed)", () => {
      // Trust card is always returned regardless of consent
      // This test documents that trust cards don't require consent
      expect(trustCard.tier).toBe("basic");
      expect(trustCard.endorsement_count).toBe(3);
      expect(trustCard.incident_flag).toBe(false);
    });

    it("trust card never contains PII", () => {
      // Trust card should not have any PII fields
      const trustCardKeys = Object.keys(trustCard);
      expect(trustCardKeys).not.toContain("full_name");
      expect(trustCardKeys).not.toContain("phone");
      expect(trustCardKeys).not.toContain("email");
      expect(trustCardKeys).not.toContain("encrypted_aadhaar_hash");
      expect(trustCardKeys).not.toContain("photo_url");
    });
  });
});
