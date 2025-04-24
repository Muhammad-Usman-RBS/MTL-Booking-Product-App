import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';
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
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Get IP Address (IPv6 to IPv4 safe fallback)
    const forwarded = req.headers['x-forwarded-for'];
    const rawIp = forwarded || req.socket.remoteAddress || '';
    const ip = rawIp.includes("::ffff:") ? rawIp.split("::ffff:")[1] : rawIp;

    // Fetch Geo IP Info
    let location = "Unknown, Unknown";
    try {
      const { data: geo } = await axios.get(`http://ip-api.com/json/${ip}`);
      if (geo?.status === 'success') {
        location = `${geo.city || 'Unknown'}, ${geo.country || 'Unknown'}`;
      }
    } catch (err) {
      console.warn("Geo IP lookup failed:", err.message);
    }

    // Update login history
    user.loginHistory.push({
      loginAt: new Date(),
      systemIpAddress: ip,
      location
    });

    await user.save();

    // Send response
    res.json({
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      permissions: user.permissions,
      token: generateToken(user._id, user.role),
      profileImage: user.profileImage || null
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
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    user.email = req.body.email || user.email;
    user.fullName = req.body.fullName || user.fullName;

    if (req.body.newPassword) {
      user.password = await bcrypt.hash(req.body.newPassword, 10);
    }

    if (req.file) {
      const path = req.file.path.replace(/\\/g, '/'); // windows fix
      user.profileImage = `${process.env.BASE_URL}/${path}`;
    }

    await user.save();

    res.json({
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      permissions: user.permissions,
      profileImage: user.profileImage,
      token: generateToken(user._id, user.role)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

