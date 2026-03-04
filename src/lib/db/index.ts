import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "path";
import * as schema from "./schema";

const DB_PATH =
  process.env.NODE_ENV === "production"
    ? "/tmp/foundry.db"
    : path.resolve(process.cwd(), "foundry.db");

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS signals (
    id TEXT PRIMARY KEY,
    raw_text TEXT NOT NULL,
    source TEXT,
    source_url TEXT,
    customer TEXT,
    arr TEXT,
    severity TEXT,
    frequency TEXT,
    renewal_risk TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS problems (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    statement TEXT NOT NULL,
    who_affected TEXT,
    workflow_block TEXT,
    business_impact TEXT,
    retention_or_growth TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    frequency TEXT,
    severity TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS signal_problems (
    id TEXT PRIMARY KEY,
    signal_id TEXT NOT NULL REFERENCES signals(id) ON DELETE CASCADE,
    problem_id TEXT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    quote TEXT
  );

  CREATE TABLE IF NOT EXISTS objectives (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    timeframe TEXT,
    metric TEXT,
    weight REAL NOT NULL DEFAULT 1.0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS releases (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    target_date TEXT,
    status TEXT NOT NULL DEFAULT 'planned',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS roadmap_items (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    rationale TEXT,
    type TEXT NOT NULL DEFAULT 'feature',
    status TEXT NOT NULL DEFAULT 'proposed',
    target_month TEXT,
    effort_size TEXT,
    reach INTEGER,
    impact INTEGER,
    confidence INTEGER,
    effort INTEGER,
    score REAL,
    parent_id TEXT,
    release_id TEXT REFERENCES releases(id) ON DELETE SET NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS roadmap_item_problems (
    id TEXT PRIMARY KEY,
    roadmap_item_id TEXT NOT NULL REFERENCES roadmap_items(id) ON DELETE CASCADE,
    problem_id TEXT NOT NULL REFERENCES problems(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS roadmap_item_objectives (
    id TEXT PRIMARY KEY,
    roadmap_item_id TEXT NOT NULL REFERENCES roadmap_items(id) ON DELETE CASCADE,
    objective_id TEXT NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,
    impact_to_objective INTEGER
  );

  CREATE TABLE IF NOT EXISTS prds (
    id TEXT PRIMARY KEY,
    roadmap_item_id TEXT REFERENCES roadmap_items(id),
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    summary TEXT,
    problem_statement TEXT,
    objectives TEXT,
    user_stories TEXT,
    design_asset_link TEXT,
    open_questions TEXT,
    acceptance_criteria TEXT,
    evidence TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS prd_messages (
    id TEXT PRIMARY KEY,
    prd_id TEXT NOT NULL REFERENCES prds(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ticket_stubs (
    id TEXT PRIMARY KEY,
    prd_id TEXT NOT NULL REFERENCES prds(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    acceptance_criteria TEXT,
    story_points INTEGER,
    created_at INTEGER NOT NULL
  );
`);

export const db = drizzle(sqlite, { schema });
