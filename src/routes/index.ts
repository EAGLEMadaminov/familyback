import authRouter from "./auth.js";
import { orderRouter } from "./order.js";
import { userRouter } from "./user.js";
import categoryRouter from "./restaurant/categoryRoutes.js";
import productRouter from "./restaurant/productRoutes.js";
import restaurantRouter from "./restaurant/index.js";
import imageRouter from "./imageRouter.js";

export {
  authRouter,
  orderRouter,
  userRouter,
  categoryRouter,
  productRouter,
  restaurantRouter,
  imageRouter,
};
