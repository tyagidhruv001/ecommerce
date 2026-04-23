# 🛒 ShoppingCart — Full Stack E-Commerce Web Application

A full-stack e-commerce web application built with **Node.js**, **Express.js**, **MongoDB**, and **EJS** templating. It supports user authentication, role-based access (buyer/seller), product CRUD, reviews with average rating calculation, a shopping cart, a wishlist, and PayU Money payment gateway integration.

---

## 📌 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Database Models](#-database-models)
- [API Routes](#-api-routes)
- [Middleware & Security](#-middleware--security)
- [Authentication & Authorization](#-authentication--authorization)
- [Payment Gateway](#-payment-gateway)
- [Input Validation](#-input-validation)
- [Session Management](#-session-management)
- [Environment Variables](#-environment-variables)
- [How to Run](#-how-to-run)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 User Authentication | Register, Login, Logout using Passport.js + bcrypt |
| 👤 Role-Based Access | `buyer` and `seller` roles — only sellers can list products |
| 📦 Product CRUD | Create, Read, Update, Delete products (sellers only) |
| ⭐ Reviews & Ratings | Users can post reviews; average rating is auto-calculated |
| 🛒 Shopping Cart | Logged-in users can add products to their cart |
| 💖 Wishlist (Like) | Toggle like/unlike on products via a REST API endpoint |
| 💳 Payment Gateway | Integrated with **PayU Money** sandbox for checkout |
| 🌱 Database Seeding | Seed script to pre-populate products for development |
| 🔒 Security | MongoDB sanitization, HTTP-only cookies, Joi validation |
| 🖥️ Server-Side Rendering | Views rendered with EJS + ejs-mate layouts |

---

## 🛠 Tech Stack

### Backend

#### 1. Node.js
- **What it is:** JavaScript runtime built on Chrome's V8 engine. Allows JavaScript to run on the server side.
- **Why used:** Non-blocking, event-driven I/O model makes it ideal for web servers. The entire backend logic runs on Node.js.

#### 2. Express.js (`express` v4)
- **What it is:** A minimal and flexible Node.js web application framework.
- **Why used:** Provides routing, middleware support, and HTTP utilities. All route definitions (`/products`, `/login`, `/cart`, etc.) are built using Express Router.
- **Key features used:**
  - `express.Router()` — to modularize routes into separate files
  - `express.urlencoded()` — to parse incoming form data
  - `express.static()` — to serve static files (CSS, images, JS) from `/public`

#### 3. MongoDB + Mongoose (`mongoose` v6)
- **What it is:** MongoDB is a NoSQL document database. Mongoose is an ODM (Object Data Modeler) that provides schema-based validation and querying on top of MongoDB.
- **Why used:** Flexible schema allows easy storage of products, users, and reviews as JSON-like documents.
- **Key features used:**
  - `mongoose.Schema` — defines the shape of documents (Product, User, Review)
  - `mongoose.model()` — creates a collection model
  - `populate()` — joins referenced documents (e.g., loading reviews inside a product)
  - `mongoose.set('strictQuery', true)` — prevents saving unknown fields
  - **Mongoose Middleware (post hook):** When a product is deleted, a `post('findOneAndDelete')` hook automatically deletes all associated reviews using `Review.deleteMany()`.

### Templating

#### 4. EJS (`ejs` v3)
- **What it is:** Embedded JavaScript Templates — a simple templating engine that lets you write HTML with embedded JavaScript (`<% %>`).
- **Why used:** Server-side rendering of dynamic HTML pages. Used for all views (home, products, cart, auth).
- **Key EJS tags used:**
  - `<% %>` — execute JavaScript (loops, conditionals)
  - `<%= %>` — output an escaped value
  - `<%- include() %>` — include partial files (navbar, footer)

#### 5. ejs-mate (`ejs-mate` v4)
- **What it is:** A layout engine for EJS. Acts like a master template system.
- **Why used:** Allows defining a `boilerplate.ejs` layout in `/views/layouts/` and reusing it across all pages. Avoids duplicating the `<head>`, navbar, and footer HTML on every page.

### Authentication & Authorization

#### 6. Passport.js (`passport` v0.6)
- **What it is:** Authentication middleware for Node.js. Supports multiple strategies (local, Google OAuth, JWT, etc.).
- **Why used:** Handles the complete login/logout session lifecycle. `passport.authenticate('local')` is used on the login route.
- **How it works:**
  1. `passport.initialize()` — starts Passport
  2. `passport.session()` — restores authentication state from the session
  3. `serializeUser` — saves user ID to session on login
  4. `deserializeUser` — fetches full user from DB using session ID on every request

#### 7. passport-local (`passport-local` v1)
- **What it is:** A Passport strategy for username/password authentication.
- **Why used:** Implements the local authentication logic using the username and password stored in MongoDB.

#### 8. passport-local-mongoose (`passport-local-mongoose` v8)
- **What it is:** A Mongoose plugin that simplifies integrating passport-local with Mongoose models.
- **Why used:** Automatically adds `username`, `salt`, and `hash` fields to the User model. Provides built-in methods like `User.register()` (create user + hash password) and `User.authenticate()` (verify credentials) without writing any hashing code manually.

### Session & Cookies

#### 9. express-session (`express-session` v1)
- **What it is:** Middleware that creates and manages sessions between HTTP requests (HTTP is stateless by default).
- **Why used:** Persists user login state across requests. The session is stored in MongoDB (not in memory) for production reliability.
- **Session config used:**
  - `name: 'bhaukaal'` — custom session cookie name (avoids exposing default `connect.sid`)
  - `secret` — used to sign the session cookie (read from `.env`)
  - `httpOnly: true` — cookie is not accessible by JavaScript (prevents XSS)
  - `expires` — session expires after **7 days**

#### 10. connect-mongo (`connect-mongo` v5)
- **What it is:** A MongoDB session store for `express-session`.
- **Why used:** By default, sessions are stored in server memory — this means sessions are lost on server restart. `connect-mongo` persists sessions to the same MongoDB database.
- **`touchAfter: 24 * 60 * 60`** — "lazy session update", only updates the session once every 24 hours unless the data changes. Reduces unnecessary DB writes.

#### 11. connect-flash (`connect-flash` v0.1)
- **What it is:** Middleware for displaying one-time flash messages (success/error notifications) stored in the session.
- **Why used:** Displays user-friendly alerts after actions like login, register, adding a product, etc.
- **How it works:** A message is stored in the session with `req.flash('success', 'message')`. It is read once by the view and then automatically removed from the session.

### Security

#### 12. express-mongo-sanitize (`express-mongo-sanitize` v2)
- **What it is:** Middleware that sanitizes user input to prevent MongoDB operator injection attacks.
- **Why used:** Attackers can submit keys like `{ "$gt": "" }` in JSON to manipulate MongoDB queries. This package strips all keys containing `$` or `.` from request bodies.

#### 13. sanitize-html (`sanitize-html` v2)
- **What it is:** A library that strips dangerous HTML tags from strings.
- **Why used:** Prevents XSS (Cross-Site Scripting) attacks where users submit malicious `<script>` tags inside product descriptions or reviews.

#### 14. Joi (`joi` v17)
- **What it is:** A powerful JavaScript validation library for objects.
- **Why used:** Server-side validation of incoming form data before saving to the database. Defined in `schema.js`.
- **Schemas defined:**
  - `productSchema` — validates `name`, `img`, `price` (min: 0), `desc`
  - `reviewSchema` — validates `rating` (0–5), `comment`
- **How it works:** The `validateProduct` and `validateReview` middleware functions call `schema.validate()` on `req.body`. If validation fails, the user is shown an error page instead of saving bad data.

### Payment

#### 15. PayU Money Payment Gateway
- **What it is:** A popular Indian payment gateway (used in sandbox/test mode here).
- **Library used:** `axios` (for making HTTP POST requests to PayU's API)
- **How it works:**
  1. User clicks "Checkout" — form data (amount, product info) is sent to `/payment_gateway/payumoney`
  2. The server generates a **SHA-512 hash** (using `jssha`) combining: `MERCHANT_KEY | txnid | amount | productinfo | firstname | email | MERCHANT_SALT`
  3. This hash is sent along with the payment data to PayU's sandbox URL
  4. PayU redirects the user to `surl` (success) or `furl` (failure) URL

#### 16. jsSHA (`jssha` v3)
- **What it is:** A library implementing SHA family hashing algorithms in JavaScript.
- **Why used:** Required by PayU to generate a tamper-proof SHA-512 hash for payment verification. Prevents man-in-the-middle manipulation of payment amounts.

#### 17. uuid (`uuid` v9)
- **What it is:** A library to generate Universally Unique Identifiers (UUIDs).
- **Why used:** Each PayU transaction requires a unique `txnid`. `uuid()` generates a random v4 UUID for every payment request.

#### 18. axios (`axios` v1)
- **What it is:** A popular promise-based HTTP client for Node.js.
- **Why used:** Replaced the deprecated and vulnerable `request` package to make the HTTP POST call to PayU's payment API. Uses `URLSearchParams` to correctly encode form data.

### Utility

#### 19. method-override (`method-override` v3)
- **What it is:** Middleware that lets HTML forms send `PATCH` and `DELETE` requests.
- **Why used:** HTML forms natively only support `GET` and `POST`. By appending `?_method=PATCH` or `?_method=DELETE` to the form action, this middleware intercepts and converts it to the correct HTTP method. Used for editing and deleting products.

#### 20. dotenv (`dotenv` v16)
- **What it is:** Loads environment variables from a `.env` file into `process.env`.
- **Why used:** Keeps sensitive credentials (DB URL, session secret, PayU keys) out of source code. Only loaded in development (`NODE_ENV !== 'production'`).

---

## 📁 Project Structure

```
final-ecommerce/
│
├── app.js                  # Entry point — Express app setup, DB connection, middleware
├── middleware.js            # Custom middleware: isLoggedIn, isSeller, isProductAuthor, validation
├── schema.js                # Joi validation schemas for Product and Review
├── seed.js                  # Database seeder — inserts sample Apple products
│
├── models/
│   ├── Product.js           # Product schema (name, img, price, desc, avgRating, reviews, author)
│   ├── Review.js            # Review schema (rating, comment, timestamps)
│   └── User.js              # User schema (email, role, cart[], wishList[]) + passport plugin
│
├── controllers/
│   └── product.js           # Controller functions for all product CRUD operations
│
├── routes/
│   ├── auth.js              # GET/POST /register, /login, GET /logout
│   ├── product.js           # Full CRUD routes for /products
│   ├── review.js            # POST /products/:productid/review
│   ├── cart.js              # GET /user/cart, POST /user/:productId/add
│   ├── payment.js           # POST /payment_gateway/payumoney, /payment/success, /payment/fail
│   └── api/
│       └── productapi.js    # POST /product/:productId/like (toggle wishlist via XHR)
│
├── views/
│   ├── home.ejs             # Landing page
│   ├── error.ejs            # Error display page
│   ├── layouts/             # ejs-mate boilerplate layout
│   ├── partials/            # Reusable navbar, flash messages
│   ├── products/            # index.ejs, show.ejs, new.ejs, edit.ejs
│   ├── auth/                # signup.ejs, login.ejs
│   └── cart/                # cart.ejs
│
├── public/
│   ├── css/                 # Custom stylesheets
│   ├── js/                  # Client-side JavaScript
│   └── images/              # Static images
│
├── .env                     # Environment variables (NOT committed to git)
├── package.json
└── README.md
```

---

## 🗄 Database Models

### Product
| Field | Type | Description |
|---|---|---|
| `name` | String | Product name (required) |
| `img` | String | Image URL (default: `/images/product.jpg`) |
| `price` | Number | Price in INR (min: 0) |
| `desc` | String | Product description |
| `avgRating` | Number | Auto-calculated average of all reviews |
| `author` | ObjectId | Reference to the `User` who created the product |
| `reviews` | [ObjectId] | Array of references to `Review` documents |

> **Mongoose Hook:** On product deletion (`findOneAndDelete`), all associated reviews are automatically deleted via `Review.deleteMany()`.

### User
| Field | Type | Description |
|---|---|---|
| `username` | String | Added by passport-local-mongoose plugin |
| `email` | String | User email (required) |
| `role` | String | `'buyer'` (default) or `'seller'` |
| `cart` | [ObjectId] | References to `Product` documents in cart |
| `wishList` | [ObjectId] | References to liked/wishlisted `Product` documents |

### Review
| Field | Type | Description |
|---|---|---|
| `rating` | Number | Rating 0–5 |
| `comment` | String | Review text |
| `createdAt` | Date | Auto-added by `timestamps: true` |
| `updatedAt` | Date | Auto-added by `timestamps: true` |

---

## 🛣 API Routes

### Auth Routes (`/`)
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/register` | Public | Show registration form |
| POST | `/register` | Public | Create new user account |
| GET | `/login` | Public | Show login form |
| POST | `/login` | Public | Authenticate user via Passport |
| GET | `/logout` | Logged In | Destroy session and logout |

### Product Routes (`/products`)
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/products` | Public | Show all products |
| GET | `/products/new` | Seller only | Show new product form |
| POST | `/products` | Seller only | Create a new product |
| GET | `/products/:id` | Logged In | Show a single product with reviews |
| GET | `/products/:id/edit` | Author only | Show edit form |
| PATCH | `/products/:id` | Author only | Update product |
| DELETE | `/products/:id` | Author only | Delete product (+ its reviews) |

### Review Routes
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/products/:productid/review` | Public | Add a review; auto-updates `avgRating` |

### Cart Routes
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/user/cart` | Logged In | View cart with total price |
| POST | `/user/:productId/add` | Logged In | Add a product to cart |

### Wishlist API (XHR)
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/product/:productId/like` | Logged In | Toggle like/unlike (AJAX endpoint) |

### Payment Routes
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/payment_gateway/payumoney` | Logged In | Initiate PayU Money payment |
| POST | `/payment/success` | Public | Handle payment success callback |
| POST | `/payment/fail` | Public | Handle payment failure callback |

---

## 🔒 Middleware & Security

All custom middleware is in `middleware.js`:

| Middleware | Purpose |
|---|---|
| `isLoggedIn` | Blocks unauthenticated requests. For XHR calls, returns `401 JSON`. For normal requests, redirects to `/login`. |
| `isSeller` | Checks `req.user.role === 'seller'`. Only sellers can create products. |
| `isProductAuthor` | Fetches the product from DB and compares `product.author` to `req.user._id`. Only the creator can edit/delete. |
| `validateProduct` | Runs Joi schema validation on `req.body`. Rejects invalid product data before it hits the controller. |
| `validateReview` | Runs Joi schema validation on review body. Enforces rating range and required comment. |

---

## 🔑 Authentication & Authorization

- **Password Hashing:** Handled automatically by `passport-local-mongoose`. Passwords are **never stored in plain text** — they are stored as a `salt` + `hash` pair using PBKDF2 algorithm.
- **Session Persistence:** Sessions are stored in MongoDB using `connect-mongo`, so login state survives server restarts.
- **Flash Messages:** One-time session messages (`req.flash`) provide user feedback on login, register, and CRUD actions.
- **Role System:**
  - Default role: `buyer` (can shop, review, add to cart)
  - `seller` role: can additionally create, edit, and delete their own products

---

## 💳 Payment Gateway

PayU Money (sandbox) integration flow:

```
User clicks Checkout
      ↓
Server generates unique txnid (UUID v4)
      ↓
Server computes SHA-512 hash:
  KEY|txnid|amount|productinfo|firstname|email||||||||||SALT
      ↓
Server POSTs form data (URLEncoded) to PayU sandbox
      ↓
PayU redirects user to surl (success) or furl (failure)
```

---

## ✅ Input Validation

Defined in `schema.js` using **Joi**:

```js
// Product Schema
{ name: string (required), img: string (required), price: number (min 0, required), desc: string (required) }

// Review Schema
{ rating: number (0-5), comment: string (required) }
```

Validation runs in middleware **before** the request reaches the controller, ensuring no invalid data reaches MongoDB.

---

## 🌍 Environment Variables

Create a `.env` file in the project root with:

```env
dbURL=mongodb://127.0.0.1:27017/shopping-dhruv-app-2
SECRET=your_session_secret_key
MERCHANT_KEY=your_payu_merchant_key
MERCHANT_SALT=your_payu_merchant_salt
```

| Variable | Description |
|---|---|
| `dbURL` | MongoDB connection string (local or Atlas) |
| `SECRET` | Secret key used to sign session cookies |
| `MERCHANT_KEY` | PayU Money merchant key |
| `MERCHANT_SALT` | PayU Money salt for hash generation |

---

## 🚀 How to Run

### Prerequisites
- Node.js v16+
- MongoDB running locally on port `27017` (or a MongoDB Atlas URI)

### Steps

```bash
# 1. Navigate to the project folder
cd final-ecommerce

# 2. Install dependencies
npm install

# 3. Create the .env file (see above)

# 4. Start the server
npm start
```

The app will be available at: **http://localhost:5000**

> **Note:** `seedDB()` is called on startup and inserts sample products (iPhone 14 Pro, MacBook M2 Pro, iWatch, iPad Pro, AirPods). To avoid duplicate seeding, comment out `seedDB()` in `app.js` after the first run.

---

## 🧰 All Dependencies Summary

| Package | Version | Purpose |
|---|---|---|
| `express` | ^4.18.2 | Web framework and routing |
| `mongoose` | ^6.9.2 | MongoDB ODM (schema, querying) |
| `ejs` | ^3.1.8 | Server-side HTML templating |
| `ejs-mate` | ^4.0.0 | Layout system for EJS templates |
| `passport` | ^0.6.0 | Authentication middleware |
| `passport-local` | ^1.0.0 | Username/password auth strategy |
| `passport-local-mongoose` | ^8.0.0 | Mongoose plugin for Passport (auto hash) |
| `express-session` | ^1.17.3 | Session management |
| `connect-mongo` | ^5.0.0 | MongoDB session store |
| `connect-flash` | ^0.1.1 | One-time flash notification messages |
| `method-override` | ^3.0.0 | PATCH/DELETE support in HTML forms |
| `dotenv` | ^16.3.1 | Load `.env` into `process.env` |
| `joi` | ^17.8.4 | Input validation schemas |
| `jssha` | ^3.3.0 | SHA-512 hashing for PayU payment |
| `uuid` | ^9.0.0 | Unique transaction IDs for PayU |
| `axios` | ^1.x | HTTP client for PayU API calls |
| `express-mongo-sanitize` | ^2.2.0 | Prevent MongoDB injection attacks |
| `sanitize-html` | ^2.11.0 | Strip XSS HTML from user input |
| `nodemon` | ^3.1.14 | Auto-restart server on file changes (dev) |

---

*Built by Dhruv Tyagi — Full Stack Web Development, SEM 4*
