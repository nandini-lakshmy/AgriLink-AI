import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Plus,
  Search,
  SlidersHorizontal,
  MoreVertical,
  MessageSquare,
  Eye,
  Pencil,
  Trash2,
  TrendingUp,
  Package,
  Clock3,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import onion from "../assets/onion.png";
import tomato from "../assets/tomato.png";
import chilli from "../assets/chilli.png";


/* =========================================================
   LISTING DATA
========================================================= */

const listings = [
  {
    id: 1,
    crop: "Onion",
    category: "Vegetable",
    quantity: "1000 kg",
    price: "₹32/kg",
    numericPrice: 32,
    offers: 5,
    status: "Active",
    posted: "2 hours ago",
    image: onion,
  },
  {
    id: 2,
    crop: "Tomato",
    category: "Vegetable",
    quantity: "500 kg",
    price: "₹25/kg",
    numericPrice: 25,
    offers: 3,
    status: "Active",
    posted: "1 day ago",
    image: tomato,
  },
  {
    id: 3,
    crop: "Chilli",
    category: "Vegetable",
    quantity: "200 kg",
    price: "₹120/kg",
    numericPrice: 120,
    offers: 2,
    status: "Active",
    posted: "3 days ago",
    image: chilli,
  },
];


/* =========================================================
   PAGE
========================================================= */

export default function FarmerListings() {

  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState<
    "all" | "price" | "offers"
  >("all");


  /* =======================================================
     FILTER + SEARCH
  ======================================================= */

  const filteredListings = useMemo(() => {

    let result = [...listings];

    if (search.trim()) {

      const query = search.toLowerCase();

      result = result.filter((listing) =>
        listing.crop.toLowerCase().includes(query)
      );

    }

    if (filter === "price") {

      result.sort(
        (a, b) => b.numericPrice - a.numericPrice
      );

    }

    if (filter === "offers") {

      result.sort(
        (a, b) => b.offers - a.offers
      );

    }

    return result;

  }, [search, filter]);


  /* =======================================================
     ACTIONS
  ======================================================= */

  const handleDelete = (crop: string) => {

    const confirmed = window.confirm(
      `Remove the ${crop} listing?`
    );

    if (confirmed) {
      alert(
        `${crop} listing removed.\n\nThis will be connected to the backend later.`
      );
    }

  };


  const handleMessage = (crop: string) => {

    alert(
      `Messages for ${crop}\n\nBuyer messaging will be connected during backend integration.`
    );

  };


  return (
    <div className="farmer-listings-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <header className="listings-header">

        <button
          className="listings-back-button"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={19} />
          <span>Back</span>
        </button>


        <div className="listings-title">

          <div className="listings-title-icon">
            <Package size={23} />
          </div>

          <div>

            <h1>My Listings</h1>

            <p>
              Manage the crops you currently have available
              for sale.
            </p>

          </div>

        </div>


        <button
          className="listings-create-button"
          onClick={() =>
            navigate("/farmer/listing/new")
          }
        >
          <Plus size={18} />
          Sell New Crop
        </button>

      </header>


      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <section className="listings-summary">

        <div className="listing-summary-card">

          <div className="listing-summary-icon">
            <Package size={20} />
          </div>

          <div>
            <span>Total Listings</span>
            <strong>3</strong>
          </div>

        </div>


        <div className="listing-summary-card">

          <div className="listing-summary-icon">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <span>Active Listings</span>
            <strong>3</strong>
          </div>

        </div>


        <div className="listing-summary-card">

          <div className="listing-summary-icon">
            <MessageSquare size={20} />
          </div>

          <div>
            <span>Total Offers</span>
            <strong>10</strong>
          </div>

        </div>


        <div className="listing-summary-card highlight">

          <div className="listing-summary-icon">
            <TrendingUp size={20} />
          </div>

          <div>
            <span>Best Offer</span>
            <strong>₹32/kg</strong>
          </div>

        </div>

      </section>


      {/* =================================================
          LISTING SECTION HEADER
      ================================================= */}

      <section className="listings-section">

        <div className="listings-section-heading">

          <div>

            <h2>Active Crop Listings</h2>

            <p>
              {filteredListings.length} listing
              {filteredListings.length !== 1
                ? "s"
                : ""}
              {" "}available in your marketplace.
            </p>

          </div>


          {/* SEARCH */}

          <div className="listings-tools">

            <div className="listings-search">

              <Search size={17} />

              <input
                type="text"
                placeholder="Search crops..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

            </div>


            <button className="listings-filter-icon">
              <SlidersHorizontal size={17} />
            </button>

          </div>

        </div>


        {/* =================================================
            FILTER BUTTONS
        ================================================= */}

        <div className="listings-filter-tabs">

          <button
            className={
              filter === "all"
                ? "active"
                : ""
            }
            onClick={() => setFilter("all")}
          >
            All Listings
          </button>

          <button
            className={
              filter === "price"
                ? "active"
                : ""
            }
            onClick={() => setFilter("price")}
          >
            <TrendingUp size={14} />
            Highest Price
          </button>

          <button
            className={
              filter === "offers"
                ? "active"
                : ""
            }
            onClick={() => setFilter("offers")}
          >
            <MessageSquare size={14} />
            Most Offers
          </button>

        </div>


        {/* =================================================
            LISTINGS
        ================================================= */}

        <div className="farmer-listings-grid">

          {filteredListings.length === 0 ? (

            <div className="listings-empty">

              <Package size={40} />

              <h3>No listings found</h3>

              <p>
                Try a different crop name or create
                a new listing.
              </p>

              <button
                onClick={() =>
                  navigate("/farmer/listing/new")
                }
              >
                <Plus size={16} />
                Create New Listing
              </button>

            </div>

          ) : (

            filteredListings.map((listing) => (

              <article
                className="farmer-listing-card"
                key={listing.id}
              >

                {/* IMAGE */}

                <div className="listing-image-container">

                  <img
                    src={listing.image}
                    alt={listing.crop}
                  />

                  <span className="listing-status">
                    <CheckCircle2 size={12} />
                    {listing.status}
                  </span>


                  <button
                    className="listing-more-button"
                    title="More options"
                  >
                    <MoreVertical size={18} />
                  </button>

                </div>


                {/* CONTENT */}

                <div className="listing-card-content">

                  {/* TITLE */}

                  <div className="listing-card-title">

                    <div>

                      <h3>
                        {listing.crop}
                      </h3>

                      <span>
                        {listing.category}
                      </span>

                    </div>

                  </div>


                  {/* POSTED */}

                  <div className="listing-posted">

                    <Clock3 size={13} />

                    Posted {listing.posted}

                  </div>


                  {/* DETAILS */}

                  <div className="listing-details">

                    <div>

                      <span>Quantity</span>

                      <strong>
                        {listing.quantity}
                      </strong>

                    </div>


                    <div>

                      <span>Expected Price</span>

                      <strong className="listing-price">
                        {listing.price}
                      </strong>

                    </div>

                  </div>


                  {/* OFFERS */}

                  <div className="listing-offers-row">

                    <div className="listing-offers">

                      <MessageSquare size={15} />

                      <strong>
                        {listing.offers}
                      </strong>

                      <span>
                        {listing.offers === 1
                          ? "Offer"
                          : "Offers"}
                      </span>

                    </div>


                    <span className="listing-interest">
                      Interested buyers
                    </span>

                  </div>


                  {/* ACTIONS */}

                  <div className="listing-card-actions">

                    <button
                      className="listing-primary-action"
                      onClick={() =>
                        handleMessage(
                          listing.crop
                        )
                      }
                    >
                      <MessageSquare size={15} />
                      View Offers
                    </button>


                    <button
                      className="listing-secondary-action"
                      onClick={() =>
                        alert(
                          `${listing.crop} preview\n\nMarketplace preview will be connected later.`
                        )
                      }
                    >
                      <Eye size={15} />
                      Preview
                    </button>


                    <button
                      className="listing-icon-action"
                      title="Edit listing"
                      onClick={() =>
                        alert(
                          `Edit ${listing.crop}\n\nEditing will be connected during backend integration.`
                        )
                      }
                    >
                      <Pencil size={15} />
                    </button>


                    <button
                      className="listing-icon-action danger"
                      title="Remove listing"
                      onClick={() =>
                        handleDelete(
                          listing.crop
                        )
                      }
                    >
                      <Trash2 size={15} />
                    </button>

                  </div>

                </div>

              </article>

            ))

          )}

        </div>

      </section>


      {/* =================================================
          BOTTOM CTA
      ================================================= */}

      <section className="listings-bottom-cta">

        <div className="listings-bottom-icon">
          <Plus size={23} />
        </div>

        <div>

          <strong>
            Have another crop to sell?
          </strong>

          <span>
            Create a new listing and connect with
            nearby buyers.
          </span>

        </div>


        <button
          onClick={() =>
            navigate("/farmer/listing/new")
          }
        >
          Create New Listing
          <ArrowLeft size={16} />
        </button>

      </section>

    </div>
  );
}