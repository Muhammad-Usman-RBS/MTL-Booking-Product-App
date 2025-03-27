import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import sidebarItems from "../../../constants/sidebarItems";
import IMAGES from "../../../assets/images";
import useUIStore from "../../../store/useUIStore";

function Sidebar() {
  const location = useLocation();
  const isOpen = useUIStore((state) => state.isSidebarOpen);
  const [activeMain, setActiveMain] = useState(null);

  // Auto-set activeMain based on URL (on refresh or route change)
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
      className={`${
        isOpen ? "w-64" : "w-16"
      } min-w-[64px] bg-theme text-theme h-screen flex flex-col duration-300 overflow-y-auto`}
    >
      <div className="p-4 flex justify-center">
        <img
          src={isOpen ? IMAGES.dashboardLargeLogo : IMAGES.dashboardSmallLogo}
          alt="Logo"
          className={isOpen ? "h-12" : "w-full"}
        />
      </div>

      <ul className="flex flex-col mt-4">
        {sidebarItems.map((item, index) => {
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
                    className={`p-4 hover-theme flex items-center cursor-pointer ${
                      isOpen ? "justify-start pl-4" : "justify-center"
                    } ${isMainActive ? "active-theme" : ""}`}
                  >
                    <item.icon className="w-5 h-5" />
                    {isOpen && <span className="ml-3">{item.title}</span>}
                  </li>

                  {/* Sub Tabs */}
                  {isOpen && activeMain === index && (
                    <ul className="ml-8">
                      {item.subTabs.map((sub, subIndex) => (
                        <li key={subIndex}>
                          <Link
                            to={sub.route}
                            className={`flex items-center p-2 hover-theme ${
                              location.pathname === sub.route
                                ? "active-theme"
                                : ""
                            }`}
                          >
                            <sub.icon className="mr-2 w-4 h-4" />
                            <span>{sub.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                // No sub-tabs (e.g. Logout)
                <Link
                  to={item.route}
                  className={`p-4 hover-theme flex items-center cursor-pointer ${
                    isOpen ? "justify-start pl-4" : "justify-center"
                  } ${location.pathname === item.route ? "active-theme" : ""}`}
                >
                  <item.icon className="w-5 h-5" />
                  {isOpen && <span className="ml-3">{item.title}</span>}
                </Link>
              )}
            </div>
          );
        })}
      </ul>
    </div>
  );
}

export default Sidebar;
