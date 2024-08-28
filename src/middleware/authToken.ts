import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

interface JwtPayload {
  phone_number: string;
}

const authenticatedToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).send("Access denied");

  jwt.verify(token, process.env.JWT_SECRET as string, async (err, user) => {
    if (err) {
      console.log("JWT Verification Error:", err.message);
      return res.status(403).send("Forbidden");
    }

    const decodedUser = user as JwtPayload;

    try {
      const userFromDB = await User.findOne({
        phoneNumber: decodedUser.phone_number,
      });

      if (!userFromDB) {
        return res.status(404).send("User not found");
      }

      req.user = userFromDB;
      next();
    } catch (error) {
      console.error("Error retrieving user:", error);
      res.status(500).send("Internal server error");
    }
  });
};

export default authenticatedToken;
