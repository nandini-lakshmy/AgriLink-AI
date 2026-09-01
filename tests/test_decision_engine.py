from datetime import date
from pathlib import Path
import sys
import unittest


sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from agrilink_ai.decision_engine import (  # noqa: E402
    FarmerRequest,
    GovernmentBenchmark,
    MarketOption,
    Recommendation,
    RiskLevel,
    SellingOption,
    SellingOptionType,
    Trend,
    rank_markets,
    rank_selling_options,
)


class DecisionEngineTest(unittest.TestCase):
    def test_best_buyer_wins_after_profit_and_fairness_checks(self) -> None:
        farmer = FarmerRequest(
            crop="onion",
            quantity_kg=500,
            location_name="Perumbavoor, Kerala",
            urgency=RiskLevel.MEDIUM,
            storage_available=True,
        )
        benchmark = GovernmentBenchmark(
            crop="onion",
            district="Ernakulam",
            state="Kerala",
            average_price_per_kg=32,
            price_date=date(2026, 9, 1),
        )
        options = [
            SellingOption(
                name="Lowball Wholesale",
                option_type=SellingOptionType.BUYER,
                district="Ernakulam",
                state="Kerala",
                offered_price_per_kg=18,
                distance_km=3,
                transport_cost=200,
                location_name="Aluva",
            ),
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
            ),
        ]

        ranked = rank_selling_options(farmer, options, benchmark)

        self.assertEqual(ranked[0].option_name, "ABC Traders")
        self.assertEqual(ranked[0].recommendation, Recommendation.SELL)
        self.assertEqual(ranked[1].recommendation, Recommendation.REDIRECT)
        self.assertTrue(ranked[0].fairness_gap_percent and ranked[0].fairness_gap_percent > 0)

    def test_offer_below_government_average_gets_warning(self) -> None:
        farmer = FarmerRequest(
            crop="onion",
            quantity_kg=500,
            location_name="Perumbavoor, Kerala",
            urgency=RiskLevel.MEDIUM,
            storage_available=True,
        )
        benchmark = GovernmentBenchmark(
            crop="onion",
            district="Ernakulam",
            state="Kerala",
            average_price_per_kg=32,
            price_date=date(2026, 9, 1),
        )
        option = SellingOption(
            name="Lowball Wholesale",
            option_type=SellingOptionType.BUYER,
            district="Ernakulam",
            state="Kerala",
            offered_price_per_kg=18,
            distance_km=3,
            transport_cost=200,
            location_name="Aluva",
        )

        ranked = rank_selling_options(farmer, [option], benchmark)

        self.assertTrue(
            any("significantly below" in warning for warning in ranked[0].warnings)
        )

    def test_lower_price_can_win_after_transport_and_risk(self) -> None:
        farmer = FarmerRequest(
            crop="onion",
            quantity_kg=1000,
            location_name="Nashik, Maharashtra",
            urgency=RiskLevel.MEDIUM,
            storage_available=True,
        )
        markets = [
            MarketOption(
                market_name="Far Market",
                district="Pune",
                state="Maharashtra",
                modal_price_per_quintal=2500,
                price_date=date(2026, 9, 1),
                distance_km=210,
                transport_cost=6000,
                arrivals_tonnes=None,
                price_trend=Trend.UNKNOWN,
                weather_risk=RiskLevel.HIGH,
                volatility_risk=RiskLevel.HIGH,
            ),
            MarketOption(
                market_name="Nearby Market",
                district="Nashik",
                state="Maharashtra",
                modal_price_per_quintal=2300,
                price_date=date(2026, 9, 1),
                distance_km=20,
                transport_cost=800,
                arrivals_tonnes=150,
                price_trend=Trend.STABLE,
                weather_risk=RiskLevel.LOW,
                volatility_risk=RiskLevel.LOW,
            ),
        ]

        ranked = rank_markets(farmer, markets, today=date(2026, 9, 1))

        self.assertEqual(ranked[0].market_name, "Nearby Market")
        self.assertEqual(ranked[0].recommendation, Recommendation.SELL)
        self.assertEqual(ranked[1].recommendation, Recommendation.REDIRECT)

    def test_unknown_crop_still_gets_warning_instead_of_failure(self) -> None:
        farmer = FarmerRequest(
            crop="new crop",
            quantity_kg=500,
            location_name="Pune, Maharashtra",
            urgency=RiskLevel.LOW,
            storage_available=True,
        )
        markets = [
            MarketOption(
                market_name="Pune Market",
                district="Pune",
                state="Maharashtra",
                modal_price_per_quintal=1000,
                price_date=date(2026, 9, 1),
                distance_km=10,
                transport_cost=500,
            )
        ]

        ranked = rank_markets(farmer, markets, today=date(2026, 9, 1))

        self.assertEqual(ranked[0].confidence, "Medium")
        self.assertTrue(any("Crop-specific" in warning for warning in ranked[0].warnings))


if __name__ == "__main__":
    unittest.main()
