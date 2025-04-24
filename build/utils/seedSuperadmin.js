var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import User from "../models/User.js";
import bcrypt from "bcryptjs";
export const createSuperadmin = () => __awaiter(void 0, void 0, void 0, function* () {
    const exists = yield User.findOne({ role: "superadmin" });
    if (!exists) {
        const hashedPassword = yield bcrypt.hash(process.env.MY_PASSWORD, 12);
        yield User.create({
            email: process.env.ESKIZ_EMAIL,
            password: hashedPassword,
            role: "superadmin",
        });
        console.log("Superadmin yaratildi");
    }
});
createSuperadmin();
