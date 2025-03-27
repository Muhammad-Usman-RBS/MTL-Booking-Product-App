import React from "react";
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <>
      <form className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            placeholder="xyz@gmail.com"
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            placeholder="********"
            className="w-full px-4 py-2 pt-2.5 bg-gray-50 border border-gray-300 rounded-lg placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
          />
        </div>
        <div className="text-center">
          <Link to="/dashboard" className="decoration-none">
            <button
              type="submit"
              className="w-full cursor-pointer text-white px-4 py-2 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200"
              style={{
                background:
                  "linear-gradient(90deg, rgba(37,37,157,1) 0%, rgba(0,212,255,1) 100%)",
              }}
            >
              Log In
            </button>
          </Link>
        </div>
        <div className="text-center mt-3">
          <Link
            to="/forgot-password"
            className="text-blue-600 text-sm font-semibold underline cursor-pointer"
          >
            Forgot your password?
          </Link>
        </div>
      </form>
    </>
  );
};

export default Login;
