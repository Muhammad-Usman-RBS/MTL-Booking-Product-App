import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
// import superAdminRoutes from './routes/superAdminRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import createSuperAdmin from './utils/createSuperAdmin.js';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import pricingRoutes from "./routes/pricingRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js"
import googleRoutes from "./routes/googleRoutes.js"
import widgetRoutes from "./routes/widgetRoutes.js";

dotenv.config(); // .env file
connectDB(); // Connect to the database

const app = express();
app.use(express.json());

// CORS POLICY
app.use(cors({
  origin: process.env.BASE_URL_FRONTEND,
  credentials: true,
}));

app.use('/api/auth', authRoutes);
// app.use('/api/superadmin', superAdminRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/google', googleRoutes);
app.use('/api/widget', widgetRoutes);

app.use('/api', userRoutes);

// Serve static files (e.g., images) from the "uploads" directory
app.use('/uploads', express.static('uploads'));

app.use(errorHandler);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  createSuperAdmin(); // Automatically create a super admin account if it doesn't exist
});
