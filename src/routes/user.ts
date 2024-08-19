import { Router } from "express";
import { getUserInfo } from "../controllers/index.js";
import authenticatedToken from "../middleware/authToken.js";

const userRouter = Router();

userRouter.get("/user-info", authenticatedToken, getUserInfo);

export { userRouter };
