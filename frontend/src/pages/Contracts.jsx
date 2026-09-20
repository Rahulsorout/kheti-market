import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { io } from "socket.io-client";

import { API_URL, SOCKET_URL } from "../config/api";

export default function Contracts() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "{API_URL}/api/v1/contracts",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            role: user?.role?.toLowerCase(),
          },
        }
      );

      setContracts(response.data.data || []);
    } catch (err) {
      console.error(
        "Failed to fetch contracts:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load contracts."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     INITIAL FETCH
  ===================================================== */

  useEffect(() => {
    if (token && user) {
      fetchContracts();
    }
  }, [token, user]);

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
        "Contracts socket connected:",
        socket.id
      );

      if (user.role === "BUYER") {
        socket.emit("joinBuyer", user.id);
      }

      if (user.role === "FARMER") {
        socket.emit("joinFarmer", user.id);
      }
    });

    socket.on("orderCreated", () => {
      fetchContracts();
    });

    socket.on(
      "contractUpdated",
      () => {
        fetchContracts();
      }
    );

    socket.on(
      "connect_error",
      (error) => {
        console.error(
          "Contracts socket error:",
          error
        );
      }
    );

    socket.on("disconnect", () => {
      console.log(
        "Contracts socket disconnected"
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [token, user?.id, user?.role]);

  /* =====================================================
     STATUS
  ===================================================== */

  const getStatusClass = (status) => {
    return `contract-status status-${status?.toLowerCase()}`;
  };

  const formatStatus = (status) => {
    return (
      status
        ?.replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) =>
          letter.toUpperCase()
        ) || "Unknown"
    );
  };

  const formatDate = (date) => {
    if (!date) return "Not specified";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =====================================================
     STATS
  ===================================================== */

  const stats = useMemo(() => {
    return {
      total: contracts.length,

      active: contracts.filter((contract) =>
        [
          "CREATED",
          "IN_PROGRESS",
          "SHIPPED",
        ].includes(contract.status)
      ).length,

      delivered: contracts.filter(
        (contract) =>
          contract.status === "DELIVERED"
      ).length,

      completed: contracts.filter(
        (contract) =>
          contract.status === "COMPLETED"
      ).length,

      disputed: contracts.filter(
        (contract) =>
          contract.status === "DISPUTED"
      ).length,
    };
  }, [contracts]);

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredContracts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return contracts.filter((contract) => {
      const crop =
        contract.cropName?.toLowerCase() || "";

      const counterparty =
        user?.role === "FARMER"
          ? contract.buyer?.name?.toLowerCase() || ""
          : contract.farmer?.name?.toLowerCase() || "";

      const contractId =
        contract._id?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        crop.includes(query) ||
        counterparty.includes(query) ||
        contractId.includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        contract.status === statusFilter;

      return (
        matchesSearch && matchesStatus
      );
    });
  }, [
    contracts,
    search,
    statusFilter,
    user?.role,
  ]);

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="contracts-page">
        <div className="contracts-shell">

          <div className="contracts-loading-header">
            <div className="contract-skeleton title" />
            <div className="contract-skeleton subtitle" />
          </div>

          <div className="contracts-stats">
            {[1, 2, 3, 4].map((item) => (
              <div
                className="contract-stat-card"
                key={item}
              >
                <div className="contract-skeleton stat-icon" />

                <div>
                  <div className="contract-skeleton small" />
                  <div className="contract-skeleton number" />
                </div>
              </div>
            ))}
          </div>

          <div className="contracts-loading-list">
            {[1, 2, 3].map((item) => (
              <div
                className="contract-loading-card"
                key={item}
              >
                <div className="contract-skeleton crop" />
                <div className="contract-skeleton line" />
                <div className="contract-skeleton line short" />
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

  if (error && contracts.length === 0) {
    return (
      <div className="contracts-page">
        <div className="contracts-shell">
          <div className="contracts-error">
            <div className="contracts-error-icon">
              !
            </div>

            <h2>Unable to load contracts</h2>

            <p>{error}</p>

            <button
              className="contracts-primary-btn"
              onClick={fetchContracts}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="contracts-page">
      <div className="contracts-shell">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="contracts-header">
          <div>
            <div className="contracts-eyebrow">
              AGREEMENTS
            </div>

            <h1>My Contracts</h1>

            <p>
              Manage your active agreements,
              deliveries and completed deals.
            </p>
          </div>

          <div className="contracts-live-badge">
            <span />
            Live contract updates
          </div>
        </header>

        {/* =================================================
            STATS
        ================================================= */}

        <section className="contracts-stats">
          <div className="contract-stat-card">
            <div className="contract-stat-icon">
              📄
            </div>

            <div>
              <span>Total Contracts</span>
              <strong>{stats.total}</strong>
            </div>
          </div>

          <div className="contract-stat-card">
            <div className="contract-stat-icon active">
              ⚡
            </div>

            <div>
              <span>Active</span>
              <strong>{stats.active}</strong>
            </div>
          </div>

          <div className="contract-stat-card">
            <div className="contract-stat-icon delivered">
              🚚
            </div>

            <div>
              <span>Delivered</span>
              <strong>{stats.delivered}</strong>
            </div>
          </div>

          <div className="contract-stat-card">
            <div className="contract-stat-icon completed">
              ✓
            </div>

            <div>
              <span>Completed</span>
              <strong>{stats.completed}</strong>
            </div>
          </div>

          <div className="contract-stat-card">
            <div className="contract-stat-icon disputed">
              !
            </div>

            <div>
              <span>Disputed</span>
              <strong>{stats.disputed}</strong>
            </div>
          </div>
        </section>

        {/* =================================================
            TOOLBAR
        ================================================= */}

        <section className="contracts-toolbar">
          <div className="contract-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search crop, counterparty or contract ID..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          <div className="contract-filters">
            {[
              ["ALL", "All"],
              ["CREATED", "Created"],
              ["IN_PROGRESS", "In Progress"],
              ["SHIPPED", "Shipped"],
              ["DELIVERED", "Delivered"],
              ["COMPLETED", "Completed"],
              ["DISPUTED", "Disputed"],
              ["CANCELLED", "Cancelled"],
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
          <div className="contracts-error-banner">
            <span>!</span>
            {error}
          </div>
        )}

        {/* =================================================
            RESULTS
        ================================================= */}

        <div className="contracts-results-header">
          <div>
            <h2>Contract activity</h2>

            <p>
              Showing{" "}
              {filteredContracts.length}{" "}
              {filteredContracts.length === 1
                ? "contract"
                : "contracts"}
            </p>
          </div>
        </div>

        {/* =================================================
            EMPTY
        ================================================= */}

        {filteredContracts.length === 0 ? (
          <div className="empty-contracts">
            <div className="contract-empty-icon">
              📄
            </div>

            <h2>
              {contracts.length === 0
                ? "No contracts yet"
                : "No matching contracts"}
            </h2>

            <p>
              {contracts.length === 0
                ? "Your accepted bids will appear here as contracts."
                : "Try changing your search or status filter."}
            </p>

            {contracts.length === 0 ? (
              <button
                className="contracts-primary-btn"
                onClick={() =>
                  navigate(
                    user?.role === "FARMER"
                      ? "/farmer"
                      : "/buyer"
                  )
                }
              >
                Go to Dashboard
                <span>→</span>
              </button>
            ) : (
              <button
                className="contracts-secondary-btn"
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
             CONTRACT LIST
          ================================================= */

          <div className="contracts-list">
            {filteredContracts.map(
              (contract) => {
                const counterparty =
                  user?.role === "FARMER"
                    ? contract.buyer
                    : contract.farmer;

                return (
                  <article
                    className="contract-card"
                    key={contract._id}
                  >
                    {/* Card header */}

                    <div className="contract-card-header">
                      <div className="contract-title-area">
                        <div className="contract-crop-icon">
                          🌾
                        </div>

                        <div>
                          <div className="contract-title-row">
                            <h2>
                              {contract.cropName ||
                                "Crop Contract"}
                            </h2>

                            <span
                              className={getStatusClass(
                                contract.status
                              )}
                            >
                              {formatStatus(
                                contract.status
                              )}
                            </span>
                          </div>

                          <span className="contract-id">
                            Contract #
                            {contract._id
                              ?.slice(-10)
                              .toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="contract-value">
                        <span>Agreed price</span>

                        <strong>
                          ₹
                          {Number(
                            contract.price || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>
                      </div>
                    </div>

                    {/* Details */}

                    <div className="contract-details">
                      <div>
                        <span>Quantity</span>

                        <strong>
                          {contract.quantity}
                        </strong>

                        <small>
                          Crop quantity
                        </small>
                      </div>

                      <div>
                        <span>
                          Delivery date
                        </span>

                        <strong>
                          {formatDate(
                            contract.deliveryDate
                          )}
                        </strong>

                        <small>
                          Agreed delivery
                        </small>
                      </div>

                      <div>
                        <span>
                          {user?.role === "FARMER"
                            ? "Buyer"
                            : "Farmer"}
                        </span>

                        <strong>
                          {counterparty?.name ||
                            "Unknown"}
                        </strong>

                        {counterparty?.email && (
                          <small>
                            {
                              counterparty.email
                            }
                          </small>
                        )}
                      </div>

                      <div>
                        <span>
                          Contract created
                        </span>

                        <strong>
                          {formatDate(
                            contract.createdAt
                          )}
                        </strong>

                        <small>
                          Agreement date
                        </small>
                      </div>
                    </div>

                    {/* Progress */}

                    {contract.status !==
                      "CANCELLED" &&
                      contract.status !==
                        "DISPUTED" && (
                        <div className="contract-progress">
                          {[
                            "CREATED",
                            "IN_PROGRESS",
                            "SHIPPED",
                            "DELIVERED",
                            "COMPLETED",
                          ].map(
                            (stage, index) => {
                              const stages = [
                                "CREATED",
                                "IN_PROGRESS",
                                "SHIPPED",
                                "DELIVERED",
                                "COMPLETED",
                              ];

                              const currentIndex =
                                stages.indexOf(
                                  contract.status
                                );

                              const completed =
                                currentIndex >=
                                index;

                              return (
                                <div
                                  className={`contract-progress-stage ${
                                    completed
                                      ? "completed"
                                      : ""
                                  }`}
                                  key={stage}
                                >
                                  <div className="contract-progress-dot">
                                    {completed
                                      ? "✓"
                                      : ""}
                                  </div>

                                  <span>
                                    {formatStatus(
                                      stage
                                    )}
                                  </span>

                                  {index <
                                    stages.length -
                                      1 && (
                                    <div
                                      className={`contract-progress-line ${
                                        currentIndex >
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
                      )}

                    {contract.status ===
                      "DISPUTED" && (
                      <div className="contract-warning">
                        <span>!</span>
                        This contract is currently
                        disputed.
                      </div>
                    )}

                    {contract.status ===
                      "CANCELLED" && (
                      <div className="contract-cancelled">
                        <span>×</span>
                        This contract has been
                        cancelled.
                      </div>
                    )}

                    {/* Actions */}

                    <div className="contract-actions">
                      <div className="contract-live-text">
                        <span />
                        Contract updates automatically
                      </div>

                      <div className="contract-action-buttons">
                        <button
                          className="chat-button"
                          onClick={() =>
                            navigate(
                              `/contracts/${contract._id}/chat`
                            )
                          }
                        >
                          <span>💬</span>
                          Open Chat
                        </button>

                        <button
                          className="view-contract-button"
                          onClick={() =>
                            navigate(
                              `/contracts/${contract._id}`
                            )
                          }
                        >
                          View Contract
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </div>
    </div>
  );
}