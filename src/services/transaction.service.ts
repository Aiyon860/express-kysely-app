import type { NewTransaction, ItemUpdate } from "../types.js";
import { transactionRepository } from "../repositories/transaction.repository.js";
import { itemRepository } from "../repositories/item.repository.js";

interface TransactionEntry {
  item_id: number;
  qty: number;
}

interface CreateTransactionInput {
  type: NewTransaction["type"];
  items: TransactionEntry[];
}

export const transactionService = {
  async create(input: CreateTransactionInput) {
    const { type, items } = input;

    return await transactionRepository.beginTransaction(async (trx) => {
      const transactionId = await transactionRepository.createHeader(trx, type);

      for (const entry of items) {
        const currentItem = await itemRepository.findByIdForUpdate(
          trx,
          entry.item_id,
        );

        const newStock =
          type === "in"
            ? currentItem.stock + entry.qty
            : currentItem.stock - entry.qty;

        if (newStock < 0) {
          throw new Error(
            `Stock for item "${entry.item_id}" is not enough!`,
          );
        }

        const updateData: ItemUpdate = {
          stock: newStock,
          updated_at: new Date(),
        };

        await itemRepository.updateStock(trx, entry.item_id, updateData);

        await transactionRepository.createTransactionItem(trx, {
          transaction_id: transactionId,
          item_id: entry.item_id,
          stock_before: currentItem.stock,
          stock_after: newStock,
        });
      }

      return { transactionId };
    });
  },
};
