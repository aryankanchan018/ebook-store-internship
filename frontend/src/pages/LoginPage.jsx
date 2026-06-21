import { useState, useEffect, useRef } from "react";
import { useStore } from "../store/useStore";
import { supabase } from "../lib/supabase";

function passwordStrength(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

const STRENGTH = [
  null,
  { label: "Weak",   color: "#ff7a91" },
  { label: "Fair",   color: "#ffd166" },
  { label: "Good",   color: "#39b7ff" },
  { label: "Strong", color: "#4ee6b4" },
];

function validate(mode, form) {
  const e = {};
  if (mode === "register" && !form.name.trim()) e.name = "Name is required";
  if (!form.email.match(/^[^@]+@[^@]+\.[^@]+$/))  e.email = "Enter a valid email";
  if (mode === "register" && form.password.length < 6) e.password = "Minimum 6 characters";
  if (mode === "login" && !form.password) e.password = "Password is required";
  return e;
}

const FEATURES = [
  { icon: "📚", label: "12 curated books" },
  { icon: "🔍", label: "Instant tag search" },
  { icon: "🛒", label: "Smart cart + undo" },
  { icon: "⭐", label: "Priority orders" },
  { icon: "🚚", label: "Delivery tracking" },
  { icon: "🤝", label: "Personalised picks" },
];

export default function LoginPage() {
  const { state, dispatch } = useStore();
  const [mode, setMode]         = useState("login");
  const [form, setForm]         = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errs, setErrs]         = useState({});
  const [touched, setTouched]   = useState({});
  const [status, setStatus]     = useState(null);
  const [forgotSent, setForgotSent] = useState(false);
  const firstRef = useRef(null);

  useEffect(() => {
    firstRef.current?.focus();
    setErrs({}); setTouched({}); setStatus(null); setForgotSent(false);
  }, [mode]);

  const strength = mode === "register" ? passwordStrength(form.password) : 0;

  function touch(k) { setTouched(t => ({ ...t, [k]: true })); }

  function handleChange(k, v) {
    const next = { ...form, [k]: v };
    setForm(next);
    if (touched[k]) {
      const e = validate(mode, next);
      setErrs(prev => ({ ...prev, [k]: e[k] }));
    }
  }

  async function submit(e) {
    e.preventDefault();
    const allTouched = mode === "register"
      ? { name: true, email: true, password: true }
      : { email: true, password: true };
    setTouched(allTouched);
    const fieldErrs = validate(mode, form);
    setErrs(fieldErrs);
    if (Object.keys(fieldErrs).length) return;

    setLoading(true);
    setStatus(null);

    if (mode === "register") {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { name: form.name, isPremium: false } },
      });
      if (error) {
        setStatus({ type: "error", msg: error.message });
      } else {
        setStatus({ type: "success", msg: "Account created! Signing you in…" });
        setTimeout(() => { setMode("login"); setStatus(null); }, 1800);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email, password: form.password,
      });
      if (error) setStatus({ type: "error", msg: error.message });
    }
    setLoading(false);
  }

  async function loginWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) dispatch({ type: "SET_ERROR", payload: error.message });
  }

  async function handleForgot(e) {
    e.preventDefault();
    if (!form.email.match(/^[^@]+@[^@]+\.[^@]+$/)) {
      setTouched(t => ({ ...t, email: true }));
      setErrs(prev => ({ ...prev, email: "Enter your email first" }));
      return;
    }
    await supabase.auth.resetPasswordForEmail(form.email);
    setForgotSent(true);
  }

  return (
    <div className="login-page">
      {/* Left panel — brand */}
      <div className="login-brand">
        <div className="login-brand-content">
          <div className="login-logo-row">
            <div className="logo-mark">B</div>
            <span className="login-brand-name">BookSphere</span>
          </div>
          <h2 className="login-brand-headline">Your smart bookstore experience.</h2>
          <p className="login-brand-sub">Search instantly. Save your wishlist. Get priority shipping. Discover books you'll love.</p>

          <div className="login-features">
            {FEATURES.map(f => (
              <div key={f.label} className="login-feature-chip">
                <span>{f.icon}</span>
                <span>{f.label}</span>
              </div>
            ))}
          </div>

          <div className="login-brand-books" aria-hidden="true">
            <div className="lb-book lb-book-1">📖</div>
            <div className="lb-book lb-book-2">📗</div>
            <div className="lb-book lb-book-3">📘</div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="login-form-panel">
        <div className="login-card">
          <div className="login-toggle">
            <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Sign In</button>
            <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Sign Up</button>
            <div className="toggle-slider" style={{ transform: `translateX(${mode === "register" ? "100%" : "0"})` }} />
          </div>

          <div className="login-card-header">
            <h3>{mode === "login" ? "Welcome back 👋" : "Join BookSphere 🚀"}</h3>
            <p>{mode === "login" ? "Sign in to continue your reading journey" : "Create your account — it's free"}</p>
          </div>

          <button className="btn-google" onClick={loginWithGoogle}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-3.58-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <div className="auth-divider"><span>or continue with email</span></div>

          <form onSubmit={submit} noValidate>
            {mode === "register" && (
              <div className={`lf-field ${touched.name && errs.name ? "lf-error" : ""}`}>
                <label>Full Name</label>
                <div className="lf-input-wrap">
                  <span className="lf-icon">👤</span>
                  <input
                    ref={mode === "register" ? firstRef : undefined}
                    type="text" placeholder="Your full name"
                    value={form.name} onChange={e => handleChange("name", e.target.value)}
                    onBlur={() => touch("name")} autoComplete="name"
                  />
                </div>
                {touched.name && errs.name && <span className="lf-err-msg">{errs.name}</span>}
              </div>
            )}

            <div className={`lf-field ${touched.email && errs.email ? "lf-error" : ""}`}>
              <label>Email Address</label>
              <div className="lf-input-wrap">
                <span className="lf-icon">✉️</span>
                <input
                  ref={mode === "login" ? firstRef : undefined}
                  type="email" placeholder="your@email.com"
                  value={form.email} onChange={e => handleChange("email", e.target.value)}
                  onBlur={() => touch("email")} autoComplete="email"
                />
              </div>
              {touched.email && errs.email && <span className="lf-err-msg">{errs.email}</span>}
            </div>

            <div className={`lf-field ${touched.password && errs.password ? "lf-error" : ""}`}>
              <div className="lf-label-row">
                <label>Password</label>
                {mode === "login" && !forgotSent && (
                  <button type="button" className="lf-forgot" onClick={handleForgot}>Forgot password?</button>
                )}
              </div>
              <div className="lf-input-wrap">
                <span className="lf-icon">🔒</span>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password} onChange={e => handleChange("password", e.target.value)}
                  onBlur={() => touch("password")}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
                <button type="button" className="lf-show-pass" onClick={() => setShowPass(s => !s)}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              {touched.password && errs.password && <span className="lf-err-msg">{errs.password}</span>}
              {mode === "register" && form.password && (
                <div className="lf-strength">
                  <div className="lf-strength-bar">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="lf-seg" style={{ background: i <= strength ? STRENGTH[strength]?.color : undefined }} />
                    ))}
                  </div>
                  {STRENGTH[strength] && <span style={{ color: STRENGTH[strength].color, fontSize: "0.72rem", fontWeight: 800 }}>{STRENGTH[strength].label}</span>}
                </div>
              )}
            </div>

            {forgotSent && <div className="lf-status lf-success">✓ Reset link sent to {form.email}</div>}
            {status && <div className={`lf-status ${status.type === "error" ? "lf-error-msg" : "lf-success"}`}>
              {status.type === "error" ? "⚠ " : "✓ "}{status.msg}
            </div>}
            {state.error && !status && <div className="lf-status lf-error-msg">⚠ {state.error}</div>}

            <button type="submit" className="btn-primary lf-submit" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : mode === "login" ? "Sign In →" : "Create Account →"}
            </button>
          </form>

          <p className="lf-switch">
            {mode === "login" ? "New to BookSphere? " : "Already have an account? "}
            <span onClick={() => setMode(mode === "login" ? "register" : "login")}>
              {mode === "login" ? "Create a free account" : "Sign in"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
