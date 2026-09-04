import { FormEvent, useState } from "react";

import {
  ArrowLeft,
  UserRound,
  Phone,
  MapPin,
  Map,
  CheckCircle2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";


export default function FarmerRegistration() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    state: "",
    district: "",
    currentLocation: "",
    farmLocation: "",
    language: "English",
  });


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


  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    /* =========================================
       FRONTEND DEMO STORAGE
       Backend can replace this later
    ========================================= */

    localStorage.setItem(
      "farmerUser",
      JSON.stringify(formData)
    );

    localStorage.setItem(
      "farmerName",
      formData.name
    );

    /* =========================================
       GO TO FARMER DASHBOARD
    ========================================= */

    navigate("/farmer/dashboard");
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
              SUBMIT
          ===================================== */}

          <button
            type="submit"
            className="registration-submit"
          >
            <CheckCircle2 size={19} />

            Create Farmer Account
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