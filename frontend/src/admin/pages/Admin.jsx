import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AdminShell from "../components/AdminShell";
import AdminDashboard from "./Dashboard";
import MyListings from "./MyListings";
import AllListings from "./AllListings";
import AdminUsers from "./Users";
import AdminActivity from "./Activity";
import AdminSettings from "./Settings";
import MovingHeaderSettings from "./MovingHeaderSettings";
import HeroSlides from "./HeroSlides";
import Categories from "./Categories";
import MyAccount from "./MyAccount";
import FiltrationSettings from "./FiltrationSettings";
import DemoSettings from "./DemoSettings";
import GlobalSettings from "./Settings";
import CallCenters from "./CallCenters";

export default function AdminApp() {
  const { user } = useAuth();
  const role = user?.role || "user";
  const isAdmin = role === "ADMIN" || role === "super_admin";
  const isSuperAdmin = role === "super_admin";

  return (
    <AdminShell>
      <Routes>
        {/* User and Admin routes */}
        <Route index element={<AdminDashboard />} />
        <Route path="my-listings" element={<MyListings />} />
        <Route path="my-account" element={<MyAccount />} />
        <Route path="settings" element={<GlobalSettings />} />

        {/* Super Admin only routes */}
        {isSuperAdmin ? <Route path="listings" element={<AllListings />} /> : null}
        {isSuperAdmin ? (
          <Route path="moving-header" element={<MovingHeaderSettings />} />
        ) : null}
        {isSuperAdmin ? <Route path="categories" element={<Categories />} /> : null}
        {isSuperAdmin ? (
          <Route path="filtration" element={<FiltrationSettings />} />
        ) : null}
        {isSuperAdmin ? <Route path="demo" element={<DemoSettings />} /> : null}
        {isSuperAdmin ? <Route path="users" element={<AdminUsers />} /> : null}
        {isSuperAdmin ? (
          <Route path="activity" element={<AdminActivity />} />
        ) : null}
        {isSuperAdmin ? (
          <Route path="hero-slides" element={<HeroSlides />} />
        ) : null}
        {isSuperAdmin ? (
          <Route path="call-centers" element={<CallCenters />} />
        ) : null}

        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminShell>
  );
}
