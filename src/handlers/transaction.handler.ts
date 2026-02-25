import type { Request, Response } from "express";
import { transactionService } from "../services/transaction.service.js";
import type { NewTransaction } from "../types.js";

export const transactionHandler = {
  async create(req: Request, res: Response) {
    try {
      const { type, items } = req.body as {
        type: NewTransaction["type"];
        items: { item_id: number; qty: number }[];
      };

      const result = await transactionService.create({ type, items });

      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
};
