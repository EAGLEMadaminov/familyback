import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";

// ES Modules uchun __dirname alternativi
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fayl saqlash konfiguratsiyasi
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// Fayl filter - faqat rasmlarni qabul qilish
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Faqat rasm fayllarini yuklashingiz mumkin!"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Rasm yuklash
const uploadImage = upload.single("image");

const imageController = {
  // Rasm yuklash
  uploadImage: (req: Request, res: Response) => {
    uploadImage(req, res, async (err) => {
      try {
        // 1. Check Authorization Header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
          return res.status(401).json({
            success: false,
            error: "Authorization header is missing",
          });
        }

        // 2. Validate Token Format
        const tokenParts = authHeader.split(" ");
        if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
          return res.status(401).json({
            success: false,
            error: "Invalid token format. Expected: 'Bearer <token>'",
          });
        }

        const token = tokenParts[1];

        // 3. Verify JWT Token
        let decoded;
        try {
          decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        } catch (jwtError) {
          return res.status(401).json({
            success: false,
            error: "Invalid or expired token",
          });
        }

        // 4. Check Phone Verification Status
        if (!decoded.isPhoneVerified) {
          return res.status(403).json({
            success: false,
            error: "Bu raqam ro'yhatdan o'tmagan",
          });
        }

        // 5. Handle Multer Errors
        if (err) {
          return res.status(400).json({
            success: false,
            error: err.message || "File upload failed",
          });
        }

        // 6. Check if File Exists
        if (!req.file) {
          return res.status(400).json({
            success: false,
            error: "Fayl yuklanmadi",
          });
        }

        // 7. Prepare File Information
        const fileInfo = {
          originalName: req.file.originalname,
          filename: req.file.filename,
          size: req.file.size,
          mimetype: req.file.mimetype,
          path: `/image/${req.file.filename}`,
          userId: decoded.userId, // Include user ID from token
          uploadedAt: new Date(),
        };

        // 8. Success Response
        return res.status(200).json({
          success: true,
          message: "Rasm muvaffaqiyatli yuklandi",
          data: fileInfo,
        });
      } catch (error) {
        console.error("Server xatosi:", error);
        return res.status(500).json({
          success: false,
          error: "Server xatosi",
        });
      }
    });
  },

  // Rasmni o'chirish
  deleteImage: (req: Request, res: Response) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, "../../public/uploads", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Fayl topilmadi",
      });
    }

    try {
      fs.unlinkSync(filePath);
      res.status(200).json({
        success: true,
        message: "Rasm muvaffaqiyatli o'chirildi",
      });
    } catch (error) {
      console.error("Xatolik:", error);
      res.status(500).json({
        success: false,
        message: "Faylni o'chirishda xatolik",
      });
    }
  },

  getSingleImage: (req: Request, res: Response) => {
    const { filename } = req.params;
    console.log(filename);

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: "Filename parameter is required",
      });
    }

    // Construct the full file path
    const uploadDir = path.join(__dirname, "../../public/uploads");
    const filePath = path.join(uploadDir, filename);

    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error("Error accessing file:", err);
        return res.status(404).json({
          success: false,
          message: "File not found",
        });
      }

      // Check if the file is an image (optional)
      const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".svg"];
      const ext = path.extname(filename).toLowerCase();

      if (!imageExtensions.includes(ext)) {
        return res.status(400).json({
          success: false,
          message: "Requested file is not an image",
        });
      }

      // Set appropriate content-type header
      const mimeTypes: Record<string, string> = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
      };

      res.setHeader(
        "Content-Type",
        mimeTypes[ext] || "application/octet-stream"
      );

      // Create read stream and pipe to response
      const fileStream = fs.createReadStream(filePath);

      fileStream.on("error", (error) => {
        console.error("File stream error:", error);
        res.status(500).json({
          success: false,
          message: "Error reading file",
        });
      });

      fileStream.pipe(res);
    });
  },
  // Barcha rasmlarni olish
  getAllImages: (req: Request, res: Response) => {
    const uploadDir = path.join(__dirname, "../../public/uploads");

    fs.readdir(uploadDir, (err, files) => {
      if (err) {
        console.error("Xatolik:", err);
        return res.status(500).json({
          success: false,
          message: "Fayllarni o'qishda xatolik",
        });
      }

      const images = files.map((file) => ({
        name: file,
        url: `/uploads/${file}`,
      }));

      res.status(200).json({
        success: true,
        data: images,
      });
    });
  },
};

export default imageController;
