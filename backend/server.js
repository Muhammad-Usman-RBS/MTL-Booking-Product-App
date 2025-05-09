import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import superAdminRoutes from './routes/superAdminRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import createSuperAdmin from './utils/createSuperAdmin.js';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import pricingRoutes from "./routes/pricingRoutes.js";

dotenv.config(); // .env file
connectDB(); // Connect to the database

const app = express();
app.use(express.json());

// CORS POLICY
app.use(cors({             
  origin: process.env.BASE_URL_FRONTEND,
  credentials: true,
}));


app.use('/api/auth', authRoutes);                                  // Register authentication routes
app.use('/api/superadmin', superAdminRoutes);                      // Register super admin routes
app.use('/api/companies', companyRoutes);
app.use('/api/pricing', pricingRoutes);


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
