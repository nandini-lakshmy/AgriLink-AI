import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Leaf,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Sprout,
} from "lucide-react";

function FarmerLogin() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Frontend demo login
    localStorage.setItem("farmerLoggedIn", "true");

    navigate("/farmer/dashboard");
  };

  return (
    <div className="auth-page">
      {/* Back to Home */}
      <button
        className="auth-back-button"
        onClick={() => navigate("/")}
      >
        <ArrowLeft size={18} />
        Back to Home
      </button>

      <div className="auth-container">
        {/* LEFT SIDE */}
        <div className="auth-brand-panel">
          <div className="auth-brand-logo">
            <div className="auth-logo-icon">
              <Leaf size={30} />
            </div>

            <span>AgriLink AI</span>
          </div>

          <div className="auth-brand-content">
            <div className="auth-small-badge">
              <Sprout size={16} />
              <span>Empowering Farmers</span>
            </div>

            <h1>
              Welcome back,
              <br />
              <span>Farmer.</span>
            </h1>

            <p>
              Connect with nearby buyers, manage your crops,
              compare offers and get better prices for your harvest.
            </p>

            <div className="auth-benefits">
              <div className="auth-benefit">
                <div className="auth-benefit-icon">
                  <Leaf size={18} />
                </div>
                <div>
                  <strong>Sell at Better Prices</strong>
                  <span>Compare offers from verified buyers.</span>
                </div>
              </div>

              <div className="auth-benefit">
                <div className="auth-benefit-icon">
                  <Sprout size={18} />
                </div>
                <div>
                  <strong>Reach Nearby Buyers</strong>
                  <span>Find markets and buyers around you.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-brand-footer">
            <span>🌱</span>
            <p>Building a better future for Indian farmers</p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="auth-form-panel">
          <div className="auth-form-wrapper">

            <div className="auth-form-heading">
              <div className="auth-form-icon">
                <Leaf size={25} />
              </div>

              <h2>Farmer Login</h2>

              <p>
                Login to manage your crops, offers and buyers.
              </p>
            </div>

            <form onSubmit={handleLogin} className="auth-form">

              {/* PHONE */}
              <div className="auth-field">
                <label htmlFor="phone">
                  Phone Number
                </label>

                <div className="auth-input-wrapper">
                  <Phone
                    size={20}
                    className="auth-input-icon"
                  />

                  <input
                    id="phone"
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
                <label htmlFor="password">
                  Password
                </label>

                <div className="auth-input-wrapper">
                  <Lock
                    size={20}
                    className="auth-input-icon"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
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

              <div className="auth-form-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  className="forgot-password"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="auth-submit-button"
              >
                <span>Login as Farmer</span>
                <ArrowLeft
                  size={19}
                  className="login-arrow"
                />
              </button>
            </form>

            <div className="auth-divider">
              <span>New to AgriLink?</span>
            </div>

            <button
              className="auth-register-button"
              onClick={() => navigate("/farmer/register")}
            >
              Create Farmer Account
            </button>

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

export default FarmerLogin;