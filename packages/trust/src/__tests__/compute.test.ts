import { describe, it, expect } from "vitest";
import { computeTrustScore, computeTrustCard } from "../compute";

describe("computeTrustScore", () => {
  it("returns 0 for a completely new unverified worker", () => {
    const score = computeTrustScore({
      verificationTier: "unverified",
      tenureMonths: 0,
      endorsementCount: 0,
      substantiatedIncidents: [],
    });
    expect(score).toBe(0);
  });

  it("returns 30 for basic verification with no other signals", () => {
    const score = computeTrustScore({
      verificationTier: "basic",
      tenureMonths: 0,
      endorsementCount: 0,
      substantiatedIncidents: [],
    });
    expect(score).toBe(30);
  });

  it("returns 50 for enhanced verification with no other signals", () => {
    const score = computeTrustScore({
      verificationTier: "enhanced",
      tenureMonths: 0,
      endorsementCount: 0,
      substantiatedIncidents: [],
    });
    expect(score).toBe(50);
  });

  it("adds tenure points (1 per month, capped at 24)", () => {
    const score = computeTrustScore({
      verificationTier: "unverified",
      tenureMonths: 12,
      endorsementCount: 0,
      substantiatedIncidents: [],
    });
    expect(score).toBe(12);
  });

  it("caps tenure at 24 months", () => {
    const score = computeTrustScore({
      verificationTier: "unverified",
      tenureMonths: 50,
      endorsementCount: 0,
      substantiatedIncidents: [],
    });
    expect(score).toBe(24);
  });

  it("adds endorsement points (2 per endorsement, capped at 10)", () => {
    const score = computeTrustScore({
      verificationTier: "unverified",
      tenureMonths: 0,
      endorsementCount: 5,
      substantiatedIncidents: [],
    });
    expect(score).toBe(10);
  });

  it("caps endorsements at 10 (max 20 points)", () => {
    const score = computeTrustScore({
      verificationTier: "unverified",
      tenureMonths: 0,
      endorsementCount: 20,
      substantiatedIncidents: [],
    });
    expect(score).toBe(20);
  });

  it("applies incident penalties", () => {
    const score = computeTrustScore({
      verificationTier: "enhanced",
      tenureMonths: 24,
      endorsementCount: 10,
      substantiatedIncidents: [{ severity: "low" }],
    });
    // 50 + 24 + 20 - 5 = 89
    expect(score).toBe(89);
  });

  it("applies critical incident penalty", () => {
    const score = computeTrustScore({
      verificationTier: "enhanced",
      tenureMonths: 0,
      endorsementCount: 0,
      substantiatedIncidents: [{ severity: "critical" }],
    });
    // 50 - 50 = 0
    expect(score).toBe(0);
  });

  it("clamps score to 0 (never negative)", () => {
    const score = computeTrustScore({
      verificationTier: "unverified",
      tenureMonths: 0,
      endorsementCount: 0,
      substantiatedIncidents: [
        { severity: "critical" },
        { severity: "high" },
      ],
    });
    expect(score).toBe(0);
  });

  it("clamps score to 100 (maximum)", () => {
    // Max possible: 50 + 24 + 20 = 94, so can't exceed 100 naturally
    const score = computeTrustScore({
      verificationTier: "enhanced",
      tenureMonths: 24,
      endorsementCount: 10,
      substantiatedIncidents: [],
    });
    expect(score).toBe(94);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("handles multiple incidents of different severities", () => {
    const score = computeTrustScore({
      verificationTier: "enhanced",
      tenureMonths: 24,
      endorsementCount: 10,
      substantiatedIncidents: [
        { severity: "low" },
        { severity: "medium" },
      ],
    });
    // 50 + 24 + 20 - 5 - 15 = 74
    expect(score).toBe(74);
  });
});

describe("computeTrustCard", () => {
  it("returns a trust card with correct fields", () => {
    const card = computeTrustCard({
      workerId: "test-worker-id",
      verificationTier: "basic",
      verificationStatus: "verified",
      tenureMonths: 6,
      endorsementCount: 3,
      substantiatedIncidents: [],
    });

    expect(card.workerId).toBe("test-worker-id");
    expect(card.tier).toBe("basic");
    expect(card.verificationStatus).toBe("verified");
    expect(card.tenureMonths).toBe(6);
    expect(card.endorsementCount).toBe(3);
    expect(card.incidentFlag).toBe(false);
    expect(card.incidentSeverityMax).toBeNull();
    expect(card.lastUpdated).toBeInstanceOf(Date);
  });

  it("sets incident flag and max severity when incidents exist", () => {
    const card = computeTrustCard({
      workerId: "test-worker-id",
      verificationTier: "enhanced",
      verificationStatus: "verified",
      tenureMonths: 12,
      endorsementCount: 5,
      substantiatedIncidents: [
        { severity: "low" },
        { severity: "high" },
        { severity: "medium" },
      ],
    });

    expect(card.incidentFlag).toBe(true);
    expect(card.incidentSeverityMax).toBe("high");
  });

  it("handles single critical incident", () => {
    const card = computeTrustCard({
      workerId: "test-worker-id",
      verificationTier: "unverified",
      verificationStatus: "pending",
      tenureMonths: 0,
      endorsementCount: 0,
      substantiatedIncidents: [{ severity: "critical" }],
    });

    expect(card.incidentFlag).toBe(true);
    expect(card.incidentSeverityMax).toBe("critical");
  });
});
