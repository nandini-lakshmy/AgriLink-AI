import mongoose from "mongoose";

import { Buyer } from "../models/buyer.model";
import { Listing } from "../models/listing.model";
import { Alert } from "../models/alert.model";
import { getMarketPrices } from "./marketService";

function calculateMedian(values: number[]): number {
  if (values.length === 0) {
    throw new Error("No government prices available");
  }

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

function parseDate(dateString: string): Date {
  const [day, month, year] = dateString.split("/").map(Number);
  return new Date(year, month - 1, day);
}

export async function getGovernmentBenchmark(
  commodity: string,
  state: string,
  district: string,
): Promise<{
  government_price_per_kg: number;
  government_price_per_quintal: number;
  date: string;
}> {
  const markets = await getMarketPrices(
    commodity,
    state,
    district,
  );

  if (markets.length === 0) {
    throw new Error(
      "No government price data found for this commodity and location",
    );
  }

  const latestDate = markets.reduce((latest, market) => {
    const currentDate = parseDate(market.price_date);

    return currentDate > latest ? currentDate : latest;
  }, parseDate(markets[0].price_date));

  const latestDateString = markets.find(
    (market) =>
      parseDate(market.price_date).getTime() ===
      latestDate.getTime(),
  )!.price_date;

  const latestPrices = markets
    .filter(
      (market) =>
        parseDate(market.price_date).getTime() ===
        latestDate.getTime(),
    )
    .map((market) => market.modal_price_per_quintal)
    .filter((price) => price > 0);

  if (latestPrices.length === 0) {
    throw new Error("No valid government modal prices found");
  }

  const medianPricePerQuintal =
    calculateMedian(latestPrices);

  return {
    government_price_per_quintal: Number(
      medianPricePerQuintal.toFixed(2),
    ),
    government_price_per_kg: Number(
      (medianPricePerQuintal / 100).toFixed(2),
    ),
    date: latestDateString,
  };
}

export async function comparePrice(
  buyerId: string,
  listingId: string,
  offeredPrice: number,
  state: string,
  district: string,
): Promise<{
  commodity: string;
  listing_id: string;
  buyer_id: string;
  farmer_id: string;
  offered_price_per_kg: number;
  government_price_per_kg: number;
  government_price_per_quintal: number;
  difference_percent: number;
  alert_status: "UNFAIR_PRICE" | "FAIR_PRICE";
  message: string;
  price_date: string;
}> {
  if (!mongoose.Types.ObjectId.isValid(buyerId)) {
    throw new Error("Invalid buyer_id");
  }

  if (!mongoose.Types.ObjectId.isValid(listingId)) {
    throw new Error("Invalid listing_id");
  }

  const buyer = await Buyer.findById(buyerId);

  if (!buyer) {
    throw new Error("Buyer not found");
  }

  const listing = await Listing.findById(listingId);

  if (!listing) {
    throw new Error("Listing not found");
  }

  if (listing.status !== "active") {
    throw new Error(
      "Price comparison is only available for active listings",
    );
  }

  if (offeredPrice < 0) {
    throw new Error("Offered price cannot be negative");
  }

  const benchmark = await getGovernmentBenchmark(
    listing.crop_name,
    state,
    district,
  );

  const differencePercent =
    ((benchmark.government_price_per_kg - offeredPrice) /
      benchmark.government_price_per_kg) *
    100;

  const roundedDifference = Number(
    differencePercent.toFixed(2),
  );

  const isUnfair = roundedDifference >= 40;

  if (isUnfair) {
    await Alert.create({
      buyer_id: buyer._id,
      farmer_id: listing.farmer_id,
      listing_id: listing._id,
      commodity: listing.crop_name,
      offered_price: offeredPrice,
      government_price:
        benchmark.government_price_per_kg,
      difference_percent: roundedDifference,
      alert_status: "UNFAIR_PRICE",
    });
  }

  return {
    commodity: listing.crop_name,
    listing_id: listing._id.toString(),
    buyer_id: buyer._id.toString(),
    farmer_id: listing.farmer_id.toString(),
    offered_price_per_kg: offeredPrice,
    government_price_per_kg:
      benchmark.government_price_per_kg,
    government_price_per_quintal:
      benchmark.government_price_per_quintal,
    difference_percent: roundedDifference,
    alert_status: isUnfair
      ? "UNFAIR_PRICE"
      : "FAIR_PRICE",
    message: isUnfair
      ? "UNFAIR PRICE ALERT"
      : "Offer is not classified as unfair",
    price_date: benchmark.date,
  };
}