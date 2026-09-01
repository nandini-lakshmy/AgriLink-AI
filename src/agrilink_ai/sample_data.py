from __future__ import annotations

from datetime import date

from agrilink_ai.decision_engine import (
    FarmerRequest,
    GovernmentBenchmark,
    MarketOption,
    RiskLevel,
    SellingOption,
    SellingOptionType,
    Trend,
)


def sample_farmer_request() -> FarmerRequest:
    return FarmerRequest(
        crop="onion",
        quantity_kg=1000,
        location_name="Perumbavoor, Kerala",
        urgency=RiskLevel.MEDIUM,
        storage_available=True,
        farmer_name="Demo Farmer",
        phone="9876500000",
        state="Kerala",
        district="Ernakulam",
        expected_price_per_kg=32,
    )


def sample_government_benchmark() -> GovernmentBenchmark:
    return GovernmentBenchmark(
        crop="onion",
        district="Ernakulam",
        state="Kerala",
        average_price_per_kg=32,
        min_price_per_kg=28,
        max_price_per_kg=36,
        price_date=date(2026, 9, 1),
        source="sample AGMARKNET/data.gov.in benchmark",
    )


def sample_selling_options() -> list[SellingOption]:
    return [
        SellingOption(
            name="ABC Traders",
            option_type=SellingOptionType.BUYER,
            district="Ernakulam",
            state="Kerala",
            offered_price_per_kg=35,
            distance_km=5,
            transport_cost=350,
            location_name="Angamaly",
            contact_phone="9876543210",
            exact_location="Angamaly market road",
            crop_needed="onion",
            quantity_needed_kg=1000,
            verified=True,
            price_date=date(2026, 9, 1),
            source="registered buyer offer",
        ),
        SellingOption(
            name="FreshVeg Market",
            option_type=SellingOptionType.MARKET,
            district="Ernakulam",
            state="Kerala",
            offered_price_per_kg=33,
            distance_km=8,
            transport_cost=500,
            location_name="Perumbavoor",
            contact_phone="9876543211",
            exact_location="Perumbavoor APMC",
            crop_needed="onion",
            quantity_needed_kg=800,
            verified=True,
            price_date=date(2026, 9, 1),
            source="marketplace mandi listing",
        ),
        SellingOption(
            name="Lowball Wholesale",
            option_type=SellingOptionType.BUYER,
            district="Ernakulam",
            state="Kerala",
            offered_price_per_kg=18,
            distance_km=3,
            transport_cost=200,
            location_name="Aluva",
            contact_phone="9876543212",
            exact_location="Aluva wholesale lane",
            crop_needed="onion",
            quantity_needed_kg=1500,
            verified=False,
            price_date=date(2026, 9, 1),
            source="registered buyer offer",
        ),
    ]


def sample_maharashtra_markets() -> list[MarketOption]:
    return [
        MarketOption(
            market_name="Nashik APMC",
            district="Nashik",
            state="Maharashtra",
            modal_price_per_quintal=2200,
            price_date=date(2026, 9, 1),
            distance_km=18,
            transport_cost=900,
            arrivals_tonnes=600,
            price_trend=Trend.STABLE,
            weather_risk=RiskLevel.LOW,
            volatility_risk=RiskLevel.MEDIUM,
            source="sample Agmarknet-like data",
        ),
        MarketOption(
            market_name="Pune Market",
            district="Pune",
            state="Maharashtra",
            modal_price_per_quintal=2450,
            price_date=date(2026, 9, 1),
            distance_km=210,
            transport_cost=4500,
            arrivals_tonnes=180,
            price_trend=Trend.RISING,
            weather_risk=RiskLevel.MEDIUM,
            volatility_risk=RiskLevel.MEDIUM,
            source="sample Agmarknet-like data",
        ),
        MarketOption(
            market_name="Mumbai Market",
            district="Mumbai",
            state="Maharashtra",
            modal_price_per_quintal=2600,
            price_date=date(2026, 8, 29),
            distance_km=170,
            transport_cost=5200,
            arrivals_tonnes=None,
            price_trend=Trend.UNKNOWN,
            weather_risk=RiskLevel.HIGH,
            volatility_risk=RiskLevel.HIGH,
            source="sample Agmarknet-like data",
        ),
    ]
