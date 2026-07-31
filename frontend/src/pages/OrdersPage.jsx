import { useEffect, useRef } from "react";
import { useStore } from "../store/useStore";

export default function OrdersPage({ setPage }) {
  const { state, dispatch } = useStore();
  const timerRef = useRef({});

  // Auto-deliver orders that are PROCESSING after 8 seconds
  useEffect(() => {
    state.orders.forEach(order => {
      if (order.status === "PROCESSING" && !timerRef.current[order.orderId]) {
        timerRef.current[order.orderId] = setTimeout(() => {
          dispatch({ type: "DELIVER_ORDER", payload: order.orderId });
          dispatch({ type: "SHOW_TOAST", payload: { message: `Order ${order.orderId} has been delivered! 🎉`, type: "success" } });
          delete timerRef.current[order.orderId];
        }, 8000);
      }
    });

    return () => {
      Object.values(timerRef.current).forEach(clearTimeout);
    };
  }, [state.orders]);

  function processNext() {
    dispatch({ type: "PROCESS_ORDER" });
  }

  const statusLabel = { PENDING: "Pending", PROCESSING: "Out for delivery", DELIVERED: "Delivered" };
  const statusIcon  = { PENDING: "🕐", PROCESSING: "🚚", DELIVERED: "✅" };

  return (
    <div className="page">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Your purchases</span>
          <h2>📦 My Orders</h2>
        </div>
      </div>

      <div className="queue-info">
        {state.user?.isPremium && (
          <span className="badge-premium" style={{ fontSize: "0.82rem" }}>⭐ Your orders are processed with priority</span>
        )}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            className="btn-primary"
            disabled={!state.orders.some(o => o.status === "PENDING")}
            onClick={processNext}
          >
            ▶ Process Next Order
          </button>
          <button className="btn-sm" onClick={() => setPage("Delivery")}>
            🚚 Track Delivery Route
          </button>
        </div>
      </div>

      {state.orders.length === 0 ? (
        <p className="empty">No orders yet. <span className="link" onClick={() => setPage("Cart")}>Go to cart →</span></p>
      ) : (
        <div className="order-list">
          {state.orders.map((order, i) => (
            <div key={order.orderId} className={`order-card ${order.isPremium ? "premium" : ""}`}>
              <div className="order-header">
                <span>#{i + 1} {order.orderId}</span>
                <span className={`status ${order.status.toLowerCase()}`}>
                  {statusIcon[order.status]} {statusLabel[order.status]}
                </span>
                {order.isPremium && <span className="premium-badge">⭐ Priority</span>}
              </div>
              <p>Total: ₹{order.total.toLocaleString()}</p>
              <div className="order-items">
                {order.items.map(({ product, qty }) => (
                  <span key={product.id} className="order-item-chip">{product.name} ×{qty}</span>
                ))}
              </div>
              {order.status === "PROCESSING" && (
                <p style={{ fontSize: "0.78rem", color: "var(--mint)" }}>
                  🚚 Your order is on the way — delivery confirmation incoming shortly…
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
