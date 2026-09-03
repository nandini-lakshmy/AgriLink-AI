import { Response } from "express";
import { comparePrice } from "../services/priceComparison.service";
import { AuthRequest } from "../middleware/auth.middleware";

export async function compareGovernmentPrice(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user || req.user.role !== "buyer") {
      res.status(403).json({
        message: "Only buyers can compare prices",
      });
      return;
    }

    const {
      listing_id,
      offered_price,
      state,
      district,
    } = req.body;

    if (
      !listing_id ||
      offered_price === undefined ||
      !state ||
      !district
    ) {
      res.status(400).json({
        message:
          "listing_id, offered_price, state and district are required",
      });
      return;
    }

    const offeredPrice = Number(offered_price);

    if (!Number.isFinite(offeredPrice)) {
      res.status(400).json({
        message: "Offered price must be a valid number",
      });
      return;
    }

    if (offeredPrice < 0) {
      res.status(400).json({
        message: "Offered price cannot be negative",
      });
      return;
    }

    const result = await comparePrice(
      req.user.id,
      listing_id,
      offeredPrice,
      state,
      district,
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Price comparison error:", error);

    if (error instanceof Error) {
      if (
        error.message === "Invalid buyer_id" ||
        error.message === "Invalid listing_id" ||
        error.message === "Offered price cannot be negative"
      ) {
        res.status(400).json({
          message: error.message,
        });
        return;
      }

      if (
        error.message === "Buyer not found" ||
        error.message === "Listing not found"
      ) {
        res.status(404).json({
          message: error.message,
        });
        return;
      }

      if (
        error.message ===
        "Price comparison is only available for active listings"
      ) {
        res.status(400).json({
          message: error.message,
        });
        return;
      }

      if (
        error.message.includes("No government price data") ||
        error.message.includes("No valid government modal prices")
      ) {
        res.status(404).json({
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