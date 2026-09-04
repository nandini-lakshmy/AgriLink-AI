import { FormEvent, useState } from "react";

import {
  ArrowLeft,
  UserRound,
  Phone,
  MapPin,
  Map,
  LockKeyhole,
  CheckCircle2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { apiPost } from "../services/api";


export default function FarmerRegistration() {
  const navigate = useNavigate();

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


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


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    // Check browser GPS support
    if (!navigator.geolocation) {
      setError(
        "Location services are not supported by this browser."
      );
      setLoading(false);
      return;
    }

    // Capture farmer's real GPS location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          // Send registration data to backend
          const response = await apiPost<any>(
            "/api/farmer/register",
            {
              name: formData.name,
              phone: formData.phone,
              password: formData.password,
              state: formData.state,
              district: formData.district,

              // Backend location field
              location:
                formData.currentLocation ||
                formData.farmLocation,

              latitude,
              longitude,
            }
          );

          console.log(
            "Farmer registration successful:",
            response
          );

          // Store farmer information locally for frontend use
          localStorage.setItem(
            "farmerUser",
            JSON.stringify({
              ...formData,
              latitude,
              longitude,
            })
          );

          localStorage.setItem(
            "farmerName",
            formData.name
          );

          // If backend provides a JWT token, save it
          if (response?.token) {
            localStorage.setItem(
              "farmerToken",
              response.token
            );
          }

          // Go to dashboard after successful registration
          navigate("/farmer/dashboard");

        } catch (err) {
          console.error(
            "Farmer registration failed:",
            err
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

      (geoError) => {
        console.error(
          "Location error:",
          geoError
        );

        setError(
          "Location permission is required. Please allow location access and try again."
        );

        setLoading(false);
      }
    );
  };


  return (
    <div className="registration-page">

      <div className="registration-card">


        {/* =====================================
            BACK BUTTON
        ===================================== */}

        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={18} />
          Back to Home
        </button>


        {/* =====================================
            HEADER
        ===================================== */}

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


        {/* =====================================
            REGISTRATION FORM
        ===================================== */}

        <form onSubmit={handleSubmit}>

          <div className="form-grid">


            {/* FULL NAME */}

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
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* PHONE */}

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
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* PASSWORD */}

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
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* STATE */}

            <div className="form-group">

              <label htmlFor="state">
                State
              </label>

              <input
                id="state"
                type="text"
                name="state"
                placeholder="e.g. Kerala"
                value={formData.state}
                onChange={handleChange}
                required
              />

            </div>


            {/* DISTRICT */}

            <div className="form-group">

              <label htmlFor="district">
                District
              </label>

              <input
                id="district"
                type="text"
                name="district"
                placeholder="e.g. Ernakulam"
                value={formData.district}
                onChange={handleChange}
                required
              />

            </div>


            {/* CURRENT LOCATION */}

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
                  value={formData.currentLocation}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* FARM LOCATION */}

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
                  value={formData.farmLocation}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* LANGUAGE */}

            <div className="form-group">

              <label htmlFor="language">
                Preferred Language
              </label>

              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleChange}
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


          {/* =====================================
              LOCATION INFORMATION
          ===================================== */}

          <div className="location-note">

            <MapPin size={17} />

            <span>
              Your location helps us find nearby
              buyers and markets.
            </span>

          </div>


          {/* =====================================
              ERROR MESSAGE
          ===================================== */}

          {error && (
            <div
              style={{
                marginTop: "16px",
                marginBottom: "16px",
                padding: "12px 16px",
                borderRadius: "8px",
                background: "#fee2e2",
                color: "#991b1b",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}


          {/* =====================================
              SUBMIT
          ===================================== */}

          <button
            type="submit"
            className="registration-submit"
            disabled={loading}
          >

            <CheckCircle2 size={19} />

            {loading
              ? "Creating Account..."
              : "Create Farmer Account"}

          </button>


          {/* =====================================
              LOGIN
          ===================================== */}

          <div className="registration-login">

            <span>
              Already have an account?
            </span>

            <button
              type="button"
              onClick={() =>
                navigate("/farmer/login")
              }
            >
              Login as Farmer
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}