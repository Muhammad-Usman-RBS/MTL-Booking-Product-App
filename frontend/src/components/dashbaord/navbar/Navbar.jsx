import React, { useState } from "react";
import { Link } from "react-router-dom";
import Icons from "../../../assets/icons";
import useUIStore from "../../../store/useUIStore";
import Images from "../../../assets/images";
import CustomModal from "../../../constants/constantscomponents/CustomModal";

const themes = [
  {
    value: "theme-dark-1",
    bg: "#22333B",
    text: "#F1EFEF",
    hoverActive: "#930000",
  },
  {
    value: "theme-light-1",
    bg: "#cfe2e3",
    text: "#1E1E1E",
    hoverActive: "#a5d8dd",
  },
  {
    value: "custom",
    bg: "#ffffff",
    text: "#000000",
    hoverActive: "#F7BE7E",
  },
];

function Navbar() {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const setTheme = useUIStore((state) => state.setTheme);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [customTheme, setCustomTheme] = useState({
    bg: "#ffffff",
    text: "#000000",
    hoverActive: "#F7BE7E",
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const email = user?.email || "No Email";
  const name = user?.fullName || "Guest";
  
  const profileImg = Images.profileImg;

  const [firstName, lastName] = name.split(" ");
  const displayName = `${firstName || ""} ${lastName || ""}`.trim();

  const initials = `${firstName?.[0] || ""}${
    lastName?.[0] || ""
  }`.toUpperCase();

  return (
    <>
      <nav className="bg-theme text-theme p-4 flex flex-wrap justify-between items-center gap-2 sm:gap-4">
        <button onClick={toggleSidebar} className="p-2 cursor-pointer">
          <Icons.Menu className="w-6 h-6 text-theme" />
        </button>

        <h1 className="text-xl font-bold uppercase sm:absolute sm:left-1/2 sm:transform sm:-translate-x-1/2">
          Admin Panel
        </h1>

        <div className="flex items-center gap-2 sm:gap-4 ml-auto flex-wrap">
          {/*  Theme Selector */}
          <div className="relative">
            <button
              onClick={() => setIsThemeOpen(!isThemeOpen)}
              className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white border border-gray-300 text-sm shadow-md text-black hover:bg-gray-100 transition duration-200"
            >
              <span className="text-lg">🎨</span>
              <span>Select Theme</span>
            </button>

            {isThemeOpen && (
              <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow-lg z-50 w-[135px] max-h-64 overflow-y-auto px-2 py-2">
                {themes.map((theme, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setTheme(theme.value);
                      if (theme.value === "custom") setIsModalOpen(true);
                      setIsThemeOpen(false);
                    }}
                    className="cursor-pointer hover:bg-gray-100 px-1 py-1 rounded flex justify-between items-center"
                  >
                    {theme.value !== "custom" ? (
                      <>
                        <div
                          className="w-5 h-5 rounded"
                          style={{
                            backgroundColor: theme.bg,
                            border: "1px solid #ccc",
                          }}
                        ></div>
                        <div
                          className="w-5 h-5 rounded"
                          style={{
                            backgroundColor: theme.hoverActive,
                            border: "1px solid #ccc",
                          }}
                        ></div>
                        <div
                          className="w-5 h-5 rounded"
                          style={{
                            backgroundColor: theme.text,
                            border: "1px solid #ccc",
                          }}
                        ></div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-sm text-amber-700 font-semibold bg-amber-100 px-2 py-2 rounded-lg">
                        <span className="text-lg">🎨</span>
                        <span className="text-center">
                          Choose your favorite color
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 👤 User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-300 text-sm shadow-md text-black hover:bg-gray-100 transition duration-200"
            >
              <Icons.User className="w-4 h-4 text-dark" />
              <span>User</span>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg z-50">
                <div className="border-b">
                  <div className="ps-4 pt-4 flex items-center space-x-3">
                    {profileImg ? (
                      <img
                        src={profileImg}
                        alt="ProfileImg"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-15 h-12 rounded-full bg-theme flex items-center justify-center text-theme font-semibold text-sm uppercase">
                        {initials}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{displayName}</p>
                    </div>
                  </div>
                  <div className="ps-4 pb-2 pt-2">
                    <p className="text-sm text-gray-600">{email}</p>
                  </div>
                </div>

                <ul className="py-2">
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    <Link to="/dashboard/profile">Profile</Link>
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    <Link to="/dashboard/logout">Logout</Link>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* 🎨 Custom Theme Modal */}
      <CustomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        heading="Customize Your Theme"
      >
        <div className="px-6 pt-4 pb-2 text-black space-y-4">
          {/* Background Color */}
          <div className="flex items-center justify-between">
            <label className="font-semibold">Background Color</label>
            <input
              type="color"
              value={customTheme.bg}
              onChange={(e) => {
                const value = e.target.value;
                setCustomTheme((prev) => ({ ...prev, bg: value }));
                document.documentElement.style.setProperty("--bg", value);
              }}
              className="w-18 h-12 cursor-pointer"
            />
          </div>

          {/* Text Color */}
          <div className="flex items-center justify-between">
            <label className="font-semibold">Text Color</label>
            <input
              type="color"
              value={customTheme.text}
              onChange={(e) => {
                const value = e.target.value;
                setCustomTheme((prev) => ({ ...prev, text: value }));
                document.documentElement.style.setProperty("--text", value);
              }}
              className="w-18 h-12 cursor-pointer"
            />
          </div>

          {/* Hover/Active Color */}
          <div className="flex items-center justify-between">
            <label className="font-semibold">Hover/Active Color</label>
            <input
              type="color"
              value={customTheme.hoverActive}
              onChange={(e) => {
                const value = e.target.value;
                setCustomTheme((prev) => ({ ...prev, hoverActive: value }));
                document.documentElement.style.setProperty("--hover", value);
                document.documentElement.style.setProperty("--active", value);
              }}
              className="w-18 h-12 cursor-pointer"
            />
          </div>
        </div>
      </CustomModal>
    </>
  );
}

export default Navbar;
