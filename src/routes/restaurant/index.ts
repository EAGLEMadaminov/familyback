import { Router } from "express";
import apicache from "apicache";
import {
  updateRestaurant,
  getAllRestaurants,
  addRestaurantAddress,
} from "../../controllers/index.js";
const restaurantRouter = Router();
const cache = apicache.middleware;

// restaurantRouter.put("/edit/:id", updateRestaurant);
restaurantRouter.put("/edit/:id", updateRestaurant);
restaurantRouter.get(
  "/restaurants/all",
  cache("10 minutes"),
  getAllRestaurants
);
restaurantRouter.post("/add/newlocation", addRestaurantAddress);
export default restaurantRouter;
