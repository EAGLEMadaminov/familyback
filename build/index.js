import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
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
