import { Response } from "express";
import mongoose from "mongoose";
import { Bid } from "../models/bid.model";
import { Listing } from "../models/listing.model";
import { AuthRequest } from "../middleware/auth.middleware";

export async function createBid(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user || req.user.role !== "buyer") {
      res.status(403).json({ message: "Only buyers can create bids" });
      return;
    }

    const { listing_id, offered_price } = req.body;

    if (!listing_id || offered_price === undefined) {
      res.status(400).json({
        message: "listing_id and offered_price are required",
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(listing_id)) {
      res.status(400).json({ message: "Invalid listing_id" });
      return;
    }

    const price = Number(offered_price);

    if (!Number.isFinite(price) || price <= 0) {
      res.status(400).json({
        message: "offered_price must be a positive number",
      });
      return;
    }

    const listing = await Listing.findById(listing_id);

    if (!listing) {
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    if (listing.status !== "active") {
      res.status(400).json({
        message: "Bids can only be placed on active listings",
      });
      return;
    }

    if (listing.farmer_id.toString() === req.user.id) {
      res.status(400).json({
        message: "You cannot bid on your own listing",
      });
      return;
    }

    const bid = await Bid.create({
      listing_id: listing._id,
      buyer_id: req.user.id,
      offered_price: price,
      status: "pending",
    });

    res.status(201).json({
      message: "Bid created successfully",
      bid,
    });
  } catch (error) {
    console.error("Create bid error:", error);
    res.status(500).json({ message: "Failed to create bid" });
  }
}

export async function getBidsForListing(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user || req.user.role !== "farmer") {
      res.status(403).json({
        message: "Only the listing owner can view bids",
      });
      return;
    }

    const listingId = String(req.params.listingId);

    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      res.status(400).json({ message: "Invalid listing ID" });
      return;
    }

    const listing = await Listing.findById(listingId);

    if (!listing) {
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    if (listing.farmer_id.toString() !== req.user.id) {
      res.status(403).json({
        message: "You are not the owner of this listing",
      });
      return;
    }

    const bids = await Bid.find({ listing_id: listingId })
      .populate(
        "buyer_id",
        "-password"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: bids.length,
      bids,
    });
  } catch (error) {
    console.error("Get bids error:", error);
    res.status(500).json({ message: "Failed to fetch bids" });
  }
}

export async function acceptBid(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user || req.user.role !== "farmer") {
      res.status(403).json({
        message: "Only farmers can accept bids",
      });
      return;
    }

    const bidId = String(req.params.bidId);

    if (!mongoose.Types.ObjectId.isValid(bidId)) {
      res.status(400).json({ message: "Invalid bid ID" });
      return;
    }

    const bid = await Bid.findById(bidId);

    if (!bid) {
      res.status(404).json({ message: "Bid not found" });
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
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    if (listing.farmer_id.toString() !== req.user.id) {
      res.status(403).json({
        message: "You are not the owner of this listing",
      });
      return;
    }

    if (listing.status !== "active") {
      res.status(400).json({
        message: "This listing is no longer active",
      });
      return;
    }

    bid.status = "accepted";
    await bid.save();

    await Bid.updateMany(
      {
        listing_id: listing._id,
        _id: { $ne: bid._id },
        status: "pending",
      },
      {
        $set: { status: "rejected" },
      }
    );

    listing.status = "sold";
    await listing.save();

    res.status(200).json({
      message: "Bid accepted successfully",
      bid,
      listing_status: listing.status,
    });
  } catch (error) {
    console.error("Accept bid error:", error);
    res.status(500).json({ message: "Failed to accept bid" });
  }
}

export async function rejectBid(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user || req.user.role !== "farmer") {
      res.status(403).json({
        message: "Only farmers can reject bids",
      });
      return;
    }

    const bidId = String(req.params.bidId);

    if (!mongoose.Types.ObjectId.isValid(bidId)) {
      res.status(400).json({ message: "Invalid bid ID" });
      return;
    }

    const bid = await Bid.findById(bidId);

    if (!bid) {
      res.status(404).json({ message: "Bid not found" });
      return;
    }

    if (bid.status !== "pending") {
      res.status(400).json({
        message: "Only pending bids can be rejected",
      });
      return;
    }

    const listing = await Listing.findById(bid.listing_id);

    if (!listing) {
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    if (listing.farmer_id.toString() !== req.user.id) {
      res.status(403).json({
        message: "You are not the owner of this listing",
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
    res.status(500).json({ message: "Failed to reject bid" });
  }
}