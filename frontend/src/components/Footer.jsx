export default function Footer({ setPage }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">B</div>
          <strong>BookSphere</strong>
          <p>Your smart online bookstore. Curated reads, fast delivery, priority orders.</p>
          <div className="footer-social">
            <a href="https://github.com/Varadha9/ShopSphere" target="_blank" rel="noopener noreferrer" className="footer-social-btn">GitHub</a>
          </div>
        </div>

        <div className="footer-col">
          <h5>Shop</h5>
          <ul>
            <li><span onClick={() => setPage("Catalog")}>All Books</span></li>
            <li><span onClick={() => setPage("Catalog")}>Technology</span></li>
            <li><span onClick={() => setPage("Catalog")}>Fiction</span></li>
            <li><span onClick={() => setPage("Catalog")}>Non-Fiction</span></li>
            <li><span onClick={() => setPage("Catalog")}>Self-Help</span></li>
          </ul>
        </div>

        <div className="footer-col">
          <h5>Account</h5>
          <ul>
            <li><span onClick={() => setPage("Profile")}>My Profile</span></li>
            <li><span onClick={() => setPage("Orders")}>My Orders</span></li>
            <li><span onClick={() => setPage("Wishlist")}>Wishlist</span></li>
            <li><span onClick={() => setPage("Cart")}>Cart</span></li>
            <li><span onClick={() => setPage("Premium")}>Go Premium ⭐</span></li>
          </ul>
        </div>

        <div className="footer-col">
          <h5>Features</h5>
          <ul>
            <li><span onClick={() => setPage("Recommendations")}>Book Recommendations</span></li>
            <li><span onClick={() => setPage("Delivery")}>Delivery Tracker</span></li>
            <li><span onClick={() => setPage("Feedback")}>Give Feedback</span></li>
          </ul>
        </div>

        <div className="footer-col">
          <h5>Help &amp; Legal</h5>
          <ul>
            <li><span onClick={() => setPage("Feedback")}>💬 Feedback</span></li>
            <li><span onClick={() => setPage("Terms")}>📋 Terms of Service</span></li>
            <li><span onClick={() => setPage("Terms")}>🔐 Privacy Policy</span></li>
            <li><a href="mailto:support@booksphere.in" style={{ color: "inherit", textDecoration: "none" }}>✉️ Contact Us</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} BookSphere. All rights reserved.</span>
        <span style={{ display: "flex", gap: 16 }}>
          <span className="footer-legal-link" onClick={() => setPage("Terms")}>Terms</span>
          <span className="footer-legal-link" onClick={() => setPage("Terms")}>Privacy</span>
          <span>React + Vite + Supabase</span>
        </span>
      </div>
    </footer>
  );
}
