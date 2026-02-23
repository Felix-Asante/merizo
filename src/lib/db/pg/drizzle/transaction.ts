import type { DbClientOrTransaction } from "@/lib/db/pg";
import db from "@/lib/db/pg";

export function withTransaction<T>(
  fn: (tx: DbClientOrTransaction) => Promise<T>,
) {
  return db.transaction(fn);
}
