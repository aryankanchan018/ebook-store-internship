import { useState } from "react";

export default function TermsPage() {
  const [tab, setTab] = useState("terms");

  return (
    <div className="page">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Legal</span>
          <h2>📄 Terms &amp; Privacy</h2>
        </div>
      </div>

      <div className="profile-tabs" style={{ marginBottom: 8 }}>
        <button className={tab === "terms" ? "active" : ""} onClick={() => setTab("terms")}>📋 Terms of Service</button>
        <button className={tab === "privacy" ? "active" : ""} onClick={() => setTab("privacy")}>🔐 Privacy Policy</button>
      </div>

      {tab === "terms" && (
        <div className="legal-card">
          <p className="legal-updated">Last updated: January 2025</p>
          <h3>Terms of Service</h3>

          <div className="legal-section">
            <h4>1. Acceptance of Terms</h4>
            <p>By accessing or using BookSphere, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>
          </div>

          <div className="legal-section">
            <h4>2. Use of the Platform</h4>
            <p>BookSphere is an online bookstore platform. You agree to use it only for lawful purposes and in a manner that does not infringe the rights of others. You must be at least 13 years old to create an account.</p>
          </div>

          <div className="legal-section">
            <h4>3. Account Responsibility</h4>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorised use of your account. BookSphere is not liable for any loss resulting from unauthorised account access.</p>
          </div>

          <div className="legal-section">
            <h4>4. Orders &amp; Payments</h4>
            <p>All orders are subject to availability. Prices are displayed in Indian Rupees (₹) and are inclusive of applicable taxes. BookSphere reserves the right to cancel orders in case of pricing errors or stock unavailability. Premium membership is billed monthly and can be cancelled at any time.</p>
          </div>

          <div className="legal-section">
            <h4>5. Returns &amp; Refunds</h4>
            <p>Physical books may be returned within 7 days of delivery if they are in their original condition. Digital content is non-refundable once accessed. To initiate a return, contact us via the Feedback page.</p>
          </div>

          <div className="legal-section">
            <h4>6. Intellectual Property</h4>
            <p>All content on BookSphere — including logos, design, and code — is the property of BookSphere. Book content and covers are owned by their respective publishers and authors.</p>
          </div>

          <div className="legal-section">
            <h4>7. Limitation of Liability</h4>
            <p>BookSphere provides the platform "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p>
          </div>

          <div className="legal-section">
            <h4>8. Changes to Terms</h4>
            <p>We may update these Terms from time to time. Continued use of BookSphere after changes constitutes acceptance of the new Terms.</p>
          </div>

          <div className="legal-section">
            <h4>9. Contact</h4>
            <p>For questions about these Terms, use the Feedback page or email us at support@booksphere.in</p>
          </div>
        </div>
      )}

      {tab === "privacy" && (
        <div className="legal-card">
          <p className="legal-updated">Last updated: January 2025</p>
          <h3>Privacy Policy</h3>

          <div className="legal-section">
            <h4>1. Information We Collect</h4>
            <p>We collect information you provide directly to us when you create an account, place orders, or contact us. This includes your name, email address, and order history. We do not collect payment card details on our servers — payments are processed securely.</p>
          </div>

          <div className="legal-section">
            <h4>2. How We Use Your Information</h4>
            <p>We use your information to process orders, send order confirmations, provide customer support, personalise your experience (wishlist, recently viewed, recommendations), and improve the platform.</p>
          </div>

          <div className="legal-section">
            <h4>3. Data Storage</h4>
            <p>Your data is stored securely using Supabase (PostgreSQL) with row-level security. Only you can access your personal orders, cart, and wishlist data. Authentication is handled via encrypted sessions.</p>
          </div>

          <div className="legal-section">
            <h4>4. Cookies &amp; Local Storage</h4>
            <p>We use browser local storage to maintain your login session. This data is used only for authentication and is cleared when you log out. We do not use tracking cookies.</p>
          </div>

          <div className="legal-section">
            <h4>5. Data Sharing</h4>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share data with trusted service providers (such as Supabase for hosting) under strict confidentiality agreements.</p>
          </div>

          <div className="legal-section">
            <h4>6. Your Rights</h4>
            <p>You have the right to access, correct, or delete your personal data at any time. You can update your profile information in the Profile page, or permanently delete your account from Settings → Danger Zone.</p>
          </div>

          <div className="legal-section">
            <h4>7. Security</h4>
            <p>We take reasonable measures to protect your data, including encrypted connections (HTTPS), hashed passwords, and row-level database security. However, no online system is 100% secure.</p>
          </div>

          <div className="legal-section">
            <h4>8. Contact</h4>
            <p>For privacy-related questions or data requests, contact us via the Feedback page or email privacy@booksphere.in</p>
          </div>
        </div>
      )}
    </div>
  );
}
