import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

import { getProductById } from "../services/productService";
import { createOrder } from "../services/orderService";
import { useAuth } from "../context/AuthContext";
import { getFarmerReviews } from "../services/reviewService";
import { createBid } from "../services/bidService";
import { SOCKET_URL } from "../config/api";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { token, user } = useAuth();

  const [product, setProduct] = useState(null);

  const [quantity, setQuantity] = useState("");

  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [bidding, setBidding] = useState(false);

  const [error, setError] = useState("");
  const [orderMessage, setOrderMessage] = useState("");
  const [bidMessage, setBidMessage] = useState("");

  const [farmerRating, setFarmerRating] = useState(null);

  const [bidPrice, setBidPrice] = useState("");
  const [bidQuantity, setBidQuantity] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");

  async function fetchProduct() {
    try {
      setLoading(true);
      setError("");

      const response = await getProductById(id);

      console.log("Product Details:", response.data);

      const productData = response.data.data;

      setProduct(productData);

      if (productData.farmer?._id) {
        try {
          const ratingResponse = await getFarmerReviews(
            productData.farmer._id,
            token
          );

          setFarmerRating(ratingResponse.data);
        } catch (ratingError) {
          console.error(
            "Failed to fetch farmer rating:",
            ratingError
          );
        }
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);

      setError(
        error.response?.data?.error?.message ||
          "Failed to load product details."
      );
    } finally {
      setLoading(false);
    }
  }

  // Real-time buyer updates
  useEffect(() => {
    if (!token || !user?.id) {
      return;
    }

    const socket = io(SOCKET_URL);

    socket.on("connect", () => {
      console.log(
        "Buyer ProductDetails socket connected:",
        socket.id
      );

      socket.emit("joinBuyer", user.id);
    });

    socket.on("bidUpdated", (updatedBid) => {
      console.log(
        "BID UPDATED IN PRODUCT DETAILS:",
        updatedBid
      );

      if (
        updatedBid.listingId?.toString() !==
        product?._id?.toString()
      ) {
        return;
      }

      if (updatedBid.status === "ACCEPTED") {
        setBidMessage(
          "Your bid has been accepted! Check your contracts for the next steps."
        );
      }

      if (updatedBid.status === "REJECTED") {
        setBidMessage(
          "Your bid was rejected by the farmer. You can submit another offer."
        );
      }
    });

    socket.on("connect_error", (error) => {
      console.error(
        "Buyer ProductDetails socket error:",
        error
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [token, user?.id, product?._id]);

  useEffect(() => {
    if (token) {
      fetchProduct();
    }
  }, [id, token]);

  async function handlePlaceOrder(e) {
    e.preventDefault();

    setError("");
    setOrderMessage("");

    const orderQuantity = Number(quantity);

    if (!orderQuantity || orderQuantity <= 0) {
      setError("Please enter a valid quantity.");
      return;
    }

    if (orderQuantity > product.quantity) {
      setError(
        `Only ${product.quantity} ${product.unit} available.`
      );
      return;
    }

    try {
      setOrdering(true);

      const response = await createOrder(
        {
          listingId: product._id,
          quantity: orderQuantity,
        },
        token
      );

      console.log("Order created:", response.data);

      setOrderMessage(
        "Order placed successfully! You can track it from My Orders."
      );

      setProduct((prev) => ({
        ...prev,
        quantity: prev.quantity - orderQuantity,
      }));

      setQuantity("");
    } catch (error) {
      console.error("Failed to place order:", error);

      setError(
        error.response?.data?.message ||
          "Failed to place order."
      );
    } finally {
      setOrdering(false);
    }
  }

  async function handlePlaceBid(e) {
    e.preventDefault();

    setError("");
    setBidMessage("");

    const price = Number(bidPrice);
    const bidQuantityValue = Number(bidQuantity);

    if (!price || price <= 0) {
      setError("Please enter a valid bid price.");
      return;
    }

    if (!bidQuantityValue || bidQuantityValue <= 0) {
      setError("Please enter a valid quantity.");
      return;
    }

    if (bidQuantityValue > product.quantity) {
      setError(
        `Only ${product.quantity} ${product.unit} available.`
      );
      return;
    }

    if (!deliveryDate) {
      setError("Please select a delivery date.");
      return;
    }

    if (price < product.minPrice) {
      setError(
        `Bid price cannot be below ₹${product.minPrice} per ${product.unit}.`
      );
      return;
    }

    try {
      setBidding(true);

      const response = await createBid(
        product._id,
        {
          price,
          quantity: bidQuantityValue,
          deliveryDate,
        },
        token
      );

      console.log("Bid created:", response.data);

      setBidMessage(
        "Offer submitted! The farmer will review your bid."
      );

      setBidPrice("");
      setBidQuantity("");
      setDeliveryDate("");
    } catch (error) {
      console.error("Failed to place bid:", error);

      setError(
        error.response?.data?.message ||
          "Failed to place bid."
      );
    } finally {
      setBidding(false);
    }
  }

  if (loading) {
    return (
      <div className="product-page">
        <div className="product-page-container">
          <div className="product-loading">
            <div className="loading-orb">🌾</div>
            <h2>Loading product...</h2>
            <p>Getting the latest crop details.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="product-page">
        <div className="product-page-container">
          <div className="product-error">
            <div className="error-icon">!</div>
            <h2>We couldn't load this product</h2>
            <p>{error}</p>

            <button
              className="primary-button"
              onClick={() => navigate("/buyer")}
            >
              Back to Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-page">
        <div className="product-page-container">
          <div className="product-error">
            <div className="error-icon">?</div>
            <h2>Product not found</h2>

            <button
              className="primary-button"
              onClick={() => navigate("/buyer")}
            >
              Back to Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isAvailable =
    product.status === "ACTIVE" &&
    product.quantity > 0;

  return (
    <div className="product-page">

      {/* TOP NAV */}

      <header className="product-topbar">
        <div className="product-topbar-inner">

          <button
            className="back-button"
            onClick={() => navigate("/buyer")}
          >
            <span>←</span>
            Marketplace
          </button>

          <div className="product-breadcrumb">
            Marketplace
            <span>/</span>
            {product.cropName}
          </div>

        </div>
      </header>

      <main className="product-page-container">

        {/* GLOBAL ERROR */}

        {error && (
          <div className="alert alert-error">
            <span>!</span>
            <p>{error}</p>
            <button onClick={() => setError("")}>
              ×
            </button>
          </div>
        )}

        {/* SUCCESS MESSAGES */}

        {bidMessage && (
          <div
            className={`alert ${
              bidMessage.includes("rejected")
                ? "alert-warning"
                : "alert-success"
            }`}
          >
            <span>
              {bidMessage.includes("rejected")
                ? "!"
                : "✓"}
            </span>

            <p>{bidMessage}</p>

            <button onClick={() => setBidMessage("")}>
              ×
            </button>
          </div>
        )}

        {orderMessage && (
          <div className="alert alert-success">
            <span>✓</span>
            <p>{orderMessage}</p>

            <button
              onClick={() => setOrderMessage("")}
            >
              ×
            </button>
          </div>
        )}

        {/* HERO */}

        <section className="product-hero">

          <div className="product-visual">

            <div className="product-visual-glow" />

            <div className="crop-emoji">
              🌾
            </div>

            <div className="crop-visual-label">
              Fresh from the farm
            </div>

          </div>

          <div className="product-main-info">

            <div className="status-row">

              <span
                className={`status-pill ${
                  product.status === "ACTIVE"
                    ? "status-active"
                    : "status-inactive"
                }`}
              >
                <span className="status-dot" />
                {product.status}
              </span>

              {product.quantity > 0 && (
                <span className="fresh-pill">
                  ✓ Available now
                </span>
              )}

            </div>

            <p className="product-eyebrow">
              AGRICULTURAL PRODUCT
            </p>

            <h1>{product.cropName}</h1>

            <p className="product-description">
              Quality agricultural produce available
              directly from the farmer through KhetiMarket.
            </p>

            <div className="hero-price">

              <div>
                <span className="price-label">
                  Starting from
                </span>

                <div className="price-value">
                  ₹{product.minPrice?.toLocaleString("en-IN")}
                  <span>
                    / {product.unit}
                  </span>
                </div>
              </div>

              <div className="availability-box">
                <span>Available</span>
                <strong>
                  {product.quantity}
                </strong>
                <small>{product.unit}</small>
              </div>

            </div>

            <div className="product-meta-grid">

              <div className="product-meta-card">
                <span className="meta-icon">
                  📍
                </span>

                <div>
                  <small>Location</small>
                  <strong>
                    {product.location || "Not specified"}
                  </strong>
                </div>
              </div>

              <div className="product-meta-card">
                <span className="meta-icon">
                  📅
                </span>

                <div>
                  <small>Expected harvest</small>
                  <strong>
                    {product.expectedHarvestDate
                      ? new Date(
                          product.expectedHarvestDate
                        ).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Not specified"}
                  </strong>
                </div>
              </div>

            </div>

          </div>

        </section>

        {/* MAIN CONTENT */}

        <section className="product-content-grid">

          {/* LEFT */}

          <div className="product-content-left">

            {/* FARMER */}

            {product.farmer && (
              <div className="surface-card farmer-card">

                <div className="section-heading">
                  <div>
                    <span className="section-kicker">
                      SELLER
                    </span>

                    <h2>Meet the farmer</h2>
                  </div>

                  <div className="verified-badge">
                    ✓ Verified
                  </div>
                </div>

                <div className="farmer-profile">

                  <div className="farmer-avatar">
                    {product.farmer.name
                      ?.charAt(0)
                      ?.toUpperCase() || "F"}
                  </div>

                  <div className="farmer-info">

                    <h3>
                      {product.farmer.name}
                    </h3>

                    <p>
                      📍{" "}
                      {product.farmer.location ||
                        product.location ||
                        "Location not specified"}
                    </p>

                  </div>

                  {farmerRating && (
                    <div className="farmer-rating">

                      <div className="rating-number">
                        {farmerRating.averageRating > 0
                          ? farmerRating.averageRating.toFixed(1)
                          : "—"}
                      </div>

                      <div>
                        <div className="stars">
                          ★★★★★
                        </div>

                        <span>
                          {farmerRating.totalReviews}{" "}
                          reviews
                        </span>
                      </div>

                    </div>
                  )}

                </div>

              </div>
            )}

            {/* PRODUCT INFO */}

            <div className="surface-card">

              <div className="section-heading">

                <div>
                  <span className="section-kicker">
                    PRODUCT INFORMATION
                  </span>

                  <h2>About this listing</h2>
                </div>

              </div>

              <div className="details-list">

                <div className="detail-row">
                  <span>Crop</span>
                  <strong>
                    {product.cropName}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>Minimum price</span>
                  <strong>
                    ₹
                    {product.minPrice?.toLocaleString(
                      "en-IN"
                    )}{" "}
                    / {product.unit}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>Quantity available</span>
                  <strong>
                    {product.quantity}{" "}
                    {product.unit}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>Location</span>
                  <strong>
                    {product.location ||
                      "Not specified"}
                  </strong>
                </div>

              </div>

            </div>

            {/* TRUST */}

            <div className="trust-grid">

              <div className="trust-card">
                <div>🛡️</div>
                <strong>Secure marketplace</strong>
                <span>
                  Protected transactions
                </span>
              </div>

              <div className="trust-card">
                <div>🤝</div>
                <strong>Direct from farmers</strong>
                <span>
                  Transparent sourcing
                </span>
              </div>

              <div className="trust-card">
                <div>⚡</div>
                <strong>Real-time updates</strong>
                <span>
                  Stay informed instantly
                </span>
              </div>

            </div>

          </div>

          {/* RIGHT */}

          {user?.role === "BUYER" && isAvailable && (
            <aside className="purchase-column">

              {/* BID */}

              <div className="action-card bid-card">

                <div className="action-card-header">

                  <div className="action-icon offer-icon">
                    %
                  </div>

                  <div>
                    <span className="section-kicker">
                      NEGOTIATE
                    </span>

                    <h2>Make an offer</h2>
                  </div>

                </div>

                <p className="action-description">
                  Submit your price and delivery
                  preference. The farmer can accept,
                  reject, or respond to your offer.
                </p>

                <form
                  onSubmit={handlePlaceBid}
                  className="modern-form"
                >

                  <div className="form-field">

                    <label>
                      Your price
                      <span>
                        per {product.unit}
                      </span>
                    </label>

                    <div className="input-prefix">
                      <span>₹</span>

                      <input
                        type="number"
                        min={product.minPrice}
                        value={bidPrice}
                        placeholder={String(
                          product.minPrice
                        )}
                        onChange={(e) =>
                          setBidPrice(
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <small>
                      Minimum ₹
                      {product.minPrice?.toLocaleString(
                        "en-IN"
                      )}{" "}
                      / {product.unit}
                    </small>

                  </div>

                  <div className="form-field">

                    <label>
                      Quantity
                      <span>
                        {product.unit}
                      </span>
                    </label>

                    <input
                      type="number"
                      min="1"
                      max={product.quantity}
                      value={bidQuantity}
                      placeholder={`Up to ${product.quantity}`}
                      onChange={(e) =>
                        setBidQuantity(
                          e.target.value
                        )
                      }
                    />

                  </div>

                  <div className="form-field">

                    <label>
                      Expected delivery
                    </label>

                    <input
                      type="date"
                      value={deliveryDate}
                      min={
                        new Date()
                          .toISOString()
                          .split("T")[0]
                      }
                      onChange={(e) =>
                        setDeliveryDate(
                          e.target.value
                        )
                      }
                    />

                  </div>

                  <button
                    type="submit"
                    className="primary-action-button"
                    disabled={bidding}
                  >
                    {bidding ? (
                      <>
                        <span className="button-spinner" />
                        Sending offer...
                      </>
                    ) : (
                      <>
                        Send offer
                        <span>→</span>
                      </>
                    )}
                  </button>

                </form>

              </div>

              {/* DIRECT ORDER */}

              <div className="action-card order-card">

                <div className="action-card-header">

                  <div className="action-icon order-icon">
                    🛒
                  </div>

                  <div>
                    <span className="section-kicker">
                      BUY NOW
                    </span>

                    <h2>Place an order</h2>
                  </div>

                </div>

                <p className="action-description">
                  Purchase at the farmer's listed
                  minimum price.
                </p>

                <form
                  onSubmit={handlePlaceOrder}
                  className="modern-form"
                >

                  <div className="form-field">

                    <label>
                      Quantity
                      <span>
                        {product.unit}
                      </span>
                    </label>

                    <input
                      type="number"
                      min="1"
                      max={product.quantity}
                      placeholder={`Maximum ${product.quantity}`}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(
                          e.target.value
                        )
                      }
                    />

                  </div>

                  <div className="order-total">

                    <span>Price per unit</span>

                    <strong>
                      ₹
                      {product.minPrice?.toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                  </div>

                  <button
                    type="submit"
                    className="secondary-action-button"
                    disabled={ordering}
                  >
                    {ordering
                      ? "Placing order..."
                      : "Place order"}
                  </button>

                </form>

              </div>

              <div className="secure-note">
                <span>🔒</span>
                Your information is securely handled
                by KhetiMarket.
              </div>

            </aside>
          )}

        </section>

      </main>
    </div>
  );
}

export default ProductDetails;