import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { clearUser } from "../../redux/slices/authSlice";
import { useLogoutUserMutation } from "../../redux/api/userApi";

const Logout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [logoutUser, { isLoading }] = useLogoutUserMutation();

const handleLogout = async () => {
  try {
    dispatch(clearUser()); // 👈 pehle Redux empty karo
    await logoutUser().unwrap();
    toast.success("Successfully logged out.");
    navigate("/login", { replace: true });
  } catch (error) {
    toast.error("Logout failed. Try again.");
  }
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
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
          >
            {isLoading ? "Logging out..." : "Yes, Logout"}
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
