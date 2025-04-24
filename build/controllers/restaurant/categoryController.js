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
import { Category, Restaurant } from "../../models/index.js";
import mongoose from "mongoose";
export const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, image } = req.body;
    const authHeader = req.headers.authorization;
    // 1. Avtorizatsiya tekshirish
    if (!authHeader) {
        return res.status(401).json({ error: "Authorization header is missing" });
    }
    const token = authHeader.split(" ")[1];
    try {
        // 2. Token tekshirish
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // 3. Faqat restaurant ownerlar kategoriya yarata oladi
        if (decoded.role !== "restaurant_owner" || !decoded.restaurantId) {
            return res.status(403).json({ error: "Permission denied" });
        }
        // 4. Yangi kategoriya yaratish
        const newCategory = new Category({
            name,
            description,
            image,
            restaurant_id: decoded.restaurantId,
        });
        yield newCategory.save();
        // 5. Restaurantga kategoriya ID sini qo'shish
        yield Restaurant.findByIdAndUpdate(decoded.restaurantId, {
            $push: { categories: newCategory._id },
        });
        return res.status(201).json({
            success: true,
            category: {
                id: newCategory._id,
                name: newCategory.name,
                description: newCategory.description,
            },
        });
    }
    catch (error) {
        console.error("Category creation error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
export const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { category_id } = req.params;
    const authHeader = req.headers.authorization;
    // 1. Avtorizatsiya tekshirish
    if (!authHeader) {
        return res.status(401).json({ error: "Authorization header is missing" });
    }
    const token = authHeader.split(" ")[1];
    try {
        // 2. Token tekshirish
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // 3. Faqat restaurant ownerlar kategoriya o'chira oladi
        if (decoded.role !== "restaurant_owner" || !decoded.restaurantId) {
            return res.status(403).json({ error: "Permission denied" });
        }
        // 4. Kategoriyani topish va tekshirish
        const category = yield Category.findOne({
            _id: category_id,
            restaurant_id: decoded.restaurantId,
        });
        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }
        // 5. Kategoriyani o'chirish (soft delete)
        yield Category.findByIdAndDelete(category_id);
        // 6. Restaurantdan kategoriya ID sini olib tashlash
        yield Restaurant.findByIdAndUpdate(decoded.restaurantId, {
            $pull: { categories: category_id },
        });
        return res.json({
            success: true,
            message: "Category deleted successfully",
        });
    }
    catch (error) {
        console.error("Category deletion error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
export const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { category_id } = req.params;
    const { name, description, image } = req.body;
    const authHeader = req.headers.authorization;
    // 1. Avtorizatsiya tekshirish
    if (!authHeader) {
        return res.status(401).json({ error: "Authorization header is missing" });
    }
    const token = authHeader.split(" ")[1];
    try {
        // 2. Token tekshirish
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // 3. Faqat restaurant ownerlar kategoriyani tahrirlashi mumkin
        if (decoded.role !== "restaurant_owner" || !decoded.restaurantId) {
            return res.status(403).json({ error: "Permission denied" });
        }
        // 4. Kategoriyani topish va tekshirish
        const category = yield Category.findOne({
            _id: category_id,
            restaurant_id: decoded.restaurantId,
        });
        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }
        // 5. Yangilanishlar obyekti
        const updates = {};
        if (name)
            updates.name = name;
        if (description)
            updates.description = description;
        if (image)
            updates.image = image;
        // 6. Kategoriyani yangilash
        const updatedCategory = yield Category.findByIdAndUpdate(category_id, updates, { new: true });
        return res.json({
            success: true,
            category: {
                id: updatedCategory._id,
                name: updatedCategory.name,
                description: updatedCategory.description,
                image: updatedCategory.image,
            },
        });
    }
    catch (error) {
        console.error("Category update error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
export const getCategoriesByRestaurantID = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { restaurant_id } = req.params;
    try {
        const categories = yield Category.find({ restaurant_id: restaurant_id });
        if (categories) {
            return res.json({ success: true, categories });
        }
        else {
            return res.status(401).send({ message: "Categories not found" });
        }
    }
    catch (error) {
        console.error("Get categories error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
export const getCategoryById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { category_id } = req.params;
    if (!category_id || !mongoose.Types.ObjectId.isValid(category_id)) {
        return res.status(400).json({ message: "Invalid category ID" });
    }
    try {
        const category = yield Category.findById(category_id);
        if (!category) {
            return res
                .status(404)
                .json({ success: false, message: "Category not found" });
        }
        return res.json({ success: true, category });
    }
    catch (error) {
        console.error("Get category error:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});
export const getAllCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield Category.find({})
            .populate({
            path: "restaurant_id",
            select: "name logo",
            model: Restaurant,
        })
            .sort({ name: 1 });
        // Format the response
        const response = {
            success: true,
            count: categories.length,
            categories: categories.map((category) => ({
                id: category._id,
                name: category.name,
                description: category.description,
                image: category.image,
                restaurant: category.restaurant_id,
                isActive: category.isActive,
                createdAt: category.createdAt,
            })),
        };
        res.json(response);
    }
    catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({
            success: false,
            error: "Server error while fetching categories",
        });
    }
});
