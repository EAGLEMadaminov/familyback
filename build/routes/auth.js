import { Router } from "express";
const authRouter = Router();
import { sendCode, verifyCode } from "../controllers/index.js";
authRouter.post("/send-code", sendCode);
authRouter.post("/verify-code", verifyCode);
export default authRouter;
