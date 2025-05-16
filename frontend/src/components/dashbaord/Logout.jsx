import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove user and related data
    localStorage.removeItem("user");
    localStorage.removeItem("companyId");
    localStorage.removeItem("token");

    toast.success("Successfully logged out.");

    setTimeout(() => {
      navigate("/", { replace: true });
    }, 1000);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 w-full max-w-md">
        <h2 className="text-center text-xl font-semibold text-gray-800 mb-6">
          Are you sure you want to logout?
        </h2>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Yes, Logout
          </button>

          <button
            onClick={handleCancel}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Logout;
