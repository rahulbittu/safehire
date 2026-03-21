/**
 * Seed the database with realistic demo data.
 *
 * Creates workers, hirers, profiles, trust cards, endorsements,
 * and consent flows so the app feels alive in demo/UAT mode.
 *
 * Usage: npx tsx scripts/seed.ts
 *
 * Safe to re-run: uses ON CONFLICT DO NOTHING for idempotency.
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import postgres from "postgres";

const ROOT = resolve(__dirname, "..");

function loadEnv(): Record<string, string> {
  const envPath = resolve(ROOT, "apps/web/.env.local");
  if (!existsSync(envPath)) {
    throw new Error("apps/web/.env.local not found");
  }
  const content = readFileSync(envPath, "utf-8");
  const vars: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const match = line.match(/^([A-Z_]+)=(.+)$/);
    if (match) vars[match[1]] = match[2];
  }
  return vars;
}

// =========================================================================
// Demo data — realistic Indian names, skills, cities
// =========================================================================

// Fixed UUIDs so seed is idempotent and relationships are stable
const WORKERS = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    phone: "+919876543201",
    fullName: "Priya Sharma",
    skills: ["cooking", "cleaning", "childcare"],
    languages: ["Hindi", "English"],
    experienceYears: 6,
    tier: "enhanced",
    verificationStatus: "verified",
    tenureMonths: 18,
    endorsementCount: 4,
    verifiedAt: "2025-09-15T00:00:00Z",
  },
  {
    id: "a0000000-0000-0000-0000-000000000002",
    phone: "+919876543202",
    fullName: "Ramesh Kumar",
    skills: ["driving", "gardening", "security"],
    languages: ["Hindi", "Kannada"],
    experienceYears: 12,
    tier: "basic",
    verificationStatus: "verified",
    tenureMonths: 8,
    endorsementCount: 2,
    verifiedAt: "2025-11-20T00:00:00Z",
  },
  {
    id: "a0000000-0000-0000-0000-000000000003",
    phone: "+919876543203",
    fullName: "Lakshmi Devi",
    skills: ["cleaning", "eldercare", "cooking"],
    languages: ["Tamil", "English", "Hindi"],
    experienceYears: 9,
    tier: "enhanced",
    verificationStatus: "verified",
    tenureMonths: 24,
    endorsementCount: 7,
    verifiedAt: "2025-06-10T00:00:00Z",
  },
  {
    id: "a0000000-0000-0000-0000-000000000004",
    phone: "+919876543204",
    fullName: "Arjun Patel",
    skills: ["plumbing", "electrical", "carpentry"],
    languages: ["Gujarati", "Hindi", "English"],
    experienceYears: 15,
    tier: "basic",
    verificationStatus: "pending",
    tenureMonths: 3,
    endorsementCount: 1,
    verifiedAt: null,
  },
  {
    id: "a0000000-0000-0000-0000-000000000005",
    phone: "+919876543205",
    fullName: "Sunita Rao",
    skills: ["cooking", "baking", "meal prep"],
    languages: ["Telugu", "English"],
    experienceYears: 4,
    tier: "unverified",
    verificationStatus: "pending",
    tenureMonths: 1,
    endorsementCount: 0,
    verifiedAt: null,
  },
  {
    id: "a0000000-0000-0000-0000-000000000006",
    phone: "+919876543206",
    fullName: "Mohammad Irfan",
    skills: ["driving", "delivery", "logistics"],
    languages: ["Hindi", "Urdu", "English"],
    experienceYears: 8,
    tier: "basic",
    verificationStatus: "verified",
    tenureMonths: 10,
    endorsementCount: 3,
    verifiedAt: "2025-10-05T00:00:00Z",
  },
];

const HIRERS = [
  {
    id: "b0000000-0000-0000-0000-000000000001",
    phone: "+919876543301",
    name: "Ananya Gupta",
    organization: "Gupta Residence",
    type: "individual",
  },
  {
    id: "b0000000-0000-0000-0000-000000000002",
    phone: "+919876543302",
    name: "UrbanServe",
    organization: "UrbanServe Home Services",
    type: "business",
  },
  {
    id: "b0000000-0000-0000-0000-000000000003",
    phone: "+919876543303",
    name: "Kavitha Nair",
    organization: "Nair Family",
    type: "individual",
  },
];

// Endorsements linking hirers to workers
const ENDORSEMENTS = [
  { hirerId: HIRERS[0].id, workerId: WORKERS[0].id, relationship: "Former employer (2 years)", comment: "Priya is excellent with children and very reliable. Always on time." },
  { hirerId: HIRERS[1].id, workerId: WORKERS[0].id, relationship: "Agency placement", comment: "One of our highest rated workers. Multiple families have praised her cooking." },
  { hirerId: HIRERS[2].id, workerId: WORKERS[0].id, relationship: "Current employer", comment: "Trustworthy and hardworking. Highly recommend." },
  { hirerId: HIRERS[0].id, workerId: WORKERS[0].id, relationship: "Neighbor referral", comment: "Recommended by multiple families in our apartment complex." },
  { hirerId: HIRERS[0].id, workerId: WORKERS[1].id, relationship: "Former employer", comment: "Ramesh has been our family driver for 3 years. Very safe and punctual." },
  { hirerId: HIRERS[1].id, workerId: WORKERS[1].id, relationship: "Agency partner", comment: "Reliable driver with clean record." },
  { hirerId: HIRERS[0].id, workerId: WORKERS[2].id, relationship: "Former employer (5 years)", comment: "Lakshmi took care of my mother-in-law. Absolutely wonderful caregiver." },
  { hirerId: HIRERS[1].id, workerId: WORKERS[2].id, relationship: "Placement agency", comment: "Consistently receives 5-star ratings from families." },
  { hirerId: HIRERS[2].id, workerId: WORKERS[2].id, relationship: "Current employer", comment: "Best cook we have ever had. Our children love her food." },
  { hirerId: HIRERS[0].id, workerId: WORKERS[2].id, relationship: "Community reference", comment: "Known in the community for her caring nature." },
  { hirerId: HIRERS[2].id, workerId: WORKERS[2].id, relationship: "Repeat employer", comment: "Hired her three separate times. Always a great experience." },
  { hirerId: HIRERS[1].id, workerId: WORKERS[2].id, relationship: "Agency verification", comment: "Background check cleared. Excellent references." },
  { hirerId: HIRERS[2].id, workerId: WORKERS[2].id, relationship: "Previous employer", comment: "Very gentle with elderly patients. Highly skilled." },
  { hirerId: HIRERS[0].id, workerId: WORKERS[3].id, relationship: "Homeowner", comment: "Fixed our plumbing quickly and professionally." },
  { hirerId: HIRERS[1].id, workerId: WORKERS[5].id, relationship: "Fleet manager", comment: "Irfan is one of our most reliable drivers." },
  { hirerId: HIRERS[2].id, workerId: WORKERS[5].id, relationship: "Former employer", comment: "Safe driving, always on time." },
  { hirerId: HIRERS[0].id, workerId: WORKERS[5].id, relationship: "Repeat customer", comment: "Used his delivery services multiple times." },
];

// Consent requests — some pending, some approved
const CONSENT_REQUESTS = [
  // Approved: Hirer 1 → Worker 1 (Priya)
  { hirerId: HIRERS[0].id, workerId: WORKERS[0].id, fields: ["full_name", "skills", "experience_years"], status: "approved", message: "Looking for a cook and childcare provider for our family." },
  // Approved: Hirer 2 → Worker 2 (Ramesh)
  { hirerId: HIRERS[1].id, workerId: WORKERS[1].id, fields: ["full_name", "skills", "experience_years"], status: "approved", message: "Checking driver credentials for fleet placement." },
  // Pending: Hirer 3 → Worker 1 (Priya)
  { hirerId: HIRERS[2].id, workerId: WORKERS[0].id, fields: ["full_name", "skills", "experience_years", "languages"], status: "pending", message: "My neighbor recommended Priya. Would love to discuss a part-time arrangement." },
  // Pending: Hirer 1 → Worker 3 (Lakshmi)
  { hirerId: HIRERS[0].id, workerId: WORKERS[2].id, fields: ["full_name", "skills", "experience_years"], status: "pending", message: "Need an eldercare provider for my mother." },
  // Rejected: Hirer 2 → Worker 4 (Arjun)
  { hirerId: HIRERS[1].id, workerId: WORKERS[3].id, fields: ["full_name", "skills"], status: "rejected", message: null },
];

async function main() {
  console.log("Loading environment...");
  const env = loadEnv();

  const dbUrl = env["DATABASE_URL"];
  if (!dbUrl) {
    throw new Error("DATABASE_URL not found in apps/web/.env.local");
  }

  console.log("Connecting to database...");
  const sql = postgres(dbUrl, {
    ssl: "require",
    connect_timeout: 15,
    idle_timeout: 5,
    max: 1,
    prepare: false,
  });

  try {
    const result = await sql`SELECT current_database() as db, current_user as usr`;
    console.log(`Connected as ${result[0].usr} to ${result[0].db}\n`);
  } catch (err) {
    console.error("Connection failed:", (err as Error).message);
    await sql.end();
    process.exit(1);
  }

  // 1. Seed worker users
  console.log("Seeding worker users...");
  for (const w of WORKERS) {
    await sql`
      INSERT INTO users (id, phone, role, created_at, updated_at)
      VALUES (${w.id}, ${w.phone}, 'worker', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `;
  }
  console.log(`  ${WORKERS.length} workers`);

  // 2. Seed hirer users
  console.log("Seeding hirer users...");
  for (const h of HIRERS) {
    await sql`
      INSERT INTO users (id, phone, role, created_at, updated_at)
      VALUES (${h.id}, ${h.phone}, 'hirer', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `;
  }
  console.log(`  ${HIRERS.length} hirers`);

  // 3. Seed worker profiles
  console.log("Seeding worker profiles...");
  for (const w of WORKERS) {
    await sql`
      INSERT INTO worker_profiles (user_id, full_name, skills, languages, experience_years, verified_at)
      VALUES (
        ${w.id},
        ${w.fullName},
        ${JSON.stringify(w.skills)}::jsonb,
        ${JSON.stringify(w.languages)}::jsonb,
        ${w.experienceYears},
        ${w.verifiedAt}
      )
      ON CONFLICT (user_id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        skills = EXCLUDED.skills,
        languages = EXCLUDED.languages,
        experience_years = EXCLUDED.experience_years,
        verified_at = EXCLUDED.verified_at
    `;
  }
  console.log(`  ${WORKERS.length} profiles`);

  // 4. Seed hirer profiles
  console.log("Seeding hirer profiles...");
  for (const h of HIRERS) {
    await sql`
      INSERT INTO hirer_profiles (user_id, name, organization, type)
      VALUES (${h.id}, ${h.name}, ${h.organization}, ${h.type})
      ON CONFLICT (user_id) DO UPDATE SET
        name = EXCLUDED.name,
        organization = EXCLUDED.organization,
        type = EXCLUDED.type
    `;
  }
  console.log(`  ${HIRERS.length} hirer profiles`);

  // 5. Seed trust cards
  console.log("Seeding trust cards...");
  for (const w of WORKERS) {
    await sql`
      INSERT INTO trust_cards (worker_id, tier, verification_status, tenure_months, endorsement_count, incident_flag, incident_severity_max, last_computed_at)
      VALUES (
        ${w.id},
        ${w.tier},
        ${w.verificationStatus},
        ${w.tenureMonths},
        ${w.endorsementCount},
        false,
        NULL,
        NOW()
      )
      ON CONFLICT (worker_id) DO UPDATE SET
        tier = EXCLUDED.tier,
        verification_status = EXCLUDED.verification_status,
        tenure_months = EXCLUDED.tenure_months,
        endorsement_count = EXCLUDED.endorsement_count,
        last_computed_at = NOW()
    `;
  }
  console.log(`  ${WORKERS.length} trust cards`);

  // 6. Seed endorsements
  console.log("Seeding endorsements...");
  let endorseCount = 0;
  for (const e of ENDORSEMENTS) {
    try {
      await sql`
        INSERT INTO endorsements (worker_id, hirer_id, relationship, comment, created_at)
        VALUES (${e.workerId}, ${e.hirerId}, ${e.relationship}, ${e.comment}, NOW() - interval '${sql.unsafe(String(Math.floor(Math.random() * 180)))} days')
      `;
      endorseCount++;
    } catch {
      // Skip duplicates or constraint violations
    }
  }
  console.log(`  ${endorseCount} endorsements`);

  // 7. Seed consent requests and grants
  console.log("Seeding consent requests...");
  let requestCount = 0;
  for (const cr of CONSENT_REQUESTS) {
    try {
      if (cr.status === "approved") {
        // Create consent grant first
        const grantResult = await sql`
          INSERT INTO consent_grants (worker_id, hirer_id, fields, granted_at, expires_at)
          VALUES (
            ${cr.workerId},
            ${cr.hirerId},
            ${JSON.stringify(cr.fields)}::jsonb,
            NOW() - interval '30 days',
            NOW() + interval '60 days'
          )
          ON CONFLICT DO NOTHING
          RETURNING id
        `;

        const grantId = grantResult[0]?.id ?? null;

        await sql`
          INSERT INTO consent_requests (hirer_id, worker_id, fields, message, status, requested_at, responded_at, consent_grant_id)
          VALUES (
            ${cr.hirerId},
            ${cr.workerId},
            ${cr.fields},
            ${cr.message},
            ${cr.status},
            NOW() - interval '35 days',
            NOW() - interval '30 days',
            ${grantId}
          )
          ON CONFLICT DO NOTHING
        `;
      } else {
        await sql`
          INSERT INTO consent_requests (hirer_id, worker_id, fields, message, status, requested_at, responded_at)
          VALUES (
            ${cr.hirerId},
            ${cr.workerId},
            ${cr.fields},
            ${cr.message},
            ${cr.status},
            NOW() - interval '${sql.unsafe(cr.status === "pending" ? "2" : "20")} days',
            ${cr.status === "rejected" ? sql`NOW() - interval '18 days'` : sql`NULL`}
          )
          ON CONFLICT DO NOTHING
        `;
      }
      requestCount++;
    } catch {
      // Skip duplicates
    }
  }
  console.log(`  ${requestCount} consent requests`);

  // 8. Seed verifications for verified workers
  console.log("Seeding verifications...");
  let verifyCount = 0;
  for (const w of WORKERS) {
    if (w.verifiedAt) {
      try {
        await sql`
          INSERT INTO verifications (worker_id, type, status, verified_at, expires_at, provider)
          VALUES (${w.id}, 'phone', 'verified', ${w.verifiedAt}, ${w.verifiedAt}::timestamptz + interval '1 year', 'msg91')
          ON CONFLICT DO NOTHING
        `;
        verifyCount++;
      } catch {
        // Skip
      }
    }
  }
  console.log(`  ${verifyCount} verifications`);

  await sql.end();
  console.log("\nSeed complete! Demo data is ready.");
  console.log("\n--- Demo accounts ---");
  console.log("Workers (log in with OTP 123456):");
  for (const w of WORKERS) {
    console.log(`  ${w.phone}  ${w.fullName} (${w.tier}, ${w.experienceYears}yr)`);
  }
  console.log("\nHirers (log in with OTP 123456):");
  for (const h of HIRERS) {
    console.log(`  ${h.phone}  ${h.name} (${h.organization})`);
  }
}

main().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
