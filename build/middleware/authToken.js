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
import dotenv from "dotenv";
dotenv.config();
const authenticatedToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token)
        return res.status(401).send("Access denied");
    console.log("Resived token ", token);
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            console.log("JWT Verification Error:", err.message);
            console.log("Received token:", token); // Debugging line to check the token
            return res.status(403).send("Forbidden");
        }
        const decodedUser = user;
        try {
            const userFromDB = yield User.findOne({
                phoneNumber: decodedUser.phone_number,
            });
            if (!userFromDB) {
                return res.status(404).send("User not found");
            }
            req.user = userFromDB;
            next();
        }
        catch (error) {
            console.error("Error retrieving user:", error);
            res.status(500).send("Internal server error");
        }
    }));
});
export default authenticatedToken;
