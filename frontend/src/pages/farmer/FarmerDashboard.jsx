import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/api";

export default function FarmerDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    delivered: 0,
    pending: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          "{API_URL}/api/v1/orders/dashboard/farmer",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Dashboard response:", response.data);

        setStats({
          totalOrders: response.data?.totalOrders || 0,
          delivered: response.data?.delivered || 0,
          pending: response.data?.pending || 0,
        });
      } catch (error) {
        console.error("Dashboard error:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchDashboard();
    }
  }, [token]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      
      <div className="farmer-dashboard">
        {/* <nav className="farmer-navbar">

  <div className="farmer-navbar-brand">
    <span>🌱</span>
    KhetiMarket
  </div>

  <div className="farmer-navbar-links">

    <button className="active">
      Dashboard
    </button>

    <button
      onClick={() =>
        navigate("/farmer/my-products")
      }
    >
      My Products
    </button>

    <button
      onClick={() =>
        navigate("/farmer/orders")
      }
    >
      Orders
    </button>

    <button
      onClick={() =>
        navigate("/contracts")
      }
    >
      Contracts
    </button>

  </div>

  <div className="farmer-profile-wrapper">

    <button
      className="farmer-profile-button"
      onClick={() =>
        setProfileOpen((prev) => !prev)
      }
    >
      <div className="farmer-profile-avatar">
        {user?.name?.charAt(0)?.toUpperCase() || "F"}
      </div>

      <div className="farmer-profile-info">
        <strong>
          {user?.name || "Farmer"}
        </strong>

        <span>
          FARMER
        </span>
      </div>

      <span>
        {profileOpen ? "⌃" : "⌄"}
      </span>
    </button>

    {profileOpen && (
      <div className="farmer-profile-menu">

        <button
          onClick={() => {
            setProfileOpen(false);
            navigate("/profile");
          }}
        >
          👤 Account Details
        </button>

        <button
          className="logout"
          onClick={() => {
            logout();
            navigate("/login", {
              replace: true,
            });
          }}
        >
          ↪ Logout
        </button>

      </div>
    )}

  </div>

</nav> */}
        <div className="dashboard-loading">

          <div className="dashboard-skeleton hero" />

          <div className="dashboard-stat-grid">
            <div className="dashboard-skeleton stat" />
            <div className="dashboard-skeleton stat" />
            <div className="dashboard-skeleton stat" />
          </div>

          <div className="dashboard-skeleton content" />

        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="farmer-dashboard">
        <div className="dashboard-error">

          <div className="dashboard-error-icon">
            ⚠
          </div>

          <h2>
            Couldn't load your dashboard
          </h2>

          <p>{error}</p>

          <button
            className="dashboard-primary-btn"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>

        </div>
      </div>
    );
  }

  // =========================================================
  // DASHBOARD
  // =========================================================

  return (
    <div className="farmer-dashboard">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="dashboard-hero">

        <div className="dashboard-hero-content">

          <div className="dashboard-eyebrow">
            <span className="dashboard-eyebrow-dot" />
            Farmer workspace
          </div>

          <h1>
            Good day,{" "}
            <span>
              {user?.name || "Farmer"}
            </span>
          </h1>

          <p>
            Keep track of your orders, deliveries,
            and marketplace activity from one place.
          </p>

          <div className="dashboard-actions">

            <button
              className="dashboard-primary-btn"
              onClick={() =>
                navigate("/farmer/add-product")
              }
            >
              <span>＋</span>
              Add Product
            </button>

            <button
              className="dashboard-secondary-btn"
              onClick={() =>
                navigate("/farmer/my-products")
              }
            >
              View My Products
              <span>→</span>
            </button>

          </div>

        </div>

        <div className="dashboard-hero-visual">

          <div className="dashboard-orbit orbit-one" />
          <div className="dashboard-orbit orbit-two" />

          <div className="dashboard-farm-icon">
            🌾
          </div>

          <div className="dashboard-floating-card orders">
            <span className="floating-icon">
              📦
            </span>

            <div>
              <strong>
                {stats.totalOrders}
              </strong>
              <small>Total orders</small>
            </div>
          </div>

          <div className="dashboard-floating-card delivered">
            <span className="floating-icon">
              ✓
            </span>

            <div>
              <strong>
                {stats.delivered}
              </strong>
              <small>Delivered</small>
            </div>
          </div>

        </div>

      </section>

      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <section className="dashboard-stat-grid">

        <div className="dashboard-stat-card">

          <div className="dashboard-stat-top">

            <div className="dashboard-stat-icon green">
              📦
            </div>

            <span className="dashboard-stat-label">
              All orders
            </span>

          </div>

          <div className="dashboard-stat-value">
            {stats.totalOrders}
          </div>

          <p>
            Orders associated with your listings
          </p>

        </div>

        <div className="dashboard-stat-card">

          <div className="dashboard-stat-top">

            <div className="dashboard-stat-icon blue">
              ✓
            </div>

            <span className="dashboard-stat-label">
              Delivered
            </span>

          </div>

          <div className="dashboard-stat-value">
            {stats.delivered}
          </div>

          <p>
            Successfully completed deliveries
          </p>

        </div>

        <div className="dashboard-stat-card">

          <div className="dashboard-stat-top">

            <div className="dashboard-stat-icon orange">
              ⏳
            </div>

            <span className="dashboard-stat-label">
              Pending
            </span>

          </div>

          <div className="dashboard-stat-value">
            {stats.pending}
          </div>

          <p>
            Orders that still need attention
          </p>

        </div>

      </section>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <section className="dashboard-content-grid">

        {/* QUICK ACTIONS */}

        <div className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>
              <span className="dashboard-section-kicker">
                Workspace
              </span>

              <h2>
                Quick actions
              </h2>
            </div>

          </div>

          <div className="dashboard-action-grid">

            <button
              className="dashboard-action-card"
              onClick={() =>
                navigate("/farmer/add-product")
              }
            >
              <div className="dashboard-action-icon">
                🌱
              </div>

              <div>
                <strong>
                  Add a product
                </strong>

                <span>
                  List fresh produce
                </span>
              </div>

              <b>→</b>
            </button>

            <button
              className="dashboard-action-card"
              onClick={() =>
                navigate("/farmer/my-products")
              }
            >
              <div className="dashboard-action-icon">
                🧺
              </div>

              <div>
                <strong>
                  My products
                </strong>

                <span>
                  Manage your listings
                </span>
              </div>

              <b>→</b>
            </button>

            <button
              className="dashboard-action-card"
              onClick={() =>
                navigate("/farmer/orders")
              }
            >
              <div className="dashboard-action-icon">
                📋
              </div>

              <div>
                <strong>
                  Manage orders
                </strong>

                <span>
                  Track buyer orders
                </span>
              </div>

              <b>→</b>
            </button>

            <button
              className="dashboard-action-card"
              onClick={() =>
                navigate("/contracts")
              }
            >
              <div className="dashboard-action-icon">
                🤝
              </div>

              <div>
                <strong>
                  Contracts
                </strong>

                <span>
                  View active agreements
                </span>
              </div>

              <b>→</b>
            </button>

          </div>

        </div>

        {/* ACCOUNT OVERVIEW */}

        {/* <div className="dashboard-panel dashboard-account-panel">

          <div className="dashboard-panel-header">

            <div>
              <span className="dashboard-section-kicker">
                Account
              </span>

              <h2>
                Your profile
              </h2>
            </div>

          </div>

          <div className="dashboard-profile">

            <div className="dashboard-profile-avatar">
              {user?.name
                ?.charAt(0)
                ?.toUpperCase() || "F"}
            </div>

            <div className="dashboard-profile-info">

              <strong>
                {user?.name || "Farmer"}
              </strong>

              <span>
                {user?.email || "No email available"}
              </span>

              <div className="dashboard-role">
                🌾 Farmer account
              </div>

            </div>

          </div>

          <div className="dashboard-account-divider" />

          <div className="dashboard-account-row">

            <span>
              Account status
            </span>

            <strong className="dashboard-status-active">
              <span />
              Active
            </strong>

          </div>

          <div className="dashboard-account-row">

            <span>
              Marketplace
            </span>

            <strong>
              KhetiMarket
            </strong>

          </div>

          

        </div> */}

      </section>

      {/* =====================================================
          PERFORMANCE SECTION
      ===================================================== */}

      <section className="dashboard-bottom-panel">

        <div className="dashboard-bottom-heading">

          <div>
            <span className="dashboard-section-kicker">
              Overview
            </span>

            <h2>
              Order performance
            </h2>
          </div>

          <span className="dashboard-period">
            Current totals
          </span>

        </div>

        <div className="dashboard-performance">

          <div className="performance-item">

            <div className="performance-label">
              <span>
                Delivered
              </span>

              <strong>
                {stats.totalOrders > 0
                  ? Math.round(
                      (stats.delivered /
                        stats.totalOrders) *
                        100
                    )
                  : 0}
                %
              </strong>
            </div>

            <div className="performance-bar">
              <span
                style={{
                  width: `${
                    stats.totalOrders > 0
                      ? Math.min(
                          100,
                          (stats.delivered /
                            stats.totalOrders) *
                            100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>

          </div>

          <div className="performance-item">

            <div className="performance-label">
              <span>
                Pending
              </span>

              <strong>
                {stats.totalOrders > 0
                  ? Math.round(
                      (stats.pending /
                        stats.totalOrders) *
                        100
                    )
                  : 0}
                %
              </strong>
            </div>

            <div className="performance-bar pending">
              <span
                style={{
                  width: `${
                    stats.totalOrders > 0
                      ? Math.min(
                          100,
                          (stats.pending /
                            stats.totalOrders) *
                            100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>

          </div>

          <div className="performance-summary">

            <div className="performance-summary-icon">
              🌾
            </div>

            <div>
              <strong>
                Keep growing
              </strong>

              <span>
                Manage your listings and orders
                to keep your marketplace active.
              </span>
            </div>

          </div>

        </div>

      </section>

    </div>
  );
}