import { Request, Response } from "express";
import {
  getMarketPrices,
  getMarketPriceHistory,
  getNearbyMarkets,
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

export async function getNearbyMarketsController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const {
      crop,
      latitude,
      longitude,
      radius,
    } = req.query;

    if (
      typeof crop !== "string" ||
      !crop.trim()
    ) {
      res.status(400).json({
        message:
          "crop query parameter is required",
      });
      return;
    }

    if (
      typeof latitude !== "string" ||
      typeof longitude !== "string"
    ) {
      res.status(400).json({
        message:
          "latitude and longitude query parameters are required",
      });
      return;
    }

    const parsedLatitude =
      Number(latitude);

    const parsedLongitude =
      Number(longitude);

    if (
      !Number.isFinite(parsedLatitude) ||
      parsedLatitude < -90 ||
      parsedLatitude > 90
    ) {
      res.status(400).json({
        message:
          "latitude must be a valid number between -90 and 90",
      });
      return;
    }

    if (
      !Number.isFinite(parsedLongitude) ||
      parsedLongitude < -180 ||
      parsedLongitude > 180
    ) {
      res.status(400).json({
        message:
          "longitude must be a valid number between -180 and 180",
      });
      return;
    }

    let requestedRadius = 25;

    if (radius !== undefined) {
      if (
        typeof radius !== "string" ||
        !/^\d+(\.\d+)?$/.test(radius)
      ) {
        res.status(400).json({
          message:
            "radius must be a positive number",
        });
        return;
      }

      requestedRadius = Number(radius);

      if (
        requestedRadius <= 0 ||
        requestedRadius > 500
      ) {
        res.status(400).json({
          message:
            "radius must be greater than 0 and at most 500 km",
        });
        return;
      }
    }

    const markets =
      await getNearbyMarkets(
        crop.trim(),
        parsedLatitude,
        parsedLongitude,
        requestedRadius,
      );

    res.status(200).json({
      crop: crop.trim(),
      latitude: parsedLatitude,
      longitude: parsedLongitude,
      radius_km: requestedRadius,
      count: markets.length,
      markets,
    });
  } catch (error) {
    console.error(
      "Nearby market error:",
      error,
    );

    res.status(500).json({
      message:
        "Failed to fetch nearby markets",
    });
  }
}