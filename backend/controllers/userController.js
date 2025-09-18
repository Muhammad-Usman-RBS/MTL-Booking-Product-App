import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Company from "../models/Company.js";
import sendEmail from "../utils/sendEmail.js";
import { ensureDeliverableEmailOrThrow } from "../utils/users/emailValidator.js";

// helpers
const genOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const EMAIL_MAX = 254;
const isValidEmail = (e) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(e) && e.length <= EMAIL_MAX;

const allowedPermissions = [
  "Users", "Home", "Bookings", "Rides", "Earnings", "Invoices", "Drivers",
  "Customers", "Company Accounts", "Statements", "Pricing", "Settings", "Widget/API", "Profile", "Logout",
];
const defaultPermissions = ["Home", "Profile", "Logout"];

// normalize helper
const normEmail = (e = "") => String(e).trim().toLowerCase();

// password policy (clientadmin only here; adjust if you want for others too)
const strongPwRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,16}$/;

// Initiate Verification
export const initiateUserVerification = async (req, res) => {
  try {
    const creator = req.user;
    const {
      fullName, email, password, role, status,
      permissions, associateAdminLimit, employeeNumber, vatnumber, googleCalendar
    } = req.body;

    if (!fullName?.trim()) return res.status(400).json({ message: "Full Name is required" });
    if (!email || !isValidEmail(email)) return res.status(400).json({ message: "Valid Email is required" });
    const emailNorm = normEmail(email);
    if (!role) return res.status(400).json({ message: "Role is required" });
    if (!status) return res.status(400).json({ message: "Status is required" });

    // Password policy for clientadmin
    if (role === "clientadmin") {
      if (!password || !strongPwRe.test(password)) {
        return res.status(400).json({
          message: "Password must be 8–16 chars with uppercase, lowercase, number & special char."
        });
      }
    }

    await ensureDeliverableEmailOrThrow(emailNorm);

    let existing;

    if (role === "clientadmin") {
      // clientadmins must be globally unique
      existing = await User.findOne({ email: emailNorm, role: "clientadmin" });
    } else {
      // others only need to be unique inside company
      existing = await User.findOne({ email: emailNorm, companyId: creator.companyId || null });
    }

    if (existing && existing.status !== "Pending") {
      return res.status(409).json({ message: "User already exists" });
    }

    // Permission validation
    let userPermissions = [...defaultPermissions];
    if (Array.isArray(permissions)) {
      const invalid = permissions.filter(p => !allowedPermissions.includes(p));
      if (invalid.length) {
        return res.status(400).json({ message: `Invalid permissions: ${invalid.join(", ")}` });
      }
      const filtered = permissions.filter(p => !defaultPermissions.includes(p));
      userPermissions = [...defaultPermissions, ...filtered];
    } else if (permissions !== undefined) {
      return res.status(400).json({ message: "Permissions must be an array of strings" });
    }

    // AssociateAdminLimit validation
    let parsedLimit = 0;
    if (role === "clientadmin") {
      if (associateAdminLimit !== undefined && associateAdminLimit !== null) {
        const pl = parseInt(associateAdminLimit);
        if (![0, 3, 5, 10].includes(pl)) {
          return res.status(400).json({ message: "associateAdminLimit must be one of 0, 3, 5, or 10" });
        }
        parsedLimit = pl;
      }
    }

    // CONDITION: OTP sirf tab chale jab superadmin → clientadmin/associateadmin
    const otpRequired =
      (creator.role === "superadmin" && role === "clientadmin") ||
      (creator.role === "clientadmin" && role === "associateadmin");

    if (!otpRequired) {
      // Baaki roles ke liye direct create kar dena (no OTP)
      const hashedPassword = password
        ? await bcrypt.hash(password, 10)
        : await bcrypt.hash(Math.random().toString(36), 10);

      const newUser = await User.create({
        fullName: fullName.trim(),
        email: emailNorm,
        password: hashedPassword,
        role,
        status,
        permissions: userPermissions,
        associateAdminLimit: parsedLimit,
        employeeNumber: role === "driver" ? (req.body.employeeNumber || employeeNumber) : null,
        vatnumber: role === "customer" ? (req.body.vatnumber || vatnumber) : null,
        createdBy: creator._id,
        companyId:
          creator.role === "superadmin" && role === "clientadmin" ? null : creator.companyId,
        ...(googleCalendar && {
          googleCalendar: {
            access_token: googleCalendar.access_token,
            refresh_token: googleCalendar.refresh_token,
            calendarId: googleCalendar.calendarId || "primary",
          },
        }),
      });

      await sendEmail(newUser.email, "Your Account Has Been Created", {
        title: "Welcome to MTL",
        subtitle: "Your account has been created successfully. You can now log in using the details below:",
        data: {
          Name: newUser.fullName,
          Email: newUser.email,
          Role: newUser.role,
          ...(password && { Password: password }),
          Login_Link: `${process.env.BASE_URL_FRONTEND}/login`,
        },
      });

      return res.status(201).json({
        message: "User created successfully (no OTP needed).",
        user: newUser,
      });
    }

    // OTP flow (superadmin → clientadmin/associateadmin)
    const otp = genOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000);

    const passwordHash = password
      ? await bcrypt.hash(password, 10)
      : await bcrypt.hash(Math.random().toString(36), 10);

    const companyId =
      (creator.role === "superadmin" && role === "clientadmin") ? null : creator.companyId;

    const pendingDoc = await User.findOneAndUpdate(
      { email: emailNorm },
      {
        $set: {
          email: emailNorm,
          fullName: fullName.trim(),
          password: passwordHash,
          role,
          status: "Pending",
          permissions: userPermissions,
          associateAdminLimit: parsedLimit,
          employeeNumber: role === "driver" ? (req.body.employeeNumber || employeeNumber) : null,
          vatnumber: role === "customer" ? (req.body.vatnumber || vatnumber) : null,
          createdBy: creator._id,
          companyId,
          ...(googleCalendar && googleCalendar.access_token && googleCalendar.refresh_token ? {
            googleCalendar: {
              access_token: googleCalendar.access_token,
              refresh_token: googleCalendar.refresh_token,
              calendarId: googleCalendar.calendarId || "primary",
            },
          } : {}),
          verification: {
            otpHash,
            otpExpiresAt,
            attempts: 0,
            lastSentAt: new Date(),
            tempPassword: password || undefined,
          },
        },
      },
      { new: true, upsert: !existing }
    );

    await sendEmail(emailNorm, "Verification User - OTP", {
      title: "Verify Your Account",
      subtitle: "Please use the following OTP to verify and complete user creation:",
      data: { "One-Time Password": otp, "Expires In": "2 minutes" },
    });

    return res.status(200).json({
      message: "OTP sent. Please verify to create user.",
      transactionId: pendingDoc._id.toString(),
    });

  } catch (err) {
    console.error("initiateUserVerification error:", err);
    if (err?.status) return res.status(err.status).json({ message: err.message });
    return res.status(500).json({ message: "Server error" });
  }
};

// Resend OTP
export const resendUserOtp = async (req, res) => {
  try {
    const { transactionId } = req.body;
    const user = await User.findById(transactionId);
    if (!user) return res.status(404).json({ message: "Pending request not found" });
    if (user.status !== "Pending" || !user.verification) {
      return res.status(400).json({ message: "No pending verification for this user." });
    }

    // throttle 60s
    const last = user.verification.lastSentAt ? user.verification.lastSentAt.getTime() : 0;
    if (Date.now() - last < 60 * 1000) {
      return res.status(429).json({ message: "Please wait a minute before requesting another OTP." });
    }

    const otp = genOtp();
    user.verification.otpHash = await bcrypt.hash(otp, 10);
    user.verification.otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000);
    user.verification.lastSentAt = new Date();
    user.verification.attempts = 0;
    await user.save();

    await sendEmail(user.email, "Verification User - OTP (Resent)", {
      title: "New OTP",
      subtitle: "Use this OTP to verify your account creation:",
      data: { "One-Time Password": otp, "Expires In": "2 minutes" },
    });

    return res.status(200).json({ message: "OTP resent." });
  } catch (err) {
    console.error("resendUserOtp error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Verify OTP & Create Actual User
export const verifyUserOtpAndCreate = async (req, res) => {
  try {
    const { transactionId, otp } = req.body;
    if (!transactionId || !otp) return res.status(400).json({ message: "transactionId and otp are required" });

    const user = await User.findById(transactionId).select("+password");
    if (!user) return res.status(404).json({ message: "Pending request not found" });
    if (user.status !== "Pending" || !user.verification) {
      return res.status(400).json({ message: "No pending verification for this user." });
    }

    if (user.verification.attempts >= 5) {
      await User.findByIdAndDelete(transactionId);
      return res.status(429).json({ message: "Too many incorrect attempts. Please start again." });
    }
    if (!user.verification.otpExpiresAt || user.verification.otpExpiresAt.getTime() < Date.now()) {
      await User.findByIdAndDelete(transactionId);
      return res.status(400).json({ message: "OTP expired. Please start again." });
    }

    const ok = await bcrypt.compare(otp, user.verification.otpHash);
    if (!ok) {
      user.verification.attempts += 1;
      await user.save();
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await ensureDeliverableEmailOrThrow(user.email);

    // capture temp password BEFORE clearing verification
    const passwordToEmail = user.verification?.tempPassword;
    const plainPassword = user.verification?.tempPassword || null;

    user.status = "Active";
    user.verifiedAt = new Date();
    user.verification = undefined; // wipe OTP + tempPassword
    await user.save();

    if (user.role === "clientadmin") {
      await Company.updateMany({ clientAdminId: user._id }, { $set: { status: user.status } });
    }

    await sendEmail(user.email, "Your Account Has Been Created", {
      title: "Welcome to MTL",
      subtitle: "Your account has been created successfully. You can now log in using the details below:",
      data: {
        Name: user.fullName,
        Email: user.email,
        Role: user.role,
        ...(passwordToEmail && { Password: passwordToEmail }),  // ← include if present
        Login_Link: `${process.env.BASE_URL_FRONTEND}/login`,
      },
    });

    return res.status(200).json({ message: "User verified & activated", user });
  } catch (err) {
    console.error("verifyUserOtpAndCreate error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// SuperAdmin or ClientAdmin Creates User (Direct)
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
    const creator = req.user; // defined early

    // basic gates
    if (!fullName?.trim()) {
      return res.status(400).json({ message: "Full Name is required" });
    }
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: "Valid Email is required" });
    }
    const emailNorm = normEmail(email);

    // Deliverability gate
    try {
      await ensureDeliverableEmailOrThrow(emailNorm);
    } catch (e) {
      return res
        .status(e?.status || 400)
        .json({ message: e?.message || "Email undeliverable" });
    }

    // Duplicate checks
    let userExists;
    if (role === "clientadmin") {
      // clientadmins must be globally unique
      userExists = await User.findOne({
        email: emailNorm,
        role: "clientadmin",
      });
    } else {
      // other roles must be unique per company
      userExists = await User.findOne({
        email: emailNorm,
        companyId: creator.companyId || null,
      });
    }

    if (userExists) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Role controls
    if (["driver", "customer"].includes(role)) {
      const allowedCreatorRoles = ["superadmin", "clientadmin", "associateadmin"];
      if (!allowedCreatorRoles.includes(creator.role)) {
        return res.status(403).json({
          message: `Creation of '${role}' accounts is restricted for ${creator.role}`,
        });
      }
    }

    if (["clientadmin", "associateadmin"].includes(creator.role)) {
      const allowedRoles = ["staffmember", "driver", "customer"];
      if (creator.role === "clientadmin") allowedRoles.push("associateadmin");

      if (!allowedRoles.includes(role)) {
        return res.status(403).json({
          message: `Unauthorized role assignment by ${creator.role}`,
        });
      }
    }

    // clientadmin password policy
    if (role === "clientadmin") {
      if (!password || !strongPwRe.test(password)) {
        return res.status(400).json({
          message:
            "Password must be 8–16 chars with uppercase, lowercase, number & special char.",
        });
      }
    }

    // associateAdminLimit
    let parsedLimit;
    if (role === "clientadmin") {
      if (associateAdminLimit !== undefined && associateAdminLimit !== null) {
        parsedLimit = parseInt(associateAdminLimit);
        if (![0, 3, 5, 10].includes(parsedLimit)) {
          return res.status(400).json({
            message: "associateAdminLimit must be one of 0, 3, 5, or 10",
          });
        }
      } else {
        parsedLimit = 0;
      }
    } else {
      parsedLimit = 0;
    }

    // enforce associateadmin creation limits
    if (creator.role === "clientadmin" && role === "associateadmin") {
      const creatorDoc = await User.findById(creator._id).lean();
      const allowed = creatorDoc?.associateAdminLimit || 0;

      const associateAdminCount = await User.countDocuments({
        createdBy: creator._id,
        role: "associateadmin",
        status: { $ne: "Deleted" },
      });

      if (allowed === 0) {
        return res.status(400).json({
          message: "This clientadmin is not allowed to create associateadmins (limit is 0).",
        });
      }

      if (associateAdminCount >= allowed) {
        return res.status(400).json({
          message: `Limit reached: Only ${allowed} associateadmin(s) allowed for this clientadmin.`,
        });
      }
    }

    // demo account limit
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

    // staffmember account limit
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
    const allowedPermissionsLocal = [...allowedPermissions];
    const defaultPermissionsLocal = [...defaultPermissions];
    let userPermissions = [...defaultPermissionsLocal];

    if (permissions && Array.isArray(permissions)) {
      const invalidPermissions = permissions.filter(
        (p) => !allowedPermissionsLocal.includes(p)
      );
      if (invalidPermissions.length > 0) {
        return res.status(400).json({
          message: `Invalid permissions provided: ${invalidPermissions.join(
            ", "
          )}`,
        });
      }

      const filteredPermissions = permissions.filter(
        (p) => !defaultPermissionsLocal.includes(p)
      );
      userPermissions = [...defaultPermissionsLocal, ...filteredPermissions];
    } else if (permissions !== undefined) {
      return res.status(400).json({
        message: "Permissions must be an array of strings",
      });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      employeeNumber: role === "driver" ? employeeNumber : undefined,
      fullName: fullName.trim(),
      email: emailNorm,
      password: hashedPassword,
      role,
      status,
      permissions: userPermissions,
      vatnumber: role === "customer" ? vatnumber : undefined,
      createdBy: creator._id,
      associateAdminLimit: parsedLimit,
      companyId:
        creator.role === "superadmin" && role === "clientadmin"
          ? null
          : creator.companyId,
      ...(googleCalendar && {
        googleCalendar: {
          access_token: googleCalendar.access_token,
          refresh_token: googleCalendar.refresh_token,
          calendarId: googleCalendar.calendarId || "primary",
        },
      }),
    });

    // Send email with credentials
    await sendEmail(newUser.email, "Your Account Has Been Created", {
      title: "Welcome to MTL",
      subtitle:
        "Your account has been created successfully. You can now log in using the details below:",
      data: {
        Name: newUser.fullName,
        Email: newUser.email,
        Role: newUser.role,
        Password: password,
        Login_Link: `${process.env.BASE_URL_FRONTEND}/login`,
      },
    });

    res.status(201).json({
      message: "User created successfully, email sent",
      user: newUser,
    });
  } catch (error) {
    console.error("Create User Error:", error);
    if (error?.status)
      return res.status(error.status).json({ message: error.message });
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
        { role: { $in: ["clientadmin", "demo"] } },
        { role: { $in: ["driver", "customer"] }, companyId: null },
      ];
    } else if (role === "clientadmin") {
      // Get all associateadmins created by this clientadmin
      const associateAdmins = await User.find({
        createdBy: userId,
        role: "associateadmin",
      });

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
  const { fullName, email, password, role, status, permissions, associateAdminLimit, vatnumber } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if ((user.status === "Pending" || user.status === "Deleted") && user.verification && status === "Active") {
      return res.status(400).json({
        message: "Cannot set status to Active — user has not completed OTP verification.",
      });
    }
    // fullName
    if (fullName?.trim()) user.fullName = fullName.trim();

    // email change handling
    if (email && email !== user.email) {
      if (!isValidEmail(email)) {
        return res.status(400).json({ message: "Valid Email is required" });
      }
      const emailNorm = normEmail(email);

      // duplicate?
      let dup;
      if (user.role === "clientadmin") {
        dup = await User.findOne({ email: emailNorm, role: "clientadmin", _id: { $ne: user._id } });
      } else {
        dup = await User.findOne({
          email: emailNorm,
          companyId: user.companyId || null,
          _id: { $ne: user._id }
        });
      }
      if (dup) return res.status(409).json({ message: "Email already in use" });

      // deliverability
      try {
        await ensureDeliverableEmailOrThrow(emailNorm);
      } catch (e) {
        return res.status(e?.status || 400).json({ message: e?.message || "Email looks undeliverable" });
      }

      user.email = emailNorm;
    }

    // role/status
    if (role) user.role = role;
    if (status) user.status = status;

    // permissions
    const defaultPermissions = ["Home", "Profile", "Logout"];
    if (Array.isArray(permissions)) {
      const finalPermissions = [...new Set([...defaultPermissions, ...permissions])];
      user.permissions = finalPermissions;
    } else if (permissions !== undefined) {
      return res.status(400).json({ message: "Permissions must be an array of strings" });
    }

    // associateAdminLimit guard for clientadmin
    if (associateAdminLimit !== undefined) {
      const parsed = parseInt(associateAdminLimit);
      if (role === "clientadmin") {
        if (![0, 3, 5, 10].includes(parsed)) {
          return res.status(400).json({ message: "associateAdminLimit must be one of 0, 3, 5, or 10" });
        }
        user.associateAdminLimit = parsed;
      } else {
        user.associateAdminLimit = 0; // keep consistent with schema default
      }
    }

    // password
    let plainPassword;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
      plainPassword = password;
    }

    // customer-only VAT
    if (role === "customer") user.vatnumber = vatnumber ?? user.vatnumber;

    await user.save();

    if (user.role === "clientadmin") {
      await Company.updateMany({ clientAdminId: user._id }, { $set: { status: user.status } });
    }

    await sendEmail(user.email, "Your Account Has Been Updated", {
      title: "Account Updated Successfully",
      subtitle: "Your account details have been updated.",
      data: {
        Name: user.fullName,
        Email: user.email,
        Role: user.role,
        Status: user.status,
        ...(plainPassword && { Password: plainPassword }),
        Login_Link: `${process.env.BASE_URL_FRONTEND || "https://yourapp.com"}/login`,
      },
    });

    res.status(200).json({
      message: "User updated successfully, email sent",
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

  // basic format check
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Valid Email is required" });
  }

  const emailNorm = normEmail(email);

  // Deep deliverability (deep-email-validator)
  try {
    await ensureDeliverableEmailOrThrow(emailNorm);
  } catch (e) {
    return res.status(e?.status || 400).json({ message: e?.message || "Email looks undeliverable" });
  }

  try {
    // duplicate check on normalized email
    const userExists = await User.findOne({ email: emailNorm });
    if (userExists) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // (optional) enforce basic password policy for widget users
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName: fullName.trim(),
      email: emailNorm,                 // store normalized email
      password: hashedPassword,
      role: "customer",
      status: "Active",
      permissions: ["Home", "Profile", "Logout"],
      createdBy: null, // widget
      companyId,
      associateAdminLimit: 0,
    });

    // (optional) send welcome email
    // await sendEmail(newUser.email, "Welcome", { title:"Welcome", data: { Name: newUser.fullName }});

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