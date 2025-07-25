    import express from 'express';
    import dotenv from 'dotenv';
    import cors from 'cors';
    import authRoutes from './routes/authRoutes.js';
    import { errorHandler } from './middleware/errorMiddleware.js';
    import createSuperAdmin from './utils/createSuperAdmin.js';
    import connectDB from './config/db.js';
    import userRoutes from './routes/userRoutes.js';
    import companyRoutes from './routes/companyRoutes.js';
    import pricingRoutes from "./routes/pricingRoutes.js";
    import bookingRoutes from "./routes/bookingRoutes.js"
    import googleRoutes from "./routes/googleRoutes.js"
    import driverRoutes from "./routes/driverRoutes.js"
    import settingsRoutes from "./routes/settingsRoutes.js"
    import invoiceRoutes from "./routes/invoiceRoutes.js"
    import PermissionsRoutes from "./routes/PermissionsRoutes.js"
    import NotificationRoutes from "./routes/notificationRoutes.js"
    
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
    app.use('/api/driver', driverRoutes);
    app.use('/api/invoice', invoiceRoutes);
    app.use("/api/superadmin", PermissionsRoutes);
    app.use('/api/companies', companyRoutes);
    app.use('/api/pricing', pricingRoutes);
    app.use('/api/settings', settingsRoutes);
    app.use('/api/booking', bookingRoutes);
    app.use('/api/google', googleRoutes);
    app.use('/api/notification', NotificationRoutes);

    app.use('/api', userRoutes);

    // Serve static files (e.g., images) from the "uploads" directory
    app.use('/uploads', express.static('uploads'));

    app.use(errorHandler);

    // Server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      createSuperAdmin(); 
    });
