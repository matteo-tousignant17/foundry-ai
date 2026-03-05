export const dynamic = "force-dynamic";

export async function GET() {
  const info: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    node_version: process.version,
    node_env: process.env.NODE_ENV,
    platform: process.platform,
    arch: process.arch,
  };

  // Test @libsql/client load
  try {
    const { createClient } = await import("@libsql/client");
    info.libsql = "loaded OK";

    // Test DB open
    try {
      const client = createClient({ url: "file:/tmp/health-check.db" });
      await client.execute("CREATE TABLE IF NOT EXISTS _health (id INTEGER PRIMARY KEY)");
      await client.execute("INSERT OR IGNORE INTO _health VALUES (1)");
      const result = await client.execute("SELECT id FROM _health");
      await client.close();
      info.db_open = "OK";
      info.db_row = result.rows[0];
    } catch (e) {
      info.db_open = "FAILED";
      info.db_error = String(e);
    }
  } catch (e) {
    info.libsql = "FAILED to load";
    info.libsql_error = String(e);
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
    status: info.libsql === "loaded OK" && info.db_open === "OK" ? 200 : 500,
  });
}
