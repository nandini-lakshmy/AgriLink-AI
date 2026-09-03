import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { Farmer } from "../models/farmer.model";
import { Listing } from "../models/listing.model";
import { Bid } from "../models/bid.model";

export async function getFarmerDashboard(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user || req.user.role !== "farmer") {
      res.status(403).json({
        message: "Only farmers can access this dashboard",
      });
      return;
    }

    const farmerId = req.user.id;

    const farmer = await Farmer.findById(farmerId).select(
      "-password",
    );

    if (!farmer) {
      res.status(404).json({
        message: "Farmer not found",
      });
      return;
    }

    const listings = await Listing.find({
      farmer_id: farmerId,
    }).sort({
      createdAt: -1,
    });

    const listingIds = listings.map((listing) => listing._id);

    const bids = await Bid.find({
      listing_id: { $in: listingIds },
    })
      .populate(
        "buyer_id",
        "name business_name phone market_location",
      )
      .sort({
        offered_price: -1,
      });

    res.status(200).json({
      farmer: {
        id: farmer._id,
        name: farmer.name,
        phone: farmer.phone,
        state: farmer.state,
        district: farmer.district,
        location: farmer.location,
        latitude: farmer.latitude,
        longitude: farmer.longitude,
      },
      listings,
      bids,
    });
  } catch (error) {
    console.error("Farmer dashboard error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}