from __future__ import annotations

from datetime import date
from typing import Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator, model_validator

from agrilink_ai.decision_engine import (
    DemandIntelligence,
    DemandLevel,
    DemandTrend,
    FarmerRequest,
    GovernmentBenchmark,
    IntelligenceContext,
    PriceIntelligence,
    RecommendationResponse,
    RiskLevel,
    SellingOption,
    SellingOptionType,
    Trend,
    calculate_distance_km,
    recommend_selling_decision,
)


app = FastAPI(
    title="AgriLink AI Marketplace Intelligence",
    version="0.1.0",
)


class FarmerInput(BaseModel):
    latitude: float
    longitude: float
    district: str | None = None
    state: str | None = None
    urgency: RiskLevel | None = None


class CropInput(BaseModel):
    name: str = Field(min_length=1)
    quantity_kg: float = Field(gt=0)


class CandidateInput(BaseModel):
    id: str = Field(min_length=1)
    name: str = Field(min_length=1)
    type: SellingOptionType = SellingOptionType.BUYER
    latitude: float
    longitude: float
    offered_price_per_kg: float | None = Field(default=None, gt=0)
    verified: bool = False

    @model_validator(mode="after")
    def require_candidate_price(self) -> "CandidateInput":
        if self.offered_price_per_kg is None:
            raise ValueError(
                "candidate.offered_price_per_kg is required for ranking; Python will not fabricate a market price"
            )
        return self


class GovernmentPriceInput(BaseModel):
    min_price_per_kg: float | None = Field(default=None, gt=0)
    modal_price_per_kg: float = Field(gt=0)
    max_price_per_kg: float | None = Field(default=None, gt=0)
    source: str = "AGMARKNET"
    date: date


class PriceHistoryInput(BaseModel):
    trend: Trend | None = None
    average_price_per_kg: float | None = Field(default=None, gt=0)
    history_days: int | None = Field(default=None, gt=0)


class DemandInput(BaseModel):
    level: DemandLevel | None = None
    trend: DemandTrend | None = None


class TransportInput(BaseModel):
    cost_per_km_per_kg: float = Field(ge=0)


class WeatherInput(BaseModel):
    risk_level: RiskLevel | None = None


class CropPropertiesInput(BaseModel):
    perishability: RiskLevel | None = None
    storage_available: bool | None = None


class RecommendRequest(BaseModel):
    farmer: FarmerInput
    crop: CropInput
    candidates: list[CandidateInput] = Field(min_length=1)
    government_price: GovernmentPriceInput | None = None
    price_history: PriceHistoryInput | None = None
    demand: DemandInput | None = None
    transport: TransportInput | None = None
    weather: WeatherInput | None = None
    crop_properties: CropPropertiesInput | None = None

    @field_validator("candidates")
    @classmethod
    def validate_candidates(cls, value: list[CandidateInput]) -> list[CandidateInput]:
        if not value:
            raise ValueError("At least one candidate buyer or market is required")
        return value


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    _request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    message = "; ".join(_format_validation_error(error) for error in exc.errors())
    return JSONResponse(
        status_code=400,
        content={"status": "error", "error": {"code": "INVALID_REQUEST", "message": message}},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(_request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "error": {"code": "INTERNAL_ERROR", "message": "Unexpected recommendation service error"},
        },
    )


@app.post("/api/v1/recommend")
def recommend(request: RecommendRequest) -> dict[str, Any]:
    try:
        farmer = _to_farmer_request(request)
        candidates = _to_selling_options(request)
        context = _to_context(request)
        response = recommend_selling_decision(farmer, candidates, context)
        return _response_to_dict(response)
    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail={"code": "INSUFFICIENT_DATA", "message": str(exc)},
        ) from exc


@app.exception_handler(HTTPException)
async def http_exception_handler(_request: Request, exc: HTTPException) -> JSONResponse:
    detail = exc.detail if isinstance(exc.detail, dict) else {"code": "REQUEST_ERROR", "message": str(exc.detail)}
    return JSONResponse(status_code=exc.status_code, content={"status": "error", "error": detail})


def _to_farmer_request(request: RecommendRequest) -> FarmerRequest:
    properties = request.crop_properties
    return FarmerRequest(
        crop=request.crop.name,
        quantity_kg=request.crop.quantity_kg,
        location_name=", ".join(
            part for part in [request.farmer.district, request.farmer.state] if part
        )
        or "Unknown farmer location",
        urgency=request.farmer.urgency,
        storage_available=properties.storage_available if properties else None,
        state=request.farmer.state,
        district=request.farmer.district,
        gps_latitude=request.farmer.latitude,
        gps_longitude=request.farmer.longitude,
    )


def _to_selling_options(request: RecommendRequest) -> list[SellingOption]:
    options = []
    for candidate in request.candidates:
        distance_km = calculate_distance_km(
            request.farmer.latitude,
            request.farmer.longitude,
            candidate.latitude,
            candidate.longitude,
        )
        transport_cost = None
        if request.transport is not None:
            transport_cost = distance_km * request.crop.quantity_kg * request.transport.cost_per_km_per_kg
        options.append(
            SellingOption(
                candidate_id=candidate.id,
                name=candidate.name,
                option_type=candidate.type,
                district=request.farmer.district or "",
                state=request.farmer.state or "",
                offered_price_per_kg=candidate.offered_price_per_kg,
                distance_km=distance_km,
                transport_cost=round(transport_cost, 2) if transport_cost is not None else None,
                location_name=candidate.name,
                verified=candidate.verified,
                source="backend candidate",
            )
        )
    return options


def _to_context(request: RecommendRequest) -> IntelligenceContext:
    government = None
    if request.government_price:
        government = GovernmentBenchmark(
            crop=request.crop.name,
            district=request.farmer.district or "",
            state=request.farmer.state or "",
            average_price_per_kg=request.government_price.modal_price_per_kg,
            min_price_per_kg=request.government_price.min_price_per_kg,
            max_price_per_kg=request.government_price.max_price_per_kg,
            price_date=request.government_price.date,
            source=request.government_price.source,
        )
    price = None
    if request.price_history:
        price = PriceIntelligence(
            trend=request.price_history.trend,
            average_price_per_kg=request.price_history.average_price_per_kg,
            history_days=request.price_history.history_days,
            government_modal_price_per_kg=government.average_price_per_kg if government else None,
        )
    demand = None
    if request.demand:
        demand = DemandIntelligence(level=request.demand.level, trend=request.demand.trend)
    properties = request.crop_properties
    return IntelligenceContext(
        government_benchmark=government,
        price=price,
        demand=demand,
        transport_available=request.transport is not None,
        weather_risk=request.weather.risk_level if request.weather else None,
        crop_perishability=properties.perishability if properties else None,
        storage_available=properties.storage_available if properties else None,
        urgency=request.farmer.urgency,
    )


def _response_to_dict(response: RecommendationResponse) -> dict[str, Any]:
    return {
        "status": response.status,
        "recommendation": {
            "decision": response.recommendation.decision.value,
            "best_buyer_id": response.recommendation.best_buyer_id,
            "best_buyer_name": response.recommendation.best_buyer_name,
            "best_market_id": response.recommendation.best_market_id,
            "best_market_name": response.recommendation.best_market_name,
            "decision_score": response.recommendation.decision_score,
            "estimated_net_profit": response.recommendation.estimated_net_profit,
        },
        "fair_price": {
            "government_modal_price_per_kg": response.fair_price.government_modal_price_per_kg,
            "buyer_offer_price_per_kg": response.fair_price.buyer_offer_price_per_kg,
            "difference_percent": response.fair_price.difference_percent,
            "status": response.fair_price.status.value,
            "alert": response.fair_price.alert,
        },
        "rankings": [
            {
                "candidate_id": item.candidate_id,
                "candidate_name": item.candidate_name,
                "candidate_type": item.candidate_type.value,
                "rank": item.rank,
                "price_per_kg": item.price_per_kg,
                "distance_km": item.distance_km,
                "transport_cost": item.transport_cost,
                "estimated_net_profit": item.estimated_net_profit,
                "decision_score": item.decision_score,
                "reasons": item.reasons,
            }
            for item in response.rankings
        ],
        "market_insights": response.market_insights,
        "alerts": response.alerts,
        "data_quality": {
            "confidence": response.data_quality.confidence,
            "missing_fields": response.data_quality.missing_fields,
        },
    }


def _format_validation_error(error: dict[str, Any]) -> str:
    loc = ".".join(str(part) for part in error.get("loc", []) if part != "body")
    message = error.get("msg", "Invalid request")
    return f"{loc}: {message}" if loc else message
