# 📚 BookSphere — eBook Store

A modern, fully frontend bookstore SPA built with **React + Vite**. No backend required — runs entirely in the browser using mock data and client-side algorithms.

---

## 🚀 Getting Started

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ✨ Features

### 🏠 Catalog
- Hero section with animated floating book card
- **Trending Now** and **New Arrivals** horizontal shelf sliders
- Search by title, author, or tag (with hash-map based index for O(1) lookups)
- Filter by genre using a **tree-structured category sidebar**
- Price range filter with instant results
- Sort by Featured, Price (Low→High / High→Low), or Highest Rated
- Recently Viewed and Wishlist sidebar panels

### 📖 Book Detail Page
- Full book info: cover image, description, publisher, ISBN, year, pages
- Star rating breakdown (Amazon-style distribution chart)
- Format selector (Paperback / Hardcover / eBook)
- Delivery date estimate
- **BFS-powered "Customers also bought"** recommendations using a graph traversal
- More by same author section
- Share to clipboard button
- Add to Cart / Wishlist actions

### 🛒 Cart & Checkout
- Quantity stepper, remove with **undo** (stack-based)
- **Knapsack algorithm** for optimal coupon/discount selection
- 3-step checkout flow: Cart → Checkout → Confirmation
- Payment methods: Credit/Debit Card, UPI (GPay, PhonePe, Paytm, BHIM), Cash on Delivery
- Delivery address form with validation
- Order summary with savings badge

### 📦 Orders
- Order history with status tracking (PENDING → PROCESSING → DELIVERED)
- Priority queue — Premium users get priority processing

### 🚚 Delivery
- **Dijkstra's shortest path algorithm** for delivery route calculation
- Visual route map between Indian cities (Mumbai, Pune, Hyderabad, Bangalore, Chennai, etc.)

### 🎯 Recommendations Page
- BFS graph traversal across the book relationship graph
- Depth-configurable recommendations

### 👤 Profile
- User info display
- Premium membership status

### ⭐ Premium
- Premium membership page with feature highlights

### Other Pages
- Wishlist, Feedback, Terms & Conditions, UX showcase page

---

## 🧠 Data Structures & Algorithms Used

| Feature | DSA |
|---|---|
| Book search | Hash Map (tag index) |
| Recommendations | BFS on adjacency graph |
| Delivery routing | Dijkstra's shortest path |
| Coupon optimization | 0/1 Knapsack (DP) |
| Cart undo | Stack |
| Order priority | Priority Queue (sort by priority) |
| Category browsing | Tree traversal |
| Price sorting | Merge sort (Array.sort) |

---

## 🗂️ Project Structure

```
frontend/
├── src/
│   ├── components/       # Navbar, Footer, ProductCard, ShelfSlider, CategoryTree, Toast
│   ├── data/             # mockData.js — books, graphs, metadata
│   ├── lib/              # supabase.js (mock client, no backend needed)
│   ├── pages/            # All page components
│   ├── store/            # useStore.jsx — global state with useReducer
│   ├── App.jsx
│   └── index.css
├── index.html
├── vite.config.js
└── package.json
```

---

## 🛠️ Tech Stack

- **React 18** — UI
- **Vite 4** — Build tool & dev server
- **useReducer + Context API** — Global state management (no Redux)
- **Vanilla CSS** — Custom styling, no UI library

---

## 📦 Build for Production

```bash
npm run build
```

Output goes to `frontend/dist/`.
