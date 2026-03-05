import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const DB_URL =
  process.env.NODE_ENV === "production"
    ? "file:/tmp/foundry.db"
    : "file:./foundry.db";

export const client = createClient({ url: DB_URL });
export const db = drizzle(client, { schema });
