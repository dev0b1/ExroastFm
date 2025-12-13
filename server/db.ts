import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@/src/db/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.warn('[server/db] DATABASE_URL not set — exporting a safe noop db for build/prerender');

  // Minimal noop Drizzle-like stub to avoid runtime errors during static build/prerender.
  // It returns empty arrays/nulls for common chain endings like `.limit()`, `.all()`, `.get()`.
  const noopQuery = () => ({
    from: () => ({ where: () => ({ limit: () => [], all: () => [], get: () => null }) }),
  });

  // A proxy that returns a function for any property access so calls like db.select()
  // won't throw during build. Consumers should not rely on real DB results in this mode.
  // This keeps module imports safe during Next.js prerender.
  // Note: In production you MUST set `DATABASE_URL` to a real database.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbStub: any = new Proxy({}, {
    get() {
      return noopQuery;
    },
    apply() {
      return noopQuery();
    },
  });

  export const pool = null as any;
  export const db = dbStub as any;
} else {
  export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  export const db = drizzle({ client: pool, schema });
}
