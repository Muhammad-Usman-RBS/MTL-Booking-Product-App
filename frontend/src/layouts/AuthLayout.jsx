import React from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import Icons from "../assets/icons";

const AuthLayout = () => {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();
  const currentPath = location.pathname;

  if (user && currentPath === "/login") {
    return <Navigate to="/dashboard/home" replace />
  }

  let title = "Welcome";
  if (location.pathname === "/login") title = "Dashboard Login";
  else if (location.pathname === "/forgot-password") title = "Forgot Password";
  else if (location.pathname === "/new-password") title = "Reset Password";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-center text-2xl font-bold mb-6 text-gray-800">
          {title}
        </h2>

        <Outlet />

        <div className="text-center mt-6">
          <div className="flex items-center justify-center gap-2 text-gray-800">
            <Icons.CarFront className="w-5 h-5" />
            <span className="text-xl font-semibold uppercase">
              MTL Booking App
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            © 2025 All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
