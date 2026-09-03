import mongoose from "mongoose";

import { Buyer } from "../models/buyer.model";
import { Listing } from "../models/listing.model";
import { Alert } from "../models/alert.model";
import { Market } from "../models/market.model";
import { MarketPrice } from "../models/marketPrice.model";
import { getMarketPrices } from "./marketService";

function calculateMedian(values: number[]): number {
  if (values.length === 0) {
    throw new Error("No government prices available");
  }

  const sorted = [...values].sort(
    (a, b) => a - b,
  );

  const middle = Math.floor(
    sorted.length / 2,
  );

  if (sorted.length % 2 === 0) {
    return (
      (sorted[middle - 1] +
        sorted[middle]) /
      2
    );
  }

  return sorted[middle];
}

function parseDate(
  dateString: string,
): Date {
  const parts = dateString
    .trim()
    .split("/")
    .map(Number);

  if (parts.length !== 3) {
    return new Date(NaN);
  }

  const [day, month, year] = parts;

  return new Date(
    Date.UTC(
      year,
      month - 1,
      day,
    ),
  );
}

function formatDate(
  date: Date,
): string {
  const day = String(
    date.getUTCDate(),
  ).padStart(2, "0");

  const month = String(
    date.getUTCMonth() + 1,
  ).padStart(2, "0");

  const year =
    date.getUTCFullYear();

  return `${day}/${month}/${year}`;
}

async function getLiveGovernmentBenchmark(
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
      "No live government price data found",
    );
  }

  const datedMarkets = markets
    .map((market) => ({
      market,
      date: parseDate(
        market.price_date,
      ),
    }))
    .filter(
      (item) =>
        !Number.isNaN(
          item.date.getTime(),
        ),
    );

  if (datedMarkets.length === 0) {
    throw new Error(
      "No valid dates found in live government price data",
    );
  }

  const latestDate =
    datedMarkets.reduce(
      (latest, current) =>
        current.date > latest
          ? current.date
          : latest,
      datedMarkets[0].date,
    );

  const latestPrices =
    datedMarkets
      .filter(
        (item) =>
          item.date.getTime() ===
          latestDate.getTime(),
      )
      .map(
        (item) =>
          item.market
            .modal_price_per_quintal,
      )
      .filter(
        (price) =>
          Number.isFinite(price) &&
          price > 0,
      );

  if (latestPrices.length === 0) {
    throw new Error(
      "No valid live government modal prices found",
    );
  }

  const medianPricePerQuintal =
    calculateMedian(latestPrices);

  return {
    government_price_per_quintal:
      Number(
        medianPricePerQuintal.toFixed(2),
      ),
    government_price_per_kg:
      Number(
        (
          medianPricePerQuintal / 100
        ).toFixed(2),
      ),
    date: formatDate(
      latestDate,
    ),
  };
}

async function getStoredGovernmentBenchmark(
  commodity: string,
  state: string,
  district: string,
): Promise<{
  government_price_per_kg: number;
  government_price_per_quintal: number;
  date: string;
}> {
  const markets = await Market.find({
    state,
    district,
    active_status: true,
  }).lean();

  if (markets.length === 0) {
    throw new Error(
      "No stored markets found for government benchmark",
    );
  }

  const marketIds =
    markets.map(
      (market) => market._id,
    );

  const marketPriceRecords =
    await MarketPrice.find({
      market_id: {
        $in: marketIds,
      },
      commodity,
    })
      .sort({
        date: -1,
      })
      .lean();

  if (
    marketPriceRecords.length === 0
  ) {
    throw new Error(
      "No stored government price data found",
    );
  }

  /*
   * Find the newest date available across
   * the stored AGMARKNET observations.
   */
  const latestTimestamp =
    marketPriceRecords.reduce(
      (latest, record) => {
        const timestamp =
          record.date.getTime();

        return timestamp > latest
          ? timestamp
          : latest;
      },
      marketPriceRecords[0].date.getTime(),
    );

  const latestRecords =
    marketPriceRecords.filter(
      (record) =>
        record.date.getTime() ===
        latestTimestamp,
    );

  const latestPrices =
    latestRecords
      .map(
        (record) =>
          record.modal_price,
      )
      .filter(
        (price) =>
          Number.isFinite(price) &&
          price > 0,
      );

  if (latestPrices.length === 0) {
    throw new Error(
      "No valid stored government modal prices found",
    );
  }

  const medianPricePerQuintal =
    calculateMedian(latestPrices);

  const latestDate = new Date(
    latestTimestamp,
  );

  return {
    government_price_per_quintal:
      Number(
        medianPricePerQuintal.toFixed(2),
      ),
    government_price_per_kg:
      Number(
        (
          medianPricePerQuintal / 100
        ).toFixed(2),
      ),
    date: formatDate(
      latestDate,
    ),
  };
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
  /*
   * Prefer the live AGMARKNET source.
   */
  try {
    return await getLiveGovernmentBenchmark(
      commodity,
      state,
      district,
    );
  } catch (liveError) {
    console.warn(
      "Live government benchmark unavailable. Falling back to stored AGMARKNET data:",
      liveError,
    );
  }

  /*
   * Use previously stored AGMARKNET observations
   * when the live API is temporarily unavailable.
   */
  return getStoredGovernmentBenchmark(
    commodity,
    state,
    district,
  );
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
  alert_status:
    | "UNFAIR_PRICE"
    | "FAIR_PRICE";
  message: string;
  price_date: string;
}> {
  if (
    !mongoose.Types.ObjectId.isValid(
      buyerId,
    )
  ) {
    throw new Error(
      "Invalid buyer_id",
    );
  }

  if (
    !mongoose.Types.ObjectId.isValid(
      listingId,
    )
  ) {
    throw new Error(
      "Invalid listing_id",
    );
  }

  const buyer =
    await Buyer.findById(buyerId);

  if (!buyer) {
    throw new Error(
      "Buyer not found",
    );
  }

  const listing =
    await Listing.findById(
      listingId,
    );

  if (!listing) {
    throw new Error(
      "Listing not found",
    );
  }

  if (listing.status !== "active") {
    throw new Error(
      "Price comparison is only available for active listings",
    );
  }

  if (offeredPrice < 0) {
    throw new Error(
      "Offered price cannot be negative",
    );
  }

  const benchmark =
    await getGovernmentBenchmark(
      listing.crop_name,
      state,
      district,
    );

  const differencePercent =
    (
      (
        benchmark.government_price_per_kg -
        offeredPrice
      ) /
      benchmark.government_price_per_kg
    ) * 100;

  const roundedDifference =
    Number(
      differencePercent.toFixed(2),
    );

  const isUnfair =
    roundedDifference >= 40;

  if (isUnfair) {
    await Alert.create({
      buyer_id: buyer._id,
      farmer_id: listing.farmer_id,
      listing_id: listing._id,
      commodity:
        listing.crop_name,
      offered_price:
        offeredPrice,
      government_price:
        benchmark.government_price_per_kg,
      difference_percent:
        roundedDifference,
      alert_status:
        "UNFAIR_PRICE",
    });
  }

  return {
    commodity:
      listing.crop_name,
    listing_id:
      listing._id.toString(),
    buyer_id:
      buyer._id.toString(),
    farmer_id:
      listing.farmer_id.toString(),
    offered_price_per_kg:
      offeredPrice,
    government_price_per_kg:
      benchmark.government_price_per_kg,
    government_price_per_quintal:
      benchmark.government_price_per_quintal,
    difference_percent:
      roundedDifference,
    alert_status: isUnfair
      ? "UNFAIR_PRICE"
      : "FAIR_PRICE",
    message: isUnfair
      ? "UNFAIR PRICE ALERT"
      : "Offer is not classified as unfair",
    price_date:
      benchmark.date,
  };
}