import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import DashboardLayout from "./layouts/DashboardLayout";
import NotFound from "./pages/emptypages/NotFound";
import { LoadingProvider } from "./components/common/LoadingProvider";
import Dashboard from "./components/dashbaord/home/Dashboard";
import EditProfile from "./components/dashbaord/profile/EditProfile";
import Logout from "./components/dashbaord/Logout";
import BookingsList from "./components/dashbaord/bookings/BookingsList";
import NewBooking from "./components/dashbaord/bookings/NewBooking";
import InvoicesList from "./components/dashbaord/invoices/InvoicesList";
import NewInvoice from "./components/dashbaord/invoices/NewInvoice";
import EditInvoice from "./components/dashbaord/invoices/EditInvoice";
import NewDriver from "./components/dashbaord/drivers/NewDriver";
import DriverList from "./components/dashbaord/drivers/DriverList";
import AddCompanyAccount from "./components/dashbaord/companyaccounts/AddCompanyAccount";
import CompanyAccountsList from "./components/dashbaord/companyaccounts/CompanyAccountsList";
import CustomersList from "./components/dashbaord/customers/CustomersList";
import AdminList from "./components/dashbaord/adminlist/AdminList";
import NewAdminUser from "./components/dashbaord/adminlist/NewAdminUser";
import VerificationUser from "./components/dashbaord/adminlist/VerificationUser";

import General from "./components/dashbaord/pricing/General";
import VehiclePricing from "./components/dashbaord/pricing/VehiclePricing";
import HourlyPackages from "./components/dashbaord/pricing/HourlyPackages";
import PostcodeDistrict from "./components/dashbaord/pricing/PostcodeDistrict";
import Zones from "./components/dashbaord/pricing/Zones";
import FixedPricing from "./components/dashbaord/pricing/FixedPricing";
import DistanceSlab from "./components/dashbaord/pricing/DistanceSlab";
import DriverPricing from "./components/dashbaord/pricing/DriverPricing";
import DiscountsByDate from "./components/dashbaord/pricing/DiscountsByDate";
import Vouchers from "./components/dashbaord/pricing/Vouchers";

import SettingsGeneral from "./components/dashbaord/settings/SettingsGeneral";
import BookingSettings from "./components/dashbaord/settings/BookingSettings";
import EmailSettings from "./components/dashbaord/settings/EmailSettings";
import LocationSettingCategory from "./components/dashbaord/settings/LocationCategory";
import Locations from "./components/dashbaord/settings/Locations";
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
import WidgetMain from "./components/dashbaord/widgetapi/WidgetMain";
import WidgetAPI from "./components/dashbaord/widgetapi/WidgetAPI";
import DriverEarnings from "./portals/driverportal/earnings/DriverEarnings";
import DriverRides from "./portals/driverportal/rides/DriverRides";
import DriverJobDetails from "./portals/driverportal/home/DriverJobDetails";
import TermsCondition from "./portals/driverportal/settings/TermsandConditions";
import DriverContact from "./portals/driverportal/settings/DriverContact";
import ViewNotifications from "./components/dashbaord/settings/ViewNotifications";
import BookingCalendar from "./components/dashbaord/bookings/BookingCalendar";
import AddCustomer from "./components/dashbaord/widgetapi/AddCustomer";
import ViewCompany from "./components/dashbaord/companyaccounts/ViewCompany";

import ProtectedRoute from "./layouts/ProtectedRoute";
import ProtectedAddCustomer from "./layouts/ProtectedAddCustomer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// TimeStamps for Every File
import { useDispatch } from "react-redux";
import { useGetBookingSettingQuery } from "./redux/api/bookingSettingsApi";
import { setTimezone } from "./redux/slices/timezoneSlice";
import { setCurrency } from "./redux/slices/currencySlice";

// Socket Io
import useNotificationsRealtime from "./utils/useNotificationsRealtime";

function App() {
  // Hook call, socket events attach honge
  useNotificationsRealtime();

  const dispatch = useDispatch();
  const { data, isSuccess } = useGetBookingSettingQuery();

  useEffect(() => {
    if (isSuccess && data?.setting) {
      if (data.setting.timezone) {
        dispatch(setTimezone(data.setting.timezone));
      }

      if (data.setting.currency) {
        const selectedCurrency = data.setting.currency[0]?.value || "GBP";
        dispatch(setCurrency(selectedCurrency));
      }
    }
  }, [isSuccess, data, dispatch]);

  return (
    <LoadingProvider>
      <Routes>
        {/* Auth Pages */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/new-password" element={<ResetPassword />} />
        </Route>

        <Route path="/widget-form" element={<WidgetMain />} />

        {/* Role-Specific Dashboards */}
        <Route
          path="/add-customer"
          element={
            <ProtectedAddCustomer>
              <AddCustomer />
            </ProtectedAddCustomer>
          }
        />

        <Route element={<ProtectedRoute />}>
          {/* Dashboard Layout with Nested Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <>  
            {/* <hello/> */}
              {/* Home */}
              <Route path="home" index element={<Dashboard />} />

              {/* Bookings */}
              <Route path="bookings/list" element={<BookingsList />} />
              <Route path="bookings/new" element={<NewBooking />} />
              <Route path="bookings/calendar" element={<BookingCalendar />} />


              {/* Users/Admin List */}
              <Route path="admin-list" element={<AdminList />} />
              <Route path="admin-list/add-user" element={<NewAdminUser />} />
              <Route path="admin-list/edit/:id" element={<NewAdminUser />} />
              <Route path="admin-list/verify-user" element={<VerificationUser />} />

              {/* Invoices */}
              <Route path="invoices/list" element={<InvoicesList />} />
              <Route path="invoices/edit/:id" element={<EditInvoice />} />
              <Route path="invoices/customer/new" element={<NewInvoice invoiceType="customer" />} />
              <Route path="invoices/driver/new" element={<NewInvoice invoiceType="driver" />} />

              {/* Drivers */}
              <Route path="drivers/list" element={<DriverList />} />
              <Route path="drivers/new" element={<NewDriver />} />
              <Route path="drivers/edit/:id" element={<NewDriver />} />
              <Route path="drivers/earnings" element={<DriverEarnings />} />
              <Route path="drivers/all-rides" element={<DriverRides />} />
              <Route path="drivers/jobs/:id" element={<DriverJobDetails />} />

              {/* Customers */}
              <Route path="customers/list" element={<CustomersList />} />

              {/* Company Accounts */}
              <Route path="company-accounts/list" element={<CompanyAccountsList />} />
              <Route path="company-accounts/new" element={<AddCompanyAccount />} />
              <Route path="company-accounts/edit/:id" element={<AddCompanyAccount />} />
              <Route path="view-company" element={<ViewCompany />} />

              {/* Pricing */}
              <Route path="pricing/general" element={<General />} />
              <Route path="pricing/vehicle" element={<VehiclePricing />} />
              <Route path="pricing/hourly-packages" element={<HourlyPackages />} />
              <Route path="pricing/postcode-district" element={<PostcodeDistrict />} />
              <Route path="pricing/zones" element={<Zones />} />
              <Route path="pricing/fixed" element={<FixedPricing />} />
              <Route path="pricing/distance-slab" element={<DistanceSlab />} />
              <Route path="pricing/discounts-date" element={<DiscountsByDate />} />
              <Route path="pricing/vouchers" element={<Vouchers />} />

              {/* Settings */}
              <Route path="settings/general" element={<SettingsGeneral />} />
              <Route path="settings/booking" element={<BookingSettings />} />
              <Route path="settings/email" element={<EmailSettings />} />
              <Route path="settings/location-category" element={<LocationSettingCategory />} />
              <Route path="settings/locations" element={<Locations />} />
              <Route path="settings/coverage" element={<Coverage />} />
              <Route path="settings/payment-options" element={<PaymentOptions />} />
              <Route path="settings/booking-restriction-date" element={<BookingRestrictionDate />} />
              <Route path="settings/review" element={<ReviewSettings />} />
              <Route path="settings/receipt" element={<ReceiptSettings />} />
              <Route path="settings/settings-notifications" element={<Notifications />} />
              <Route path="settings/notifications" element={<ViewNotifications />} />
              <Route path="settings/google-calendar" element={<GoogleCalendar />} />
              <Route path="settings/sms" element={<SMSSettings />} />
              <Route path="settings/social-media" element={<SocialMedia />} />
              <Route path="settings/chat-plugin" element={<ChatPlugin />} />
              <Route path="settings/cron-job" element={<CronJob />} />
              <Route path="settings/terms-and-condition" element={<TermsCondition />} />
              <Route path="settings/driver-contact" element={<DriverContact />} />

              {/* Widget / API */}
              <Route path="widget-api" element={<WidgetAPI />} />

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
    </LoadingProvider>
  );
}

export default App;
