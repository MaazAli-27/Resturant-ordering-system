# 🍽️ Savoria — Full-Stack Restaurant Ordering System

A complete full-stack restaurant ordering platform with real-time order tracking, online payments, table reservations, and a full-featured admin dashboard.

---

## 🌐 Live Demo

| App | Link |
|-----|------|
| 🍽️ **Customer App** | [resturant-ordering-system-ekqi.vercel.app](https://resturant-ordering-system-ekqi.vercel.app) |
| ⚙️ **Admin Panel** | [savoria-admin.vercel.app](https://savoria-admin.vercel.app) |
| 🚀 **Backend API** | [resturant-ordering-system-5ywj.vercel.app](https://resturant-ordering-system-5ywj.vercel.app) |

### 🔐 Demo Admin Login
```
Email:    admin@savoria.com
Password: admin123
```

### 🧪 Test Payment Card (Stripe Sandbox)
```
Card Number: 4242 4242 4242 4242
Expiry:      Any future date (e.g. 12/29)
CVC:         Any 3 digits (e.g. 123)
```

---

## 📸 Overview

Savoria is a complete restaurant ordering ecosystem built across three apps that share one backend:

1. **Customer App** — browse menu, order food, track orders live, reserve tables
2. **Admin Panel** — manage orders, menu, promo codes, and reservations
3. **Backend API** — Node.js/Express server powering both apps with MongoDB

---

## ✨ Features

### 👥 Customer App
- 🍽️ Browse 200+ menu items across 11 categories (Starters, Burgers, Pizza, BBQ, Desi, Desserts, Drinks, etc.)
- 🔍 Debounced live search + category filters
- 📄 Pagination ("Load More") for fast menu loading
- 🛒 Persistent cart (survives page refresh via localStorage)
- 🔐 User authentication (Login / Sign Up) with JWT
- 💳 Secure checkout with **Stripe** payment integration
- 🎟️ Promo codes & discounts at checkout
- 📡 **Real-time animated order tracking** with Socket.io (3D step animations, live status updates)
- ⭐ Reviews & star ratings on menu items
- ❤️ Favourite items (save for later)
- 🪑 Table reservation system with time-slot picker
- 📦 Order history with **one-click reorder**
- 🧾 Downloadable **PDF invoice** for every order
- 📧 Automated email notifications (order placed, status updates, reservation confirmed)
- 🌙 Dark / Light mode toggle (persisted)
- 🍞 Toast notifications (replacing browser alerts)
- 📱 Fully responsive with animated mobile hamburger menu
- 🚫 Custom animated 404 page
- ⏳ Skeleton loading screens

### 🛠️ Admin Panel
- 📊 Analytics dashboard — revenue, order status breakdown, category distribution, recent orders
- 📦 Order management — filter by status, view details, update status, delete
- 🍽️ Menu management — add / edit / delete items, toggle availability, mark popular
- 🎟️ Promo code manager — create & delete percentage/fixed discount codes with usage limits
- 🪑 Reservation manager — view bookings, assign tables, confirm/cancel
- 🔐 Role-based admin authentication (admin / superadmin)
- 🌗 Dark-themed responsive dashboard UI

### ⚙️ Backend
- 🚀 RESTful API built with Express.js
- 🗄️ MongoDB Atlas with Mongoose ODM
- 🔐 JWT authentication with bcrypt password hashing
- 📡 Real-time updates via Socket.io (order status broadcast to customer + admin rooms)
- 📧 Email service via Nodemailer (Gmail)
- 🧾 PDF invoice generation with PDFKit
- 🛡️ Security: Helmet, rate limiting (per-route), CORS allow-list with Vercel preview pattern matching, NoSQL injection sanitization
- 🗜️ Response compression
- 💳 Stripe Checkout session + webhook handling

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, React Router v6, Axios, Socket.io-client |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas, Mongoose |
| **Auth** | JWT, bcryptjs |
| **Payments** | Stripe Checkout |
| **Real-time** | Socket.io |
| **Email** | Nodemailer (Gmail SMTP) |
| **PDF Generation** | PDFKit |
| **Security** | Helmet, express-rate-limit, express-mongo-sanitize, compression |
| **Styling** | Pure CSS3 with CSS custom properties (theme variables) |
| **Hosting** | Vercel (frontend ×2, backend), MongoDB Atlas (database) |

---

## 📁 Project Structure

```
restaurant-app/
├── server/                     # Backend API
│   ├── controllers/            # Route handlers (auth, menu, orders, payment, promo, reservation, review)
│   ├── middleware/              # JWT auth & role guard middleware
│   ├── models/                  # Mongoose schemas (User, MenuItem, Order, Favourite, Extra)
│   ├── routes/                  # Express routers
│   ├── utils/                   # Email service & PDF invoice generator
│   ├── index.js                 # App entry point (Express + Socket.io server)
│   └── vercel.json               # Vercel serverless config
│
├── client/                      # Customer-facing React app
│   └── src/
│       ├── components/          # Navbar, MenuCard, Skeleton loaders
│       ├── context/             # Cart, Auth, Theme, Toast providers
│       ├── pages/                # Menu, Cart, Checkout, Auth, OrderHistory,
│       │                          # OrderConfirmation (3D tracking), Reservation, NotFound
│       ├── services/             # API service layer (axios)
│       └── config.js              # Central API/Socket URL config
│
└── admin/                       # Admin dashboard React app
    └── src/
        ├── components/           # Sidebar navigation
        ├── pages/                 # Dashboard, Orders, Menu, Promos, Reservations, Login
        ├── services/              # Admin API service layer
        └── config.js               # Central API URL config
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier)
- Stripe account (test mode)
- Gmail account with App Password (for email notifications)

### 1. Clone the repository
```bash
git clone https://github.com/MaazAli-27/Resturant-ordering-system.git
cd Resturant-ordering-system
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5000
NODE_ENV=development

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d

STRIPE_SECRET_KEY=sk_test_your_stripe_key

EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16_digit_app_password

CLIENT_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
```

```bash
npm run dev
```

### 3. Customer App Setup
```bash
cd client
npm install
```

Create `client/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

```bash
npm start
```

### 4. Admin Panel Setup
```bash
cd admin
npm install
```

Create `admin/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

```bash
npm start
```

### 5. Seed Initial Data
```bash
# Seed menu items
curl -X POST http://localhost:5000/api/menu/seed/demo

# Create the first admin account
curl -X POST http://localhost:5000/api/auth/seed-admin

# Seed demo promo codes
curl -X POST http://localhost:5000/api/promo/seed
```

---

## 🔌 Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/menu` | Get all menu items (supports `?category=`) |
| `POST` | `/api/menu` | Create menu item *(admin)* |
| `PUT` | `/api/menu/:id` | Update menu item *(admin)* |
| `DELETE` | `/api/menu/:id` | Delete menu item *(admin)* |
| `POST` | `/api/orders` | Place an order |
| `GET` | `/api/orders/:id` | Get order details |
| `GET` | `/api/orders/:id/invoice` | Download PDF invoice |
| `PATCH` | `/api/orders/:id/status` | Update order status *(admin)* |
| `GET` | `/api/orders/my-orders` | Get logged-in user's order history |
| `POST` | `/api/auth/register` | Register new customer |
| `POST` | `/api/auth/login` | Login (customer/admin) |
| `GET` | `/api/auth/me` | Get current user profile |
| `POST` | `/api/payment/create-checkout-session` | Create Stripe checkout session |
| `POST` | `/api/promo/validate` | Validate a promo code |
| `POST` | `/api/promo` | Create promo code *(admin)* |
| `POST` | `/api/reservations` | Book a table |
| `GET` | `/api/reservations` | Get all reservations *(admin)* |
| `PATCH` | `/api/reservations/:id/status` | Confirm/cancel reservation *(admin)* |
| `GET` | `/api/favourites` | Get user's favourite items |
| `POST` | `/api/favourites/:menuItemId` | Toggle favourite |
| `GET/POST` | `/api/reviews/:menuItemId` | Get/add reviews for an item |

---

## 🎟️ Demo Promo Codes

| Code | Discount | Minimum Order |
|------|----------|---------------|
| `WELCOME` | 15% off | No minimum |
| `SAVE10` | 10% off | $20 |
| `SAVE20` | 20% off | $50 |
| `FLAT5` | $5 off | $15 |
| `BIGSAVE` | $10 off | $40 |

---

## 🔒 Security Measures

- Helmet.js for secure HTTP headers
- Rate limiting (general API, auth, orders, promo validation each have their own limits)
- CORS allow-list with regex pattern matching for Vercel preview URLs
- NoSQL injection protection (`express-mongo-sanitize`)
- Passwords hashed with bcrypt
- JWT-based stateless authentication
- Stripe webhook signature verification
- Environment variables for all secrets (never committed to git)

---

## 🌍 Deployment

This project is deployed across **3 separate Vercel projects**, all connected to the same MongoDB Atlas cluster:

| Component | Platform | Root Directory |
|-----------|----------|-----------------|
| Backend API | Vercel | `server` |
| Customer App | Vercel | `client` |
| Admin Panel | Vercel | `admin` |
| Database | MongoDB Atlas | — |

Environment variables are configured separately on each Vercel project's dashboard.

---

## 👨‍💻 Developer

**Maaz Ali**
Computer Science Student, NED University of Engineering & Technology
- GitHub: [@MaazAli-27](https://github.com/MaazAli-27)

---

## 📄 License

This project was built for educational and portfolio purposes.

---

⭐ If you found this project useful or inspiring, consider giving it a star on GitHub!
