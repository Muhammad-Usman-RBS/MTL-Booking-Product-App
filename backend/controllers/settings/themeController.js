import Theme from "../../models/settings/Theme.js";

// Default theme settings
const DEFAULT_THEMES = [
  {
    name: "Light Theme 1",
    themeSettings: {
      bg: "#f5f9fa",
      text: "#1e1e1e", 
      primary: "#a5d8dd",
      hover: "#a5d8dd",
      active: "#a5d8dd"
    },
    isDefault: true
  },
  {
    name: "Dark Theme 2",
    themeSettings: {
      bg: "#07384d",
      text: "#f1efef",
      primary: "#01f5fe",
      hover: "#003353",
      active: "#064f7c"
    },
    isDefault: true
  },
  {
    name: "Dark Theme 3", 
    themeSettings: {
      bg: "#1e1e1e",
      text: "#f1efef",
      primary: "#ba090a",
      hover: "#930000",
      active: "#930000"
    },
    isDefault: true
  },
 
];
export const initializeDefaultThemes = async (companyId) => {
  try {
    // Check if default themes already exist for this company
    const existingDefaults = await Theme.find({ 
      companyId, 
      isDefault: true 
    });
    
    if (existingDefaults.length === 0) {
      // Create default themes
      const defaultThemesToCreate = DEFAULT_THEMES.map(theme => ({
        companyId,
        ...theme
      }));
      
      await Theme.insertMany(defaultThemesToCreate);
      console.log(`Default themes initialized for company: ${companyId}`);
    }
  } catch (error) {
    console.error("Error initializing default themes:", error);
  }
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

    // Initialize default themes if they don't exist
    await initializeDefaultThemes(companyId);

    // Count only custom themes (non-default)
    const customThemeCount = await Theme.countDocuments({ 
      companyId, 
      isDefault: { $ne: true } 
    });
    
    if (customThemeCount >= 2) {
      return res.status(400).json({
        success: false,
        message: "Custom theme limit reached (max 2 custom themes allowed). Delete a previous custom theme to save a new one."
      });
    }

    // Create a NEW custom theme (isDefault: false by default)
    const created = await Theme.create({ 
      companyId, 
      themeSettings,
      isDefault: false 
    });

    return res.status(201).json({
      success: true,
      message: "Custom theme saved successfully",
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
      .limit(5)

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
      theme.themeSettings = DEFAULT_THEMES;
      await theme.save();
    } else {
      theme = new Theme({
        companyId,
        themeSettings: DEFAULT_THEMES,
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
