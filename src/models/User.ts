import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  likes: { type: [Number], default: [] },
  comments: { type: [String], default: [] },
});

const User = mongoose.model("User", userSchema);

export default User;
