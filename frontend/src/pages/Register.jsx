import { useState } from "react";
import { registerUser } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("BUYER");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const userdata = {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      };

      const result =
        await registerUser(userdata);

      /*
       * Preserve your existing backend response.
       */
      if (result.data?.token) {
        localStorage.setItem(
          "token",
          result.data.token
        );
      }

      setSuccess(
        "Account created successfully. Redirecting..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 900);

    } catch (err) {
      console.error(
        "Registration error:",
        err
      );

      setError(
  err.response?.data?.error?.message ||
    err.response?.data?.message ||
    err.message ||
    "Registration failed. Please try again."
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
            Grow your business.
            <br />
            <span>Build better connections.</span>
          </h2>

          <p>
            Join a modern agricultural marketplace
            built for direct farmer and buyer
            connections.
          </p>

          <div className="auth-feature-list">

            <div className="auth-feature">
              <span>✓</span>
              <div>
                <strong>For farmers</strong>
                <small>
                  List your crops and receive buyer bids.
                </small>
              </div>
            </div>

            <div className="auth-feature">
              <span>✓</span>
              <div>
                <strong>For buyers</strong>
                <small>
                  Discover fresh produce from farmers.
                </small>
              </div>
            </div>

            <div className="auth-feature">
              <span>✓</span>
              <div>
                <strong>One connected marketplace</strong>
                <small>
                  Manage orders, contracts and payments.
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
          REGISTER PANEL
          ===================================================== */}

      <div className="auth-form-panel">

        <div className="auth-mobile-brand">
          <span>🌾</span>
          KhetiMarket
        </div>

        <div className="auth-form-container register">

          <div className="auth-heading">

            <span className="auth-kicker">
              Get started
            </span>

            <h1>
              Create your account
            </h1>

            <p>
              Choose your role and join the
              KhetiMarket marketplace.
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

          {success && (
            <div className="auth-success">

              <span>✓</span>

              <div>{success}</div>

            </div>
          )}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            {/* NAME */}

            <div className="auth-field">

              <label htmlFor="register-name">
                Full name
              </label>

              <div className="auth-input-wrapper">

                <span className="auth-input-icon">
                  ◉
                </span>

                <input
                  id="register-name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  autoComplete="name"
                  required
                />

              </div>

            </div>

            {/* EMAIL */}

            <div className="auth-field">

              <label htmlFor="register-email">
                Email address
              </label>

              <div className="auth-input-wrapper">

                <span className="auth-input-icon">
                  @
                </span>

                <input
                  id="register-email"
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

            {/* ROLE */}

            <div className="auth-field">

              <label>
                I want to join as
              </label>

              <div className="auth-role-grid">

                <button
                  type="button"
                  className={`auth-role-card ${
                    role === "BUYER"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setRole("BUYER")
                  }
                >
                  <span className="auth-role-icon">
                    🛒
                  </span>

                  <span>
                    <strong>Buyer</strong>
                    <small>
                      Find & purchase crops
                    </small>
                  </span>

                  <i>
                    {role === "BUYER"
                      ? "✓"
                      : ""}
                  </i>

                </button>

                <button
                  type="button"
                  className={`auth-role-card ${
                    role === "FARMER"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setRole("FARMER")
                  }
                >
                  <span className="auth-role-icon">
                    🌱
                  </span>

                  <span>
                    <strong>Farmer</strong>
                    <small>
                      Sell your produce
                    </small>
                  </span>

                  <i>
                    {role === "FARMER"
                      ? "✓"
                      : ""}
                  </i>

                </button>

              </div>

            </div>

            {/* PASSWORD */}

            <div className="auth-field">

              <label htmlFor="register-password">
                Password
              </label>

              <div className="auth-input-wrapper">

                <span className="auth-input-icon">
                  •••
                </span>

                <input
                  id="register-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  autoComplete="new-password"
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
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
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
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <span>→</span>
                </>
              )}

            </button>

          </form>

          <div className="auth-switch">

            Already have an account?

            <Link to="/login">
              Sign in
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;