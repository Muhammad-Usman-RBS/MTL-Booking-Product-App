import React, { useState } from "react";
import { Link } from "react-router-dom";
import Icons from "../../../assets/icons";
import useUIStore from "../../../store/useUIStore";

const themes = [
  { value: "theme-light-1", bg: "#f3f4f6", text: "#1f2937" },
  { value: "theme-light-2", bg: "#fefce8", text: "#78350f" },
  { value: "theme-dark-1", bg: "#1f2937", text: "#f9fafb" },
  { value: "theme-dark-2", bg: "#111827", text: "#e5e7eb" },
  { value: "theme-dark-3", bg: "#FF7D00", text: "#f1f5f9" },
  { value: "theme-dark-4", bg: "yellow", text: "black" },
];

function Navbar() {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const setTheme = useUIStore((state) => state.setTheme);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  return (
    <nav className="bg-theme text-theme p-4 flex flex-wrap justify-between items-center gap-2 sm:gap-4">
      <button onClick={toggleSidebar} className="p-2">
        <Icons.Menu className="w-6 h-6 text-theme" />
      </button>

      <h1 className="text-xl sm:absolute sm:left-1/2 sm:transform sm:-translate-x-1/2">
        Admin Panel
      </h1>

      <div className="flex items-center gap-2 sm:gap-4 ml-auto flex-wrap">
        {/* 🎨 Theme Selector */}
        <div className="relative">
          <button
            onClick={() => setIsThemeOpen(!isThemeOpen)}
            className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white border border-gray-300 text-sm shadow-md text-black hover:bg-gray-100 transition duration-200"
          >
            <span className="text-lg">🎨</span>
            <span>Select Theme</span>
          </button>

          {isThemeOpen && (
            <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow-lg z-50 w-32 max-h-64 overflow-y-auto px-1 py-2">
              {themes.map((theme, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setTheme(theme.value);
                    setIsThemeOpen(false);
                  }}
                  className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded flex justify-between items-center"
                >
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
                      backgroundColor: theme.text,
                      border: "1px solid #ccc",
                    }}
                  ></div>
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
              <div className="p-4 border-b">
                <p className="font-semibold">John Doe</p>
                <p className="text-sm text-gray-600">john@example.com</p>
              </div>
              <ul className="py-2">
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  <Link to="/dashboard/profile/edit">Profile</Link>
                </li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  <Link to="/dashboard/settings/general">Settings</Link>
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
  );
}

export default Navbar;
