export interface MarketPrice {
  market_name: string;
  district: string;
  state: string;
  modal_price_per_quintal: number;
  price_date: string;
  distance_km: number;
  transport_cost: number;
  arrivals_tonnes: number | null;
  price_trend: "rising" | "falling" | "stable" | "unknown";
  weather_risk: "low" | "medium" | "high" | "unknown";
  volatility_risk: "low" | "medium" | "high" | "unknown";
  source: string;
}