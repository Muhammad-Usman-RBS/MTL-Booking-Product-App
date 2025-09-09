import React, { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useGetAllUsersQuery } from "../../../redux/api/adminApi";
import { useGetAllBookingsQuery } from "../../../redux/api/bookingApi";

const nf = new Intl.NumberFormat();

const RoleCards = () => {
  const user = useSelector((state) => state?.auth?.user);

  const { data: AllBookings } = useGetAllBookingsQuery(user?.companyId, {
    skip: !user?.companyId,
  });
  const { data: AllUsers, refetch, isFetching } = useGetAllUsersQuery();

  const filteredClientAdmin = AllUsers?.filter((u) => u?.role === "clientadmin") ?? [];
  const associateAdminRoles = AllUsers?.filter((u) => u?.role === "associateadmin") ?? [];
  const demoRoles = AllUsers?.filter((u) => u?.role === "demo") ?? [];
  const customerRoles = AllUsers?.filter((u) => u?.role === "customer") ?? [];
  const driverRoles = AllUsers?.filter((u) => u?.role === "driver") ?? [];
  const staffMemberRoles = AllUsers?.filter((u) => u?.role === "staffmember") ?? [];

  const filteredDriver = driverRoles?.filter((u) => u?.companyId === user?.companyId) ?? [];
  const filteredAssociateAdmin = associateAdminRoles?.filter((u) => u?.companyId === user?.companyId) ?? [];
  const filteredStaffMembers = staffMemberRoles?.filter((u) => u?.companyId === user?.companyId) ?? [];

  const cardData = useMemo(() => ([
    { title: "Total Bookings", value: AllBookings?.length || 0, gradient: "linear-gradient(135deg, #ff9a9e, #fad0c4)", icon: "📑" },
    { title: "Total Customers", value: customerRoles?.length || 0, gradient: "linear-gradient(135deg, #6a11cb, #2575fc)", icon: "👥" },
    { title: "Total Drivers", value: filteredDriver?.length || 0, gradient: "linear-gradient(135deg, #11998e, #38ef7d)", icon: "🚖" },
    { title: "Total Staff Members", value: filteredStaffMembers?.length || 0, gradient: "linear-gradient(135deg, #36d1dc, #5b86e5)", icon: "🛠️" },
    { title: "Total Associate Admins", value: filteredAssociateAdmin?.length || 0, gradient: "linear-gradient(135deg, #ff9966, #ff5e62)", icon: "📊" },
    { title: "Total Client Admins", value: filteredClientAdmin?.length || 0, gradient: "linear-gradient(135deg, #00b09b, #96c93d)", icon: "🏢" },
    { title: "Total Demos", value: demoRoles?.length || 0, gradient: "linear-gradient(135deg, #fc6076, #ff9a44)", icon: "🧪" },
  ]), [
    AllBookings?.length, customerRoles?.length, filteredDriver?.length,
    filteredStaffMembers?.length, filteredAssociateAdmin?.length,
    filteredClientAdmin?.length, demoRoles?.length
  ]);

  useEffect(() => {
    refetch();
  }, [refetch, user?.companyId]);

  return (
    <section className="w-full">
      <div className="mx-auto max-w-screen-2xl">
        {/* FIXED DESKTOP: 1 → 2 → 3 columns (no 4/5 on xl/2xl) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
          {(isFetching ? Array.from({ length: 5 }).map((_, i) => ({ skeleton: true, id: i })) : cardData).map((card, index) =>
            card.skeleton ? (
              <div key={`s-${index}`} className="h-32 animate-pulse rounded-2xl bg-slate-200/70" />
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
                {/* Slightly smaller on desktop than before so spacing breathes */}
                <p className="relative z-10 mt-2 text-3xl font-extrabold leading-none sm:mt-3 sm:text-4xl">
                  {nf.format(card.value)}
                </p>
                <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
              </article>
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default RoleCards;
