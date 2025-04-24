import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const createSuperadmin = async () => {
  const exists = await User.findOne({ role: "superadmin" });
  if (!exists) {
    const hashedPassword = await bcrypt.hash(process.env.MY_PASSWORD, 12);
    await User.create({
      email: process.env.ESKIZ_EMAIL,
      password: hashedPassword,
      role: "superadmin",
    });
    console.log("Superadmin yaratildi");
  }
};

createSuperadmin();
