import User from '../models/User.js';
import Company from '../models/Company.js';
import bcrypt from 'bcryptjs';

// ✅ SuperAdmin or ClientAdmin Creates User
export const createUserBySuperAdmin = async (req, res) => {
  const {
    fullName,
    email,
    password,
    role,
    status,
    permissions,
    associateAdminLimit,
  } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(409).json({ message: "User already exists" });

    const creator = req.user;

    // ❌ Globally disallowed roles
    if (["driver", "customer"].includes(role)) {
      const allowedCreatorRoles = ["superadmin", "clientadmin", "associateadmin"];
      if (!allowedCreatorRoles.includes(creator.role)) {
        return res.status(403).json({
          message: `Creation of '${role}' accounts is restricted for ${creator.role}`,
        });
      }
    }

    // ✅ Role assignment rules based on creator's role
    if (["clientadmin", "associateadmin"].includes(creator.role)) {
      const allowedRoles = ["staffmember", "driver", "customer"];
      if (creator.role === "clientadmin") allowedRoles.push("associateadmin");

      if (!allowedRoles.includes(role)) {
        return res.status(403).json({
          message: `Unauthorized role assignment by ${creator.role}`,
        });
      }
    }

    // ✅ Validate associateAdminLimit only for specific roles
    let parsedLimit;
    if (["clientadmin", "manager"].includes(role)) {
      parsedLimit = parseInt(associateAdminLimit);
      if (![5, 10, 15].includes(parsedLimit)) {
        return res.status(400).json({
          message: "associateAdminLimit must be one of 5, 10, or 15",
        });
      }
    }

    // ✅ Enforce associateadmin creation limits for clientadmin
    if (creator.role === "clientadmin" && role === "associateadmin") {
      const associateAdminCount = await User.countDocuments({
        createdBy: creator._id,
        role: "associateadmin",
        status: { $ne: "Deleted" },
      });

      const allowed = creator.associateAdminLimit || 5;
      if (associateAdminCount >= allowed) {
        return res.status(400).json({
          message: `Limit reached: Only ${allowed} associateadmin(s) allowed for this clientadmin.`,
        });
      }
    }

    // ✅ Role-based limits
    if (role === "manager") {
      const count = await User.countDocuments({
        role: "manager",
        companyId: creator.companyId || null,
      });
      if (count >= 3) {
        return res.status(400).json({
          message: "Only 3 Manager accounts allowed per company",
        });
      }
    }

    if (role === "demo") {
      const count = await User.countDocuments({
        role: "demo",
        companyId: creator.companyId || null,
      });
      if (count >= 2) {
        return res.status(400).json({
          message: "Only 2 Demo accounts allowed per company",
        });
      }
    }

    if (role === "staffmember") {
      const count = await User.countDocuments({
        role: "staffmember",
        companyId: creator.companyId,
      });
      if (count >= 2) {
        return res.status(400).json({
          message: "Only 2 staffmembers allowed per company",
        });
      }
    }

    // ✅ Permission validation
    const allowedPermissions = [
      "Users", "Home", "Bookings", "Rides", "Earnings", "Invoices", "Drivers", "Customers",
      "Company Accounts", "Statements", "Pricing",
      "Settings", "Widget/API", "Profile", "Logout"
    ];

    const defaultPermissions = ["Home", "Profile", "Logout"];
    let userPermissions = [...defaultPermissions];

    if (permissions && Array.isArray(permissions)) {
      const invalidPermissions = permissions.filter(p => !allowedPermissions.includes(p));
      if (invalidPermissions.length > 0) {
        return res.status(400).json({
          message: `Invalid permissions provided: ${invalidPermissions.join(', ')}`
        });
      }

      const filteredPermissions = permissions.filter(p => !defaultPermissions.includes(p));
      userPermissions = [...defaultPermissions, ...filteredPermissions];
    } else if (permissions !== undefined) {
      return res.status(400).json({
        message: "Permissions must be an array of strings"
      });
    }

    // ✅ Create user
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role,
      status,
      permissions: userPermissions,
      createdBy: creator._id,
      associateAdminLimit: ["clientadmin", "manager"].includes(role) ? parsedLimit : undefined,
      companyId:
        creator.role === "superadmin" && role === "clientadmin"
          ? null
          : creator.companyId,
    });

    // If new clientadmin, set their own _id as companyId
    // if (newUser.role === "clientadmin" && !newUser.companyId) {
    //   newUser.companyId = newUser._id;
    //   await newUser.save();
    // }

    res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });

  } catch (error) {
    console.error("Create User Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET All Users
export const getClientAdmins = async (req, res) => {
  try {
    const { role, companyId, _id: userId } = req.user;
    let query = {};

    if (role === "superadmin") {
      query.$or = [
        { role: { $in: ['clientadmin', 'manager', 'demo'] } },
        { role: { $in: ['driver', 'customer'] }, companyId: null }
      ];
    } else if (role === "manager") {
      query.companyId = companyId;
      query.role = { $in: ['clientadmin', 'manager', 'demo', 'driver', 'customer'] };
    } else if (role === "clientadmin") {
      // ✅ Get all users created by clientadmin OR by any of their associateadmins
      const associateAdmins = await User.find({ createdBy: userId, role: 'associateadmin' });
      const associateAdminIds = associateAdmins.map(user => user._id);

      query = {
        createdBy: userId, // only direct creations
        role: { $in: ['associateadmin', 'staffmember', 'driver', 'customer'] }
      };
    }
    else if (role === "associateadmin") {
      query = {
        $or: [
          { createdBy: userId },
          { _id: userId } // So they can also see their own record
        ],
        role: { $in: ['associateadmin', 'staffmember', 'driver', 'customer'] }
      };
    }
    else {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const users = await User.find(query);

    return res.status(200).json(
      users.map(user => ({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        status: user.status,
        companyId: user.companyId,
        associateAdminLimit: user.associateAdminLimit,
      }))
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// ✅ Update User
export const updateUserBySuperAdmin = async (req, res) => {
  const { id } = req.params;
  const {
    fullName,
    email,
    password,
    role,
    status,
    permissions,
    associateAdminLimit,
  } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.role = role || user.role;
    user.status = status || user.status;
    user.permissions = permissions || user.permissions;

    // ✅ Validate and assign associateAdminLimit
    if (typeof associateAdminLimit !== "undefined") {
      const parsedLimit = parseInt(associateAdminLimit);
      if (["clientadmin", "manager"].includes(role)) {
        if (![5, 10, 15].includes(parsedLimit)) {
          return res.status(400).json({
            message: "associateAdminLimit must be one of 5, 7, or 10",
          });
        }
        user.associateAdminLimit = parsedLimit;
      } else {
        user.associateAdminLimit = undefined;
      }
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();

    if (user.role === "clientadmin") {
      await Company.updateMany(
        { clientAdminId: user._id },
        { $set: { status: user.status } }
      );
    }

    res.status(200).json({
      message: "User updated successfully",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        status: user.status,
        associateAdminLimit: user.associateAdminLimit,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete User
export const deleteUserBySuperAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
