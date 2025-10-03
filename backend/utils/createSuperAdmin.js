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
      superadminCompanyName: process.env.SUPERADMIN_COMPANY_NAME || "Mega Transfers ",
      superadminCompanyAddress: process.env.SUPERADMIN_COMPANY_ADDRESS || " 1st Floor, 29 Minerva Road, London, England, NW10 6HJ VAT Number - 442612419",
      superadminCompanyPhoneNumber: process.env.SUPERADMIN_COMPANY_PHONE || "",
      superadminCompanyEmail: process.env.SUPERADMIN_COMPANY_EMAIL || "",
      superadminCompanyWebsite: process.env.SUPERADMIN_COMPANY_WEBSITE || "",
    });
    console.log('Super Admin Created');
  }
};

export default createSuperAdmin;