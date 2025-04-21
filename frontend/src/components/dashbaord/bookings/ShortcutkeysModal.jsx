import React from "react";

const ShortcutkeysModal = () => {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
        {[
          { key: "D", label: "Driver allocation" },
          { key: "A", label: "Accepted" },
          { key: "O", label: "On Route" },
          { key: "L", label: "At Location" },
          { key: "R", label: "Ride Started" },
          { key: "N", label: "No Show" },
          { key: "C", label: "Completed" },
          { key: "Enter", label: "View booking" },
          { key: "Shift + C", label: "Cancel booking" },
          { key: "Shift + D", label: "Delete booking" },
          { key: "Shift + E", label: "Edit booking" },
          { key: "Shift + R", label: "Restore booking" },
        ].map((shortcut, index) => (
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
