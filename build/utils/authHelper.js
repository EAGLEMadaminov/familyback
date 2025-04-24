// utils/authHelpers.ts
import bcrypt from "bcryptjs";
export const verifySuperadminPassword = (inputPassword) => {
    const superadminPassword = process.env.SUPERADMIN_PASSWORD;
    return bcrypt.compare(inputPassword, superadminPassword);
};
