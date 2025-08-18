import React from "react";

const DriverStatCard = ({ title, value, icon, subtitle }) => (
  <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-medium text-[var(--dark-gray)]">{title}</h3>
      <div className="text-gray-800">{icon}</div>
    </div>
    <p className="text-2xl font-bold text-black">{value}</p>
    <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
  </div>
);
export default DriverStatCard;
