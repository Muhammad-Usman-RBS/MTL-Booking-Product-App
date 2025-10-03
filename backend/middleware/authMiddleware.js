import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    // Get JWT from cookies
    const token = req.cookies?.access_token;
    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch full user from DB (excluding password)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach structured user to req
    req.user = {
      _id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      companyId: user.companyId?.toString() || decoded.companyId || null,
      permissions: user.permissions || [],
      profileImage: user.profileImage || "",
      employeeNumber: user.employeeNumber || null,
      superadminCompanyName: user.superadminCompanyName || "",
      superadminCompanyAddress: user.superadminCompanyAddress || "",
      superadminCompanyPhoneNumber: user.superadminCompanyPhoneNumber || "",
      superadminCompanyEmail: user.superadminCompanyEmail || "",
      superadminCompanyLogo: user.superadminCompanyLogo || "",
    };

    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }
    next();
  };
};

export const injectCompanyId = (req, res, next) => {
  if (req.user && req.user.companyId) {
    // Body me inject karo agar missing ho
    if (!req.body.companyId) {
      req.body.companyId = req.user.companyId;
    }

    // Query me inject karo agar missing ho
    if (!req.query.companyId) {
      req.query.companyId = req.user.companyId;
    }
  }
  next();
};