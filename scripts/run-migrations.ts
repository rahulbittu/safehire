/**
 * Run SQL migrations against a hosted Supabase project.
 *
 * Uses the `postgres` npm package to connect directly to the database.
 * Reads credentials from apps/web/.env.local.
 *
 * Usage: npx tsx scripts/run-migrations.ts
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import postgres from "postgres";

const ROOT = resolve(__dirname, "..");

const MIGRATIONS = [
  "supabase/migrations/00001_initial_schema.sql",
  "supabase/migrations/00002_rls_policies.sql",
  "supabase/migrations/00003_consent_requests.sql",
  "supabase/migrations/00004_storage_buckets.sql",
  "supabase/migrations/20260321_add_categories_agencies_ratings.sql",
];

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

function getProjectRef(url: string): string {
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (!match) throw new Error(`Cannot parse project ref from: ${url}`);
  return match[1];
}

async function main() {
  console.log("Loading environment...");
  const env = loadEnv();

  const supabaseUrl = env["NEXT_PUBLIC_SUPABASE_URL"];
  const serviceKey = env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const ref = getProjectRef(supabaseUrl);
  console.log(`Project ref: ${ref}`);

  // If DATABASE_URL is explicitly set, use it directly
  let dbUrl = env["DATABASE_URL"];

  if (!dbUrl) {
    // Try to connect via the Supabase pooler using service_role JWT as password
    // Supavisor supports JWT auth for pooled connections
    const dbPassword = env["DB_PASSWORD"];
    if (dbPassword) {
      dbUrl = `postgresql://postgres.${ref}:${encodeURIComponent(dbPassword)}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`;
    } else {
      // Try direct connection with service_role key as password
      dbUrl = `postgresql://postgres.${ref}:${encodeURIComponent(serviceKey)}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`;
    }
  }

  console.log(`Connecting to database...`);

  const sql = postgres(dbUrl, {
    ssl: "require",
    connect_timeout: 15,
    idle_timeout: 5,
    max: 1,
    // Supabase pooler in transaction mode needs this
    prepare: false,
  });

  // Test connection
  try {
    const result = await sql`SELECT current_database() as db, current_user as usr`;
    console.log(`Connected as ${result[0].usr} to ${result[0].db}`);
  } catch (err) {
    console.error("Connection failed:", (err as Error).message);
    console.error("\nTo fix this, add one of these to apps/web/.env.local:");
    console.error("  DATABASE_URL=postgresql://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres");
    console.error("  DB_PASSWORD=your-database-password");
    console.error("\nFind your database password in: Supabase Dashboard → Settings → Database → Connection string");
    await sql.end();
    process.exit(1);
  }

  // Run each migration
  for (const migrationPath of MIGRATIONS) {
    const fullPath = resolve(ROOT, migrationPath);
    if (!existsSync(fullPath)) {
      console.error(`File not found: ${migrationPath}`);
      await sql.end();
      process.exit(1);
    }

    const migrationSql = readFileSync(fullPath, "utf-8");
    const label = migrationPath.split("/").pop()!;

    process.stdout.write(`Running ${label}... `);
    try {
      await sql.unsafe(migrationSql);
      console.log("OK");
    } catch (err) {
      const msg = (err as Error).message;
      // If tables/policies already exist, that's fine
      if (msg.includes("already exists")) {
        console.log("OK (already exists)");
      } else {
        console.log("FAILED");
        console.error(`  ${msg}`);
        await sql.end();
        process.exit(1);
      }
    }
  }

  await sql.end();
  console.log("\nAll migrations complete.");
}

main();
