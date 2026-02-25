import { db } from "../database.js";
import type { NewTransaction } from "../types.js";
import type { Kysely } from "kysely";
import type { Database } from "../types.js";

export const transactionRepository = {
  async createHeader(trx: Kysely<Database>, type: NewTransaction["type"]) {
    const result = await trx
      .insertInto("transactions")
      .values({ type })
      .executeTakeFirstOrThrow();

    return Number(result.insertId);
  },

  async createTransactionItem(
    trx: Kysely<Database>,
    data: {
      transaction_id: number;
      item_id: number;
      stock_before: number;
      stock_after: number;
    },
  ) {
    await trx.insertInto("transaction_items").values(data).execute();
  },

  beginTransaction<T>(
    callback: (trx: Kysely<Database>) => Promise<T>,
  ): Promise<T> {
    return db.transaction().execute(callback);
  },
};
