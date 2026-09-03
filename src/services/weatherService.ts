interface OpenMeteoResponse {
  hourly?: {
    precipitation_probability?: number[];
    precipitation?: number[];
    wind_speed_10m?: number[];
    weather_code?: number[];
  };
}

export type WeatherRisk =
  | "low"
  | "medium"
  | "high";

export interface WeatherInfo {
  risk_level: WeatherRisk;
  precipitation_probability_max: number;
  precipitation_sum_mm: number;
  max_wind_speed_kmh: number;
  source: string;
}

function classifyWeatherRisk(
  precipitationProbabilityMax: number,
  precipitationSumMm: number,
  maxWindSpeedKmh: number,
): WeatherRisk {
  if (
    precipitationProbabilityMax >= 80 ||
    precipitationSumMm >= 20 ||
    maxWindSpeedKmh >= 50
  ) {
    return "high";
  }

  if (
    precipitationProbabilityMax >= 50 ||
    precipitationSumMm >= 5 ||
    maxWindSpeedKmh >= 30
  ) {
    return "medium";
  }

  return "low";
}

export async function getWeatherRisk(
  latitude: number,
  longitude: number,
): Promise<WeatherInfo> {
  const url = new URL(
    "https://api.open-meteo.com/v1/forecast",
  );

  url.searchParams.set(
    "latitude",
    String(latitude),
  );

  url.searchParams.set(
    "longitude",
    String(longitude),
  );

  url.searchParams.set(
    "hourly",
    "precipitation_probability,precipitation,wind_speed_10m,weather_code",
  );

  url.searchParams.set(
    "forecast_hours",
    "24",
  );

  url.searchParams.set(
    "timezone",
    "auto",
  );

  const response = await fetch(url, {
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(
      `Weather API request failed: ${response.status}`,
    );
  }

  const data =
    (await response.json()) as OpenMeteoResponse;

  const hourly = data.hourly;

  if (!hourly) {
    throw new Error(
      "Weather API returned no hourly data",
    );
  }

  const precipitationProbabilities =
    hourly.precipitation_probability ?? [];

  const precipitationValues =
    hourly.precipitation ?? [];

  const windValues =
    hourly.wind_speed_10m ?? [];

  if (
    precipitationProbabilities.length === 0 ||
    precipitationValues.length === 0 ||
    windValues.length === 0
  ) {
    throw new Error(
      "Weather API returned incomplete hourly data",
    );
  }

  const validPrecipitationProbabilities =
    precipitationProbabilities.filter(
      Number.isFinite,
    );

  const validPrecipitationValues =
    precipitationValues.filter(
      Number.isFinite,
    );

  const validWindValues =
    windValues.filter(
      Number.isFinite,
    );

  if (
    validPrecipitationProbabilities.length === 0 ||
    validPrecipitationValues.length === 0 ||
    validWindValues.length === 0
  ) {
    throw new Error(
      "Weather API returned invalid numeric data",
    );
  }

  const precipitationProbabilityMax =
    Math.max(
      ...validPrecipitationProbabilities,
    );

  const precipitationSumMm =
    Number(
      validPrecipitationValues
        .reduce(
          (sum, value) => sum + value,
          0,
        )
        .toFixed(2),
    );

  const maxWindSpeedKmh =
    Number(
      Math.max(
        ...validWindValues,
      ).toFixed(2),
    );

  const riskLevel =
    classifyWeatherRisk(
      precipitationProbabilityMax,
      precipitationSumMm,
      maxWindSpeedKmh,
    );

  return {
    risk_level: riskLevel,
    precipitation_probability_max:
      precipitationProbabilityMax,
    precipitation_sum_mm:
      precipitationSumMm,
    max_wind_speed_kmh:
      maxWindSpeedKmh,
    source: "Open-Meteo",
  };
}