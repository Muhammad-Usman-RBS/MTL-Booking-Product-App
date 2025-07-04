import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useGetAllUsersQuery } from "../../../redux/api/adminApi";
import { useGetAllBookingsQuery } from "../../../redux/api/bookingApi";


const COLORS = ["#4ade80", "#facc15", "#f87171"];

const SuperAdminCard = () => {
  const user = useSelector((state) => state?.auth?.user);
  const {data: AllBookings} = useGetAllBookingsQuery(user?.companyId , {skip: !user?.companyId})
  const { data: AllUsers , refetch } = useGetAllUsersQuery( );
  const filteredClientAdmin = AllUsers?.filter(
    (user) => user?.role === "clientadmin"
  );

  const managerRoles = AllUsers?.filter((user) => user?.role === "manager");
  const AssociateAdminRoles = AllUsers?.filter(
    (user) => user?.role === "associateadmin"
  );
  const demoRoles = AllUsers?.filter((user) => user?.role === "demo");
  const customerRoles = AllUsers?.filter((user) => user?.role === "customer");
  const driverRoles = AllUsers?.filter((user) => user?.role === "driver");
  const staffmemberRoles = AllUsers?.filter(
    (user) => user?.role === "staffmember"
  );
  //filtration based on companyId
  const filteredDriver = driverRoles?.filter(
    (users) => users?.companyId === user?.companyId
  );
  const filteredAssociateAdmin = AssociateAdminRoles?.filter(
    (users) => users?.companyId === user?.companyId
  );
  const filteredStaffMembers = staffmemberRoles?.filter(
    (users) => users?.companyId === user?.companyId
  );

  const pieData = [
    { name: "Completed", value:  100} ,
    { name: "On Route", value: 100 },
    { name: "Cancelled", value: 100 },
  ];
  const cardData = [
    {
      title: "Total Client Admins",
      value: filteredClientAdmin?.length || 0,
      color: "bg-purple-100",
      role: ["superadmin"],
    },
    {
      title: "Total Staff Members",
      value: filteredStaffMembers?.length || 0,
      color: "bg-purple-100",
      role: ["clientadmin", "manager", "associateadmin"],
    },
    {
      title: "Total Drivers",
      value: filteredDriver?.length || 0,
      color: "bg-purple-100",
      role: ["clientadmin", "manager"],
    },
    {
      title: "Total Associate Admins",
      value: filteredAssociateAdmin?.length || 0,
      color: "bg-pink-100",
      role: ["clientadmin"],
    },
    {
      title: "Total Managers",
      value: managerRoles?.length || 0,
      color: "bg-green-100",
      role: ["superadmin", "clientadmin"],
    },
    {
      title: "Total Customers",
      value: customerRoles?.length || 0,
      color: "bg-teal-100",
      role: ["clientadmin", "manager"],
    },
    {
      title: "Total Demos",
      value: demoRoles?.length || 0,
      color: "bg-rose-100",
      role: ["superadmin"],
    },
  ];
  const filteredCardData = cardData.filter((card) => {
    if (!card.role) return true;
    return card.role.includes(user?.role);
  });
  useEffect(()=> {
    refetch();

  } , [refetch]);
  return (
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredCardData.map((card, index) => (
          <div
          key={index}
            className={`${card.color} rounded-lg p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition`}
          >
         <p className="text-sm text-gray-700 break-words text-center">{card.title}</p>
         <p className="text-xl font-bold text-gray-900 mt-1 text-center">{card.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-md p-4 w-full">
      <span className="text-gray-800 lg:text-md text-sm font-semibold">Rides Status</span>
      <ResponsiveContainer width="100%" height={250}>
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

export default SuperAdminCard;
