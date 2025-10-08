import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../../redux/slices/authSlice";
import { useVerifyLoginOtpMutation } from "../../../redux/api/userApi";

const VerifyLogin = () => {
  const { state } = useLocation();
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [verifyUserOtp, { isLoading }] = useVerifyLoginOtpMutation();
  useEffect(() => {
    if (!state?.userId || !state?.email) {
      toast.error("Missing OTP verification context.");
      navigate("/login");
    }
  }, [state, navigate]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
  
    if (!otp || otp.length !== 6) {
      return toast.error("Enter the complete 6-digit OTP.");
    }
  
    try {
      // Call verifyUserOtp API to verify the OTP
      const data = await verifyUserOtp({
        userId: state.userId,
        otp,
      }).unwrap();
  
      // Set the user data in the redux store
      dispatch(setUser(data.user));
  
      // Display success message
      toast.success("OTP verified successfully!");
  
      // Redirect based on user role
      setTimeout(() => {
        switch (data.user.role) {
          case "superadmin":
          case "clientadmin":
          case "demo":
            navigate("/dashboard/home");
            break;
          default:
            navigate("/dashboard/home");
        }
      }, 800);
    } catch (err) {
      console.error("OTP verification error:", err);
      const msg = err?.data?.message || "Failed to verify OTP.";
      toast.error(msg);
    }
  };
  return (
    <form onSubmit={handleVerifyOtp} className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Verify OTP
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Enter the OTP sent to <strong>{state?.email}</strong>
        </p>
      </div>

      <div>
        <label
          htmlFor="otp"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          One-Time Password
        </label>
        <input
          type="text"
          id="otp"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          placeholder="Enter 6-digit OTP"
          className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full cursor-pointer text-white px-4 py-2 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200 disabled:opacity-50"
        style={{
          background:
            "linear-gradient(90deg, rgba(37,37,157,1) 0%, rgba(0,212,255,1) 100%)",
        }}
      >
        {isLoading ? "Verifying..." : "Verify OTP"}
      </button>

      <div className="text-center mt-3">
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="text-blue-600 text-sm font-semibold underline cursor-pointer"
        >
          Back to Login
        </button>
      </div>
    </form>
  );
};

export default VerifyLogin;
