// utils/authHelpers.ts
import bcrypt from "bcryptjs";

export const verifySuperadminPassword = (inputPassword: string) => {
  const superadminPassword = process.env.SUPERADMIN_PASSWORD as string;
  return bcrypt.compare(inputPassword, superadminPassword);
};
