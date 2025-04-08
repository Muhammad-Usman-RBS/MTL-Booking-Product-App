import React from "react";
import { Routes, Route } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import NewPassword from "./pages/auth/NewPassword";
import DashboardLayout from "./layouts/DashboardLayout";
import NotFound from "./pages/emptypages/NotFound";

import Dashboard from "./components/dashbaord/home/Dashboard";
import GeneralSettings from "./components/dashbaord/settings/GeneralSettings";
import SecuritySettings from "./components/dashbaord/settings/SecuritySettings";
import EditProfile from "./components/dashbaord/profile/EditProfile";
import Logout from "./components/dashbaord/Logout";
import BookingsList from "./components/dashbaord/bookings/BookingsList";
import NewBooking from "./components/dashbaord/bookings/NewBooking";
import InvoicesList from "./components/dashbaord/invoices/InvoicesList";
import NewInvoice from "./components/dashbaord/invoices/NewInvoice";
import EditInvoice from "./components/dashbaord/invoices/EditInvoice";
import NewDriver from "./components/dashbaord/drivers/NewDriver";
import DriverRegistrationConfig from "./components/dashbaord/drivers/DriverRegistrationConfig";
import DriverList from "./components/dashbaord/drivers/DriverList";

// React Toastify
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomersList from "./components/dashbaord/customers/CustomersList";

function App() {
  return (
    <>
      <Routes>
        {/* All Auth pages nested under AuthLayout */}
        <Route path="/" element={<AuthLayout />}>
          <Route index element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="new-password" element={<NewPassword />} />
        </Route>

        {/* Dashboard */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          {/* 👇 Default route when "/dashboard" is accessed */}
          <Route index element={<Dashboard />} />

          <Route path="bookings-list" element={<BookingsList />} />
          <Route path="new-booking" element={<NewBooking />} />

          <Route path="invoices-list" element={<InvoicesList />} />
          <Route path="new-invoice" element={<NewInvoice />} />
          <Route path="edit-invoice" element={<EditInvoice />} />

          <Route path="driver-list" element={<DriverList />} />
          <Route path="new-driver" element={<NewDriver />} />
          <Route
            path="driver-registration-config"
            element={<DriverRegistrationConfig />}
          />

          <Route path="customers-list" element={<CustomersList />} />

          <Route path="settings/general" element={<GeneralSettings />} />
          <Route path="settings/security" element={<SecuritySettings />} />
          <Route path="profile" element={<EditProfile />} />
          <Route path="logout" element={<Logout />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
}

export default App;
