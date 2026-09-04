import {
  Leaf,
  MapPin,
  ShoppingCart,
  ShieldCheck,
  Users,
  BarChart3,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import farmer from "../assets/farmer.png";

export default function LandingScreen() {
  const navigate = useNavigate();

  return (
    <div className="landing-screen">

      {/* NAVBAR */}
      <nav className="landing-navbar">

        <button
          className="landing-logo"
          onClick={() => navigate("/")}
        >
          <Leaf size={34} />

          <span>
            AgriLink <strong>AI</strong>
          </span>
        </button>

        <div className="landing-nav-links">

          <button onClick={() => navigate("/")}>
            Home
          </button>

          <button onClick={() => navigate("/about")}>
            About
          </button>

          <button
            onClick={() =>
              document
                .getElementById("features")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            Features
          </button>

          <button
            onClick={() =>
              document
                .getElementById("how-it-works")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            How It Works
          </button>

          <button onClick={() => navigate("/contact")}>
            Contact
          </button>

          <button
            className="login-button"
            onClick={() => navigate("/login")}
          >
            Login
          </button>

        </div>

      </nav>


      {/* HERO */}
      <main className="landing-hero">

        <div className="hero-copy">

          <div className="hero-badge">
            🌱 Smart Agriculture Marketplace
          </div>

          <h1>
            Stronger Markets.
            <br />

            <span>Better Prices.</span>

            <br />

            Empowering Farmers.
          </h1>

          <p>
            Connecting farmers with verified buyers nearby.
            <br />
            Fair prices. Transparent trade. Better future.
          </p>

          <div className="hero-buttons">

            <button
              className="hero-primary-button"
              onClick={() =>
                navigate("/farmer/register")
              }
            >
              <MapPin size={23} />

              <div>
                <strong>I'm a Farmer</strong>
                <span>Sell Your Crops</span>
              </div>
            </button>


            <button
              className="hero-secondary-button"
              onClick={() =>
                navigate("/buyer/register")
              }
            >
              <ShoppingCart size={23} />

              <div>
                <strong>I'm a Buyer</strong>
                <span>Buy From Farmers</span>
              </div>
            </button>

          </div>

        </div>


        {/* FARMER IMAGE */}
        <div className="hero-farmer">

          <div className="hero-image-glow" />

          <img
            src={farmer}
            alt="Indian farmer"
          />

          <div className="hero-floating-card">
            <span>Today's Market</span>
            <strong>₹32/kg</strong>
            <small>↑ 8.5% this week</small>
          </div>

        </div>

      </main>


      {/* STATS */}
      <section className="landing-stat-strip">

        <div className="landing-stat">
          <strong>10K+</strong>
          <span>Farmers</span>
        </div>

        <div className="landing-stat">
          <strong>5K+</strong>
          <span>Buyers</span>
        </div>

        <div className="landing-stat">
          <strong>2K+</strong>
          <span>Transactions</span>
        </div>

        <div className="landing-stat">
          <strong>50+</strong>
          <span>Markets</span>
        </div>

      </section>


      {/* FEATURES */}
      <section
        className="landing-feature-strip"
        id="features"
      >

        <div>
          <ShieldCheck size={27} />

          <section>
            <strong>Fair Prices</strong>
            <span>Government Verified</span>
          </section>
        </div>


        <div>
          <Users size={27} />

          <section>
            <strong>Smart Connections</strong>
            <span>Nearby Buyers</span>
          </section>
        </div>


        <div>
          <BarChart3 size={27} />

          <section>
            <strong>Better Markets</strong>
            <span>Higher Profits</span>
          </section>
        </div>


        <div>
          <ShieldCheck size={27} />

          <section>
            <strong>Secure & Transparent</strong>
            <span>Trusted Transactions</span>
          </section>
        </div>

      </section>


      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="landing-info-section"
      >
        <span className="section-label">
          HOW IT WORKS
        </span>

        <h2>
          From Farm to Market,
          <br />
          <span>Made Simple.</span>
        </h2>

        <div className="how-grid">

          <div>
            <b>01</b>
            <h3>List Your Crop</h3>
            <p>
              Farmers add their available harvest,
              quantity and expected price.
            </p>
          </div>

          <div>
            <b>02</b>
            <h3>Find the Best Buyer</h3>
            <p>
              Discover nearby verified buyers
              and compare their offers.
            </p>
          </div>

          <div>
            <b>03</b>
            <h3>Choose & Sell</h3>
            <p>
              Select the best offer and connect
              directly with the buyer.
            </p>
          </div>

        </div>

      </section>

    </div>
  );
}