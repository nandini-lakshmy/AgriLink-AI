import {
  ArrowLeft,
  Lightbulb,
  TrendingUp,
} from "lucide-react";

import onion from "../assets/onion.png";
import tomato from "../assets/tomato.png";
import chilli from "../assets/chilli.png";

const crops = [
  {
    rank: 1,
    name: "Onion",
    demand: "High Demand",
    image: onion,
  },
  {
    rank: 2,
    name: "Tomato",
    demand: "High Demand",
    image: tomato,
  },
  {
    rank: 3,
    name: "Chilli",
    demand: "Medium Demand",
    image: chilli,
  },
];

export default function CropDemand() {
  return (
    <div className="crop-demand">

      <header className="demand-header">

        <div>
          <ArrowLeft size={16} />
          <strong>Crop Demand Insights</strong>
        </div>

        <span>This Week ▾</span>

      </header>

      <small className="ai-label">
        (AI Powered)
      </small>

      <div className="demand-list">

        {crops.map((crop) => (

          <div
            className="demand-item"
            key={crop.name}
          >

            <img src={crop.image} />

            <strong className="rank">
              {crop.rank}
            </strong>

            <div>
              <strong>{crop.name}</strong>
              <small>{crop.demand}</small>
            </div>

            <TrendingUp
              size={17}
              className="trend-icon"
            />

          </div>

        ))}

      </div>

      <div className="demand-tip">

        <Lightbulb size={22} />

        <div>
          <strong>Tip for You</strong>

          <p>
            Onion demand is high in your area.
            Good time to sell!
          </p>
        </div>

      </div>

    </div>
  );
}