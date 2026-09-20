import { useState } from "react";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const userdata = {
        email: email.trim(),
        password,
      };

      await login(userdata);

      navigate("/");
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">

      {/* =====================================================
          LEFT BRAND PANEL
          ===================================================== */}

      <div className="auth-brand-panel">

        <div className="auth-brand-content">

          <div className="auth-logo">
            🌾
          </div>

          <div className="auth-brand-name">
            KhetiMarket
          </div>

          <div className="auth-brand-divider" />

          <h2>
            From the farm
            <br />
            <span>to the market.</span>
          </h2>

          <p>
            A smarter marketplace connecting
            farmers directly with buyers.
          </p>

          <div className="auth-feature-list">

            <div className="auth-feature">
              <span>✓</span>
              <div>
                <strong>Direct connections</strong>
                <small>
                  Connect farmers and buyers directly.
                </small>
              </div>
            </div>

            <div className="auth-feature">
              <span>✓</span>
              <div>
                <strong>Fair negotiations</strong>
                <small>
                  Bid, negotiate and make better deals.
                </small>
              </div>
            </div>

            <div className="auth-feature">
              <span>✓</span>
              <div>
                <strong>Track every order</strong>
                <small>
                  Follow contracts, payments and deliveries.
                </small>
              </div>
            </div>

          </div>

        </div>

        <div className="auth-brand-footer">
          © {new Date().getFullYear()} KhetiMarket
        </div>

      </div>

      {/* =====================================================
          LOGIN PANEL
          ===================================================== */}

      <div className="auth-form-panel">

        <div className="auth-mobile-brand">
          <span>🌾</span>
          KhetiMarket
        </div>

        <div className="auth-form-container">

          <div className="auth-heading">

            <span className="auth-kicker">
              Welcome back
            </span>

            <h1>
              Login to your account
            </h1>

            <p>
              Access your marketplace workspace
              and continue where you left off.
            </p>

          </div>

          {error && (
            <div className="auth-error">
              <span>!</span>
              <div>{error}</div>

              <button
                type="button"
                onClick={() => setError("")}
              >
                ×
              </button>
            </div>
          )}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            {/* EMAIL */}

            <div className="auth-field">

              <label htmlFor="login-email">
                Email address
              </label>

              <div className="auth-input-wrapper">

                <span className="auth-input-icon">
                  @
                </span>

                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  autoComplete="email"
                  required
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div className="auth-field">

              <label htmlFor="login-password">
                Password
              </label>

              <div className="auth-input-wrapper">

                <span className="auth-input-icon">
                  •••
                </span>

                <input
                  id="login-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>

            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="auth-spinner" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <span>→</span>
                </>
              )}

            </button>

          </form>

          <div className="auth-switch">

            Don't have an account?

            <Link to="/register">
              Create one
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;