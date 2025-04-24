// controllers/productController.ts
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Product, Category } from "../../models/index.js";
import mongoose from "mongoose";
import { requireAuth } from "../../middleware/auth.js";

interface JwtPayload {
  userId: string;
  phoneNumber: string;
  role: string;
  restaurantId?: string;
}

export const createProduct = async (req: Request, res: Response) => {
  const { name, price, category_id, description, images, preparationTime } =
    req.body;
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header is missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    if (decoded.role !== "restaurant_owner" || !decoded.restaurantId) {
      return res.status(403).json({ error: "Permission denied" });
    }

    // Check if category belongs to this restaurant
    const category = await Category.findOne({
      _id: category_id,
      restaurant_id: decoded.restaurantId,
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const newProduct = new Product({
      name,
      price,
      description,
      images,
      preparationTime,
      category_id,
      restaurant_id: decoded.restaurantId,
    });

    await newProduct.save();

    // Add product to category's products array
    await Category.findByIdAndUpdate(
      category_id,
      { $push: { products: newProduct } },
      { new: true }
    );

    return res.status(201).json({
      success: true,
      product: {
        id: newProduct._id,
        name: newProduct.name,
        price: newProduct.price,
        category: category.name,
      },
    });
  } catch (error) {
    console.error("Product creation error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const product = await Product.findById(productId)
      .populate("restaurant_id", "name logo")
      .populate("category_id", "name");

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({
      success: true,
      product: {
        id: product._id,
        name: product.name,
        price: product.price,
        description: product.description,
        images: product.images,
        isAvailable: product.isAvailable,
        restaurant: product.restaurant_id,
        category: product.category_id,
      },
    });
  } catch (error) {
    console.error("Get product by ID error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const { productId } = req.params;
  const updates = req.body;
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header is missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    if (decoded.role !== "restaurant_owner" || !decoded.restaurantId) {
      return res.status(403).json({ error: "Permission denied" });
    }

    // Check if product belongs to this restaurant
    const product = await Product.findOne({
      _id: productId,
      restaurant_id: decoded.restaurantId,
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Kategoriyani yangilash uchun alohida tekshiruv
    if (updates.category_id) {
      const categoryExists = await Category.findOne({
        _id: updates.category_id,
        restaurant_id: decoded.restaurantId,
      });

      if (!categoryExists) {
        return res
          .status(400)
          .json({ error: "Category does not belong to your restaurant" });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(productId, updates, {
      new: true,
    });

    res.json({
      success: true,
      product: {
        id: updatedProduct!._id,
        name: updatedProduct!.name,
        price: updatedProduct!.price,
        isAvailable: updatedProduct!.isAvailable,
      },
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { productId } = req.params;
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header is missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    if (decoded.role !== "restaurant_owner" || !decoded.restaurantId) {
      return res.status(403).json({ error: "Permission denied" });
    }

    // Check if product belongs to this restaurant
    const product = await Product.findOne({
      _id: productId,
      restaurant_id: decoded.restaurantId,
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Soft delete (set isAvailable to false)
    await Product.findByIdAndDelete(productId);

    // Remove from category's products array
    await Category.findByIdAndUpdate(product.category_id, {
      $pull: { products: productId },
    });

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getProductsByCategory = async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  // const { availableOnly } = req.query;

  try {
    const query: any = { category_id: categoryId };
    // if (availableOnly === "true") {
    //   query.isAvailable = true;
    // }

    const products = await Product.find(query)
      .select("name price description images isAvailable")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get products by category error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// controllers/productController.ts
export const getProductsByRestaurant = async (req: Request, res: Response) => {
  const { restaurantId } = req.params;
  // const { availableOnly = "true", categoryId } = req.query;
  const authHeader = req.headers.authorization;

  try {
    // Build base query
    const query: any = { restaurant_id: restaurantId };

    // Availability filter
    // if (availableOnly === "true") {
    //   query.isAvailable = true;
    // }

    // // Category filter
    // if (categoryId) {
    //   query.category_id = categoryId;
    // }

    // For authenticated restaurant owners, include additional fields
    let selectFields = "name price description images isAvailable";
    let populateOptions: any = { path: "category_id", select: "name" };

    if (authHeader) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

      if (
        decoded.role === "restaurant_owner" &&
        decoded.restaurantId === restaurantId
      ) {
        selectFields += " ingredients preparationTime createdAt updatedAt";
        populateOptions.select += " isVegetarian isVegan isGlutenFree";
      }
    }

    const products = await Product.find(query)
      .select(selectFields)
      .populate(populateOptions)
      .sort({ createdAt: -1 });

    // Format response
    const response = {
      success: true,
      count: products.length,
      products: products.map((product) => ({
        id: product._id,
        name: product.name,
        price: product.price,
        description: product.description,
        images: product.images,
        isAvailable: product.isAvailable,
        category: product.category_id,
        ...(product.get("ingredients") && {
          preparationTime: product.preparationTime,
        }),
      })),
    };

    res.json(response);
  } catch (error) {
    console.error("Get products by restaurant error:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: "Invalid token" });
    }

    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  const { limit = "20", page = "1" } = req.query;
  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);
  const skip = (pageNumber - 1) * limitNumber;

  try {
    const products = await Product.find({})
      .populate("restaurant_id", "name logo")
      .populate("category_id", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    res.json({
      success: true,
      count: products.length,
      products: products.map((product) => ({
        id: product._id,
        name: product.name,
        price: product.price,
        description: product.description,
        images: product.images,
        isAvailable: product.isAvailable,
        restaurant: product.restaurant_id,
        category: product.category_id,
      })),
    });
  } catch (error) {
    console.error("Get all products error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
