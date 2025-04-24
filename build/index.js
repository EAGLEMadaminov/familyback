import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/config.js";
import { getEskizToken } from "./middleware/eskizTokes.js";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import path from "path";
const __dirname = path.resolve();
const whitelist = ["192.168.1.1", "127.0.0.1"];
getEskizToken();
connectDB();
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 daqiqa
    max: 1000, // Har bir IP uchun maksimum 1000 so'rov
    message: "Juda ko'p so'rov yubordingiz, iltimos biroz kutib turing",
});
// Auth uchun alohida cheklov
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 soat
    max: 50, // Login/sms kod uchun 50 ta so'rov
    message: "Juda ko'p kirish urinishlari, iltimos keyinroq urinib ko'ring",
});
// routes
import { authRouter, userRouter, orderRouter, categoryRouter, productRouter, restaurantRouter, imageRouter, } from "./routes/index.js";
dotenv.config();
const app = express();
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.use(express.json());
app.use(globalLimiter);
app.use(helmet());
const PORT = process.env.PORT || 4000;
app.use("/api/v1/auth", authLimiter, authRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/restaurant", restaurantRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/", userRouter);
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));
app.use("/api/v1/image", imageRouter);
app.use("/", (req, res) => {
    res.send("Hello world");
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
