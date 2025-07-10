import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';
import sendEmail from "../utils/sendEmail.js";
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// Login Controller
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }if(user.role === "clientadmin" && !user.companyId) {
      return res.status(403).json({ message: "Client Admin must have a company assigned. Please contact the administrator."  });

    }

    // Check account statusvi
    if (user.status !== "Active") {
      return res.status(403).json({ message: `Your account is ${user.status}. Please contact the administrator.` });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Get IP Address
    const forwarded = req.headers['x-forwarded-for'];
    const rawIp = forwarded || req.socket.remoteAddress || '';
    const ip = rawIp.includes("::ffff:") ? rawIp.split("::ffff:")[1] : rawIp;

    // Geo IP Lookup
    let location = "Unknown, Unknown";
    try {
      const { data: geo } = await axios.get(`http://ip-api.com/json/${ip}`);
      if (geo?.status === 'success') {
        location = `${geo.city || 'Unknown'}, ${geo.country || 'Unknown'}`;
      }
    } catch (err) {
      console.warn("Geo IP lookup failed:", err.message);
    }

    // Save login history
    user.loginHistory.push({
      loginAt: new Date(),
      systemIpAddress: ip,
      location
    });

    await user.save();

    // Include companyId in the token
    res.json({
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      permissions: user.permissions,
      token: generateToken(user._id, user.role, user.companyId),
      profileImage: user.profileImage || null,
      companyId: user.companyId || null,
      employeeNumber: user.employeeNumber
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// UpdateProfile Controller
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update basic fields
    user.email = req.body.email || user.email;
    user.fullName = req.body.fullName || user.fullName;

    // If new password provided
    if (req.body.newPassword) {
      user.password = await bcrypt.hash(req.body.newPassword, 10);
    }

    // If profile image uploaded
    if (req.file?.path) {
      user.profileImage = req.file.path; // Cloudinary full secure URL
    }

    await user.save();

    // Send updated user response
    res.json({
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      permissions: user.permissions,
      profileImage: user.profileImage,
      token: generateToken(user._id, user.role),
    });

  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// SendOtpToEmail Controller
export const sendOtpToEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: "User not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  user.otpCode = otp;
  user.otpExpiresAt = expires;
  await user.save();

  const html = `
    <p>Your OTP for password reset is:</p>
    <h2>${otp}</h2>
    <p>Expires in 10 minutes.</p>
  `;

  await sendEmail(email, "Password Reset OTP", html);

  res.json({ message: "OTP sent successfully" });
};

// ResetPasswordWithOtp Controller
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

