import React from "react";

const CustomModal = ({ isOpen, onClose, heading, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 px-4 sm:px-6"
      onClick={onClose}
    >
      <div
        className="w-auto max-h-[90vh] bg-white rounded-2xl border border-[var(--light-gray)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center bg-theme border-b border-gray-200 p-3">
          <h2
            className="text-xl sm:text-xl font-bold text-theme ps-3"
            style={{
              fontFamily: "sans-serif !important",
            }}
          >
            {heading}
          </h2>
          <button
            onClick={onClose}
            className="text-theme cursor-pointer transition text-xl pe-3"
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
