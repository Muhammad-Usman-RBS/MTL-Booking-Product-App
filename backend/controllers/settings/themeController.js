import Theme from "../../models/settings/Theme.js";

// Default theme settings
const DEFAULT_THEME = {
  bg: "#ffffff",
  text: "#000000",
  primary: "#1e90ff",
  hover: "#ff6347",
  active: "#32cd32",
};

// Validate hex color format
const isValidHexColor = (color) => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

// Validate theme settings structure
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

// Save or update theme settings
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

    // Create a NEW version document (do not overwrite)
    const created = await Theme.create({ companyId, themeSettings });

    // Keep only the newest 5 theme versions for this company
    const count = await Theme.countDocuments({ companyId });
    if (count > 5) {
      const toDelete = await Theme.find({ companyId })
        .sort({ createdAt: 1 }) // oldest first
        .limit(count - 5)
        .select("_id");
      if (toDelete.length) {
        await Theme.deleteMany({ _id: { $in: toDelete.map((d) => d._id) } });
      }
    }

    return res.status(201).json({
      success: true,
      message: "Theme version saved",
      data: created.themeSettings,
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

// Get theme settings for a company
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
    const theme = await Theme.findOne({ companyId }).sort({ createdAt: -1 });
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
        data: DEFAULT_THEME,
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
      .limit(5)
      .select("_id themeSettings createdAt updatedAt");

    return res.status(200).json({
      success: true,
      message: "Theme history retrieved successfully",
      data: history,
    });
  } catch (error) {
    console.error("Error fetching theme history:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Server error while fetching theme history",
      });
  }
};
// Reset theme to default
export const resetTheme = async (req, res) => {
  try {
    const { companyId } = req.body;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID is required",
      });
    }

    // Find and update theme or create new one with default settings
    let theme = await Theme.findOne({ companyId });

    if (theme) {
      theme.themeSettings = DEFAULT_THEME;
      await theme.save();
    } else {
      theme = new Theme({
        companyId,
        themeSettings: DEFAULT_THEME,
      });
      await theme.save();
    }

    return res.status(200).json({
      success: true,
      message: "Theme reset to default successfully",
      data: theme.themeSettings,
    });
  } catch (error) {
    console.error("Error resetting theme:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while resetting theme",
    });
  }
};

// Get all themes (for admin purposes)
export const getAllThemes = async (req, res) => {
  try {
    const themes = await Theme.find().select(
      "companyId themeSettings createdAt updatedAt"
    );

    return res.status(200).json({
      success: true,
      message: "All themes retrieved successfully",
      data: themes,
      count: themes.length,
    });
  } catch (error) {
    console.error("Error fetching all themes:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching themes",
    });
  }
};

// Delete theme (reset to default)
export const deleteTheme = async (req, res) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID is required",
      });
    }

    const result = await Theme.findOneAndDelete({ companyId });

    if (result) {
      return res.status(200).json({
        success: true,
        message: "Theme deleted successfully, will use default theme",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Theme not found",
      });
    }
  } catch (error) {
    console.error("Error deleting theme:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting theme",
    });
  }
};
