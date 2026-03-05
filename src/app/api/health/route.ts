export const dynamic = "force-dynamic";

export async function GET() {
  const info: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    node_version: process.version,
    node_env: process.env.NODE_ENV,
    platform: process.platform,
    arch: process.arch,
  };

  // Test better-sqlite3 load
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require("better-sqlite3");
    info.better_sqlite3 = "loaded OK";

    // Test DB open
    try {
      const dbPath = "/tmp/health-check.db";
      const sqlite = new Database(dbPath);
      sqlite.pragma("journal_mode = WAL");
      sqlite.exec("CREATE TABLE IF NOT EXISTS _health (id INTEGER PRIMARY KEY)");
      sqlite.exec("INSERT OR IGNORE INTO _health VALUES (1)");
      const row = sqlite.prepare("SELECT id FROM _health").get();
      sqlite.close();
      info.db_open = "OK";
      info.db_row = row;
    } catch (e) {
      info.db_open = "FAILED";
      info.db_error = String(e);
    }
  } catch (e) {
    info.better_sqlite3 = "FAILED to load";
    info.better_sqlite3_error = String(e);
  }

  // Test main DB module
  try {
    await import("@/lib/db");
    info.main_db = "imported OK";
  } catch (e) {
    info.main_db = "FAILED";
    info.main_db_error = String(e);
  }

  return Response.json(info, {
    status: info.better_sqlite3 === "loaded OK" && info.db_open === "OK" ? 200 : 500,
  });
}
