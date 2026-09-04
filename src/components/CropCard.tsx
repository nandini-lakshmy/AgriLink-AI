import {
  Package,
  MessageSquare,
  MoreVertical,
} from "lucide-react";

interface CropCardProps {
  name: string;
  quantity: string;
  offers: number;
  image?: string;
  price?: string;
  status?: "Active" | "Sold" | "Pending";
  posted?: string;
  onView?: () => void;
  onEdit?: () => void;
}

export default function CropCard({
  name,
  quantity,
  offers,
  image,
  price = "₹32/kg",
  status = "Active",
  posted = "Posted recently",
  onView,
  onEdit,
}: CropCardProps) {
  return (
    <article className="component-crop-card">

      <div className="component-crop-image">

        {image ? (
          <img
            src={image}
            alt={name}
          />
        ) : (
          <Package size={30} />
        )}

      </div>

      <div className="component-crop-content">

        <div className="component-crop-top">

          <div>
            <h3>{name}</h3>

            <span>
              {posted}
            </span>
          </div>

          <span
            className={`crop-status crop-status-${status.toLowerCase()}`}
          >
            {status}
          </span>

        </div>

        <div className="component-crop-info">

          <div>
            <span>Quantity</span>
            <strong>{quantity}</strong>
          </div>

          <div>
            <span>Expected Price</span>
            <strong>{price}</strong>
          </div>

          <div>
            <span>Offers</span>
            <strong>{offers}</strong>
          </div>

        </div>

        <div className="component-crop-actions">

          <button
            type="button"
            onClick={onView}
          >
            <MessageSquare size={14} />
            {offers} Offers
          </button>

          <button
            type="button"
            className="crop-edit-button"
            onClick={onEdit}
            aria-label={`Edit ${name} listing`}
          >
            <MoreVertical size={17} />
          </button>

        </div>

      </div>

    </article>
  );
}