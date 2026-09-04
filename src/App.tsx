import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

import "./App.css";

/* =========================================================
   PUBLIC
========================================================= */

import LandingScreen from "./screens/LandingScreen";
import LoginChoice from "./screens/LoginChoice";

/* =========================================================
   FARMER
========================================================= */

import FarmerRegistration from "./screens/FarmerRegistration";
import FarmerLogin from "./screens/FarmerLogin";
import FarmerDashboard from "./screens/FarmerDashboard";
import FarmerListings from "./screens/FarmerListings";

import NearbyBuyers from "./screens/NearbyBuyers";
import MapView from "./screens/MapView";
import MarketIntelligence from "./screens/MarketIntelligence";
import CropDemand from "./screens/CropDemand";

/* =========================================================
   BUYER
========================================================= */

import BuyerRegistration from "./screens/BuyerRegistration";
import BuyerLogin from "./screens/BuyerLogin";
import BuyerDashboard from "./screens/BuyerDashboard";


/* =========================================================
   DEMO PAGE
   Temporary page for features that will be connected later
========================================================= */

function DemoPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const navigate = useNavigate();

  return (
    <div className="demo-page">

      <div className="demo-card">

        {/* LOGO */}

        <div className="demo-logo">
          <span>🌿</span>
          <strong>AgriLink AI</strong>
        </div>


        {/* TITLE */}

        <h1>{title}</h1>


        {/* DESCRIPTION */}

        <p>{description}</p>


        {/* BACK BUTTON */}

        <button
          className="primary-button"
          onClick={() => navigate(-1)}
        >
          ← Go Back
        </button>

      </div>

    </div>
  );
}


/* =========================================================
   APP
========================================================= */

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =================================================
            PUBLIC PAGES
        ================================================= */}

        <Route
          path="/"
          element={<LandingScreen />}
        />


        {/* =================================================
            LOGIN ROLE SELECTION
        ================================================= */}

        <Route
          path="/login"
          element={<LoginChoice />}
        />


        {/* =================================================
            ABOUT
        ================================================= */}

        <Route
          path="/about"
          element={
            <DemoPage
              title="About AgriLink AI"
              description="AgriLink AI connects farmers directly with buyers, helping farmers discover better prices, trusted markets and new selling opportunities."
            />
          }
        />


        {/* =================================================
            CONTACT
        ================================================= */}

        <Route
          path="/contact"
          element={
            <DemoPage
              title="Contact Us"
              description="Our contact and support system will be connected with the backend during the integration stage."
            />
          }
        />


        {/* =================================================
            FARMER AUTHENTICATION
        ================================================= */}

        <Route
          path="/farmer/login"
          element={<FarmerLogin />}
        />

        <Route
          path="/farmer/register"
          element={<FarmerRegistration />}
        />


        {/* =================================================
            FARMER DASHBOARD
        ================================================= */}

        <Route
          path="/farmer/dashboard"
          element={<FarmerDashboard />}
        />


        {/* =================================================
            FARMER LISTINGS
        ================================================= */}

        <Route
          path="/farmer/listings"
          element={<FarmerListings />}
        />


        {/* =================================================
            FARMER CREATE LISTING
        ================================================= */}

        <Route
          path="/farmer/listing/new"
          element={
            <DemoPage
              title="Sell New Crop"
              description="Create a new crop listing by entering the crop name, quantity, image and expected selling price."
            />
          }
        />


        {/* =================================================
            FARMER OFFERS
        ================================================= */}

        <Route
          path="/farmer/offers"
          element={
            <DemoPage
              title="Offers Received"
              description="View offers from buyers, compare their prices and choose the best offer for your harvest."
            />
          }
        />


        {/* =================================================
            FARMER BUYER DISCOVERY
        ================================================= */}

        <Route
          path="/farmer/buyers"
          element={<NearbyBuyers />}
        />


        {/* =================================================
            FARMER MAP
        ================================================= */}

        <Route
          path="/farmer/map"
          element={<MapView />}
        />


        {/* =================================================
            FARMER MARKET INTELLIGENCE
        ================================================= */}

        <Route
          path="/farmer/market"
          element={<MarketIntelligence />}
        />


        {/* =================================================
            FARMER CROP DEMAND
        ================================================= */}

        <Route
          path="/farmer/demand"
          element={<CropDemand />}
        />


        {/* =================================================
            FARMER MESSAGES
        ================================================= */}

        <Route
          path="/farmer/messages"
          element={
            <DemoPage
              title="Messages"
              description="Your conversations with buyers will appear here. Messaging will be connected during backend integration."
            />
          }
        />


        {/* =================================================
            FARMER PROFILE
        ================================================= */}

        <Route
          path="/farmer/profile"
          element={
            <DemoPage
              title="Farmer Profile"
              description="View and manage your farmer profile, location, language preference and account information."
            />
          }
        />


        {/* =================================================
            BUYER AUTHENTICATION
        ================================================= */}

        <Route
          path="/buyer/login"
          element={<BuyerLogin />}
        />

        <Route
          path="/buyer/register"
          element={<BuyerRegistration />}
        />


        {/* =================================================
            BUYER DASHBOARD
        ================================================= */}

        <Route
          path="/buyer/dashboard"
          element={<BuyerDashboard />}
        />


        {/* =================================================
            BUYER CREATE REQUIREMENT
        ================================================= */}

        <Route
          path="/buyer/demand/new"
          element={
            <DemoPage
              title="Post a Requirement"
              description="Create a crop requirement by entering the crop name, required quantity, offered price and preferred location."
            />
          }
        />


        {/* =================================================
            BUYER REQUIREMENTS
        ================================================= */}

        <Route
          path="/buyer/demands"
          element={
            <DemoPage
              title="My Requirements"
              description="View and manage your active crop requirements and purchasing requests."
            />
          }
        />


        {/* =================================================
            BUYER FARMER LISTINGS
        ================================================= */}

        <Route
          path="/buyer/listings"
          element={
            <DemoPage
              title="Farmer Listings"
              description="View crop listings from farmers and explore available harvests near your location."
            />
          }
        />


        {/* =================================================
            BUYER BIDS
        ================================================= */}

        <Route
          path="/buyer/bids"
          element={
            <DemoPage
              title="My Bids"
              description="View the bids and offers you have placed on farmer crop listings."
            />
          }
        />


        {/* =================================================
            BUYER MATCHING FARMERS
        ================================================= */}

        <Route
          path="/buyer/farmers"
          element={
            <DemoPage
              title="Matching Farmers"
              description="Discover farmers whose crops match your requirements."
            />
          }
        />


        {/* =================================================
            BUYER MESSAGES
        ================================================= */}

        <Route
          path="/buyer/messages"
          element={
            <DemoPage
              title="Messages"
              description="Your conversations with farmers will appear here. Messaging will be connected during backend integration."
            />
          }
        />


        {/* =================================================
            BUYER PROFILE
        ================================================= */}

        <Route
          path="/buyer/profile"
          element={
            <DemoPage
              title="Buyer Profile"
              description="View and manage your business profile, location and account information."
            />
          }
        />


        {/* =================================================
            FALLBACK
        ================================================= */}

        <Route
          path="*"
          element={<LandingScreen />}
        />

      </Routes>

    </BrowserRouter>
  );
}


/* =========================================================
   EXPORT
========================================================= */

export default App;