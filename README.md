# AgriLink AI

Explainable Marketplace Intelligence prototype for SIH Problem Statement 26132:
strengthening market linkages and price discovery for farmers.

The current prototype scope is Maharashtra use-cases. Demo values are sample data
only and must not be treated as live AGMARKNET or government market values.

## Architecture

The TypeScript backend owns farmer/buyer databases, candidate discovery,
geographic eligibility filtering, MongoDB records, government data ingestion,
buyer demand records, and market records.

This Python package ranks backend-supplied buyer/market candidates and returns:

- normalized `decision_score` from 0 to 100
- monetary `estimated_net_profit` in INR
- best buyer or market recommendation
- fair-price status against the government modal benchmark
- SELL / WAIT / REDIRECT recommendation
- explainable reasons, alerts, and data-quality reporting

The current SELL / WAIT / REDIRECT intelligence is deterministic,
explainable rule-based logic. It is not validated future-price prediction and
does not claim forecasting accuracy.

## Package Structure

```text
src/agrilink_ai/
  decision_engine.py   Core scoring, ranking, fairness, and recommendation logic
  api.py               FastAPI request/response boundary
  sample_data.py       Maharashtra-only sample/demo inputs
  __init__.py          Package marker
```

## Install

```powershell
python -m pip install -e ".[dev]"
```

## Run Tests

```powershell
python -m pytest
```

## Run Demo

```powershell
python examples/run_decision_demo.py
```

## Start FastAPI

```powershell
python -m uvicorn agrilink_ai.api:app --host 127.0.0.1 --port 8000
```

Endpoint:

```text
POST http://localhost:8000/api/v1/recommend
```

## Example Request

```json
{
  "farmer": {
    "latitude": 20.081,
    "longitude": 74.109,
    "district": "Nashik",
    "state": "Maharashtra",
    "urgency": "medium"
  },
  "crop": {
    "name": "Onion",
    "quantity_kg": 1000
  },
  "candidates": [
    {
      "id": "buyer_nashik_001",
      "name": "Nashik Onion Traders",
      "type": "buyer",
      "latitude": 20.15,
      "longitude": 74.23,
      "offered_price_per_kg": 35,
      "verified": true
    }
  ],
  "government_price": {
    "min_price_per_kg": 28,
    "modal_price_per_kg": 32,
    "max_price_per_kg": 36,
    "source": "sample AGMARKNET-like benchmark",
    "date": "2026-09-02"
  },
  "price_history": {
    "trend": "rising",
    "average_price_per_kg": 30,
    "history_days": 7
  },
  "demand": {
    "level": "high",
    "trend": "increasing"
  },
  "transport": {
    "cost_per_km_per_kg": 0.05
  },
  "weather": {
    "risk_level": "low"
  },
  "crop_properties": {
    "perishability": "medium",
    "storage_available": true
  }
}
```

## Example Response

```json
{
  "status": "success",
  "recommendation": {
    "decision": "SELL",
    "best_buyer_id": "buyer_nashik_001",
    "best_buyer_name": "Nashik Onion Traders",
    "best_market_id": null,
    "best_market_name": null,
    "decision_score": 95.0,
    "estimated_net_profit": 34334.0
  },
  "fair_price": {
    "government_modal_price_per_kg": 32.0,
    "buyer_offer_price_per_kg": 35.0,
    "difference_percent": 9.38,
    "status": "FAIR",
    "alert": null
  },
  "rankings": [
    {
      "candidate_id": "buyer_nashik_001",
      "candidate_name": "Nashik Onion Traders",
      "candidate_type": "buyer",
      "rank": 1,
      "price_per_kg": 35.0,
      "distance_km": 14.78,
      "transport_cost": 739.0,
      "estimated_net_profit": 34261.0,
      "decision_score": 98.74,
      "reasons": [
        "Offer is above government modal price",
        "Buyer is nearby",
        "Buyer is verified",
        "Highest estimated net value among supplied candidates"
      ]
    }
  ],
  "market_insights": {
    "price_trend": "rising",
    "average_historical_price_per_kg": 30.0,
    "history_days": 7,
    "government_modal_price_per_kg": 32.0,
    "demand_level": "high",
    "demand_trend": "increasing"
  },
  "alerts": [],
  "data_quality": {
    "confidence": "high",
    "missing_fields": []
  }
}
```

`rankings` includes candidate id, type, rank, price, distance, transport cost,
INR net profit, 0-100 decision score, and farmer-readable reasons.
