import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

let dbInstance: ReturnType<typeof drizzle>;
let poolInstance: Pool;

if (!process.env.DATABASE_URL) {
  console.warn("⚠️ DATABASE_URL is not set. Database features will fail if accessed.");

  // Create a proxy that throws a helpful error when any DB operation is attempted
  dbInstance = new Proxy({} as any, {
    get: () => {
      throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
    }
  });
} else {
  poolInstance = new Pool({ connectionString: process.env.DATABASE_URL });
  dbInstance = drizzle({ client: poolInstance, schema });
}

export const pool = poolInstance!;
export const db = dbInstance;
