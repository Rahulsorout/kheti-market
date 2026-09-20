import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";

import { useAuth } from "../context/AuthContext";

import {
  getBidsForListing,
  acceptBid,
  rejectBid,
} from "../services/bidService";

import { SOCKET_URL } from "../config/api";

export default function FarmerBids() {
  const { listingId } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [bids, setBids] = useState([]);
  const [listing, setListing] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sort, setSort] = useState("newest");

  async function fetchBids() {
    try {
      setLoading(true);
      setError("");

      const response = await getBidsForListing(
        listingId,
        token
      );

      console.log("Bids:", response.data);

      const fetchedBids =
        response.data.data || [];

      setBids(fetchedBids);

      /*
       * Listing information may be available
       * from populated bid data in the future.
       */
      if (fetchedBids[0]?.listing) {
        setListing(
          typeof fetchedBids[0].listing === "object"
            ? fetchedBids[0].listing
            : null
        );
      }
    } catch (error) {
      console.error(
        "Failed to fetch bids:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load bids."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token && listingId) {
      fetchBids();
    }
  }, [token, listingId]);

  /*
   * REAL-TIME BID RECEIVING
   */
  useEffect(() => {
    if (!token || !user?.id || !listingId) {
      return;
    }

    const socket = io(SOCKET_URL);

    socket.on("connect", () => {
      console.log(
        "Farmer bids socket connected:",
        socket.id
      );

      socket.emit(
        "joinFarmer",
        user.id
      );
    });

    socket.on("newBid", (newBid) => {
      console.log(
        "NEW BID RECEIVED:",
        newBid
      );

      if (
        newBid.listingId?.toString() !==
        listingId.toString()
      ) {
        return;
      }

      const normalizedBid = {
        ...newBid,
        _id:
          newBid._id ||
          newBid.bidId,
      };

      setBids((previousBids) => {

        const exists =
          previousBids.some(
            (bid) =>
              bid._id?.toString() ===
              normalizedBid._id?.toString()
          );

        if (exists) {
          return previousBids;
        }

        return [
          normalizedBid,
          ...previousBids,
        ];
      });
    });

    socket.on(
      "connect_error",
      (error) => {
        console.error(
          "Farmer bids socket error:",
          error
        );
      }
    );

    return () => {
      socket.disconnect();
    };
  }, [
    token,
    user?.id,
    listingId,
  ]);

  async function handleAccept(bidId) {
    if (!bidId) {
      setError("Invalid bid ID.");
      return;
    }

    try {
      setActionLoading(bidId);
      setError("");

      const response =
        await acceptBid(
          bidId,
          token
        );

      console.log(
        "Bid accepted:",
        response.data
      );

      const contractId =
        response.data.data?.contractId;

      if (contractId) {
        navigate(
          `/contracts/${contractId}`
        );
      } else {
        await fetchBids();
      }
    } catch (error) {
      console.error(
        "Failed to accept bid:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to accept bid."
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(bidId) {
    if (!bidId) {
      setError("Invalid bid ID.");
      return;
    }

    try {
      setActionLoading(bidId);
      setError("");

      await rejectBid(
        bidId,
        token
      );

      setBids((previousBids) =>
        previousBids.map((bid) =>
          bid._id?.toString() ===
          bidId.toString()
            ? {
                ...bid,
                status: "REJECTED",
              }
            : bid
        )
      );
    } catch (error) {
      console.error(
        "Failed to reject bid:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to reject bid."
      );
    } finally {
      setActionLoading(null);
    }
  }

  const pendingCount = bids.filter(
    (bid) =>
      bid.status === "PENDING"
  ).length;

  const acceptedCount = bids.filter(
    (bid) =>
      bid.status === "ACCEPTED"
  ).length;

  const rejectedCount = bids.filter(
    (bid) =>
      bid.status === "REJECTED"
  ).length;

  const filteredBids = useMemo(() => {
    let result = [...bids];

    if (statusFilter !== "ALL") {
      result = result.filter(
        (bid) =>
          bid.status === statusFilter
      );
    }

    result.sort((a, b) => {

      if (sort === "price_high") {
        return (
          Number(b.price || 0) -
          Number(a.price || 0)
        );
      }

      if (sort === "price_low") {
        return (
          Number(a.price || 0) -
          Number(b.price || 0)
        );
      }

      if (sort === "quantity") {
        return (
          Number(b.quantity || 0) -
          Number(a.quantity || 0)
        );
      }

      return (
        new Date(
          b.createdAt || 0
        ) -
        new Date(
          a.createdAt || 0
        )
      );
    });

    return result;
  }, [
    bids,
    statusFilter,
    sort,
  ]);

  if (loading) {
    return (
      <div className="farmer-bids-page">

        <div className="farmer-bids-container">

          <div className="bids-loading-header">
            <div className="bids-loading-line large" />
            <div className="bids-loading-line" />
          </div>

          <div className="bids-skeleton-list">
            {[1, 2, 3].map(
              (item) => (
                <div
                  className="bid-skeleton"
                  key={item}
                >
                  <div className="bid-skeleton-avatar" />

                  <div className="bid-skeleton-content">
                    <div className="bids-loading-line" />
                    <div className="bids-loading-line short" />
                    <div className="bids-loading-line" />
                  </div>
                </div>
              )
            )}
          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="farmer-bids-page">

      {/* TOP BAR */}

      <header className="farmer-bids-topbar">

        <div className="farmer-bids-topbar-inner">

          <button
            className="bids-back-button"
            onClick={() =>
              navigate(
                "/farmer/my-products"
              )
            }
          >
            <span>←</span>
            My Listings
          </button>

          <div className="bids-live-indicator">
            <span />
            Live offers
          </div>

        </div>

      </header>

      <main className="farmer-bids-container">

        {/* ERROR */}

        {error && (
          <div className="bids-alert">

            <span>!</span>

            <p>{error}</p>

            <button
              onClick={() =>
                setError("")
              }
            >
              ×
            </button>

          </div>
        )}

        {/* HEADER */}

        <section className="bids-page-header">

          <div>

            <span className="bids-eyebrow">
              OFFER MANAGEMENT
            </span>

            <h1>Received Offers</h1>

            <p>
              Review buyer offers, compare
              prices, and choose how you want
              to proceed.
            </p>

          </div>

          <button
            className="bids-header-button"
            onClick={() =>
              navigate(
                "/farmer/my-products"
              )
            }
          >
            ← Back to listings
          </button>

        </section>

        {/* LISTING CONTEXT */}

        <section className="bid-listing-context">

          <div className="bid-listing-icon">
            🌾
          </div>

          <div className="bid-listing-info">

            <span>
              LISTING
            </span>

            <h2>
              {listing?.cropName ||
                "Your crop listing"}
            </h2>

            <p>
              Buyer offers for this
              listing
            </p>

          </div>

          <div className="bid-context-live">

            <span />
            Receiving offers live

          </div>

        </section>

        {/* STATS */}

        <section className="bid-stats">

          <div className="bid-stat-card">

            <div className="bid-stat-icon total">
              💬
            </div>

            <div>
              <span>
                Total offers
              </span>

              <strong>
                {bids.length}
              </strong>
            </div>

          </div>

          <div className="bid-stat-card">

            <div className="bid-stat-icon pending">
              ◷
            </div>

            <div>
              <span>
                Awaiting review
              </span>

              <strong>
                {pendingCount}
              </strong>
            </div>

          </div>

          <div className="bid-stat-card">

            <div className="bid-stat-icon accepted">
              ✓
            </div>

            <div>
              <span>
                Accepted
              </span>

              <strong>
                {acceptedCount}
              </strong>
            </div>

          </div>

          <div className="bid-stat-card">

            <div className="bid-stat-icon rejected">
              ×
            </div>

            <div>
              <span>
                Rejected
              </span>

              <strong>
                {rejectedCount}
              </strong>
            </div>

          </div>

        </section>

        {/* TOOLBAR */}

        <section className="bids-toolbar">

          <div className="bid-filter-tabs">

            <button
              className={
                statusFilter === "ALL"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setStatusFilter("ALL")
              }
            >
              All
              <span>
                {bids.length}
              </span>
            </button>

            <button
              className={
                statusFilter === "PENDING"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setStatusFilter(
                  "PENDING"
                )
              }
            >
              Pending
              <span>
                {pendingCount}
              </span>
            </button>

            <button
              className={
                statusFilter === "ACCEPTED"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setStatusFilter(
                  "ACCEPTED"
                )
              }
            >
              Accepted
              <span>
                {acceptedCount}
              </span>
            </button>

            <button
              className={
                statusFilter === "REJECTED"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setStatusFilter(
                  "REJECTED"
                )
              }
            >
              Rejected
              <span>
                {rejectedCount}
              </span>
            </button>

          </div>

          <select
            className="bid-sort-select"
            value={sort}
            onChange={(e) =>
              setSort(e.target.value)
            }
          >
            <option value="newest">
              Newest offers
            </option>

            <option value="price_high">
              Highest price
            </option>

            <option value="price_low">
              Lowest price
            </option>

            <option value="quantity">
              Highest quantity
            </option>
          </select>

        </section>

        {/* OFFERS */}

        {filteredBids.length === 0 ? (

          <div className="bids-empty">

            <div className="bids-empty-icon">
              {bids.length === 0
                ? "🌱"
                : "🔎"}
            </div>

            <h2>
              {bids.length === 0
                ? "No offers yet"
                : "No matching offers"}
            </h2>

            <p>
              {bids.length === 0
                ? "When buyers make offers on your crop, they'll appear here instantly."
                : "Try selecting another status filter."}
            </p>

          </div>

        ) : (

          <section className="bid-list">

            {filteredBids.map(
              (bid, index) => {

                const isPending =
                  bid.status ===
                  "PENDING";

                const isAccepted =
                  bid.status ===
                  "ACCEPTED";

                const isRejected =
                  bid.status ===
                  "REJECTED";

                const buyerName =
                  bid.buyer?.name ||
                  bid.buyer?.email ||
                  "Buyer";

                return (
                  <article
                    className={`offer-card ${
                      isPending
                        ? "offer-pending"
                        : ""
                    }`}
                    key={
                      bid._id ||
                      `bid-${index}`
                    }
                  >

                    {/* BUYER */}

                    <div className="offer-buyer">

                      <div className="buyer-avatar">

                        {buyerName
                          .charAt(0)
                          .toUpperCase()}

                      </div>

                      <div>

                        <span className="offer-label">
                          BUYER
                        </span>

                        <h3>
                          {buyerName}
                        </h3>

                        {bid.buyer?.email && (
                          <p>
                            {bid.buyer.email}
                          </p>
                        )}

                      </div>

                    </div>

                    {/* OFFER VALUE */}

                    <div className="offer-value">

                      <span>
                        OFFER PRICE
                      </span>

                      <strong>
                        ₹
                        {Number(
                          bid.price || 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                      <small>
                        per unit
                      </small>

                    </div>

                    {/* QUANTITY */}

                    <div className="offer-detail">

                      <span>
                        QUANTITY
                      </span>

                      <strong>
                        {bid.quantity}
                      </strong>

                    </div>

                    {/* DELIVERY */}

                    <div className="offer-detail">

                      <span>
                        DELIVERY
                      </span>

                      <strong>
                        {bid.deliveryDate
                          ? new Date(
                              bid.deliveryDate
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month:
                                  "short",
                                year:
                                  "numeric",
                              }
                            )
                          : "Not specified"}
                      </strong>

                    </div>

                    {/* STATUS */}

                    <div className="offer-status">

                      <span
                        className={`offer-status-pill ${
                          isPending
                            ? "pending"
                            : isAccepted
                            ? "accepted"
                            : isRejected
                            ? "rejected"
                            : "other"
                        }`}
                      >
                        <span />

                        {bid.status}
                      </span>

                    </div>

                    {/* ACTIONS */}

                    {isPending ? (

                      <div className="offer-actions">

                        <button
                          className="accept-offer-button"
                          onClick={() =>
                            handleAccept(
                              bid._id
                            )
                          }
                          disabled={
                            actionLoading ===
                            bid._id
                          }
                        >
                          {actionLoading ===
                          bid._id
                            ? "Processing..."
                            : "Accept Offer"}
                        </button>

                        <button
                          className="reject-offer-button"
                          onClick={() =>
                            handleReject(
                              bid._id
                            )
                          }
                          disabled={
                            actionLoading ===
                            bid._id
                          }
                        >
                          Reject
                        </button>

                      </div>

                    ) : (

                      <div className="offer-closed">
                        {isAccepted
                          ? "Contract created"
                          : isRejected
                          ? "Offer closed"
                          : "No action required"}
                      </div>

                    )}

                  </article>
                );
              }
            )}

          </section>

        )}

      </main>

    </div>
  );
}