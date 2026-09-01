from pathlib import Path
import sys


sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from agrilink_ai.decision_engine import explain_selling_decision, rank_selling_options
from agrilink_ai.sample_data import (
    sample_farmer_request,
    sample_government_benchmark,
    sample_selling_options,
)


def main() -> None:
    farmer = sample_farmer_request()
    benchmark = sample_government_benchmark()
    options = sample_selling_options()
    ranked = rank_selling_options(farmer, options, benchmark)

    print("AgriLink AI marketplace ranking")
    print("-------------------------------")
    for index, decision in enumerate(ranked, start=1):
        print(
            f"{index}. {decision.option_name}: "
            f"score={decision.decision_score:,.2f}, "
            f"net=INR {decision.net_value:,.2f}, "
            f"offer=INR {decision.offered_price_per_kg:.2f}/kg, "
            f"decision={decision.recommendation.value}, "
            f"confidence={decision.confidence}"
        )

    print()
    print(explain_selling_decision(ranked[0]))


if __name__ == "__main__":
    main()
