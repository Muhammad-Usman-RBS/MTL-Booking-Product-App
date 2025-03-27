import React from "react";
import { CarFront } from "lucide-react";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  return (
    <>
      <form className="space-y-5">
        <div className="text-left">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            placeholder="Enter your registered email"
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
          />
        </div>
        <Link to="/new-password" className="decoration-none">
          <button
            type="submit"
            className="w-full cursor-pointer text-white px-4 py-2 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200"
            style={{
              background:
                "linear-gradient(90deg, rgba(37,37,157,1) 0%, rgba(0,212,255,1) 100%)",
            }}
          >
            Reset Password
          </button>
        </Link>
      </form>

      <p className="text-sm text-gray-600 mt-4">
        Already have an account?
        <Link
          to="/"
          className="text-blue-600 font-semibold underline cursor-pointer"
        >
          Log In
        </Link>
      </p>
    </>
  );
};

export default ForgotPassword;
