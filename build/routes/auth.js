import { Router } from "express";
const authRouter = Router();
import rateLimit from "express-rate-limit";
import { sendCode, verifyCode, signUp, signIn } from "../controllers/index.js";
authRouter.post("/send-code", rateLimit({ windowMs: 60000, max: 1 }), sendCode);
authRouter.post("/verify-code", verifyCode);
authRouter.post("/sign-up", signUp);
authRouter.post("/sign-in", signIn);
export default authRouter;
