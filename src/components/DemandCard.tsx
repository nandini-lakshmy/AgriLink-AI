import {
  TrendingUp,
  MapPin,
  Package,
  ArrowRight,
} from "lucide-react";

interface DemandCardProps {
  crop: string;
  quantity: string;
  price: string;
  location: string;
  offers?: number;
  demand?: "High Demand" | "Medium Demand" | "Low Demand";
  image?: string;
  onView?: () => void;
}

export default function DemandCard({
  crop,
  quantity,
  price,
  location,
  offers = 0,
  demand = "High Demand",
  image,
  onView,
}: DemandCardProps) {
  return (
    <article className="component-demand-card">

      <div className="component-demand-image">

        {image ? (
          <img
            src={image}
            alt={crop}
          />
        ) : (
          <Package size={28} />
        )}

      </div>

      <div className="component-demand-content">

        <div className="component-demand-heading">

          <div>
            <span className="component-demand-label">
              CROP REQUIREMENT
            </span>

            <h3>{crop}</h3>
          </div>

          <span className="demand-badge">
            <TrendingUp size={12} />
            {demand}
          </span>

        </div>

        <div className="component-demand-details">

          <div>
            <span>Required</span>
            <strong>{quantity}</strong>
          </div>

          <div>
            <span>Offered Price</span>
            <strong className="demand-price">
              {price}
            </strong>
          </div>

          <div>
            <span>Location</span>
            <strong className="demand-location">
              <MapPin size={13} />
              {location}
            </strong>
          </div>

        </div>

        <div className="component-demand-footer">

          <span>
            {offers} offers received
          </span>

          <button
            type="button"
            onClick={onView}
          >
            View Requirement
            <ArrowRight size={14} />
          </button>

        </div>

      </div>

    </article>
  );
}