import { Router } from "express";
import { categoryRoutes } from "./category.routes.js";
import { itemRoutes } from "./item.routes.js";
import { transactionRoutes } from "./transaction.routes.js";

const router = Router();

router.use("/categories", categoryRoutes);
router.use("/items", itemRoutes);
router.use("/transactions", transactionRoutes);

export { router };
