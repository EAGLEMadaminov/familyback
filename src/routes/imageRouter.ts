import { Router } from "express";
const imageRouter = Router();
import cors from "cors";
import imageController from "../controllers/imageController.js";

// Rasm yuklash
imageRouter.post("/upload", imageController.uploadImage);

// Rasmni o'chirish
imageRouter.delete("/:filename", imageController.deleteImage);
imageRouter.get("/:filename", cors(), imageController.getSingleImage);

// Barcha rasmlarni olish
imageRouter.get("/", imageController.getAllImages);

export default imageRouter;
