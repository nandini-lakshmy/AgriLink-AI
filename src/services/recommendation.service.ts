import mongoose from "mongoose";
import { Listing } from "../models/listing.model";
import { Farmer } from "../models/farmer.model";
import { Requirement } from "../models/requirement.model";
import { getGovernmentBenchmark } from "./priceComparison.service";

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
}> {
  if (!mongoose.Types.ObjectId.isValid(listingId)) {
    throw new Error("Invalid listing_id");
  }

  const listing = await Listing.findById(listingId);

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

  const requirements = await Requirement.find({
    crop_name: {
      $regex: `^${listing.crop_name}$`,
      $options: "i",
    },
    quantity_needed: {
      $lte: listing.quantity,
    },
  }).populate("buyer_id", "-password");

  const candidates: RecommendationCandidate[] = [];

  const maximumCandidateDistanceKm = 25;

  for (const requirement of requirements) {
    const buyer =
      requirement.buyer_id as unknown as PopulatedBuyer;

    const buyerCoordinates =
      getCoordinates(buyer);

    if (!buyerCoordinates) {
      continue;
    }

    const distance = calculateDistanceKm(
      farmerCoordinates,
      buyerCoordinates,
    );

    // Basic eligibility/geographic filtering.
    // Python will perform the actual ranking and scoring.
    if (distance > maximumCandidateDistanceKm) {
      continue;
    }

    candidates.push({
      id: buyer._id.toString(),
      name: buyer.name,
      type: "buyer",
      latitude: buyerCoordinates.latitude,
      longitude: buyerCoordinates.longitude,
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

  let governmentPrice: GovernmentPrice | null =
    null;

  try {
    const benchmark =
      await getGovernmentBenchmark(
        listing.crop_name,
        farmer.state,
        farmer.district,
      );

    // Only send data that we have actually verified.
    // The current benchmark service provides a modal/median
    // reference price, not genuine AGMARKNET min/max values.
    governmentPrice = {
      modal_price_per_kg:
        benchmark.government_price_per_kg,
      source: "AGMARKNET",
      date: benchmark.date,
    };
  } catch (error) {
    console.warn(
      "Government benchmark unavailable for recommendation:",
      error,
    );
  }

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

    government_price: governmentPrice,
  };
}