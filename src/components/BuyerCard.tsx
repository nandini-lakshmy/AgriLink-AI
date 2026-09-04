import {
  MapPin,
  Phone,
  IndianRupee,
  Navigation,
} from "lucide-react";

interface BuyerCardProps {
  name: string;
  location: string;
  distance: string;
  price: string;
  type?: string;
  image?: string;
  onCall?: () => void;
  onView?: () => void;
}

export default function BuyerCard({
  name,
  location,
  distance,
  price,
  type = "Verified Buyer",
  image,
  onCall,
  onView,
}: BuyerCardProps) {
  return (
    <article className="component-buyer-card">

      <div className="component-buyer-main">

        <div className="component-buyer-avatar">

          {image ? (
            <img
              src={image}
              alt={`${name} logo`}
            />
          ) : (
            <span>
              {name.charAt(0).toUpperCase()}
            </span>
          )}

        </div>

        <div className="component-buyer-details">

          <div className="component-buyer-title">
            <strong>{name}</strong>

            <span className="verified-badge">
              ✓ Verified
            </span>
          </div>

          <span className="component-buyer-type">
            {type}
          </span>

          <div className="component-buyer-location">

            <span>
              <MapPin size={13} />
              {location}
            </span>

            <span>
              <Navigation size={12} />
              {distance}
            </span>

          </div>

        </div>

      </div>

      <div className="component-buyer-price">

        <span>Buying Price</span>

        <strong>
          <IndianRupee size={16} />
          {price.replace("₹", "").replace("/kg", "")}
          <small>/kg</small>
        </strong>

      </div>

      <div className="component-buyer-actions">

        <button
          type="button"
          className="component-secondary-button"
          onClick={onView}
        >
          View Details
        </button>

        <button
          type="button"
          className="component-primary-button"
          onClick={onCall}
        >
          <Phone size={14} />
          Contact
        </button>

      </div>

    </article>
  );
}