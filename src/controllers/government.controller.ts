import { Request, Response } from "express";
import { Alert } from "../models/alert.model";
import { Buyer } from "../models/buyer.model";
import { Farmer } from "../models/farmer.model";

export async function getGovernmentAlerts(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const alerts = await Alert.find({
      alert_status: "UNFAIR_PRICE",
    })
      .populate(
        "buyer_id",
        "name business_name phone state district market_location",
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    console.error("Government alerts error:", error);

    res.status(500).json({
      message: "Failed to fetch government alerts",
    });
  }
}

export async function getGovernmentStats(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const [farmerCount, buyerCount, alertCount] =
      await Promise.all([
        Farmer.countDocuments(),
        Buyer.countDocuments(),
        Alert.countDocuments({
          alert_status: "UNFAIR_PRICE",
        }),
      ]);

    res.status(200).json({
      registered_farmers: farmerCount,
      registered_buyers: buyerCount,
      unfair_price_alerts: alertCount,
    });
  } catch (error) {
    console.error("Government stats error:", error);

    res.status(500).json({
      message: "Failed to fetch government statistics",
    });
  }
}