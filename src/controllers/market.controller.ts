import { Request, Response } from "express";
import { getMarketPrices } from "../services/marketService";

export async function getMarketPricesController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { crop, state, district } = req.query;

    if (
      typeof crop !== "string" ||
      !crop.trim() ||
      typeof state !== "string" ||
      !state.trim() ||
      typeof district !== "string" ||
      !district.trim()
    ) {
      res.status(400).json({
        message:
          "crop, state and district query parameters are required",
      });
      return;
    }

    const markets = await getMarketPrices(
      crop.trim(),
      state.trim(),
      district.trim(),
    );

    res.status(200).json({
      crop: crop.trim(),
      state: state.trim(),
      district: district.trim(),
      count: markets.length,
      markets,
    });
  } catch (error) {
    console.error("Market price error:", error);

    res.status(500).json({
      message: "Failed to fetch market prices",
    });
  }
}