import { Request, Response } from "express";
import { findMatchingBuyers } from "../services/matching.service";

export async function getMatchingBuyers(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const listingId = req.params.listingId;

    if (typeof listingId !== "string" || !listingId) {
      res.status(400).json({
        message: "Valid listingId is required",
      });
      return;
    }

    const radiusParam = req.query.radius;

    let radiusKm = 25;

    if (radiusParam !== undefined) {
      if (typeof radiusParam !== "string") {
        res.status(400).json({
          message: "Radius must be a single number",
        });
        return;
      }

      radiusKm = Number(radiusParam);

      if (!Number.isFinite(radiusKm) || radiusKm <= 0) {
        res.status(400).json({
          message: "Radius must be greater than 0",
        });
        return;
      }
    }

    const matches = await findMatchingBuyers(
      listingId,
      radiusKm,
    );

    res.status(200).json({
      message: "Matching buyers found",
      radius_km: radiusKm,
      matches,
    });
  } catch (error) {
    console.error("Matching error:", error);

    if (error instanceof Error) {
      if (error.message === "Listing not found") {
        res.status(404).json({
          message: "Listing not found",
        });
        return;
      }

      if (error.message === "Farmer not found") {
        res.status(404).json({
          message: "Farmer not found",
        });
        return;
      }
    }

    res.status(500).json({
      message: "Internal server error",
    });
  }
}