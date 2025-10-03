// import jwt from 'jsonwebtoken';
// import User from '../models/User.js';

// export const protect = async (req, res, next) => {
//   let token;

//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer')
//   ) {
//     try {
//       token = req.headers.authorization.split(' ')[1];
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       // Fetch full user
//       const user = await User.findById(decoded.id).select('-password');
//       if (!user) return res.status(401).json({ message: 'User not found' });

//       // Attach user with companyId
//       req.user = {
//         _id: user._id,
//         role: user.role,
//         companyId: user.companyId?.toString(), // convert ObjectId to string
//         permissions: user.permissions,
//         fullName: user.fullName,
//         employeeNumber: user.employeeNumber,
//         vatnumber: user.vatnumber || null, 
//       };

//       next();
//     } catch (error) {
//       console.error("Token verification failed:", error.message);
//       res.status(401).json({ message: 'Not authorized, token failed' });
//     }
//   } else {
//     res.status(401).json({ message: 'Not authorized, no token' });
//   }
// };

// export const authorize = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({ message: 'Forbidden: Access denied' });
//     }
//     next();
//   };
// };

// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// // Protect middleware: Verify token
// export const protect = async (req, res, next) => {
//   try {
//     const token = req.cookies?.access_token; // Get token from cookies

//     if (!token) {
//       return res.status(401).json({ message: "Not authorized, no token" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const user = await User.findById(decoded.id).select("-password"); // Find user
//     if (!user) {
//       return res.status(401).json({ message: "User not found" });
//     }

//     req.user = user; // Attach user info to request
//     next(); // Proceed to the next middleware/route handler
//   } catch (err) {
//     console.error("Token verification failed:", err.message);
//     return res.status(401).json({ message: "Not authorized, token failed" });
//   }
// };


// // 🔑 Role-based Authorization Middleware
// export const authorize = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({ message: "Forbidden: Access denied" });
//     }
//     next();
//   };
// };









// 📌 backend/middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * ✅ PROTECT MIDDLEWARE
 * Verifies JWT from HttpOnly cookie, fetches user, and attaches a structured object to req.user
 */
export const protect = async (req, res, next) => {
  try {
    // 🍪 Get JWT from cookies
    const token = req.cookies?.access_token;
    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // 🧠 Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🧍 Fetch full user from DB (excluding password)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // 🧩 Attach structured user to req
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
    console.error("🔐 Token verification failed:", err.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

/**
 * 🔐 AUTHORIZE MIDDLEWARE
 * Allows access only for the given roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }
    next();
  };
};

/**
 * 🏢 INJECT COMPANY ID MIDDLEWARE
 * Automatically injects `req.user.companyId` into body and query if missing
 */
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
