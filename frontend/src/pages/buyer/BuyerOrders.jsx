import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

import { useAuth } from "../../context/AuthContext";
import { getBuyerOrders } from "../../services/orderService";

import { SOCKET_URL } from "../../config/api";

export default function BuyerOrders() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  async function fetchOrders() {
    try {
      setLoading(true);
      setError("");

      const response = await getBuyerOrders(token);

      setOrders(response.data);
    } catch (error) {
      console.error(
        "Failed to fetch buyer orders:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load your orders."
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

  /* =====================================================
     SOCKET.IO
  ===================================================== */

  useEffect(() => {
    if (!token || !user?.id) {
      return;
    }

    const socket = io(SOCKET_URL);

    socket.on("connect", () => {
      console.log(
        "Buyer Orders socket connected:",
        socket.id
      );

      socket.emit("joinBuyer", user.id);

      orders.forEach((order) => {
        socket.emit("joinOrder", order._id);
      });
    });

    socket.on("orderCreated", () => {
      fetchOrders();
    });

    socket.on(
      "orderStatusUpdated",
      (updatedOrder) => {
        setOrders((previousOrders) =>
          previousOrders.map((order) =>
            order._id?.toString() ===
            updatedOrder.orderId?.toString()
              ? {
                  ...order,
                  status: updatedOrder.status
                }
              : order
          )
        );
      }
    );

    socket.on(
      "shipmentStatusUpdated",
      (updatedShipment) => {
        setOrders((previousOrders) =>
          previousOrders.map((order) =>
            order._id?.toString() ===
            updatedShipment.orderId?.toString()
              ? {
                  ...order,
                  shipment: {
                    ...(order.shipment || {}),
                    _id:
                      updatedShipment.shipmentId,
                    status:
                      updatedShipment.status,
                    shippedAt:
                      updatedShipment.shippedAt,
                    deliveredAt:
                      updatedShipment.deliveredAt
                  }
                }
              : order
          )
        );
      }
    );

    socket.on(
      "shipmentCreated",
      (newShipment) => {
        setOrders((previousOrders) =>
          previousOrders.map((order) =>
            order._id?.toString() ===
            newShipment.orderId?.toString()
              ? {
                  ...order,
                  shipment: {
                    _id:
                      newShipment.shipmentId,
                    trackingNumber:
                      newShipment.trackingNumber,
                    carrier:
                      newShipment.carrier,
                    status:
                      newShipment.status
                  }
                }
              : order
          )
        );
      }
    );

    socket.on("disconnect", () => {
      console.log(
        "Buyer Orders socket disconnected"
      );
    });

    socket.on(
      "connect_error",
      (error) => {
        console.error(
          "Buyer Orders socket error:",
          error
        );
      }
    );

    return () => {
      socket.disconnect();
    };
  }, [token, user?.id, orders.length]);

  /* =====================================================
     STATS
  ===================================================== */

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
      ).length
    };
  }, [orders]);

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const crop =
        order.listing?.cropName?.toLowerCase() || "";

      const farmer =
        order.farmer?.name?.toLowerCase() || "";

      const orderId =
        order._id?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        crop.includes(query) ||
        farmer.includes(query) ||
        orderId.includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

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

  function getStatusClass(status) {
    return `buyer-order-status status-${status?.toLowerCase()}`;
  }

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="buyer-orders-page">
        <div className="buyer-orders-shell">
          <div className="buyer-orders-loading-head">
            <div className="buyer-skeleton title" />
            <div className="buyer-skeleton subtitle" />
          </div>

          <div className="buyer-order-stats">
            {[1, 2, 3, 4].map((item) => (
              <div
                className="buyer-stat-card"
                key={item}
              >
                <div className="buyer-skeleton stat-icon" />

                <div>
                  <div className="buyer-skeleton small" />
                  <div className="buyer-skeleton number" />
                </div>
              </div>
            ))}
          </div>

          <div className="buyer-order-skeleton-list">
            {[1, 2, 3].map((item) => (
              <div
                className="buyer-order-skeleton-card"
                key={item}
              >
                <div className="buyer-skeleton crop" />
                <div className="buyer-skeleton line" />
                <div className="buyer-skeleton line short" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error && orders.length === 0) {
    return (
      <div className="buyer-orders-page">
        <div className="buyer-orders-shell">
          <div className="buyer-orders-error">
            <div className="buyer-error-icon">
              !
            </div>

            <h2>Unable to load your orders</h2>

            <p>{error}</p>

            <button
              className="buyer-primary-btn"
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
    <div className="buyer-orders-page">
      <div className="buyer-orders-shell">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="buyer-orders-header">
          <div>
            <div className="buyer-orders-eyebrow">
              YOUR PURCHASES
            </div>

            <h1>My Orders</h1>

            <p>
              Track your crop purchases and follow
              every order from confirmation to delivery.
            </p>
          </div>

          <div className="buyer-live-badge">
            <span className="buyer-live-dot" />
            Live order updates
          </div>
        </header>

        {/* =================================================
            STATS
        ================================================= */}

        <section className="buyer-order-stats">
          <div className="buyer-stat-card">
            <div className="buyer-stat-icon">
              📦
            </div>

            <div>
              <span>Total Orders</span>
              <strong>{stats.total}</strong>
            </div>
          </div>

          <div className="buyer-stat-card">
            <div className="buyer-stat-icon pending">
              ⏳
            </div>

            <div>
              <span>Pending</span>
              <strong>{stats.pending}</strong>
            </div>
          </div>

          <div className="buyer-stat-card">
            <div className="buyer-stat-icon confirmed">
              ✓
            </div>

            <div>
              <span>Confirmed</span>
              <strong>{stats.confirmed}</strong>
            </div>
          </div>

          <div className="buyer-stat-card">
            <div className="buyer-stat-icon shipped">
              🚚
            </div>

            <div>
              <span>Shipped</span>
              <strong>{stats.shipped}</strong>
            </div>
          </div>

          <div className="buyer-stat-card">
            <div className="buyer-stat-icon delivered">
              ✓
            </div>

            <div>
              <span>Delivered</span>
              <strong>{stats.delivered}</strong>
            </div>
          </div>
        </section>

        {/* =================================================
            TOOLBAR
        ================================================= */}

        <section className="buyer-orders-toolbar">
          <div className="buyer-order-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search crop, farmer or order ID..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          <div className="buyer-order-filters">
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

        {error && (
          <div className="buyer-orders-error-banner">
            <span>!</span>
            {error}
          </div>
        )}

        {/* =================================================
            RESULTS
        ================================================= */}

        <div className="buyer-results-header">
          <div>
            <h2>Order history</h2>

            <p>
              Showing {filteredOrders.length}{" "}
              {filteredOrders.length === 1
                ? "order"
                : "orders"}
            </p>
          </div>
        </div>

        {/* =================================================
            EMPTY
        ================================================= */}

        {filteredOrders.length === 0 ? (
          <div className="buyer-orders-empty">
            <div className="buyer-empty-icon">
              🛒
            </div>

            <h3>
              {orders.length === 0
                ? "No orders yet"
                : "No matching orders"}
            </h3>

            <p>
              {orders.length === 0
                ? "Your crop purchases will appear here once you place an order."
                : "Try changing your search or status filter."}
            </p>

            {orders.length === 0 ? (
              <button
                className="buyer-primary-btn"
                onClick={() =>
                  navigate("/buyer")
                }
              >
                Browse Marketplace
                <span>→</span>
              </button>
            ) : (
              <button
                className="buyer-secondary-btn"
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
          /* =================================================
             ORDER CARDS
          ================================================= */

          <div className="buyer-orders-list">
            {filteredOrders.map((order) => (
              <article
                className="buyer-order-card"
                key={order._id}
              >
                {/* Card header */}
                <div className="buyer-order-card-top">
                  <div className="buyer-crop-info">
                    <div className="buyer-crop-avatar">
                      🌾
                    </div>

                    <div>
                      <div className="buyer-crop-title">
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

                      <p>
                        Order #
                        {order._id
                          ?.slice(-8)
                          .toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="buyer-order-value">
                    <span>Total paid</span>

                    <strong>
                      ₹
                      {Number(
                        order.totalPrice || 0
                      ).toLocaleString("en-IN")}
                    </strong>
                  </div>
                </div>

                {/* Details */}
                <div className="buyer-order-details">
                  <div>
                    <span>Farmer</span>

                    <strong>
                      {order.farmer?.name ||
                        "Unknown farmer"}
                    </strong>

                    {order.farmer?.email && (
                      <small>
                        {order.farmer.email}
                      </small>
                    )}
                  </div>

                  <div>
                    <span>Quantity</span>

                    <strong>
                      {order.quantity}{" "}
                      {order.listing?.unit ||
                        "kg"}
                    </strong>

                    <small>
                      Crop quantity
                    </small>
                  </div>

                  <div>
                    <span>Ordered on</span>

                    <strong>
                      {formatDate(
                        order.createdAt
                      )}
                    </strong>

                    <small>
                      Purchase date
                    </small>
                  </div>

                  <div>
                    <span>Shipment</span>

                    <strong>
                      {order.shipment
                        ? formatStatus(
                            order.shipment.status
                          )
                        : "Not created"}
                    </strong>

                    <small>
                      {order.shipment
                        ?.trackingNumber
                        ? `Tracking: ${order.shipment.trackingNumber}`
                        : order.shipment?.carrier ||
                          "Awaiting shipment"}
                    </small>
                  </div>
                </div>

                {/* Progress */}
                {order.status !==
                  "CANCELLED" && (
                  <div className="buyer-order-progress">
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
                        currentIndex >= index;

                      return (
                        <div
                          className={`buyer-progress-stage ${
                            completed
                              ? "completed"
                              : ""
                          }`}
                          key={stage}
                        >
                          <div className="buyer-progress-dot">
                            {completed ? "✓" : ""}
                          </div>

                          <span>
                            {formatStatus(stage)}
                          </span>

                          {index < 3 && (
                            <div
                              className={`buyer-progress-line ${
                                currentIndex >
                                index
                                  ? "completed"
                                  : ""
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {order.status ===
                  "CANCELLED" && (
                  <div className="buyer-cancelled">
                    <span>×</span>
                    This order has been cancelled.
                  </div>
                )}

                {/* Actions */}
                <div className="buyer-order-actions">
                  <div className="buyer-order-live">
                    <span className="buyer-mini-live" />
                    Status updates automatically
                  </div>

                  <button
                    className="buyer-view-order-btn"
                    onClick={() =>
                      navigate(
                        `/orders/${order._id}`
                      )
                    }
                  >
                    View Order Details
                    <span>→</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}