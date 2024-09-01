import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendCodeToPhoneNumber } from "../middleware/eskizTokes.js";
import { randomInt } from "crypto";
import dotenv from "dotenv";
dotenv.config();

const sendCode = (req: Request, res: Response) => {
  const { phone_number, name } = req.body;
  const code: string = randomInt(10000, 100000).toString();
  let phone: string = phone_number.slice(1);
  sendCodeToPhoneNumber({ phone_number: phone, code });

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).send("JWT secret was denied");
  }

  const codeToken = jwt.sign({ phone_number, code }, secret, {
    expiresIn: "10m",
  });

  try {
    res.status(200).send({ codeToken });
  } catch (error) {
    res.status(500).send({ error: "Internal server error" });
  }
};

const verifyCode = async (req: Request, res: Response) => {
  const { phone_number, code, name } = req.body;
  const codeToken = req.headers["code-token"] as string;

  if (!codeToken) {
    return res.status(400).send("Missing token");
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).send("JWT_SECRET is not defined");
  }

  try {
    const decoded = jwt.verify(codeToken, secret) as {
      phone_number: string;
      code: string;
    };

    if (decoded.code !== code || decoded.phone_number !== phone_number) {
      return res.status(400).send("Incorrect code or phone number");
    }

    const access_token = jwt.sign({ phone_number }, secret, {
      expiresIn: "30d",
    });

    let user = await User.findOne({ phoneNumber: phone_number });
    if (!user) {
      user = new User({
        name,
        phoneNumber: phone_number,
      });
      await user.save();
    } else {
      user.name = name;
      await user.save();
    }

    return res.status(201).send({ access_token });
  } catch (error) {
    return res.status(400).send("Invalid or expired Token");
  }
};

export { sendCode, verifyCode };
