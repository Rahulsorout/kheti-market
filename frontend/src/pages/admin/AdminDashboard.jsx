import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { getAllProducts } from "../../services/productService";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await getAllProducts();

        const items =
          response?.data?.data?.items ||
          response?.data?.data ||
          [];

        setProducts(Array.isArray(items) ? items : []);
      } catch (error) {
        console.error("Admin dashboard error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    return {
      totalListings: products.length,

      activeListings: products.filter(
        (item) => item.status === "ACTIVE"
      ).length,

      contractedListings: products.filter(
        (item) => item.status === "CONTRACTED"
      ).length,

      cancelledListings: products.filter(
        (item) => item.status === "CANCELLED"
      ).length,
    };
  }, [products]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="admin-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="admin-topbar">

        <div className="admin-brand">
          <div className="admin-brand-icon">
            🌾
          </div>

          <div>
            <strong>KhetiMarket</strong>
            <span>Administration</span>
          </div>
        </div>

        <div className="admin-user-area">

          <div className="admin-user">

            <div className="admin-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>

            <div>
              <strong>
                {user?.name || "Administrator"}
              </strong>

              <span>
                Administrator
              </span>
            </div>

          </div>

          <button
            className="admin-logout"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="admin-container">

        {/* HERO */}

        <section className="admin-hero">

          <div>

            <span className="admin-kicker">
              CONTROL CENTER
            </span>

            <h1>
              Admin Dashboard
            </h1>

            <p>
              Monitor and manage the KhetiMarket marketplace
              from one place.
            </p>

          </div>

          <div className="admin-hero-icon">
            🛡️
          </div>

        </section>


        {/* =====================================================
            STATS
        ===================================================== */}

        <section className="admin-stat-grid">

          <div className="admin-stat-card">

            <div className="admin-stat-icon green">
              🌾
            </div>

            <div>
              <span>Total Listings</span>

              <strong>
                {loading ? "—" : stats.totalListings}
              </strong>
            </div>

          </div>


          <div className="admin-stat-card">

            <div className="admin-stat-icon blue">
              ✓
            </div>

            <div>
              <span>Active Listings</span>

              <strong>
                {loading ? "—" : stats.activeListings}
              </strong>
            </div>

          </div>


          <div className="admin-stat-card">

            <div className="admin-stat-icon orange">
              🤝
            </div>

            <div>
              <span>Contracted</span>

              <strong>
                {loading ? "—" : stats.contractedListings}
              </strong>
            </div>

          </div>


          <div className="admin-stat-card">

            <div className="admin-stat-icon red">
              !
            </div>

            <div>
              <span>Cancelled</span>

              <strong>
                {loading ? "—" : stats.cancelledListings}
              </strong>
            </div>

          </div>

        </section>


        {/* =====================================================
            MANAGEMENT
        ===================================================== */}

        <section className="admin-section">

          <div className="admin-section-heading">

            <div>
              <span className="admin-kicker">
                MANAGEMENT
              </span>

              <h2>
                Marketplace controls
              </h2>
            </div>

          </div>


          <div className="admin-action-grid">

           <button
  className="admin-action-card"
  onClick={() => navigate("/admin/users")}
>
  <div className="admin-action-icon">
    👥
  </div>

  <div>
    <strong>Users</strong>
    <span>
      Manage farmers, buyers and administrators
    </span>
  </div>

  <b>→</b>
</button>


            <button
              className="admin-action-card"
              onClick={() => navigate("/contracts")}
            >
              <div className="admin-action-icon">
                🤝
              </div>

              <div>
                <strong>
                  Contracts
                </strong>

                <span>
                  Review marketplace agreements
                </span>
              </div>

              <b>→</b>
            </button>


            <button
              className="admin-action-card"
              onClick={() => navigate("/buyer/orders")}
            >
              <div className="admin-action-icon">
                📦
              </div>

              <div>
                <strong>
                  Orders
                </strong>

                <span>
                  View order activity
                </span>
              </div>

              <b>→</b>
            </button>


            <button
              className="admin-action-card"
              onClick={() => navigate("/farmer")}
            >
              <div className="admin-action-icon">
                🌱
              </div>

              <div>
                <strong>
                  Farmer Area
                </strong>

                <span>
                  Open farmer marketplace tools
                </span>
              </div>

              <b>→</b>
            </button>

          </div>

        </section>


        {/* =====================================================
            RECENT LISTINGS
        ===================================================== */}

        <section className="admin-section">

          <div className="admin-section-heading">

            <div>
              <span className="admin-kicker">
                MARKETPLACE
              </span>

              <h2>
                Recent listings
              </h2>
            </div>

            <span className="admin-count">
              {products.length} total
            </span>

          </div>


          {loading ? (

            <div className="admin-empty">
              Loading marketplace data...
            </div>

          ) : products.length === 0 ? (

            <div className="admin-empty">
              No marketplace listings found.
            </div>

          ) : (

            <div className="admin-listings">

              {products
                .slice(0, 6)
                .map((product) => (

                  <div
                    className="admin-listing-row"
                    key={product._id}
                  >

                    <div className="admin-listing-crop">
                      <div>
                        🌾
                      </div>

                      <div>
                        <strong>
                          {product.cropName || "Unknown crop"}
                        </strong>

                        <span>
                          {product.location || "Location unavailable"}
                        </span>
                      </div>
                    </div>


                    <div className="admin-listing-price">
                      ₹
                      {Number(
                        product.minPrice || 0
                      ).toLocaleString("en-IN")}
                      <span>
                        / {product.unit || "unit"}
                      </span>
                    </div>


                    <span
                      className={`admin-status ${
                        String(product.status || "")
                          .toLowerCase()
                      }`}
                    >
                      {product.status || "UNKNOWN"}
                    </span>

                  </div>

                ))}

            </div>

          )}

        </section>


        {/* =====================================================
            ADMIN NOTE
        ===================================================== */}

        <section className="admin-notice">

          <div className="admin-notice-icon">
            🔐
          </div>

          <div>
            <strong>
              Administrator access
            </strong>

            <p>
              This dashboard is restricted to users with the
              ADMIN role.
            </p>
          </div>

        </section>

      </main>

    </div>
  );
}