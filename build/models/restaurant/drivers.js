import mongoose from "mongoose";
const driverSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    vehicle_type: { type: String, enum: ["car", "motorcycle", "bicycle"] },
    is_available: { type: Boolean, default: true },
});
export const Driver = mongoose.model("Driver", driverSchema);
