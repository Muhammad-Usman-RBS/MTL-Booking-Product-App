import axios from "axios";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";

dotenv.config();
const initiateOtpFlow = async (user) => {
  const otp = genOtp(); // generate OTP
  const otpHash = await bcrypt.hash(otp, 10);
  const otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000);
  await User.findByIdAndUpdate(user._id, {
    $set: {
      "verification.otpHash": otpHash,
      "verification.otpExpiresAt": otpExpiresAt,
      "verification.attempts": 0,
    },
  });
  await sendEmail(user.email, "Your OTP Code", {
    title: "Verify Your Account",
    subtitle: "Use this OTP to verify your login:",
    data: { "One-Time Password": otp, "Expires In": "2 minutes" },
  });
};
export const genOtp = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
};
export const verifyOtp = async (req, res) => {
  const { userId, otp } = req.body;
  try {
    const user = await User.findById(userId).select("+password");
    if (!user || !user.verification) {
      return res
        .status(400)
        .json({ message: "No pending OTP verification for this user." });
    }
    if (user.verification.attempts >= 5) {
      return res.status(429).json({
        message: "Too many incorrect attempts. Please try again later.",
      });
    }
    if (new Date() > user.verification.otpExpiresAt) {
      return res
        .status(400)
        .json({ message: "OTP expired. Please request a new OTP." });
    }
    const isOtpValid = await bcrypt.compare(otp, user.verification.otpHash);
    if (!isOtpValid) {
      user.verification.attempts += 1;
      await user.save();
      return res
        .status(400)
        .json({ message: "Invalid OTP. Please try again." });
    }
    user.verification = undefined;
    user.status = "Active";
    const forwarded = req.headers["x-forwarded-for"];
    const rawIp = forwarded || req.socket.remoteAddress || "";
    const ip = rawIp.includes("::ffff:") ? rawIp.split("::ffff:")[1] : rawIp;
    let location = "Unknown, Unknown";
    try {
      const { data: geo } = await axios.get(`http://ip-api.com/json/${ip}`);
      if (geo?.status === "success") {
        location = `${geo.city || "Unknown"}, ${geo.country || "Unknown"}`;
      }
    } catch (err) {
    }
    user.loginHistory.push({
      loginAt: new Date(),
      systemIpAddress: ip,
      location,
    });
    await user.save();
    const accessToken = generateAccessToken(
      user._id,
      user.role,
      user.companyId
    );
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refresh_token", generateRefreshToken(user._id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      message: "Logged in successfully!",
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        permissions: user.permissions,
        profileImage: user.profileImage || null,
        companyId: user.companyId || null,
        employeeNumber: user.employeeNumber,
        vatnumber: user.vatnumber || null,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error during OTP verification" });
  }
};

export const resendLoginOtp = async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (user.status === "Active" && !user.verification) {
      return res.status(400).json({
        message: "User is already verified. No OTP needed.",
      });
    }
    if (user.verification && user.verification.attempts >= 5) {
      return res.status(429).json({
        message: "Too many attempts. Please try again later.",
      });
    }
    const otp = genOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); 
    user.verification = {
      otpHash,
      otpExpiresAt,
      attempts: 0,
    };
    await user.save();
    try {
      await sendEmail(user.email, "Your OTP Code", {
        title: "Verify Your Account",
        subtitle: "Use this OTP to verify your login:",
        data: { "One-Time Password": otp, "Expires In": "2 minutes" },
      });
    } catch (emailError) {
      return res.status(500).json({
        message: "Failed to send OTP email. Please try again later.",
      });
    }
    return res.status(200).json({
      message: "OTP has been resent to your email.",
      userId: user._id,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while resending OTP.",
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (user.role === "clientadmin" && !user.companyId) {
      return res.status(403).json({
        message:
          "Client Admin must have a company assigned. Please contact the administrator.",
      });
    }
    if (user.status !== "Active") {
      return res.status(403).json({
        message: `Your account is ${user.status}. Please contact the administrator.`,
      });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (user?.role !== "superadmin") {
      await initiateOtpFlow(user);
      return res.status(200).json({
        requiresOtp: true,
        userId: user._id,
        message: "OTP sent to your email. Please verify to continue.",
      });
    }
    const forwarded = req.headers["x-forwarded-for"];
    const rawIp = forwarded || req.socket.remoteAddress || "";
    const ip = rawIp.includes("::ffff:") ? rawIp.split("::ffff:")[1] : rawIp;
    let location = "Unknown, Unknown";
    try {
      const { data: geo } = await axios.get(`http://ip-api.com/json/${ip}`);
      if (geo?.status === "success") {
        location = `${geo.city || "Unknown"}, ${geo.country || "Unknown"}`;
      }
    } catch (err) {
    }
    user.loginHistory.push({
      loginAt: new Date(),
      systemIpAddress: ip,
      location,
    });
    await user.save();
    res.cookie(
      "access_token",
      generateAccessToken(user._id, user.role, user.companyId),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 15 * 60 * 1000,
      }
    );
    res.cookie("refresh_token", generateRefreshToken(user._id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      permissions: user.permissions,
      profileImage: user.profileImage || null,
      companyId: user.companyId || null,
      employeeNumber: user.employeeNumber,
      vatnumber: user.vatnumber || null,
      superadminCompanyLogo: user.superadminCompanyLogo || "",
      superadminCompanyName: user.superadminCompanyName || "",
      superadminCompanyAddress: user.superadminCompanyAddress || "",
      superadminCompanyPhoneNumber: user.superadminCompanyPhoneNumber || "",
      superadminCompanyEmail: user.superadminCompanyEmail || "",
      superadminCompanyWebsite: user.superadminCompanyWebsite || "",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during login" });
  }
};

export const getSuperadminInfo = async (req, res) => {
  try {
    const superadmin = await User.findOne({ role: "superadmin" }).select(
      "superadminCompanyLogo superadminCompanyName superadminCompanyAddress superadminCompanyPhoneNumber superadminCompanyEmail superadminCompanyWebsite"
    );
    if (!superadmin) {
      return res.status(404).json({ message: "Superadmin not found" });
    }
    res.json(superadmin);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });
    const isMatch = await bcrypt.compare(
      req.body.currentPassword,
      user.password
    );
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    user.email = req.body.email || user.email;
    user.fullName = req.body.fullName || user.fullName;
    if (req.body.newPassword) {
      user.password = await bcrypt.hash(req.body.newPassword, 10);
    }
    if (req.files?.profileImage?.[0]?.path) {
      user.profileImage = req.files.profileImage[0].path;
    }
    if (req.files?.superadminCompanyLogo?.[0]?.path) {
      user.superadminCompanyLogo = req.files.superadminCompanyLogo[0].path;
    }
    if (user.role === "superadmin") {
      user.superadminCompanyName =
        req.body.superadminCompanyName || user.superadminCompanyName;
      user.superadminCompanyAddress =
        req.body.superadminCompanyAddress || user.superadminCompanyAddress;
      user.superadminCompanyPhoneNumber =
        req.body.superadminCompanyPhoneNumber ||
        user.superadminCompanyPhoneNumber;
      user.superadminCompanyEmail =
        req.body.superadminCompanyEmail || user.superadminCompanyEmail;
    }
    await user.save();
    res.json({
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      permissions: user.permissions,
      profileImage: user.profileImage,
      vatnumber: user.vatnumber || null,
      superadminCompanyLogo: user.superadminCompanyLogo || "",
      superadminCompanyName: user.superadminCompanyName || "",
      superadminCompanyAddress: user.superadminCompanyAddress || "",
      superadminCompanyPhoneNumber: user.superadminCompanyPhoneNumber || "",
      superadminCompanyEmail: user.superadminCompanyEmail || "",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
export const sendOtpToEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 2 * 60 * 1000); // 2 mins
  user.otpCode = otp;
  user.otpExpiresAt = expires;
  await user.save();
  const html = `
    <p>Your OTP for password reset is:</p>
    <h2>${otp}</h2>
    <p>Expires in 2 minutes.</p>
  `;
  await sendEmail(email, "Password Reset OTP", html);
  res.json({ message: "OTP sent successfully" });
};

export const resetPasswordWithOtp = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email, otpCode: otp });
  if (!user || user.otpExpiresAt < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }
  user.password = await bcrypt.hash(newPassword, 10);
  user.otpCode = null;
  user.otpExpiresAt = null;
  await user.save();
  res.json({ message: "Password reset successfully" });
};

export const refreshToken = async (req, res) => {
  const token = req.cookies?.refresh_token;
  if (!token) return res.status(401).json({ message: "No refresh token" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });
    res.cookie(
      "access_token",
      generateAccessToken(user._id, user.role, user.companyId),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 15 * 60 * 1000,
      }
    );
    return res.json({ message: "Access token refreshed" });
  } catch (err) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.clearCookie("refresh_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.json({ message: "Logged out successfully" });
};
export const getMe = (req, res) => {
  const u = req.user;
  if (!u) {
    return res.status(401).json({ message: "Not authorized" });
  }
  res.json({
    _id: u._id || null,
    email: u.email || "",
    fullName: u.fullName || "",
    role: u.role || "",
    companyId: u.companyId || null,
    permissions: u.permissions || [],
    profileImage: u.profileImage || "",
    employeeNumber: u.employeeNumber || null,
    superadminCompanyName: u.superadminCompanyName || "",
    superadminCompanyAddress: u.superadminCompanyAddress || "",
    superadminCompanyPhoneNumber: u.superadminCompanyPhoneNumber || "",
    superadminCompanyEmail: u.superadminCompanyEmail || "",
    superadminCompanyLogo: u.superadminCompanyLogo || "",
  });
};