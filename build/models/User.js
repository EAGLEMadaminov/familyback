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
const userSchema = new mongoose.Schema({
    name: { type: String },
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String },
    likes: { type: [Number], default: [] },
    comments: { type: [String], default: [] },
    isPhoneVerified: { type: Boolean, default: false },
    role: {
        type: String,
        enum: ["user", "driver", "restaurant_owner", "superadmin"],
        default: "user",
    },
    createdAt: { type: Date, default: Date.now },
    lastActive: { type: Date },
});
userSchema.methods.comparePassword = function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt.compare(candidatePassword, this.password);
    });
};
const User = mongoose.model("User", userSchema);
export default User;
