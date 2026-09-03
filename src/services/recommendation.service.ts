import mongoose from "mongoose";
import { Listing } from "../models/listing.model";
import { Farmer } from "../models/farmer.model";
import { Requirement } from "../models/requirement.model";
import { getGovernmentBenchmark } from "./priceComparison.service";
import {
  getMarketPriceHistory,
  getNearbyMarkets,
} from "./marketService";
import { getWeatherRisk } from "./weatherService";
import {
  getDemandIntelligence,
} from "./demandService";

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface PopulatedBuyer {
  _id: mongoose.Types.ObjectId;
  name: string;
  latitude?: number;
  longitude?: number;
  verified?: boolean;
}

interface RecommendationCandidate {
  id: string;
  name: string;
  type: "buyer" | "market";
  latitude: number;
  longitude: number;
  offered_price_per_kg: number;
  verified?: boolean;
  requirement_id?: string;
  quantity_needed_kg?: number;
  distance_km: number;
  price_date?: string | null;
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
  trend:
    | "rising"
    | "falling"
    | "stable"
    | "unknown";
  average_price_per_kg: number;
  history_days: number;
}

interface DemandRecommendationInfo {
  level: "low" | "medium" | "high";
  trend:
    | "decreasing"
    | "stable"
    | "increasing";
  buyer_count: number;
  total_quantity_needed_kg: number;
  recent_quantity_needed_kg: number;
  previous_quantity_needed_kg: number;
  source: string;
}

function getCoordinates(
  value: unknown,
): Coordinates | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record =
    value as Record<string, unknown>;

  const latitude = Number(
    record.latitude,
  );

  const longitude = Number(
    record.longitude,
  );

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
    ((second.latitude - first.latitude) *
      Math.PI) /
    180;

  const longitudeDifference =
    ((second.longitude - first.longitude) *
      Math.PI) /
    180;

  const firstLatitude =
    (first.latitude * Math.PI) /
    180;

  const secondLatitude =
    (second.latitude * Math.PI) /
    180;

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
    const year =
      parsedDate.getUTCFullYear();

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

  if (
    latestAverage > previousAverage
  ) {
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
    !Number.isFinite(
      configuredValue,
    ) ||
    configuredValue < 0
  ) {
    throw new Error(
      "TRANSPORT_COST_PER_KM_PER_KG must be a non-negative number",
    );
  }

  return configuredValue;
}

function mapListingUrgency(
  urgency:
    | "today"
    | "within_3_days"
    | "within_week",
): "low" | "medium" | "high" {
  switch (urgency) {
    case "today":
      return "high";

    case "within_3_days":
      return "medium";

    case "within_week":
      return "low";

    default:
      return "medium";
  }
}

export async function prepareRecommendationData(
  listingId: string,
): Promise<{
  farmer: {
    latitude: number;
    longitude: number;
    district: string;
    state: string;
    urgency: "low" | "medium" | "high";
  };
  crop: {
    name: string;
    quantity_kg: number;
  };
  crop_properties: {
    storage_available: boolean;
  };
  candidates: RecommendationCandidate[];
  government_price:
    | GovernmentPrice
    | null;
  price_history:
    | PriceHistoryInfo
    | null;
  demand:
    | DemandRecommendationInfo
    | null;
  transport: TransportInfo;
  weather:
    | Awaited<
        ReturnType<typeof getWeatherRisk>
      >
    | null;
}> {
  if (
    !mongoose.Types.ObjectId.isValid(
      listingId,
    )
  ) {
    throw new Error(
      "Invalid listing_id",
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
      "Recommendation is only available for active listings",
    );
  }

  const farmer =
    await Farmer.findById(
      listing.farmer_id,
      "-password",
    );

  if (!farmer) {
    throw new Error(
      "Farmer not found",
    );
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

  /*
   * Buyer matching currently uses a 25 km
   * recommendation radius.
   */
  const maximumCandidateDistanceKm = 25;

  /*
   * Add buyer candidates.
   */
  for (
    const requirement of requirements
  ) {
    const buyer =
      requirement.buyer_id as unknown as
        PopulatedBuyer;

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
      offered_price_per_kg:
        Number(
          requirement.offered_price,
        ),
      verified:
        buyer.verified === true,
      requirement_id:
        requirement._id.toString(),
      quantity_needed_kg:
        Number(
          requirement.quantity_needed,
        ),
      distance_km: distance,
      price_date: null,
    });
  }

  /*
   * Add nearby market candidates.
   */
  try {
    const nearbyMarkets =
      await getNearbyMarkets(
        listing.crop_name,
        farmerCoordinates.latitude,
        farmerCoordinates.longitude,
        maximumCandidateDistanceKm,
      );

    for (
      const market of nearbyMarkets
    ) {
      if (
        market.latest_modal_price_per_kg ===
          null ||
        market.latest_date === null
      ) {
        continue;
      }

      candidates.push({
        id: market.market_id,
        name: market.market_name,
        type: "market",
        latitude:
          market.latitude,
        longitude:
          market.longitude,
        offered_price_per_kg:
          market.latest_modal_price_per_kg,
        distance_km:
          market.distance_km,
        price_date:
          market.latest_date,
      });
    }
  } catch (error) {
    console.warn(
      "Nearby market data unavailable for recommendation:",
      error,
    );
  }

  /*
   * Government benchmark.
   */
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

  /*
   * Historical price intelligence.
   */
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
      calculatePriceHistory(
        history,
      );
  } catch (error) {
    console.warn(
      "Price history unavailable for recommendation:",
      error,
    );
  }

  /*
   * Marketplace demand intelligence.
   *
   * This is derived from buyer requirements
   * rather than being fabricated or treated as
   * an official government demand statistic.
   */
  let demand:
    | DemandRecommendationInfo
    | null = null;

  try {
    const demandData =
      await getDemandIntelligence(
        listing.crop_name,
        farmer.state,
        farmer.district,
        listing.quantity,
      );

    demand = {
      level: demandData.level,
      trend: demandData.trend,
      buyer_count:
        demandData.buyer_count,
      total_quantity_needed_kg:
        demandData.total_quantity_needed_kg,
      recent_quantity_needed_kg:
        demandData.recent_quantity_needed_kg,
      previous_quantity_needed_kg:
        demandData.previous_quantity_needed_kg,
      source: demandData.source,
    };
  } catch (error) {
    console.warn(
      "Demand intelligence unavailable for recommendation:",
      error,
    );
  }

  /*
   * Transport configuration.
   */
  const transport: TransportInfo = {
    cost_per_km_per_kg:
      getTransportCostPerKmPerKg(),
  };

  /*
   * Weather.
   */
  let weather:
    | Awaited<
        ReturnType<typeof getWeatherRisk>
      >
    | null = null;

  try {
    weather = await getWeatherRisk(
      farmerCoordinates.latitude,
      farmerCoordinates.longitude,
    );
  } catch (error) {
    console.warn(
      "Weather data unavailable for recommendation:",
      error,
    );
  }

  return {
    farmer: {
      latitude:
        farmerCoordinates.latitude,
      longitude:
        farmerCoordinates.longitude,
      district:
        farmer.district,
      state:
        farmer.state,
      urgency:
        mapListingUrgency(
          listing.urgency,
        ),
    },

    crop: {
      name:
        listing.crop_name,
      quantity_kg:
        listing.quantity,
    },

    crop_properties: {
      storage_available:
        listing.storage_available,
    },

    candidates,

    government_price:
      governmentPrice,

    price_history:
      priceHistory,

    demand,

    transport,

    weather,
  };
}