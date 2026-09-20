import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

import { useAuth } from "../context/AuthContext";

import {
  getOrderById
} from "../services/orderService";

import {
  createPayment,
  getPaymentByOrder,
  markPaymentAsPaid
} from "../services/paymentService";

import {
  createShipment,
  getShipmentByOrder,
  updateShipmentStatus
} from "../services/shipmentService";

import {
  createReview,
  getOrderReview
} from "../services/reviewService";

const SOCKET_URL = "http://localhost:5000";

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { token, user } = useAuth();

  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [shipment, setShipment] = useState(null);
  const [review, setReview] = useState(null);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [shipmentLoading, setShipmentLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function fetchOrder() {
    try {
      const response = await getOrderById(id, token);
      setOrder(response.data);
    } catch (error) {
      console.error("Failed to fetch order:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load order."
      );
    }
  }

  async function fetchPayment() {
    try {
      const response = await getPaymentByOrder(
        id,
        token
      );

      setPayment(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setPayment(null);
      } else {
        console.error(
          "Failed to fetch payment:",
          error
        );
      }
    }
  }

  async function fetchShipment() {
    try {
      const response = await getShipmentByOrder(
        id,
        token
      );

      setShipment(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setShipment(null);
      } else {
        console.error(
          "Failed to fetch shipment:",
          error
        );
      }
    }
  }

  async function fetchReview() {
    try {
      const response = await getOrderReview(
        id,
        token
      );

      setReview(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setReview(null);
      } else {
        console.error(
          "Failed to fetch review:",
          error
        );
      }
    }
  }

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        await fetchOrder();

        await Promise.all([
          fetchPayment(),
          fetchShipment(),
          fetchReview()
        ]);
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadData();
    }
  }, [id, token]);

  /* =====================================================
     SOCKET.IO
  ===================================================== */

  useEffect(() => {
    if (!order) return;

    const socket = io(SOCKET_URL);

    socket.on("connect", () => {
      console.log(
        "Order details socket connected:",
        socket.id
      );

      socket.emit("joinOrder", order._id);
    });

    socket.on(
      "orderStatusUpdated",
      (updatedOrder) => {
        if (
          updatedOrder.orderId?.toString() ===
          order._id?.toString()
        ) {
          setOrder((previousOrder) => ({
            ...previousOrder,
            status: updatedOrder.status
          }));
        }
      }
    );

    socket.on(
      "shipmentCreated",
      (newShipment) => {
        if (
          newShipment.orderId?.toString() ===
          order._id?.toString()
        ) {
          setShipment((previousShipment) => ({
            ...(previousShipment || {}),
            _id: newShipment.shipmentId,
            trackingNumber:
              newShipment.trackingNumber,
            carrier: newShipment.carrier,
            status: newShipment.status
          }));
        }
      }
    );

    socket.on(
      "shipmentStatusUpdated",
      (updatedShipment) => {
        if (
          updatedShipment.orderId?.toString() ===
          order._id?.toString()
        ) {
          setShipment((previousShipment) => {
            if (!previousShipment) {
              return previousShipment;
            }

            return {
              ...previousShipment,
              status: updatedShipment.status,
              shippedAt:
                updatedShipment.shippedAt,
              deliveredAt:
                updatedShipment.deliveredAt
            };
          });
        }
      }
    );

    return () => {
      socket.disconnect();
    };
  }, [order?._id]);

  /* =====================================================
     PAYMENT
  ===================================================== */

  async function handleCreatePayment() {
    try {
      setPaymentLoading(true);
      setError("");
      setMessage("");

      const response = await createPayment(
        {
          orderId: order._id,
          method: "UPI"
        },
        token
      );

      setPayment(response.data.payment);

      setMessage(
        "Payment created successfully."
      );
    } catch (error) {
      console.error(
        "Payment creation error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to create payment."
      );
    } finally {
      setPaymentLoading(false);
    }
  }

  async function handlePayNow() {
    try {
      setPaymentLoading(true);
      setError("");
      setMessage("");

      const response = await markPaymentAsPaid(
        payment._id,
        token
      );

      setPayment(response.data.payment);

      setMessage(
        "Payment completed successfully."
      );
    } catch (error) {
      console.error(
        "Payment error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to complete payment."
      );
    } finally {
      setPaymentLoading(false);
    }
  }

  /* =====================================================
     SHIPMENT
  ===================================================== */

  async function handleCreateShipment() {
    try {
      setShipmentLoading(true);
      setError("");
      setMessage("");

      const response = await createShipment(
        {
          orderId: order._id
        },
        token
      );

      setShipment(response.data.shipment);

      setMessage(
        "Shipment created successfully."
      );
    } catch (error) {
      console.error(
        "Shipment creation error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to create shipment."
      );
    } finally {
      setShipmentLoading(false);
    }
  }

  async function handleShipmentStatus(
    newStatus
  ) {
    try {
      setShipmentLoading(true);
      setError("");
      setMessage("");

      const response =
        await updateShipmentStatus(
          shipment._id,
          newStatus,
          token
        );

      setShipment(response.data.shipment);

      await fetchOrder();

      setMessage(
        "Shipment status updated successfully."
      );
    } catch (error) {
      console.error(
        "Shipment status error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update shipment."
      );
    } finally {
      setShipmentLoading(false);
    }
  }

  /* =====================================================
     REVIEW
  ===================================================== */

  async function handleSubmitReview(e) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (rating < 1) {
      setError("Please select a rating.");
      return;
    }

    try {
      setReviewLoading(true);

      const response = await createReview(
        {
          orderId: order._id,
          rating,
          comment
        },
        token
      );

      setReview(response.data.review);

      setMessage(
        "Review submitted successfully."
      );

      setRating(0);
      setComment("");
    } catch (error) {
      console.error(
        "Review submission error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to submit review."
      );
    } finally {
      setReviewLoading(false);
    }
  }

  /* =====================================================
     HELPERS
  ===================================================== */

  function formatStatus(status) {
    return (
      status
        ?.replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) =>
          letter.toUpperCase()
        ) || "Unknown"
    );
  }

  function formatDate(date) {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  }

  function formatDateTime(date) {
    if (!date) return "—";

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    );
  }

  function getOrderStatusClass(status) {
    return `detail-status status-${status?.toLowerCase()}`;
  }

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="order-details-page">
        <div className="order-details-shell">
          <div className="order-detail-skeleton-header">
            <div className="order-skeleton back" />
            <div className="order-skeleton title" />
            <div className="order-skeleton subtitle" />
          </div>

          <div className="order-details-layout">
            <div className="order-skeleton-panel">
              <div className="order-skeleton line large" />
              <div className="order-skeleton line" />
              <div className="order-skeleton line" />
              <div className="order-skeleton line short" />
            </div>

            <div className="order-skeleton-panel">
              <div className="order-skeleton line medium" />
              <div className="order-skeleton line" />
              <div className="order-skeleton line short" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-details-page">
        <div className="order-details-shell">
          <div className="order-not-found">
            <div className="order-not-found-icon">
              ?
            </div>

            <h2>Order not found</h2>

            <p>
              We couldn't find this order or you
              may not have access to it.
            </p>

            <button
              className="order-primary-btn"
              onClick={() => navigate(-1)}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     SHIPMENT CONFIG
  ===================================================== */

  const shipmentSteps = [
    "CREATED",
    "SHIPPED",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
    "DELIVERED"
  ];

  const shipmentNextStatuses = {
    CREATED: ["SHIPPED"],
    SHIPPED: ["IN_TRANSIT"],
    IN_TRANSIT: ["OUT_FOR_DELIVERY"],
    OUT_FOR_DELIVERY: ["DELIVERED"],
    DELIVERED: []
  };

  const nextShipmentStatuses = shipment
    ? shipmentNextStatuses[
        shipment.status
      ] || []
    : [];

  const currentShipmentIndex = shipment
    ? shipmentSteps.indexOf(shipment.status)
    : -1;

  const orderSteps = [
    "PENDING",
    "CONFIRMED",
    "SHIPPED",
    "DELIVERED"
  ];

  const currentOrderIndex =
    orderSteps.indexOf(order.status);

  return (
    <div className="order-details-page">
      <div className="order-details-shell">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="order-detail-header">
          <div>
            <button
              className="order-back-btn"
              onClick={() => navigate(-1)}
            >
              <span>←</span>
              Back to orders
            </button>

            <div className="order-detail-eyebrow">
              ORDER DETAILS
            </div>

            <div className="order-heading-row">
              <div>
                <h1>
                  {order.listing?.cropName ||
                    "Order"}
                </h1>

                <p>
                  Order #
                  {order._id
                    ?.slice(-10)
                    .toUpperCase()}
                  {" · "}
                  {formatDate(order.createdAt)}
                </p>
              </div>

              <span
                className={getOrderStatusClass(
                  order.status
                )}
              >
                {formatStatus(order.status)}
              </span>
            </div>
          </div>

          <div className="order-live-indicator">
            <span />
            Live updates enabled
          </div>
        </header>

        {/* =================================================
            MESSAGES
        ================================================= */}

        {error && (
          <div className="order-alert order-alert-error">
            <span>!</span>
            {error}
          </div>
        )}

        {message && (
          <div className="order-alert order-alert-success">
            <span>✓</span>
            {message}
          </div>
        )}

        {/* =================================================
            ORDER PROGRESS
        ================================================= */}

        {order.status !== "CANCELLED" && (
          <section className="order-progress-card">
            <div className="section-heading">
              <div>
                <h2>Order progress</h2>
                <p>
                  Follow your order through each
                  fulfilment stage.
                </p>
              </div>
            </div>

            <div className="order-main-progress">
              {orderSteps.map(
                (step, index) => {
                  const completed =
                    currentOrderIndex >= index;

                  return (
                    <div
                      className={`main-progress-step ${
                        completed
                          ? "completed"
                          : ""
                      }`}
                      key={step}
                    >
                      <div className="main-progress-dot">
                        {completed ? "✓" : ""}
                      </div>

                      <span>
                        {formatStatus(step)}
                      </span>

                      {index <
                        orderSteps.length - 1 && (
                        <div
                          className={`main-progress-line ${
                            currentOrderIndex >
                            index
                              ? "completed"
                              : ""
                          }`}
                        />
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </section>
        )}

        {/* =================================================
            MAIN LAYOUT
        ================================================= */}

        <div className="order-details-layout">

          {/* =================================================
              LEFT
          ================================================= */}

          <main className="order-detail-main">

            {/* Order Summary */}

            <section className="order-detail-card">
              <div className="section-heading">
                <div>
                  <h2>Order summary</h2>
                  <p>
                    Details of this purchase.
                  </p>
                </div>
              </div>

              <div className="order-product-summary">
                <div className="order-product-icon">
                  🌾
                </div>

                <div className="order-product-name">
                  <span>Crop</span>

                  <strong>
                    {order.listing?.cropName ||
                      "Product"}
                  </strong>
                </div>

                <div className="order-summary-item">
                  <span>Quantity</span>

                  <strong>
                    {order.quantity}{" "}
                    {order.listing?.unit ||
                      "kg"}
                  </strong>
                </div>

                <div className="order-summary-item price">
                  <span>Total</span>

                  <strong>
                    ₹
                    {Number(
                      order.totalPrice || 0
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>

              <div className="order-people-grid">
                {order.buyer && (
                  <div className="order-person">
                    <span>Buyer</span>

                    <div>
                      <div className="person-avatar">
                        {order.buyer.name
                          ?.charAt(0)
                          ?.toUpperCase() ||
                          "B"}
                      </div>

                      <div>
                        <strong>
                          {order.buyer.name}
                        </strong>

                        {order.buyer.email && (
                          <small>
                            {order.buyer.email}
                          </small>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {order.farmer && (
                  <div className="order-person">
                    <span>Farmer</span>

                    <div>
                      <div className="person-avatar farmer">
                        {order.farmer.name
                          ?.charAt(0)
                          ?.toUpperCase() ||
                          "F"}
                      </div>

                      <div>
                        <strong>
                          {order.farmer.name}
                        </strong>

                        {order.farmer.email && (
                          <small>
                            {order.farmer.email}
                          </small>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Payment */}

            <section className="order-detail-card">
              <div className="section-heading">
                <div>
                  <h2>Payment</h2>
                  <p>
                    Payment information for this
                    order.
                  </p>
                </div>

                {payment && (
                  <span
                    className={`payment-badge payment-${payment.status.toLowerCase()}`}
                  >
                    {formatStatus(
                      payment.status
                    )}
                  </span>
                )}
              </div>

              {!payment ? (
                <div className="order-empty-state compact">
                  <div>💳</div>

                  <div>
                    <strong>
                      No payment created
                    </strong>

                    <p>
                      {user?.role === "BUYER"
                        ? "Create a payment to continue with your order."
                        : "The buyer has not created a payment yet."}
                    </p>
                  </div>

                  {user?.role === "BUYER" && (
                    <button
                      className="order-primary-btn"
                      onClick={
                        handleCreatePayment
                      }
                      disabled={
                        paymentLoading
                      }
                    >
                      {paymentLoading
                        ? "Creating..."
                        : "Create Payment"}
                    </button>
                  )}
                </div>
              ) : (
                <div className="payment-content">
                  <div className="payment-grid">
                    <div>
                      <span>Amount</span>
                      <strong>
                        ₹
                        {Number(
                          payment.amount || 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Method</span>
                      <strong>
                        {payment.method}
                      </strong>
                    </div>

                    <div>
                      <span>Status</span>
                      <strong>
                        {formatStatus(
                          payment.status
                        )}
                      </strong>
                    </div>

                    {payment.transactionId && (
                      <div>
                        <span>
                          Transaction ID
                        </span>
                        <strong className="transaction-id">
                          {payment.transactionId}
                        </strong>
                      </div>
                    )}
                  </div>

                  {user?.role === "BUYER" &&
                    payment.status ===
                      "PENDING" && (
                      <div className="payment-action">
                        <button
                          className="order-primary-btn"
                          onClick={
                            handlePayNow
                          }
                          disabled={
                            paymentLoading
                          }
                        >
                          {paymentLoading
                            ? "Processing..."
                            : "Pay Now →"}
                        </button>
                      </div>
                    )}
                </div>
              )}
            </section>

            {/* Shipment */}

            <section className="order-detail-card">
              <div className="section-heading">
                <div>
                  <h2>
                    Shipment tracking
                  </h2>

                  <p>
                    Track the delivery journey
                    of this order.
                  </p>
                </div>

                {shipment && (
                  <span
                    className={`shipment-badge shipment-${shipment.status.toLowerCase()}`}
                  >
                    {formatStatus(
                      shipment.status
                    )}
                  </span>
                )}
              </div>

              {!shipment ? (
                <div className="order-empty-state">
                  <div className="shipment-empty-icon">
                    🚚
                  </div>

                  <div>
                    <strong>
                      Shipment not created
                    </strong>

                    <p>
                      {user?.role ===
                        "FARMER" &&
                      payment?.status ===
                        "PAID"
                        ? "Payment has been received. You can now create the shipment."
                        : "Shipment details will appear here once the farmer creates the shipment."}
                    </p>
                  </div>

                  {user?.role === "FARMER" &&
                    payment?.status ===
                      "PAID" && (
                      <button
                        className="order-primary-btn"
                        onClick={
                          handleCreateShipment
                        }
                        disabled={
                          shipmentLoading
                        }
                      >
                        {shipmentLoading
                          ? "Creating..."
                          : "Create Shipment"}
                      </button>
                    )}
                </div>
              ) : (
                <>
                  <div className="shipment-info-grid">
                    <div>
                      <span>
                        Tracking number
                      </span>

                      <strong>
                        {shipment.trackingNumber ||
                          "Not assigned"}
                      </strong>
                    </div>

                    <div>
                      <span>Carrier</span>

                      <strong>
                        {shipment.carrier ||
                          "—"}
                      </strong>
                    </div>

                    <div>
                      <span>Shipped</span>

                      <strong>
                        {formatDateTime(
                          shipment.shippedAt
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Delivered</span>

                      <strong>
                        {formatDateTime(
                          shipment.deliveredAt
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="shipment-timeline">
                    {shipmentSteps.map(
                      (step, index) => {
                        const completed =
                          index <=
                          currentShipmentIndex;

                        return (
                          <div
                            className={`shipment-step ${
                              completed
                                ? "completed"
                                : ""
                            }`}
                            key={step}
                          >
                            <div className="shipment-step-marker">
                              {completed
                                ? "✓"
                                : ""}
                            </div>

                            <div>
                              <strong>
                                {formatStatus(
                                  step
                                )}
                              </strong>

                              {index ===
                                currentShipmentIndex && (
                                <span>
                                  Current
                                  status
                                </span>
                              )}
                            </div>

                            {index <
                              shipmentSteps.length -
                                1 && (
                              <div
                                className={`shipment-step-line ${
                                  currentShipmentIndex >
                                  index
                                    ? "completed"
                                    : ""
                                }`}
                              />
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>

                  {user?.role ===
                    "FARMER" &&
                    nextShipmentStatuses.length >
                      0 && (
                      <div className="shipment-controls">
                        <div>
                          <strong>
                            Update shipment
                          </strong>

                          <span>
                            Move the shipment to
                            its next stage.
                          </span>
                        </div>

                        <div className="shipment-control-buttons">
                          {nextShipmentStatuses.map(
                            (status) => (
                              <button
                                key={status}
                                className="order-primary-btn"
                                onClick={() =>
                                  handleShipmentStatus(
                                    status
                                  )
                                }
                                disabled={
                                  shipmentLoading
                                }
                              >
                                {shipmentLoading
                                  ? "Updating..."
                                  : `Mark as ${formatStatus(
                                      status
                                    )}`}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </>
              )}
            </section>
          </main>

          {/* =================================================
              RIGHT SIDEBAR
          ================================================= */}

          <aside className="order-detail-sidebar">

            {/* Total */}

            <section className="order-total-card">
              <span>Order total</span>

              <strong>
                ₹
                {Number(
                  order.totalPrice || 0
                ).toLocaleString("en-IN")}
              </strong>

              <div>
                <span>Quantity</span>

                <b>
                  {order.quantity}{" "}
                  {order.listing?.unit ||
                    "kg"}
                </b>
              </div>
            </section>

            {/* Quick info */}

            <section className="order-detail-card compact-card">
              <div className="sidebar-heading">
                Order information
              </div>

              <div className="sidebar-info">
                <div>
                  <span>Order ID</span>

                  <strong className="transaction-id">
                    {order._id}
                  </strong>
                </div>

                <div>
                  <span>Placed on</span>

                  <strong>
                    {formatDate(
                      order.createdAt
                    )}
                  </strong>
                </div>

                <div>
                  <span>Current status</span>

                  <strong>
                    {formatStatus(
                      order.status
                    )}
                  </strong>
                </div>
              </div>
            </section>

            {/* Review */}

            <section className="order-detail-card review-card">
              <div className="section-heading">
                <div>
                  <h2>
                    ⭐ Farmer review
                  </h2>

                  <p>
                    Share your experience.
                  </p>
                </div>
              </div>

              {review ? (
                <div className="existing-review">
                  <div className="review-stars">
                    {"★".repeat(
                      review.rating
                    )}
                    <span>
                      {"★".repeat(
                        5 - review.rating
                      )}
                    </span>
                  </div>

                  <strong>
                    {review.rating}/5
                  </strong>

                  {review.comment && (
                    <blockquote>
                      “{review.comment}”
                    </blockquote>
                  )}

                  {review.buyer && (
                    <small>
                      Reviewed by{" "}
                      {review.buyer.name}
                    </small>
                  )}
                </div>
              ) : order.status ===
                  "DELIVERED" &&
                user?.role === "BUYER" ? (
                <form
                  className="review-form"
                  onSubmit={
                    handleSubmitReview
                  }
                >
                  <p>
                    Your order has been
                    delivered. How was your
                    experience?
                  </p>

                  <div className="rating-picker">
                    {[1, 2, 3, 4, 5].map(
                      (value) => (
                        <button
                          type="button"
                          key={value}
                          onClick={() =>
                            setRating(value)
                          }
                          aria-label={`${value} star`}
                        >
                          {value <= rating
                            ? "★"
                            : "☆"}
                        </button>
                      )
                    )}
                  </div>

                  <textarea
                    placeholder="Tell the farmer about your experience..."
                    value={comment}
                    onChange={(e) =>
                      setComment(
                        e.target.value
                      )
                    }
                    rows="4"
                  />

                  <button
                    type="submit"
                    className="order-primary-btn full"
                    disabled={reviewLoading}
                  >
                    {reviewLoading
                      ? "Submitting..."
                      : "Submit Review"}
                  </button>
                </form>
              ) : (
                <div className="review-unavailable">
                  <span>☆</span>

                  <p>
                    Reviews become available
                    after the order is
                    delivered.
                  </p>
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;