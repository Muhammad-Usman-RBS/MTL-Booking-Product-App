import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// ✅ SuperAdmin Creates New User
export const createUserBySuperAdmin = async (req, res) => {
    const { fullName, email, password, role, status, permissions } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(409).json({ message: "User already exists" });

        const creatorRole = req.user.role;

        // Superadmin and Manager can create same roles
        if (["superadmin", "manager"].includes(creatorRole)) {
            if (!["clientadmin", "manager", "demo", "driver", "customer"].includes(role)) {
                return res.status(400).json({ message: "Role not allowed" });
            }
        }
        // Clientadmin specific
        else if (creatorRole === "clientadmin") {
            if (!["staffmember", "driver", "customer"].includes(role)) {
                return res.status(400).json({ message: `ClientAdmin can only create HR (staffmember), Driver, Customer` });
            }
        }
        else {
            return res.status(403).json({ message: "You are not allowed to create users" });
        }

        // Limits Checking
        if (role === "manager") {
            const count = await User.countDocuments({ role: "manager", companyId: req.user.companyId || null });
            if (count >= 3) {
                return res.status(400).json({ message: "Only 3 Manager accounts allowed per company" });
            }
        }
        if (role === "demo") {
            const count = await User.countDocuments({ role: "demo", companyId: req.user.companyId || null });
            if (count >= 2) {
                return res.status(400).json({ message: "Only 2 Demo accounts allowed per company" });
            }
        }
        if (role === "staffmember") {
            const count = await User.countDocuments({ role: "staffmember", companyId: req.user.companyId });
            if (count >= 2) {
                return res.status(400).json({ message: "Only 2 staffmembers allowed per company" });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            fullName,
            email,
            password: hashedPassword,
            role,
            status,
            permissions,
            companyId: req.user.role === "superadmin" && role === "clientadmin" ? null : req.user.companyId,
        });

        if (newUser.role === "clientadmin" && !newUser.companyId) {
            newUser.companyId = newUser._id;
            await newUser.save();
        }

        res.status(201).json({ message: "User created successfully", user: newUser });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// export const getClientAdmins = async (req, res) => {
//     try {
//         let query = {
//             role: { $in: ['clientadmin', 'manager', 'demo', 'staffmember', 'driver', 'customer'] }
//         };

//         if (req.user.role === "manager" || req.user.role === "clientadmin") {
//             query.companyId = req.user.companyId; // Managers, ClientAdmins limited to their company
//         }

//         const users = await User.find(query);

//         res.status(200).json(users.map(user => ({
//             _id: user._id,
//             fullName: user.fullName,
//             email: user.email,
//             role: user.role,
//             permissions: user.permissions,
//             status: user.status,
//             companyId: user.companyId,
//         })));
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Failed to fetch users" });
//     }
// };

// ✅ Update User by SuperAdmin


export const getClientAdmins = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === "superadmin") {
            // ✅ SuperAdmin sees ONLY personal (own created) users
            query = {
                $or: [
                    { role: { $in: ['clientadmin', 'manager', 'demo'] } }, // Global users (ClientAdmins/Managers/Demo accounts)
                    {
                        role: { $in: ['driver', 'customer'] },
                        companyId: null  // Personal Drivers and Customers only
                    }
                ]
            };

        } else if (req.user.role === "manager") {
            // ✅ Manager sees their own company's users
            query.companyId = req.user.companyId;
            query.role = { $in: ['clientadmin', 'manager', 'demo', 'driver', 'customer'] };
        } else if (req.user.role === "clientadmin") {
            // ✅ ClientAdmin sees his own company's users
            query.companyId = req.user.companyId;
            query.role = { $in: ['staffmember', 'driver', 'customer'] };
        } else {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        const users = await User.find(query);

        res.status(200).json(users.map(user => ({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            permissions: user.permissions,
            status: user.status,
            companyId: user.companyId,
        })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
};



export const updateUserBySuperAdmin = async (req, res) => {
    const { id } = req.params;
    const { fullName, email, password, role, status, permissions } = req.body;

    try {
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.role = role || user.role;
        user.status = status || user.status;
        user.permissions = permissions || user.permissions;

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        await user.save();

        res.status(200).json({
            message: "User updated successfully",
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                permissions: user.permissions,
                status: user.status,
            },
        });
    } catch (error) {
        console.error("Update user error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ✅ Delete User by SuperAdmin
export const deleteUserBySuperAdmin = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await User.findByIdAndDelete(id);  // 🛠️ Correct method

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({ message: "Server error" });
    }
};



