export interface AIRecommendationResult {
  status: string;
  recommendation?: {
    decision: string;
    best_buyer_id?: string | null;
    best_buyer_name?: string | null;
    best_market_id?: string | null;
    best_market_name?: string | null;
    decision_score: number;
    estimated_net_profit: number;
  };
  fair_price?: {
    government_modal_price_per_kg?: number | null;
    buyer_offer_price_per_kg?: number | null;
    difference_percent?: number | null;
    status?: string;
    alert?: string | null;
  };
  rankings?: unknown[];
  market_insights?: Record<string, unknown>;
  alerts?: unknown[];
  data_quality?: Record<string, unknown>;
  error?: {
    code?: string;
    message?: string;
  };
}

function getAIServiceUrl(): string {
  return process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";
}

export async function getAIRecommendation(
  recommendationData: unknown,
): Promise<AIRecommendationResult> {
  const endpoint = `${getAIServiceUrl()}/api/v1/recommend`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(recommendationData),
    });

    const responseText = await response.text();

    let responseData: AIRecommendationResult;

    try {
      responseData = JSON.parse(responseText) as AIRecommendationResult;
    } catch {
      throw new Error(
        `AI service returned invalid JSON with status ${response.status}`,
      );
    }

    if (!response.ok) {
      const message =
        responseData.error?.message ||
        `AI service returned HTTP ${response.status}`;

      throw new Error(message);
    }

    return responseData;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`AI recommendation service failed: ${error.message}`);
    }

    throw new Error("AI recommendation service failed");
  }
}