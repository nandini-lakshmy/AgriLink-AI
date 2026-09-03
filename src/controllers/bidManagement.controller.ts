import { Request, Response } from "express";
import mongoose from "mongoose";
import { Bid } from "../models/bid.model";
import { Listing } from "../models/listing.model";

export async function acceptBid(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const bidId = req.params.bidId;

    if (typeof bidId !== "string" || !mongoose.Types.ObjectId.isValid(bidId)) {
      res.status(400).json({
        message: "Invalid bidId",
      });
      return;
    }

    const bid = await Bid.findById(bidId);

    if (!bid) {
      res.status(404).json({
        message: "Bid not found",
      });
      return;
    }

    if (bid.status !== "pending") {
      res.status(400).json({
        message: "Only pending bids can be accepted",
      });
      return;
    }

    const listing = await Listing.findById(bid.listing_id);

    if (!listing) {
      res.status(404).json({
        message: "Listing not found",
      });
      return;
    }

    if (listing.status !== "active") {
      res.status(400).json({
        message: "Listing is no longer active",
      });
      return;
    }

    bid.status = "accepted";
    await bid.save();

    listing.status = "sold";
    await listing.save();

    await Bid.updateMany(
      {
        listing_id: listing._id,
        _id: { $ne: bid._id },
        status: "pending",
      },
      {
        $set: { status: "rejected" },
      },
    );

    res.status(200).json({
      message: "Bid accepted successfully",
      bid,
      listing_status: listing.status,
    });
  } catch (error) {
    console.error("Accept bid error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function rejectBid(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const bidId = req.params.bidId;

    if (typeof bidId !== "string" || !mongoose.Types.ObjectId.isValid(bidId)) {
      res.status(400).json({
        message: "Invalid bidId",
      });
      return;
    }

    const bid = await Bid.findById(bidId);

    if (!bid) {
      res.status(404).json({
        message: "Bid not found",
      });
      return;
    }

    if (bid.status !== "pending") {
      res.status(400).json({
        message: "Only pending bids can be rejected",
      });
      return;
    }

    bid.status = "rejected";
    await bid.save();

    res.status(200).json({
      message: "Bid rejected successfully",
      bid,
    });
  } catch (error) {
    console.error("Reject bid error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}