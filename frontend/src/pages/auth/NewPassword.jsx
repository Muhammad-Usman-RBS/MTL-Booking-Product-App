import React, { useState } from "react";
import { Link } from "react-router-dom";
import Icons from "../../assets/icons";

const NewPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <form className="space-y-5">
        <div className="text-left relative">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            New Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            placeholder="Enter new password"
            className="w-full px-4 py-2 pr-10 bg-gray-50 border border-gray-300 rounded-lg placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-8 cursor-pointer text-gray-500"
          >
            {showPassword ? (
              <Icons.EyeOff size={20} />
            ) : (
              <Icons.Eye size={20} />
            )}
          </span>
        </div>

        <div className="text-left relative">
          <label
            htmlFor="confirm"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Confirm Password
          </label>
          <input
            type={showConfirm ? "text" : "password"}
            id="confirm"
            placeholder="Confirm new password"
            className="w-full px-4 py-2 pr-10 bg-gray-50 border border-gray-300 rounded-lg placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
          />
          <span
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-8 cursor-pointer text-gray-500"
          >
            {showConfirm ? <Icons.EyeOff size={20} /> : <Icons.Eye size={20} />}
          </span>
        </div>

        <Link to="/dashboard" className="decoration-none">
          <button
            type="submit"
            className="w-full cursor-pointer text-white px-4 py-2 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200"
            style={{
              background:
                "linear-gradient(90deg, rgba(37,37,157,1) 0%, rgba(0,212,255,1) 100%)",
            }}
          >
            Update Password
          </button>
        </Link>
      </form>
    </>
  );
};

export default NewPassword;
