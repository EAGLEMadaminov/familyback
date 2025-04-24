import mongoose from "mongoose";
const orderSchema = new mongoose.Schema({
  client_name: { type: String, required: true },
  client_phone: { type: String, required: true },
  products: [
    {
      product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, default: 1 },
    },
  ],
  total_price: { type: Number, required: true },
  status: {
    type: String,
    enum: [
      "pending",
      "accepted",
      "cooking",
      "delivering",
      "completed",
      "cancelled",
    ],
    default: "pending",
  },
  restaurant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  driver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
  },
  date: { type: Date, default: Date.now },
});

export const Order = mongoose.model("Order", orderSchema);
