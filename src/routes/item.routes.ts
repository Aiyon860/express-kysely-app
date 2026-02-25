import { Router } from "express";
import { itemHandler } from "../handlers/item.handler.js";

const router = Router();

router.post("/", itemHandler.create);
router.get("/", itemHandler.getAll);

export { router as itemRoutes };
