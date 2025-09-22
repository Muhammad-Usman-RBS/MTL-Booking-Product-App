import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  useVerifyUserOtpMutation,
  useResendUserOtpMutation,
} from "../../../redux/api/adminApi";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";

const VerificationUser = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const transactionId = params.get("tid") || "";
  const email = params.get("email") || "";

  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(120);

  const [verifyUserOtp, { isLoading: isVerifying }] =
    useVerifyUserOtpMutation();
  const [resendUserOtp, { isLoading: isResending }] =
    useResendUserOtpMutation();

  // Guard: required params
  useEffect(() => {
    if (!transactionId || !email) {
      toast.error("Verification link is incomplete. Please try again.");
      navigate("/dashboard/admin-list");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown for resend
  useEffect(() => {
    const id = setInterval(() => setTimer((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  const canResend = useMemo(
    () => timer === 0 && !isResending,
    [timer, isResending]
  );
  const canVerify = useMemo(
    () => otp.length === 6 && !isVerifying,
    [otp, isVerifying]
  );

  const handleChange = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(v);
  };

  const onVerify = async () => {
    if (!transactionId) return;
    if (otp.length !== 6) return toast.error("Please enter a 6-digit OTP.");
    try {
      const res = await verifyUserOtp({ transactionId, otp }).unwrap();
      toast.success("User has been verified successfully.");
      const role = res?.user?.role;
      if (role === "clientadmin" || role === "associateadmin") {
        navigate("/dashboard/company-accounts/list");
      } else {
        navigate("/dashboard/admin-list");
      }
    } catch (e) {
      toast.error(e?.data?.message || "Invalid OTP. Please try again.");
    }
  };

  const onResend = async () => {
    if (!transactionId) return;
    if (!canResend) return;
    try {
      await resendUserOtp({ transactionId }).unwrap();
      toast.success("A new OTP has been sent to your email.");
      setTimer(60);
      setOtp("");
    } catch (e) {
      toast.error(
        e?.data?.message || "Failed to resend OTP. Please try again."
      );
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && canVerify) onVerify();
  };

  const mm = String(Math.floor(timer / 60)).padStart(2, "0");
  const ss = String(timer % 60).padStart(2, "0");

  return (
    <>
      <OutletHeading name="Verification User" />
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md mx-auto w-full">
          <p className="text-sm text-gray-600 mb-4">
            We’ve sent a 6-digit code to <b>{email}</b>. Enter it within 2
            minutes to create the account.
          </p>

          <label className="block text-sm font-medium text-gray-700 mb-1">
            OTP Code
          </label>
          <input
            className="custom_input w-full mb-3 text-center tracking-widest text-lg"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={otp}
            onChange={handleChange}
            onKeyDown={onKeyDown}
            placeholder="______"
            aria-label="Enter 6 digit OTP"
          />

          <button
            className={`btn btn-success w-full mb-3 ${
              !canVerify ? "opacity-60 cursor-not-allowed" : ""
            }`}
            onClick={onVerify}
            disabled={!canVerify}
          >
            {isVerifying ? "Verifying..." : "Verify & Create"}
          </button>

          <button
            className={`btn btn-primary w-full ${
              !canResend ? "opacity-60 cursor-not-allowed" : ""
            }`}
            disabled={!canResend}
            onClick={onResend}
          >
            {isResending
              ? "Sending..."
              : timer > 0
              ? `Resend OTP in ${mm}:${ss}`
              : "Resend OTP"}
          </button>

          <div className="text-center mt-4">
            <button
              className="btn btn-cancel w-full"
              onClick={() => navigate("/dashboard/admin-list")}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerificationUser;
