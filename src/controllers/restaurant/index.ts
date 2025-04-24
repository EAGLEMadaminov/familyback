import {
  updateRestaurant,
  getAllRestaurants,
  addRestaurantAddress,
} from "./restaurantController.js";
import {
  createCategory,
  deleteCategory,
  updateCategory,
  getCategoriesByRestaurantID,
  getCategoryById,
  getAllCategory,
} from "./categoryController.js";

import {
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductsByRestaurant,
  getAllProducts,
} from "./productController.js";

export {
  createCategory,
  deleteCategory,
  updateCategory,
  getCategoryById,
  getCategoriesByRestaurantID,
  getAllCategory,
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductsByRestaurant,
  updateRestaurant,
  getAllRestaurants,
  addRestaurantAddress,
};
