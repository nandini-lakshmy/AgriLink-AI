import {
  ArrowLeft,
  Plus,
  Minus,
  LocateFixed,
} from "lucide-react";

import mapReference from "../assets/map-reference.png";

export default function MapView() {
  return (
    <div className="map-view">

      <header className="map-header">

        <ArrowLeft size={18} />

        <strong>Map View</strong>

      </header>

      <img
        src={mapReference}
        className="map-image"
        alt="Market map"
      />

      <div className="map-controls">

        <button>
          <Plus size={17} />
        </button>

        <button>
          <Minus size={17} />
        </button>

        <button>
          <LocateFixed size={16} />
        </button>

      </div>

    </div>
  );
}