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

// Protect middleware: Verify token
export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.access_token; // Get token from cookies

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password"); // Find user
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user; // Attach user info to request
    next(); // Proceed to the next middleware/route handler
  } catch (err) {
    console.error("Token verification failed:", err.message);
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
