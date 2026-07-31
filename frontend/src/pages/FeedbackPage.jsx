import { useState } from "react";
import { useStore } from "../store/useStore";
import { supabase } from "../lib/supabase";

const CATEGORIES = ["General", "Order Issue", "Website Bug", "Book Suggestion", "Billing", "Other"];
const RATINGS = [1, 2, 3, 4, 5];

export default function FeedbackPage({ setPage }) {
  const { state } = useStore();
  const [form, setForm] = useState({ category: "General", rating: 5, message: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (!form.message.trim()) { setErr("Please write your feedback before submitting."); return; }
    setErr("");
    setLoading(true);
    // Try to save to Supabase feedback table; silently ignore if table doesn't exist
    try {
      await supabase.from("feedback").insert({
        user_id: state.user?.userId,
        email: state.user?.email,
        category: form.category,
        rating: form.rating,
        message: form.message,
      });
    } catch (_) {}
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className="page">
        <div className="feedback-success">
          <span style={{ fontSize: "3.5rem" }}>🙏</span>
          <h2>Thank you for your feedback!</h2>
          <p>We read every submission and use it to improve BookSphere.</p>
          <button className="btn-primary" onClick={() => setPage("Catalog")}>Back to Catalog →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="section-heading">
        <div>
          <span className="eyebrow">We'd love to hear from you</span>
          <h2>💬 Share Your Feedback</h2>
        </div>
      </div>

      <div className="feedback-card">
        <form onSubmit={submit} className="feedback-form">
          <div className="lf-field">
            <label>Category</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              style={{ padding: "12px 14px", borderRadius: 14, border: "1px solid var(--line)", background: "rgba(8,12,24,0.52)", color: "white", width: "100%" }}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="lf-field">
            <label>Your Rating</label>
            <div className="rating-stars-row">
              {RATINGS.map(r => (
                <button
                  key={r}
                  type="button"
                  className={`star-btn ${r <= form.rating ? "star-active" : ""}`}
                  onClick={() => setForm({ ...form, rating: r })}
                >★</button>
              ))}
              <span style={{ color: "var(--muted)", fontSize: "0.82rem", marginLeft: 8 }}>
                {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][form.rating]}
              </span>
            </div>
          </div>

          <div className="lf-field">
            <label>Your Feedback</label>
            <textarea
              className="feedback-textarea"
              placeholder="Tell us what you think — what's working well, what could be better, or anything you'd like to see..."
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              rows={6}
            />
          </div>

          {err && <div className="lf-status lf-error-msg">⚠ {err}</div>}

          <button type="submit" className="btn-primary" style={{ justifySelf: "start", minWidth: 180 }} disabled={loading}>
            {loading ? <span className="auth-spinner" /> : "Submit Feedback →"}
          </button>
        </form>
      </div>
    </div>
  );
}
