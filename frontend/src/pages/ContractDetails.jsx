import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

import {
  createPayment,
  getPaymentByOrder,
  markPaymentAsPaid
} from "../services/paymentService";

export default function ContractDetails() {
  const { contractId } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [contract, setContract] = useState(null);
  const [payment, setPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updating, setUpdating] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  /* =====================================================
     FETCH PAYMENT
  ===================================================== */

  const fetchPayment = async (orderId) => {
    try {
      const response = await getPaymentByOrder(
        orderId,
        token
      );

      setPayment(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setPayment(null);
        return;
      }

      console.error(
        "Failed to fetch payment:",
        err
      );
    }
  };

  /* =====================================================
     FETCH CONTRACT
  ===================================================== */

  const fetchContract = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `http://localhost:5000/api/v1/contracts/${contractId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const contractData = response.data.data;

      setContract(contractData);

      if (contractData.order?._id) {
        await fetchPayment(
          contractData.order._id
        );
      }
    } catch (err) {
      console.error(
        "FETCH CONTRACT ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load contract."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    if (token && contractId) {
      fetchContract();
    }
  }, [token, contractId]);

  /* =====================================================
     UPDATE CONTRACT STATUS
  ===================================================== */

  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true);

      const response = await axios.patch(
        `http://localhost:5000/api/v1/contracts/${contractId}/status`,
        {
          status: newStatus
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setContract(response.data.data);
    } catch (err) {
      console.error(
        "UPDATE CONTRACT ERROR:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Failed to update contract status."
      );
    } finally {
      setUpdating(false);
    }
  };

  /* =====================================================
     CREATE PAYMENT
  ===================================================== */

  const handleCreatePayment = async () => {
    if (!contract?.order?._id) {
      alert(
        "No order is linked to this contract."
      );
      return;
    }

    try {
      setPaymentLoading(true);

      const response = await createPayment(
        {
          orderId: contract.order._id,
          method: paymentMethod
        },
        token
      );

      setPayment(response.data.payment);

      alert(
        "Payment created successfully."
      );
    } catch (err) {
      console.error(
        "CREATE PAYMENT ERROR:",
        err
      );

      if (err.response?.status === 409) {
        await fetchPayment(
          contract.order._id
        );
      }

      alert(
        err.response?.data?.message ||
          "Failed to create payment."
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  /* =====================================================
     PAY NOW
  ===================================================== */

  const handlePayNow = async () => {
    if (!payment?._id) {
      alert("Payment not found.");
      return;
    }

    try {
      setPaymentLoading(true);

      const response =
        await markPaymentAsPaid(
          payment._id,
          token
        );

      setPayment(response.data.payment);

      alert(
        "Payment completed successfully."
      );
    } catch (err) {
      console.error(
        "PAYMENT ERROR:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Payment failed."
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  /* =====================================================
     HELPERS
  ===================================================== */

  const formatDate = (date) => {
    if (!date) return "Not specified";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const getStatusClass = (status) => {
    return `contract-detail-status status-${status
      ?.toLowerCase()
      .replace(/_/g, "-")}`;
  };

  const isFarmer = user?.role === "FARMER";
  const isBuyer = user?.role === "BUYER";

  const counterparty = isFarmer
    ? contract?.buyer
    : contract?.farmer;

  const stages = [
    "CREATED",
    "IN_PROGRESS",
    "PAID",
    "SHIPPED",
    "DELIVERED",
    "COMPLETED"
  ];

  const currentStageIndex =
    stages.indexOf(contract?.status);

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="contract-details-page">
        <div className="contract-details-shell">

          <div className="contract-details-loading">
            <div className="contract-detail-skeleton back" />
            <div className="contract-detail-skeleton title" />
            <div className="contract-detail-skeleton subtitle" />

            <div className="contract-detail-loading-grid">
              <div className="contract-detail-skeleton card" />
              <div className="contract-detail-skeleton card" />
            </div>

            <div className="contract-detail-skeleton large-card" />
          </div>

        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <div className="contract-details-page">
        <div className="contract-details-shell">
          <div className="contract-detail-error">

            <div className="contract-detail-error-icon">
              !
            </div>

            <h2>Unable to load contract</h2>

            <p>{error}</p>

            <button
              className="contract-detail-primary-btn"
              onClick={() =>
                navigate("/contracts")
              }
            >
              ← Back to Contracts
            </button>

          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     NOT FOUND
  ===================================================== */

  if (!contract) {
    return (
      <div className="contract-details-page">
        <div className="contract-details-shell">
          <div className="contract-detail-error">
            <h2>Contract not found</h2>

            <button
              className="contract-detail-primary-btn"
              onClick={() =>
                navigate("/contracts")
              }
            >
              ← Back to Contracts
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="contract-details-page">
      <div className="contract-details-shell">

        {/* =================================================
            BACK
        ================================================= */}

        <button
          className="contract-back-button"
          onClick={() =>
            navigate("/contracts")
          }
        >
          <span>←</span>
          Back to Contracts
        </button>

        {/* =================================================
            HERO
        ================================================= */}

        <section className="contract-detail-hero">

          <div className="contract-detail-hero-main">

            <div className="contract-detail-crop-icon">
              🌾
            </div>

            <div>
              <div className="contract-detail-eyebrow">
                CONTRACT AGREEMENT
              </div>

              <h1>
                {contract.cropName ||
                  "Crop Contract"}
              </h1>

              <p className="contract-detail-id">
                Contract #
                {contract._id
                  ?.slice(-12)
                  .toUpperCase()}
              </p>
            </div>

          </div>

          <div className="contract-detail-hero-right">

            <span
              className={getStatusClass(
                contract.status
              )}
            >
              {formatStatus(
                contract.status
              )}
            </span>

            <div className="contract-detail-price">
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

        </section>

        {/* =================================================
            PROGRESS
        ================================================= */}

        {contract.status !== "CANCELLED" &&
          contract.status !== "DISPUTED" && (
            <section className="contract-detail-progress-card">

              <div className="contract-section-heading">
                <div>
                  <span>
                    AGREEMENT PROGRESS
                  </span>

                  <h2>
                    Contract lifecycle
                  </h2>
                </div>

                <small>
                  {formatStatus(
                    contract.status
                  )}
                </small>
              </div>

              <div className="contract-detail-progress">

                {stages.map(
                  (stage, index) => {
                    const completed =
                      currentStageIndex >=
                      index;

                    return (
                      <div
                        className={`contract-detail-stage ${
                          completed
                            ? "completed"
                            : ""
                        } ${
                          index ===
                          currentStageIndex
                            ? "current"
                            : ""
                        }`}
                        key={stage}
                      >
                        <div className="contract-detail-stage-marker">
                          {completed
                            ? "✓"
                            : index + 1}
                        </div>

                        <span>
                          {formatStatus(
                            stage
                          )}
                        </span>

                        {index <
                          stages.length - 1 && (
                          <div
                            className={`contract-detail-stage-line ${
                              currentStageIndex >
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
            MAIN GRID
        ================================================= */}

        <div className="contract-detail-layout">

          <main>

            {/* Contract Information */}

            <section className="contract-detail-card">

              <div className="contract-section-heading">
                <div>
                  <span>
                    AGREEMENT
                  </span>

                  <h2>
                    Contract information
                  </h2>
                </div>
              </div>

              <div className="contract-info-grid">

                <div className="contract-info-item">
                  <span>Quantity</span>
                  <strong>
                    {contract.quantity}
                  </strong>
                  <small>
                    Agreed crop quantity
                  </small>
                </div>

                <div className="contract-info-item">
                  <span>Agreed price</span>
                  <strong>
                    ₹
                    {Number(
                      contract.price || 0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                  <small>
                    Contract price
                  </small>
                </div>

                <div className="contract-info-item">
                  <span>Delivery date</span>
                  <strong>
                    {formatDate(
                      contract.deliveryDate
                    )}
                  </strong>
                  <small>
                    Agreed delivery
                  </small>
                </div>

                <div className="contract-info-item">
                  <span>Status</span>
                  <strong>
                    {formatStatus(
                      contract.status
                    )}
                  </strong>
                  <small>
                    Current contract state
                  </small>
                </div>

              </div>

            </section>

            {/* Counterparty */}

            <section className="contract-detail-card">

              <div className="contract-section-heading">
                <div>
                  <span>
                    COUNTERPARTY
                  </span>

                  <h2>
                    {isFarmer
                      ? "Buyer details"
                      : "Farmer details"}
                  </h2>
                </div>
              </div>

              <div className="contract-person">

                <div className="contract-person-avatar">
                  {counterparty?.name
                    ?.charAt(0)
                    ?.toUpperCase() || "?"}
                </div>

                <div className="contract-person-main">

                  <h3>
                    {counterparty?.name ||
                      "Unknown"}
                  </h3>

                  <div className="contract-person-details">

                    <span>
                      ✉{" "}
                      {counterparty?.email ||
                        "N/A"}
                    </span>

                    <span>
                      ☎{" "}
                      {counterparty?.phone ||
                        "N/A"}
                    </span>

                  </div>

                </div>

                <button
                  className="contract-person-chat"
                  onClick={() =>
                    navigate(
                      `/contracts/${contract._id}/chat`
                    )
                  }
                >
                  💬 Chat
                </button>

              </div>

            </section>

            {/* Order */}

            {contract.order && (
              <section className="contract-detail-card">

                <div className="contract-section-heading">
                  <div>
                    <span>
                      ORDER
                    </span>

                    <h2>
                      Linked order
                    </h2>
                  </div>

                  <span className="contract-order-status">
                    {formatStatus(
                      contract.order.status
                    )}
                  </span>
                </div>

                <div className="contract-order-grid">

                  <div>
                    <span>Order ID</span>
                    <strong>
                      #
                      {contract.order._id
                        ?.slice(-10)
                        .toUpperCase()}
                    </strong>
                  </div>

                  <div>
                    <span>Quantity</span>
                    <strong>
                      {contract.order.quantity}
                    </strong>
                  </div>

                  <div>
                    <span>Order total</span>
                    <strong>
                      ₹
                      {Number(
                        contract.order
                          .totalPrice || 0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>

                </div>

              </section>
            )}

            {/* Payment */}

            <section className="contract-detail-card">

              <div className="contract-section-heading">
                <div>
                  <span>
                    PAYMENT
                  </span>

                  <h2>
                    Payment information
                  </h2>
                </div>

                {payment && (
                  <span
                    className={`payment-status-badge payment-${payment.status?.toLowerCase()}`}
                  >
                    {formatStatus(
                      payment.status
                    )}
                  </span>
                )}
              </div>

              {!contract.order && (
                <div className="contract-detail-notice">
                  <span>!</span>
                  No order is linked to this
                  contract.
                </div>
              )}

              {/* Buyer — no payment */}

              {!payment &&
                contract.order &&
                isBuyer && (
                  <div className="payment-create-box">

                    <div className="payment-amount">

                      <span>
                        Amount payable
                      </span>

                      <strong>
                        ₹
                        {Number(
                          contract.order
                            .totalPrice ||
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                    </div>

                    <div className="payment-form">

                      <label>
                        Payment method
                      </label>

                      <select
                        value={
                          paymentMethod
                        }
                        onChange={(e) =>
                          setPaymentMethod(
                            e.target.value
                          )
                        }
                      >
                        <option value="UPI">
                          UPI
                        </option>

                        <option value="CARD">
                          Card
                        </option>

                        <option value="COD">
                          Cash on Delivery
                        </option>

                        <option value="BANK_TRANSFER">
                          Bank Transfer
                        </option>
                      </select>

                      <button
                        className="payment-primary-button"
                        disabled={
                          paymentLoading
                        }
                        onClick={
                          handleCreatePayment
                        }
                      >
                        {paymentLoading
                          ? "Creating..."
                          : "Create Payment →"}
                      </button>

                    </div>

                  </div>
                )}

              {/* Existing payment */}

              {payment && (
                <div className="payment-existing">

                  <div className="payment-summary-grid">

                    <div>
                      <span>
                        Amount
                      </span>

                      <strong>
                        ₹
                        {Number(
                          payment.amount ||
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Method
                      </span>

                      <strong>
                        {payment.method}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Status
                      </span>

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
                          {
                            payment.transactionId
                          }
                        </strong>
                      </div>
                    )}

                  </div>

                  {payment.status ===
                    "PENDING" &&
                    isBuyer && (
                      <div className="payment-action-row">

                        <div>
                          <strong>
                            Payment is pending
                          </strong>

                          <p>
                            Complete the payment
                            to continue the
                            contract.
                          </p>
                        </div>

                        <button
                          className="payment-primary-button"
                          disabled={
                            paymentLoading
                          }
                          onClick={
                            handlePayNow
                          }
                        >
                          {paymentLoading
                            ? "Processing..."
                            : "💳 Pay Now"}
                        </button>

                      </div>
                    )}

                  {payment.status ===
                    "PAID" && (
                    <div className="payment-success">
                      <span>✓</span>

                      <div>
                        <strong>
                          Payment completed
                        </strong>

                        <p>
                          The payment has been
                          successfully recorded.
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {!payment &&
                !isBuyer &&
                contract.order && (
                  <div className="contract-detail-notice neutral">
                    <span>i</span>
                    Payment has not been created
                    by the buyer yet.
                  </div>
                )}

            </section>

          </main>

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="contract-detail-sidebar">

            <section className="contract-action-card">

              <span>
                CONTRACT ACTIONS
              </span>

              <h2>
                Manage agreement
              </h2>

              <button
                className="contract-sidebar-chat"
                onClick={() =>
                  navigate(
                    `/contracts/${contract._id}/chat`
                  )
                }
              >
                💬 Open Contract Chat
              </button>

              {contract.status ===
                "CREATED" && (
                <button
                  className="contract-sidebar-cancel"
                  disabled={updating}
                  onClick={() =>
                    updateStatus(
                      "CANCELLED"
                    )
                  }
                >
                  {updating
                    ? "Updating..."
                    : "Cancel Contract"}
                </button>
              )}

              {contract.status ===
                "PAID" &&
                isFarmer && (
                <button
                  className="contract-sidebar-primary"
                  disabled={updating}
                  onClick={() =>
                    updateStatus(
                      "SHIPPED"
                    )
                  }
                >
                  {updating
                    ? "Updating..."
                    : "Mark as Shipped →"}
                </button>
              )}

              {contract.status ===
                "SHIPPED" &&
                isFarmer && (
                <button
                  className="contract-sidebar-primary"
                  disabled={updating}
                  onClick={() =>
                    updateStatus(
                      "DELIVERED"
                    )
                  }
                >
                  {updating
                    ? "Updating..."
                    : "Mark as Delivered →"}
                </button>
              )}

              {contract.status ===
                "DELIVERED" && (
                <button
                  className="contract-sidebar-primary"
                  disabled={updating}
                  onClick={() =>
                    updateStatus(
                      "COMPLETED"
                    )
                  }
                >
                  {updating
                    ? "Updating..."
                    : "Complete Contract →"}
                </button>
              )}

            </section>

            <section className="contract-summary-card">

              <span>
                AGREEMENT SUMMARY
              </span>

              <div className="contract-summary-row">
                <span>Crop</span>
                <strong>
                  {contract.cropName}
                </strong>
              </div>

              <div className="contract-summary-row">
                <span>Quantity</span>
                <strong>
                  {contract.quantity}
                </strong>
              </div>

              <div className="contract-summary-row">
                <span>Price</span>
                <strong>
                  ₹
                  {Number(
                    contract.price || 0
                  ).toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>

              <div className="contract-summary-row">
                <span>Delivery</span>
                <strong>
                  {formatDate(
                    contract.deliveryDate
                  )}
                </strong>
              </div>

              <div className="contract-summary-total">
                <span>
                  Order Total
                </span>

                <strong>
                  ₹
                  {Number(
                    contract.order
                      ?.totalPrice ||
                      contract.price ||
                      0
                  ).toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>

            </section>

          </aside>

        </div>

      </div>
    </div>
  );
}