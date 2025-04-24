var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
dotenv.config();
const MONGODB_URL = process.env.MONGODB_URL;
// Superadmin konfiguratsiyasi
const SUPERADMIN_EMAIL = process.env.ESKIZ_EMAIL;
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD;
const SUPERADMIN_PHONE = process.env.SUPERADMIN_PHONE;
const SUPERADMIN_NAME = process.env.SUPERADMIN_NAME;
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // MongoDB ga ulanish
        yield mongoose.connect(MONGODB_URL, {});
        console.log("✅ DATABAZAGA MUVAFFAQIYATLI ULANDI");
        // Superadmin yaratish (agar mavjud bo'lmasa)
        // await createSuperadmin();
    }
    catch (error) {
        console.error("❌ DATABAZAGA ULANISHDA XATO:", error.message);
        process.exit(1);
    }
});
// Superadmin yaratish funktsiyasi
const createSuperadmin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Superadmin mavjudligini tekshirish
        const existingAdmin = yield User.findOne({
            $or: [{ email: SUPERADMIN_EMAIL }, { phoneNumber: SUPERADMIN_PHONE }],
        });
        if (!existingAdmin) {
            // Parolni hash qilish
            const hashedPassword = yield bcrypt.hash(SUPERADMIN_PASSWORD, 12);
            // Superadmin yaratish
            yield User.create({
                name: SUPERADMIN_NAME,
                phoneNumber: SUPERADMIN_PHONE,
                email: SUPERADMIN_EMAIL,
                password: hashedPassword,
                role: "superadmin",
                isPhoneVerified: true,
                isVerified: true,
                createdAt: new Date(),
                lastActive: new Date(),
            });
            console.log("✅ SUPERADMIN MUVAFFAQIYATLI YARATILDI");
        }
        else {
            console.log("ℹ️ SUPERADMIN AYLANMA HOLDA MAVJUD");
        }
    }
    catch (error) {
        console.error("❌ SUPERADMIN YARATISHDA XATO:", error.message);
    }
});
export default connectDB;
