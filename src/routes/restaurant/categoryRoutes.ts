import { NextFunction, Router, Request, Response } from "express";
import apicache from "apicache";
import {
  createCategory,
  deleteCategory,
  updateCategory,
  getCategoriesByRestaurantID,
  getCategoryById,
  getAllCategory,
} from "../../controllers/index.js";

const categoryRouter = Router();
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

// Routes
categoryRouter.post("/add", clearCache, createCategory);
categoryRouter.put("/:category_id", clearCache, updateCategory);
categoryRouter.delete("/:category_id", clearCache, deleteCategory);

// Cached GET routes
categoryRouter.get(
  "/:category_id",
  cache("5 minutes", onlyStatus200),
  getCategoryById
);
categoryRouter.get(
  "/restaurant/:restaurant_id",
  cache("5 minutes", onlyStatus200),
  getCategoriesByRestaurantID
);
categoryRouter.get("/all", cache("5 minutes", onlyStatus200), getAllCategory);

export default categoryRouter;
