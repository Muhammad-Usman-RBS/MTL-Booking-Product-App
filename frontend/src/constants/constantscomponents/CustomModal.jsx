import React from "react";

const CustomModal = ({ isOpen, onClose, heading, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="p-6 w-auto bg-white border rounded shadow relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
          <h2 className="text-xl font-bold text-gray-800">{heading}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition text-xl"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

export default CustomModal;
