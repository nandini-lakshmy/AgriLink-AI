import { FormEvent, useState } from "react";

import {
  ArrowLeft,
  UserRound,
  Phone,
  MapPin,
  Map,
  LockKeyhole,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { apiPost } from "../services/api";

/* =========================================================
   TYPES
========================================================= */

interface FarmerData {
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

interface AuthResponse {
  token?: string;
  accessToken?: string;
  access_token?: string;

  farmer?: FarmerData;
  user?: FarmerData;

  data?: {
    token?: string;
    accessToken?: string;
    access_token?: string;
    farmer?: FarmerData;
    user?: FarmerData;
  };

  message?: string;

  [key: string]: unknown;
}

/* =========================================================
   FIND TOKEN FROM BACKEND RESPONSE
========================================================= */

function findToken(data: unknown): string | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const obj = data as Record<string, unknown>;

  /* Direct token */
  const directToken =
    obj.token ||
    obj.accessToken ||
    obj.access_token;

  if (
    typeof directToken === "string" &&
    directToken.trim()
  ) {
    return directToken.trim();
  }

  /* Nested data */
  if (obj.data && typeof obj.data === "object") {
    const nestedToken = findToken(obj.data);

    if (nestedToken) {
      return nestedToken;
    }
  }

  /* Nested farmer */
  if (
    obj.farmer &&
    typeof obj.farmer === "object"
  ) {
    const farmerToken = findToken(obj.farmer);

    if (farmerToken) {
      return farmerToken;
    }
  }

  /* Nested user */
  if (
    obj.user &&
    typeof obj.user === "object"
  ) {
    const userToken = findToken(obj.user);

    if (userToken) {
      return userToken;
    }
  }

  return null;
}

/* =========================================================
   FIND FARMER DATA FROM BACKEND RESPONSE
========================================================= */

function findFarmerData(
  data: unknown
): FarmerData | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const obj = data as Record<string, unknown>;

  if (
    obj.farmer &&
    typeof obj.farmer === "object"
  ) {
    return obj.farmer as FarmerData;
  }

  if (
    obj.user &&
    typeof obj.user === "object"
  ) {
    return obj.user as FarmerData;
  }

  if (
    obj.data &&
    typeof obj.data === "object"
  ) {
    return findFarmerData(obj.data);
  }

  return null;
}

/* =========================================================
   FARMER REGISTRATION
========================================================= */

export default function FarmerRegistration() {
  const navigate = useNavigate();

  /* =======================================================
     FORM DATA
  ======================================================= */

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    state: "",
    district: "",
    currentLocation: "",
    farmLocation: "",
    language: "English",
  });

  /* =======================================================
     STATES
  ======================================================= */

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  /* =======================================================
     HANDLE INPUT CHANGE
  ======================================================= */

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /* =======================================================
     SAVE AUTHENTICATION INFORMATION
  ======================================================= */

  const saveFarmerSession = (
    token: string,
    farmerData?: FarmerData | null
  ) => {
    /* -----------------------------------------------
       Save JWT
    ------------------------------------------------ */

    localStorage.setItem(
      "farmerToken",
      token
    );

    /* -----------------------------------------------
       Save common token names too
       This keeps other frontend screens compatible.
    ------------------------------------------------ */

    localStorage.setItem(
      "accessToken",
      token
    );

    localStorage.setItem(
      "access_token",
      token
    );

    localStorage.setItem(
      "token",
      token
    );

    /* -----------------------------------------------
       Save login status
    ------------------------------------------------ */

    localStorage.setItem(
      "farmerLoggedIn",
      "true"
    );

    /* -----------------------------------------------
       Save farmer information
    ------------------------------------------------ */

    const finalFarmerData: FarmerData = {
      ...formData,
      ...(farmerData || {}),
      latitude:
        farmerData?.latitude,
      longitude:
        farmerData?.longitude,
    };

    localStorage.setItem(
      "farmerUser",
      JSON.stringify(finalFarmerData)
    );

    /* -----------------------------------------------
       Save farmer name
    ------------------------------------------------ */

    localStorage.setItem(
      "farmerName",
      farmerData?.name ||
        formData.name
    );
  };

  /* =======================================================
     SUBMIT REGISTRATION
  ======================================================= */

  const handleSubmit = async (
    e: FormEvent
  ) => {
    e.preventDefault();

    setError("");

    /* -----------------------------------------------
       Basic validation
    ------------------------------------------------ */

    if (!formData.name.trim()) {
      setError(
        "Please enter your full name."
      );
      return;
    }

    if (!formData.phone.trim()) {
      setError(
        "Please enter your phone number."
      );
      return;
    }

    if (!formData.password) {
      setError(
        "Please create a password."
      );
      return;
    }

    if (formData.password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (!formData.state.trim()) {
      setError(
        "Please enter your state."
      );
      return;
    }

    if (!formData.district.trim()) {
      setError(
        "Please enter your district."
      );
      return;
    }

    if (!formData.currentLocation.trim()) {
      setError(
        "Please enter your current location."
      );
      return;
    }

    if (!formData.farmLocation.trim()) {
      setError(
        "Please enter your farm location."
      );
      return;
    }

    /* -----------------------------------------------
       Start loading
    ------------------------------------------------ */

    setLoading(true);

    /* -----------------------------------------------
       Check browser GPS support
    ------------------------------------------------ */

    if (!navigator.geolocation) {
      setError(
        "Location services are not supported by this browser."
      );

      setLoading(false);

      return;
    }

    /* -----------------------------------------------
       Get REAL GPS location
    ------------------------------------------------ */

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude =
            position.coords.latitude;

          const longitude =
            position.coords.longitude;

          console.log(
            "Farmer GPS location:",
            latitude,
            longitude
          );

          /* =================================================
             REGISTER FARMER
          ================================================= */

          const response =
            await apiPost<AuthResponse>(
              "/api/farmer/register",
              {
                name: formData.name.trim(),

                phone: formData.phone.trim(),

                password: formData.password,

                state: formData.state.trim(),

                district:
                  formData.district.trim(),

                /*
                 * Backend expects one location field.
                 */
                location:
                  formData.currentLocation.trim() ||
                  formData.farmLocation.trim(),

                /*
                 * Real browser GPS
                 */
                latitude,

                longitude,
              }
            );

          console.log(
            "================================="
          );

          console.log(
            "FARMER REGISTRATION RESPONSE"
          );

          console.log(
            response
          );

          console.log(
            "================================="
          );

          /* =================================================
             TRY TO GET TOKEN FROM REGISTRATION RESPONSE
          ================================================= */

          let token =
            findToken(response);

          /* =================================================
             GET FARMER DATA
          ================================================= */

          const farmerData =
            findFarmerData(response);

          /* =================================================
             IF REGISTRATION RETURNS TOKEN
          ================================================= */

          if (token) {
            console.log(
              "Registration returned JWT token."
            );

            saveFarmerSession(
              token,
              farmerData
            );
          }

          /* =================================================
             IF REGISTRATION DOES NOT RETURN TOKEN
             
             Automatically login using the newly
             registered phone + password.
          ================================================= */

          if (!token) {
            console.log(
              "Registration did not return a token."
            );

            console.log(
              "Attempting automatic farmer login..."
            );

            const loginResponse =
              await apiPost<AuthResponse>(
                "/api/farmer/login",
                {
                  phone:
                    formData.phone.trim(),

                  password:
                    formData.password,
                }
              );

            console.log(
              "Automatic login response:",
              loginResponse
            );

            token =
              findToken(loginResponse);

            const loggedInFarmer =
              findFarmerData(
                loginResponse
              );

            if (
              token
            ) {
              saveFarmerSession(
                token,
                loggedInFarmer ||
                  farmerData
              );
            }
          }

          /* =================================================
             FINAL TOKEN VERIFICATION
          ================================================= */

          const savedToken =
            localStorage.getItem(
              "farmerToken"
            );

          if (!savedToken) {
            throw new Error(
              "Account was created, but we could not create the login session. Please go to Farmer Login and sign in once."
            );
          }

          /* =================================================
             FINAL LOG
          ================================================= */

          console.log(
            "================================="
          );

          console.log(
            "FARMER REGISTRATION COMPLETE"
          );

          console.log(
            "farmerToken saved:",
            !!savedToken
          );

          console.log(
            "farmerName:",
            localStorage.getItem(
              "farmerName"
            )
          );

          console.log(
            "================================="
          );

          /* =================================================
             GO TO DASHBOARD
          ================================================= */

          navigate(
            "/farmer/dashboard"
          );

        } catch (err) {
          console.error(
            "================================="
          );

          console.error(
            "FARMER REGISTRATION FAILED"
          );

          console.error(err);

          console.error(
            "================================="
          );

          setError(
            err instanceof Error
              ? err.message
              : "Registration failed. Please try again."
          );
        } finally {
          setLoading(false);
        }
      },

      /* =====================================================
         GPS ERROR
      ===================================================== */

      (geoError) => {
        console.error(
          "Location error:",
          geoError
        );

        let message =
          "Location permission is required. Please allow location access and try again.";

        if (
          geoError.code ===
          geoError.PERMISSION_DENIED
        ) {
          message =
            "Location permission was denied. Please allow location access in your browser and try again.";
        }

        if (
          geoError.code ===
          geoError.POSITION_UNAVAILABLE
        ) {
          message =
            "Your current location could not be determined. Please check your device location settings and try again.";
        }

        if (
          geoError.code ===
          geoError.TIMEOUT
        ) {
          message =
            "Getting your location took too long. Please try again.";
        }

        setError(message);

        setLoading(false);
      },

      /* =====================================================
         GPS OPTIONS
      ===================================================== */

      {
        enableHighAccuracy: true,

        timeout: 15000,

        maximumAge: 0,
      }
    );
  };

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
            navigate("/")
          }
          disabled={loading}
        >
          <ArrowLeft size={18} />

          Back to Home
        </button>

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="registration-header">

          <div className="registration-icon">
            <UserRound size={28} />
          </div>

          <div>

            <h1>
              Farmer Registration
            </h1>

            <p>
              Join AgriLink AI and connect directly
              with verified buyers.
            </p>

          </div>

        </div>

        {/* ===================================================
            REGISTRATION FORM
        =================================================== */}

        <form
          onSubmit={handleSubmit}
        >

          <div className="form-grid">

            {/* =================================================
                FULL NAME
            ================================================= */}

            <div className="form-group">

              <label htmlFor="name">
                Full Name
              </label>

              <div className="input-with-icon">

                <UserRound size={18} />

                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={
                    handleChange
                  }
                  disabled={loading}
                  required
                />

              </div>

            </div>

            {/* =================================================
                PHONE
            ================================================= */}

            <div className="form-group">

              <label htmlFor="phone">
                Phone Number
              </label>

              <div className="input-with-icon">

                <Phone size={18} />

                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={
                    handleChange
                  }
                  disabled={loading}
                  required
                />

              </div>

            </div>

            {/* =================================================
                PASSWORD
            ================================================= */}

            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>

              <div className="input-with-icon">

                <LockKeyhole size={18} />

                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={
                    formData.password
                  }
                  onChange={
                    handleChange
                  }
                  disabled={loading}
                  required
                />

              </div>

            </div>

            {/* =================================================
                STATE
            ================================================= */}

            <div className="form-group">

              <label htmlFor="state">
                State
              </label>

              <input
                id="state"
                type="text"
                name="state"
                placeholder="e.g. Kerala"
                value={
                  formData.state
                }
                onChange={
                  handleChange
                }
                disabled={loading}
                required
              />

            </div>

            {/* =================================================
                DISTRICT
            ================================================= */}

            <div className="form-group">

              <label htmlFor="district">
                District
              </label>

              <input
                id="district"
                type="text"
                name="district"
                placeholder="e.g. Ernakulam"
                value={
                  formData.district
                }
                onChange={
                  handleChange
                }
                disabled={loading}
                required
              />

            </div>

            {/* =================================================
                CURRENT LOCATION
            ================================================= */}

            <div className="form-group">

              <label htmlFor="currentLocation">
                Current Location
              </label>

              <div className="input-with-icon">

                <MapPin size={18} />

                <input
                  id="currentLocation"
                  type="text"
                  name="currentLocation"
                  placeholder="Enter current location"
                  value={
                    formData.currentLocation
                  }
                  onChange={
                    handleChange
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

                <Map size={18} />

                <input
                  id="farmLocation"
                  type="text"
                  name="farmLocation"
                  placeholder="Enter farm location"
                  value={
                    formData.farmLocation
                  }
                  onChange={
                    handleChange
                  }
                  disabled={loading}
                  required
                />

              </div>

            </div>

            {/* =================================================
                LANGUAGE
            ================================================= */}

            <div className="form-group">

              <label htmlFor="language">
                Preferred Language
              </label>

              <select
                id="language"
                name="language"
                value={
                  formData.language
                }
                onChange={
                  handleChange
                }
                disabled={loading}
              >

                <option value="English">
                  English
                </option>

                <option value="Malayalam">
                  Malayalam
                </option>

                <option value="Tamil">
                  Tamil
                </option>

                <option value="Hindi">
                  Hindi
                </option>

              </select>

            </div>

          </div>

          {/* ===================================================
              LOCATION INFORMATION
          =================================================== */}

          <div className="location-note">

            <MapPin size={17} />

            <span>
              Your location helps us find nearby
              buyers and markets. GPS coordinates
              will be captured automatically.
            </span>

          </div>

          {/* ===================================================
              ERROR MESSAGE
          =================================================== */}

          {error && (

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "16px",
                marginBottom: "16px",
                padding: "12px 16px",
                borderRadius: "8px",
                background: "#fee2e2",
                border:
                  "1px solid #fecaca",
                color: "#991b1b",
                fontSize: "14px",
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

                Creating Account...
              </>
            ) : (
              <>
                <CheckCircle2
                  size={19}
                />

                Create Farmer Account
              </>
            )}

          </button>

          {/* ===================================================
              LOGIN
          =================================================== */}

          <div className="registration-login">

            <span>
              Already have an account?
            </span>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/farmer/login"
                )
              }
              disabled={loading}
            >
              Login as Farmer
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}