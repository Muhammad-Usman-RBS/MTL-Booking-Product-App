import React from "react";

const ConfirmModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 w-full max-w-md">
        <h2 className="text-center text-xl font-semibold text-gray-800 mb-4">
          Mark Booking as Completed?
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Once you confirm, this booking will be permanently marked as
          <span className="font-semibold text-green-600"> Completed </span> and cannot be changed.
        </p>

        <div className="flex items-center justify-center space-x-3 ">
          <button
            onClick={onConfirm}
            className="btn btn-success"
          >
            Yes
          </button>

          <button
            onClick={onCancel}
            className="btn btn-reset"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
