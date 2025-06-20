import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const pieData = [
  { name: "Total Companies", value: 100 },
  { name: "Total Drivers", value: 100 },
  { name: "Total Customers", value: 100 },
];

const COLORS = ["#4ade80", "#facc15", "#f87171"]; // Green, Yellow, Red

const SuperAdminCard = () => {
  const dummyStats = {
    totalSuperAdmin: 1,
    totalClientAdmins: 12,
    totalAssociateAdmins: 24,
    totalManagers: 8,
    totalCustomers: 890,
    totalDemos: 3,
  };

  const cardData = [
    {
      title: "Super Admin",
      value: dummyStats.totalSuperAdmin,
      color: "bg-indigo-100",
    },
    {
      title: "Total Client Admins",
      value: dummyStats.totalClientAdmins,
      color: "bg-purple-100",
    },
    {
      title: "Total Associate Admins",
      value: dummyStats.totalAssociateAdmins,
      color: "bg-pink-100",
    },
    {
      title: "Total Managers",
      value: dummyStats.totalManagers,
      color: "bg-green-100",
    },
    {
      title: "Total Customers",
      value: dummyStats.totalCustomers,
      color: "bg-teal-100",
    },
    {
      title: "Total Demos",
      value: dummyStats.totalDemos,
      color: "bg-rose-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
        {cardData.map((card, index) => (
          <Card
            key={index}
            title={card.title}
            value={card.value}
            color={card.color}
          />
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-md p-4">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              fill="#8884d8"
              label
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const Card = ({ title, value, color }) => (
  <div
    className={`${color} rounded-lg p-4 text-center shadow-sm hover:shadow-md transition`}
  >
    <p className="text-sm text-gray-700">{title}</p>
    <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
  </div>
);

export default SuperAdminCard;
