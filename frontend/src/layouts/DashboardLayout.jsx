import React from "react";
import Sidebar from "../components/dashbaord/sidebar/Sidebar";
import Navbar from "../components/dashbaord/navbar/Navbar";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4">
            <Outlet />
          </main>
          <footer className="bg-theme text-theme text-sm p-4 border-t border-gray-300 text-center">
            © {new Date().getFullYear()} MTL Booking App. All rights reserved.
          </footer>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
