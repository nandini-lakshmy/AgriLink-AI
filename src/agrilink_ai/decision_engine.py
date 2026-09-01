from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from enum import Enum
from typing import Iterable


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Trend(str, Enum):
    FALLING = "falling"
    STABLE = "stable"
    RISING = "rising"
    UNKNOWN = "unknown"


class Recommendation(str, Enum):
    SELL = "Sell"
    WAIT = "Wait"
    REDIRECT = "Redirect"


class SellingOptionType(str, Enum):
    BUYER = "buyer"
    MARKET = "market"


@dataclass(frozen=True)
class CropProfile:
    crop: str
    perishability: RiskLevel
    typical_storage_days: int | None
    notes: str


@dataclass(frozen=True)
class FarmerRequest:
    crop: str
    quantity_kg: float
    location_name: str
    urgency: RiskLevel
    storage_available: bool
    farmer_name: str | None = None
    phone: str | None = None
    state: str | None = None
    district: str | None = None
    gps_latitude: float | None = None
    gps_longitude: float | None = None
    expected_price_per_kg: float | None = None
    expected_market_fee: float = 0.0


@dataclass(frozen=True)
class MarketOption:
    market_name: str
    district: str
    state: str
    modal_price_per_quintal: float
    price_date: date
    distance_km: float
    transport_cost: float
    arrivals_tonnes: float | None = None
    price_trend: Trend = Trend.UNKNOWN
    weather_risk: RiskLevel = RiskLevel.MEDIUM
    volatility_risk: RiskLevel = RiskLevel.MEDIUM
    source: str = "sample"


@dataclass(frozen=True)
class GovernmentBenchmark:
    crop: str
    district: str
    state: str
    average_price_per_kg: float
    price_date: date
    min_price_per_kg: float | None = None
    max_price_per_kg: float | None = None
    source: str = "AGMARKNET/data.gov.in"


@dataclass(frozen=True)
class SellingOption:
    name: str
    option_type: SellingOptionType
    district: str
    state: str
    offered_price_per_kg: float
    distance_km: float
    transport_cost: float
    location_name: str
    contact_phone: str | None = None
    exact_location: str | None = None
    crop_needed: str | None = None
    quantity_needed_kg: float | None = None
    verified: bool = False
    price_date: date | None = None
    source: str = "marketplace"


@dataclass(frozen=True)
class MarketDecision:
    market_name: str
    district: str
    recommendation: Recommendation
    confidence: str
    decision_score: float
    gross_value: float
    net_value: float
    risk_penalty: float
    modal_price_per_kg: float
    reasons: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    source: str = "sample"
    price_date: date | None = None


@dataclass(frozen=True)
class SellingDecision:
    option_name: str
    option_type: SellingOptionType
    district: str
    recommendation: Recommendation
    confidence: str
    decision_score: float
    gross_value: float
    net_value: float
    offered_price_per_kg: float
    government_average_price_per_kg: float | None
    fairness_gap_percent: float | None
    contact_phone: str | None
    exact_location: str | None
    reasons: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    source: str = "marketplace"
    price_date: date | None = None


CROP_PROFILES: dict[str, CropProfile] = {
    "tomato": CropProfile("tomato", RiskLevel.HIGH, 2, "Highly perishable; waiting is risky."),
    "onion": CropProfile("onion", RiskLevel.MEDIUM, 30, "Can be stored if curing and storage are available."),
    "potato": CropProfile("potato", RiskLevel.MEDIUM, 21, "Storage matters; heat and moisture increase risk."),
    "banana": CropProfile("banana", RiskLevel.HIGH, 4, "Highly perishable after harvest."),
    "grapes": CropProfile("grapes", RiskLevel.HIGH, 3, "Quality drops quickly without cold-chain support."),
    "soybean": CropProfile("soybean", RiskLevel.LOW, 90, "Lower perishability if dried and stored safely."),
    "cotton": CropProfile("cotton", RiskLevel.LOW, 90, "Lower perishability; quality and moisture still matter."),
    "tur": CropProfile("tur", RiskLevel.LOW, 120, "Pulse crop; storage can support waiting decisions."),
}


FAIR_PRICE_WARNING_THRESHOLD = 0.20
UNVERIFIED_BUYER_PENALTY = 500.0


RISK_POINTS = {
    RiskLevel.LOW: 0.01,
    RiskLevel.MEDIUM: 0.03,
    RiskLevel.HIGH: 0.06,
}


TREND_POINTS = {
    Trend.RISING: -0.02,
    Trend.STABLE: 0.00,
    Trend.FALLING: 0.03,
    Trend.UNKNOWN: 0.02,
}


def rank_selling_options(
    farmer: FarmerRequest,
    options: Iterable[SellingOption],
    government_benchmark: GovernmentBenchmark | None = None,
) -> list[SellingDecision]:
    """Rank buyer and mandi options for the AgriLink AI marketplace brain."""
    if farmer.quantity_kg <= 0:
        raise ValueError("quantity_kg must be greater than 0")

    scored = [_score_selling_option(farmer, option, government_benchmark) for option in options]

    if not scored:
        raise ValueError("at least one selling option is required")

    scored.sort(key=lambda decision: decision.decision_score, reverse=True)
    best_option = scored[0].option_name

    final_decisions: list[SellingDecision] = []
    for index, decision in enumerate(scored):
        recommendation = Recommendation.SELL if index == 0 else Recommendation.REDIRECT
        reasons = list(decision.reasons)

        if recommendation == Recommendation.REDIRECT:
            reasons.insert(0, f"{best_option} is more profitable after price, travel cost, and fairness checks.")
        else:
            reasons.insert(0, "This is the strongest selling option found for the farmer.")

        final_decisions.append(
            SellingDecision(
                option_name=decision.option_name,
                option_type=decision.option_type,
                district=decision.district,
                recommendation=recommendation,
                confidence=decision.confidence,
                decision_score=decision.decision_score,
                gross_value=decision.gross_value,
                net_value=decision.net_value,
                offered_price_per_kg=decision.offered_price_per_kg,
                government_average_price_per_kg=decision.government_average_price_per_kg,
                fairness_gap_percent=decision.fairness_gap_percent,
                contact_phone=decision.contact_phone,
                exact_location=decision.exact_location,
                reasons=reasons,
                warnings=decision.warnings,
                source=decision.source,
                price_date=decision.price_date,
            )
        )

    return final_decisions


def rank_markets(
    farmer: FarmerRequest,
    markets: Iterable[MarketOption],
    today: date | None = None,
) -> list[MarketDecision]:
    """Rank markets using net value, risk, data freshness, trend, and perishability."""
    if farmer.quantity_kg <= 0:
        raise ValueError("quantity_kg must be greater than 0")

    today = today or date.today()
    profile = _get_crop_profile(farmer.crop)
    decisions = [_score_market(farmer, market, profile, today) for market in markets]

    if not decisions:
        raise ValueError("at least one market option is required")

    decisions.sort(key=lambda decision: decision.decision_score, reverse=True)
    best_market = decisions[0].market_name

    final_decisions: list[MarketDecision] = []
    for index, decision in enumerate(decisions):
        recommendation = _recommend(farmer, profile, decision, is_best=index == 0)
        reasons = list(decision.reasons)

        if recommendation == Recommendation.REDIRECT:
            reasons.insert(0, f"{best_market} has a stronger overall score after costs and risks.")
        elif recommendation == Recommendation.WAIT:
            reasons.insert(0, "Waiting may be reasonable because risk is manageable and trend is favorable.")
        else:
            reasons.insert(0, "Selling soon is safer based on urgency, perishability, or market risk.")

        final_decisions.append(
            MarketDecision(
                market_name=decision.market_name,
                district=decision.district,
                recommendation=recommendation,
                confidence=decision.confidence,
                decision_score=decision.decision_score,
                gross_value=decision.gross_value,
                net_value=decision.net_value,
                risk_penalty=decision.risk_penalty,
                modal_price_per_kg=decision.modal_price_per_kg,
                reasons=reasons,
                warnings=decision.warnings,
                source=decision.source,
                price_date=decision.price_date,
            )
        )

    return final_decisions


def explain_decision(decision: MarketDecision) -> str:
    """Create a farmer-friendly explanation without inventing unsupported data."""
    lines = [
        f"Recommended market: {decision.market_name}, {decision.district}",
        f"Decision: {decision.recommendation.value}",
        f"Confidence: {decision.confidence}",
        "",
        "Why:",
    ]
    lines.extend(f"+ {reason}" for reason in decision.reasons)

    if decision.warnings:
        lines.append("")
        lines.append("Warnings:")
        lines.extend(f"- {warning}" for warning in decision.warnings)

    lines.extend(
        [
            "",
            "Data used:",
            f"- Source: {decision.source}",
            f"- Price date: {decision.price_date.isoformat() if decision.price_date else 'unavailable'}",
            f"- Modal price: INR {decision.modal_price_per_kg:.2f}/kg",
            f"- Estimated net value: INR {decision.net_value:,.2f}",
            f"- Risk penalty: INR {decision.risk_penalty:,.2f}",
            f"- Decision score: {decision.decision_score:,.2f}",
        ]
    )
    return "\n".join(lines)


def explain_selling_decision(decision: SellingDecision) -> str:
    """Create a farmer-friendly AgriLink AI explanation for a buyer or mandi."""
    lines = [
        f"Recommended option: {decision.option_name}, {decision.district}",
        f"Type: {decision.option_type.value}",
        f"Decision: {decision.recommendation.value}",
        f"Confidence: {decision.confidence}",
        "",
        "Why:",
    ]
    lines.extend(f"+ {reason}" for reason in decision.reasons)

    if decision.warnings:
        lines.append("")
        lines.append("Warnings:")
        lines.extend(f"- {warning}" for warning in decision.warnings)

    lines.extend(
        [
            "",
            "Data used:",
            f"- Source: {decision.source}",
            f"- Offer date: {decision.price_date.isoformat() if decision.price_date else 'unavailable'}",
            f"- Buyer/market offer: INR {decision.offered_price_per_kg:.2f}/kg",
            _format_government_price(decision),
            f"- Estimated net profit: INR {decision.net_value:,.2f}",
            f"- Decision score: {decision.decision_score:,.2f}",
        ]
    )
    if decision.contact_phone:
        lines.append(f"- Contact: {decision.contact_phone}")
    if decision.exact_location:
        lines.append(f"- Location: {decision.exact_location}")

    return "\n".join(lines)


def _score_selling_option(
    farmer: FarmerRequest,
    option: SellingOption,
    government_benchmark: GovernmentBenchmark | None,
) -> SellingDecision:
    if option.offered_price_per_kg <= 0:
        raise ValueError(f"{option.name} offered_price_per_kg must be greater than 0")

    gross_value = option.offered_price_per_kg * farmer.quantity_kg
    net_value = gross_value - option.transport_cost - farmer.expected_market_fee
    fairness_gap = _fairness_gap(option, government_benchmark)
    unfair_penalty = gross_value * abs(fairness_gap) if fairness_gap is not None and fairness_gap < -FAIR_PRICE_WARNING_THRESHOLD else 0
    verified_penalty = 0 if option.verified or option.option_type == SellingOptionType.MARKET else UNVERIFIED_BUYER_PENALTY
    decision_score = net_value - unfair_penalty - verified_penalty

    reasons = [
        f"Offer price is INR {option.offered_price_per_kg:.2f}/kg.",
        f"Estimated gross value is INR {gross_value:,.2f}.",
        f"Estimated transport cost is INR {option.transport_cost:,.2f}.",
        f"Estimated net profit after transport and fees is INR {net_value:,.2f}.",
        f"Distance is {option.distance_km:.1f} km from the farmer.",
    ]

    warnings = []
    if option.crop_needed and option.crop_needed.strip().lower() != farmer.crop.strip().lower():
        warnings.append(f"Buyer demand is for {option.crop_needed}, not {farmer.crop}.")
    if option.quantity_needed_kg is not None and option.quantity_needed_kg < farmer.quantity_kg:
        warnings.append("Buyer demand is lower than the farmer's harvest quantity.")
    if not option.verified and option.option_type == SellingOptionType.BUYER:
        warnings.append("Buyer is not verified yet.")
    if government_benchmark is None:
        warnings.append("Government benchmark price is unavailable, so fair-price validation is limited.")
    elif fairness_gap is not None:
        reasons.append(
            f"Government benchmark is INR {government_benchmark.average_price_per_kg:.2f}/kg "
            f"from {government_benchmark.source}."
        )
        if fairness_gap < -FAIR_PRICE_WARNING_THRESHOLD:
            warnings.append("Offer is significantly below the government market average.")
        elif fairness_gap >= 0:
            reasons.append("Offer is at or above the government market average.")
        else:
            reasons.append("Offer is close to the government market average.")

    confidence = _confidence(warnings, 0)

    return SellingDecision(
        option_name=option.name,
        option_type=option.option_type,
        district=option.district,
        recommendation=Recommendation.SELL,
        confidence=confidence,
        decision_score=decision_score,
        gross_value=gross_value,
        net_value=net_value,
        offered_price_per_kg=option.offered_price_per_kg,
        government_average_price_per_kg=(
            government_benchmark.average_price_per_kg if government_benchmark else None
        ),
        fairness_gap_percent=(fairness_gap * 100 if fairness_gap is not None else None),
        contact_phone=option.contact_phone,
        exact_location=option.exact_location,
        reasons=reasons,
        warnings=warnings,
        source=option.source,
        price_date=option.price_date,
    )


def _score_market(
    farmer: FarmerRequest,
    market: MarketOption,
    profile: CropProfile,
    today: date,
) -> MarketDecision:
    if market.modal_price_per_quintal <= 0:
        raise ValueError(f"{market.market_name} modal_price_per_quintal must be greater than 0")

    modal_price_per_kg = market.modal_price_per_quintal / 100
    gross_value = modal_price_per_kg * farmer.quantity_kg
    net_value = gross_value - market.transport_cost - farmer.expected_market_fee

    stale_days = max((today - market.price_date).days, 0)
    stale_risk = 0.00 if stale_days <= 1 else 0.02 if stale_days <= 3 else 0.05
    arrival_risk = _arrival_risk(market.arrivals_tonnes)

    risk_rate = (
        RISK_POINTS[market.weather_risk]
        + RISK_POINTS[profile.perishability]
        + RISK_POINTS[market.volatility_risk]
        + TREND_POINTS[market.price_trend]
        + stale_risk
        + arrival_risk
    )

    if farmer.urgency == RiskLevel.HIGH:
        risk_rate += 0.02

    if profile.perishability == RiskLevel.HIGH and not farmer.storage_available:
        risk_rate += 0.03

    risk_penalty = max(gross_value * risk_rate, 0)
    decision_score = net_value - risk_penalty

    reasons = [
        f"Estimated gross value is INR {gross_value:,.2f}.",
        f"Estimated transport cost is INR {market.transport_cost:,.2f}.",
        f"Estimated net value after transport and fees is INR {net_value:,.2f}.",
        f"Crop perishability is {profile.perishability.value}: {profile.notes}",
        f"Price trend is {market.price_trend.value}.",
        f"Weather risk is {market.weather_risk.value}.",
    ]

    warnings = []
    if market.arrivals_tonnes is None:
        warnings.append("Arrival data is unavailable, so demand/supply confidence is lower.")
    else:
        reasons.append(f"Arrival volume is {market.arrivals_tonnes:,.1f} tonnes.")

    if stale_days > 1:
        warnings.append(f"Price data is {stale_days} days old.")

    if profile.crop == "unknown":
        warnings.append("Crop-specific perishability profile is unavailable; medium risk was used.")

    if market.state.strip().lower() != "maharashtra":
        warnings.append("Market is outside Maharashtra prototype focus.")

    confidence = _confidence(warnings, stale_days)

    return MarketDecision(
        market_name=market.market_name,
        district=market.district,
        recommendation=Recommendation.SELL,
        confidence=confidence,
        decision_score=decision_score,
        gross_value=gross_value,
        net_value=net_value,
        risk_penalty=risk_penalty,
        modal_price_per_kg=modal_price_per_kg,
        reasons=reasons,
        warnings=warnings,
        source=market.source,
        price_date=market.price_date,
    )


def _fairness_gap(
    option: SellingOption,
    government_benchmark: GovernmentBenchmark | None,
) -> float | None:
    if government_benchmark is None or government_benchmark.average_price_per_kg <= 0:
        return None
    return (option.offered_price_per_kg - government_benchmark.average_price_per_kg) / government_benchmark.average_price_per_kg


def _format_government_price(decision: SellingDecision) -> str:
    if decision.government_average_price_per_kg is None:
        return "- Government benchmark: unavailable"
    return f"- Government benchmark: INR {decision.government_average_price_per_kg:.2f}/kg"


def _get_crop_profile(crop: str) -> CropProfile:
    normalized = crop.strip().lower()
    return CROP_PROFILES.get(
        normalized,
        CropProfile("unknown", RiskLevel.MEDIUM, None, "No validated profile yet; use caution."),
    )


def _arrival_risk(arrivals_tonnes: float | None) -> float:
    if arrivals_tonnes is None:
        return 0.02
    if arrivals_tonnes > 500:
        return 0.03
    if arrivals_tonnes < 20:
        return 0.01
    return 0.00


def _confidence(warnings: list[str], stale_days: int) -> str:
    if len(warnings) >= 3 or stale_days > 5:
        return "Low"
    if warnings:
        return "Medium"
    return "High"


def _recommend(
    farmer: FarmerRequest,
    profile: CropProfile,
    decision: MarketDecision,
    is_best: bool,
) -> Recommendation:
    if not is_best:
        return Recommendation.REDIRECT

    high_sale_pressure = (
        farmer.urgency == RiskLevel.HIGH
        or profile.perishability == RiskLevel.HIGH
        or any("Weather risk is high" in reason for reason in decision.reasons)
    )
    wait_possible = (
        farmer.storage_available
        and farmer.urgency == RiskLevel.LOW
        and profile.perishability != RiskLevel.HIGH
        and any("Price trend is rising" in reason for reason in decision.reasons)
        and decision.confidence != "Low"
    )

    if wait_possible:
        return Recommendation.WAIT
    if high_sale_pressure:
        return Recommendation.SELL
    return Recommendation.SELL
