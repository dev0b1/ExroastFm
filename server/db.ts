import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@/src/db/schema";

neonConfig.webSocketConstructor = ws;

// Exported bindings (will be set below depending on env)
// eslint-disable-next-line import/no-mutable-exports
export let pool: any = null;
// eslint-disable-next-line import/no-mutable-exports
export let db: any = null;

if (!process.env.DATABASE_URL) {
  console.warn('[server/db] DATABASE_URL not set — exporting a safe noop db for build/prerender');

  const noopQuery = () => ({
    from: () => ({ where: () => ({ limit: () => [], all: () => [], get: () => null }) }),
  });

  const dbStub: any = new Proxy({}, {
    get() {
      return noopQuery;
    },
    apply() {
      return noopQuery();
    },
  });

  pool = null;
  db = dbStub;
} else {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
}
