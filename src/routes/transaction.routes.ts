import { Router } from "express";
import { transactionHandler } from "../handlers/transaction.handler.js";

const transactionRoutes = Router();

transactionRoutes.post("/", transactionHandler.create);

export { transactionRoutes };
