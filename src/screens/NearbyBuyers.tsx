import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  SlidersHorizontal,
  Phone,
  MapPin,
  Navigation,
  Star,
  Store,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

import abc from "../assets/abc-traders.png";
import xyz from "../assets/xyz-market.png";
import freshmart from "../assets/freshmart.png";


/* =========================================================
   BUYER DATA
========================================================= */

const buyers = [
  {
    id: 1,
    name: "ABC Traders",
    place: "Perumbavoor Market",
    distance: 2,
    price: 32,
    image: abc,
    type: "Wholesale Buyer",
    rating: 4.8,
    verified: true,
  },
  {
    id: 2,
    name: "XYZ Market",
    place: "Aluva",
    distance: 5,
    price: 31,
    image: xyz,
    type: "Wholesale Market",
    rating: 4.6,
    verified: true,
  },
  {
    id: 3,
    name: "FreshMart",
    place: "Kochi",
    distance: 12,
    price: 30,
    image: freshmart,
    type: "Retail Chain",
    rating: 4.5,
    verified: true,
  },
];


/* =========================================================
   PAGE
========================================================= */

export default function NearbyBuyers() {

  const navigate = useNavigate();

  const [filter, setFilter] = useState<
    "all" | "price" | "distance"
  >("all");


  /* =======================================================
     SORT BUYERS
  ======================================================= */

  const sortedBuyers = useMemo(() => {

    const result = [...buyers];

    if (filter === "price") {
      result.sort((a, b) => b.price - a.price);
    }

    if (filter === "distance") {
      result.sort((a, b) => a.distance - b.distance);
    }

    return result;

  }, [filter]);


  /* =======================================================
     CALL BUYER
  ======================================================= */

  const handleCall = (buyerName: string) => {

    alert(
      `Calling ${buyerName}...\n\nContact functionality will be connected during backend integration.`
    );

  };


  return (
    <div className="nearby-buyers-page">


      {/* =================================================
          TOP HEADER
      ================================================= */}

      <header className="nearby-header">

        <button
          className="nearby-back-button"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={19} />

          <span>Back</span>
        </button>


        <div className="nearby-title">

          <div className="nearby-title-icon">
            <Store size={22} />
          </div>

          <div>
            <h1>Nearby Buyers</h1>

            <p>
              Find trusted buyers and better prices near you
            </p>
          </div>

        </div>


        <button className="nearby-filter-icon">
          <SlidersHorizontal size={19} />
        </button>

      </header>


      {/* =================================================
          LOCATION BAR
      ================================================= */}

      <div className="nearby-location-bar">

        <div className="nearby-location-left">

          <div className="nearby-location-icon">
            <Navigation size={17} />
          </div>

          <div>

            <span>Your Location</span>

            <strong>
              Perumbavoor, Kerala
            </strong>

          </div>

        </div>


        <button
          onClick={() => navigate("/farmer/map")}
          className="nearby-map-link"
        >
          <MapPin size={16} />
          View Map
        </button>

      </div>


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="nearby-summary">

        <div>
          <strong>{buyers.length}</strong>
          <span>Buyers Found</span>
        </div>

        <div>
          <strong>₹32/kg</strong>
          <span>Highest Offer</span>
        </div>

        <div>
          <strong>2 km</strong>
          <span>Nearest Buyer</span>
        </div>

        <div>
          <strong>4.8 ★</strong>
          <span>Top Rating</span>
        </div>

      </div>


      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="nearby-filter-section">

        <div>

          <h2>Buyers near you</h2>

          <p>
            Compare prices, distance and buyer ratings.
          </p>

        </div>


        <div className="nearby-filter-buttons">

          <button
            className={
              filter === "all"
                ? "active"
                : ""
            }
            onClick={() => setFilter("all")}
          >
            All Buyers
          </button>


          <button
            className={
              filter === "price"
                ? "active"
                : ""
            }
            onClick={() => setFilter("price")}
          >
            <TrendingUp size={15} />
            Highest Price
          </button>


          <button
            className={
              filter === "distance"
                ? "active"
                : ""
            }
            onClick={() => setFilter("distance")}
          >
            <Navigation size={15} />
            Nearest
          </button>

        </div>

      </div>


      {/* =================================================
          BUYERS
      ================================================= */}

      <div className="nearby-buyers-grid">

        {sortedBuyers.map((buyer) => (

          <div
            className="nearby-buyer-card"
            key={buyer.id}
          >

            {/* CARD TOP */}

            <div className="nearby-buyer-top">

              <div className="nearby-buyer-profile">

                <div className="nearby-buyer-image">

                  <img
                    src={buyer.image}
                    alt={buyer.name}
                  />

                </div>


                <div className="nearby-buyer-name">

                  <div className="nearby-buyer-name-row">

                    <h3>
                      {buyer.name}
                    </h3>

                    {buyer.verified && (
                      <CheckCircle2
                        size={16}
                        className="verified-icon"
                      />
                    )}

                  </div>

                  <span>
                    {buyer.type}
                  </span>

                </div>

              </div>


              <div className="nearby-distance">

                <Navigation size={14} />

                {buyer.distance} km

              </div>

            </div>


            {/* LOCATION */}

            <div className="nearby-buyer-location">

              <MapPin size={15} />

              <span>
                {buyer.place}
              </span>

            </div>


            {/* DIVIDER */}

            <div className="nearby-card-divider" />


            {/* PRICE */}

            <div className="nearby-price-section">

              <div>

                <span className="nearby-price-label">
                  Offered Price
                </span>

                <strong>
                  ₹{buyer.price}
                  <small>/kg</small>
                </strong>

              </div>


              <div className="nearby-best-price">

                <TrendingUp size={15} />

                Best Price

              </div>

            </div>


            {/* RATING */}

            <div className="nearby-buyer-meta">

              <div className="nearby-rating">

                <Star size={14} fill="currentColor" />

                <strong>
                  {buyer.rating}
                </strong>

                <span>
                  Buyer rating
                </span>

              </div>


              <span className="nearby-trusted">
                <CheckCircle2 size={13} />
                Verified Buyer
              </span>

            </div>


            {/* ACTIONS */}

            <div className="nearby-buyer-actions">

              <button
                className="nearby-call-button"
                onClick={() =>
                  handleCall(buyer.name)
                }
              >
                <Phone size={16} />
                Call Buyer
              </button>


              <button
                className="nearby-view-button"
                onClick={() =>
                  navigate("/farmer/map")
                }
              >
                <MapPin size={16} />
                Location
              </button>

            </div>

          </div>

        ))}

      </div>


      {/* =================================================
          BOTTOM MAP CTA
      ================================================= */}

      <div className="nearby-map-cta">

        <div className="nearby-map-cta-icon">
          <MapPin size={24} />
        </div>

        <div>

          <strong>
            Explore buyers on the map
          </strong>

          <span>
            See nearby markets, buyers and their locations.
          </span>

        </div>


        <button
          onClick={() => navigate("/farmer/map")}
        >
          View Full Map
          <ArrowLeft size={17} />
        </button>

      </div>

    </div>
  );
}