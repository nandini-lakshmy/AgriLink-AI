import { Requirement } from "../models/requirement.model";

export type DemandLevel =
  | "low"
  | "medium"
  | "high";

export type DemandTrend =
  | "decreasing"
  | "stable"
  | "increasing";

export interface DemandInfo {
  level: DemandLevel;
  trend: DemandTrend;
  buyer_count: number;
  total_quantity_needed_kg: number;
  recent_quantity_needed_kg: number;
  previous_quantity_needed_kg: number;
  source: string;
}

interface BuyerLocation {
  _id: unknown;
  state?: string;
  district?: string;
}

function classifyDemand(
  buyerCount: number,
  totalQuantityNeededKg: number,
  farmerQuantityKg: number,
): DemandLevel {
  if (
    buyerCount >= 3 ||
    totalQuantityNeededKg >=
      farmerQuantityKg * 3
  ) {
    return "high";
  }

  if (
    buyerCount >= 2 ||
    totalQuantityNeededKg >=
      farmerQuantityKg
  ) {
    return "medium";
  }

  return "low";
}

function classifyDemandTrend(
  recentQuantity: number,
  previousQuantity: number,
): DemandTrend {
  if (
    recentQuantity === 0 &&
    previousQuantity === 0
  ) {
    return "stable";
  }

  if (previousQuantity === 0) {
    return recentQuantity > 0
      ? "increasing"
      : "stable";
  }

  const change =
    (recentQuantity -
      previousQuantity) /
    previousQuantity;

  if (change > 0.1) {
    return "increasing";
  }

  if (change < -0.1) {
    return "decreasing";
  }

  return "stable";
}

export async function getDemandIntelligence(
  crop: string,
  farmerState: string,
  farmerDistrict: string,
  farmerQuantityKg: number,
): Promise<DemandInfo> {
  if (farmerQuantityKg <= 0) {
    throw new Error(
      "farmerQuantityKg must be greater than 0",
    );
  }

  const requirements =
    await Requirement.find({
      crop_name: {
        $regex: `^${crop.trim()}$`,
        $options: "i",
      },
    })
      .populate(
        "buyer_id",
        "state district",
      )
      .lean();

  const relevantRequirements =
    requirements.filter(
      (requirement) => {
        const buyer =
          requirement.buyer_id as unknown as
            BuyerLocation | null;

        if (!buyer) {
          return false;
        }

        const buyerState =
          buyer.state
            ?.trim()
            .toLowerCase();

        const buyerDistrict =
          buyer.district
            ?.trim()
            .toLowerCase();

        const state =
          farmerState
            .trim()
            .toLowerCase();

        const district =
          farmerDistrict
            .trim()
            .toLowerCase();

        return (
          buyerState === state &&
          buyerDistrict === district
        );
      },
    );

  const uniqueBuyerIds =
    new Set<string>();

  let totalQuantityNeededKg = 0;

  for (
    const requirement of relevantRequirements
  ) {
    const buyer =
      requirement.buyer_id as unknown as
        BuyerLocation | null;

    if (buyer?._id) {
      uniqueBuyerIds.add(
        String(buyer._id),
      );
    }

    const quantity =
      Number(
        requirement.quantity_needed,
      );

    if (
      Number.isFinite(quantity) &&
      quantity > 0
    ) {
      totalQuantityNeededKg +=
        quantity;
    }
  }

  const now = Date.now();

  const recentStart =
    now -
    7 *
      24 *
      60 *
      60 *
      1000;

  const previousStart =
    now -
    14 *
      24 *
      60 *
      60 *
      1000;

  let recentQuantityNeededKg = 0;
  let previousQuantityNeededKg = 0;

  for (
    const requirement of relevantRequirements
  ) {
    const postedDate =
      requirement.date_posted instanceof Date
        ? requirement.date_posted
        : new Date(
            String(
              requirement.date_posted,
            ),
          );

    if (
      Number.isNaN(
        postedDate.getTime(),
      )
    ) {
      continue;
    }

    const quantity =
      Number(
        requirement.quantity_needed,
      );

    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      continue;
    }

    const timestamp =
      postedDate.getTime();

    if (timestamp >= recentStart) {
      recentQuantityNeededKg +=
        quantity;
    } else if (
      timestamp >= previousStart
    ) {
      previousQuantityNeededKg +=
        quantity;
    }
  }

  const buyerCount =
    uniqueBuyerIds.size;

  const level =
    classifyDemand(
      buyerCount,
      totalQuantityNeededKg,
      farmerQuantityKg,
    );

  const trend =
    classifyDemandTrend(
      recentQuantityNeededKg,
      previousQuantityNeededKg,
    );

  return {
    level,
    trend,
    buyer_count: buyerCount,
    total_quantity_needed_kg:
      Number(
        totalQuantityNeededKg.toFixed(2),
      ),
    recent_quantity_needed_kg:
      Number(
        recentQuantityNeededKg.toFixed(2),
      ),
    previous_quantity_needed_kg:
      Number(
        previousQuantityNeededKg.toFixed(2),
      ),
    source:
      "Derived from buyer requirements in AgriLink",
  };
}