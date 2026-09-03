import { Response } from "express";
import mongoose from "mongoose";
import { Requirement } from "../models/requirement.model";
import { Buyer } from "../models/buyer.model";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  findMatchingListings,
  findMatchingRequirementsForFarmer,
} from "../services/requirementMatching.service";

export async function createRequirement(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user || req.user.role !== "buyer") {
      res.status(403).json({
        message: "Only buyers can create requirements",
      });
      return;
    }

    const {
      crop_name,
      quantity_needed,
      offered_price,
    } = req.body;

    if (
      !crop_name ||
      quantity_needed === undefined ||
      offered_price === undefined
    ) {
      res.status(400).json({
        message:
          "crop_name, quantity_needed and offered_price are required",
      });
      return;
    }

    const quantity = Number(quantity_needed);
    const offeredPrice = Number(offered_price);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      res.status(400).json({
        message: "Quantity needed must be greater than 0",
      });
      return;
    }

    if (!Number.isFinite(offeredPrice) || offeredPrice < 0) {
      res.status(400).json({
        message:
          "Offered price must be a valid non-negative number",
      });
      return;
    }

    const buyerId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(buyerId)) {
      res.status(401).json({
        message: "Invalid authentication token",
      });
      return;
    }

    const buyer = await Buyer.findById(buyerId);

    if (!buyer) {
      res.status(404).json({
        message: "Buyer not found",
      });
      return;
    }

    const requirement = await Requirement.create({
      buyer_id: buyerId,
      crop_name: String(crop_name).trim(),
      quantity_needed: quantity,
      offered_price: offeredPrice,
    });

    res.status(201).json({
      message: "Buyer requirement created successfully",
      requirement,
    });
  } catch (error) {
    console.error("Create requirement error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getMatchingListings(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user || req.user.role !== "buyer") {
      res.status(403).json({
        message: "Only buyers can view matching listings",
      });
      return;
    }

    const requirementId = String(req.params.requirementId);

    if (!mongoose.Types.ObjectId.isValid(requirementId)) {
      res.status(400).json({
        message: "Invalid requirement ID",
      });
      return;
    }

    const requirement = await Requirement.findById(
      requirementId,
    );

    if (!requirement) {
      res.status(404).json({
        message: "Requirement not found",
      });
      return;
    }

    if (requirement.buyer_id.toString() !== req.user.id) {
      res.status(403).json({
        message:
          "You are not the owner of this requirement",
      });
      return;
    }

    const matches = await findMatchingListings(
      requirementId,
    );

    res.status(200).json({
      message: "Matching farmer listings found",
      requirement_id: requirementId,
      count: matches.length,
      matches,
    });
  } catch (error) {
    console.error(
      "Get matching listings error:",
      error,
    );

    res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getMatchingRequirementsForFarmer(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user || req.user.role !== "farmer") {
      res.status(403).json({
        message:
          "Only farmers can view matching buyer requirements",
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

    const matches =
      await findMatchingRequirementsForFarmer(
        farmerId,
      );

    res.status(200).json({
      message:
        "Matching buyer requirements found",
      count: matches.length,
      matches,
    });
  } catch (error) {
    console.error(
      "Get farmer matching requirements error:",
      error,
    );

    res.status(500).json({
      message: "Internal server error",
    });
  }
}