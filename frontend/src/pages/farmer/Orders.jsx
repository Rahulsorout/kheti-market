import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import {
  getMyOrders,
  updateOrderStatus
} from "../../services/orderService";

export default function Orders() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [updatingOrder, setUpdatingOrder] = useState(null);

  const statusOptions = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["SHIPPED", "CANCELLED"],
    SHIPPED: ["DELIVERED"],
    DELIVERED: [],
    CANCELLED: []
  };

  async function fetchOrders() {
    try {
      setLoading(true);
      setError("");

      const response = await getMyOrders(token);

      setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load orders."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  async function handleStatusChange(orderId, newStatus) {
    try {
      setUpdatingOrder(orderId);
      setError("");

      const response = await updateOrderStatus(
        orderId,
        newStatus,
        token
      );

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? response.data.order
            : order
        )
      );
    } catch (error) {
      console.error(
        "Failed to update order:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update order status."
      );
    } finally {
      setUpdatingOrder(null);
    }
  }

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter(
        (order) => order.status === "PENDING"
      ).length,
      confirmed: orders.filter(
        (order) => order.status === "CONFIRMED"
      ).length,
      shipped: orders.filter(
        (order) => order.status === "SHIPPED"
      ).length,
      delivered: orders.filter(
        (order) => order.status === "DELIVERED"
      ).length,
      cancelled: orders.filter(
        (order) => order.status === "CANCELLED"
      ).length
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const cropName =
        order.listing?.cropName?.toLowerCase() || "";

      const buyerName =
        order.buyer?.name?.toLowerCase() || "";

      const orderId =
        order._id?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        cropName.includes(query) ||
        buyerName.includes(query) ||
        orderId.includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  function formatStatus(status) {
    return status
      ?.replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  }

  function formatDate(date) {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  function getStatusClass(status) {
    return `order-status status-${status?.toLowerCase()}`;
  }

  if (loading) {
    return (
      <div className="farmer-orders-page">
        <div className="orders-shell">
          <div className="orders-loading-header">
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-subtitle" />
          </div>

          <div className="orders-stats">
            {[1, 2, 3, 4].map((item) => (
              <div
                className="order-stat-card skeleton-card"
                key={item}
              >
                <div className="skeleton skeleton-icon" />
                <div>
                  <div className="skeleton skeleton-small" />
                  <div className="skeleton skeleton-number" />
                </div>
              </div>
            ))}
          </div>

          <div className="orders-list">
            {[1, 2, 3].map((item) => (
              <div
                className="order-card order-skeleton"
                key={item}
              >
                <div className="skeleton skeleton-crop" />
                <div className="skeleton skeleton-line" />
                <div className="skeleton skeleton-line short" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="farmer-orders-page">
        <div className="orders-shell">
          <div className="orders-error">
            <div className="error-icon">!</div>
            <h2>Unable to load orders</h2>
            <p>{error}</p>

            <button
              className="primary-order-btn"
              onClick={fetchOrders}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="farmer-orders-page">
      <div className="orders-shell">

        {/* Header */}
        <header className="orders-header">
          <div>
            <div className="orders-eyebrow">
              FARMER OPERATIONS
            </div>

            <h1>My Orders</h1>

            <p>
              Manage your incoming orders and keep
              buyers updated at every stage.
            </p>
          </div>

          <div className="orders-header-badge">
            <span className="live-dot" />
            Orders dashboard
          </div>
        </header>

        {/* Stats */}
        <section className="orders-stats">
          <div className="order-stat-card">
            <div className="stat-icon">📦</div>

            <div>
              <span>Total Orders</span>
              <strong>{stats.total}</strong>
            </div>
          </div>

          <div className="order-stat-card">
            <div className="stat-icon pending-icon">
              ⏳
            </div>

            <div>
              <span>Pending</span>
              <strong>{stats.pending}</strong>
            </div>
          </div>

          <div className="order-stat-card">
            <div className="stat-icon confirmed-icon">
              ✓
            </div>

            <div>
              <span>Confirmed</span>
              <strong>{stats.confirmed}</strong>
            </div>
          </div>

          <div className="order-stat-card">
            <div className="stat-icon shipped-icon">
              🚚
            </div>

            <div>
              <span>Shipped</span>
              <strong>{stats.shipped}</strong>
            </div>
          </div>

          <div className="order-stat-card">
            <div className="stat-icon delivered-icon">
              ✓
            </div>

            <div>
              <span>Delivered</span>
              <strong>{stats.delivered}</strong>
            </div>
          </div>
        </section>

        {/* Toolbar */}
        <section className="orders-toolbar">
          <div className="order-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search crop, buyer or order ID..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          <div className="order-filters">
            {[
              ["ALL", "All"],
              ["PENDING", "Pending"],
              ["CONFIRMED", "Confirmed"],
              ["SHIPPED", "Shipped"],
              ["DELIVERED", "Delivered"],
              ["CANCELLED", "Cancelled"]
            ].map(([value, label]) => (
              <button
                key={value}
                className={
                  statusFilter === value
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setStatusFilter(value)
                }
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* Error banner */}
        {error && (
          <div className="orders-error-banner">
            <span>!</span>
            {error}
          </div>
        )}

        {/* Results header */}
        <div className="orders-results-header">
          <div>
            <h2>Order activity</h2>

            <p>
              Showing {filteredOrders.length}{" "}
              {filteredOrders.length === 1
                ? "order"
                : "orders"}
            </p>
          </div>
        </div>

        {/* Orders */}
        {filteredOrders.length === 0 ? (
          <div className="orders-empty">
            <div className="empty-box">📦</div>

            <h3>
              {orders.length === 0
                ? "No orders yet"
                : "No matching orders"}
            </h3>

            <p>
              {orders.length === 0
                ? "Orders created from accepted bids will appear here."
                : "Try changing your search or status filter."}
            </p>

            {orders.length > 0 && (
              <button
                className="secondary-order-btn"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => {
              const nextStatuses =
                statusOptions[order.status] || [];

              return (
                <article
                  className="order-card"
                  key={order._id}
                >
                  {/* Top */}
                  <div className="order-card-top">
                    <div className="crop-info">
                      <div className="crop-avatar">
                        🌾
                      </div>

                      <div>
                        <div className="crop-title-row">
                          <h3>
                            {order.listing?.cropName ||
                              "Product"}
                          </h3>

                          <span
                            className={getStatusClass(
                              order.status
                            )}
                          >
                            {formatStatus(
                              order.status
                            )}
                          </span>
                        </div>

                        <p className="order-id">
                          Order #
                          {order._id
                            ?.slice(-8)
                            .toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <div className="order-price">
                      <span>Order value</span>

                      <strong>
                        ₹
                        {Number(
                          order.totalPrice || 0
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="order-details-grid">
                    <div className="order-detail">
                      <span className="detail-label">
                        Buyer
                      </span>

                      <strong>
                        {order.buyer?.name ||
                          "Unknown buyer"}
                      </strong>

                      {order.buyer?.email && (
                        <small>
                          {order.buyer.email}
                        </small>
                      )}
                    </div>

                    <div className="order-detail">
                      <span className="detail-label">
                        Quantity
                      </span>

                      <strong>
                        {order.quantity}{" "}
                        {order.listing?.unit || "kg"}
                      </strong>

                      <small>
                        Crop quantity
                      </small>
                    </div>

                    <div className="order-detail">
                      <span className="detail-label">
                        Created
                      </span>

                      <strong>
                        {formatDate(
                          order.createdAt
                        )}
                      </strong>

                      <small>
                        Order date
                      </small>
                    </div>

                    <div className="order-detail">
                      <span className="detail-label">
                        Current stage
                      </span>

                      <strong>
                        {formatStatus(
                          order.status
                        )}
                      </strong>

                      <small>
                        Fulfilment status
                      </small>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="order-progress">
                    {[
                      "PENDING",
                      "CONFIRMED",
                      "SHIPPED",
                      "DELIVERED"
                    ].map((stage, index) => {
                      const stages = [
                        "PENDING",
                        "CONFIRMED",
                        "SHIPPED",
                        "DELIVERED"
                      ];

                      const currentIndex =
                        stages.indexOf(
                          order.status
                        );

                      const completed =
                        order.status !==
                          "CANCELLED" &&
                        currentIndex >= index;

                      return (
                        <div
                          className={`progress-stage ${
                            completed
                              ? "completed"
                              : ""
                          }`}
                          key={stage}
                        >
                          <div className="progress-dot">
                            {completed ? "✓" : ""}
                          </div>

                          <span>
                            {formatStatus(stage)}
                          </span>

                          {index < 3 && (
                            <div
                              className={`progress-line ${
                                currentIndex >
                                index &&
                                order.status !==
                                  "CANCELLED"
                                  ? "completed"
                                  : ""
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Cancelled */}
                  {order.status ===
                    "CANCELLED" && (
                    <div className="cancelled-message">
                      <span>×</span>
                      This order has been cancelled.
                    </div>
                  )}

                  {/* Actions */}
                  <div className="order-actions">
                    <div className="status-control">
                      {nextStatuses.length > 0 ? (
                        <>
                          <label>
                            Update order
                          </label>

                          <select
                            value=""
                            disabled={
                              updatingOrder ===
                              order._id
                            }
                            onChange={(e) =>
                              handleStatusChange(
                                order._id,
                                e.target.value
                              )
                            }
                          >
                            <option
                              value=""
                              disabled
                            >
                              {updatingOrder ===
                              order._id
                                ? "Updating..."
                                : "Select next status"}
                            </option>

                            {nextStatuses.map(
                              (status) => (
                                <option
                                  key={status}
                                  value={status}
                                >
                                  {formatStatus(
                                    status
                                  )}
                                </option>
                              )
                            )}
                          </select>
                        </>
                      ) : (
                        <div className="final-status">
                          <span>✓</span>
                          Order is{" "}
                          {formatStatus(
                            order.status
                          ).toLowerCase()}
                        </div>
                      )}
                    </div>

                    <button
                      className="view-order-btn"
                      onClick={() =>
                        navigate(
                          `/orders/${order._id}`
                        )
                      }
                    >
                      View Details
                      <span>→</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}