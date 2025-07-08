import User from "../models/User.js";

export const updateSuperAdminPermissions = async (req, res) => {
  try {
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ message: "Permissions must be an array." });
    }

    const superadmin = await User.findOne({ role: "superadmin" });

    if (!superadmin) {
      return res.status(404).json({ message: "Superadmin not found." });
    }

    superadmin.permissions = permissions;
    await superadmin.save();

    res.status(200).json({
      message: "Superadmin permissions updated successfully.",
      updatedPermissions: superadmin.permissions,
    });
  } catch (error) {
    console.error("Failed to update superadmin permissions:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

