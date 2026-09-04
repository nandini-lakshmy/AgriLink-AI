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
  AlertCircle,
  Loader2,
} from "lucide-react";

import { apiPost } from "../services/api";

interface FarmerLoginResponse {
  token?: string;
  accessToken?: string;
  access_token?: string;

  farmer?: {
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
  };

  user?: {
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
  };

  data?: {
    token?: string;
    accessToken?: string;
    access_token?: string;

    farmer?: {
      id?: string;
      _id?: string;
      name?: string;
      phone?: string;
      state?: string;
      district?: string;
      location?: string;
      latitude?: number;
      longitude?: number;
    };

    user?: {
      id?: string;
      _id?: string;
      name?: string;
      phone?: string;
      state?: string;
      district?: string;
      location?: string;
      latitude?: number;
      longitude?: number;
    };
  };

  message?: string;

  [key: string]: unknown;
}

/* =========================================================
   HELPER FUNCTIONS
========================================================= */

function findToken(data: unknown): string | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const obj = data as Record<string, unknown>;

  // Check common token names
  const directToken =
    obj.token ||
    obj.accessToken ||
    obj.access_token;

  if (typeof directToken === "string" && directToken.trim()) {
    return directToken.trim();
  }

  // Check nested data
  if (obj.data) {
    const nestedToken = findToken(obj.data);

    if (nestedToken) {
      return nestedToken;
    }
  }

  // Check nested farmer
  if (obj.farmer && typeof obj.farmer === "object") {
    const farmerToken = findToken(obj.farmer);

    if (farmerToken) {
      return farmerToken;
    }
  }

  // Check nested user
  if (obj.user && typeof obj.user === "object") {
    const userToken = findToken(obj.user);

    if (userToken) {
      return userToken;
    }
  }

  return null;
}

function findUser(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const obj = data as Record<string, unknown>;

  if (
    obj.farmer &&
    typeof obj.farmer === "object"
  ) {
    return obj.farmer as Record<string, unknown>;
  }

  if (
    obj.user &&
    typeof obj.user === "object"
  ) {
    return obj.user as Record<string, unknown>;
  }

  if (
    obj.data &&
    typeof obj.data === "object"
  ) {
    return findUser(obj.data);
  }

  return null;
}

/* =========================================================
   FARMER LOGIN
========================================================= */

function FarmerLogin() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  /* =========================================================
     LOGIN
  ========================================================= */

  const handleLogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");

    const cleanPhone = phone.trim();

    if (!cleanPhone) {
      setError(
        "Please enter your phone number."
      );
      return;
    }

    if (!password) {
      setError(
        "Please enter your password."
      );
      return;
    }

    setLoading(true);

    try {
      /* =====================================================
         CALL BACKEND LOGIN API
      ===================================================== */

      const response =
        await apiPost<FarmerLoginResponse>(
          "/api/farmer/login",
          {
            phone: cleanPhone,
            password: password,
          }
        );

      /* =====================================================
         DEBUG RESPONSE
      ===================================================== */

      console.log(
        "================================="
      );

      console.log(
        "FARMER LOGIN SUCCESS"
      );

      console.log(
        "Backend response:",
        response
      );

      console.log(
        "================================="
      );

      /* =====================================================
         FIND JWT TOKEN
      ===================================================== */

      const token = findToken(response);

      console.log(
        "Authentication token found:",
        !!token
      );

      if (!token) {
        console.error(
          "Backend login response does not contain a JWT token.",
          response
        );

        throw new Error(
          "Login was successful, but the server did not return an authentication token. Please contact the backend team."
        );
      }

      /* =====================================================
         SAVE JWT
      ===================================================== */

      localStorage.setItem(
        "farmerToken",
        token
      );

      /*
       * Also save common token names so that
       * other frontend screens can access it if needed.
       */
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

      /* =====================================================
         SAVE LOGIN STATUS
      ===================================================== */

      localStorage.setItem(
        "farmerLoggedIn",
        "true"
      );

      /* =====================================================
         SAVE FARMER INFORMATION
      ===================================================== */

      const farmerData =
        findUser(response);

      if (farmerData) {
        console.log(
          "Farmer information:",
          farmerData
        );

        localStorage.setItem(
          "farmerUser",
          JSON.stringify(farmerData)
        );

        if (
          typeof farmerData.name ===
          "string"
        ) {
          localStorage.setItem(
            "farmerName",
            farmerData.name
          );
        }
      }

      /* =====================================================
         FINAL TOKEN CHECK
      ===================================================== */

      const savedToken =
        localStorage.getItem(
          "farmerToken"
        );

      if (!savedToken) {
        throw new Error(
          "Authentication token could not be saved. Please try again."
        );
      }

      console.log(
        "Farmer token successfully saved."
      );

      /* =====================================================
         GO TO DASHBOARD
      ===================================================== */

      navigate(
        "/farmer/dashboard"
      );

    } catch (err) {

      console.error(
        "================================="
      );

      console.error(
        "FARMER LOGIN FAILED"
      );

      console.error(err);

      console.error(
        "================================="
      );

      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Please check your phone number and password."
      );

    } finally {

      setLoading(false);

    }
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="auth-page">

      {/* =====================================================
          BACK TO HOME
      ===================================================== */}

      <button
        className="auth-back-button"
        onClick={() =>
          navigate("/")
        }
        type="button"
      >
        <ArrowLeft size={18} />

        Back to Home
      </button>

      <div className="auth-container">

        {/* ===================================================
            LEFT SIDE
        =================================================== */}

        <div className="auth-brand-panel">

          <div className="auth-brand-logo">

            <div className="auth-logo-icon">
              <Leaf size={30} />
            </div>

            <span>
              AgriLink AI
            </span>

          </div>

          <div className="auth-brand-content">

            <div className="auth-small-badge">

              <Sprout size={16} />

              <span>
                Empowering Farmers
              </span>

            </div>

            <h1>
              Welcome back,
              <br />

              <span>
                Farmer.
              </span>
            </h1>

            <p>
              Connect with nearby buyers,
              manage your crops, compare
              offers and get better prices
              for your harvest.
            </p>

            <div className="auth-benefits">

              {/* BENEFIT 1 */}

              <div className="auth-benefit">

                <div className="auth-benefit-icon">

                  <Leaf size={18} />

                </div>

                <div>

                  <strong>
                    Sell at Better Prices
                  </strong>

                  <span>
                    Compare offers from
                    verified buyers.
                  </span>

                </div>

              </div>

              {/* BENEFIT 2 */}

              <div className="auth-benefit">

                <div className="auth-benefit-icon">

                  <Sprout size={18} />

                </div>

                <div>

                  <strong>
                    Reach Nearby Buyers
                  </strong>

                  <span>
                    Find markets and buyers
                    around you.
                  </span>

                </div>

              </div>

            </div>

          </div>

          <div className="auth-brand-footer">

            <span>
              🌱
            </span>

            <p>
              Building a better future
              for Indian farmers
            </p>

          </div>

        </div>

        {/* ===================================================
            RIGHT SIDE
        =================================================== */}

        <div className="auth-form-panel">

          <div className="auth-form-wrapper">

            {/* =================================================
                HEADING
            ================================================= */}

            <div className="auth-form-heading">

              <div className="auth-form-icon">

                <Leaf size={25} />

              </div>

              <h2>
                Farmer Login
              </h2>

              <p>
                Login to manage your crops,
                offers and buyers.
              </p>

            </div>

            {/* =================================================
                FORM
            ================================================= */}

            <form
              onSubmit={handleLogin}
              className="auth-form"
            >

              {/* ===============================================
                  PHONE
              =============================================== */}

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
                    onChange={(e) =>
                      setPhone(
                        e.target.value
                      )
                    }
                    disabled={loading}
                    required
                  />

                </div>

              </div>

              {/* ===============================================
                  PASSWORD
              =============================================== */}

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
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    disabled={loading}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    disabled={loading}
                  >

                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}

                  </button>

                </div>

              </div>

              {/* ===============================================
                  ERROR MESSAGE
              =============================================== */}

              {error && (

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 14px",
                    marginTop: "4px",
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

              {/* ===============================================
                  OPTIONS
              =============================================== */}

              <div className="auth-form-options">

                <label className="remember-me">

                  <input
                    type="checkbox"
                    disabled={loading}
                  />

                  <span>
                    Remember me
                  </span>

                </label>

                <button
                  type="button"
                  className="forgot-password"
                  disabled={loading}
                  onClick={() =>
                    alert(
                      "Password recovery will be connected later."
                    )
                  }
                >
                  Forgot password?
                </button>

              </div>

              {/* ===============================================
                  LOGIN BUTTON
              =============================================== */}

              <button
                type="submit"
                className="auth-submit-button"
                disabled={loading}
              >

                {loading ? (

                  <>
                    <Loader2
                      size={19}
                    />

                    <span>
                      Logging in...
                    </span>
                  </>

                ) : (

                  <>
                    <span>
                      Login as Farmer
                    </span>

                    <ArrowLeft
                      size={19}
                      className="login-arrow"
                    />
                  </>

                )}

              </button>

            </form>

            {/* =================================================
                REGISTER
            ================================================= */}

            <div className="auth-divider">

              <span>
                New to AgriLink?
              </span>

            </div>

            <button
              className="auth-register-button"
              onClick={() =>
                navigate(
                  "/farmer/register"
                )
              }
              type="button"
              disabled={loading}
            >
              Create Farmer Account
            </button>

            {/* =================================================
                FOOTER
            ================================================= */}

            <p className="auth-bottom-text">

              By continuing, you agree to
              AgriLink AI's terms and
              privacy policy.

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default FarmerLogin;