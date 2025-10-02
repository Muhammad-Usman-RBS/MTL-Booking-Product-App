import React, { useEffect, useState } from "react";
import sidebarItems from "../../../constants/constantscomponents/sidebarItems";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import useUIStore from "../../../store/useUIStore";
import IMAGES from "../../../assets/images";
import { useGetCompanyByIdQuery } from "../../../redux/api/companyApi";

const Sidebar = () => {
  const location = useLocation();
  const isOpen = useUIStore((state) => state.isSidebarOpen);
  const [activeMain, setActiveMain] = useState(null);

  const user = useSelector((state) => state?.auth?.user);
  const permissions = user?.permissions || [];
  const userRole = user?.role;

  // Fetch company info
  const { data: companyData } = useGetCompanyByIdQuery(user?.companyId || user?.clientAdminId, {
    skip: !user?.companyId && !user?.clientAdminId, // skip if not available
  });

  const companyLogo = companyData?.profileImage;

  // Filter sidebarItems based on top-level permission and also filter subTabs based on sub-level permission
  const sidebarTabs = sidebarItems
    .map((item) => {
      const hasPermission =
        permissions.map((p) => p.toLowerCase()).includes(item.title.toLowerCase());

      const hasRole =
        !item.roles || item.roles.length === 0 || item.roles.includes(userRole);

      // If either permission or role is missing, skip this tab
      if (!hasPermission || !hasRole) return null;

      // Filter subTabs with role check
      const filteredSubTabs = item.subTabs?.filter((sub) => {
        const subHasRole =
          !sub.roles || sub.roles.length === 0 || sub.roles.includes(userRole);
        return subHasRole;
      });

      // If it has subTabs but all were filtered out, don't show the tab
      if (item.subTabs && filteredSubTabs.length === 0) return null;

      return {
        ...item,
        subTabs: filteredSubTabs,
      };
    })
    .filter(Boolean);

  useEffect(() => {
    const index = sidebarTabs.findIndex((item) =>
      item.subTabs?.some((sub) => sub.route === location.pathname)
    );
    setActiveMain(index !== -1 ? index : null);
  }, [location.pathname]);

  const handleToggle = (index) => {
    setActiveMain((prev) => (prev === index ? null : index));
  };

  return (
    <div
      className={`${isOpen ? "w-64" : "w-16"
        } min-w-[64px] bg-theme text-theme h-screen flex flex-col duration-300 overflow-y-auto`}
      style={{ transition: "0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)" }}
    >
      <div
        className={`p-1 flex items-center gap-3 transition-all duration-300 group cursor-pointer 
    ${isOpen ? "pt-4 pb-4" : "pt-2 pb-2"}`}
      >
        <div className="grid place-items-center">
          {/* Animated gradient background */}
          <div className="col-start-1 row-start-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl opacity-75 blur-xl group-hover:opacity-100 transition duration-500 animate-pulse scale-125"></div>

          {/* Logo container */}
          <div className={`col-start-1 row-start-1 z-10 ${isOpen ? "ps-2" : "ps-0"}`}>
            <img
              src={companyLogo}
              alt="Company Logo"
              className="h-18 w-18 object-contain drop-shadow-2xl"
            />
          </div>
        </div>

        {isOpen && (
          <div className="flex flex-col gap-1 animate-slideIn">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 font-black text-sm leading-tight tracking-widest line-clamp-2 drop-shadow-[0_0_10px_rgba(147,51,234,0.5)]">
              {(companyData?.companyName || "Your Company").toUpperCase()}
            </span>

            {/* Animated underline */}
            <div className="h-1 w-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full overflow-hidden">
              <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer -translate-x-full"></div>
            </div>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="ps-4 pt-2 mt-[-8px] border-b pb-2 w-full bg-gray-300">
          <p className="text-sm text-[#1f2937] uppercase tracking-widest font-semibold">
            Welcome!
          </p>
          <p className="font-semibold text-[#1f2937] truncate">
            {user?.fullName.split(" ").map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(" ") || "Guest"}
          </p>
        </div>
      )}

      <ul className="flex flex-col mt-4">
        {sidebarTabs.map((item, index) => {
          const isMainActive =
            index === activeMain ||
            item.route === location.pathname ||
            item.subTabs?.some((sub) => sub.route === location.pathname);
          return (
            <div key={index}>
              {item.subTabs?.length > 0 ? (
                <>
                  <li
                    onClick={() => handleToggle(index)}
                    className={`p-4 hover-theme flex items-center justify-between cursor-pointer ${isMainActive ? "active-theme" : ""
                      } ${isOpen ? "pl-4 pr-3" : "justify-center"}`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      {isOpen && (
                        <span className="text-[15px]">{item.title}</span>
                      )}
                    </div>
                    {isOpen && (
                      <svg
                        className={`w-4 h-4 transition-transform ${activeMain === index ? "rotate-180" : ""
                          }`}
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
                            className={`flex items-center p-2 gap-3 hover-theme ${sub.route === location.pathname
                              ? "active-theme"
                              : ""
                              }`}
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
                  className={`p-4 hover-theme flex items-center cursor-pointer ${isOpen ? "justify-start pl-4" : "justify-center"
                    } ${location.pathname === item.route ? "active-theme" : ""}`}
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
      </ul>
    </div>
  );
};

export default Sidebar;
