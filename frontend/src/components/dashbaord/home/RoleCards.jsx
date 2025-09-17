import React, { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useGetAllUsersQuery } from "../../../redux/api/adminApi";
import { useGetAllBookingsQuery } from "../../../redux/api/bookingApi";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const nf = new Intl.NumberFormat();

const RoleCards = () => {
  const user = useSelector((state) => state?.auth?.user);

  const { data: AllBookingsResponse } = useGetAllBookingsQuery(user?.companyId, {
    skip: !user?.companyId,
  });

  const AllBookings = AllBookingsResponse?.data ?? [];

  const { data: AllUsers, refetch, isFetching } = useGetAllUsersQuery();

  // Role filters
  const filteredClientAdmin = AllUsers?.filter((u) => u?.role === "clientadmin") ?? [];
  const associateAdminRoles = AllUsers?.filter((u) => u?.role === "associateadmin") ?? [];
  const demoRoles = AllUsers?.filter((u) => u?.role === "demo") ?? [];
  const customerRoles = AllUsers?.filter((u) => u?.role === "customer") ?? [];
  const driverRoles = AllUsers?.filter((u) => u?.role === "driver") ?? [];
  const staffMemberRoles = AllUsers?.filter((u) => u?.role === "staffmember") ?? [];

  const filteredDriver = driverRoles?.filter((u) => u?.companyId === user?.companyId) ?? [];
  const filteredAssociateAdmin = associateAdminRoles?.filter((u) => u?.companyId === user?.companyId) ?? [];
  const filteredStaffMembers = staffMemberRoles?.filter((u) => u?.companyId === user?.companyId) ?? [];

  // Driver-specific metrics
  const driverBookings = AllBookings.filter(
    (b) => b?.driverId === user?._id && b?.status?.toLowerCase() === "completed"
  );

  const totalDriverEarnings = driverBookings.reduce(
    (sum, b) => sum + (b?.fare || 0),
    0
  );

  const totalDriverRides = driverBookings.length;

  // Group driver earnings by month
  const earningsByMonth = driverBookings.reduce((acc, b) => {
    const month = new Date(b?.createdAt).toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    acc[month] = (acc[month] || 0) + (b?.fare || 0);
    return acc;
  }, {});

  let earningsData = Object.entries(earningsByMonth).map(([month, total]) => ({
    month,
    earnings: total,
  }));

  // Sort earningsData by date order (Jan -> Dec)
  earningsData = earningsData.sort(
    (a, b) => new Date(a.month) - new Date(b.month)
  );

  // Debugging logs
  useEffect(() => {
    // console.log("Driver Bookings:", driverBookings);
    // console.log("Earnings Data:", earningsData);
  }, [driverBookings, earningsData]);

  // All cards
  const cardData = useMemo(
    () => [
      { title: "Total Bookings", value: AllBookings?.length || 0, gradient: "linear-gradient(135deg, #ff9a9e, #fad0c4)", icon: "📑" },
      { title: "Total Customers", value: customerRoles?.length || 0, gradient: "linear-gradient(135deg, #6a11cb, #2575fc)", icon: "👥" },
      { title: "Total Drivers", value: filteredDriver?.length || 0, gradient: "linear-gradient(135deg, #11998e, #38ef7d)", icon: "🚖" },
      { title: "Total Staff Members", value: filteredStaffMembers?.length || 0, gradient: "linear-gradient(135deg, #36d1dc, #5b86e5)", icon: "🛠️" },
      { title: "Total Associate Admins", value: filteredAssociateAdmin?.length || 0, gradient: "linear-gradient(135deg, #ff9966, #ff5e62)", icon: "📊" },
      { title: "Total Client Admins", value: filteredClientAdmin?.length || 0, gradient: "linear-gradient(135deg, #00b09b, #96c93d)", icon: "🏢" },
      { title: "Total Demos", value: demoRoles?.length || 0, gradient: "linear-gradient(135deg, #fc6076, #ff9a44)", icon: "🧪" },
      { title: "Total Earnings", value: totalDriverEarnings, gradient: "linear-gradient(135deg, #f7971e, #ffd200)", icon: "💰" },
      { title: "Total Rides", value: totalDriverRides, gradient: "linear-gradient(135deg, #00c6ff, #0072ff)", icon: "🛣️" },
    ],
    [
      AllBookings?.length,
      customerRoles?.length,
      filteredDriver?.length,
      filteredStaffMembers?.length,
      filteredAssociateAdmin?.length,
      filteredClientAdmin?.length,
      demoRoles?.length,
      totalDriverEarnings,
      totalDriverRides,
    ]
  );

  // Role-based visibility
  const roleVisibility = {
    superadmin: [
      "Total Bookings",
      "Total Customers",
      "Total Drivers",
      "Total Client Admins",
      "Total Associate Admins",
      "Total Demos",
      "Total Staff Members",
    ],
    clientadmin: [
      "Total Bookings",
      "Total Customers",
      "Total Drivers",
      "Total Associate Admins",
      "Total Staff Members",
    ],
    associateadmin: [
      "Total Bookings",
      "Total Customers",
      "Total Drivers",
      "Total Staff Members",
    ],
    driver: ["Total Bookings", "Total Earnings", "Total Rides"],
    customer: ["Total Bookings"],
    corporatecustomer: ["Total Bookings"],
  };

  const visibleCards = cardData.filter((card) =>
    roleVisibility[user?.role?.toLowerCase()]?.includes(card.title)
  );

  useEffect(() => {
    refetch();
  }, [refetch, user?.companyId]);

  return (
    <section className="w-full">
      <div className="mx-auto max-w-screen-2xl">
        {/* Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
          {(isFetching
            ? Array.from({ length: 5 }).map((_, i) => ({
              skeleton: true,
              id: i,
            }))
            : visibleCards
          ).map((card, index) =>
            card.skeleton ? (
              <div
                key={`s-${index}`}
                className="h-32 animate-pulse rounded-2xl bg-slate-200/70"
              />
            ) : (
              <article
                key={index}
                className="relative overflow-hidden rounded-xl p-4 sm:p-5 md:p-6 text-white shadow-lg focus-within:ring-2 focus-within:ring-white/40"
                style={{ background: card.gradient }}
                role="region"
                aria-label={card.title}
                tabIndex={0}
              >
                <div className="pointer-events-none absolute inset-0 bg-white/10 mix-blend-overlay" />
                <div className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-xl shadow-md sm:h-11 sm:w-11 sm:text-2xl">
                  {card.icon}
                </div>
                <p className="relative z-10 line-clamp-2 pr-14 text-base font-semibold tracking-wide sm:text-lg">
                  {card.title}
                </p>
                <p className="relative z-10 mt-2 text-3xl font-extrabold leading-none sm:mt-3 sm:text-4xl">
                  {nf.format(card.value)}
                </p>
              </article>
            )
          )}
        </div>

        {/* Earnings Graph for Drivers */}
        {user?.role?.toLowerCase()?.includes("driver") && (
          <div className="mt-10 rounded-xl bg-white p-5 shadow-lg">
            <h2 className="mb-4 text-lg font-bold text-gray-800">
              Monthly Earnings
            </h2>

            {earningsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={earningsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(val) => `£${nf.format(val)}`} />
                  <Bar dataKey="earnings" fill="#f7971e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-10">
                No completed bookings found to show earnings.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default RoleCards;
