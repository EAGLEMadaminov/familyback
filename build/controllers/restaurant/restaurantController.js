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
import { Restaurant } from "../../models/index.js";
export const updateRestaurant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { restaurantId } = req.params;
    const { restaurant_name, image, start_date, end_date, address, address_link, } = req.body;
    const authHeader = req.headers.authorization;
    // 1. Avtorizatsiya tekshirish
    if (!authHeader) {
        return res.status(401).json({ error: "Authorization header is missing" });
    }
    const token = authHeader.split(" ")[1];
    try {
        // 2. Token tekshirish
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "restaurant_owner" || !decoded.restaurantId) {
            return res.status(403).json({ error: "Permission denied" });
        }
        // 4. Restaurant topish va tekshirish
        const restaurant = yield Restaurant.findOne({
            _id: restaurantId,
        });
        if (!restaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }
        // 5. Yangilanishlar obyekti
        const updates = {};
        if (restaurant_name)
            updates.name = restaurant_name;
        if (start_date)
            updates.start_date = start_date;
        if (end_date)
            updates.end_date = end_date;
        if (address)
            updates.address = address;
        if (address_link)
            updates.address_link = address_link;
        if (image)
            updates.image = image;
        // 6. Restaurantni yangilash
        const updatedRestaurant = yield Restaurant.findByIdAndUpdate(restaurantId, updates, { new: true });
        return res.json({
            success: true,
            category: {
                id: updatedRestaurant._id,
                name: updatedRestaurant.name,
                start_date: updatedRestaurant.start_date,
                end_date: updatedRestaurant.end_date,
                address: updatedRestaurant.restaurant_address,
                address_link: updatedRestaurant.restaurant_address_link,
                image: updatedRestaurant.restaurant_image,
            },
        });
    }
    catch (error) {
        console.error("Category update error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
export const updateRestaurantphone = (req, res) => __awaiter(void 0, void 0, void 0, function* () { });
export const getAllRestaurants = (req, res) => __awaiter(void 0, void 0, void 0, function* () { });
export const addRestaurantAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    // 1. Avtorizatsiya tekshirish
    if (!authHeader) {
        return res.status(401).json({ error: "Authorization header is missing" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "restaurant_owner" || !decoded.restaurantId) {
            return res.status(403).json({ error: "Permission denied" });
        }
        const { restaurantId } = req.params;
        const { lng, lat, location, makePrimary = false } = req.body;
        // Majburiy maydonlarni tekshirish
        if (!lng || !lat || !location) {
            return res.status(400).json({
                error: "Missing required fields: lng, lat or location",
            });
        }
        // Restaurantni topish
        const restaurant = yield Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }
        // Yangi manzil obyekti
        const newAddress = {
            lng,
            lat,
            location,
            isPrimary: makePrimary,
            createdAt: new Date(),
        };
        // Agar yangi manzil asosiy qilinmoqchi bo'lsa, boshqa manzillarni isPrimary=false qilish
        if (makePrimary) {
            restaurant.restaurant_addresses = restaurant.restaurant_addresses.map((addr) => (Object.assign(Object.assign({}, addr), { isPrimary: false })));
        }
        // Yangi manzilni qo'shish
        restaurant.restaurant_addresses.push(newAddress);
        yield restaurant.save();
        return res.status(200).json({
            success: true,
            message: "Address added successfully",
            address: newAddress,
            restaurantId: restaurant._id,
        });
    }
    catch (error) {
        console.error("Add address error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
});
