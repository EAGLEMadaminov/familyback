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

userSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
