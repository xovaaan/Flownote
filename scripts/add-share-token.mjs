import { readFileSync } from "fs";
import { join } from "path";
import pg from "pg";

function loadEnv() {
  for (const name of [".env.local", ".env"]) {
    try {
      const raw = readFileSync(join(process.cwd(), name), "utf8");
      for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) process.env[key] = val;
      }
      return;
    } catch {
      /* try next */
    }
  }
}

loadEnv();

const sql = `
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS share_token text;
CREATE UNIQUE INDEX IF NOT EXISTS meetings_share_token_unique ON meetings (share_token);
`;

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not set. Add it to .env and retry.");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: url,
  ssl: url.includes("supabase") ? { rejectUnauthorized: false } : false,
});
try {
  await pool.query(sql);
  console.log("share_token column ready");
} finally {
  await pool.end();
}
