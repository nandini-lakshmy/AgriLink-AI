import { Request, Response } from "express";
import {
  getMarketPrices,
  getMarketPriceHistory,
} from "../services/marketService";

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

export async function getMarketPriceHistoryController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const {
      crop,
      state,
      district,
      limit,
    } = req.query;

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

    let requestedLimit = 100;

    if (limit !== undefined) {
      if (
        typeof limit !== "string" ||
        !/^\d+$/.test(limit)
      ) {
        res.status(400).json({
          message:
            "limit must be a positive integer",
        });
        return;
      }

      requestedLimit = Number(limit);

      if (
        requestedLimit < 1 ||
        requestedLimit > 500
      ) {
        res.status(400).json({
          message:
            "limit must be between 1 and 500",
        });
        return;
      }
    }

    const history =
      await getMarketPriceHistory(
        crop.trim(),
        state.trim(),
        district.trim(),
        requestedLimit,
      );

    res.status(200).json({
      crop: crop.trim(),
      state: state.trim(),
      district: district.trim(),
      count: history.length,
      history,
      source: "data.gov.in / AGMARKNET",
    });
  } catch (error) {
    console.error(
      "Market price history error:",
      error,
    );

    res.status(500).json({
      message:
        "Failed to fetch market price history",
    });
  }
}