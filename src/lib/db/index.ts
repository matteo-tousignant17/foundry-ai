import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "path";
import * as schema from "./schema";

// Vercel's Lambda filesystem is read-only except for /tmp.
// Use /tmp in production so better-sqlite3 can create/write the file.
const dbPath =
  process.env.NODE_ENV === "production" ? "/tmp/foundry.db" : "foundry.db";

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

// Auto-run migrations so the schema exists on a fresh database
// (needed on every new Vercel Lambda instance that gets a clean /tmp).
migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
