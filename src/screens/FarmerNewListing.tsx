import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Package,
  MapPin,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { apiPost } from "../services/api";

/* =========================================================
   FARMER USER TYPE
========================================================= */

interface FarmerUser {
  id?: string;
  _id?: string;

  name?: string;
  phone?: string;

  state?: string;
  district?: string;

  location?: string;
  currentLocation?: string;
  farmLocation?: string;

  latitude?: number;
  longitude?: number;
}

/* =========================================================
   LISTING RESPONSE TYPE
========================================================= */

interface ListingResponse {
  message?: string;

  listing?: {
    _id?: string;
    farmer_id?: string;

    crop_name?: string;
    quantity?: number;
    expected_price?: number;

    status?: string;
    date_posted?: string;
  };

  data?: {
    listing?: {
      _id?: string;
      crop_name?: string;
      quantity?: number;
      expected_price?: number;
    };
  };

  [key: string]: unknown;
}

/* =========================================================
   FARMER NEW LISTING
========================================================= */

export default function FarmerNewListing() {
  const navigate = useNavigate();

  /* =======================================================
     FORM STATES
  ======================================================= */

  const [cropName, setCropName] =
    useState("");

  const [quantity, setQuantity] =
    useState("");

  const [expectedPrice, setExpectedPrice] =
    useState("");

  /* =======================================================
     FARMER INFORMATION
  ======================================================= */

  const [farmer, setFarmer] =
    useState<FarmerUser | null>(null);

  /* =======================================================
     UI STATES
  ======================================================= */

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* =======================================================
     LOAD FARMER INFORMATION
  ======================================================= */

  useEffect(() => {
    const savedFarmer =
      localStorage.getItem(
        "farmerUser"
      );

    if (savedFarmer) {
      try {
        const parsedFarmer =
          JSON.parse(savedFarmer);

        setFarmer(parsedFarmer);

      } catch (err) {
        console.error(
          "Could not read farmer information:",
          err
        );
      }
    }
  }, []);

  /* =======================================================
     GET FARMER TOKEN
     
     We check several common token names.
     farmerToken remains the primary token.
  ======================================================= */

  const getFarmerToken = (): string | null => {
    const tokenKeys = [
      "farmerToken",
      "accessToken",
      "access_token",
      "token",
    ];

    for (const key of tokenKeys) {
      const token =
        localStorage.getItem(key);

      if (
        token &&
        token.trim()
      ) {
        return token.trim();
      }
    }

    return null;
  };

  /* =======================================================
     HANDLE FORM SUBMISSION
  ======================================================= */

  const handleSubmit = async (
    e: FormEvent
  ) => {
    e.preventDefault();

    /* -------------------------------------------------------
       Clear previous messages
    ------------------------------------------------------- */

    setError("");
    setSuccess("");

    /* -------------------------------------------------------
       Get authentication token
    ------------------------------------------------------- */

    const token =
      getFarmerToken();

    if (!token) {
      setError(
        "Farmer login session not found. Please register or log in again."
      );

      return;
    }

    /* -------------------------------------------------------
       Validate crop name
    ------------------------------------------------------- */

    if (!cropName.trim()) {
      setError(
        "Please enter the crop name."
      );

      return;
    }

    /* -------------------------------------------------------
       Convert quantity and price to numbers
    ------------------------------------------------------- */

    const quantityValue =
      Number(quantity);

    const priceValue =
      Number(expectedPrice);

    /* -------------------------------------------------------
       Validate quantity
    ------------------------------------------------------- */

    if (
      !quantity ||
      !Number.isFinite(quantityValue) ||
      quantityValue <= 0
    ) {
      setError(
        "Please enter a valid quantity greater than 0."
      );

      return;
    }

    /* -------------------------------------------------------
       Validate expected price
    ------------------------------------------------------- */

    if (
      !expectedPrice ||
      !Number.isFinite(priceValue) ||
      priceValue <= 0
    ) {
      setError(
        "Please enter a valid expected price greater than 0."
      );

      return;
    }

    /* -------------------------------------------------------
       Start loading
    ------------------------------------------------------- */

    setLoading(true);

    try {
      /* =====================================================
         CREATE LISTING

         IMPORTANT:
         The backend associates the listing with the
         authenticated farmer using the JWT token.

         We therefore send only the documented fields.
      ===================================================== */

      const response =
        await apiPost<ListingResponse>(
          "/api/listings/create",
          {
            crop_name:
              cropName.trim(),

            quantity:
              quantityValue,

            expected_price:
              priceValue,
          },
          token
        );

      /* =====================================================
         DEBUG
      ===================================================== */

      console.log(
        "================================="
      );

      console.log(
        "CROP LISTING CREATED"
      );

      console.log(
        "Backend response:",
        response
      );

      console.log(
        "================================="
      );

      /* =====================================================
         SUCCESS MESSAGE
      ===================================================== */

      setSuccess(
        "Your crop listing was created successfully."
      );

      /* -------------------------------------------------------
         Clear form
      ------------------------------------------------------- */

      setCropName("");
      setQuantity("");
      setExpectedPrice("");

      /* =====================================================
         GO TO LISTINGS
         
         Give the success message a moment to appear.
      ===================================================== */

      setTimeout(() => {
        navigate(
          "/farmer/listings"
        );
      }, 1200);

    } catch (err) {

      /* =====================================================
         ERROR HANDLING
      ===================================================== */

      console.error(
        "================================="
      );

      console.error(
        "CROP LISTING CREATION FAILED"
      );

      console.error(err);

      console.error(
        "================================="
      );

      if (
        err instanceof Error
      ) {
        const message =
          err.message;

        /* ---------------------------------------------------
           Authentication error
        --------------------------------------------------- */

        if (
          message.includes("401") ||
          message
            .toLowerCase()
            .includes("unauthorized") ||
          message
            .toLowerCase()
            .includes("authentication") ||
          message
            .toLowerCase()
            .includes("token")
        ) {
          setError(
            "Your farmer login session has expired or is invalid. Please log in again."
          );

          return;
        }

        /* ---------------------------------------------------
           Other backend error
        --------------------------------------------------- */

        setError(message);

      } else {

        setError(
          "Could not create the crop listing. Please try again."
        );
      }

    } finally {

      setLoading(false);

    }
  };

  /* =========================================================
     FARM LOCATION
  ========================================================= */

  const location =
    farmer?.farmLocation ||
    farmer?.currentLocation ||
    farmer?.location ||
    [
      farmer?.district,
      farmer?.state,
    ]
      .filter(Boolean)
      .join(", ");

  /* =========================================================
     HAS GPS
  ========================================================= */

  const hasGps =
    farmer?.latitude !== undefined &&
    farmer?.longitude !== undefined;

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="registration-page">

      <div className="registration-card">

        {/* ===================================================
            BACK BUTTON
        =================================================== */}

        <button
          type="button"
          className="back-button"
          onClick={() =>
            navigate(
              "/farmer/dashboard"
            )
          }
          disabled={loading}
        >
          <ArrowLeft size={18} />

          Back to Dashboard
        </button>

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="registration-header">

          <div className="registration-icon">

            <Package size={28} />

          </div>

          <div>

            <h1>
              Sell New Crop
            </h1>

            <p>
              Create a listing and connect your
              harvest with potential buyers.
            </p>

          </div>

        </div>

        {/* ===================================================
            FORM
        =================================================== */}

        <form
          onSubmit={handleSubmit}
        >

          <div className="form-grid">

            {/* =================================================
                CROP NAME
            ================================================= */}

            <div className="form-group">

              <label htmlFor="cropName">
                Crop Name
              </label>

              <div className="input-with-icon">

                <Package size={18} />

                <input
                  id="cropName"
                  type="text"
                  placeholder="e.g. Onion"
                  value={cropName}
                  onChange={(e) =>
                    setCropName(
                      e.target.value
                    )
                  }
                  disabled={loading}
                  required
                />

              </div>

            </div>

            {/* =================================================
                QUANTITY
            ================================================= */}

            <div className="form-group">

              <label htmlFor="quantity">
                Quantity (kg)
              </label>

              <div className="input-with-icon">

                <Package size={18} />

                <input
                  id="quantity"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="e.g. 500"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      e.target.value
                    )
                  }
                  disabled={loading}
                  required
                />

              </div>

            </div>

            {/* =================================================
                EXPECTED PRICE
            ================================================= */}

            <div className="form-group">

              <label htmlFor="expectedPrice">
                Expected Price (₹/kg)
              </label>

              <div className="input-with-icon">

                <IndianRupee size={18} />

                <input
                  id="expectedPrice"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="e.g. 32"
                  value={expectedPrice}
                  onChange={(e) =>
                    setExpectedPrice(
                      e.target.value
                    )
                  }
                  disabled={loading}
                  required
                />

              </div>

            </div>

            {/* =================================================
                FARM LOCATION
            ================================================= */}

            <div className="form-group">

              <label htmlFor="farmLocation">
                Farm Location
              </label>

              <div className="input-with-icon">

                <MapPin size={18} />

                <input
                  id="farmLocation"
                  type="text"
                  value={
                    location ||
                    "Location from farmer profile"
                  }
                  readOnly
                />

              </div>

            </div>

          </div>

          {/* ===================================================
              GPS INFORMATION
          =================================================== */}

          <div className="location-note">

            <MapPin size={17} />

            <span>

              {hasGps
                ? `GPS location: ${farmer!.latitude!.toFixed(
                    5
                  )}, ${farmer!.longitude!.toFixed(
                    5
                  )}`
                : "GPS coordinates were not found in your farmer profile. Please register or log in again."}

            </span>

          </div>

          {/* ===================================================
              INFORMATION
          =================================================== */}

          <div
            style={{
              marginTop: "16px",
              padding: "14px 16px",
              borderRadius: "10px",
              background: "#f0fdf4",
              border:
                "1px solid #bbf7d0",
              color: "#166534",
              fontSize: "14px",
              lineHeight: 1.5,
            }}
          >
            Your listing will be associated
            with your farmer account. Buyers
            can then discover your crop and
            make offers.
          </div>

          {/* ===================================================
              ERROR
          =================================================== */}

          {error && (

            <div
              style={{
                marginTop: "16px",
                padding: "12px 16px",
                borderRadius: "8px",
                background: "#fee2e2",
                border:
                  "1px solid #fecaca",
                color: "#991b1b",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                lineHeight: 1.4,
              }}
            >

              <AlertCircle
                size={18}
                style={{
                  flexShrink: 0,
                }}
              />

              <span>
                {error}
              </span>

            </div>

          )}

          {/* ===================================================
              SUCCESS
          =================================================== */}

          {success && (

            <div
              style={{
                marginTop: "16px",
                padding: "12px 16px",
                borderRadius: "8px",
                background: "#dcfce7",
                border:
                  "1px solid #bbf7d0",
                color: "#166534",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                lineHeight: 1.4,
              }}
            >

              <CheckCircle2
                size={18}
                style={{
                  flexShrink: 0,
                }}
              />

              <span>
                {success}
              </span>

            </div>

          )}

          {/* ===================================================
              SUBMIT BUTTON
          =================================================== */}

          <button
            type="submit"
            className="registration-submit"
            disabled={loading}
          >

            {loading ? (
              <>
                <Loader2
                  size={19}
                />

                Creating Listing...
              </>
            ) : (
              <>
                <CheckCircle2
                  size={19}
                />

                Create Crop Listing
              </>
            )}

          </button>

          {/* ===================================================
              VIEW LISTINGS
          =================================================== */}

          <div className="registration-login">

            <span>
              Already listed a crop?
            </span>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/farmer/listings"
                )
              }
              disabled={loading}
            >
              View My Listings
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}