var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import connectDB from "./config/config.js";
import { getEskizToken } from "./middleware/eskizTokes.js";
getEskizToken();
connectDB();
// routes
import { authRouter, userRouter, orderRouter } from "./routes/index.js";
dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());
const PORT = process.env.PORT || 4000;
app.use("/auth", authRouter);
app.use("/order", orderRouter);
app.use("/", userRouter);
app.use("/", (req, res) => {
    res.send("Hello world");
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
const secret = process.env.JWT_SECRET;
if (!secret) {
    console.error("JWT_SECRET is not defined or incorrectly loaded.");
}
else {
    console.log("JWT Secret loaded successfully.");
}
function verifyMyToken() {
    return __awaiter(this, void 0, void 0, function* () {
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZV9udW1iZXIiOiIrOTk4MzMxMDA3MTU1IiwiY29kZSI6IjMwMTI2IiwiaWF0IjoxNzI0ODQ1NDQzLCJleHAiOjE3MjQ4NDU1NjN9.nk3D1c-VogJWdoH0OMbwDzhe9rjsn7-18ZEPZ6_qles";
        try {
            const decoded = jwt.verify(token, secret);
            console.log("Decoded Token:", decoded);
        }
        catch (error) {
            console.error("Token Verification Error:", error.message);
        }
    });
}
verifyMyToken();
