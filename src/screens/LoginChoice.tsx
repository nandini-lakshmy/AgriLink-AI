import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Leaf,
  Sprout,
  ShoppingCart,
  UserRound,
} from "lucide-react";

function LoginChoice() {
  const navigate = useNavigate();

  return (
    <div className="login-choice-page">

      {/* =================================================
          BACK TO HOME
      ================================================= */}

      <button
        className="login-choice-back"
        onClick={() => navigate("/")}
      >
        <ArrowLeft size={18} />
        Back to Home
      </button>


      {/* =================================================
          MAIN CARD
      ================================================= */}

      <div className="login-choice-card">

        {/* LOGO */}

        <div className="login-choice-logo">
          <div className="login-choice-logo-icon">
            <Leaf size={28} />
          </div>

          <span>AgriLink AI</span>
        </div>


        {/* HEADER */}

        <div className="login-choice-header">

          <div className="login-choice-header-icon">
            <UserRound size={25} />
          </div>

          <h1>Welcome Back</h1>

          <p>
            Choose how you want to continue with AgriLink AI.
          </p>

        </div>


        {/* OPTIONS */}

        <div className="login-choice-options">

          {/* FARMER */}

          <button
            className="login-choice-option farmer-choice"
            onClick={() => navigate("/farmer/login")}
          >

            <div className="login-choice-option-icon">
              <Sprout size={30} />
            </div>

            <div className="login-choice-option-content">

              <h2>I'm a Farmer</h2>

              <p>
                Login to manage your crops, listings,
                offers and buyers.
              </p>

              <span className="login-choice-action">
                Continue as Farmer
                <ArrowLeft size={17} />
              </span>

            </div>

          </button>


          {/* BUYER */}

          <button
            className="login-choice-option buyer-choice"
            onClick={() => navigate("/buyer/login")}
          >

            <div className="login-choice-option-icon">
              <ShoppingCart size={30} />
            </div>

            <div className="login-choice-option-content">

              <h2>I'm a Buyer</h2>

              <p>
                Login to manage your requirements,
                listings and farmer connections.
              </p>

              <span className="login-choice-action">
                Continue as Buyer
                <ArrowLeft size={17} />
              </span>

            </div>

          </button>

        </div>


        {/* REGISTER */}

        <div className="login-choice-register">

          <span>
            Don't have an account?
          </span>

          <div>

            <button
              onClick={() => navigate("/farmer/register")}
            >
              Register as Farmer
            </button>

            <span>or</span>

            <button
              onClick={() => navigate("/buyer/register")}
            >
              Register as Buyer
            </button>

          </div>

        </div>


        {/* FOOTER */}

        <p className="login-choice-footer">
          🌱 Connecting farmers and buyers for better
          agricultural trade.
        </p>

      </div>

    </div>
  );
}

export default LoginChoice;