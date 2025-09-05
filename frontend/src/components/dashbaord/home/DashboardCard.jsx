import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useGetAllUsersQuery } from "../../../redux/api/adminApi";
import { useGetAllBookingsQuery } from "../../../redux/api/bookingApi";

const DashboardCard = () => {
  const user = useSelector((state) => state?.auth?.user);

  // Queries
  const { data: AllBookings } = useGetAllBookingsQuery(user?.companyId, {
    skip: !user?.companyId,
  });
  const { data: AllUsers, refetch } = useGetAllUsersQuery();

  // Filters
  const filteredClientAdmin = AllUsers?.filter((u) => u?.role === "clientadmin");
  const managerRoles = AllUsers?.filter((u) => u?.role === "manager");
  const associateAdminRoles = AllUsers?.filter((u) => u?.role === "associateadmin");
  const demoRoles = AllUsers?.filter((u) => u?.role === "demo");
  const customerRoles = AllUsers?.filter((u) => u?.role === "customer");
  const driverRoles = AllUsers?.filter((u) => u?.role === "driver");
  const staffMemberRoles = AllUsers?.filter((u) => u?.role === "staffmember");

  // Filtration by companyId
  const filteredDriver = driverRoles?.filter((u) => u?.companyId === user?.companyId);
  const filteredAssociateAdmin = associateAdminRoles?.filter((u) => u?.companyId === user?.companyId);
  const filteredStaffMembers = staffMemberRoles?.filter((u) => u?.companyId === user?.companyId);

  // Dynamic card data from real values
  const cardData = [
    {
      title: "Total Bookings",
      value: AllBookings?.length || 0,
      gradient: "linear-gradient(135deg, #ff9a9e, #fad0c4)",
      icon: "📑",
    },
    {
      title: "Total Customers",
      value: customerRoles?.length || 0,
      gradient: "linear-gradient(135deg, #6a11cb, #2575fc)",
      icon: "👥",
    },
    {
      title: "Total Drivers",
      value: filteredDriver?.length || 0,
      gradient: "linear-gradient(135deg, #11998e, #38ef7d)",
      icon: "🚖",
    },
    {
      title: "Total Managers",
      value: managerRoles?.length || 0,
      gradient: "linear-gradient(135deg, #f7971e, #ffd200)",
      icon: "🧑‍💼",
    },
    {
      title: "Total Staff Members",
      value: filteredStaffMembers?.length || 0,
      gradient: "linear-gradient(135deg, #36d1dc, #5b86e5)",
      icon: "🛠️",
    },
    {
      title: "Total Associate Admins",
      value: filteredAssociateAdmin?.length || 0,
      gradient: "linear-gradient(135deg, #ff9966, #ff5e62)",
      icon: "📊",
    },
    {
      title: "Total Client Admins",
      value: filteredClientAdmin?.length || 0,
      gradient: "linear-gradient(135deg, #00b09b, #96c93d)",
      icon: "🏢",
    },
    {
      title: "Total Demos",
      value: demoRoles?.length || 0,
      gradient: "linear-gradient(135deg, #fc6076, #ff9a44)",
      icon: "🧪",
    },
  ];

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
      {cardData.map((card, index) => (
        <div
          key={index}
          className="relative rounded-2xl p-6 text-white shadow-lg overflow-hidden"
          style={{
            background: card.gradient,
          }}
        >
          {/* Gradient overlay for depth */}
          <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>

          {/* Icon top-right inside glass circle */}
          <div className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center 
                      bg-white/20 rounded-full shadow-md text-2xl">
            {card.icon}
          </div>

          {/* Title */}
          <p className="text-lg font-semibold tracking-wide relative z-10">
            {card.title}
          </p>

          {/* Value */}
          <p className="text-4xl font-extrabold mt-3 relative z-10">
            {card.value}
          </p>

          {/* Status */}
          <p
            className={`mt-2 text-sm font-medium relative z-10 ${card.status?.includes("Decreased") ? "text-red-200" : "text-green-200"
              }`}
          >
            {card.status}
          </p>

          {/* Decorative blurred circles */}
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCard;