var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendCodeToPhoneNumber } from "../middleware/eskizTokes.js";
import dotenv from "dotenv";
dotenv.config();
const sendCode = (req, res) => {
    const { phone_number, name } = req.body;
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    let phone = phone_number.slice(1);
    sendCodeToPhoneNumber({ phone_number: phone, code });
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return res.status(500).send("JWT secret was denied");
    }
    const codeToken = jwt.sign({ phone_number, code }, secret, {
        expiresIn: "2m",
    });
    try {
        res.status(200).send({ codeToken });
        console.log(code);
    }
    catch (error) {
        res.status(500).send({ error: "Internal server error" });
    }
};
const verifyCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone_number, code, name } = req.body;
    const codeToken = req.headers["code-token"];
    if (!codeToken) {
        return res.status(400).send("Missing token");
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return res.status(500).send("JWT_SECRET is not defined");
    }
    try {
        const decoded = jwt.verify(codeToken, secret);
        if (decoded.code !== code || decoded.phone_number !== phone_number) {
            return res.status(400).send("Incorrect code or phone number");
        }
        const access_token = jwt.sign({ phone_number }, secret, {
            expiresIn: "30d",
        });
        let user = yield User.findOne({ phoneNumber: phone_number });
        if (!user) {
            user = new User({
                name,
                phoneNumber: phone_number,
            });
            yield user.save();
        }
        else {
            user.name = name;
            yield user.save();
        }
        return res.status(201).send({ access_token });
    }
    catch (error) {
        return res.status(400).send("Invalid or expired Token");
    }
});
export { sendCode, verifyCode };
