import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { Buyer } from "../models/buyer.model";
import { Requirement } from "../models/requirement.model";
import { Bid } from "../models/bid.model";

export async function getBuyerDashboard(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user || req.user.role !== "buyer") {
      res.status(403).json({
        message: "Only buyers can access this dashboard",
      });
      return;
    }

    const buyerId = req.user.id;

    const buyer = await Buyer.findById(buyerId).select("-password");

    if (!buyer) {
      res.status(404).json({
        message: "Buyer not found",
      });
      return;
    }

    const requirements = await Requirement.find({
      buyer_id: buyerId,
    }).sort({
      createdAt: -1,
    });

    const bids = await Bid.find({
      buyer_id: buyerId,
    })
      .populate(
        "listing_id",
        "crop_name quantity expected_price status farmer_id",
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      buyer: {
        id: buyer._id,
        name: buyer.name,
        phone: buyer.phone,
        business_name: buyer.business_name,
        state: buyer.state,
        district: buyer.district,
        market_location: buyer.market_location,
        latitude: buyer.latitude,
        longitude: buyer.longitude,
      },
      requirements,
      bids,
    });
  } catch (error) {
    console.error("Buyer dashboard error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}