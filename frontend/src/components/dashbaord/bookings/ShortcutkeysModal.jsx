import React from "react";
import { useSelector } from "react-redux";

const ShortcutkeysModal = () => {
  const user = useSelector((state) => state?.auth?.user);
  const shortcuts = [
    { key: "D", label: "Driver allocation" },
    { key: "A", label: "Accepted" },
    { key: "O", label: "On Route" },
    { key: "L", label: "At Location" },
    { key: "N", label: "No Show" },
    { key: "C", label: "Completed" },
    { key: "SHIFT + R", label: "Ride Started" },
    { key: "Enter", label: "View booking" },
    { key: "Shift + C", label: "Cancel booking" },
    { key: "Shift + D", label: "Delete booking", restricted: true },
    { key: "Shift + E", label: "Edit booking", restricted: true },
  ];

  const visibleShortcuts =
    user?.role === "driver"
      ? shortcuts.filter((s) => !s.restricted)
      : shortcuts;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
        {visibleShortcuts.map((shortcut, index) => (
          <div
            key={index}
            className="flex items-center gap-3 px-3 py-2 rounded-md bg-white border border-gray-200 hover:bg-gray-100 transition"
          >
            <span className="text-sm font-semibold text-indigo-600 bg-indigo-100 px-2 py-1 rounded">
              {shortcut.key}
            </span>
            <span className="text-sm text-gray-800">{shortcut.label}</span>
          </div>
        ))}
      </div>
    </>
  );
};

export default ShortcutkeysModal;
