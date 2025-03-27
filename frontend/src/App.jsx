import React from "react";
import { Routes, Route } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import NewPassword from "./pages/auth/NewPassword";
import DashboardLayout from "./layouts/DashboardLayout";
import NotFound from "./pages/emptypages/NotFound";

import Dashboard from "./components/dashbaord/Dashboard";
import SubTab1 from "./components/dashbaord/SubTab1";
import SubTab2 from "./components/dashbaord/SubTab2";
import GeneralSettings from "./components/dashbaord/settings/GeneralSettings";
import SecuritySettings from "./components/dashbaord/settings/SecuritySettings";
import EditProfile from "./components/dashbaord/profile/EditProfile";
import AccountSettings from "./components/dashbaord/profile/AccountSettings";
import Logout from "./components/dashbaord/Logout";

// React Toastify
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
        <Route index element={<Dashboard />} />
        <Route path="sub1" element={<SubTab1 />} />
        <Route path="sub2" element={<SubTab2 />} />
        <Route path="settings/general" element={<GeneralSettings />} />
        <Route path="settings/security" element={<SecuritySettings />} />
        <Route path="profile/edit" element={<EditProfile />} />
        <Route path="profile/account" element={<AccountSettings />} />
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