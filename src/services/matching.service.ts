import { Buyer } from "../models/buyer.model";
import { Farmer } from "../models/farmer.model";
import { Requirement } from "../models/requirement.model";
import { Listing } from "../models/listing.model";

const DEFAULT_RADIUS_KM = 25;
const TRANSPORT_COST_PER_KM = 20;

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const earthRadiusKm = 6371;

  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;

  const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

export async function findMatchingBuyers(
  listingId: string,
  radiusKm = DEFAULT_RADIUS_KM,
) {
  const listing = await Listing.findById(listingId);

  if (!listing) {
    throw new Error("Listing not found");
  }

  const farmer = await Farmer.findById(listing.farmer_id);

  if (!farmer) {
    throw new Error("Farmer not found");
  }

  const requirements = await Requirement.find({
    crop_name: {
      $regex: new RegExp(`^${listing.crop_name}$`, "i"),
    },
    quantity_needed: {
      $lte: listing.quantity,
    },
  });

  const matches = [];

  for (const requirement of requirements) {
    const buyer = await Buyer.findById(requirement.buyer_id);

    if (!buyer) {
      continue;
    }

    const distance = calculateDistance(
      farmer.latitude,
      farmer.longitude,
      buyer.latitude,
      buyer.longitude,
    );

    if (distance > radiusKm) {
      continue;
    }

    const quantityKg = requirement.quantity_needed;

    const grossValue =
      quantityKg * requirement.offered_price;

    const transportCost =
      distance * TRANSPORT_COST_PER_KM;

    const estimatedNetValue =
      grossValue - transportCost;

    matches.push({
      buyer_id: buyer._id,
      buyer: buyer.business_name,
      crop_name: requirement.crop_name,
      price_per_kg: requirement.offered_price,
      quantity_needed_kg: quantityKg,
      gross_value: Number(grossValue.toFixed(2)),
      distance_km: Number(distance.toFixed(2)),
      estimated_transport_cost: Number(
        transportCost.toFixed(2),
      ),
      estimated_net_value: Number(
        estimatedNetValue.toFixed(2),
      ),
      location: buyer.market_location,
    });
  }

  matches.sort(
    (a, b) =>
      b.estimated_net_value - a.estimated_net_value,
  );

  return matches;
}