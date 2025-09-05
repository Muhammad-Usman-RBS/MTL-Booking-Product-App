import User from "../models/User.js";
import Company from "../models/Company.js";
import bcrypt from "bcryptjs";
import driver from "../models/Driver.js";
import mongoose from 'mongoose';
import { initializeDefaultThemes } from "./settings/themeController.js";
// SuperAdmin or ClientAdmin Creates User
export const createUserBySuperAdmin = async (req, res) => {
  const {
    fullName,
    email,
    password,
    role,
    status,
    permissions,
    associateAdminLimit,
    employeeNumber,
    googleCalendar,
    vatnumber,
  } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(409).json({ message: "User already exists" });

    const creator = req.user;

    // ❌ Globally disallowed roles
    if (["driver", "customer"].includes(role)) {
      const allowedCreatorRoles = [
        "superadmin",
        "clientadmin",
        "associateadmin",
      ];
      if (!allowedCreatorRoles.includes(creator.role)) {
        return res.status(403).json({
          message: `Creation of '${role}' accounts is restricted for ${creator.role}`,
        });
      }
    }

    // Role assignment rules based on creator's role
    if (["clientadmin", "associateadmin"].includes(creator.role)) {
      const allowedRoles = ["staffmember", "driver", "customer"];
      if (creator.role === "clientadmin") allowedRoles.push("associateadmin");

      if (!allowedRoles.includes(role)) {
        return res.status(403).json({
          message: `Unauthorized role assignment by ${creator.role}`,
        });
      }
    }

    // Validate associateAdminLimit only for specific roles
    let parsedLimit;
    if (["clientadmin", "manager"].includes(role)) {
      parsedLimit = parseInt(associateAdminLimit);
      if (![5, 10, 15].includes(parsedLimit)) {
        return res.status(400).json({
          message: "associateAdminLimit must be one of 5, 10, or 15",
        });
      }
    }

    // Enforce associateadmin creation limits for clientadmin
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

    // Role-based limits
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

    // Permission validation
    const allowedPermissions = [
      "Users",
      "Home",
      "Bookings",
      "Rides",
      "Earnings",
      "Invoices",
      "Drivers",
      "Customers",
      "Company Accounts",
      "Statements",
      "Pricing",
      "Settings",
      "Widget/API",
      "Profile",
      "Logout",
    ];

    const defaultPermissions = ["Home", "Profile", "Logout"];
    let userPermissions = [...defaultPermissions];

    if (permissions && Array.isArray(permissions)) {
      const invalidPermissions = permissions.filter(
        (p) => !allowedPermissions.includes(p)
      );
      if (invalidPermissions.length > 0) {
        return res.status(400).json({
          message: `Invalid permissions provided: ${invalidPermissions.join(
            ", "
          )}`,
        });
      }

      const filteredPermissions = permissions.filter(
        (p) => !defaultPermissions.includes(p)
      );
      userPermissions = [...defaultPermissions, ...filteredPermissions];
    } else if (permissions !== undefined) {
      return res.status(400).json({
        message: "Permissions must be an array of strings",
      });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      employeeNumber: role === "driver" ? employeeNumber : undefined,
      fullName,
      email,
      password: hashedPassword,
      role,
      status,
      permissions: userPermissions,
      vatnumber: role === "customer" ? vatnumber : undefined,
      createdBy: creator._id,
      associateAdminLimit: ["clientadmin", "manager"].includes(role)
        ? parsedLimit
        : undefined,
      companyId:
        creator.role === "superadmin" && role === "clientadmin"
          ? null
          : creator.companyId,
      ...(googleCalendar && {
        googleCalendar: {
          access_token: googleCalendar.access_token,
          refresh_token: googleCalendar.refresh_token,
          calendarId: googleCalendar.calendarId || "primary",
        }
      }),
    });
    if (newUser.role === "demo") {
      newUser.companyId = new mongoose.Types.ObjectId();
      await newUser.save();
      await initializeDefaultThemes(newUser.companyId);

    }

    res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Create User Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET All Users
export const getClientAdmins = async (req, res) => {
  try {
    const { role, companyId, _id: userId } = req.user;
    let query = {};

    if (role === "superadmin") {
      query.$or = [
        { role: { $in: ["clientadmin", "manager", "demo"] } },
        { role: { $in: ["driver", "customer"] }, companyId: null },
      ];
    } else if (role === "manager") {
      query.companyId = companyId;
      query.role = {
        $in: ["clientadmin", "manager", "demo", "driver", "customer"],
      };
    } else if (role === "clientadmin") {
      // Get all associateadmins created by this clientadmin
      const associateAdmins = await User.find({
        createdBy: userId,
        role: "associateadmin",
      });
      const associateAdminIds = associateAdmins.map((user) => user._id);

      query = {
        $or: [
          { 
            createdBy: userId,
            role: { $in: ["associateadmin", "staffmember", "driver", "customer"] }
          },
          { 
            role: "customer", 
            companyId: companyId, 
            createdBy: null // widget-based customers for this company only
          }
        ]
      };
    } else if (role === "associateadmin") {
      // Associateadmin can only see users they created + their own record
      query = {
        $or: [
          { createdBy: userId }, // Users created by this associateadmin
          { _id: userId }, // Their own record
        ],
        role: { $in: ["associateadmin", "staffmember", "driver", "customer"] },
      };
    } else {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const users = await User.find(query);

    return res.status(200).json(
      users.map((user) => ({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        status: user.status,
        companyId: user.companyId,
        associateAdminLimit: user.associateAdminLimit,
        vatnumber: user.vatnumber || null,
        createdBy: user.createdBy, // Include this for debugging
      }))
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// Get associates of a given clientadmin (optionally scoped by companyId)
export const getAssociateAdmins = async (req, res) => {
  try {
    const requester = req.user; // { _id, role, companyId }
    const { createdBy, companyId } = req.query;

    if (!createdBy) {
      return res.status(400).json({ message: "createdBy (clientAdminId) is required" });
    }

    // Security: clientadmin can only query their own associates
    if (requester.role === "clientadmin" && String(requester._id) !== String(createdBy)) {
      return res.status(403).json({ message: "You can only view your own associates." });
    }

    // Build query
    const query = {
      role: "associateadmin",
      status: { $ne: "Deleted" },
      createdBy, // who created these associates (clientadmin id)
    };

    if (companyId) {
      query.companyId = companyId;
    }

    const associates = await User.find(query)
      .select("_id fullName email role status companyId createdBy")
      .sort({ createdAt: -1 });

    return res.status(200).json(associates);
  } catch (error) {
    console.error("getAssociateAdmins error:", error);
    return res.status(500).json({ message: "Failed to fetch associates" });
  }
};

// Update User
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
    vatnumber,
  } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.role = role || user.role;
    user.status = status || user.status;
    user.vatnumber = role === "customer" ? vatnumber : user.vatnumber;
    // user.permissions = permissions || user.permissions;
    const defaultPermissions = ["Home", "Profile", "Logout"];

    if (permissions && Array.isArray(permissions)) {
      // Ensure default permissions are preserved
      const finalPermissions = [
        ...new Set([...defaultPermissions, ...permissions]),
      ];
      user.permissions = finalPermissions;
    } else if (permissions !== undefined) {
      // If permissions are explicitly sent as something invalid
      return res.status(400).json({
        message: "Permissions must be an array of strings",
      });
    }

    // Validate and assign associateAdminLimit
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
        vatnumber: user.vatnumber || null,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete User
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

// Get All Users (REGARDLESS OF ROLE)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      status: { $ne: "Deleted" },
      role: { $ne: "superadmin" }, // Exclude superadmin
    }).select("-password -__v");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
}

// GET All Users with Role = "driver"
export const getAllDrivers = async (req, res) => {
  try {
    const drivers = await User.find({
      role: { $exists: true, $eq: "driver" },
      status: { $ne: "Deleted" },
    }).select("-password -__v");

    res.status(200).json({
      message: "Drivers fetched successfully",
      count: drivers.length,
      drivers,
    });
  } catch (error) {
    console.error("Error fetching drivers:", error);
    res.status(500).json({ message: "Failed to fetch drivers" });
  }
};

// GET All Users with Role = "customer"
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({
      role: "customer",
      status: { $ne: "Deleted" },
    }).select("-password -__v");

    res.status(200).json({
      message: "Customers fetched successfully",
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
};

// Widget-based public customer creation
export const createCustomerViaWidget = async (req, res) => {
  const { fullName, email, password, companyId } = req.body;

  if (!fullName || !email || !password || !companyId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: "customer",
      status: "Active",
      permissions: ["Home", "Profile", "Logout"],
      createdBy: null, // since this is a widget
      companyId,
      associateAdminLimit: 0,
    });

    res.status(201).json({
      message: "Customer created successfully",
      user: {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        companyId: newUser.companyId,
        associateAdminLimit: newUser.associateAdminLimit,
      },
    });
  } catch (error) {
    console.error("Widget Customer Creation Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};