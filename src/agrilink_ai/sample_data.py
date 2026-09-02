from __future__ import annotations

from datetime import date

from agrilink_ai.decision_engine import (
    DemandIntelligence,
    DemandLevel,
    DemandTrend,
    FarmerRequest,
    GovernmentBenchmark,
    IntelligenceContext,
    MarketOption,
    PriceIntelligence,
    RiskLevel,
    SellingOption,
    SellingOptionType,
    Trend,
)


def sample_farmer_request() -> FarmerRequest:
    """Maharashtra demo farmer. Values are sample data, not live market data."""
    return FarmerRequest(
        crop="onion",
        quantity_kg=1000,
        location_name="Niphad, Nashik, Maharashtra",
        urgency=RiskLevel.MEDIUM,
        storage_available=True,
        farmer_name="Demo Farmer",
        phone="9876500000",
        state="Maharashtra",
        district="Nashik",
        gps_latitude=20.081,
        gps_longitude=74.109,
        expected_price_per_kg=32,
    )


def sample_government_benchmark() -> GovernmentBenchmark:
    """Sample AGMARKNET-like modal benchmark for the local prototype."""
    return GovernmentBenchmark(
        crop="onion",
        district="Nashik",
        state="Maharashtra",
        average_price_per_kg=32,
        min_price_per_kg=28,
        max_price_per_kg=36,
        price_date=date(2026, 9, 2),
        source="sample AGMARKNET-like government benchmark",
    )


def sample_intelligence_context() -> IntelligenceContext:
    return IntelligenceContext(
        government_benchmark=sample_government_benchmark(),
        price=PriceIntelligence(
            trend=Trend.RISING,
            average_price_per_kg=30,
            history_days=7,
            government_modal_price_per_kg=32,
        ),
        demand=DemandIntelligence(level=DemandLevel.HIGH, trend=DemandTrend.INCREASING),
        weather_risk=RiskLevel.LOW,
        crop_perishability=RiskLevel.MEDIUM,
        storage_available=True,
        urgency=RiskLevel.MEDIUM,
    )


def sample_selling_options() -> list[SellingOption]:
    """Maharashtra buyer and market candidates supplied as demo backend input."""
    return [
        SellingOption(
            candidate_id="buyer_nashik_001",
            name="Nashik Onion Traders",
            option_type=SellingOptionType.BUYER,
            district="Nashik",
            state="Maharashtra",
            offered_price_per_kg=35,
            distance_km=12,
            transport_cost=600,
            location_name="Lasalgaon",
            contact_phone="9876543210",
            exact_location="Lasalgaon market road",
            crop_needed="onion",
            quantity_needed_kg=1200,
            verified=True,
            price_date=date(2026, 9, 2),
            source="sample registered buyer offer",
        ),
        SellingOption(
            candidate_id="market_pune_001",
            name="Pune APMC",
            option_type=SellingOptionType.MARKET,
            district="Pune",
            state="Maharashtra",
            offered_price_per_kg=36,
            distance_km=215,
            transport_cost=6500,
            location_name="Pune",
            crop_needed="onion",
            quantity_needed_kg=2000,
            verified=True,
            price_date=date(2026, 9, 2),
            source="sample mandi listing",
        ),
        SellingOption(
            candidate_id="buyer_mumbai_001",
            name="Mumbai Wholesale Buyer",
            option_type=SellingOptionType.BUYER,
            district="Mumbai",
            state="Maharashtra",
            offered_price_per_kg=38,
            distance_km=185,
            transport_cost=8000,
            location_name="Vashi",
            contact_phone="9876543212",
            exact_location="Vashi wholesale market",
            crop_needed="onion",
            quantity_needed_kg=1000,
            verified=False,
            price_date=date(2026, 9, 2),
            source="sample registered buyer offer",
        ),
    ]


def sample_maharashtra_markets() -> list[MarketOption]:
    return [
        MarketOption(
            market_name="Nashik APMC",
            district="Nashik",
            state="Maharashtra",
            modal_price_per_quintal=3200,
            price_date=date(2026, 9, 2),
            distance_km=18,
            transport_cost=900,
            arrivals_tonnes=600,
            price_trend=Trend.STABLE,
            weather_risk=RiskLevel.LOW,
            volatility_risk=RiskLevel.MEDIUM,
            source="sample AGMARKNET-like data",
        ),
        MarketOption(
            market_name="Pune APMC",
            district="Pune",
            state="Maharashtra",
            modal_price_per_quintal=3500,
            price_date=date(2026, 9, 2),
            distance_km=210,
            transport_cost=4500,
            arrivals_tonnes=180,
            price_trend=Trend.RISING,
            weather_risk=RiskLevel.MEDIUM,
            volatility_risk=RiskLevel.MEDIUM,
            source="sample AGMARKNET-like data",
        ),
        MarketOption(
            market_name="Mumbai Vashi Market",
            district="Mumbai",
            state="Maharashtra",
            modal_price_per_quintal=3700,
            price_date=date(2026, 9, 2),
            distance_km=170,
            transport_cost=6200,
            arrivals_tonnes=None,
            price_trend=Trend.UNKNOWN,
            weather_risk=RiskLevel.HIGH,
            volatility_risk=RiskLevel.HIGH,
            source="sample AGMARKNET-like data",
        ),
    ]


def sample_api_request() -> dict:
    return {
        "farmer": {
            "latitude": 20.081,
            "longitude": 74.109,
            "district": "Nashik",
            "state": "Maharashtra",
            "urgency": "medium",
        },
        "crop": {"name": "Onion", "quantity_kg": 1000},
        "candidates": [
            {
                "id": "buyer_nashik_001",
                "name": "Nashik Onion Traders",
                "type": "buyer",
                "latitude": 20.15,
                "longitude": 74.23,
                "offered_price_per_kg": 35,
                "verified": True,
            },
            {
                "id": "market_pune_001",
                "name": "Pune APMC",
                "type": "market",
                "latitude": 18.5204,
                "longitude": 73.8567,
                "offered_price_per_kg": 36,
                "verified": True,
            },
        ],
        "government_price": {
            "min_price_per_kg": 28,
            "modal_price_per_kg": 32,
            "max_price_per_kg": 36,
            "source": "sample AGMARKNET-like benchmark",
            "date": "2026-09-02",
        },
        "price_history": {"trend": "rising", "average_price_per_kg": 30, "history_days": 7},
        "demand": {"level": "high", "trend": "increasing"},
        "transport": {"cost_per_km_per_kg": 0.05},
        "weather": {"risk_level": "low"},
        "crop_properties": {"perishability": "medium", "storage_available": True},
    }
