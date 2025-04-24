import { Router } from "express";
import apicache from "apicache";
import { requireAuth } from "../../middleware/auth.js";
import {
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductsByRestaurant,
  getAllProducts,
} from "../../controllers/index.js";

const productRouter = Router();
const cache = apicache.middleware;
const onlyStatus200 = (req: Request, res: Response) => res.statusCode === 200;

const clearCache = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;

  res.send = function (body) {
    if (res.statusCode < 400) {
      apicache.clear();
    }
    originalSend.call(this, body);
  };

  next();
};

// GET routes with caching
productRouter.get(
  "/:productId",
  cache("5 minut", onlyStatus200),
  getProductById
);
productRouter.get(
  "/category/:categoryId",
  cache("5 minut", onlyStatus200),
  getProductsByCategory
);
productRouter.get(
  "/restaurant/:restaurantId",
  cache("5 minut", onlyStatus200),
  getProductsByRestaurant
);

productRouter.get("/all", cache("10 minut", onlyStatus200), getAllProducts);

// Mutation routes with cache clearing
productRouter.post(
  "/add",
  clearCache,
  requireAuth(["superadmin", "restaurant_owner"]),
  createProduct
);
productRouter.put("/:productId", clearCache, updateProduct);
productRouter.delete("/:productId", clearCache, deleteProduct);

export default productRouter;
