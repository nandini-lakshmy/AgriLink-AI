import { Listing } from "../models/listing.model";
import { Requirement } from "../models/requirement.model";
import { Farmer } from "../models/farmer.model";

interface Coordinates {
  latitude: number;
  longitude: number;
}

function getCoordinates(value: unknown): Coordinates | null {
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
    ((second.latitude - first.latitude) * Math.PI) / 180;

  const longitudeDifference =
    ((second.longitude - first.longitude) * Math.PI) / 180;

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
    2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Number((earthRadiusKm * c).toFixed(2));
}

export async function findMatchingListings(
  requirementId: string,
): Promise<unknown[]> {
  const requirement = await Requirement.findById(
    requirementId,
  ).populate("buyer_id", "-password");

  if (!requirement) {
    throw new Error("Requirement not found");
  }

  const listings = await Listing.find({
    status: "active",
    crop_name: {
      $regex: `^${requirement.crop_name}$`,
      $options: "i",
    },
    quantity: {
      $gte: requirement.quantity_needed,
    },
  }).populate("farmer_id", "-password");

  const buyerCoordinates = getCoordinates(
    requirement.buyer_id,
  );

  return listings.map((listing) => {
    const offeredPrice = Number(
      requirement.offered_price,
    );

    const quantityNeeded = Number(
      requirement.quantity_needed,
    );

    const farmerExpectedPrice =
      listing.expected_price !== undefined
        ? Number(listing.expected_price)
        : null;

    const priceDifference =
      farmerExpectedPrice !== null
        ? Number(
            (
              offeredPrice - farmerExpectedPrice
            ).toFixed(2),
          )
        : null;

    const farmerCoordinates = getCoordinates(
      listing.farmer_id,
    );

    const distance =
      buyerCoordinates && farmerCoordinates
        ? calculateDistanceKm(
            buyerCoordinates,
            farmerCoordinates,
          )
        : null;

    return {
      listing_id: listing._id.toString(),
      farmer: listing.farmer_id,
      crop_name: listing.crop_name,
      quantity_available_kg: listing.quantity,
      quantity_needed_kg: quantityNeeded,
      buyer_offered_price_per_kg: offeredPrice,
      estimated_gross_value: Number(
        (
          quantityNeeded * offeredPrice
        ).toFixed(2),
      ),
      farmer_expected_price_per_kg:
        farmerExpectedPrice,
      price_difference_per_kg:
        priceDifference,
      distance_km: distance,
    };
  });
}

export async function findMatchingRequirementsForFarmer(
  farmerId: string,
): Promise<unknown[]> {
  const farmer = await Farmer.findById(
    farmerId,
    "-password",
  );

  if (!farmer) {
    throw new Error("Farmer not found");
  }

  const farmerCoordinates = getCoordinates(farmer);

  const listings = await Listing.find({
    farmer_id: farmerId,
    status: "active",
  });

  if (listings.length === 0) {
    return [];
  }

  const results: unknown[] = [];

  for (const listing of listings) {
    const requirements = await Requirement.find({
      crop_name: {
        $regex: `^${listing.crop_name}$`,
        $options: "i",
      },
      quantity_needed: {
        $lte: listing.quantity,
      },
    })
      .populate("buyer_id", "-password")
      .sort({ createdAt: -1 });

    for (const requirement of requirements) {
      const offeredPrice = Number(
        requirement.offered_price,
      );

      const quantityNeeded = Number(
        requirement.quantity_needed,
      );

      const farmerExpectedPrice =
        listing.expected_price !== undefined
          ? Number(listing.expected_price)
          : null;

      const priceDifference =
        farmerExpectedPrice !== null
          ? Number(
              (
                offeredPrice -
                farmerExpectedPrice
              ).toFixed(2),
            )
          : null;

      const buyerCoordinates =
        getCoordinates(requirement.buyer_id);

      const distance =
        farmerCoordinates && buyerCoordinates
          ? calculateDistanceKm(
              farmerCoordinates,
              buyerCoordinates,
            )
          : null;

      results.push({
        requirement_id:
          requirement._id.toString(),
        buyer: requirement.buyer_id,
        listing_id: listing._id.toString(),
        crop_name: listing.crop_name,
        quantity_available_kg:
          listing.quantity,
        quantity_needed_kg:
          quantityNeeded,
        buyer_offered_price_per_kg:
          offeredPrice,
        farmer_expected_price_per_kg:
          farmerExpectedPrice,
        price_difference_per_kg:
          priceDifference,
        estimated_gross_value: Number(
          (
            quantityNeeded *
            offeredPrice
          ).toFixed(2),
        ),
        distance_km: distance,
      });
    }
  }

  return results;
}