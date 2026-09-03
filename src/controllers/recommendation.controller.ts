import { Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/auth.middleware";
import { prepareRecommendationData } from "../services/recommendation.service";
import { getAIRecommendation } from "../services/aiRecommendation.service";
import { Listing } from "../models/listing.model";

export async function getRecommendationData(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user || req.user.role !== "farmer") {
      res.status(403).json({
        message: "Only farmers can request recommendations",
      });
      return;
    }

    const listingId = String(req.params.listingId);

    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      res.status(400).json({
        message: "Invalid listing ID",
      });
      return;
    }

    const listing = await Listing.findById(listingId);

    if (!listing) {
      res.status(404).json({
        message: "Listing not found",
      });
      return;
    }

    if (listing.farmer_id.toString() !== req.user.id) {
      res.status(403).json({
        message: "You are not the owner of this listing",
      });
      return;
    }

    const recommendationData =
      await prepareRecommendationData(listingId);

    const aiRecommendation =
      await getAIRecommendation(recommendationData);

    res.status(200).json({
      message: "AI recommendation generated successfully",
      data: aiRecommendation,
    });
  } catch (error) {
    console.error("Get AI recommendation error:", error);

    if (error instanceof Error) {
      if (
        error.message === "Invalid listing_id" ||
        error.message === "Invalid listing ID"
      ) {
        res.status(400).json({
          message: error.message,
        });
        return;
      }

      if (
        error.message === "Listing not found" ||
        error.message === "Farmer not found"
      ) {
        res.status(404).json({
          message: error.message,
        });
        return;
      }

      if (
        error.message ===
        "Recommendation is only available for active listings"
      ) {
        res.status(400).json({
          message: error.message,
        });
        return;
      }

      if (
        error.message ===
        "Farmer location coordinates are required for recommendation"
      ) {
        res.status(400).json({
          message: error.message,
        });
        return;
      }

      if (
        error.message.startsWith(
          "AI recommendation service failed:",
        )
      ) {
        res.status(502).json({
          message: error.message,
        });
        return;
      }
    }

    res.status(500).json({
      message: "Internal server error",
    });
  }
}