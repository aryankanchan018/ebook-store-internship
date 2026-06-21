import { useState } from "react";
import { StoreProvider } from "./store/useStore";
import Navbar from "./components/Navbar";
import Toast from "./components/Toast";
import Footer from "./components/Footer";
import CatalogPage from "./pages/CatalogPage";
import BookDetailPage from "./pages/BookDetailPage";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import OrdersPage from "./pages/OrdersPage";
import DeliveryPage from "./pages/DeliveryPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import ProfilePage from "./pages/ProfilePage";
import PremiumPage from "./pages/PremiumPage";
import FeedbackPage from "./pages/FeedbackPage";
import TermsPage from "./pages/TermsPage";
import UXPage from "./pages/UXPage";

function AppInner() {
  const [page, setPage] = useState("Catalog");

  return (
    <div className="app-shell">
      <Navbar page={page} setPage={setPage} />
      <Toast />
      <div className="app-body">
        {page === "Catalog"         && <CatalogPage setPage={setPage} />}
        {page === "BookDetail"       && <BookDetailPage setPage={setPage} />}
        {page === "Cart"            && <CartPage setPage={setPage} />}
        {page === "Wishlist"        && <WishlistPage setPage={setPage} />}
        {page === "Orders"          && <OrdersPage setPage={setPage} />}
        {page === "Delivery"        && <DeliveryPage />}
        {page === "Recommendations" && <RecommendationsPage setPage={setPage} />}
        {page === "Profile"         && <ProfilePage setPage={setPage} />}
        {page === "Premium"         && <PremiumPage setPage={setPage} />}
        {page === "Feedback"        && <FeedbackPage setPage={setPage} />}
        {page === "Terms"           && <TermsPage />}
        {page === "UX"              && <UXPage />}
      </div>
      <Footer setPage={setPage} />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppInner />
    </StoreProvider>
  );
}
