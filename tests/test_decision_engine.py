from __future__ import annotations

from datetime import date

import pytest
from fastapi.testclient import TestClient

from agrilink_ai.api import app
from agrilink_ai.decision_engine import (
    DemandIntelligence,
    DemandLevel,
    DemandTrend,
    FairPriceStatus,
    FarmerRequest,
    GovernmentBenchmark,
    IntelligenceContext,
    MarketOption,
    PriceIntelligence,
    Recommendation,
    RiskLevel,
    SellingOption,
    SellingOptionType,
    Trend,
    evaluate_fair_price,
    rank_markets,
    rank_selling_options,
    recommend_selling_decision,
)
from agrilink_ai.sample_data import sample_api_request, sample_farmer_request, sample_intelligence_context, sample_selling_options


def farmer(**overrides) -> FarmerRequest:
    values = {
        "crop": "onion",
        "quantity_kg": 1000,
        "location_name": "Nashik, Maharashtra",
        "urgency": RiskLevel.MEDIUM,
        "storage_available": True,
        "state": "Maharashtra",
        "district": "Nashik",
    }
    values.update(overrides)
    return FarmerRequest(**values)


def benchmark(price: float = 32) -> GovernmentBenchmark:
    return GovernmentBenchmark(
        crop="onion",
        district="Nashik",
        state="Maharashtra",
        average_price_per_kg=price,
        price_date=date(2026, 9, 2),
        source="sample AGMARKNET-like benchmark",
    )


def option(
    candidate_id: str,
    name: str,
    price: float,
    distance: float,
    transport: float,
    option_type: SellingOptionType = SellingOptionType.BUYER,
    verified: bool = True,
) -> SellingOption:
    return SellingOption(
        candidate_id=candidate_id,
        name=name,
        option_type=option_type,
        district="Nashik",
        state="Maharashtra",
        offered_price_per_kg=price,
        distance_km=distance,
        transport_cost=transport,
        location_name=name,
        verified=verified,
    )


def context(**overrides) -> IntelligenceContext:
    values = {
        "government_benchmark": benchmark(),
        "price": PriceIntelligence(trend=Trend.RISING, average_price_per_kg=30, history_days=7),
        "demand": DemandIntelligence(level=DemandLevel.HIGH, trend=DemandTrend.INCREASING),
        "weather_risk": RiskLevel.LOW,
        "crop_perishability": RiskLevel.MEDIUM,
        "storage_available": True,
        "urgency": RiskLevel.LOW,
    }
    values.update(overrides)
    return IntelligenceContext(**values)


def test_existing_selling_engine_functionality_still_works() -> None:
    ranked = rank_selling_options(farmer(), sample_selling_options(), benchmark())

    assert ranked[0].recommendation == Recommendation.SELL
    assert ranked[1].recommendation == Recommendation.REDIRECT
    assert 0 <= ranked[0].decision_score <= 100


def test_existing_market_engine_functionality_still_works() -> None:
    markets = [
        MarketOption("Far Market", "Pune", "Maharashtra", 3700, date(2026, 9, 2), 210, 9000),
        MarketOption("Nearby Market", "Nashik", "Maharashtra", 3300, date(2026, 9, 2), 10, 400),
    ]

    ranked = rank_markets(farmer(), markets, today=date(2026, 9, 2))

    assert ranked[0].market_name == "Nearby Market"
    assert ranked[0].recommendation == Recommendation.SELL


def test_net_profit_calculation_and_score_are_separate() -> None:
    result = recommend_selling_decision(
        farmer(quantity_kg=500),
        [option("buyer_1", "Nashik Buyer", 35, 10, 500)],
        context(),
    )

    assert result.rankings[0].estimated_net_profit == 17000
    assert 0 <= result.rankings[0].decision_score <= 100
    assert result.rankings[0].estimated_net_profit != result.rankings[0].decision_score


@pytest.mark.parametrize(
    ("offer", "status"),
    [
        (30, FairPriceStatus.FAIR),
        (27, FairPriceStatus.WARNING),
        (24, FairPriceStatus.UNFAIR),
        (20, FairPriceStatus.HIGH_RISK_ALERT),
    ],
)
def test_fair_price_thresholds(offer: float, status: FairPriceStatus) -> None:
    assert evaluate_fair_price(offer, benchmark()).status == status


def test_missing_government_benchmark_does_not_classify_fairness() -> None:
    fair_price = evaluate_fair_price(35, None)

    assert fair_price.status == FairPriceStatus.UNAVAILABLE
    assert fair_price.difference_percent is None


def test_missing_optional_intelligence_lowers_confidence() -> None:
    result = recommend_selling_decision(
        farmer(),
        [option("buyer_1", "Nashik Buyer", 35, 10, 500)],
        IntelligenceContext(government_benchmark=benchmark()),
    )

    assert result.data_quality.confidence == "low"
    assert "demand" in result.data_quality.missing_fields
    assert "price_history" in result.data_quality.missing_fields


def test_buyer_ranking() -> None:
    result = recommend_selling_decision(
        farmer(),
        [
            option("buyer_low", "Low Buyer", 30, 5, 250),
            option("buyer_good", "Good Buyer", 35, 20, 700),
        ],
        context(urgency=RiskLevel.MEDIUM),
    )

    assert result.rankings[0].candidate_id == "buyer_good"


def test_market_ranking() -> None:
    result = recommend_selling_decision(
        farmer(),
        [
            option("market_far", "Pune APMC", 37, 220, 9000, SellingOptionType.MARKET),
            option("market_near", "Nashik APMC", 35, 10, 500, SellingOptionType.MARKET),
        ],
        context(urgency=RiskLevel.MEDIUM),
    )

    assert result.rankings[0].candidate_id == "market_near"
    assert result.recommendation.best_market_id == "market_near"


def test_buyer_and_market_candidates_can_coexist() -> None:
    result = recommend_selling_decision(
        farmer(),
        [
            option("buyer_1", "Nashik Buyer", 35, 10, 500, SellingOptionType.BUYER),
            option("market_1", "Pune APMC", 36, 210, 7000, SellingOptionType.MARKET),
        ],
        context(urgency=RiskLevel.MEDIUM),
    )

    assert {ranking.candidate_type for ranking in result.rankings} == {
        SellingOptionType.BUYER,
        SellingOptionType.MARKET,
    }


def test_ranking_is_not_simply_highest_price_first() -> None:
    result = recommend_selling_decision(
        farmer(),
        [
            option("highest_price", "Distant Unverified Buyer", 39, 300, 15000, verified=False),
            option("best_value", "Nearby Verified Buyer", 35, 10, 500, verified=True),
        ],
        context(urgency=RiskLevel.MEDIUM),
    )

    assert result.rankings[0].candidate_id == "best_value"


def test_wait_conditions_satisfied() -> None:
    result = recommend_selling_decision(
        farmer(urgency=RiskLevel.LOW, storage_available=True),
        [option("buyer_1", "Nashik Buyer", 34, 10, 500)],
        context(),
    )

    assert result.recommendation.decision == Recommendation.WAIT


@pytest.mark.parametrize(
    "blocked_context",
    [
        {"crop_perishability": RiskLevel.HIGH},
        {"storage_available": False},
        {"urgency": RiskLevel.HIGH},
        {"weather_risk": RiskLevel.HIGH},
    ],
)
def test_wait_blocked_by_risk_conditions(blocked_context: dict) -> None:
    farmer_overrides = {}
    if "urgency" in blocked_context:
        farmer_overrides["urgency"] = blocked_context["urgency"]
    if "storage_available" in blocked_context:
        farmer_overrides["storage_available"] = blocked_context["storage_available"]

    result = recommend_selling_decision(
        farmer(**{"urgency": RiskLevel.LOW, "storage_available": True, **farmer_overrides}),
        [option("buyer_1", "Nashik Buyer", 34, 10, 500)],
        context(**blocked_context),
    )

    assert result.recommendation.decision == Recommendation.SELL


def test_wait_blocked_by_strong_buyer_offer() -> None:
    result = recommend_selling_decision(
        farmer(urgency=RiskLevel.LOW, storage_available=True),
        [option("buyer_1", "Strong Buyer", 37, 10, 500)],
        context(),
    )

    assert result.recommendation.decision == Recommendation.SELL


def test_redirect_behavior_on_non_top_ranked_candidate() -> None:
    ranked = rank_selling_options(
        farmer(),
        [
            option("buyer_1", "Weak Buyer", 28, 5, 200),
            option("buyer_2", "Strong Buyer", 35, 15, 500),
        ],
        benchmark(),
    )

    assert ranked[1].recommendation == Recommendation.REDIRECT


def test_maharashtra_sample_demo_data_works() -> None:
    result = recommend_selling_decision(
        sample_farmer_request(),
        sample_selling_options(),
        sample_intelligence_context(),
    )

    assert result.status == "success"
    assert result.rankings
    assert all("Kerala" not in ranking.candidate_name for ranking in result.rankings)


def test_api_request_validation_empty_candidates() -> None:
    client = TestClient(app)
    payload = sample_api_request()
    payload["candidates"] = []

    response = client.post("/api/v1/recommend", json=payload)

    assert response.status_code == 400
    assert response.json()["status"] == "error"


def test_api_request_validation_invalid_quantity() -> None:
    client = TestClient(app)
    payload = sample_api_request()
    payload["crop"]["quantity_kg"] = 0

    response = client.post("/api/v1/recommend", json=payload)

    assert response.status_code == 400


def test_api_request_validation_missing_required_coordinates() -> None:
    client = TestClient(app)
    payload = sample_api_request()
    del payload["farmer"]["latitude"]

    response = client.post("/api/v1/recommend", json=payload)

    assert response.status_code == 400


def test_successful_post_recommend_and_top_level_fields() -> None:
    client = TestClient(app)

    response = client.post("/api/v1/recommend", json=sample_api_request())

    assert response.status_code == 200
    body = response.json()
    assert set(body) == {
        "status",
        "recommendation",
        "fair_price",
        "rankings",
        "market_insights",
        "alerts",
        "data_quality",
    }
    assert body["status"] == "success"
    assert 0 <= body["recommendation"]["decision_score"] <= 100
    assert body["recommendation"]["estimated_net_profit"] != body["recommendation"]["decision_score"]


def test_api_market_without_price_returns_validation_error() -> None:
    client = TestClient(app)
    payload = sample_api_request()
    del payload["candidates"][1]["offered_price_per_kg"]

    response = client.post("/api/v1/recommend", json=payload)

    assert response.status_code == 400
    assert response.json()["status"] == "error"
