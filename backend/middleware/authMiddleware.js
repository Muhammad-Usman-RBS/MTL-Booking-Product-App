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

import jwt from "jsonwebtoken";
import User from "../models/User.js";

// 🔐 Protect Middleware (for authenticated routes)
export const protect = async (req, res, next) => {
  try {
    // 1. Get token from cookies
    const token = req.cookies?.access_token;

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Fetch user (without password)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // 4. Attach user info to request
    req.user = {
      _id: user._id,
      role: user.role,
      companyId: user.companyId?.toString(),
      permissions: user.permissions,
      fullName: user.fullName,
      employeeNumber: user.employeeNumber,
      vatnumber: user.vatnumber || null,
    };

    next(); // ✅ Allow request to proceed
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// 🔑 Role-based Authorization Middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }
    next();
  };
};
