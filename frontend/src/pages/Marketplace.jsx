import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllProducts } from "../services/productService";
import { useNavigate } from "react-router-dom";

function ProductCard({
  id,
  name,
  price,
  location,
  quantity,
  unit
}) {
  const navigate = useNavigate();

  return (
    <article className="product-card">
      <div className="product-icon">
        🌾
      </div>

      <h2>{name}</h2>

      <div className="product-price">
        ₹{Number(price || 0).toLocaleString("en-IN")}
        <span> / {unit}</span>
      </div>

      <div className="product-meta">
        <div className="product-meta-row">
          <span>Available</span>
          <strong>
            {quantity} {unit}
          </strong>
        </div>

        <div className="product-meta-row">
          <span>Location</span>
          <strong>
            📍 {location || "Not specified"}
          </strong>
        </div>
      </div>

      <button
        className="view-product-button"
        onClick={() =>
          navigate(`/product/${id}`)
        }
      >
        View Produce →
      </button>
    </article>
  );
}

function Marketplace() {
  const [products, setProducts] = useState([]);

  const [showProducts, setShowProducts] =
    useState(true);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [crop, setCrop] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [sort, setSort] =
    useState("latest");

  const navigate = useNavigate();

  const [nextCursor, setNextCursor] =
    useState(null);

  const [hasMore, setHasMore] =
    useState(false);
    const { user, logout } = useAuth();

const [profileOpen, setProfileOpen] = useState(false);

  // ==========================================
  // FETCH PRODUCTS
  // ==========================================

  async function fetchProducts(
    cursor = null,
    append = false
  ) {
    try {
      setLoading(true);
      setError("");

      const response =
        await getAllProducts({
          crop,
          location,
          sort,
          ...(cursor && { cursor })
        });

      const data =
        response.data.data;

      if (append) {
        setProducts((prev) => [
          ...prev,
          ...data.items
        ]);
      } else {
        setProducts(data.items);
      }

      setNextCursor(
        data.nextCursor
      );

      setHasMore(
        data.hasMore
      );
    } catch (error) {
      console.error(
        "Failed to fetch products:",
        error
      );

      setError(
        "Failed to load products."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchProducts();
  }, []);

  // ==========================================
  // SEARCH
  // ==========================================

  function handleSearch() {
    setNextCursor(null);
    fetchProducts();
  }

  // ==========================================
  // LOAD MORE
  // ==========================================

  function handleLoadMore() {
    if (nextCursor) {
      fetchProducts(
        nextCursor,
        true
      );
    }
  }

  return (
    <div className="marketplace">

      {/* ======================================
          NAVIGATION
      ====================================== */}

     {/* <nav className="marketplace-nav">

  <div className="marketplace-nav-left">

    <div className="brand">
      <span className="brand-icon">
        🌱
      </span>

      KhetiMarket
    </div>

  </div>

  <div className="nav-links">

          <button
            className="nav-button active"
            onClick={() =>
              navigate("/buyer")
            }
          >
            Marketplace
          </button>

          <button
            className="nav-button"
            onClick={() =>
              navigate(
                "/buyer/orders"
              )
            }
          >
            My Orders
          </button>

          <button
            className="nav-button"
            onClick={() =>
              navigate(
                "/contracts"
              )
            }
          >
            My Contracts
          </button>

        </div>
        <div className="marketplace-profile-wrapper">

  <button
    className="marketplace-profile-button"
    onClick={() =>
      setProfileOpen((prev) => !prev)
    }
  >
    <div className="marketplace-profile-avatar">
      {user?.name?.charAt(0)?.toUpperCase() || "B"}
    </div>

    <strong>{user?.name || "Buyer"}</strong>
<span>{user?.role || "BUYER"}</span>

    <span className="marketplace-profile-arrow">
      {profileOpen ? "⌃" : "⌄"}
    </span>
  </button>

  {profileOpen && (
    <div className="marketplace-profile-menu">

      <div className="marketplace-profile-menu-header">
        <div className="marketplace-profile-avatar large">
          B
        </div>

        <div>
          <strong>Buyer Account</strong>
          <span>Manage your account</span>
        </div>
      </div>

      <div className="marketplace-profile-divider" />

      <button
        onClick={() => {
          setProfileOpen(false);
          navigate("/profile");
        }}
      >
        👤
        Account Details
      </button>

      <button
        onClick={() => {
          setProfileOpen(false);
          logout();
          navigate("/login", { replace: true });
        }}
        className="logout"
      >
        ↪
        Logout
      </button>

    </div>
  )}

</div>
      </nav> */}

      <main className="marketplace-content">

        {/* ======================================
            HERO
        ====================================== */}

        <section className="marketplace-hero">

          <span className="hero-eyebrow">
            🌾 Direct farmer marketplace
          </span>

          <h1>
            Buy directly from{" "}
            <span className="hero-highlight">
              farmers.
            </span>
          </h1>

          <p>
            Discover fresh agricultural
            products, connect directly
            with farmers, and negotiate
            prices through a transparent
            marketplace.
          </p>

        </section>

        {/* ======================================
            SEARCH
        ====================================== */}

        <section className="search-panel">

          <div className="search-heading">

            <h2>
              Find the right produce
            </h2>

            <p>
              Search by crop or location
              and explore available
              listings.
            </p>

          </div>

          <div className="search-controls">

            <input
              className="search-field"
              type="text"
              placeholder="🔎 Search crops..."
              value={crop}
              onChange={(e) =>
                setCrop(e.target.value)
              }
            />

            <input
              className="search-field"
              type="text"
              placeholder="📍 Location"
              value={location}
              onChange={(e) =>
                setLocation(
                  e.target.value
                )
              }
            />

            <select
              className="search-field"
              value={sort}
              onChange={(e) =>
                setSort(e.target.value)
              }
            >
              <option value="latest">
                Latest listings
              </option>

              <option value="price_asc">
                Price: Low to High
              </option>

              <option value="price_desc">
                Price: High to Low
              </option>

              <option value="date_asc">
                Harvest Date
              </option>
            </select>

            <button
              className="primary-button"
              type="button"
              onClick={handleSearch}
            >
              Search
            </button>

          </div>
        </section>

        {/* ======================================
            PRODUCTS
        ====================================== */}

        <section className="products-section">

          <div className="products-heading">

            <div>
              <h2>
                Available Produce
              </h2>

              <p>
                Fresh listings from
                farmers on KhetiMarket
              </p>
            </div>

            <button
              className="text-button"
              onClick={() =>
                setShowProducts(
                  !showProducts
                )
              }
            >
              {showProducts
                ? "Hide products"
                : "Show products"}
            </button>

          </div>

          {/* Loading */}

          {loading && (
            <div className="marketplace-state">
              <p>
                Loading fresh produce...
              </p>
            </div>
          )}

          {/* Error */}

          {error && (
            <div className="marketplace-state error-state">
              <p>{error}</p>
            </div>
          )}

          {/* Products */}

          {!loading &&
            !error &&
            showProducts && (
              <>
                {products.length === 0 ? (
                  <div className="marketplace-state">
                    <p>
                      No produce found
                      for your search.
                    </p>
                  </div>
                ) : (
                  <div className="product-list">

                    {products.map(
                      (product) => (
                        <ProductCard
                          key={product._id}
                          id={product._id}
                          name={
                            product.cropName
                          }
                          price={
                            product.minPrice
                          }
                          location={
                            product.location
                          }
                          quantity={
                            product.quantity
                          }
                          unit={
                            product.unit
                          }
                        />
                      )
                    )}

                  </div>
                )}

                {/* Load More */}

                {hasMore && (
                  <div className="load-more-container">

                    <button
                      className="load-more-button"
                      type="button"
                      onClick={
                        handleLoadMore
                      }
                    >
                      Load More
                    </button>

                  </div>
                )}
              </>
            )}

        </section>

      </main>
    </div>
    
  );
}

export default Marketplace;