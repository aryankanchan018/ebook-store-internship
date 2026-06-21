import { useState } from "react";
import { useStore, knapsackDiscount } from "../store/useStore";
import { supabase } from "../lib/supabase";

const BOOK_IMAGES = {
  p1:"https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=160&q=80",
  p2:"https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=160&q=80",
  p3:"https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=160&q=80",
  p4:"https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=160&q=80",
  p5:"https://images.unsplash.com/photo-1532012197267-da84d127e765?w=160&q=80",
  p6:"https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=160&q=80",
  p7:"https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=160&q=80",
  p8:"https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=160&q=80",
  p9:"https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=160&q=80",
  p10:"https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=160&q=80",
  p11:"https://images.unsplash.com/photo-1519682577862-22b62b24e493?w=160&q=80",
  p12:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=160&q=80",
};

function getDeliveryDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

function formatCardNum(v) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(v) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
}

const UPI_APPS = ["GPay", "PhonePe", "Paytm", "BHIM"];

export default function CartPage({ setPage }) {
  const { state, dispatch } = useStore();
  const [step, setStep]             = useState("cart"); // cart | checkout | success
  const [discountResult, setDiscountResult] = useState(null);
  const [payMethod, setPayMethod]   = useState("card");
  const [card, setCard]             = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [upiId, setUpiId]           = useState("");
  const [selectedUpi, setSelectedUpi] = useState("");
  const [address, setAddress]       = useState({ name: state.user?.name || "", phone: "", line1: "", city: "", pin: "" });
  const [paying, setPaying]         = useState(false);
  const [cardErr, setCardErr]       = useState("");

  const subtotal  = state.cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const discount  = discountResult?.total || 0;
  const total     = Math.max(0, subtotal - discount);
  const itemCount = state.cart.reduce((s, i) => s + i.qty, 0);

  function applyDiscount() {
    setDiscountResult(knapsackDiscount(state.coupons, subtotal));
  }

  async function confirmPayment(e) {
    e.preventDefault();
    setCardErr("");
    if (payMethod === "card") {
      if (card.number.replace(/\s/g, "").length < 16) { setCardErr("Enter a valid 16-digit card number"); return; }
      if (card.expiry.length < 5) { setCardErr("Enter valid expiry MM/YY"); return; }
      if (card.cvv.length < 3)   { setCardErr("Enter valid CVV"); return; }
      if (!card.name.trim())      { setCardErr("Enter cardholder name"); return; }
    }
    if (payMethod === "upi" && !upiId.trim() && !selectedUpi) { setCardErr("Enter UPI ID or select an app"); return; }
    if (!address.name.trim() || !address.phone.trim() || !address.line1.trim() || !address.city.trim() || !address.pin.trim()) {
      setCardErr("Please fill all delivery address fields"); return;
    }
    setPaying(true);
    await new Promise(r => setTimeout(r, 1800));
    const orderId = `ORD-${Date.now()}`;
    const rawTotal = state.cart.reduce((s, i) => s + i.product.price * i.qty, 0);
    const finalTotal = Math.max(0, rawTotal - discount);
    const priority = state.user?.isPremium ? 1 : 10;
    await supabase.from("orders").insert({
      order_id:   orderId,
      user_id:    state.user?.userId,
      items:      state.cart,
      total:      finalTotal,
      priority,
      status:     "PENDING",
      is_premium: state.user?.isPremium || false,
    });
    dispatch({ type: "PLACE_ORDER", payload: { discount } });
    dispatch({ type: "SHOW_TOAST", payload: { message: `Payment successful! Order placed 🎉`, type: "success" } });
    setDiscountResult(null);
    setPaying(false);
    setStep("success");
  }

  if (step === "success") {
    return (
      <div className="page">
        <div className="order-success-screen">
          <div className="success-icon-circle">✅</div>
          <h2>Order Placed Successfully!</h2>
          <p>Your payment was confirmed. We'll start processing your order right away.</p>
          {state.user?.isPremium && <p className="success-premium">⭐ Priority processing activated for your order.</p>}
          <p className="success-delivery">Estimated delivery: <strong>{getDeliveryDate(state.user?.isPremium ? 3 : 5)}</strong></p>
          <div className="success-actions">
            <button className="btn-primary" onClick={() => { setStep("cart"); setPage("Orders"); }}>View My Orders →</button>
            <button className="btn-outline" onClick={() => { setStep("cart"); setPage("Catalog"); }}>Continue Shopping</button>
          </div>
        </div>
      </div>
    );
  }

  if (state.cart.length === 0 && step === "cart") {
    return (
      <div className="page">
        <div className="cart-empty-state">
          <span className="cart-empty-icon">🛒</span>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything yet.</p>
          <button className="btn-primary" onClick={() => setPage("Catalog")}>Browse Books →</button>
        </div>
      </div>
    );
  }

  // ── Step indicator ──────────────────────────────────────────────
  const steps = ["Cart", "Checkout", "Confirmation"];
  const stepIdx = step === "cart" ? 0 : step === "checkout" ? 1 : 2;

  return (
    <div className="page">
      {/* Step bar */}
      <div className="checkout-steps">
        {steps.map((s, i) => (
          <div key={s} className={`checkout-step ${i <= stepIdx ? "done" : ""} ${i === stepIdx ? "active" : ""}`}>
            <div className="cs-circle">{i < stepIdx ? "✓" : i + 1}</div>
            <span>{s}</span>
            {i < steps.length - 1 && <div className={`cs-line ${i < stepIdx ? "done" : ""}`} />}
          </div>
        ))}
      </div>

      {/* ── CART STEP ───────────────────────────────────────────── */}
      {step === "cart" && (
        <div className="cart-layout">
          <div className="cart-items-col">
            {/* Undo banner */}
            {state.undoStack.length > 0 && (
              <div className="undo-banner">
                <span>"{state.undoStack[0].product.name}" removed</span>
                <button onClick={() => dispatch({ type: "UNDO_REMOVE" })}>↩ Undo</button>
              </div>
            )}

            <div className="cart-items-header">
              <h3>Shopping Cart <span className="cart-count-badge">{itemCount} {itemCount === 1 ? "item" : "items"}</span></h3>
            </div>

            {state.cart.map(({ product, qty }) => (
              <div key={product.id} className="cart-item-row">
                <div className="cart-item-thumb" onClick={() => { dispatch({ type: "SELECT_BOOK", payload: product }); setPage("BookDetail"); }}>
                  {BOOK_IMAGES[product.id]
                    ? <img src={BOOK_IMAGES[product.id]} alt={product.name} />
                    : <span>📚</span>
                  }
                </div>
                <div className="cart-item-info">
                  <h4 className="cart-item-title"
                    onClick={() => { dispatch({ type: "SELECT_BOOK", payload: product }); setPage("BookDetail"); }}>
                    {product.name}
                  </h4>
                  <p className="cart-item-author">by {product.author}</p>
                  <p className="cart-item-category">{product.category}</p>
                  <p className="cart-item-avail">✓ In Stock · Delivery by {getDeliveryDate(state.user?.isPremium ? 3 : 5)}</p>
                  <div className="cart-item-controls">
                    <div className="qty-stepper">
                      <button onClick={() => dispatch({ type: "ADD_TO_CART", payload: { product, qty: -1 } })}>−</button>
                      <span>{qty}</span>
                      <button onClick={() => dispatch({ type: "ADD_TO_CART", payload: { product } })}>+</button>
                    </div>
                    <button className="btn-danger btn-xs"
                      onClick={() => dispatch({ type: "REMOVE_FROM_CART", payload: product.id })}>
                      🗑 Remove
                    </button>
                    <button className="btn-xs"
                      onClick={() => {
                        dispatch({ type: "TOGGLE_WISHLIST", payload: product.id });
                        dispatch({ type: "SHOW_TOAST", payload: { message: "Saved to wishlist", type: "info" } });
                      }}>
                      ♡ Save for later
                    </button>
                  </div>
                </div>
                <div className="cart-item-price">
                  <strong>₹{(product.price * qty).toLocaleString()}</strong>
                  {qty > 1 && <small>₹{product.price.toLocaleString()} each</small>}
                </div>
              </div>
            ))}

            {/* Coupons */}
            <div className="coupons-info">
              <h4>🏷️ Discount Coupons</h4>
              <div className="coupon-list">
                {state.coupons.map(c => (
                  <span key={c.id} className="coupon-chip">{c.label}: ₹{c.discount} off on ₹{c.minSpend}+</span>
                ))}
              </div>
              <button className="btn-sm" style={{ marginTop: 12 }} onClick={applyDiscount}>
                💸 Apply Best Discount
              </button>
              {discountResult && (
                <div className="discount-result" style={{ marginTop: 12 }}>
                  {discountResult.total > 0 ? (
                    <>
                      <p>✓ Best saving: <strong>₹{discountResult.total}</strong> off</p>
                      <p>Applied: {discountResult.selected.map(c => <span key={c.id} className="coupon-chip">{c.label}</span>)}</p>
                    </>
                  ) : (
                    <p className="empty" style={{ padding: "8px 0" }}>No coupons applicable for this total.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="cart-summary-col">
            <div className="cart-summary-panel">
              <h3>Order Summary</h3>
              <div className="summary-rows">
                <div className="summary-row"><span>Price ({itemCount} items)</span><strong>₹{subtotal.toLocaleString()}</strong></div>
                {discount > 0 && <div className="summary-row discount-row"><span>Coupon Discount</span><strong>−₹{discount.toLocaleString()}</strong></div>}
                <div className="summary-row"><span>Delivery Charges</span><strong className="free-tag">FREE</strong></div>
                {state.user?.isPremium && <div className="summary-row"><span>Priority Shipping</span><strong className="free-tag">Included ⭐</strong></div>}
                <div className="summary-row total-row"><span>Total Amount</span><strong>₹{total.toLocaleString()}</strong></div>
              </div>
              {discount > 0 && (
                <div className="savings-badge">🎉 You save ₹{discount.toLocaleString()} on this order!</div>
              )}
              <button className="btn-primary btn-place-order" onClick={() => setStep("checkout")}>
                Proceed to Checkout →
              </button>
              <div className="summary-trust">
                <span>🔒 Secure</span>
                <span>↩ Easy Returns</span>
                <span>✓ 100% Genuine</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CHECKOUT STEP ───────────────────────────────────────── */}
      {step === "checkout" && (
        <form onSubmit={confirmPayment} className="checkout-layout">
          <div className="checkout-left">

            {/* Delivery Address */}
            <div className="checkout-section">
              <h3>📍 Delivery Address</h3>
              <div className="address-grid">
                <div className="lf-field">
                  <label>Full Name</label>
                  <div className="lf-input-wrap">
                    <span className="lf-icon">👤</span>
                    <input type="text" placeholder="Full name" value={address.name}
                      onChange={e => setAddress({ ...address, name: e.target.value })} />
                  </div>
                </div>
                <div className="lf-field">
                  <label>Phone Number</label>
                  <div className="lf-input-wrap">
                    <span className="lf-icon">📱</span>
                    <input type="tel" placeholder="10-digit mobile number" value={address.phone}
                      onChange={e => setAddress({ ...address, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} />
                  </div>
                </div>
                <div className="lf-field" style={{ gridColumn: "1 / -1" }}>
                  <label>Address Line</label>
                  <div className="lf-input-wrap">
                    <span className="lf-icon">🏠</span>
                    <input type="text" placeholder="House No., Street, Area" value={address.line1}
                      onChange={e => setAddress({ ...address, line1: e.target.value })} />
                  </div>
                </div>
                <div className="lf-field">
                  <label>City</label>
                  <div className="lf-input-wrap">
                    <span className="lf-icon">🏙️</span>
                    <input type="text" placeholder="City" value={address.city}
                      onChange={e => setAddress({ ...address, city: e.target.value })} />
                  </div>
                </div>
                <div className="lf-field">
                  <label>PIN Code</label>
                  <div className="lf-input-wrap">
                    <span className="lf-icon">📮</span>
                    <input type="text" placeholder="6-digit PIN" value={address.pin}
                      onChange={e => setAddress({ ...address, pin: e.target.value.replace(/\D/g, "").slice(0, 6) })} />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="checkout-section">
              <h3>💳 Payment Method</h3>
              <div className="pay-method-tabs">
                {[
                  { id: "card", label: "💳 Debit / Credit Card" },
                  { id: "upi",  label: "📲 UPI" },
                  { id: "cod",  label: "💵 Cash on Delivery" },
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    className={`pay-method-tab ${payMethod === m.id ? "active" : ""}`}
                    onClick={() => setPayMethod(m.id)}
                  >{m.label}</button>
                ))}
              </div>

              {payMethod === "card" && (
                <div className="pay-card-form">
                  <div className="lf-field">
                    <label>Card Number</label>
                    <div className="lf-input-wrap">
                      <span className="lf-icon">💳</span>
                      <input type="text" placeholder="1234 5678 9012 3456"
                        value={card.number} onChange={e => setCard({ ...card, number: formatCardNum(e.target.value) })}
                        inputMode="numeric" />
                    </div>
                  </div>
                  <div className="pay-card-row">
                    <div className="lf-field">
                      <label>Expiry Date</label>
                      <div className="lf-input-wrap">
                        <span className="lf-icon">📅</span>
                        <input type="text" placeholder="MM/YY"
                          value={card.expiry} onChange={e => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                          inputMode="numeric" />
                      </div>
                    </div>
                    <div className="lf-field">
                      <label>CVV</label>
                      <div className="lf-input-wrap">
                        <span className="lf-icon">🔒</span>
                        <input type="password" placeholder="•••"
                          value={card.cvv} onChange={e => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                          inputMode="numeric" />
                      </div>
                    </div>
                  </div>
                  <div className="lf-field">
                    <label>Name on Card</label>
                    <div className="lf-input-wrap">
                      <span className="lf-icon">👤</span>
                      <input type="text" placeholder="As printed on card"
                        value={card.name} onChange={e => setCard({ ...card, name: e.target.value })} />
                    </div>
                  </div>
                  <div className="card-logos">
                    <span>VISA</span><span>Mastercard</span><span>RuPay</span>
                  </div>
                </div>
              )}

              {payMethod === "upi" && (
                <div className="pay-upi-form">
                  <div className="upi-apps">
                    {UPI_APPS.map(app => (
                      <button key={app} type="button"
                        className={`upi-app-btn ${selectedUpi === app ? "active" : ""}`}
                        onClick={() => { setSelectedUpi(app); setUpiId(""); }}>
                        {app}
                      </button>
                    ))}
                  </div>
                  <p style={{ color: "var(--muted)", fontSize: "0.8rem", textAlign: "center" }}>— or enter UPI ID —</p>
                  <div className="lf-field">
                    <div className="lf-input-wrap">
                      <span className="lf-icon">📲</span>
                      <input type="text" placeholder="yourname@upi"
                        value={upiId} onChange={e => { setUpiId(e.target.value); setSelectedUpi(""); }} />
                    </div>
                  </div>
                </div>
              )}

              {payMethod === "cod" && (
                <div className="cod-info">
                  <span>💵</span>
                  <div>
                    <strong>Cash on Delivery</strong>
                    <p>Pay in cash when your order arrives. Additional ₹40 COD fee applies.</p>
                  </div>
                </div>
              )}
            </div>

            {cardErr && <div className="lf-status lf-error-msg">⚠ {cardErr}</div>}
          </div>

          {/* Right: Order Summary */}
          <div className="checkout-right">
            <div className="cart-summary-panel">
              <h3>Order Summary</h3>
              <div className="checkout-items-mini">
                {state.cart.map(({ product, qty }) => (
                  <div key={product.id} className="mini-item">
                    <div className="mini-thumb">
                      {BOOK_IMAGES[product.id]
                        ? <img src={BOOK_IMAGES[product.id]} alt={product.name} />
                        : <span>📚</span>}
                    </div>
                    <div className="mini-info">
                      <p>{product.name}</p>
                      <small>Qty: {qty}</small>
                    </div>
                    <strong>₹{(product.price * qty).toLocaleString()}</strong>
                  </div>
                ))}
              </div>
              <div className="summary-rows">
                <div className="summary-row"><span>Subtotal</span><strong>₹{subtotal.toLocaleString()}</strong></div>
                {discount > 0 && <div className="summary-row discount-row"><span>Discount</span><strong>−₹{discount.toLocaleString()}</strong></div>}
                {payMethod === "cod" && <div className="summary-row"><span>COD Fee</span><strong>₹40</strong></div>}
                <div className="summary-row"><span>Delivery</span><strong className="free-tag">FREE</strong></div>
                <div className="summary-row total-row">
                  <span>Total</span>
                  <strong>₹{(total + (payMethod === "cod" ? 40 : 0)).toLocaleString()}</strong>
                </div>
              </div>
              <p className="summary-delivery">🚚 Expected by <strong>{getDeliveryDate(state.user?.isPremium ? 3 : 5)}</strong></p>
              <button type="submit" className="btn-primary btn-place-order" disabled={paying}>
                {paying
                  ? <><span className="auth-spinner" /> Processing…</>
                  : payMethod === "cod"
                    ? "Place Order (COD) →"
                    : `Pay ₹${(total + (payMethod === "cod" ? 40 : 0)).toLocaleString()} →`
                }
              </button>
              <button type="button" className="btn-back-cart" onClick={() => setStep("cart")}>← Back to Cart</button>
              <p className="summary-note">🔒 100% Secure · Encrypted Payment</p>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
