import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Leaf,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ShoppingCart,
  Store,
} from "lucide-react";

function BuyerLogin() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Frontend demo login
    localStorage.setItem("buyerLoggedIn", "true");

    navigate("/buyer/dashboard");
  };

  return (
    <div className="auth-page">

      {/* =================================================
          BACK TO HOME
      ================================================= */}

      <button
        className="auth-back-button"
        onClick={() => navigate("/")}
      >
        <ArrowLeft size={18} />
        Back to Home
      </button>


      {/* =================================================
          MAIN AUTH CONTAINER
      ================================================= */}

      <div className="auth-container">

        {/* =================================================
            LEFT BRAND PANEL
        ================================================= */}

        <div className="auth-brand-panel">

          {/* LOGO */}

          <div className="auth-brand-logo">

            <div className="auth-logo-icon">
              <Leaf size={30} />
            </div>

            <span>AgriLink AI</span>

          </div>


          {/* BRAND CONTENT */}

          <div className="auth-brand-content">

            <div className="auth-small-badge">
              <ShoppingCart size={16} />
              <span>Connecting Buyers & Farmers</span>
            </div>


            <h1>
              Welcome back,
              <br />
              <span>Buyer.</span>
            </h1>


            <p>
              Find fresh crops directly from farmers,
              post your requirements, compare offers and
              build trusted agricultural connections.
            </p>


            {/* BENEFITS */}

            <div className="auth-benefits">

              <div className="auth-benefit">

                <div className="auth-benefit-icon">
                  <ShoppingCart size={18} />
                </div>

                <div>
                  <strong>Source Directly From Farmers</strong>
                  <span>
                    Discover fresh harvests without unnecessary middlemen.
                  </span>
                </div>

              </div>


              <div className="auth-benefit">

                <div className="auth-benefit-icon">
                  <Store size={18} />
                </div>

                <div>
                  <strong>Find the Right Suppliers</strong>
                  <span>
                    Compare crops, prices and nearby farmers.
                  </span>
                </div>

              </div>

            </div>

          </div>


          {/* FOOTER */}

          <div className="auth-brand-footer">
            <span>🌱</span>
            <p>
              Building a better agricultural marketplace
            </p>
          </div>

        </div>


        {/* =================================================
            RIGHT FORM PANEL
        ================================================= */}

        <div className="auth-form-panel">

          <div className="auth-form-wrapper">


            {/* FORM HEADING */}

            <div className="auth-form-heading">

              <div className="auth-form-icon">
                <ShoppingCart size={25} />
              </div>

              <h2>Buyer Login</h2>

              <p>
                Login to manage your requirements,
                listings and farmer connections.
              </p>

            </div>


            {/* =================================================
                LOGIN FORM
            ================================================= */}

            <form
              onSubmit={handleLogin}
              className="auth-form"
            >

              {/* PHONE */}

              <div className="auth-field">

                <label htmlFor="buyer-phone">
                  Phone Number
                </label>

                <div className="auth-input-wrapper">

                  <Phone
                    size={20}
                    className="auth-input-icon"
                  />

                  <input
                    id="buyer-phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />

                </div>

              </div>


              {/* PASSWORD */}

              <div className="auth-field">

                <label htmlFor="buyer-password">
                  Password
                </label>

                <div className="auth-input-wrapper">

                  <Lock
                    size={20}
                    className="auth-input-icon"
                  />

                  <input
                    id="buyer-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />


                  {/* SHOW / HIDE PASSWORD */}

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >

                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}

                  </button>

                </div>

              </div>


              {/* OPTIONS */}

              <div className="auth-form-options">

                <label className="remember-me">

                  <input type="checkbox" />

                  <span>
                    Remember me
                  </span>

                </label>


                <button
                  type="button"
                  className="forgot-password"
                >
                  Forgot password?
                </button>

              </div>


              {/* LOGIN BUTTON */}

              <button
                type="submit"
                className="auth-submit-button"
              >

                <span>
                  Login as Buyer
                </span>

                <ArrowLeft
                  size={19}
                  className="login-arrow"
                />

              </button>

            </form>


            {/* =================================================
                REGISTER
            ================================================= */}

            <div className="auth-divider">
              <span>New to AgriLink?</span>
            </div>


            <button
              className="auth-register-button"
              onClick={() => navigate("/buyer/register")}
            >
              Create Buyer Account
            </button>


            {/* FOOTER TEXT */}

            <p className="auth-bottom-text">
              By continuing, you agree to AgriLink AI's
              terms and privacy policy.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default BuyerLogin;