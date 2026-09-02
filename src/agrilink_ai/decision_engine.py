from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from enum import Enum
from math import asin, cos, radians, sin, sqrt
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


class DemandLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class DemandTrend(str, Enum):
    DECREASING = "decreasing"
    STABLE = "stable"
    INCREASING = "increasing"


class Recommendation(str, Enum):
    SELL = "SELL"
    WAIT = "WAIT"
    REDIRECT = "REDIRECT"


class SellingOptionType(str, Enum):
    BUYER = "buyer"
    MARKET = "market"


class FairPriceStatus(str, Enum):
    FAIR = "FAIR"
    WARNING = "WARNING"
    UNFAIR = "UNFAIR"
    HIGH_RISK_ALERT = "HIGH_RISK_ALERT"
    UNAVAILABLE = "UNAVAILABLE"


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
    urgency: RiskLevel | None
    storage_available: bool | None
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
    transport_cost: float | None
    location_name: str
    candidate_id: str | None = None
    contact_phone: str | None = None
    exact_location: str | None = None
    crop_needed: str | None = None
    quantity_needed_kg: float | None = None
    verified: bool = False
    price_date: date | None = None
    source: str = "marketplace"


@dataclass(frozen=True)
class PriceIntelligence:
    trend: Trend | None = None
    average_price_per_kg: float | None = None
    history_days: int | None = None
    government_modal_price_per_kg: float | None = None


@dataclass(frozen=True)
class DemandIntelligence:
    level: DemandLevel | None = None
    trend: DemandTrend | None = None


@dataclass(frozen=True)
class IntelligenceContext:
    government_benchmark: GovernmentBenchmark | None = None
    price: PriceIntelligence | None = None
    demand: DemandIntelligence | None = None
    transport_available: bool | None = None
    weather_risk: RiskLevel | None = None
    crop_perishability: RiskLevel | None = None
    storage_available: bool | None = None
    urgency: RiskLevel | None = None


@dataclass(frozen=True)
class FairPriceResult:
    government_modal_price_per_kg: float | None
    buyer_offer_price_per_kg: float | None
    difference_percent: float | None
    status: FairPriceStatus
    alert: str | None = None


@dataclass(frozen=True)
class DataQuality:
    confidence: str
    missing_fields: list[str] = field(default_factory=list)


@dataclass(frozen=True)
class CandidateRanking:
    candidate_id: str
    candidate_name: str
    candidate_type: SellingOptionType
    rank: int
    price_per_kg: float
    distance_km: float
    transport_cost: float | None
    estimated_net_profit: float | None
    decision_score: float
    reasons: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)


@dataclass(frozen=True)
class RecommendationSummary:
    decision: Recommendation
    best_buyer_id: str | None
    best_buyer_name: str | None
    best_market_id: str | None
    best_market_name: str | None
    decision_score: float
    estimated_net_profit: float | None


@dataclass(frozen=True)
class RecommendationResponse:
    status: str
    recommendation: RecommendationSummary
    fair_price: FairPriceResult
    rankings: list[CandidateRanking]
    market_insights: dict[str, str | float | int | None]
    alerts: list[str]
    data_quality: DataQuality


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
    net_value: float | None
    offered_price_per_kg: float
    government_average_price_per_kg: float | None
    fairness_gap_percent: float | None
    contact_phone: str | None
    exact_location: str | None
    candidate_id: str | None = None
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


# Proposed fairness thresholds from the team. Values are percentages below the
# government modal benchmark and are intentionally configurable.
FAIR_THRESHOLD_PERCENT = 10.0
WARNING_THRESHOLD_PERCENT = 20.0
UNFAIR_THRESHOLD_PERCENT = 30.0
STRONG_OFFER_ABOVE_BENCHMARK_PERCENT = 10.0


# Prototype scoring weights. These are not finalized policy weights; they keep
# each contribution isolated so the team can tune suitability without touching
# net-profit calculation.
SCORING_WEIGHTS = {
    "net_profit": 35.0,
    "distance": 15.0,
    "verification": 10.0,
    "benchmark": 15.0,
    "price_trend": 8.0,
    "demand": 8.0,
    "weather": 5.0,
    "storage_perishability": 4.0,
}


RISK_POINTS = {
    RiskLevel.LOW: 0.01,
    RiskLevel.MEDIUM: 0.03,
    RiskLevel.HIGH: 0.06,
}


TREND_RISK_POINTS = {
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
    """Rank buyer and mandi options while keeping score separate from INR profit."""
    option_list = list(options)
    context = IntelligenceContext(
        government_benchmark=government_benchmark,
        storage_available=farmer.storage_available,
        urgency=farmer.urgency,
        crop_perishability=_get_crop_profile(farmer.crop).perishability,
    )
    rankings = _rank_candidates(farmer, option_list, context)
    best_id = rankings[0].candidate_id

    decisions: list[SellingDecision] = []
    for ranking in rankings:
        recommendation = Recommendation.SELL if ranking.candidate_id == best_id else Recommendation.REDIRECT
        reasons = list(ranking.reasons)
        if recommendation == Recommendation.REDIRECT:
            reasons.insert(0, f"{rankings[0].candidate_name} has the strongest overall suitability score.")
        else:
            reasons.insert(0, "This is the strongest selling option found for the farmer.")
        fair_price = evaluate_fair_price(ranking.price_per_kg, government_benchmark)
        decisions.append(
            SellingDecision(
                option_name=ranking.candidate_name,
                option_type=ranking.candidate_type,
                district=next(
                    option.district for option in option_list if _candidate_id(option) == ranking.candidate_id
                ),
                recommendation=recommendation,
                confidence=_data_quality(context).confidence.capitalize(),
                decision_score=ranking.decision_score,
                gross_value=ranking.price_per_kg * farmer.quantity_kg,
                net_value=ranking.estimated_net_profit,
                offered_price_per_kg=ranking.price_per_kg,
                government_average_price_per_kg=fair_price.government_modal_price_per_kg,
                fairness_gap_percent=fair_price.difference_percent,
                contact_phone=next(
                    option.contact_phone for option in option_list if _candidate_id(option) == ranking.candidate_id
                ),
                exact_location=next(
                    option.exact_location for option in option_list if _candidate_id(option) == ranking.candidate_id
                ),
                candidate_id=ranking.candidate_id,
                reasons=reasons,
                warnings=ranking.warnings,
                source=next(option.source for option in option_list if _candidate_id(option) == ranking.candidate_id),
                price_date=next(option.price_date for option in option_list if _candidate_id(option) == ranking.candidate_id),
            )
        )
    return decisions


def rank_markets(
    farmer: FarmerRequest,
    markets: Iterable[MarketOption],
    today: date | None = None,
) -> list[MarketDecision]:
    """Rank markets using market-specific price, risk, arrival, and freshness signals."""
    if farmer.quantity_kg <= 0:
        raise ValueError("quantity_kg must be greater than 0")

    market_list = list(markets)
    if not market_list:
        raise ValueError("at least one market option is required")

    today = today or date.today()
    profile = _get_crop_profile(farmer.crop)
    scored = [_score_market(farmer, market, profile, today) for market in market_list]
    scored.sort(key=lambda decision: decision.decision_score, reverse=True)
    best_market = scored[0].market_name

    decisions: list[MarketDecision] = []
    for index, decision in enumerate(scored):
        is_best = index == 0
        recommendation = _recommend_market(farmer, profile, decision, is_best)
        reasons = list(decision.reasons)
        if recommendation == Recommendation.REDIRECT:
            reasons.insert(0, f"{best_market} has a stronger overall score after costs and risks.")
        elif recommendation == Recommendation.WAIT:
            reasons.insert(0, "Waiting may be reasonable because risk is manageable and trend is favorable.")
        else:
            reasons.insert(0, "Selling soon is preferable based on the available market data.")
        decisions.append(
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
    return decisions


def recommend_selling_decision(
    farmer: FarmerRequest,
    candidates: Iterable[SellingOption],
    context: IntelligenceContext,
) -> RecommendationResponse:
    """Create the structured Marketplace Intelligence recommendation response."""
    ranked = _rank_candidates(farmer, list(candidates), context)
    best = ranked[0]
    fair_price = evaluate_fair_price(best.price_per_kg, context.government_benchmark)
    alerts = [ranking.warnings for ranking in ranked]
    flat_alerts = [warning for group in alerts for warning in group]
    if fair_price.alert:
        flat_alerts.insert(0, fair_price.alert)
    decision = _final_recommendation(best, ranked, farmer, context, fair_price)
    best_buyer = best if best.candidate_type == SellingOptionType.BUYER else None
    best_market = best if best.candidate_type == SellingOptionType.MARKET else None

    return RecommendationResponse(
        status="success",
        recommendation=RecommendationSummary(
            decision=decision,
            best_buyer_id=best_buyer.candidate_id if best_buyer else None,
            best_buyer_name=best_buyer.candidate_name if best_buyer else None,
            best_market_id=best_market.candidate_id if best_market else None,
            best_market_name=best_market.candidate_name if best_market else None,
            decision_score=best.decision_score,
            estimated_net_profit=best.estimated_net_profit,
        ),
        fair_price=fair_price,
        rankings=ranked,
        market_insights=_market_insights(context),
        alerts=list(dict.fromkeys(flat_alerts)),
        data_quality=_data_quality(context),
    )


def evaluate_fair_price(
    offer_price_per_kg: float | None,
    government_benchmark: GovernmentBenchmark | None,
) -> FairPriceResult:
    modal = government_benchmark.average_price_per_kg if government_benchmark else None
    if offer_price_per_kg is None or modal is None or modal <= 0:
        return FairPriceResult(modal, offer_price_per_kg, None, FairPriceStatus.UNAVAILABLE, None)

    difference = ((offer_price_per_kg - modal) / modal) * 100
    if difference >= -FAIR_THRESHOLD_PERCENT:
        status = FairPriceStatus.FAIR
        alert = None
    elif difference >= -WARNING_THRESHOLD_PERCENT:
        status = FairPriceStatus.WARNING
        alert = "Offer is 10-20% below the government modal benchmark."
    elif difference >= -UNFAIR_THRESHOLD_PERCENT:
        status = FairPriceStatus.UNFAIR
        alert = "Offer is 20-30% below the government modal benchmark."
    else:
        status = FairPriceStatus.HIGH_RISK_ALERT
        alert = "Offer is more than 30% below the government modal benchmark."
    return FairPriceResult(modal, offer_price_per_kg, round(difference, 2), status, alert)


def explain_decision(decision: MarketDecision) -> str:
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
            f"- Decision score: {decision.decision_score:,.2f}/100",
        ]
    )
    return "\n".join(lines)


def explain_selling_decision(decision: SellingDecision) -> str:
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
            _format_net_profit(decision.net_value),
            f"- Decision score: {decision.decision_score:,.2f}/100",
        ]
    )
    if decision.contact_phone:
        lines.append(f"- Contact: {decision.contact_phone}")
    if decision.exact_location:
        lines.append(f"- Location: {decision.exact_location}")
    return "\n".join(lines)

def _arrival_risk(arrivals_tonnes: float | None) -> float:
    """Return a small risk adjustment based on market arrival volume."""
    if arrivals_tonnes is None:
        return 0.02
    if arrivals_tonnes > 500:
        return 0.03
    if arrivals_tonnes < 20:
        return 0.01
    return 0.0

def _confidence_from_warnings(warnings: list[str], stale_days: int) -> str:
    """Estimate confidence from data-quality warnings and price freshness."""
    if len(warnings) >= 3 or stale_days > 5:
        return "Low"
    if warnings:
        return "Medium"
    return "High"

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
        + TREND_RISK_POINTS[market.price_trend]
        + stale_risk
        + arrival_risk
    )
    if farmer.urgency == RiskLevel.HIGH:
        risk_rate += 0.02
    if profile.perishability == RiskLevel.HIGH and farmer.storage_available is False:
        risk_rate += 0.03

    risk_penalty = round(max(gross_value * risk_rate, 0), 2)
    suitability_value = max(net_value - risk_penalty, 0)
    decision_score = round(_clamp((suitability_value / gross_value) * 100 if gross_value else 0, 0, 100), 2)

    reasons = [
        f"Estimated gross value is INR {gross_value:,.2f}.",
        f"Estimated transport cost is INR {market.transport_cost:,.2f}.",
        f"Estimated net value after transport and fees is INR {net_value:,.2f}.",
        f"Risk penalty is INR {risk_penalty:,.2f}.",
        f"Crop perishability is {profile.perishability.value}: {profile.notes}",
        f"Price trend is {market.price_trend.value}.",
        f"Weather risk is {market.weather_risk.value}.",
        f"Volatility risk is {market.volatility_risk.value}.",
    ]

    warnings = []
    if market.arrivals_tonnes is None:
        warnings.append("Arrival data is unavailable, so supply-side confidence is lower.")
    else:
        reasons.append(f"Arrival volume is {market.arrivals_tonnes:,.1f} tonnes.")
    if stale_days > 1:
        warnings.append(f"Price data is {stale_days} days old.")
    if profile.crop == "unknown":
        warnings.append("Crop-specific perishability profile is unavailable; medium risk was used.")
    if farmer.storage_available is None:
        warnings.append("Storage availability is unknown, so waiting is not recommended.")
    if market.state.strip().lower() != "maharashtra":
        warnings.append("Market is outside Maharashtra prototype focus.")

    return MarketDecision(
        market_name=market.market_name,
        district=market.district,
        recommendation=Recommendation.SELL,
        confidence=_confidence_from_warnings(warnings, stale_days),
        decision_score=decision_score,
        gross_value=round(gross_value, 2),
        net_value=round(net_value, 2),
        risk_penalty=risk_penalty,
        modal_price_per_kg=round(modal_price_per_kg, 2),
        reasons=reasons,
        warnings=warnings,
        source=market.source,
        price_date=market.price_date,
    )


def _recommend_market(
    farmer: FarmerRequest,
    profile: CropProfile,
    decision: MarketDecision,
    is_best: bool,
) -> Recommendation:
    if not is_best:
        return Recommendation.REDIRECT

    price_rising = any("Price trend is rising" in reason for reason in decision.reasons)
    weather_low = any("Weather risk is low" in reason for reason in decision.reasons)
    wait_possible = (
        farmer.storage_available is True
        and farmer.urgency == RiskLevel.LOW
        and profile.perishability in {RiskLevel.LOW, RiskLevel.MEDIUM}
        and price_rising
        and weather_low
        and decision.confidence != "Low"
    )
    return Recommendation.WAIT if wait_possible else Recommendation.SELL


def _rank_candidates(
    farmer: FarmerRequest,
    options: list[SellingOption],
    context: IntelligenceContext,
) -> list[CandidateRanking]:
    if farmer.quantity_kg <= 0:
        raise ValueError("quantity_kg must be greater than 0")
    if not options:
        raise ValueError("at least one selling option is required")
    for option in options:
        if option.offered_price_per_kg <= 0:
            raise ValueError(f"{option.name} offered_price_per_kg must be greater than 0")

    scored = [_score_candidate(farmer, option, options, context) for option in options]
    scored.sort(key=lambda item: item.decision_score, reverse=True)
    return [
        CandidateRanking(
            candidate_id=item.candidate_id,
            candidate_name=item.candidate_name,
            candidate_type=item.candidate_type,
            rank=index,
            price_per_kg=item.price_per_kg,
            distance_km=item.distance_km,
            transport_cost=item.transport_cost,
            estimated_net_profit=item.estimated_net_profit,
            decision_score=item.decision_score,
            reasons=item.reasons,
            warnings=item.warnings,
        )
        for index, item in enumerate(scored, start=1)
    ]


def _score_candidate(
    farmer: FarmerRequest,
    option: SellingOption,
    all_options: list[SellingOption],
    context: IntelligenceContext,
) -> CandidateRanking:
    gross_value = option.offered_price_per_kg * farmer.quantity_kg
    net_profit = _candidate_net_profit(farmer, option)
    known_net_profits = [
        value for candidate in all_options if (value := _candidate_net_profit(farmer, candidate)) is not None
    ]
    max_distance = max(candidate.distance_km for candidate in all_options) or 1
    if net_profit is None or not known_net_profits:
        net_component = 0.0
    else:
        net_component = _scale(net_profit, min(known_net_profits), max(known_net_profits)) * SCORING_WEIGHTS["net_profit"]
    distance_component = (1 - min(option.distance_km / max(max_distance, 1), 1)) * SCORING_WEIGHTS["distance"]
    verification_component = _verification_score(option) * SCORING_WEIGHTS["verification"]
    benchmark_component, benchmark_reasons, benchmark_warnings = _benchmark_score(option, context.government_benchmark)
    trend_component, trend_reasons = _trend_score(context.price)
    demand_component, demand_reasons = _demand_score(context.demand)
    weather_component, weather_reasons, weather_warnings = _weather_score(context.weather_risk)
    storage_component, storage_reasons, storage_warnings = _storage_score(context)

    score = (
        net_component
        + distance_component
        + verification_component
        + benchmark_component
        + trend_component
        + demand_component
        + weather_component
        + storage_component
    )
    score = round(_clamp(score, 0, 100), 2)

    reasons = [
        f"Distance is {option.distance_km:.1f} km from the farmer.",
    ]
    if net_profit is None:
        reasons.insert(0, "Estimated net profit is unavailable because transport cost is unavailable.")
    else:
        reasons.insert(0, f"Estimated net profit is INR {net_profit:,.2f}.")
    if option.distance_km <= 25:
        reasons.append(f"{option.option_type.value.capitalize()} is nearby.")
    if option.verified:
        reasons.append(f"{option.option_type.value.capitalize()} is verified.")
    else:
        reasons.append(f"{option.option_type.value.capitalize()} verification is unavailable.")
    reasons.extend(benchmark_reasons)
    reasons.extend(trend_reasons)
    reasons.extend(demand_reasons)
    reasons.extend(weather_reasons)
    reasons.extend(storage_reasons)
    if net_profit is not None and known_net_profits and net_profit == max(known_net_profits):
        reasons.append("Highest estimated net value among supplied candidates.")

    warnings = list(benchmark_warnings) + weather_warnings + storage_warnings
    if option.transport_cost is None:
        warnings.append("Transport cost is unavailable, so net profit is not estimated.")
    if option.crop_needed and option.crop_needed.strip().lower() != farmer.crop.strip().lower():
        warnings.append(f"Candidate demand is for {option.crop_needed}, not {farmer.crop}.")
    if option.quantity_needed_kg is not None and option.quantity_needed_kg < farmer.quantity_kg:
        warnings.append("Candidate demand quantity is lower than the farmer's harvest quantity.")

    return CandidateRanking(
        candidate_id=_candidate_id(option),
        candidate_name=option.name,
        candidate_type=option.option_type,
        rank=0,
        price_per_kg=option.offered_price_per_kg,
        distance_km=round(option.distance_km, 2),
        transport_cost=round(option.transport_cost, 2) if option.transport_cost is not None else None,
        estimated_net_profit=round(net_profit, 2) if net_profit is not None else None,
        decision_score=score,
        reasons=reasons,
        warnings=warnings,
    )


def _final_recommendation(
    best: CandidateRanking,
    rankings: list[CandidateRanking],
    farmer: FarmerRequest,
    context: IntelligenceContext,
    fair_price: FairPriceResult,
) -> Recommendation:
    if _wait_conditions_met(farmer, context, fair_price):
        return Recommendation.WAIT
    if best.candidate_type == SellingOptionType.MARKET and any(
        ranking.candidate_type == SellingOptionType.BUYER for ranking in rankings
    ):
        return Recommendation.REDIRECT
    return Recommendation.SELL


def _wait_conditions_met(
    farmer: FarmerRequest,
    context: IntelligenceContext,
    fair_price: FairPriceResult,
) -> bool:
    perishability = context.crop_perishability or _get_crop_profile(farmer.crop).perishability
    storage = context.storage_available
    urgency = context.urgency or farmer.urgency
    weather = context.weather_risk
    price_trend = context.price.trend if context.price else None
    demand_trend = context.demand.trend if context.demand else None
    strong_offer = (
        fair_price.difference_percent is not None
        and fair_price.difference_percent >= STRONG_OFFER_ABOVE_BENCHMARK_PERCENT
    )
    return (
        price_trend == Trend.RISING
        and demand_trend == DemandTrend.INCREASING
        and perishability in {RiskLevel.LOW, RiskLevel.MEDIUM}
        and storage is True
        and urgency == RiskLevel.LOW
        and weather == RiskLevel.LOW
        and not strong_offer
    )


def _data_quality(context: IntelligenceContext) -> DataQuality:
    missing = []
    if context.transport_available is not True:
        missing.append("transport.cost_per_km_per_kg")
    if context.government_benchmark is None:
        missing.append("government_price")
    if context.price is None:
        missing.append("price_history")
    else:
        if context.price.trend is None:
            missing.append("price_history.trend")
        if context.price.average_price_per_kg is None:
            missing.append("price_history.average_price_per_kg")
        if context.price.history_days is None:
            missing.append("price_history.history_days")
    if context.demand is None:
        missing.append("demand")
    else:
        if context.demand.level is None:
            missing.append("demand.level")
        if context.demand.trend is None:
            missing.append("demand.trend")
    if context.weather_risk is None:
        missing.append("weather.risk_level")
    if context.crop_perishability is None:
        missing.append("crop_properties.perishability")
    if context.storage_available is None:
        missing.append("crop_properties.storage_available")
    if context.urgency is None:
        missing.append("farmer.urgency")

    confidence = "high" if len(missing) <= 1 else "medium" if len(missing) <= 4 else "low"
    return DataQuality(confidence=confidence, missing_fields=missing)


def _benchmark_score(
    option: SellingOption,
    benchmark: GovernmentBenchmark | None,
) -> tuple[float, list[str], list[str]]:
    fair = evaluate_fair_price(option.offered_price_per_kg, benchmark)
    if fair.status == FairPriceStatus.UNAVAILABLE:
        return 0.0, ["Government benchmark data unavailable."], ["Government benchmark data unavailable."]
    if fair.difference_percent is not None and fair.difference_percent >= 0:
        return SCORING_WEIGHTS["benchmark"], ["Offer is above government modal price."], []
    if fair.status == FairPriceStatus.FAIR:
        return SCORING_WEIGHTS["benchmark"] * 0.75, ["Offer is close to government modal price."], []
    if fair.status == FairPriceStatus.WARNING:
        return SCORING_WEIGHTS["benchmark"] * 0.45, ["Offer is below government modal price."], [fair.alert or "Offer is below benchmark."]
    if fair.status == FairPriceStatus.UNFAIR:
        return SCORING_WEIGHTS["benchmark"] * 0.2, ["Offer is materially below government modal price."], [fair.alert or "Offer is unfair."]
    return 0.0, ["Offer is far below government modal price."], [fair.alert or "High-risk low offer."]


def _trend_score(price: PriceIntelligence | None) -> tuple[float, list[str]]:
    if price is None or price.trend is None:
        return 0.0, ["Price trend data unavailable."]
    if price.trend == Trend.RISING:
        return SCORING_WEIGHTS["price_trend"], ["Price trend is rising."]
    if price.trend == Trend.STABLE:
        return SCORING_WEIGHTS["price_trend"] * 0.6, ["Price trend is stable."]
    if price.trend == Trend.FALLING:
        return SCORING_WEIGHTS["price_trend"] * 0.25, ["Price trend is falling."]
    return 0.0, ["Price trend data unavailable."]


def _demand_score(demand: DemandIntelligence | None) -> tuple[float, list[str]]:
    if demand is None:
        return 0.0, ["Demand intelligence unavailable."]
    score = 0.0
    reasons = []
    if demand.level == DemandLevel.HIGH:
        score += SCORING_WEIGHTS["demand"] * 0.55
        reasons.append("Demand level is high.")
    elif demand.level == DemandLevel.MEDIUM:
        score += SCORING_WEIGHTS["demand"] * 0.35
        reasons.append("Demand level is medium.")
    elif demand.level == DemandLevel.LOW:
        score += SCORING_WEIGHTS["demand"] * 0.1
        reasons.append("Demand level is low.")
    if demand.trend == DemandTrend.INCREASING:
        score += SCORING_WEIGHTS["demand"] * 0.45
        reasons.append("Demand is increasing.")
    elif demand.trend == DemandTrend.STABLE:
        score += SCORING_WEIGHTS["demand"] * 0.3
        reasons.append("Demand is stable.")
    elif demand.trend == DemandTrend.DECREASING:
        score += SCORING_WEIGHTS["demand"] * 0.1
        reasons.append("Demand is decreasing.")
    return min(score, SCORING_WEIGHTS["demand"]), reasons


def _weather_score(weather: RiskLevel | None) -> tuple[float, list[str], list[str]]:
    if weather is None:
        return 0.0, ["Weather risk data unavailable."], ["Weather risk data unavailable."]
    if weather == RiskLevel.LOW:
        return SCORING_WEIGHTS["weather"], ["Weather risk is low."], []
    if weather == RiskLevel.MEDIUM:
        return SCORING_WEIGHTS["weather"] * 0.5, ["Weather risk is medium."], []
    return 0.0, ["Weather risk is high."], ["Weather risk is high."]


def _storage_score(context: IntelligenceContext) -> tuple[float, list[str], list[str]]:
    perishability = context.crop_perishability
    storage = context.storage_available
    if perishability is None or storage is None:
        return (
            0.0,
            ["Storage availability or crop perishability is unknown."],
            ["Storage availability or crop perishability is unknown."],
        )
    if perishability == RiskLevel.HIGH and not storage:
        return 0.0, ["High perishability makes waiting risky."], ["High perishability and no storage increase risk."]
    if storage:
        return SCORING_WEIGHTS["storage_perishability"], ["Storage is available."], []
    return SCORING_WEIGHTS["storage_perishability"] * 0.3, ["Storage is unavailable."], ["Storage is unavailable."]


def _verification_score(option: SellingOption) -> float:
    if option.option_type == SellingOptionType.MARKET:
        return 1.0
    return 1.0 if option.verified else 0.25


def _candidate_net_profit(farmer: FarmerRequest, option: SellingOption) -> float | None:
    if option.transport_cost is None:
        return None
    return option.offered_price_per_kg * farmer.quantity_kg - option.transport_cost - farmer.expected_market_fee


def _scale(value: float, minimum: float, maximum: float) -> float:
    if maximum == minimum:
        return 1.0
    return _clamp((value - minimum) / (maximum - minimum), 0, 1)


def _clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(maximum, value))


def _candidate_id(option: SellingOption) -> str:
    return option.candidate_id or option.name


def _market_insights(context: IntelligenceContext) -> dict[str, str | float | int | None]:
    price = context.price
    demand = context.demand
    return {
        "price_trend": price.trend.value if price and price.trend else None,
        "average_historical_price_per_kg": price.average_price_per_kg if price else None,
        "history_days": price.history_days if price else None,
        "government_modal_price_per_kg": (
            context.government_benchmark.average_price_per_kg if context.government_benchmark else None
        ),
        "demand_level": demand.level.value if demand and demand.level else None,
        "demand_trend": demand.trend.value if demand and demand.trend else None,
    }


def _format_government_price(decision: SellingDecision) -> str:
    if decision.government_average_price_per_kg is None:
        return "- Government benchmark: unavailable"
    return f"- Government modal benchmark: INR {decision.government_average_price_per_kg:.2f}/kg"


def _format_net_profit(net_value: float | None) -> str:
    if net_value is None:
        return "- Estimated net profit: unavailable because transport cost is unavailable"
    return f"- Estimated net profit: INR {net_value:,.2f}"


def _get_crop_profile(crop: str) -> CropProfile:
    normalized = crop.strip().lower()
    return CROP_PROFILES.get(
        normalized,
        CropProfile("unknown", RiskLevel.MEDIUM, None, "No validated profile yet; use caution."),
    )


def calculate_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius_km = 6371.0
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return round(2 * radius_km * asin(sqrt(a)), 2)
