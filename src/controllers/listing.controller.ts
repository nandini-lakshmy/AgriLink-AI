import { Request, Response } from "express";
import mongoose from "mongoose";
import { Listing } from "../models/listing.model";
import { Farmer } from "../models/farmer.model";
import {
  AuthRequest,
} from "../middleware/auth.middleware";

const VALID_URGENCY = [
  "today",
  "within_3_days",
  "within_week",
] as const;

export async function createListing(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user || req.user.role !== "farmer") {
      res.status(403).json({
        message: "Only farmers can create crop listings",
      });
      return;
    }

    const {
      crop_name,
      quantity,
      expected_price,
      image,
      urgency,
      storage_available,
    } = req.body;

    if (!crop_name || quantity === undefined) {
      res.status(400).json({
        message: "crop_name and quantity are required",
      });
      return;
    }

    if (Number(quantity) <= 0) {
      res.status(400).json({
        message: "Quantity must be greater than 0",
      });
      return;
    }

    if (
      expected_price !== undefined &&
      Number(expected_price) < 0
    ) {
      res.status(400).json({
        message: "Expected price cannot be negative",
      });
      return;
    }

    if (
      urgency !== undefined &&
      !VALID_URGENCY.includes(urgency)
    ) {
      res.status(400).json({
        message:
          "Invalid urgency. Use today, within_3_days, or within_week",
      });
      return;
    }

    if (
      storage_available !== undefined &&
      typeof storage_available !== "boolean"
    ) {
      res.status(400).json({
        message: "storage_available must be a boolean",
      });
      return;
    }

    const farmerId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(farmerId)) {
      res.status(401).json({
        message: "Invalid authentication token",
      });
      return;
    }

    const farmer = await Farmer.findById(farmerId);

    if (!farmer) {
      res.status(404).json({
        message: "Farmer not found",
      });
      return;
    }

    const listing = await Listing.create({
      farmer_id: farmerId,
      crop_name,
      quantity: Number(quantity),
      expected_price:
        expected_price !== undefined
          ? Number(expected_price)
          : undefined,
      image,
      urgency:
        urgency !== undefined
          ? urgency
          : "within_week",
      storage_available:
        storage_available !== undefined
          ? storage_available
          : false,
    });

    res.status(201).json({
      message: "Crop listing created successfully",
      listing,
    });
  } catch (error) {
    console.error("Create listing error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}