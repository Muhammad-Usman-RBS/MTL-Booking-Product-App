// import User from '../models/User.js';
// import bcrypt from 'bcryptjs';

// // Function to create a default super admin if it doesn't already exist
// const createSuperAdmin = async () => {
//   const email = process.env.superAdminEmail; // Hardcoded super admin email
//   const password = process.env.superAdminPsw; // Hardcoded password (should be kept secure or moved to .env)

//   const existing = await User.findOne({ email });

//   if (!existing) {
//     const hashed = await bcrypt.hash(password, 10); // Hash the password using bcrypt
//     await User.create({
//       email,
//       password: hashed,
//       role: 'superadmin', // Assign 'superadmin' role
//     });
//     console.log('Super Admin Created'); // Confirmation message
//   }
// };

// export default createSuperAdmin;




import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Function to create a default super admin if it doesn't already exist
const createSuperAdmin = async () => {
  const email = process.env.superAdminEmail; // Hardcoded super admin email
  const password = process.env.superAdminPsw; // Hardcoded password (should be kept secure or moved to .env)

  const existing = await User.findOne({ email });
  const allowedPermissions = [
    "Home", "Users", "Bookings", "Invoices", "Drivers", "Customers",
    "Company Accounts", "Statements", "Pricing",
    "Settings", "Widget/API", "Profile", "Logout"
];

  if (!existing) {
    const hashed = await bcrypt.hash(password, 10); // Hash the password using bcrypt
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