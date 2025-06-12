import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const createSuperAdmin = async () => {
  const email = process.env.SUPERADMINEMAIL; 
  const password = process.env.SUPERADMINPSW; 

  const existing = await User.findOne({ email });
  const allowedPermissions = [
    "Home", "Users", "Bookings", "Invoices", "Drivers", "Customers",
    "Company Accounts", "Statements", "Pricing",
    "Settings", "Widget/API", "Profile", "Logout"
];

  if (!existing) {
    const hashed = await bcrypt.hash(password, 10);
    await User.create({
      email,
      password: hashed,
      role: 'superadmin',
      permissions: allowedPermissions 
    });
    console.log('Super Admin Created'); // Confirmation message
  }
};

export default createSuperAdmin;