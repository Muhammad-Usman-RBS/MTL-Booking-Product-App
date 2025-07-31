import React, { useState } from "react";
import DashboardCustomers from "./DashboardCustomers";
import WidgetCustomers from "./WidgetCustomers";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";

const CustomersListTabs = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div>
      <OutletHeading name="Customer List" />
      <div className="flex flex-col items-center justify-center mb-6 space-y-4">
        <div className="flex">
          {[
            { label: "Dashboard Customers", key: "dashboard" },
            { label: "Widget Customers", key: "widget" },
          ].map((tab, index) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-2 font-semibold text-sm border cursor-pointer
                ${activeTab === tab.key
                  ? "bg-white text-[var(--main-color)] border-2 border-[var(--main-color)]"
                  : "bg-[#f9fafb] text-gray-700 border border-gray-300 hover:bg-gray-100"}
                ${index === 0 ? "rounded-l-md" : "rounded-r-md"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="w-full">
        {activeTab === "dashboard" && <DashboardCustomers />}
        {activeTab === "widget" && <WidgetCustomers />}
      </div>
    </div>
  );
};

export default CustomersListTabs;
