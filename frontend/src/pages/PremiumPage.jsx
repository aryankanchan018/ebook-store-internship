import { useState } from "react";
import { useStore } from "../store/useStore";
import { supabase } from "../lib/supabase";

const BENEFITS = [
  { icon: "🏆", title: "Priority Order Processing", desc: "Your orders are always processed before standard orders — you get served first." },
  { icon: "⚡", title: "Faster Delivery Queue", desc: "Premium orders jump to the front of the queue every time, no matter how many orders are waiting." },
  { icon: "⭐", title: "Premium Badge", desc: "Your profile shows a Premium badge across the app — on your profile, orders, and navbar." },
  { icon: "🎁", title: "Exclusive Discounts", desc: "Access to higher-value discount coupons and special offers available only to Premium members." },
];

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    features: [
      "Browse full book catalog",
      "Instant tag & author search",
      "Add to cart & wishlist",
      "Undo remove from cart",
      "Standard order processing",
      "Delivery tracking",
      "Book recommendations",
      "Discount coupon engine",
    ],
    cta: "Current Plan",
    disabled: true,
  },
  {
    name: "Premium",
    price: "₹199",
    period: "per month",
    features: [
      "Everything in Free",
      "Priority order processing",
      "Orders always processed first",
      "⭐ Premium badge on profile",
      "First in queue — always",
      "Exclusive discount coupons",
    ],
    cta: "Upgrade to Premium",
    disabled: false,
  },
];

function PaymentModal({ onClose, onSuccess }) {
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [processing, setProcessing] = useState(false);
  const [err, setErr] = useState("");

  function formatCard(v) {
    return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  }
  function formatExpiry(v) {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
  }

  async function pay(e) {
    e.preventDefault();
    const num = card.number.replace(/\s/g, "");
    if (num.length < 16) { setErr("Enter a valid 16-digit card number"); return; }
    if (card.expiry.length < 5) { setErr("Enter a valid expiry date"); return; }
    if (card.cvv.length < 3) { setErr("Enter a valid CVV"); return; }
    if (!card.name.trim()) { setErr("Enter cardholder name"); return; }
    setErr("");
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1800));
    setProcessing(false);
    onSuccess();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box payment-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>💳 Secure Payment</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="payment-summary">
          <span>BookSphere Premium</span>
          <strong>₹199 / month</strong>
        </div>

        <form onSubmit={pay} className="payment-form">
          <div className="lf-field">
            <label>Card Number</label>
            <div className="lf-input-wrap">
              <span className="lf-icon">💳</span>
              <input
                type="text" placeholder="1234 5678 9012 3456"
                value={card.number}
                onChange={e => setCard({ ...card, number: formatCard(e.target.value) })}
                inputMode="numeric"
              />
            </div>
          </div>

          <div className="payment-row">
            <div className="lf-field">
              <label>Expiry</label>
              <div className="lf-input-wrap">
                <span className="lf-icon">📅</span>
                <input
                  type="text" placeholder="MM/YY"
                  value={card.expiry}
                  onChange={e => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                  inputMode="numeric"
                />
              </div>
            </div>
            <div className="lf-field">
              <label>CVV</label>
              <div className="lf-input-wrap">
                <span className="lf-icon">🔒</span>
                <input
                  type="password" placeholder="•••"
                  value={card.cvv}
                  onChange={e => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                  inputMode="numeric"
                />
              </div>
            </div>
          </div>

          <div className="lf-field">
            <label>Cardholder Name</label>
            <div className="lf-input-wrap">
              <span className="lf-icon">👤</span>
              <input
                type="text" placeholder="Name on card"
                value={card.name}
                onChange={e => setCard({ ...card, name: e.target.value })}
              />
            </div>
          </div>

          {err && <div className="lf-status lf-error-msg">⚠ {err}</div>}

          <button type="submit" className="btn-primary lf-submit" disabled={processing}>
            {processing ? <><span className="auth-spinner" /> Processing…</> : "Pay ₹199 →"}
          </button>
        </form>

        <p className="payment-secure-note">🔒 Payments are encrypted and secure. This is a demo — no real charge occurs.</p>
      </div>
    </div>
  );
}

export default function PremiumPage({ setPage }) {
  const { state, dispatch } = useStore();
  const isPremium = state.user?.isPremium;
  const [showPayment, setShowPayment] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState("");

  async function handlePaymentSuccess() {
    setShowPayment(false);
    setUpgrading(true);
    setError("");
    const { error } = await supabase.auth.updateUser({
      data: { name: state.user?.name, isPremium: true },
    });
    if (error) {
      setError(error.message);
    } else {
      dispatch({ type: "SET_USER", payload: { ...state.user, isPremium: true } });
      dispatch({ type: "SHOW_TOAST", payload: { message: "Welcome to Premium! 🎉", type: "success" } });
    }
    setUpgrading(false);
  }

  if (isPremium) {
    return (
      <div className="premium-page">
        <div className="premium-hero">
          <div className="premium-hero-icon">⭐</div>
          <h1>You are a Premium Member!</h1>
          <p>You have priority order processing. Your orders always come first.</p>
          <button className="btn-primary" onClick={() => setPage("Profile")}>View Profile →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-page">
      {showPayment && (
        <PaymentModal
          onClose={() => setShowPayment(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      <div className="premium-hero">
        <span className="eyebrow">BookSphere Premium</span>
        <h1>Get to the front of the queue</h1>
        <p>Premium members get priority order processing. Your orders are always handled before standard orders — faster, every time.</p>
      </div>

      <div className="premium-benefits">
        <h2>Premium Benefits</h2>
        <div className="premium-benefits-grid">
          {BENEFITS.map(b => (
            <div key={b.title} className="premium-benefit-card">
              <span className="premium-benefit-icon">{b.icon}</span>
              <h4>{b.title}</h4>
              <p>{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="premium-plans">
        <h2>Choose Your Plan</h2>
        <div className="premium-plans-grid">
          {PLANS.map(plan => (
            <div key={plan.name} className={`premium-plan-card ${plan.name === "Premium" ? "featured" : ""}`}>
              <div className="plan-header">
                <h3>{plan.name}</h3>
                <div className="plan-price">
                  <strong>{plan.price}</strong>
                  <span>{plan.period}</span>
                </div>
              </div>
              <ul className="plan-features">
                {plan.features.map(f => (
                  <li key={f}><span>✓</span>{f}</li>
                ))}
              </ul>
              <button
                className={plan.disabled ? "btn-plan-disabled" : "btn-primary"}
                disabled={plan.disabled || upgrading}
                onClick={plan.disabled ? undefined : () => setShowPayment(true)}
              >
                {upgrading ? <span className="auth-spinner" /> : plan.cta}
              </button>
              {error && <p style={{ color: "var(--red)", fontSize: "0.8rem" }}>{error}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
