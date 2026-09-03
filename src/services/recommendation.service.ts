import mongoose from "mongoose";
import { Listing } from "../models/listing.model";
import { Farmer } from "../models/farmer.model";
import { Requirement } from "../models/requirement.model";
import { getGovernmentBenchmark } from "./priceComparison.service";
import { getMarketPriceHistory } from "./marketService";

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface PopulatedBuyer {
  _id: mongoose.Types.ObjectId;
  name: string;
  latitude?: number;
  longitude?: number;
}

interface RecommendationCandidate {
  id: string;
  name: string;
  type: "buyer" | "market";
  latitude: number;
  longitude: number;
  offered_price_per_kg: number;
  verified: boolean;
  requirement_id: string;
  quantity_needed_kg: number;
  distance_km: number;
}

interface GovernmentPrice {
  modal_price_per_kg: number;
  source: string;
  date: string;
}

interface TransportInfo {
  cost_per_km_per_kg: number;
}

interface PriceHistoryInfo {
  trend: "rising" | "falling" | "stable" | "unknown";
  average_price_per_kg: number;
  history_days: number;
}

function getCoordinates(
  value: unknown,
): Coordinates | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  const latitude = Number(record.latitude);
  const longitude = Number(record.longitude);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return {
    latitude,
    longitude,
  };
}

function calculateDistanceKm(
  first: Coordinates,
  second: Coordinates,
): number {
  const earthRadiusKm = 6371;

  const latitudeDifference =
    ((second.latitude - first.latitude) * Math.PI) /
    180;

  const longitudeDifference =
    ((second.longitude - first.longitude) * Math.PI) /
    180;

  const firstLatitude =
    (first.latitude * Math.PI) / 180;

  const secondLatitude =
    (second.latitude * Math.PI) / 180;

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDifference / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a),
    );

  return Number(
    (earthRadiusKm * c).toFixed(2),
  );
}

function formatGovernmentDate(
  value: string,
): string {
  const trimmedValue = value.trim();

  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      trimmedValue,
    )
  ) {
    return trimmedValue;
  }

  const match =
    trimmedValue.match(
      /^(\d{2})\/(\d{2})\/(\d{4})$/,
    );

  if (match) {
    const [, day, month, year] = match;

    return `${year}-${month}-${day}`;
  }

  const parsedDate = new Date(
    trimmedValue,
  );

  if (!Number.isNaN(parsedDate.getTime())) {
    const year = parsedDate.getUTCFullYear();
    const month = String(
      parsedDate.getUTCMonth() + 1,
    ).padStart(2, "0");
    const day = String(
      parsedDate.getUTCDate(),
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  throw new Error(
    `Invalid government price date: ${value}`,
  );
}

function parseAgmarknetDate(
  value: string,
): number | null {
  const match = value
    .trim()
    .match(
      /^(\d{2})\/(\d{2})\/(\d{4})$/,
    );

  if (!match) {
    return null;
  }

  const [, day, month, year] = match;

  const timestamp = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
  );

  return Number.isNaN(timestamp)
    ? null
    : timestamp;
}

function calculatePriceHistory(
  history: Awaited<
    ReturnType<typeof getMarketPriceHistory>
  >,
): PriceHistoryInfo | null {
  if (history.length === 0) {
    return null;
  }

  const validHistory = history.filter(
    (item) =>
      Number.isFinite(
        item.modal_price_per_kg,
      ) &&
      item.modal_price_per_kg > 0 &&
      parseAgmarknetDate(item.date) !== null,
  );

  if (validHistory.length === 0) {
    return null;
  }

  const totalModalPrice =
    validHistory.reduce(
      (sum, item) =>
        sum + item.modal_price_per_kg,
      0,
    );

  const averagePricePerKg = Number(
    (
      totalModalPrice /
      validHistory.length
    ).toFixed(2),
  );

  const dates = Array.from(
    new Set(
      validHistory.map((item) =>
        item.date.trim(),
      ),
    ),
  )
    .map((date) => ({
      date,
      timestamp:
        parseAgmarknetDate(date) as number,
    }))
    .sort(
      (first, second) =>
        second.timestamp -
        first.timestamp,
    );

  if (dates.length < 2) {
    return {
      trend: "unknown",
      average_price_per_kg:
        averagePricePerKg,
      history_days: dates.length,
    };
  }

  const latestDate = dates[0].date;
  const previousDate = dates[1].date;

  const latestPrices =
    validHistory.filter(
      (item) =>
        item.date.trim() ===
        latestDate,
    );

  const previousPrices =
    validHistory.filter(
      (item) =>
        item.date.trim() ===
        previousDate,
    );

  const latestAverage =
    latestPrices.reduce(
      (sum, item) =>
        sum + item.modal_price_per_kg,
      0,
    ) / latestPrices.length;

  const previousAverage =
    previousPrices.reduce(
      (sum, item) =>
        sum + item.modal_price_per_kg,
      0,
    ) / previousPrices.length;

  let trend:
    | "rising"
    | "falling"
    | "stable"
    | "unknown";

  if (latestAverage > previousAverage) {
    trend = "rising";
  } else if (
    latestAverage < previousAverage
  ) {
    trend = "falling";
  } else {
    trend = "stable";
  }

  return {
    trend,
    average_price_per_kg:
      averagePricePerKg,
    history_days: dates.length,
  };
}

function getTransportCostPerKmPerKg(): number {
  const configuredValue = Number(
    process.env.TRANSPORT_COST_PER_KM_PER_KG,
  );

  if (
    !Number.isFinite(configuredValue) ||
    configuredValue < 0
  ) {
    throw new Error(
      "TRANSPORT_COST_PER_KM_PER_KG must be a non-negative number",
    );
  }

  return configuredValue;
}

export async function prepareRecommendationData(
  listingId: string,
): Promise<{
  farmer: {
    latitude: number;
    longitude: number;
    district: string;
    state: string;
  };
  crop: {
    name: string;
    quantity_kg: number;
  };
  candidates: RecommendationCandidate[];
  government_price: GovernmentPrice | null;
  price_history: PriceHistoryInfo | null;
  transport: TransportInfo;
}> {
  if (!mongoose.Types.ObjectId.isValid(listingId)) {
    throw new Error("Invalid listing_id");
  }

  const listing = await Listing.findById(
    listingId,
  );

  if (!listing) {
    throw new Error("Listing not found");
  }

  if (listing.status !== "active") {
    throw new Error(
      "Recommendation is only available for active listings",
    );
  }

  const farmer = await Farmer.findById(
    listing.farmer_id,
    "-password",
  );

  if (!farmer) {
    throw new Error("Farmer not found");
  }

  const farmerCoordinates =
    getCoordinates(farmer);

  if (!farmerCoordinates) {
    throw new Error(
      "Farmer location coordinates are required for recommendation",
    );
  }

  const requirements =
    await Requirement.find({
      crop_name: {
        $regex: `^${listing.crop_name}$`,
        $options: "i",
      },
      quantity_needed: {
        $lte: listing.quantity,
      },
    }).populate(
      "buyer_id",
      "-password",
    );

  const candidates: RecommendationCandidate[] =
    [];

  const maximumCandidateDistanceKm = 25;

  for (const requirement of requirements) {
    const buyer =
      requirement.buyer_id as unknown as PopulatedBuyer;

    const buyerCoordinates =
      getCoordinates(buyer);

    if (!buyerCoordinates) {
      continue;
    }

    const distance =
      calculateDistanceKm(
        farmerCoordinates,
        buyerCoordinates,
      );

    if (
      distance >
      maximumCandidateDistanceKm
    ) {
      continue;
    }

    candidates.push({
      id: buyer._id.toString(),
      name: buyer.name,
      type: "buyer",
      latitude:
        buyerCoordinates.latitude,
      longitude:
        buyerCoordinates.longitude,
      offered_price_per_kg: Number(
        requirement.offered_price,
      ),
      verified: true,
      requirement_id:
        requirement._id.toString(),
      quantity_needed_kg: Number(
        requirement.quantity_needed,
      ),
      distance_km: distance,
    });
  }

  let governmentPrice:
    | GovernmentPrice
    | null = null;

  try {
    const benchmark =
      await getGovernmentBenchmark(
        listing.crop_name,
        farmer.state,
        farmer.district,
      );

    governmentPrice = {
      modal_price_per_kg:
        benchmark.government_price_per_kg,
      source: "AGMARKNET",
      date: formatGovernmentDate(
        benchmark.date,
      ),
    };
  } catch (error) {
    console.warn(
      "Government benchmark unavailable for recommendation:",
      error,
    );
  }

  let priceHistory:
    | PriceHistoryInfo
    | null = null;

  try {
    const history =
      await getMarketPriceHistory(
        listing.crop_name,
        farmer.state,
        farmer.district,
        100,
      );

    priceHistory =
      calculatePriceHistory(history);
  } catch (error) {
    console.warn(
      "Price history unavailable for recommendation:",
      error,
    );
  }

  const transport: TransportInfo = {
    cost_per_km_per_kg:
      getTransportCostPerKmPerKg(),
  };

  return {
    farmer: {
      latitude:
        farmerCoordinates.latitude,
      longitude:
        farmerCoordinates.longitude,
      district: farmer.district,
      state: farmer.state,
    },

    crop: {
      name: listing.crop_name,
      quantity_kg: listing.quantity,
    },

    candidates,

    government_price:
      governmentPrice,

    price_history:
      priceHistory,

    transport,
  };
}