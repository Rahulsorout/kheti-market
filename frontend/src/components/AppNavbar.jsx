import React, { useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AppNavbar() {
  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [profileOpen, setProfileOpen] = useState(false);

  if (!user) return null;

  const path = location.pathname;

  // Don't show navbar on auth pages
  if (path === "/login" || path === "/register") {
    return null;
  }

  const isBuyer = user.role === "BUYER";
  const isFarmer = user.role === "FARMER";
  const isAdmin = user.role === "ADMIN";

  const isDashboard =
    path === "/" ||
    path === "/buyer" ||
    path === "/farmer" ||
    path === "/admin";

  /* =====================================================
     HOME
  ===================================================== */

  function getHomePath() {
    if (isBuyer) return "/buyer";
    if (isFarmer) return "/farmer";
    if (isAdmin) return "/admin";

    return "/";
  }

  /* =====================================================
     BACK
  ===================================================== */

  function handleBack() {
    // Buyer
    if (path === "/buyer/orders") {
      navigate("/buyer");
      return;
    }

    if (path.startsWith("/product/")) {
      navigate("/buyer");
      return;
    }

    if (path.startsWith("/orders/")) {
      navigate("/buyer/orders");
      return;
    }

    // Farmer
    if (path === "/farmer/add-product") {
      navigate("/farmer");
      return;
    }

    if (path === "/farmer/my-products") {
      navigate("/farmer");
      return;
    }

    if (path === "/farmer/orders") {
      navigate("/farmer");
      return;
    }

    if (path.startsWith("/farmer/listings/")) {
      navigate("/farmer/my-products");
      return;
    }

    // Contracts
    if (
      path.startsWith("/contracts/") &&
      path.endsWith("/chat")
    ) {
      const contractId = path.split("/")[2];

      navigate(`/contracts/${contractId}`);
      return;
    }

    if (
      path.startsWith("/contracts/") &&
      path !== "/contracts"
    ) {
      navigate("/contracts");
      return;
    }

    if (path === "/contracts") {
      navigate(getHomePath());
      return;
    }

    navigate(getHomePath());
  }

  /* =====================================================
     NAVIGATION
  ===================================================== */

  function goTo(route) {
    setProfileOpen(false);
    navigate(route);
  }

  /* =====================================================
     LOGOUT
  ===================================================== */

  function handleLogout() {
    setProfileOpen(false);

    logout();

    navigate("/login", {
      replace: true,
    });
  }

  return (
    <header className="app-navbar">

      {/* =================================================
          LEFT
      ================================================= */}

      <div className="app-navbar-left">

        {!isDashboard && (
          <button
            className="app-navbar-back"
            onClick={handleBack}
          >
            <span>←</span>
            Back
          </button>
        )}

        <button
          className="app-navbar-brand"
          onClick={() => goTo(getHomePath())}
        >
          <span className="app-navbar-brand-icon">
            🌱
          </span>

          <span>KhetiMarket</span>
        </button>

      </div>


      {/* =================================================
          CENTER
      ================================================= */}

      <nav className="app-navbar-links">

        {isBuyer && (
          <>
            <button
              className={path === "/buyer" ? "active" : ""}
              onClick={() => goTo("/buyer")}
            >
              Marketplace
            </button>

            <button
              className={
                path === "/buyer/orders"
                  ? "active"
                  : ""
              }
              onClick={() =>
                goTo("/buyer/orders")
              }
            >
              My Orders
            </button>

            <button
              className={
                path === "/contracts"
                  ? "active"
                  : ""
              }
              onClick={() =>
                goTo("/contracts")
              }
            >
              My Contracts
            </button>
          </>
        )}

        {isFarmer && (
          <>
            <button
              className={
                path === "/farmer"
                  ? "active"
                  : ""
              }
              onClick={() =>
                goTo("/farmer")
              }
            >
              Dashboard
            </button>

            <button
              className={
                path === "/farmer/my-products"
                  ? "active"
                  : ""
              }
              onClick={() =>
                goTo("/farmer/my-products")
              }
            >
              My Products
            </button>

            <button
              className={
                path === "/farmer/orders"
                  ? "active"
                  : ""
              }
              onClick={() =>
                goTo("/farmer/orders")
              }
            >
              Orders
            </button>

            <button
              className={
                path === "/contracts"
                  ? "active"
                  : ""
              }
              onClick={() =>
                goTo("/contracts")
              }
            >
              Contracts
            </button>
          </>
        )}

        {isAdmin && (
          <button
            className={
              path === "/admin"
                ? "active"
                : ""
            }
            onClick={() =>
              goTo("/admin")
            }
          >
            Dashboard
          </button>
        )}

      </nav>


      {/* =================================================
          PROFILE
      ================================================= */}

      <div className="app-navbar-profile">

        <button
          className="app-profile-button"
          onClick={() =>
            setProfileOpen((prev) => !prev)
          }
        >

          <div className="app-profile-avatar">
            {user?.name
              ?.charAt(0)
              ?.toUpperCase() || "U"}
          </div>

          <div className="app-profile-info">

            <strong>
              {user?.name || "User"}
            </strong>

            <span>
              {user?.role || "USER"}
            </span>

          </div>

          <span className="app-profile-chevron">
            {profileOpen ? "⌃" : "⌄"}
          </span>

        </button>


        {profileOpen && (
          <div className="app-profile-dropdown">

            <div className="app-profile-header">

              <div className="app-profile-avatar large">
                {user?.name
                  ?.charAt(0)
                  ?.toUpperCase() || "U"}
              </div>

              <div>
                <strong>
                  {user?.name || "User"}
                </strong>

                <span>
                  {user?.email || ""}
                </span>

                <small>
                  {user?.role || "USER"}
                </small>
              </div>

            </div>


            <div className="app-profile-divider" />


            <button
              onClick={() => {
                setProfileOpen(false);
                navigate("/profile");
              }}
            >
              <span>👤</span>
              Account Details
            </button>


            <button
              className="logout"
              onClick={handleLogout}
            >
              <span>↪</span>
              Logout
            </button>

          </div>
        )}

      </div>

    </header>
  );
}