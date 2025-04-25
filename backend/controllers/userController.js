import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// ✅ SuperAdmin Creates New User
export const createUserBySuperAdmin = async (req, res) => {
    const { fullName, email, password, role, status, permissions } = req.body;

    if (!["clientadmin", "customer", "driver"].includes(role)) {
        return res.status(400).json({ message: "Only clientadmin, customer, and driver can be created by superadmin." });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(409).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            fullName: fullName,
            email,
            password: hashedPassword,
            role,
            status,
            permissions,
        });

        res.status(201).json({
            message: `${role} account created successfully`,
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
        console.error("Create user error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ✅ Get All ClientAdmins (GET /api/create-clientadmin)
export const getClientAdmins = async (req, res) => {
    try {
        const clientAdmins = await User.find({ role: { $in: ['clientadmin', 'superadmin', 'driver', 'customer'] } });

        res.status(200).json(clientAdmins.map(user => ({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            permissions: user.permissions,
            status: user.status,
        })));
    } catch (error) {
        console.error("Fetch clientadmins error:", error);
        res.status(500).json({ message: "Failed to fetch client admins" });
    }
};
