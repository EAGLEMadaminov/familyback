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
import bcrypt from "bcryptjs";
const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone_number: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    restaurant_image: { type: String, required: true },
    restaurant_address: { type: String, required: true },
    restaurant_address_link: { type: String, required: true },
    phone_for_client: { type: String, required: true, unique: true },
    work_time: { type: String, required: true }, // "word_time" => "work_time" deb tuzatildi
    date: { type: Date, default: Date.now }, // "new Date()" => "Date" type qilib to'g'irlandi
});
// Password hashing
restaurantSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password"))
            return next();
        this.password = yield bcrypt.hash(this.password, 12);
        next();
    });
});
restaurantSchema.methods.comparePassword = function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt.compare(candidatePassword, this.password);
    });
};
export const Restaurant = mongoose.model("Restaurant", restaurantSchema);
