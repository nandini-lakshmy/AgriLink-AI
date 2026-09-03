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

export async function getMarketPrices(
  crop: string,
  state: string,
  district: string,
): Promise<MarketPrice[]> {
  const apiKey = process.env.AGMARKNET_API_KEY;
  const baseUrl = process.env.AGMARKNET_BASE_URL;

  if (!apiKey) {
    throw new Error("AGMARKNET_API_KEY is not defined");
  }

  if (!baseUrl) {
    throw new Error("AGMARKNET_BASE_URL is not defined");
  }

  const url = new URL(baseUrl);

  url.searchParams.set("api-key", apiKey);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "10");
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

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `AGMARKNET API request failed: ${response.status}`,
    );
  }

  const data =
    (await response.json()) as AgmarknetResponse;

  if (!data.records) {
    return [];
  }

  return data.records.map((record) => ({
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
  }));
}