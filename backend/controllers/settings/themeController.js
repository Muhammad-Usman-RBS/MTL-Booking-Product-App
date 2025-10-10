import Theme from "../../models/settings/Theme.js";

const DEFAULT_THEMES = [
  {
    name: "Dark Theme 9",
    themeSettings: {
      bg: "#1e1e1e",
      text: "#f1efef",
      primary: "#ba090a",
      hover: "#930000",
      active: "#930000",
    },
    isDefault: true,
  },
  {
    name: "Light Theme 1",
    themeSettings: {
      bg: "#f5f9fa",
      text: "#1e1e1e",
      primary: "#a5d8dd",
      hover: "#a5d8dd",
      active: "#a5d8dd",
    },
    isDefault: true,
  },
  {
    name: "Dark Theme 2",
    themeSettings: {
      bg: "#07384d",
      text: "#f1efef",
      primary: "#01f5fe",
      hover: "#003353",
      active: "#064f7c",
    },
    isDefault: true,
  },
];

export const initializeDefaultThemes = async (companyId) => {
  try {
    const existingDefaultThemes = await Theme.find({
      companyId,
      isDefault: true,
    });
    if (existingDefaultThemes.length === 0) {
      const defaultThemesWithCompany = DEFAULT_THEMES.map((theme) => ({
        ...theme,
        companyId,
      }));
      await Theme.insertMany(defaultThemesWithCompany);
    }
    const appliedTheme = await Theme.findOne({
      companyId,
      $or: [{ lastApplied: true }, { isActive: true }],
    });
    if (!appliedTheme) {
      const darkTheme9 = await Theme.findOne({
        companyId,
        name: "Dark Theme 9",
        isDefault: true,
      });
      if (darkTheme9) {
        await Theme.updateOne(
          { _id: darkTheme9._id },
          { $set: { lastApplied: true, isActive: true } }
        );
      }
    }
  } catch (error) {
  }
};

const isValidHexColor = (color) => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

const validateThemeSettings = (themeSettings) => {
  const requiredKeys = ["bg", "text", "primary", "hover", "active"];
  if (!themeSettings || typeof themeSettings !== "object") {
    return { isValid: false, message: "Theme settings must be an object" };
  }
  for (const key of requiredKeys) {
    if (!themeSettings[key]) {
      return { isValid: false, message: `Missing required color: ${key}` };
    }
    if (!isValidHexColor(themeSettings[key])) {
      return {
        isValid: false,
        message: `Invalid hex color format for ${key}: ${themeSettings[key]}`,
      };
    }
  }
  return { isValid: true };
};

export const saveTheme = async (req, res) => {
  try {
    const { companyId, themeSettings } = req.body;
    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID is required",
      });
    }
    if (!themeSettings) {
      return res.status(400).json({
        success: false,
        message: "Theme settings are required",
      });
    }
    const validation = validateThemeSettings(themeSettings);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }
    await initializeDefaultThemes(companyId);
    const customThemeCount = await Theme.countDocuments({
      companyId,
      isDefault: { $ne: true },
    });
    if (customThemeCount >= 2) {
      return res.status(400).json({
        success: false,
        message:
          "Custom theme limit reached (max 2 custom themes allowed). Delete a previous custom theme to save a new one.",
      });
    }
    const { themeId } = req.body;
    if (themeId) {
      const existing = await Theme.findOne({ _id: themeId, companyId });
      if (!existing) {
        return res
          .status(404)
          .json({ success: false, message: "Theme not found" });
      }
      if (existing.isDefault) {
        const customThemeCount = await Theme.countDocuments({
          companyId,
          isDefault: { $ne: true },
        });
        if (customThemeCount >= 2) {
          return res.status(400).json({
            success: false,
            message:
              "Custom theme limit reached (max 2 custom themes allowed). Delete a previous custom theme to save a new one.",
          });
        }
        const created = await Theme.create({
          companyId,
          themeSettings,
          isDefault: false,
        });
        return res.status(201).json({
          success: true,
          message: "Custom theme saved successfully",
          data: created.themeSettings,
          id: created._id,
        });
      } else {
        const updated = await Theme.findOneAndUpdate(
          { _id: themeId, companyId, isDefault: { $ne: true } },
          { $set: { themeSettings } },
          { new: true }
        );
        return res.status(200).json({
          success: true,
          message: "Custom theme updated successfully",
          data: updated.themeSettings,
        });
      }
    }
    const created = await Theme.create({
      companyId,
      themeSettings,
      isDefault: false,
    });
    return res.status(201).json({
      success: true,
      message: "Custom theme saved successfully",
      data: created.themeSettings,
      id: created._id,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }
    return res.status(500).json({
      success: false,
      message: "Server error while saving theme settings",
    });
  }
};
export const getTheme = async (req, res) => {
  try {
    const { companyId } = req.params;
    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID is required",
      });
    }
    const theme = await Theme.findOne({ companyId });
    if (theme) {
      return res.status(200).json({
        success: true,
        message: "Theme settings retrieved successfully",
        data: theme.themeSettings,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "No custom theme found, returning default theme",
        data: DEFAULT_THEMES,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching theme settings",
    });
  }
};

export const getThemeHistory = async (req, res) => {
  try {
    const { companyId } = req.params;
    if (!companyId) {
      return res
        .status(400)
        .json({ success: false, message: "Company ID is required" });
    }

    const history = await Theme.find({ companyId })
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      message: "Theme history retrieved successfully",
      data: history,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching theme history",
    });
  }
};

export const deleteTheme = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const { id } = req.params;
    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID is required",
      });
    }
    const theme = await Theme.findOne({ _id: id, companyId });
    if (!theme) {
      return res.status(404).json({
        success: false,
        message: "Theme not found",
      });
    }
    if (theme.isDefault) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete default themes",
      });
    }
    await Theme.deleteOne({ _id: id, companyId });
    return res.status(200).json({
      success: true,
      message: "Custom theme deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while deleting theme",
    });
  }
};

export const applyTheme = async (req, res) => {
  try {
    const { companyId, themeId } = req.params;
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    if (!req.user.companyId) {
      return res.status(400).json({ message: "User has no company ID" });
    }
    if (String(req.user.companyId) !== String(companyId)) {
      return res.status(403).json({
        message: "Forbidden",
        debug: {
          userCompanyId: String(req.user.companyId),
          requestedCompanyId: String(companyId),
          userCompanyIdLength: String(req.user.companyId).length,
          requestedCompanyIdLength: String(companyId).length,
        },
      });
    }
    await Theme.updateMany(
      { companyId },
      { $set: { lastApplied: false, isActive: false } }
    );
    const theme = await Theme.findOneAndUpdate(
      { _id: themeId, companyId },
      { $set: { lastApplied: true, isActive: true } },
      { new: true }
    );

    if (!theme) return res.status(404).json({ message: "Theme not found" });
    return res.json({ theme });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

export const getCurrentTheme = async (req, res) => {
  try {
    const cidFromParam = req.params?.companyId;
    const cidFromQuery = req.query?.companyId;
    const cidFromUser = req.user?.companyId;
    const companyId = String(cidFromParam || cidFromQuery || cidFromUser || "");
    if (!companyId) {
      return res.status(400).json({ message: "companyId is required" });
    }
    const userRole = req.user?.role;
    let theme;
    if (userRole === "driver" || userRole === "customer") {
      theme =
        (await Theme.findOne({ companyId, lastApplied: true })) ||
        (await Theme.findOne({ companyId, isDefault: true }).sort({
          updatedAt: -1,
        })) ||
        (await Theme.findOne({ companyId }).sort({ updatedAt: -1 }));
    } else {
      theme =
        (await Theme.findOne({ companyId, lastApplied: true })) ||
        (await Theme.findOne({ companyId, isActive: true }).sort({
          updatedAt: -1,
        })) ||
        (await Theme.findOne({ companyId }).sort({ updatedAt: -1 }));
    }
    if (!theme) return res.status(404).json({ message: "No theme found" });
    res.json({ theme });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};