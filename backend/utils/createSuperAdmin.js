import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const createSuperAdmin = async () => {
  const email = process.env.SUPERADMINEMAIL;
  const password = process.env.SUPERADMINPSW;
  if (!password) {
    throw new Error("SUPERADMINPSW is not defined in .env file");
  }

  const existing = await User.findOne({ email });
  const allowedPermissions = [
    "Home", "Users", "Bookings", "Invoices", "Drivers", "Customers",
    "Company Accounts", "Statements", "Pricing",
    "Settings", "Widget/API", "Profile", "Logout", "Permissions"
  ];

  if (!existing) {
    const hashed = await bcrypt.hash(password, 10);
    await User.create({
      email,
      fullName: 'Super Admin',
      password: hashed,
      role: 'superadmin',
      status: "Active",
      permissions: allowedPermissions,
      superadminCompanyName: process.env.SUPERADMIN_COMPANY_NAME || "Default Company Name",
      superadminCompanyAddress: process.env.SUPERADMIN_COMPANY_ADDRESS || "Default Company Address",
      superadminCompanyPhoneNumber: process.env.SUPERADMIN_COMPANY_PHONE || "000-000-0000",
      superadminCompanyEmail: process.env.SUPERADMIN_COMPANY_EMAIL || "admin@company.com",
      superadminCompanyWebsite: process.env.SUPERADMIN_COMPANY_WEBSITE || "https://www.company.com",
    });
    console.log('Super Admin Created');
  }
};

export default createSuperAdmin;