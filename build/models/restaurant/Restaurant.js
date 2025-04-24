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
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    phone_number: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    restaurant_image: { type: String, required: true },
    restaurant_name: { type: String, required: true },
    restaurant_addresses: [
        {
            lng: { type: String, required: true },
            lat: { type: String, required: true },
            location: { type: String, required: true },
            isPrimary: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now },
        },
    ],
    phone_for_client: { type: String, required: true },
    categories: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
        },
    ],
    start_date: { type: String, required: true },
    end_date: { type: String, required: true },
    isPhoneVerified: { type: Boolean, required: true, default: false },
    date: { type: Date, default: Date.now },
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
        try {
            return yield bcrypt.compare(candidatePassword, this.password);
        }
        catch (error) {
            console.error("Password comparison error:", error);
            return false;
        }
    });
};
const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export default Restaurant;
