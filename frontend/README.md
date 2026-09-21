# 🌾 KhetiMarket

**KhetiMarket** is a full-stack agricultural marketplace that connects
farmers directly with buyers. Farmers can list crops and receive bids,
while buyers can discover produce, place orders, manage contracts,
payments, shipments, and communicate through the platform.

## 🚀 Features

### 👨‍🌾 Farmer

-   Create and manage crop listings
-   View and manage products
-   Receive and review buyer bids
-   Manage orders and contracts
-   Communicate with buyers

### 🛒 Buyer

-   Browse the agricultural marketplace
-   View product details
-   Place and manage orders
-   Manage contracts
-   Communicate with farmers

### 🛡️ Admin

-   Marketplace dashboard and statistics
-   User management
-   Search and filter users
-   Change roles
-   Block/unblock users
-   Activate/deactivate users
-   Verify users
-   Delete users with admin safety restrictions

## 🔐 Authentication

KhetiMarket uses JWT-based authentication with bcrypt password hashing
and role-based access control.

Supported roles:

``` text
FARMER
BUYER
ADMIN
```

Blocked or inactive users cannot access protected resources. Admin
accounts are not available through public registration.

## 🧰 Tech Stack

### Frontend

-   React
-   React Router
-   Axios
-   Vite
-   CSS

### Backend

-   Node.js
-   Express.js
-   MongoDB
-   Mongoose
-   JWT
-   bcryptjs
-   Socket.IO
-   Swagger
-   Helmet
-   CORS
-   Express Rate Limit

## 📁 Project Structure

``` text
kheti-market/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── config/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── buyer/
│   │   │   └── farmer/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

## ⚙️ Installation

### 1. Clone the repository

``` bash
git clone <your-repository-url>
cd kheti-market
```

### 2. Backend

``` bash
cd backend
npm install
```

Create `.env`:

``` env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start the backend:

``` bash
npm run dev
```

Backend:

``` text
http://localhost:5000
```

### 3. Frontend

Open another terminal:

``` bash
cd frontend
npm install
npm run dev
```

Vite will display the frontend URL in the terminal.

## 🔌 API

The backend API is versioned under:

``` text
/api/v1
```

Main API areas:

``` text
/auth
/users
/listings
/bids
/contracts
/payments
/shipments
/chat
/reviews
/admin
```

## 👤 User Flow

``` text
                 ┌──────────────┐
                 │  KhetiMarket │
                 └──────┬───────┘
                        │
              ┌─────────┴─────────┐
              │                   │
          👨‍🌾 Farmer          🛒 Buyer
              │                   │
        Create Listings      Browse Products
              │                   │
        Receive Bids         Place Orders
              │                   │
              └─────────┬─────────┘
                        │
                    Contracts
                        │
               Payments / Shipments
                        │
                       Chat
```

## 🌐 Main Routes

### Authentication

``` text
/login
/register
```

### Farmer

``` text
/farmer
/farmer/add-product
/farmer/my-products
/farmer/orders
/farmer/listings/:listingId/bids
```

### Buyer

``` text
/buyer
/buyer/orders
/product/:id
/orders/:id
```

### Contracts

``` text
/contracts
/contracts/:contractId
/contracts/:contractId/chat
```

### Admin

``` text
/admin
/admin/users
```

## 🛡️ Security

-   JWT authentication
-   bcrypt password hashing
-   Role-based authorization
-   Helmet security headers
-   CORS
-   Rate limiting
-   Protected API routes
-   Blocked/inactive user checks
-   Admin self-protection rules

## 📡 Real-Time Communication

Socket.IO is used for real-time contract-related chat.

## 🧪 Development

Backend:

``` bash
cd backend
npm run dev
```

Frontend:

``` bash
cd frontend
npm run dev
```

## 🔮 Future Improvements

-   Online payment gateway
-   Advanced shipment tracking
-   Notifications
-   Analytics dashboards
-   Crop price trends
-   Image upload and optimization
-   Advanced marketplace search
-   Recommendation system
-   Mobile application

## 🤝 Contributing

1.  Fork the repository
2.  Create a feature branch:

``` bash
git checkout -b feature/your-feature
```

3.  Commit your changes:

``` bash
git add .
git commit -m "Add your feature"
```

4.  Push the branch:

``` bash
git push origin feature/your-feature
```

5.  Open a Pull Request.

## 📄 License

This project is currently intended as a development/portfolio project.
Add an appropriate license before public distribution.

------------------------------------------------------------------------

### 🌾 KhetiMarket

**Connecting farmers and buyers through a smarter agricultural
marketplace.**
