import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import bodyParser from "body-parser";
import { Server as IOServer } from "socket.io";

import connectDB from "./config/db.js";
import createSuperAdmin from "./utils/createSuperAdmin.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import { scheduleDriverDocsJobs } from "./utils/settings/cronjobs/driverDocumentsExpiration.js";
import { handleStripeWebhook } from "./controllers/settings/stripeWebhookController.js";
import { getPaypalClient } from "./utils/settings/paypalClient.js";
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
import cronJobsRoutes from "./routes/cronJobRoutes.js";
import stripeRoutes from "./routes/stripeRoutes.js";
import paypalRoutes from "./routes/paypalRoutes.js";
import termsRoutes from "./routes/termsandConditionRoutes.js"
import { scheduleAutoAllocation } from "./utils/cronJob/scheduleAutoAllocation.js";
import { scheduleDriverStatements } from "./utils/cronJob/scheduleDriverStatements.js";

dotenv.config();
await connectDB();

const systemTZ = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
process.env.CRON_TIMEZONE = systemTZ;
const app = express();
app.post(
  "/api/stripe/webhook",
  bodyParser.raw({ type: "application/json" }),
  (req, _res, next) => {
    req.rawBody = req.body; 
    next();
  },
  handleStripeWebhook
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
const allowedOrigins = process.env.BASE_URL_FRONTEND
  ? process.env.BASE_URL_FRONTEND.split(",").map((s) => s.trim())
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use("/uploads", express.static("uploads"));

app.get("/health", (_req, res) =>
  res.json({
    ok: true,
    tz: systemTZ,
    now: new Date().toISOString(),
  })
);
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
app.use("/api/cronjobs", cronJobsRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/paypal", paypalRoutes);
app.use('/api/terms-and-conditions', termsRoutes);

app.use("/api", userRoutes);

app.use(errorHandler);

const server = http.createServer(app);
export const io = new IOServer(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
  path: "/socket.io",
});
app.set("io", io);

io.use((socket, next) => {
  next();
});

io.on("connection", (socket) => {
  const { employeeNumber, companyId } = socket.handshake.query || {};
  const emp = String(employeeNumber || "");
  const co = String(companyId || "");

  if (emp) socket.join(`emp:${emp}`);
  if (co) socket.join(`co:${co}`);
  socket.emit("socket:ready", { ok: true, emp, co });

  socket.on("disconnect", (reason) => {
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  getPaypalClient();
  createSuperAdmin();
  scheduleDriverStatements();
  scheduleAutoAllocation();
  await scheduleDriverDocsJobs(); 
});
process.on("SIGTERM", () => {
 
  server.close(() => {
    
    process.exit(0);
  });
});
process.on("SIGINT", () => {
 
  server.close(() => {
    process.exit(0);
  });
});

process.on("unhandledRejection", (reason) => {
  console.error("[UNHANDLED REJECTION]", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[UNCAUGHT EXCEPTION]", err);
});
