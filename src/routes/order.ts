import { Router } from "express";
import {orderController} from "../controllers/index.js";
const orderRouter = Router();

orderRouter.post("/", orderController);

export { orderRouter };
