// import express from 'express';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import authRoutes from './routes/authRoutes.js';
// import { errorHandler } from './middleware/errorMiddleware.js';
// import createSuperAdmin from './utils/createSuperAdmin.js';
// import connectDB from './config/db.js';
// import userRoutes from './routes/userRoutes.js';
// import companyRoutes from './routes/companyRoutes.js';
// import pricingRoutes from "./routes/pricingRoutes.js";
// import bookingRoutes from "./routes/bookingRoutes.js"
// import googleRoutes from "./routes/googleRoutes.js"
// import driverRoutes from "./routes/driverRoutes.js"
// import settingsRoutes from "./routes/settingsRoutes.js"
// import invoiceRoutes from "./routes/invoiceRoutes.js"
// import NotificationRoutes from "./routes/notificationRoutes.js"
// import jobsRoutes from "./routes/jobRoutes.js"
// import corporateCustomerRoutes from "./routes/corporateCustomerRoutes.js"
// import bookingSettingRoutes from "./routes/bookingSettingRoutes.js";
// import reviewRoutes from "./routes/reviewRoutes.js";

// dotenv.config(); // .env file
// connectDB(); // Connect to the database

// const app = express();
// app.use(express.json({ limit: '5mb' }));
// app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// // CORS POLICY
// app.use(cors({
//   origin: process.env.BASE_URL_FRONTEND,
//   credentials: true,
// }));

// app.use('/api/auth', authRoutes);
// app.use('/api/driver', driverRoutes);
// app.use('/api/invoice', invoiceRoutes);
// app.use('/api/companies', companyRoutes);
// app.use('/api/pricing', pricingRoutes);
// app.use('/api/settings', settingsRoutes);
// app.use('/api/booking', bookingRoutes);
// app.use('/api/corporate-customer', corporateCustomerRoutes);
// app.use('/api/jobs', jobsRoutes);
// app.use('/api/google', googleRoutes);
// app.use('/api/notification', NotificationRoutes);
// app.use("/api/booking-settings", bookingSettingRoutes);
// app.use("/api/reviews", reviewRoutes);

// app.use('/api', userRoutes);

// // Serve static files (e.g., images) from the "uploads" directory
// app.use('/uploads', express.static('uploads'));

// app.use(errorHandler);

// // Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
//   createSuperAdmin();
// });



// server.js (or index.js)
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server as IOServer } from "socket.io";

import connectDB from "./config/db.js";
import createSuperAdmin from "./utils/createSuperAdmin.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import pricingRoutes from "./routes/pricingRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import googleRoutes from "./routes/googleRoutes.js";
import driverRoutes from "./routes/driverRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import NotificationRoutes from "./routes/notificationRoutes.js";
import jobsRoutes from "./routes/jobRoutes.js";
import corporateCustomerRoutes from "./routes/corporateCustomerRoutes.js";
import bookingSettingRoutes from "./routes/bookingSettingRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// ---- CORS (supports comma-separated multiple origins in BASE_URL_FRONTEND) ----
const allowedOrigins = process.env.BASE_URL_FRONTEND
  ? process.env.BASE_URL_FRONTEND.split(",").map((s) => s.trim())
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: (origin, cb) => {
      // allow non-browser tools (no origin) & whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

// ---- Routes ----
app.use("/api/auth", authRoutes);
app.use("/api/driver", driverRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/pricing", pricingRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/corporate-customer", corporateCustomerRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/google", googleRoutes);
app.use("/api/notification", NotificationRoutes);
app.use("/api/booking-settings", bookingSettingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api", userRoutes);

// Static
app.use("/uploads", express.static("uploads"));

// Health (optional)
app.get("/health", (_req, res) => res.json({ ok: true }));

// Errors
app.use(errorHandler);

// ---- HTTP server + Socket.IO ----
const server = http.createServer(app);
export const io = new IOServer(server, {
  // If you keep FE and BE on same origin in prod, you can tighten this:
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
  path: "/socket.io", // default; keep explicit if you proxy
});
app.set("io", io);

// Optional auth (JWT verify here if needed)
io.use((socket, next) => {
  // const { token } = socket.handshake.auth || {}
  // verify token -> set socket.user = decoded
  next();
});

// Rooms: per-employee & per-company (query params from client)
io.on("connection", (socket) => {
  const { employeeNumber, companyId } = socket.handshake.query || {};
  const emp = String(employeeNumber || "");
  const co  = String(companyId || "");

  if (emp) socket.join(`emp:${emp}`);
  if (co)  socket.join(`co:${co}`);

  // DEBUG: dekhen client aya, kis room me join hua
  console.log("[SOCKET] connected:", socket.id, "emp:", emp, "co:", co);
  console.log("[SOCKET] rooms:", [...socket.rooms]);

  socket.emit("socket:ready", { ok: true, emp, co });

  socket.on("disconnect", (reason) => {
    console.log("[SOCKET] disconnected:", socket.id, reason);
  });
});

// ---- Start ----
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  createSuperAdmin();
});