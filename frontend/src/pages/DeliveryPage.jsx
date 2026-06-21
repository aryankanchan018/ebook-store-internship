import { useState } from "react";
import { useStore } from "../store/useStore";
import { dijkstra } from "../store/useStore";
import { DELIVERY_GRAPH } from "../data/mockData";

const CITIES = Object.keys(DELIVERY_GRAPH);

const STATUS_STEPS = [
  { key: "PENDING",    label: "Order Placed",       icon: "📋", desc: "Your order has been received and confirmed." },
  { key: "PROCESSING", label: "Out for Delivery",    icon: "🚚", desc: "Your order is on the way to you." },
  { key: "DELIVERED",  label: "Delivered",           icon: "✅", desc: "Your order has been delivered successfully." },
];

function getDeliveryDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
}

function getOrderDate(orderId) {
  const ts = orderId?.replace("ORD-", "");
  if (!ts || isNaN(ts)) return new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  return new Date(Number(ts)).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function DeliveryPage() {
  const { state } = useStore();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showRouteFor, setShowRouteFor]   = useState(null);
  const [dest, setDest]                   = useState("Bangalore");
  const [routeResult, setRouteResult]     = useState(null);

  const orders = state.orders;
  const order  = selectedOrder
    ? orders.find(o => o.orderId === selectedOrder)
    : orders[0];

  const currentStep = STATUS_STEPS.findIndex(s => s.key === order?.status);
  const deliveryDays = order?.isPremium ? 3 : 5;

  function findRoute() {
    if (!order) return;
    const result = dijkstra("Mumbai", dest);
    setRouteResult(result);
  }

  return (
    <div className="page">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Shipping & logistics</span>
          <h2>🚚 Track Your Order</h2>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="empty" style={{ maxWidth: 480, margin: "0 auto" }}>
          <p>No orders yet. Place an order to track it here.</p>
        </div>
      ) : (
        <>
          {/* Order selector */}
          {orders.length > 1 && (
            <div className="delivery-controls" style={{ flexWrap: "wrap" }}>
              <label style={{ color: "var(--soft)", gap: 8 }}>
                Select Order:
                <select
                  value={order?.orderId || ""}
                  onChange={e => { setSelectedOrder(e.target.value); setRouteResult(null); }}
                  style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid var(--line)", background: "rgba(8,12,24,0.52)", color: "white" }}
                >
                  {orders.map((o, i) => (
                    <option key={o.orderId} value={o.orderId}>
                      Order #{i + 1} — ₹{o.total.toLocaleString()} ({o.status})
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {order && (
            <div className="tracking-card">
              {/* Header */}
              <div className="tracking-header">
                <div>
                  <p className="tracking-order-id">{order.orderId}</p>
                  <p className="tracking-placed">Placed on {getOrderDate(order.orderId)}</p>
                </div>
                <div className="tracking-header-right">
                  <span className={`tracking-status-badge ${order.status.toLowerCase()}`}>
                    {order.status === "PENDING"    && "📋 Order Confirmed"}
                    {order.status === "PROCESSING" && "🚚 Out for Delivery"}
                    {order.status === "DELIVERED"  && "✅ Delivered"}
                  </span>
                  {order.isPremium && <span className="badge-premium">⭐ Priority</span>}
                </div>
              </div>

              {/* Progress stepper */}
              <div className="tracking-stepper">
                {STATUS_STEPS.map((step, i) => {
                  const done    = i <= currentStep;
                  const current = i === currentStep;
                  return (
                    <div key={step.key} className={`track-step ${done ? "done" : ""} ${current ? "current" : ""}`}>
                      <div className="track-step-left">
                        <div className="track-circle">{done ? step.icon : <span className="track-dot" />}</div>
                        {i < STATUS_STEPS.length - 1 && <div className={`track-line ${done && i < currentStep ? "done" : ""}`} />}
                      </div>
                      <div className="track-step-body">
                        <strong>{step.label}</strong>
                        {current && <p>{step.desc}</p>}
                        {step.key === "PROCESSING" && current && (
                          <p className="track-eta">Expected delivery: <strong>{getDeliveryDate(2)}</strong></p>
                        )}
                        {step.key === "PENDING" && done && (
                          <p className="track-date">{getOrderDate(order.orderId)}</p>
                        )}
                        {step.key === "DELIVERED" && done && (
                          <p className="track-date">Delivered on {getDeliveryDate(0)}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Delivery estimate banner */}
              {order.status !== "DELIVERED" && (
                <div className="tracking-eta-banner">
                  <span>📅</span>
                  <div>
                    <strong>Expected Delivery: {getDeliveryDate(order.status === "PROCESSING" ? 1 : deliveryDays)}</strong>
                    <p>{order.isPremium ? "⭐ Priority delivery — arrives faster" : "Standard delivery"}</p>
                  </div>
                </div>
              )}

              {/* Items in order */}
              <div className="tracking-items">
                <h4>📦 Items in this order</h4>
                <div className="order-items" style={{ marginTop: 8 }}>
                  {order.items.map(({ product, qty }) => (
                    <span key={product.id} className="order-item-chip">{product.name} ×{qty}</span>
                  ))}
                </div>
                <p style={{ marginTop: 10, color: "var(--muted)", fontSize: "0.82rem" }}>
                  Total paid: <strong style={{ color: "white" }}>₹{order.total.toLocaleString()}</strong>
                </p>
              </div>

              {/* Route finder */}
              <div className="tracking-route">
                <h4>🗺️ Delivery Route</h4>
                <p style={{ color: "var(--muted)", fontSize: "0.82rem", marginBottom: 12 }}>
                  Estimated route from our warehouse to your city.
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ color: "var(--soft)", fontSize: "0.84rem" }}>Warehouse: <strong>Mumbai</strong></span>
                  <span style={{ color: "var(--muted)" }}>→</span>
                  <label style={{ color: "var(--soft)", fontSize: "0.84rem", display: "flex", alignItems: "center", gap: 8 }}>
                    Your city:
                    <select value={dest} onChange={e => { setDest(e.target.value); setRouteResult(null); }}
                      style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid var(--line)", background: "rgba(8,12,24,0.52)", color: "white" }}>
                      {CITIES.filter(c => c !== "Mumbai").map(c => <option key={c}>{c}</option>)}
                    </select>
                  </label>
                  <button className="btn-sm" onClick={findRoute}>Show Route</button>
                </div>

                {routeResult && (
                  <div style={{ marginTop: 16 }}>
                    {routeResult.distance === Infinity ? (
                      <p className="error">No route found.</p>
                    ) : (
                      <>
                        <div className="path-display" style={{ marginTop: 10 }}>
                          {routeResult.path.map((city, i) => (
                            <span key={city}>
                              <span className="city-node">{city}</span>
                              {i < routeResult.path.length - 1 && <span className="path-arrow">──▶</span>}
                            </span>
                          ))}
                        </div>
                        <p className="distance-info" style={{ marginTop: 8 }}>
                          📏 {routeResult.distance} km · Est. {Math.ceil(routeResult.distance / 400)}–{Math.ceil(routeResult.distance / 300)} business days
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
