var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import jwt from "jsonwebtoken";
import { randomInt } from "crypto";
import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcryptjs";
import { User, Restaurant } from "../models/index.js";
const sendCode = (req, res) => {
    const { phone_number, name } = req.body;
    const code = randomInt(10000, 100000).toString();
    let phone = phone_number.slice(1);
    // sendCodeToPhoneNumber({ phone_number: phone, code });
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return res.status(500).send("JWT secret was denied");
    }
    const codeToken = jwt.sign({ phone_number, code }, secret, {
        expiresIn: "2m",
    });
    try {
        res.status(200).send({ codeToken, code });
    }
    catch (error) {
        res.status(500).send({ error: "Internal server error" });
    }
};
const verifyCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone_number, code } = req.body;
    const codeToken = req.headers["code-token"];
    // 1. Validatsiyalar
    if (!codeToken) {
        return res.status(400).json({
            success: false,
            error: "Code token talab qilinadi",
        });
    }
    if (!phone_number || !code) {
        return res.status(400).json({
            success: false,
            error: "Telefon raqam va kod talab qilinadi",
        });
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return res.status(500).json({
            success: false,
            error: "Server konfiguratsiyasi noto'g'ri",
        });
    }
    try {
        // 2. Tokenni tekshirish
        const decoded = jwt.verify(codeToken, secret);
        // 3. Kod va telefon raqamni tekshirish
        if (decoded.code !== code) {
            return res.status(400).json({
                success: false,
                error: "Noto'g'ri tasdiqlash kodi",
            });
        }
        if (decoded.phone_number !== phone_number) {
            return res.status(400).json({
                success: false,
                error: "Telefon raqam mos kelmadi",
            });
        }
        // 4. Token muddatini tekshirish
        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp < now) {
            return res.status(400).json({
                success: false,
                error: "Tasdiqlash kodi muddati o'tgan",
            });
        }
        // 5. User ni topish yoki yaratish
        const user = yield User.findOneAndUpdate({ phoneNumber: phone_number }, {
            isPhoneVerified: true,
            name: req.body.name || "User", // Agar name yuborilsa
        }, {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
        });
        // 6. Yangi token yaratish
        const authToken = jwt.sign({
            userId: user._id,
            phoneNumber: user.phoneNumber,
            role: user.role || "user", // Default role
            isPhoneVerified: true,
            purpose: "restaurant_signup", // Qo'shimcha ma'lumot
        }, process.env.JWT_SECRET, { expiresIn: "30d" });
        // 7. Muvaffaqiyatli javob
        res.json({
            success: true,
            token: authToken,
            user: {
                id: user._id,
                phoneNumber: user.phoneNumber,
                role: user.role,
            },
            expiresIn: "30d", // Token amal qilish muddati
        });
    }
    catch (error) {
        console.error("Kodni tasdiqlash xatosi:", error);
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(400).json({
                success: false,
                error: "Tasdiqlash kodi muddati o'tgan",
            });
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(400).json({
                success: false,
                error: "Yaroqsiz tasdiqlash tokeni",
            });
        }
        return res.status(500).json({
            success: false,
            error: "Server ichki xatosi",
        });
    }
});
// signUp for restaurant owner
const signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone_number } = req.body;
    const authHeader = req.headers.authorization;
    // Authorization tekshiruvi
    if (!authHeader) {
        return res.status(401).json({ error: "Authorization header is missing" });
    }
    const tokenParts = authHeader.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
        return res.status(401).json({ error: "Invalid token format" });
    }
    try {
        // Token tekshiruvi
        const decoded = jwt.verify(tokenParts[1], process.env.JWT_SECRET);
        if (!decoded.isPhoneVerified || decoded.phoneNumber !== phone_number) {
            return res.status(403).json({ error: "Phone verification failed" });
        }
        // Majburiy maydonlarni tekshirish
        const requiredFields = [
            "name",
            "email",
            "password",
            "restaurant_name",
            "restaurant_logo",
            "addresses", // Endi addresses array sifatida keladi
        ];
        const missingFields = requiredFields.filter((field) => !req.body[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({
                error: `Missing required fields: ${missingFields.join(", ")}`,
            });
        }
        // Restaurant mavjudligini tekshirish
        const existingRestaurant = yield Restaurant.findOne({
            $or: [{ phone_number }, { email: req.body.email }],
        });
        if (existingRestaurant) {
            return res.status(400).json({
                error: "Restaurant with this phone or email already exists",
            });
        }
        // Manzillarni tayyorlash
        const addresses = req.body.addresses.map((addr, index) => ({
            lng: addr.lng,
            lat: addr.lat,
            location: addr.location,
            isPrimary: index === 0, // Birinchi manzil asosiy deb belgilanadi
        }));
        // Yangi restaurant yaratish
        const restaurant = new Restaurant({
            name: req.body.name,
            email: req.body.email,
            owner: decoded.userId,
            phone_number,
            password: req.body.password, // pre-save middleware hash qiladi
            restaurant_name: req.body.restaurant_name,
            restaurant_image: req.body.restaurant_logo,
            restaurant_addresses: addresses,
            phone_for_client: req.body.phone_client || phone_number,
            start_date: req.body.start_date || new Date().toISOString(),
            end_date: req.body.end_date ||
                new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
            isPhoneVerified: true,
        });
        yield restaurant.save();
        // Userni yangilash
        const user = yield User.findOneAndUpdate({ phoneNumber: phone_number }, {
            name: req.body.name,
            role: "restaurant_owner",
            restaurant: restaurant._id,
            isPhoneVerified: true,
            password: restaurant.password, // Hashlangan password
        }, { new: true });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // Javobni yuborish
        return res.status(201).json({
            success: true,
            message: "Restaurant registration successful",
            user: {
                id: user._id,
                name: user.name,
                phoneNumber: user.phoneNumber,
                role: user.role,
            },
            restaurant: {
                id: restaurant._id,
                name: restaurant.restaurant_name,
                phone: restaurant.phone_number,
                addresses: restaurant.restaurant_addresses,
            },
        });
    }
    catch (error) {
        console.error("Signup error:", error);
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ error: "Invalid token" });
        }
        return res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
});
const signIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone_number, password } = req.body;
    if (!phone_number) {
        return res.status(400).json({ error: "Phone number is required" });
    }
    try {
        let entity;
        let isMatch = false;
        const user = yield User.findOne({ phoneNumber: phone_number }).select("+password");
        if (!user) {
            return res.status(400).json({ error: "Bu raqam ro'yhatdan o'tmagan" });
        }
        const role = user.role; // role ni aniqlash
        // Superadmin authentication
        if (role === "superadmin") {
            isMatch = yield user.comparePassword(password);
            entity = user;
        }
        // Restaurant owner authentication
        else if (role === "restaurant_owner") {
            isMatch = yield bcrypt.compare(password, user.password);
            const restaurant = yield Restaurant.findOne({ phone_number }).select("+password");
            if (!restaurant) {
                return res.status(404).json({ error: "Restaurant not found" });
            }
            if (!restaurant.isPhoneVerified) {
                return res.status(403).json({ error: "Restaurant not verified" });
            }
            entity = restaurant;
        }
        // Regular user authentication
        else {
            if (!user.isPhoneVerified) {
                return res.status(403).json({ error: "Phone not verified" });
            }
            // Userlar uchun parol talab qilinmasa
            isMatch = true;
            entity = user;
        }
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        // Token yaratish
        const tokenPayload = Object.assign({ userId: entity._id, phoneNumber: entity.phone_number || entity.phoneNumber, role }, (role === "restaurant_owner" && { restaurantId: entity._id }));
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
            expiresIn: "30d",
        });
        // Javob tayyorlash
        const response = {
            success: true,
            token,
            user: {
                id: entity._id,
                phoneNumber: entity.phone_number || entity.phoneNumber,
                role,
                isVerified: true,
            },
        };
        if (role === "restaurant_owner") {
            const _a = entity.toObject(), { password: _ } = _a, restaurantData = __rest(_a, ["password"]);
            response.restaurant = restaurantData;
        }
        return res.json(response);
    }
    catch (error) {
        console.error("SignIn error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
});
export { sendCode, verifyCode, signUp, signIn };
