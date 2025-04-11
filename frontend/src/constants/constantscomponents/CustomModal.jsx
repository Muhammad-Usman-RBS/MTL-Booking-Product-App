import React from "react";

const CustomModal = ({ isOpen, onClose, heading, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 px-4 sm:px-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[90vh] bg-white rounded-2xl border border-gray-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-gray-200 p-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 ps-3">
            {heading}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition text-xl pe-3"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto pt-2 pb-6 max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CustomModal;
