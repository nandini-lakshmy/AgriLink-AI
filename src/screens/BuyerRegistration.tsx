import { FormEvent, useState } from "react";

import {
  ArrowLeft,
  Building2,
  Phone,
  MapPin,
  UserRound,
  CheckCircle2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";


export default function BuyerRegistration() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    phone: "",
    state: "",
    district: "",
    location: "",
  });


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
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
      "buyerUser",
      JSON.stringify(formData)
    );

    localStorage.setItem(
      "buyerCompany",
      formData.companyName
    );

    localStorage.setItem(
      "buyerContact",
      formData.contactPerson
    );

    /* =========================================
       GO TO BUYER DASHBOARD
    ========================================= */

    navigate("/buyer/dashboard");
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
            <Building2 size={28} />
          </div>

          <div>

            <h1>
              Buyer Registration
            </h1>

            <p>
              Register your business and connect
              with local farmers.
            </p>

          </div>

        </div>


        {/* =====================================
            FORM
        ===================================== */}

        <form
          onSubmit={handleSubmit}
        >

          <div className="form-grid">


            {/* COMPANY NAME */}

            <div className="form-group">

              <label htmlFor="companyName">
                Company / Business Name
              </label>

              <div className="input-with-icon">

                <Building2 size={18} />

                <input
                  id="companyName"
                  type="text"
                  name="companyName"
                  placeholder="e.g. ABC Traders"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* CONTACT PERSON */}

            <div className="form-group">

              <label htmlFor="contactPerson">
                Contact Person
              </label>

              <div className="input-with-icon">

                <UserRound size={18} />

                <input
                  id="contactPerson"
                  type="text"
                  name="contactPerson"
                  placeholder="Enter contact person's name"
                  value={formData.contactPerson}
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


            {/* BUSINESS LOCATION */}

            <div className="form-group">

              <label htmlFor="location">
                Business Location
              </label>

              <div className="input-with-icon">

                <MapPin size={18} />

                <input
                  id="location"
                  type="text"
                  name="location"
                  placeholder="Enter business location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>

          </div>


          {/* =====================================
              LOCATION INFORMATION
          ===================================== */}

          <div className="location-note">

            <MapPin size={17} />

            <span>
              Your location helps farmers find
              your business nearby.
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

            Create Buyer Account
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
                navigate("/buyer/login")
              }
            >
              Login as Buyer
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}