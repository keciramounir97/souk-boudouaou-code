import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/header";
import AuthPage from "./components/AuthPage";
import Home from "./pages/home";
import AdminPanel from "./admin/pages/Admin";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/profile";
import OrdersPage from "./pages/OrdersPage";
import ListingDetails from "./pages/ListingDetails";
import CreateListing from "./pages/CreateListing";
import EditListing from "./pages/EditListing";
import VerifyEmail from "./pages/VerifyEmail";
import SettingsPage from "./pages/Settings";
import SavedListings from "./pages/SavedListings";
import "./styles/responsive-global.css";

function App() {
  return (
    <Router>
      {/* GLOBAL HEADER */}
      <Header />

      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/verify-email" element={<VerifyEmail />} />
        <Route path="/listing/:id" element={<ListingDetails />} />
        <Route path="/saved" element={<SavedListings />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-listing"
          element={
            <ProtectedRoute>
              <CreateListing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-listing/:id"
          element={
            <ProtectedRoute>
              <EditListing />
            </ProtectedRoute>
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
