import React, { useEffect, useState } from "react";
import sidebarItems from "../../../constants/constantscomponents/sidebarItems";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import useUIStore from "../../../store/useUIStore";
import IMAGES from "../../../assets/images";

const Sidebar = () => {
  const location = useLocation();
  const isOpen = useUIStore((state) => state.isSidebarOpen);
  const [activeMain, setActiveMain] = useState(null);

  const user = useSelector((state) => state?.auth?.user);
  const permissions = user?.permissions || [];
  const userRole = user?.role;
  // Filter sidebarItems based on top-level permission and also filter subTabs based on sub-level permission
  const sidebarTabs = sidebarItems
    .map((item) => {
      if (
        !permissions
          .map((p) => p.toLowerCase())
          .includes(item.title.toLowerCase())
      )
        return null;

      // Filter subTabs if they exist
      let filteredSubTabs = item.subTabs?.filter((sub) => {
        if (sub.roles && sub.roles.length > 0) {
          return sub.roles.includes(userRole);
        }
        return true;
      });

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
      className={`${
        isOpen ? "w-64" : "w-16"
      } min-w-[64px] bg-theme text-theme h-screen flex flex-col duration-300 overflow-y-auto`}
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
            item.route === location.pathname ||
            item.subTabs?.some((sub) => sub.route === location.pathname);
          return (
            <div key={index}>
              {item.subTabs?.length > 0 ? (
                <>
                  <li
                    onClick={() => handleToggle(index)}
                    className={`p-4 hover-theme flex items-center justify-between cursor-pointer ${
                      isMainActive ? "active-theme" : ""
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
                        className={`w-4 h-4 transition-transform ${
                          activeMain === index ? "rotate-180" : ""
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
                            className={`flex items-center p-2 gap-3 hover-theme ${
                              sub.route === location.pathname
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
                  className={`p-4 hover-theme flex items-center cursor-pointer ${
                    isOpen ? "justify-start pl-4" : "justify-center"
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
