import { useEffect, useMemo, useState } from "react";
import {
  getAllProducts,
  deleteProduct,
} from "../../services/productService";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function MyProducts() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sort, setSort] = useState("newest");

  const [deletingId, setDeletingId] = useState(null);

  async function fetchMyProducts() {
    try {
      setLoading(true);
      setError("");

      const response = await getAllProducts();

      const allProducts = response.data.data.items;

      const myProducts = allProducts.filter(
        (product) =>
          product.farmer === user.id ||
          product.farmer?._id === user.id
      );

      setProducts(myProducts);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setError("Failed to load your products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchMyProducts();
    }
  }, [user?.id]);

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this listing?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");

      await deleteProduct(id, token);

      setProducts((prev) =>
        prev.filter((product) => product._id !== id)
      );
    } catch (error) {
      console.error("Failed to delete product:", error);
      setError("Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (search.trim()) {
      const searchTerm = search.toLowerCase();

      result = result.filter((product) =>
        [
          product.cropName,
          product.location,
          product.unit,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(searchTerm)
          )
      );
    }

    if (statusFilter !== "ALL") {
      result = result.filter(
        (product) => product.status === statusFilter
      );
    }

    result.sort((a, b) => {
      if (sort === "price_low") {
        return (a.minPrice || 0) - (b.minPrice || 0);
      }

      if (sort === "price_high") {
        return (b.minPrice || 0) - (a.minPrice || 0);
      }

      if (sort === "quantity") {
        return (b.quantity || 0) - (a.quantity || 0);
      }

      return (
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
      );
    });

    return result;
  }, [products, search, statusFilter, sort]);

  const activeCount = products.filter(
    (product) => product.status === "ACTIVE"
  ).length;

  const contractedCount = products.filter(
    (product) => product.status === "CONTRACTED"
  ).length;

  const cancelledCount = products.filter(
    (product) => product.status === "CANCELLED"
  ).length;

  if (loading) {
    return (
      <div className="farmer-products-page">
        <div className="farmer-products-container">

          <div className="products-loading-header">
            <div className="loading-line loading-title" />
            <div className="loading-line loading-subtitle" />
          </div>

          <div className="products-skeleton-grid">
            {[1, 2, 3].map((item) => (
              <div
                className="product-skeleton"
                key={item}
              >
                <div className="skeleton-image" />
                <div className="skeleton-content">
                  <div className="loading-line" />
                  <div className="loading-line short" />
                  <div className="loading-line" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="farmer-products-page">

      {/* HEADER */}

      

      <main className="farmer-products-container">

        {/* PAGE HERO */}

        <section className="farmer-products-hero">

          <div>
            <div className="farmer-products-eyebrow">
              FARMER MARKETPLACE
            </div>

            <h1>My Listings</h1>

            <p>
              Manage your crops, monitor availability,
              and respond to buyer offers.
            </p>
          </div>

          <button
            className="add-listing-button hero-add-button"
            onClick={() => navigate("/farmer/add-product")}
          >
            <span>+</span>
            Add New Listing
          </button>

        </section>

        {/* ERROR */}

        {error && (
          <div className="farmer-alert">
            <span>!</span>
            <p>{error}</p>
            <button onClick={() => setError("")}>
              ×
            </button>
          </div>
        )}

        {/* STATS */}

        <section className="listing-stats">

          <div className="listing-stat-card">

            <div className="listing-stat-icon total">
              🌾
            </div>

            <div>
              <span>Total listings</span>
              <strong>{products.length}</strong>
            </div>

          </div>

          <div className="listing-stat-card">

            <div className="listing-stat-icon active">
              ●
            </div>

            <div>
              <span>Active</span>
              <strong>{activeCount}</strong>
            </div>

          </div>

          <div className="listing-stat-card">

            <div className="listing-stat-icon contracted">
              ✓
            </div>

            <div>
              <span>Contracted</span>
              <strong>{contractedCount}</strong>
            </div>

          </div>

          <div className="listing-stat-card">

            <div className="listing-stat-icon cancelled">
              ×
            </div>

            <div>
              <span>Cancelled</span>
              <strong>{cancelledCount}</strong>
            </div>

          </div>

        </section>

        {/* TOOLBAR */}

        <section className="listing-toolbar">

          <div className="listing-search">

            <span>⌕</span>

            <input
              type="text"
              placeholder="Search your listings..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {search && (
              <button
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}

          </div>

          <div className="listing-filters">

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option value="ALL">
                All status
              </option>

              <option value="ACTIVE">
                Active
              </option>

              <option value="CONTRACTED">
                Contracted
              </option>

              <option value="CANCELLED">
                Cancelled
              </option>
            </select>

            <select
              value={sort}
              onChange={(e) =>
                setSort(e.target.value)
              }
            >
              <option value="newest">
                Newest first
              </option>

              <option value="price_low">
                Price: Low to High
              </option>

              <option value="price_high">
                Price: High to Low
              </option>

              <option value="quantity">
                Highest quantity
              </option>
            </select>

          </div>

        </section>

        {/* RESULTS HEADER */}

        <div className="listing-results-header">

          <div>
            <h2>
              Your inventory
            </h2>

            <span>
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1
                ? "listing"
                : "listings"}
            </span>
          </div>

          {(search ||
            statusFilter !== "ALL") && (
            <button
              className="clear-filters-button"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
              }}
            >
              Clear filters
            </button>
          )}

        </div>

        {/* EMPTY STATE */}

        {products.length === 0 ? (

          <div className="listing-empty-state">

            <div className="empty-illustration">
              🌱
            </div>

            <h2>
              Your marketplace starts here
            </h2>

            <p>
              Add your first crop listing and
              start connecting with buyers.
            </p>

            <button
              className="add-listing-button"
              onClick={() =>
                navigate("/farmer/add-product")
              }
            >
              <span>+</span>
              Add your first listing
            </button>

          </div>

        ) : filteredProducts.length === 0 ? (

          <div className="listing-empty-state compact">

            <div className="empty-illustration">
              🔎
            </div>

            <h2>
              No matching listings
            </h2>

            <p>
              Try changing your search or filters.
            </p>

            <button
              className="clear-filters-button"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
              }}
            >
              Clear filters
            </button>

          </div>

        ) : (

          /* PRODUCT GRID */

          <section className="farmer-product-grid">

            {filteredProducts.map((product) => {

              const isActive =
                product.status === "ACTIVE";

              const isContracted =
                product.status === "CONTRACTED";

              return (
                <article
                  className="farmer-product-card"
                  key={product._id}
                >

                  {/* CARD VISUAL */}

                  <div className="farmer-product-visual">

                    <div className="farmer-crop-symbol">
                      🌾
                    </div>

                    <span
                      className={`listing-status ${
                        isActive
                          ? "listing-status-active"
                          : isContracted
                          ? "listing-status-contracted"
                          : "listing-status-cancelled"
                      }`}
                    >
                      <span />
                      {product.status}
                    </span>

                    <span className="listing-unit">
                      {product.unit}
                    </span>

                  </div>

                  {/* CARD CONTENT */}

                  <div className="farmer-product-content">

                    <div className="farmer-product-heading">

                      <div>
                        <span className="crop-label">
                          CROP LISTING
                        </span>

                        <h3>
                          {product.cropName}
                        </h3>
                      </div>

                      <div className="product-menu-dot">
                        •••
                      </div>

                    </div>

                    {/* PRICE */}

                    <div className="farmer-price-row">

                      <div>
                        <span>
                          Minimum price
                        </span>

                        <strong>
                          ₹
                          {product.minPrice?.toLocaleString(
                            "en-IN"
                          )}
                        </strong>
                      </div>

                      <small>
                        / {product.unit}
                      </small>

                    </div>

                    {/* META */}

                    <div className="farmer-product-meta">

                      <div>
                        <span>📦</span>

                        <div>
                          <small>
                            Available
                          </small>

                          <strong>
                            {product.quantity}{" "}
                            {product.unit}
                          </strong>
                        </div>
                      </div>

                      <div>
                        <span>📍</span>

                        <div>
                          <small>
                            Location
                          </small>

                          <strong>
                            {product.location ||
                              "Not specified"}
                          </strong>
                        </div>
                      </div>

                    </div>

                    {/* HARVEST */}

                    {product.expectedHarvestDate && (
                      <div className="harvest-row">
                        <span>📅</span>

                        <span>
                          Harvest:
                          {" "}
                          {new Date(
                            product.expectedHarvestDate
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    )}

                    {/* ACTIONS */}

                    <div className="farmer-product-actions">

                      <button
                        className="view-bids-button"
                        onClick={() =>
                          navigate(
                            `/farmer/listings/${product._id}/bids`
                          )
                        }
                      >
                        View Bids
                        <span>→</span>
                      </button>

                      <button
                        className="delete-listing-button"
                        onClick={() =>
                          handleDelete(product._id)
                        }
                        disabled={
                          deletingId === product._id
                        }
                        title="Delete listing"
                      >
                        {deletingId === product._id
                          ? "..."
                          : "🗑"}
                      </button>

                    </div>

                  </div>

                </article>
              );
            })}

          </section>
        )}

      </main>

    </div>
  );
}