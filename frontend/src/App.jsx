import React from "react";
import { Routes, Route } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
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
import DriverFare from "./components/dashbaord/pricing/DriverFare";
import WidgetMain from "./components/dashbaord/widgetapi/WidgetMain";
import WidgetAPI from "./components/dashbaord/widgetapi/WidgetAPI";
import DriverEarnings from "./portals/driverportal/earnings/DriverEarnings";
import DriverRides from "./portals/driverportal/rides/DriverRides";
import DriverJobDetails from "./portals/driverportal/home/DriverJobDetails";
import TermsCondition from "./portals/driverportal/settings/TermsandConditions";
import DriverContact from "./portals/driverportal/settings/DriverContact";

import ProtectedRoute from './layouts/ProtectedRoute';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <Routes>
        {/* Auth Pages */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/new-password" element={<ResetPassword />} />
        </Route>

        <Route path="/widget-form" element={<WidgetMain />} />
        {/* Role-Specific Dashboards */}

        <Route element={<ProtectedRoute />}>
          {/* Dashboard Layout with Nested Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <>
              {/* Home */}
              <Route path="home" index element={<Dashboard />} />

              {/* Bookings */}
              <Route path="bookings/list" element={<BookingsList />} />
              <Route path="bookings/new" element={<NewBooking />} />

              {/* Users/Admin List */}
              <Route path="admin-list" element={<AdminList />} />

              {/* Invoices */}
              <Route path="invoices/list" element={<InvoicesList />} />
              <Route path="invoices/new" element={<NewInvoice />} />
              <Route path="invoices/edit" element={<EditInvoice />} />

              {/* Drivers */}
              <Route path="drivers/list" element={<DriverList />} />
              <Route path="drivers/new" element={<NewDriver />} />
              <Route path="drivers/config" element={<DriverRegistrationConfig />} />
              <Route path="drivers/earnings" element={<DriverEarnings />} />
              <Route path="drivers/all-rides" element={<DriverRides />} />
              <Route path="drivers/jobs/:id" element={<DriverJobDetails />} />

              {/* Customers */}
              <Route path="customers/list" element={<CustomersList />} />

              {/* Company Accounts */}
              <Route path="company-accounts/list" element={<CompanyAccountsList />} />
              <Route path="company-accounts/new" element={<AddCompanyAccount />} />
              <Route path="company-accounts/edit/:id" element={<AddCompanyAccount />} />

              {/* Pricing */}
              <Route path="pricing/general" element={<General />} />
              <Route path="pricing/vehicle" element={<VehiclePricing />} />
              <Route path="pricing/hourly-packages" element={<HourlyPackages />} />
              <Route path="pricing/location-category" element={<LocationPricingCategory />} />
              <Route path="pricing/fixed" element={<FixedPricing />} />
              <Route path="pricing/distance-slab" element={<DistanceSlab />} />
              <Route path="pricing/driver-fare" element={<DriverFare />} />
              <Route path="pricing/congestion" element={<CongestionCharges />} />
              <Route path="pricing/discounts-date" element={<DiscountsByDate />} />
              <Route path="pricing/discounts-location" element={<DiscountsByLocation />} />
              <Route path="pricing/vouchers" element={<Vouchers />} />

              {/* Settings */}
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
              <Route path="settings/terms-and-condition" element={<TermsCondition />} />
              <Route path="settings/driver-contact" element={<DriverContact />} />

              {/* Widget / API */}
              <Route path="widget-api" element={<WidgetAPI />} />

              {/* Statements */}
              <Route path="statements/driver" element={<DriverStatements />} />
              <Route path="statements/payments" element={<DriverPayments />} />

              {/* Profile */}
              <Route path="profile" element={<EditProfile />} />

              {/* Logout */}
              <Route path="logout" element={<Logout />} />
            </>
          </Route>
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
}

export default App;