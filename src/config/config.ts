import mongoose, { ConnectOptions } from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL as string;

// Superadmin konfiguratsiyasi
const SUPERADMIN_EMAIL = process.env.ESKIZ_EMAIL;
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD as string;
const SUPERADMIN_PHONE = process.env.SUPERADMIN_PHONE;
const SUPERADMIN_NAME = process.env.SUPERADMIN_NAME;

const connectDB = async () => {
  try {
    // MongoDB ga ulanish
    await mongoose.connect(MONGODB_URL, {});

    console.log("✅ DATABAZAGA MUVAFFAQIYATLI ULANDI");

    // Superadmin yaratish (agar mavjud bo'lmasa)
    // await createSuperadmin();
  } catch (error) {
    console.error("❌ DATABAZAGA ULANISHDA XATO:", error.message);
    process.exit(1);
  }
};

// Superadmin yaratish funktsiyasi
const createSuperadmin = async () => {
  try {
    // Superadmin mavjudligini tekshirish
    const existingAdmin = await User.findOne({
      $or: [{ email: SUPERADMIN_EMAIL }, { phoneNumber: SUPERADMIN_PHONE }],
    });

    if (!existingAdmin) {
      // Parolni hash qilish
      const hashedPassword = await bcrypt.hash(SUPERADMIN_PASSWORD, 12);

      // Superadmin yaratish
      await User.create({
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
    } else {
      console.log("ℹ️ SUPERADMIN AYLANMA HOLDA MAVJUD");
    }
  } catch (error) {
    console.error("❌ SUPERADMIN YARATISHDA XATO:", error.message);
  }
};

export default connectDB;
