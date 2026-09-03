import type { MarketPrice } from "../types/market";
import { Market } from "../models/market.model";
import { MarketPrice as MarketPriceModel } from "../models/marketPrice.model";

interface AgmarknetRecord {
  Arrival_Date: string;
  Commodity: string;
  Commodity_Code: string | number;
  District: string;
  Grade: string;
  Market: string;
  Max_Price: string | number;
  Min_Price: string | number;
  Modal_Price: string | number;
  State: string;
  Variety: string;
}

interface AgmarknetResponse {
  records?: AgmarknetRecord[];
}

function parsePrice(value: string | number): number {
  const price = Number(value);
  return Number.isFinite(price) ? price : 0;
}

async function fetchAgmarknetRecords(
  crop: string,
  state: string,
  district: string,
  limit: number,
): Promise<AgmarknetRecord[]> {
  const apiKey = process.env.AGMARKNET_API_KEY;
  const baseUrl = process.env.AGMARKNET_BASE_URL;

  if (!apiKey) {
    throw new Error(
      "AGMARKNET_API_KEY is not defined",
    );
  }

  if (!baseUrl) {
    throw new Error(
      "AGMARKNET_BASE_URL is not defined",
    );
  }

  const url = new URL(baseUrl);

  url.searchParams.set("api-key", apiKey);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set(
    "filters[State]",
    state,
  );
  url.searchParams.set(
    "filters[District]",
    district,
  );
  url.searchParams.set(
    "filters[Commodity]",
    crop,
  );
  url.searchParams.set(
    "sort[Arrival_Date]",
    "desc",
  );

  const response = await fetch(url, {
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(
      `AGMARKNET API request failed: ${response.status}`,
    );
  }

  const data =
    (await response.json()) as AgmarknetResponse;

  return data.records ?? [];
}

function mapMarketPrice(
  record: AgmarknetRecord,
): MarketPrice {
  return {
    market_name: record.Market,
    district: record.District,
    state: record.State,
    modal_price_per_quintal: parsePrice(
      record.Modal_Price,
    ),
    price_date: record.Arrival_Date,
    distance_km: 0,
    transport_cost: 0,
    arrivals_tonnes: null,
    price_trend: "unknown",
    weather_risk: "unknown",
    volatility_risk: "unknown",
    source: "data.gov.in / AGMARKNET",
  };
}

export async function getMarketPrices(
  crop: string,
  state: string,
  district: string,
): Promise<MarketPrice[]> {
  const records = await fetchAgmarknetRecords(
    crop,
    state,
    district,
    10,
  );

  return records.map(mapMarketPrice);
}

export interface MarketPriceHistoryItem {
  market_name: string;
  date: string;
  min_price_per_quintal: number;
  max_price_per_quintal: number;
  modal_price_per_quintal: number;
  min_price_per_kg: number;
  max_price_per_kg: number;
  modal_price_per_kg: number;
  grade: string;
  variety: string;
  source: string;
}

export async function getMarketPriceHistory(
  crop: string,
  state: string,
  district: string,
  limit = 100,
): Promise<MarketPriceHistoryItem[]> {
  const records =
    await fetchAgmarknetRecords(
      crop,
      state,
      district,
      limit,
    );

  return records.map((record) => {
    const minPrice = parsePrice(
      record.Min_Price,
    );

    const maxPrice = parsePrice(
      record.Max_Price,
    );

    const modalPrice = parsePrice(
      record.Modal_Price,
    );

    return {
      market_name: record.Market,
      date: record.Arrival_Date,
      min_price_per_quintal: minPrice,
      max_price_per_quintal: maxPrice,
      modal_price_per_quintal: modalPrice,
      min_price_per_kg: Number(
        (minPrice / 100).toFixed(2),
      ),
      max_price_per_kg: Number(
        (maxPrice / 100).toFixed(2),
      ),
      modal_price_per_kg: Number(
        (modalPrice / 100).toFixed(2),
      ),
      grade: record.Grade,
      variety: record.Variety,
      source: "data.gov.in / AGMARKNET",
    };
  });
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function calculateDistanceKm(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number,
): number {
  const earthRadiusKm = 6371;

  const latitudeDifference = toRadians(
    latitude2 - latitude1,
  );

  const longitudeDifference = toRadians(
    longitude2 - longitude1,
  );

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(toRadians(latitude1)) *
      Math.cos(toRadians(latitude2)) *
      Math.sin(longitudeDifference / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a),
    );

  return earthRadiusKm * c;
}

export interface NearbyMarket {
  market_id: string;
  market_name: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  latest_modal_price_per_kg: number | null;
  latest_date: string | null;
  source: string;
}

function formatDate(
  date: Date | null,
): string | null {
  if (!date) {
    return null;
  }

  const day = String(
    date.getUTCDate(),
  ).padStart(2, "0");

  const month = String(
    date.getUTCMonth() + 1,
  ).padStart(2, "0");

  const year = date.getUTCFullYear();

  return `${day}/${month}/${year}`;
}

export async function getNearbyMarkets(
  crop: string,
  latitude: number,
  longitude: number,
  radiusKm: number,
): Promise<NearbyMarket[]> {
  const markets = await Market.find({
    active_status: true,
  }).lean();

  const nearbyMarkets = markets
    .map((market) => ({
      market,
      distanceKm: calculateDistanceKm(
        latitude,
        longitude,
        market.latitude,
        market.longitude,
      ),
    }))
    .filter(
      (item) => item.distanceKm <= radiusKm,
    )
    .sort(
      (a, b) =>
        a.distanceKm - b.distanceKm,
    );

  if (nearbyMarkets.length === 0) {
    return [];
  }

  const marketIds = nearbyMarkets.map(
    (item) => item.market._id,
  );

  const priceRecords =
    await MarketPriceModel.find({
      market_id: { $in: marketIds },
      commodity: crop,
    })
      .sort({
        market_id: 1,
        date: -1,
      })
      .lean();

  /*
   * A market can have multiple records on its latest
   * date because AGMARKNET may report different
   * grades/varieties. We use the average modal price
   * for that latest date as the current market price.
   */
  const latestPriceMap = new Map<
    string,
    {
      date: Date;
      modalPricePerKg: number;
    }
  >();

  const groupedByMarket = new Map<
    string,
    typeof priceRecords
  >();

  for (const record of priceRecords) {
    const marketId =
      String(record.market_id);

    if (!groupedByMarket.has(marketId)) {
      groupedByMarket.set(
        marketId,
        [],
      );
    }

    groupedByMarket
      .get(marketId)!
      .push(record);
  }

  for (const [
    marketId,
    records,
  ] of groupedByMarket) {
    if (records.length === 0) {
      continue;
    }

    const latestDate =
      records[0].date;

    const latestDayRecords =
      records.filter(
        (record) =>
          record.date.getTime() ===
          latestDate.getTime(),
      );

    const modalPriceAverage =
      latestDayRecords.reduce(
        (sum, record) =>
          sum + record.modal_price,
        0,
      ) / latestDayRecords.length;

    latestPriceMap.set(
      marketId,
      {
        date: latestDate,
        modalPricePerKg: Number(
          (modalPriceAverage / 100).toFixed(2),
        ),
      },
    );
  }

  return nearbyMarkets.map(
    ({ market, distanceKm }) => {
      const latestPrice =
        latestPriceMap.get(
          String(market._id),
        );

      return {
        market_id: String(market._id),
        market_name: market.market_name,
        district: market.district,
        state: market.state,
        latitude: market.latitude,
        longitude: market.longitude,
        distance_km: Number(
          distanceKm.toFixed(2),
        ),
        latest_modal_price_per_kg:
          latestPrice?.modalPricePerKg ??
          null,
        latest_date:
          formatDate(
            latestPrice?.date ?? null,
          ),
        source: latestPrice
          ? "data.gov.in / AGMARKNET"
          : "Market database",
      };
    },
  );
}