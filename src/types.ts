import type { Generated, Insertable, Selectable, Updateable } from "kysely";

// --- Category ---

export interface CategoryTable {
  id: Generated<number>;
  nama: string;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export type Category = Selectable<CategoryTable>;
export type NewCategory = Insertable<CategoryTable>;
export type CategoryUpdate = Updateable<CategoryTable>;

// --- Item ---

export interface ItemTable {
  id: Generated<number>;
  nama: string;
  category_id: number;
  stock: number;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export type Item = Selectable<ItemTable>;
export type NewItem = Insertable<ItemTable>;
export type ItemUpdate = Updateable<ItemTable>;

// --- Transaction ---

export interface TransactionTable {
  id: Generated<number>;
  type: "in" | "out";
  created_at: Generated<Date>;
}

export type Transaction = Selectable<TransactionTable>;
export type NewTransaction = Insertable<TransactionTable>;
export type TransactionUpdate = Updateable<TransactionTable>;

// --- Transaction Item ---

export interface TransactionItemTable {
  id: Generated<number>;
  transaction_id: number;
  item_id: number;
  stock_before: number;
  stock_after: number;
  created_at: Generated<Date>;
}

export type TransactionItem = Selectable<TransactionItemTable>;
export type NewTransactionItem = Insertable<TransactionItemTable>;
export type TransactionItemUpdate = Updateable<TransactionItemTable>;

// --- Database schema ---

export interface Database {
  categories: CategoryTable;
  items: ItemTable;
  transactions: TransactionTable;
  transaction_items: TransactionItemTable;
}
