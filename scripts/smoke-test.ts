/**
 * Smoke test: Validates the full trust-card + consent flow against a real Supabase instance.
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/smoke-test.ts
 *
 * This script:
 * 1. Creates a worker and a hirer user
 * 2. Creates a worker profile
 * 3. Creates a trust card via upsert
 * 4. Creates an endorsement
 * 5. Grants consent from worker to hirer
 * 6. Verifies consent check works
 * 7. Revokes consent
 * 8. Verifies consent is revoked
 * 9. Creates an incident report
 * 10. Writes an audit log entry
 * 11. Cleans up all test data
 */

import { createClient } from "../packages/db/src/client";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

let workerId: string;
let hirerId: string;
let workerProfileId: string;
let trustCardId: string;
let endorsementId: string;
let consentId: string;
let incidentId: string;

async function step(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  ✗ ${name}: ${msg}`);
    throw err;
  }
}

async function cleanup() {
  console.log("\nCleaning up...");
  // Delete in reverse dependency order
  if (incidentId) await db.from("incidents").delete().eq("id", incidentId);
  if (consentId) await db.from("consent_grants").delete().eq("id", consentId);
  if (endorsementId) await db.from("endorsements").delete().eq("id", endorsementId);
  if (trustCardId) await db.from("trust_cards").delete().eq("id", trustCardId);
  if (workerProfileId) await db.from("worker_profiles").delete().eq("id", workerProfileId);
  // Delete audit log entries for our test users
  if (workerId) await db.from("audit_log").delete().eq("actor_id", workerId);
  if (hirerId) await db.from("audit_log").delete().eq("actor_id", hirerId);
  // Delete users last (cascades don't cover everything)
  if (workerId) await db.from("users").delete().eq("id", workerId);
  if (hirerId) await db.from("users").delete().eq("id", hirerId);
  console.log("  ✓ Cleanup complete");
}

async function run() {
  console.log("SafeHire Smoke Test");
  console.log("===================\n");
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log("");

  try {
    // 1. Create users
    await step("Create worker user", async () => {
      const { data, error } = await db.from("users").insert({
        phone: "+91smoke0001",
        role: "worker",
      }).select().single();
      if (error) throw error;
      workerId = (data as any).id;
    });

    await step("Create hirer user", async () => {
      const { data, error } = await db.from("users").insert({
        phone: "+91smoke0002",
        role: "hirer",
      }).select().single();
      if (error) throw error;
      hirerId = (data as any).id;
    });

    // 2. Create worker profile
    await step("Create worker profile", async () => {
      const { data, error } = await db.from("worker_profiles").insert({
        user_id: workerId,
        full_name: "Smoke Test Worker",
        skills: ["cooking", "cleaning"],
        languages: ["hindi", "english"],
        experience_years: 3,
      }).select().single();
      if (error) throw error;
      workerProfileId = (data as any).id;
    });

    // 3. Upsert trust card
    await step("Upsert trust card", async () => {
      const { data, error } = await db.from("trust_cards").upsert({
        worker_id: workerId,
        tier: "unverified",
        verification_status: "pending",
        tenure_months: 0,
        endorsement_count: 0,
        incident_flag: false,
        last_computed_at: new Date().toISOString(),
      }, { onConflict: "worker_id" }).select().single();
      if (error) throw error;
      trustCardId = (data as any).id;
    });

    // 4. Create endorsement
    await step("Create endorsement", async () => {
      const { data, error } = await db.from("endorsements").insert({
        worker_id: workerId,
        hirer_id: hirerId,
        relationship: "Former employer",
        comment: "Excellent work",
      }).select().single();
      if (error) throw error;
      endorsementId = (data as any).id;
    });

    // 5. Grant consent
    await step("Grant consent", async () => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 90);
      const { data, error } = await db.from("consent_grants").insert({
        worker_id: workerId,
        hirer_id: hirerId,
        fields: ["full_name", "skills", "experience_years"],
        expires_at: expiresAt.toISOString(),
      }).select().single();
      if (error) throw error;
      consentId = (data as any).id;
    });

    // 6. Verify consent check
    await step("Verify consent is active", async () => {
      const { data, error } = await db.from("consent_grants")
        .select("fields")
        .eq("worker_id", workerId)
        .eq("hirer_id", hirerId)
        .is("revoked_at", null)
        .gte("expires_at", new Date().toISOString())
        .single();
      if (error) throw error;
      if (!data) throw new Error("No active consent found");
      const fields = (data as any).fields;
      if (!fields.includes("full_name")) throw new Error("Missing full_name in consent fields");
    });

    // 7. Revoke consent
    await step("Revoke consent", async () => {
      const { error } = await db.from("consent_grants")
        .update({ revoked_at: new Date().toISOString() })
        .eq("id", consentId);
      if (error) throw error;
    });

    // 8. Verify revocation
    await step("Verify consent is revoked", async () => {
      const { data, error } = await db.from("consent_grants")
        .select("fields")
        .eq("worker_id", workerId)
        .eq("hirer_id", hirerId)
        .is("revoked_at", null)
        .gte("expires_at", new Date().toISOString())
        .maybeSingle();
      if (error) throw error;
      if (data) throw new Error("Consent should be revoked but still active");
    });

    // 9. Create incident
    await step("Create incident report", async () => {
      const { data, error } = await db.from("incidents").insert({
        reporter_id: hirerId,
        worker_id: workerId,
        type: "misconduct",
        severity: "low",
        status: "submitted",
        description_encrypted: "enc:test:placeholder",
      }).select().single();
      if (error) throw error;
      incidentId = (data as any).id;
    });

    // 10. Write audit log
    await step("Write audit log entry", async () => {
      const { error } = await db.from("audit_log").insert({
        actor_id: hirerId,
        action: "smoke_test",
        resource_type: "test",
        resource_id: "smoke-test-run",
        metadata: { test: true, timestamp: new Date().toISOString() },
      });
      if (error) throw error;
    });

    console.log("\n✅ All smoke tests passed!\n");

  } finally {
    await cleanup();
  }
}

run().catch((err) => {
  console.error("\n❌ Smoke test failed:", err.message);
  cleanup().then(() => process.exit(1)).catch(() => process.exit(1));
});
