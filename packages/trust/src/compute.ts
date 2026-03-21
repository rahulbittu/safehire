import type { TrustCard, VerificationTier } from "@verifyme/types";

/**
 * Weights for trust score computation.
 * These are deterministic, rules-based — no ML involved.
 */
const WEIGHTS = {
  verification: {
    unverified: 0,
    basic: 30,
    enhanced: 50,
  },
  /** Points per month of tenure, capped at maxTenureMonths */
  tenurePerMonth: 1,
  maxTenureMonths: 24,
  /** Points per endorsement, capped at maxEndorsements */
  endorsementPerUnit: 2,
  maxEndorsements: 10,
  /** Penalty points by incident severity */
  incidentPenalty: {
    low: -5,
    medium: -15,
    high: -30,
    critical: -50,
  },
} as const;

const MAX_SCORE = 100;

interface ComputeInput {
  verificationTier: VerificationTier;
  tenureMonths: number;
  endorsementCount: number;
  substantiatedIncidents: Array<{
    severity: "low" | "medium" | "high" | "critical";
  }>;
}

/**
 * Compute a numeric trust score from worker data.
 *
 * Scoring breakdown:
 * - Verification tier: 0 / 30 / 50 points
 * - Tenure: 1 point per month, max 24 points
 * - Endorsements: 2 points each, max 20 points (10 endorsements)
 * - Incidents: negative points by severity (only substantiated)
 *
 * Score is clamped to [0, 100].
 */
export function computeTrustScore(input: ComputeInput): number {
  // Verification component
  const verificationScore = WEIGHTS.verification[input.verificationTier];

  // Tenure component (capped)
  const effectiveTenure = Math.min(input.tenureMonths, WEIGHTS.maxTenureMonths);
  const tenureScore = effectiveTenure * WEIGHTS.tenurePerMonth;

  // Endorsement component (capped)
  const effectiveEndorsements = Math.min(
    input.endorsementCount,
    WEIGHTS.maxEndorsements
  );
  const endorsementScore = effectiveEndorsements * WEIGHTS.endorsementPerUnit;

  // Incident penalty (sum of all substantiated incidents)
  const incidentPenalty = input.substantiatedIncidents.reduce(
    (total, incident) => total + WEIGHTS.incidentPenalty[incident.severity],
    0
  );

  // Total score, clamped to [0, 100]
  const rawScore =
    verificationScore + tenureScore + endorsementScore + incidentPenalty;
  return Math.max(0, Math.min(MAX_SCORE, rawScore));
}

/**
 * Compute a full TrustCard from worker data.
 * This is the main entry point for trust card generation.
 */
export function computeTrustCard(input: {
  workerId: string;
  verificationTier: VerificationTier;
  verificationStatus: "pending" | "verified" | "expired" | "rejected";
  tenureMonths: number;
  endorsementCount: number;
  substantiatedIncidents: Array<{
    severity: "low" | "medium" | "high" | "critical";
  }>;
}): TrustCard {
  const hasIncidents = input.substantiatedIncidents.length > 0;

  // Determine the maximum incident severity
  const severityOrder = ["low", "medium", "high", "critical"] as const;
  let incidentSeverityMax: "low" | "medium" | "high" | "critical" | null = null;

  if (hasIncidents) {
    incidentSeverityMax = input.substantiatedIncidents.reduce<
      "low" | "medium" | "high" | "critical"
    >((max, incident) => {
      const maxIndex = severityOrder.indexOf(max);
      const currentIndex = severityOrder.indexOf(incident.severity);
      return currentIndex > maxIndex ? incident.severity : max;
    }, "low");
  }

  return {
    workerId: input.workerId,
    tier: input.verificationTier,
    verificationStatus: input.verificationStatus,
    tenureMonths: input.tenureMonths,
    endorsementCount: input.endorsementCount,
    incidentFlag: hasIncidents,
    incidentSeverityMax,
    lastUpdated: new Date(),
  };
}
