import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/authSlice";
import {
  useVerifyLoginOtpMutation,
  useResendLoginOtpMutation,
} from "../../redux/api/userApi";

const VerificationLogin = () => {
  const { state } = useLocation();
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(120); 
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [verifyUserOtp, { isLoading }] = useVerifyLoginOtpMutation();
  const [resendLoginOtp, { isLoading: isResending }] =
    useResendLoginOtpMutation();

  useEffect(() => {
    if (!state?.userId || !state?.email) {
      toast.error("Missing OTP verification context.");
      navigate("/login");
    }
  }, [state, navigate]);

  useEffect(() => {
    const id = setInterval(() => setTimer((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  const canResend = useMemo(
    () => timer === 0 && !isResending,
    [timer, isResending]
  );

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

  const handleResendOtp = async () => {
    if (!state?.userId) return;
    if (!canResend) return;
    try {
      await resendLoginOtp({ userId: state.userId }).unwrap();
      toast.success("A new OTP has been sent to your email.");
      setTimer(120);
      setOtp("");
    } catch (err) {
      console.error("Failed to resend OTP:", err);
      toast.error(
        err?.data?.message || "Failed to resend OTP. Please try again."
      );
    }
  };

  const mm = String(Math.floor(timer / 60)).padStart(2, "0");
  const ss = String(timer % 60).padStart(2, "0");

  return (
    <form onSubmit={handleVerifyOtp} className="space-y-2">
      <div>
        <p className=" text-sm font-light text-gray-600 mb-1">
          Enter the OTP sent to <strong>{state?.email}</strong>
        </p>
        <input
          type="text"
          id="otp"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          placeholder="Enter 6-digit OTP"
          className="custom_input "
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full cursor-pointer mt-6 text-white px-4 py-2 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200 disabled:opacity-50"
        style={{
          background:
            "linear-gradient(90deg, rgba(37,37,157,1) 0%, rgba(0,212,255,1) 100%)",
        }}
      >
        {isLoading ? "Verifying..." : "Verify OTP"}
      </button>

      <button
        type="button"
        onClick={handleResendOtp}
        className={`btn btn-back w-full ${
          !canResend ? "opacity-60 cursor-not-allowed" : ""
        }`}
        disabled={!canResend}
      >
        {isResending
          ? "Sending..."
          : timer > 0
          ? `Resend OTP in ${mm}:${ss}`
          : "Resend OTP"}
      </button>

      <div className="text-center ">
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

export default VerificationLogin;
