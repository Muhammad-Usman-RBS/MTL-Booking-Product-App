import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import IMAGES from "../../../assets/images";
import useUIStore from "../../../store/useUIStore";
import sidebarItems from "../../../constants/constantscomponents/sidebarItems";

const Sidebar = () => {
  const location = useLocation();
  const isOpen = useUIStore((state) => state.isSidebarOpen);
  const [activeMain, setActiveMain] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "";
  const permissions = user?.permissions || [];

  let sidebarTabs = [];

  if (role.toLowerCase() === "superadmin" && permissions.length === 0) {
    sidebarTabs = [...sidebarItems.filter(item => !["Profile", "Logout"].includes(item.title))];
  } else {
    sidebarTabs = permissions
      .map((key) => {
        const item = sidebarItems.find((tab) => tab.title.toLowerCase() === key.trim().toLowerCase());
        return item;
      })
      .filter((item) => item && !["Profile", "Logout"].includes(item.title));

    if (sidebarTabs.length === 0) {
      sidebarTabs = [sidebarItems.find(item => item.title === "Home")];
    } else {
      const hasHome = sidebarTabs.find(item => item.title === "Home");
      if (!hasHome) {
        const homeTab = sidebarItems.find(item => item.title === "Home");
        if (homeTab) sidebarTabs.unshift(homeTab);
      }
    }
  }

  const bottomTabs = sidebarItems.filter(item => ["Profile", "Logout"].includes(item.title));

  useEffect(() => {
    if (activeMain === null) {
      const activeIndex = sidebarTabs.findIndex((item) =>
        item.subTabs?.some((sub) => location.pathname === sub.route)
      );
      if (activeIndex !== -1) {
        setActiveMain(activeIndex);
      }
    }
  }, [location.pathname, sidebarTabs, activeMain]);

  const handleToggle = (index) => {
    setActiveMain((prev) => (prev === index ? null : index));
  };

  return (
    <div
      className={`${isOpen ? "w-64" : "w-16"} min-w-[64px] bg-theme text-theme h-screen flex flex-col duration-300 overflow-y-auto`}
      style={{ transition: "0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)" }}
    >
      <div className="p-4 flex justify-center">
        <img
          src={isOpen ? IMAGES.dashboardLargeLogo : IMAGES.dashboardSmallLogo}
          alt="Logo"
          className={isOpen ? "h-12" : "w-full"}
        />
      </div>

      {isOpen && (
        <div className="ps-7 pt-2 mt-[-8px] border-b pb-2 w-full bg-gray-300">
          <p className="text-sm text-[#1f2937] uppercase tracking-widest font-semibold">
            Welcome!
          </p>
          <p className="font-semibold text-[#1f2937] truncate">
            {user?.fullName || "Guest"}
          </p>
        </div>
      )}

      <ul className="flex flex-col mt-4">
        {sidebarTabs.map((item, index) => {
          const isMainActive =
            index === activeMain ||
            location.pathname === item.route ||
            item.subTabs?.some((sub) => location.pathname === sub.route);

          return (
            <div key={index}>
              {item.subTabs ? (
                <>
                  <li
                    onClick={() => handleToggle(index)}
                    className={`p-4 hover-theme flex items-center justify-between cursor-pointer ${isMainActive ? "active-theme" : ""} ${isOpen ? "pl-4 pr-3" : "justify-center"}`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      {isOpen && (
                        <span className="text-[15px]">{item.title}</span>
                      )}
                    </div>
                    {isOpen && (
                      <svg
                        className={`w-4 h-4 transition-transform ${activeMain === index ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    )}
                  </li>
                  {isOpen && activeMain === index && (
                    <ul className="ml-8">
                      {item.subTabs.map((sub, subIndex) => (
                        <li key={subIndex}>
                          <Link
                            to={sub.route}
                            className={`flex items-center p-2 gap-3 hover-theme ${location.pathname === sub.route ? "active-theme" : ""}`}
                          >
                            <sub.icon className="w-4 h-4" />
                            <span className="text-[15px]">{sub.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link
                  to={item.route}
                  className={`p-4 hover-theme flex items-center cursor-pointer ${isOpen ? "justify-start pl-4" : "justify-center"} ${location.pathname === item.route ? "active-theme" : ""}`}
                >
                  <item.icon className="w-4 h-4" />
                  {isOpen && (
                    <span className="ml-3 text-[15px]">{item.title}</span>
                  )}
                </Link>
              )}
            </div>
          );
        })}

        {bottomTabs.map((item, index) => (
          <Link
            key={index}
            to={item.route}
            className={`p-4 hover-theme flex items-center cursor-pointer ${isOpen ? "justify-start pl-4" : "justify-center"} ${location.pathname === item.route ? "active-theme" : ""}`}
          >
            <item.icon className="w-4 h-4" />
            {isOpen && (
              <span className="ml-3 text-[15px]">{item.title}</span>
            )}
          </Link>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;











// import React, { useEffect, useState } from "react";
// import { Link, useLocation } from "react-router-dom";
// import Icons from "../../../assets/icons";
// import sidebarItems from "../../../constants/constantscomponents/sidebarItems";
// import IMAGES from "../../../assets/images";
// import useUIStore from "../../../store/useUIStore";

// const Sidebar = () => {
//   const location = useLocation();
//   const isOpen = useUIStore((state) => state.isSidebarOpen);
//   const [activeMain, setActiveMain] = useState(null);

//   const user = JSON.parse(localStorage.getItem("user"));
//   const role = user?.role;

//   // NEW RULES: Define sidebar routes allowed for each role
//   const ROLE_ALLOWED_ROUTES = {
//     superadmin: [
//       "/dashboard/home",
//       "/dashboard/admin-list",
//       "/dashboard/company-accounts/list",
//       "/dashboard/company-accounts/new",
//       "/dashboard/company-accounts/edit/:id",
//       "/dashboard/profile",
//       "/dashboard/logout",
//     ],
//     clientadmin: [
//       "/dashboard/home",
//       "/dashboard/admin-list",
//       "/dashboard/company-accounts/list",
//       "/dashboard/company-accounts/new",
//       "/dashboard/company-accounts/edit/:id",
//       "/dashboard/profile",
//       "/dashboard/logout",
//     ],
//     associateadmin: [
//       "/dashboard/home",
//       "/dashboard/admin-list",
//       "/dashboard/company-accounts/list",
//       "/dashboard/company-accounts/new",
//       "/dashboard/company-accounts/edit/:id",
//       "/dashboard/profile",
//       "/dashboard/logout",
//     ],
//     demo: [
//       "/dashboard/home",
//       "/dashboard/admin-list",
//       "/dashboard/profile",
//       "/dashboard/logout",
//       "/dashboard/bookings/list",
//       "/dashboard/bookings/new",
//       "/dashboard/invoices/list",
//       "/dashboard/invoices/new",
//       "/dashboard/invoices/edit",
//       "/dashboard/drivers/list",
//       "/dashboard/drivers/new",
//       "/dashboard/drivers/config",
//       "/dashboard/customers/list",
//       "/dashboard/company-accounts/list",
//       "/dashboard/company-accounts/new",
//       "/dashboard/pricing/general",
//       "/dashboard/pricing/vehicle",
//       "/dashboard/pricing/hourly-packages",
//       "/dashboard/pricing/location-category",
//       "/dashboard/pricing/fixed",
//       "/dashboard/pricing/distance-slab",
//       "/dashboard/pricing/driver-fare",
//       "/dashboard/pricing/congestion",
//       "/dashboard/pricing/discounts-date",
//       "/dashboard/pricing/discounts-location",
//       "/dashboard/pricing/vouchers",
//       "/dashboard/settings/general",
//       "/dashboard/settings/booking",
//       "/dashboard/settings/email",
//       "/dashboard/settings/location-category",
//       "/dashboard/settings/locations",
//       "/dashboard/settings/zones",
//       "/dashboard/settings/coverage",
//       "/dashboard/settings/payment-options",
//       "/dashboard/settings/booking-restriction-date",
//       "/dashboard/settings/review",
//       "/dashboard/settings/receipt",
//       "/dashboard/settings/notifications",
//       "/dashboard/settings/google-calendar",
//       "/dashboard/settings/sms",
//       "/dashboard/settings/social-media",
//       "/dashboard/settings/chat-plugin",
//       "/dashboard/settings/cron-job",
//       "/dashboard/widget-api",
//       "/dashboard/statements/driver",
//       "/dashboard/statements/payments"
//     ],
//     manager: [
//       "/dashboard/home",
//       "/dashboard/admin-list",
//       "/dashboard/profile",
//       "/dashboard/logout",
//     ],
//   };

//   const allowedRoutes = ROLE_ALLOWED_ROUTES[role];

//   const filteredSidebarItems = sidebarItems.filter((item) => {
//     if (!allowedRoutes) return false; // if no rules found, hide everything

//     if (item.subTabs && item.subTabs.length > 0) {
//       // Parent route with sub-tabs (Bookings, Drivers, etc.)
//       const subRoutesAllowed = item.subTabs.some((sub) =>
//         allowedRoutes.includes(sub.route)
//       );
//       return subRoutesAllowed;
//     } else {
//       // Simple single route (Home, Users, Profile, etc.)
//       return allowedRoutes.includes(item.route);
//     }
//   });

//   useEffect(() => {
//     const activeIndex = sidebarItems.findIndex((item) =>
//       item.subTabs?.some((sub) => location.pathname === sub.route)
//     );
//     setActiveMain(activeIndex !== -1 ? activeIndex : null);
//   }, [location.pathname]);

//   const handleToggle = (index) => {
//     setActiveMain((prev) => (prev === index ? null : index));
//   };

//   return (
//     <div
//       className={`${isOpen ? "w-64" : "w-16"} min-w-[64px] bg-theme text-theme h-screen flex flex-col duration-300 overflow-y-auto`}
//       style={{ transition: "0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)" }}
//     >
//       {/* Logo */}
//       <div className="p-4 flex justify-center">
//         <img
//           src={isOpen ? IMAGES.dashboardLargeLogo : IMAGES.dashboardSmallLogo}
//           alt="Logo"
//           className={isOpen ? "h-12" : "w-full"}
//         />
//       </div>

//       {/* User Info */}
//       {isOpen && (
//         <div className="ps-7 pt-2 mt-[-8px] border-b pb-2 w-full bg-gray-300">
//           <p className="text-sm text-[#1f2937] uppercase tracking-widest font-semibold">
//             Welcome!
//           </p>
//           <p className="font-semibold text-[#1f2937] truncate">
//             {user?.fullName || "Guest"}
//           </p>
//         </div>
//       )}

//       {/* Sidebar Links */}
//       <ul className="flex flex-col mt-4">
//         {filteredSidebarItems.map((item, index) => {
//           const isMainActive =
//             index === activeMain ||
//             location.pathname === item.route ||
//             item.subTabs?.some((sub) => location.pathname === sub.route);

//           return (
//             <div key={index}>
//               {item.subTabs ? (
//                 <>
//                   <li
//                     onClick={() => handleToggle(index)}
//                     className={`p-4 hover-theme flex items-center justify-between cursor-pointer ${isMainActive ? "active-theme" : ""
//                       } ${isOpen ? "pl-4 pr-3" : "justify-center"}`}
//                   >
//                     <div className="flex items-center gap-3">
//                       <item.icon className="w-4 h-4" />
//                       {isOpen && (
//                         <span className="text-[15px]">{item.title}</span>
//                       )}
//                     </div>
//                     {isOpen && (
//                       <Icons.ChevronDown
//                         className={`w-4 h-4 transition-transform ${activeMain === index ? "rotate-180" : ""
//                           }`}
//                       />
//                     )}
//                   </li>

//                   {/* Sub Tabs */}
//                   {isOpen && activeMain === index && (
//                     <ul className="ml-8">
//                       {item.subTabs
//                         .filter((sub) => allowedRoutes.includes(sub.route)) // only allowed subtabs
//                         .map((sub, subIndex) => (
//                           <li key={subIndex}>
//                             <Link
//                               to={sub.route}
//                               className={`flex items-center p-2 hover-theme ${location.pathname === sub.route
//                                 ? "active-theme"
//                                 : ""
//                                 }`}
//                             >
//                               <sub.icon className="mr-2 w-4 h-4" />
//                               <span className="text-[15px]">{sub.title}</span>
//                             </Link>
//                           </li>
//                         ))}
//                     </ul>
//                   )}
//                 </>
//               ) : (
//                 <Link
//                   to={item.route}
//                   className={`p-4 hover-theme flex items-center cursor-pointer ${isOpen ? "justify-start pl-4" : "justify-center"
//                     } ${location.pathname === item.route ? "active-theme" : ""}`}
//                 >
//                   <item.icon className="w-4 h-4" />
//                   {isOpen && (
//                     <span className="ml-3 text-[15px]">{item.title}</span>
//                   )}
//                 </Link>
//               )}
//             </div>
//           );
//         })}
//       </ul>
//     </div>
//   );
// };

// export default Sidebar;
