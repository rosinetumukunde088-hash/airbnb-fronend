import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { ListingsPage } from "./features/listings";
import { LoginPage, SignUpPage } from "./features/auth";
import Navbar from "./shared/components/Navbar";
import Home from "./features/listings/pages/Home";
import Footer from "./features/listings/components/Footer";
import Spinner from "./shared/components/Spinner";
import ProtectedRoute from "./shared/components/ProtectedRoute";
import NotFound from "./shared/components/NotFound";

const ListingDetail = lazy(() => import("./features/listings/pages/ListingDetail"));
const DashboardPage = lazy(() => import("./features/auth/pages/DashboardPage"));
const AddListingPage = lazy(() => import("./features/listings/pages/AddListingPage"));
const MyListingsPage = lazy(() => import("./features/listings/pages/MyListingsPage"));
const ProfilePage = lazy(() => import("./features/auth/pages/ProfilePage"));
const BookingPage = lazy(() => import("./features/bookings/pages/BookingPage"));

NProgress.configure({ showSpinner: false });

function App() {
  const location = useLocation();

  useEffect(() => {
    NProgress.start();
    const t = setTimeout(() => NProgress.done(), 100);
    return () => clearTimeout(t);
  }, [location]);

  return (
    <>
      <Navbar />
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/add-listing" element={<ProtectedRoute><AddListingPage /></ProtectedRoute>} />
          <Route path="/my-listings" element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/book/:id" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Footer />
    </>
  );
}

export default App;
