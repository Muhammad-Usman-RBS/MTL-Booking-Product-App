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
    // Check if default themes already exist for this company
    const existingDefaults = await Theme.find({
      companyId,
      isDefault: true,
    });

    if (existingDefaults.length === 0) {
      // Step 1: Create all default themes
      const defaultThemesToCreate = DEFAULT_THEMES.map((theme) => ({
        companyId,
        ...theme,
      }));

      const insertedThemes = await Theme.insertMany(defaultThemesToCreate);
      console.log(`Default themes initialized for company: ${companyId}`);

      // Step 2: Automatically apply "Dark Theme 9"
      const darkTheme9 = insertedThemes.find(
        (t) => t.name === "Dark Theme 9"
      );

      if (darkTheme9) {
        await Theme.updateOne(
          { _id: darkTheme9._id },
          { $set: { lastApplied: true, isActive: true } }
        );
        console.log(`"Dark Theme 9" applied by default for company: ${companyId}`);
      }
    }
  } catch (error) {
    console.error("Error initializing default themes:", error);
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

    // Validate input
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

    // Validate theme settings structure + hex colors
    const validation = validateThemeSettings(themeSettings);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    // Initialize default themes if they don't exist
    await initializeDefaultThemes(companyId);

    // Count only custom themes (non-default)
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
        // saving changes while a default is selected → create a new custom
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

    // Otherwise create a new one (limit 2)
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
    console.error("Error saving theme settings:", error);

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

    // Find theme settings
    const theme = await Theme.findOne({ companyId });
    if (theme) {
      return res.status(200).json({
        success: true,
        message: "Theme settings retrieved successfully",
        data: theme.themeSettings,
      });
    } else {
      // Return default theme if no custom theme exists
      return res.status(200).json({
        success: true,
        message: "No custom theme found, returning default theme",
        data: DEFAULT_THEMES,
      });
    }
  } catch (error) {
    console.error("Error fetching theme settings:", error);
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
    console.error("Error fetching theme history:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching theme history",
    });
  }
};

export const deleteTheme = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const { id } = req.params; // Assuming theme ID is passed as URL parameter

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID is required",
      });
    }

    // Check if theme is a default theme
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
    console.error("Error deleting theme:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting theme",
    });
  }
};

export const applyTheme = async (req, res) => {
  try {
    const { companyId, themeId } = req.params;

    // (optional) authorize company ownership
    if (String(req.user.companyId) !== String(companyId)) {
      return res.status(403).json({ message: "Forbidden" });
    } // flip all others off, set this one on + lastApplied
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

    // For drivers and customers, always get the theme applied by their clientAdmin
    const userRole = req.user?.role;
    let theme;

    if (userRole === "driver" || userRole === "customer") {
      // Get the theme that the clientAdmin applied for this company
      theme =
        (await Theme.findOne({ companyId, lastApplied: true })) ||
        (await Theme.findOne({ companyId, isDefault: true }).sort({
          updatedAt: -1,
        })) ||
        (await Theme.findOne({ companyId }).sort({ updatedAt: -1 }));
    } else {
      // For clientAdmin, get their personally applied theme
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
