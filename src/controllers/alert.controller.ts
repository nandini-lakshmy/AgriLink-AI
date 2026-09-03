import { Response } from "express";
import { Alert } from "../models/alert.model";
import { AuthRequest } from "../middleware/auth.middleware";

export async function getBuyerAlerts(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user || req.user.role !== "buyer") {
      res.status(403).json({
        message: "Only buyers can view buyer alerts",
      });
      return;
    }

    const alerts = await Alert.find({
      buyer_id: req.user.id,
    })
      .populate("farmer_id", "-password")
      .populate("listing_id")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    console.error("Get buyer alerts error:", error);

    res.status(500).json({
      message: "Failed to fetch buyer alerts",
    });
  }
}

export async function getFarmerAlerts(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user || req.user.role !== "farmer") {
      res.status(403).json({
        message: "Only farmers can view farmer alerts",
      });
      return;
    }

    const alerts = await Alert.find({
      farmer_id: req.user.id,
    })
      .populate("buyer_id", "-password")
      .populate("listing_id")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    console.error("Get farmer alerts error:", error);

    res.status(500).json({
      message: "Failed to fetch farmer alerts",
    });
  }
}