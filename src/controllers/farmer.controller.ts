import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Farmer } from "../models/farmer.model";
import { loginFarmer } from "../services/auth.service";

export async function registerFarmer(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const {
      name,
      phone,
      password,
      state,
      district,
      location,
      latitude,
      longitude,
    } = req.body;

    if (
      !name ||
      !phone ||
      !password ||
      !state ||
      !district ||
      !location ||
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

    const existingFarmer = await Farmer.findOne({ phone });

    if (existingFarmer) {
      res.status(409).json({
        message: "Farmer with this phone number already exists",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const farmer = await Farmer.create({
      name,
      phone,
      password: hashedPassword,
      state,
      district,
      location,
      latitude,
      longitude,
    });

    res.status(201).json({
      message: "Farmer registered successfully",
      farmer: {
        id: farmer._id,
        name: farmer.name,
        phone: farmer.phone,
        state: farmer.state,
        district: farmer.district,
        location: farmer.location,
        latitude: farmer.latitude,
        longitude: farmer.longitude,
      },
    });
  } catch (error) {
    console.error("Farmer registration error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function loginFarmerController(
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

    const result = await loginFarmer(phone, password);

    if (!result) {
      res.status(401).json({
        message: "Invalid phone number or password",
      });
      return;
    }

    res.status(200).json({
      message: "Farmer login successful",
      ...result,
    });
  } catch (error) {
    console.error("Farmer login error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}