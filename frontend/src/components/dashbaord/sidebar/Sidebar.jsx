import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Icons from "../../../assets/icons";
import sidebarItems from "../../../constants/constantscomponents/sidebarItems";
import IMAGES from "../../../assets/images";
import useUIStore from "../../../store/useUIStore";

const Sidebar = () => {
  const location = useLocation();
  const isOpen = useUIStore((state) => state.isSidebarOpen);
  const [activeMain, setActiveMain] = useState(null);

  useEffect(() => {
    const activeIndex = sidebarItems.findIndex((item) =>
      item.subTabs?.some((sub) => location.pathname === sub.route)
    );
    setActiveMain(activeIndex !== -1 ? activeIndex : null);
  }, [location.pathname]);

  const handleToggle = (index) => {
    setActiveMain((prev) => (prev === index ? null : index));
  };

  return (
    <div
      className={`${isOpen ? "w-64" : "w-16"
        } min-w-[64px] bg-theme text-theme h-screen flex flex-col duration-300 overflow-y-auto`}
      style={{
        transition: "0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      }}
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
            {JSON.parse(localStorage.getItem("user"))?.fullName ||
              "Guest"}
          </p>
        </div>
      )}

      <ul className="flex flex-col mt-4">
        {(sidebarItems.filter((item) => {
          const user = JSON.parse(localStorage.getItem("user"));
          const role = user?.role;

          // Allow only these two tabs for superadmin
          if (role === "superadmin") {
            return (
              item.route === "/dashboard/home" ||
              item.route === "/dashboard/admin-list" ||
              item.route === "/dashboard/profile" ||
              item.route === "/dashboard/logout"
            );
          }

          return true; // Allow all for other roles
        })).map((item, index) => {

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
                      <Icons.ChevronDown
                        className={`w-4 h-4 transition-transform ${activeMain === index ? "rotate-180" : ""
                          }`}
                      />
                    )}
                  </li>

                  {/* Sub Tabs */}
                  {isOpen && activeMain === index && (
                    <ul className="ml-8">
                      {item.subTabs.map((sub, subIndex) => (
                        <li key={subIndex}>
                          <Link
                            to={sub.route}
                            className={`flex items-center p-2 hover-theme ${location.pathname === sub.route
                              ? "active-theme"
                              : ""
                              }`}
                          >
                            <sub.icon className="mr-2 w-4 h-4" />
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
