import { Router } from "express";
import { categoryHandler } from "../handlers/category.handler.js";

const categoryRoutes = Router();

categoryRoutes.post("/", categoryHandler.create);
categoryRoutes.get("/", categoryHandler.getAll);
categoryRoutes.get("/:id", categoryHandler.getById);

export { categoryRoutes };
