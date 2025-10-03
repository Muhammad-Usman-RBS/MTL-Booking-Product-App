import jwt from "jsonwebtoken";

// Access Token (short-lived, 10-15 minutes max)
export const generateAccessToken = (id, role, companyId) => {
  return jwt.sign({ id, role, companyId }, process.env.JWT_SECRET, {
    expiresIn: "15m",  // short lived for secure access
  });
};

// Refresh Token (long-lived, 7 days is ideal)
export const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",  // refresh token stays valid for 7 days
  });
};