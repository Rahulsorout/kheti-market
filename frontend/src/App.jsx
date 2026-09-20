import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";

import Login from "./pages/LoginPage";
import Register from "./pages/Register";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import AddProduct from "./pages/farmer/AddProduct";
import MyProducts from "./pages/farmer/MyProducts";

import Marketplace from "./pages/Marketplace";
import ProductDetails from "./pages/ProductDetails";

import Orders from "./pages/farmer/Orders";
import BuyerOrders from "./pages/buyer/BuyerOrders";
import OrderDetails from "./pages/OrderDetails";

import ContractChat from "./pages/ContractChat";
import Contracts from "./pages/Contracts";
import ContractDetails from "./pages/ContractDetails";
import FarmerBids from "./pages/FarmerBids";

import AppNavbar from "./components/AppNavbar";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";


/* =========================================================
   AUTHENTICATION / BROWSER HISTORY GUARD
========================================================= */

function NavigationGuard() {
  const { user, token } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    /*
      If the user is already logged in,
      don't allow browser Back to take them
      to Login/Register.
    */
    if (
      token &&
      user &&
      (
        location.pathname === "/login" ||
        location.pathname === "/register"
      )
    ) {
      let homePath = "/";

      if (user.role === "BUYER") {
        homePath = "/buyer";
      } else if (user.role === "FARMER") {
        homePath = "/farmer";
      } else if (user.role === "ADMIN") {
        homePath = "/admin";
      }

      navigate(homePath, {
        replace: true,
      });

      return;
    }

    /*
      If the user is logged out and somehow
      reaches a protected page, send them to login.
    */
    if (
      !token &&
      location.pathname !== "/login" &&
      location.pathname !== "/register" &&
      location.pathname !== "/unauthorized"
    ) {
      navigate("/login", {
        replace: true,
      });
    }
  }, [
    token,
    user,
    location.pathname,
    navigate,
  ]);

  return null;
}


/* =========================================================
   ROOT DASHBOARD
========================================================= */

function Dashboard() {
  return (
    <div className="root-dashboard">
      <div className="page-container">
        <div className="page-card">

          <h2>
            Dashboard
          </h2>

          <p>
            Welcome to KhetiMarket.
          </p>

        </div>
      </div>
    </div>
  );
}


/* =========================================================
   UNAUTHORIZED
========================================================= */

function Unauthorized() {
  return (
    <div className="root-dashboard">
      <div className="page-container">
        <div className="page-card">

          <h2>
            Unauthorized
          </h2>

          <p>
            You do not have permission to access this page.
          </p>

        </div>
      </div>
    </div>
  );
}


/* =========================================================
   APP
========================================================= */

function App() {
  return (
    <BrowserRouter>

      {/* =================================================
          NAVIGATION GUARD
      ================================================= */}

      <NavigationGuard />

      {/* =================================================
          GLOBAL NAVBAR
      ================================================= */}

      <AppNavbar />

      <Routes>

        {/* =================================================
            PUBLIC
        ================================================= */}

        <Route
          path="/login"
          element={
            <Login />
          }
        />

        <Route
          path="/register"
          element={
            <Register />
          }
        />


        {/* =================================================
            ROOT
        ================================================= */}

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            FARMER
        ================================================= */}

        <Route
          path="/farmer"
          element={
            <RoleRoute
              allowedRoles={["FARMER"]}
            >
              <FarmerDashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/farmer/add-product"
          element={
            <RoleRoute
              allowedRoles={["FARMER"]}
            >
              <AddProduct />
            </RoleRoute>
          }
        />

        <Route
          path="/farmer/my-products"
          element={
            <RoleRoute
              allowedRoles={["FARMER"]}
            >
              <MyProducts />
            </RoleRoute>
          }
        />

        <Route
          path="/farmer/orders"
          element={
            <RoleRoute
              allowedRoles={["FARMER"]}
            >
              <Orders />
            </RoleRoute>
          }
        />

        <Route
          path="/farmer/listings/:listingId/bids"
          element={
            <ProtectedRoute>
              <RoleRoute
                allowedRoles={["FARMER"]}
              >
                <FarmerBids />
              </RoleRoute>
            </ProtectedRoute>
          }
        />


        {/* =================================================
            BUYER
        ================================================= */}

        <Route
          path="/buyer"
          element={
            <RoleRoute
              allowedRoles={["BUYER"]}
            >
              <Marketplace />
            </RoleRoute>
          }
        />

        <Route
          path="/buyer/orders"
          element={
            <RoleRoute
              allowedRoles={["BUYER"]}
            >
              <BuyerOrders />
            </RoleRoute>
          }
        />


        {/* =================================================
            PRODUCTS
        ================================================= */}

        <Route
          path="/product/:id"
          element={
            <ProtectedRoute>
              <ProductDetails />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            ORDERS
        ================================================= */}

        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetails />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            CONTRACTS
        ================================================= */}

        <Route
          path="/contracts"
          element={
            <ProtectedRoute>
              <Contracts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/contracts/:contractId"
          element={
            <ProtectedRoute>
              <ContractDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/contracts/:contractId/chat"
          element={
            <ProtectedRoute>
              <ContractChat />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            ADMIN
        ================================================= */}

        <Route
          path="/admin"
          element={
            <RoleRoute
              allowedRoles={["ADMIN"]}
            >
              <AdminDashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <RoleRoute
              allowedRoles={["ADMIN"]}
            >
              <AdminUsers />
            </RoleRoute>
          }
        />


        {/* =================================================
            UNAUTHORIZED
        ================================================= */}

        <Route
          path="/unauthorized"
          element={
            <Unauthorized />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;