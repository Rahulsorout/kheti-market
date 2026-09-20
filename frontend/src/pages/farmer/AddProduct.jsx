import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../../services/productService";
import { useAuth } from "../../context/AuthContext";

export default function AddProduct() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    cropName: "",
    quantity: "",
    expectedHarvestDate: "",
    minPrice: "",
    location: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  }

  async function submit(e) {
    e.preventDefault();

    setError("");

    if (!form.cropName.trim()) {
      setError("Please enter the crop name.");
      return;
    }

    if (!form.quantity || Number(form.quantity) <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    if (!form.expectedHarvestDate) {
      setError("Please select the expected harvest date.");
      return;
    }

    if (!form.minPrice || Number(form.minPrice) <= 0) {
      setError("Minimum price must be greater than zero.");
      return;
    }

    if (!form.location.trim()) {
      setError("Please enter the farm/location.");
      return;
    }

    try {
      setLoading(true);

      const data = {
        cropName: form.cropName.trim(),
        quantity: Number(form.quantity),
        expectedHarvestDate: form.expectedHarvestDate,
        minPrice: Number(form.minPrice),
        location: form.location.trim(),
      };

      await createProduct(data, token);

      setSuccess(true);

      setForm({
        cropName: "",
        quantity: "",
        expectedHarvestDate: "",
        minPrice: "",
        location: "",
      });
    } catch (error) {
      console.error("Failed to add product:", error);

      setError(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to add product."
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="add-product-page">

        <div className="add-product-success">

          <div className="success-icon">
            ✓
          </div>

          <span className="success-eyebrow">
            LISTING CREATED
          </span>

          <h1>Your crop is now on KhetiMarket</h1>

          <p>
            Buyers can now discover your listing,
            review the details, and send you offers.
          </p>

          <div className="success-actions">

            <button
              className="success-primary-button"
              onClick={() =>
                navigate("/farmer/my-products")
              }
            >
              View My Listings
              <span>→</span>
            </button>

            <button
              className="success-secondary-button"
              onClick={() => setSuccess(false)}
            >
              Add Another Crop
            </button>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="add-product-page">

      {/* TOP BAR */}

      <header className="add-product-topbar">

        <div className="add-product-topbar-inner">

          <button
            className="add-product-back"
            onClick={() => navigate("/farmer/my-products")}
          >
            <span>←</span>
            My Listings
          </button>

          <div className="add-product-top-label">
            KhetiMarket
          </div>

        </div>

      </header>

      <main className="add-product-container">

        {/* HEADER */}

        <section className="add-product-header">

          <div>

            <span className="add-product-eyebrow">
              FARMER MARKETPLACE
            </span>

            <h1>List your crop</h1>

            <p>
              Tell buyers what you're growing.
              We'll put your listing in front of
              the right marketplace audience.
            </p>

          </div>

          <div className="listing-step-indicator">

            <div className="step active">
              <span>1</span>
              Crop details
            </div>

            <div className="step-line" />

            <div className="step">
              <span>2</span>
              Publish
            </div>

          </div>

        </section>

        <div className="add-product-layout">

          {/* FORM */}

          <section className="add-product-form-card">

            <div className="form-card-heading">

              <div className="form-heading-icon">
                🌾
              </div>

              <div>
                <span className="form-heading-kicker">
                  NEW LISTING
                </span>

                <h2>Crop information</h2>

                <p>
                  Provide accurate details so buyers
                  know exactly what you're offering.
                </p>
              </div>

            </div>

            {error && (
              <div className="add-product-alert">

                <span>!</span>

                <p>{error}</p>

                <button
                  onClick={() => setError("")}
                >
                  ×
                </button>

              </div>
            )}

            <form
              className="add-product-form"
              onSubmit={submit}
            >

              {/* CROP */}

              <div className="add-form-group full">

                <label htmlFor="cropName">
                  Crop name
                </label>

                <div className="add-input-wrapper">
                  <span>🌱</span>

                  <input
                    id="cropName"
                    type="text"
                    name="cropName"
                    placeholder="e.g. Wheat, Paddy, Tomato"
                    value={form.cropName}
                    onChange={handleChange}
                  />
                </div>

                <small>
                  Use the common name buyers are
                  likely to search for.
                </small>

              </div>

              {/* QUANTITY + PRICE */}

              <div className="add-form-row">

                <div className="add-form-group">

                  <label htmlFor="quantity">
                    Available quantity
                  </label>

                  <div className="number-input-wrapper">

                    <input
                      id="quantity"
                      type="number"
                      name="quantity"
                      min="1"
                      placeholder="e.g. 500"
                      value={form.quantity}
                      onChange={handleChange}
                    />

                    <span>kg</span>

                  </div>

                  <small>
                    Enter the quantity currently
                    available for sale.
                  </small>

                </div>

                <div className="add-form-group">

                  <label htmlFor="minPrice">
                    Minimum price
                  </label>

                  <div className="price-input-wrapper">

                    <span>₹</span>

                    <input
                      id="minPrice"
                      type="number"
                      name="minPrice"
                      min="1"
                      placeholder="e.g. 2500"
                      value={form.minPrice}
                      onChange={handleChange}
                    />

                    <small>
                      / kg
                    </small>

                  </div>

                  <small>
                    Buyers cannot submit offers below
                    this amount.
                  </small>

                </div>

              </div>

              {/* HARVEST + LOCATION */}

              <div className="add-form-row">

                <div className="add-form-group">

                  <label htmlFor="expectedHarvestDate">
                    Expected harvest
                  </label>

                  <input
                    id="expectedHarvestDate"
                    className="standalone-input"
                    type="date"
                    name="expectedHarvestDate"
                    min={
                      new Date()
                        .toISOString()
                        .split("T")[0]
                    }
                    value={form.expectedHarvestDate}
                    onChange={handleChange}
                  />

                  <small>
                    Give buyers an estimated
                    availability date.
                  </small>

                </div>

                <div className="add-form-group">

                  <label htmlFor="location">
                    Farm / location
                  </label>

                  <div className="add-input-wrapper">

                    <span>📍</span>

                    <input
                      id="location"
                      type="text"
                      name="location"
                      placeholder="e.g. Jaipur, Rajasthan"
                      value={form.location}
                      onChange={handleChange}
                    />

                  </div>

                  <small>
                    This helps buyers discover
                    nearby produce.
                  </small>

                </div>

              </div>

              {/* DIVIDER */}

              <div className="form-divider" />

              {/* SUBMIT */}

              <div className="form-submit-area">

                <div className="publish-note">
                  <span>🛡️</span>

                  <p>
                    You can manage or remove this
                    listing anytime from My Listings.
                  </p>
                </div>

                <button
                  className="publish-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="publish-spinner" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      Publish Listing
                      <span>→</span>
                    </>
                  )}
                </button>

              </div>

            </form>

          </section>

          {/* PREVIEW / SIDEBAR */}

          <aside className="listing-preview-column">

            <div className="listing-preview-card">

              <div className="preview-header">

                <span>
                  LISTING PREVIEW
                </span>

                <span className="preview-live">
                  LIVE
                </span>

              </div>

              <div className="preview-visual">
                <span>🌾</span>

                <div>
                  <small>
                    YOUR CROP
                  </small>

                  <strong>
                    {form.cropName ||
                      "Your crop"}
                  </strong>
                </div>
              </div>

              <div className="preview-body">

                <div className="preview-price">

                  <span>
                    Minimum price
                  </span>

                  <strong>
                    {form.minPrice
                      ? `₹${Number(
                          form.minPrice
                        ).toLocaleString("en-IN")}`
                      : "₹—"}
                  </strong>

                  <small>
                    / kg
                  </small>

                </div>

                <div className="preview-info-list">

                  <div>
                    <span>📦</span>

                    <div>
                      <small>
                        Quantity
                      </small>

                      <strong>
                        {form.quantity || "—"} kg
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
                        {form.location ||
                          "Not specified"}
                      </strong>
                    </div>
                  </div>

                  <div>
                    <span>📅</span>

                    <div>
                      <small>
                        Harvest
                      </small>

                      <strong>
                        {form.expectedHarvestDate
                          ? new Date(
                              form.expectedHarvestDate
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "Not specified"}
                      </strong>
                    </div>
                  </div>

                </div>

              </div>

            </div>

            {/* TIPS */}

            <div className="listing-tips-card">

              <div className="tips-icon">
                ✨
              </div>

              <div>

                <strong>
                  Listing tip
                </strong>

                <p>
                  Accurate quantity, pricing and
                  harvest information helps buyers
                  make faster decisions.
                </p>

              </div>

            </div>

          </aside>

        </div>

      </main>

    </div>
  );
}