import type { MarketPrice } from "../types/market";

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