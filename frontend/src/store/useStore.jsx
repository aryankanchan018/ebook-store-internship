import { createContext, useContext, useReducer, useEffect } from "react";
import { DELIVERY_GRAPH, RECOMMENDATION_GRAPH, MOCK_BOOKS } from "../data/mockData";

function buildSearchIndex(products) {
  const map = {};
  for (const p of products) {
    for (const tag of p.tags) {
      if (!map[tag]) map[tag] = [];
      map[tag].push(p);
    }
  }
  return map;
}

function buildPriceMap(products) {
  return [...products].sort((a, b) => a.price - b.price);
}

export function dijkstra(src, dest) {
  const dist = {};
  const prev = {};
  const visited = new Set();
  const queue = [[0, src]];
  for (const city of Object.keys(DELIVERY_GRAPH)) dist[city] = Infinity;
  dist[src] = 0;

  while (queue.length) {
    queue.sort((a, b) => a[0] - b[0]);
    const [d, u] = queue.shift();
    if (visited.has(u)) continue;
    visited.add(u);
    for (const { to, dist: w } of DELIVERY_GRAPH[u] || []) {
      if (d + w < dist[to]) {
        dist[to] = d + w;
        prev[to] = u;
        queue.push([dist[to], to]);
      }
    }
  }

  const path = [];
  let cur = dest;
  while (cur) { path.unshift(cur); cur = prev[cur]; }
  return { path, distance: dist[dest] };
}

export function bfsRecommend(productId, catalog, depth = 2) {
  const visited = new Set([productId]);
  let frontier = [productId];
  for (let i = 0; i < depth; i++) {
    const next = [];
    for (const id of frontier) {
      for (const nb of RECOMMENDATION_GRAPH[id] || []) {
        if (!visited.has(nb)) { visited.add(nb); next.push(nb); }
      }
    }
    frontier = next;
  }
  visited.delete(productId);
  return [...visited].map(id => catalog.find(p => p.id === id)).filter(Boolean);
}

export function knapsackDiscount(coupons, capacity) {
  const cap = Math.floor(capacity);
  const n = coupons.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(cap + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    const { minSpend, discount } = coupons[i - 1];
    for (let w = 0; w <= cap; w++) {
      dp[i][w] = dp[i - 1][w];
      if (minSpend <= w) dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - minSpend] + discount);
    }
  }
  const selected = [];
  let w = cap;
  for (let i = n; i > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selected.push(coupons[i - 1]);
      w -= Math.floor(coupons[i - 1].minSpend);
    }
  }
  return { total: dp[n][cap], selected };
}

const MAX_RECENT = 5;

const initial = {
  user: { userId: "guest", email: "guest@booksphere.local", name: "Guest", isPremium: false },
  catalog: MOCK_BOOKS,
  searchIndex: buildSearchIndex(MOCK_BOOKS),
  priceSorted: buildPriceMap(MOCK_BOOKS),
  cart: [],
  undoStack: [],
  wishlist: new Set(),
  recentProducts: [],
  orders: [],
  searchResults: null,
  priceFilter: { min: 0, max: 99999 },
  coupons: [],
  loading: false,
  toast: null,
  selectedBook: null,
  sortBy: "default",
};

function reducer(state, action) {
  switch (action.type) {

    case "SET_USER":
      return { ...state, user: action.payload, error: null, loading: false };

    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "SET_CATALOG": {
      const products = action.payload;
      return { ...state, catalog: products, searchIndex: buildSearchIndex(products), priceSorted: buildPriceMap(products), loading: false };
    }

    case "SET_COUPONS":
      return { ...state, coupons: action.payload };

    case "SET_ORDERS":
      return { ...state, orders: action.payload };

    case "SET_WISHLIST":
      return { ...state, wishlist: new Set(action.payload) };

    case "SET_CART":
      return { ...state, cart: action.payload };

    case "SET_RECENT":
      return { ...state, recentProducts: action.payload };

    case "LOGOUT":
      return { ...initial };

    case "VIEW_PRODUCT": {
      const product = action.payload;
      const filtered = state.recentProducts.filter(p => p.id !== product.id);
      const recent = [product, ...filtered].slice(0, MAX_RECENT);
      return { ...state, recentProducts: recent };
    }

    case "SEARCH": {
      const kw = action.payload.toLowerCase();
      const exact = state.searchIndex[kw] || [];
      const seen = new Set(exact.map(p => p.id));
      const partial = exact.length ? [] : state.catalog.filter(p =>
        !seen.has(p.id) && (
          p.name.toLowerCase().includes(kw) ||
          p.author.toLowerCase().includes(kw) ||
          p.tags.some(t => t.toLowerCase().includes(kw))
        )
      );
      const results = [...exact, ...partial];
      return { ...state, searchResults: { keyword: kw, results } };
    }

    case "CLEAR_SEARCH":
      return { ...state, searchResults: null };

    case "SET_PRICE_FILTER":
      return { ...state, priceFilter: action.payload };

    case "ADD_TO_CART": {
      const { product, qty = 1 } = action.payload;
      const existing = state.cart.find(i => i.product.id === product.id);
      let cart;
      if (existing) {
        const newQty = existing.qty + qty;
        cart = newQty <= 0
          ? state.cart.filter(i => i.product.id !== product.id)
          : state.cart.map(i => i.product.id === product.id ? { ...i, qty: newQty } : i);
      } else {
        cart = qty > 0 ? [...state.cart, { product, qty }] : state.cart;
      }
      return { ...state, cart };
    }

    case "REMOVE_FROM_CART": {
      const item = state.cart.find(i => i.product.id === action.payload);
      if (!item) return state;
      return {
        ...state,
        cart: state.cart.filter(i => i.product.id !== action.payload),
        undoStack: [item, ...state.undoStack],
      };
    }

    case "UNDO_REMOVE": {
      if (!state.undoStack.length) return state;
      const [top, ...rest] = state.undoStack;
      const existing = state.cart.find(i => i.product.id === top.product.id);
      const cart = existing
        ? state.cart.map(i => i.product.id === top.product.id ? { ...i, qty: i.qty + top.qty } : i)
        : [...state.cart, top];
      return { ...state, cart, undoStack: rest };
    }

    case "TOGGLE_WISHLIST": {
      const ws = new Set(state.wishlist);
      ws.has(action.payload) ? ws.delete(action.payload) : ws.add(action.payload);
      return { ...state, wishlist: ws };
    }

    case "PLACE_ORDER": {
      const rawTotal = state.cart.reduce((s, i) => s + i.product.price * i.qty, 0);
      const discount = action.payload?.discount || 0;
      const total = Math.max(0, rawTotal - discount);
      const priority = state.user?.isPremium ? 1 : 10;
      const order = {
        orderId: `ORD-${Date.now()}`,
        userId: state.user?.userId,
        items: [...state.cart],
        total,
        priority,
        status: "PENDING",
        isPremium: state.user?.isPremium,
      };
      const orders = [...state.orders, order].sort((a, b) => a.priority - b.priority);
      return { ...state, orders, cart: [], undoStack: [] };
    }

    case "PROCESS_ORDER": {
      if (!state.orders.length) return state;
      const pending = state.orders.find(o => o.status === "PENDING");
      if (!pending) return state;
      return { ...state, orders: state.orders.map(o => o.orderId === pending.orderId ? { ...o, status: "PROCESSING" } : o) };
    }

    case "DELIVER_ORDER":
      return { ...state, orders: state.orders.map(o => o.orderId === action.payload ? { ...o, status: "DELIVERED" } : o) };

    case "SET_SORT":
      return { ...state, sortBy: action.payload };

    case "SHOW_TOAST":
      return { ...state, toast: { message: action.payload.message, type: action.payload.type || "success" } };

    case "HIDE_TOAST":
      return { ...state, toast: null };

    case "SELECT_BOOK":
      return { ...state, selectedBook: action.payload };

    default:
      return state;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);
  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
