import React from "react";
import { Routes, Route } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import NewPassword from "./pages/auth/NewPassword";
import DashboardLayout from "./layouts/DashboardLayout";
import NotFound from "./pages/emptypages/NotFound";

import Dashboard from "./components/dashbaord/home/Dashboard";
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
import DriverStatements from "./components/dashbaord/statements/DriverStatements";
import DriverPayments from "./components/dashbaord/statements/DriverPayments";
import AddCompanyAccount from "./components/dashbaord/companyaccounts/AddCompanyAccount";
import CompanyAccountsList from "./components/dashbaord/companyaccounts/CompanyAccountsList";
import CustomersList from "./components/dashbaord/customers/CustomersList";
import AdminList from "./components/dashbaord/adminlist/AdminList";
import WidgetAPI from "./components/dashbaord/widgetapi/widgetapi";

import General from "./components/dashbaord/pricing/General";
import VehiclePricing from "./components/dashbaord/pricing/VehiclePricing";
import HourlyPackages from "./components/dashbaord/pricing/HourlyPackages";
import LocationPricingCategory from "./components/dashbaord/pricing/LocationCategory";
import FixedPricing from "./components/dashbaord/pricing/FixedPricing";
import DistanceSlab from "./components/dashbaord/pricing/DistanceSlab";
import DriverPricing from "./components/dashbaord/pricing/DriverPricing";
import CongestionCharges from "./components/dashbaord/pricing/CongestionCharges";
import DiscountsByDate from "./components/dashbaord/pricing/DiscountsByDate";
import DiscountsByLocation from "./components/dashbaord/pricing/DiscountsByLocation";
import Vouchers from "./components/dashbaord/pricing/Vouchers";

import SettingsGeneral from "./components/dashbaord/settings/SettingsGeneral";
import BookingSettings from "./components/dashbaord/settings/BookingSettings";
import EmailSettings from "./components/dashbaord/settings/EmailSettings";
import LocationSettingCategory from "./components/dashbaord/settings/LocationCategory";
import Locations from "./components/dashbaord/settings/Locations";
import Zones from "./components/dashbaord/settings/Zones";
import Coverage from "./components/dashbaord/settings/Coverage";
import PaymentOptions from "./components/dashbaord/settings/PaymentOptions";
import BookingRestrictionDate from "./components/dashbaord/settings/BookingRestrictionDate";
import ReviewSettings from "./components/dashbaord/settings/ReviewSettings";
import ReceiptSettings from "./components/dashbaord/settings/ReceiptSettings";
import Notifications from "./components/dashbaord/settings/Notifications";
import GoogleCalendar from "./components/dashbaord/settings/GoogleCalendar";
import SMSSettings from "./components/dashbaord/settings/SMSSettings";
import SocialMedia from "./components/dashbaord/settings/SocialMedia";
import ChatPlugin from "./components/dashbaord/settings/ChatPlugin";
import CronJob from "./components/dashbaord/settings/CronJob";

// React Toastify
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
          {/* Default route when "/dashboard" is accessed */}
          <Route path="home" index element={<Dashboard />} />

          {/* Bookings */}
          <Route path="bookings/list" element={<BookingsList />} />
          <Route path="bookings/new" element={<NewBooking />} />

          {/* Invoices */}
          <Route path="invoices/list" element={<InvoicesList />} />
          <Route path="invoices/new" element={<NewInvoice />} />
          <Route path="invoices/edit" element={<EditInvoice />} />

          {/* Drivers */}
          <Route path="drivers/list" element={<DriverList />} />
          <Route path="drivers/new" element={<NewDriver />} />
          <Route path="drivers/config" element={<DriverRegistrationConfig />} />

          {/* Customers */}
          <Route path="customers/list" element={<CustomersList />} />

          {/* Company Accounts */}
          <Route path="company-accounts/list" element={<CompanyAccountsList />} />
          <Route path="company-accounts/new" element={<AddCompanyAccount />} />

          {/* Admin List */}
          <Route path="admin-list" element={<AdminList />} />

          {/* Pricing All Tabs */}
          <Route path="pricing/general" element={<General />} />
          <Route path="pricing/vehicle" element={<VehiclePricing />} />
          <Route path="pricing/hourly-packages" element={<HourlyPackages />} />
          <Route path="pricing/location-category" element={<LocationPricingCategory />} />
          <Route path="pricing/fixed" element={<FixedPricing />} />
          <Route path="pricing/distance-slab" element={<DistanceSlab />} />
          <Route path="pricing/driver" element={<DriverPricing />} />
          <Route path="pricing/congestion" element={<CongestionCharges />} />
          <Route path="pricing/discounts-date" element={<DiscountsByDate />} />
          <Route path="pricing/discounts-location" element={<DiscountsByLocation />} />
          <Route path="pricing/vouchers" element={<Vouchers />} />

          {/* Settings All Tabs */}
          <Route path="settings/general" element={<SettingsGeneral />} />
          <Route path="settings/booking" element={<BookingSettings />} />
          <Route path="settings/email" element={<EmailSettings />} />
          <Route path="settings/location-category" element={<LocationSettingCategory />} />
          <Route path="settings/locations" element={<Locations />} />
          <Route path="settings/zones" element={<Zones />} />
          <Route path="settings/coverage" element={<Coverage />} />
          <Route path="settings/payment-options" element={<PaymentOptions />} />
          <Route path="settings/booking-restriction-date" element={<BookingRestrictionDate />} />
          <Route path="settings/review" element={<ReviewSettings />} />
          <Route path="settings/receipt" element={<ReceiptSettings />} />
          <Route path="settings/notifications" element={<Notifications />} />
          <Route path="settings/google-calendar" element={<GoogleCalendar />} />
          <Route path="settings/sms" element={<SMSSettings />} />
          <Route path="settings/social-media" element={<SocialMedia />} />
          <Route path="settings/chat-plugin" element={<ChatPlugin />} />
          <Route path="settings/cron-job" element={<CronJob />} />

          {/* Widget / API */}
          <Route path="widget-api" element={<WidgetAPI />} />

          {/* Statements */}
          <Route path="statements/driver" element={<DriverStatements />} />
          <Route path="statements/payments" element={<DriverPayments />} />

          {/* Profile & Logout */}
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
