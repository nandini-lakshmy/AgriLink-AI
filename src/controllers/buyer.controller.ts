import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Buyer } from "../models/buyer.model";

export async function registerBuyer(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const {
      name,
      phone,
      password,
      business_name,
      state,
      district,
      market_location,
      latitude,
      longitude,
    } = req.body;

    if (
      !name ||
      !phone ||
      !password ||
      !business_name ||
      !state ||
      !district ||
      !market_location ||
      latitude === undefined ||
      longitude === undefined
    ) {
      res.status(400).json({
        message: "All required fields must be provided",
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
      return;
    }

    const existingBuyer = await Buyer.findOne({ phone });

    if (existingBuyer) {
      res.status(409).json({
        message: "Buyer with this phone number already exists",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const buyer = await Buyer.create({
      name,
      phone,
      password: hashedPassword,
      business_name,
      state,
      district,
      market_location,
      latitude,
      longitude,
    });

    res.status(201).json({
      message: "Buyer registered successfully",
      buyer: {
        id: buyer._id,
        name: buyer.name,
        phone: buyer.phone,
        business_name: buyer.business_name,
        state: buyer.state,
        district: buyer.district,
        market_location: buyer.market_location,
        latitude: buyer.latitude,
        longitude: buyer.longitude,
      },
    });
  } catch (error) {
    console.error("Buyer registration error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function loginBuyer(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      res.status(400).json({
        message: "Phone and password are required",
      });
      return;
    }

    const buyer = await Buyer.findOne({ phone });

    if (!buyer) {
      res.status(401).json({
        message: "Invalid phone number or password",
      });
      return;
    }

    const passwordMatches = await bcrypt.compare(
      password,
      buyer.password,
    );

    if (!passwordMatches) {
      res.status(401).json({
        message: "Invalid phone number or password",
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined in .env");
    }

    const token = jwt.sign(
      {
        id: buyer._id.toString(),
        role: "buyer",
      },
      jwtSecret,
      {
        expiresIn: "7d",
      },
    );

    res.status(200).json({
      message: "Buyer login successful",
      token,
      buyer: {
        id: buyer._id,
        name: buyer.name,
        phone: buyer.phone,
        business_name: buyer.business_name,
        state: buyer.state,
        district: buyer.district,
        market_location: buyer.market_location,
        latitude: buyer.latitude,
        longitude: buyer.longitude,
      },
    });
  } catch (error) {
    console.error("Buyer login error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}