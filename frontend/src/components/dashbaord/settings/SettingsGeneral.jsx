import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { skipToken } from '@reduxjs/toolkit/query/react';
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import { colorFields } from "../../../constants/dashboardTabsData/data";
import {
  useFetchThemeSettingsQuery,
  useSaveThemeSettingsMutation,
  useResetThemeSettingsMutation,
} from "../../../redux/api/themeApi";

const DEFAULT_THEME = {
  bg: "#ffffff",
  text: "#000000",
  primary: "#1e90ff",
  hover: "#ff6347",
  active: "#32cd32"
};

const SettingsGeneral = () => {
  const debounceRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;

  const [colors, setColors] = useState({
    bg: "#ffffff",
    text: "#000000",
    primary: "#1e90ff",
    hover: "#ff6347",
    active: "#32cd32",
  });

  // RTK Query hooks
  const {
    data: themeData,
    error: fetchError,
    isLoading,
    isSuccess,
    isError,
  } = useFetchThemeSettingsQuery(companyId ?? skipToken);

  const [saveThemeSettings] = useSaveThemeSettingsMutation();
  const [resetThemeSettings] = useResetThemeSettingsMutation();

  // Apply colors to CSS variables
  const applyThemeToDOM = useCallback((themeColors) => {
    Object.entries(themeColors).forEach(([key, value]) => {
      document.body.style.setProperty(`--${key}`, value);
    });
  }, []);

  // Handle successful theme fetch
useEffect(() => {
  if (isSuccess && themeData?.success && themeData?.data) {
    const fetchedColors = themeData.data;
    setColors(fetchedColors);
    applyThemeToDOM(fetchedColors);
    
    if (themeData.message !== "No custom theme found, returning default theme") {
      toast.success("Theme settings loaded successfully!");
    }
  } else {
    // Apply default theme if no custom theme is found
    setColors(DEFAULT_THEME);
    applyThemeToDOM(DEFAULT_THEME);
    toast.info("No custom theme found. Using default settings.");
  }
}, [isSuccess, themeData, applyThemeToDOM]);

  // Handle fetch error
  useEffect(() => {
    if (isError && fetchError) {
      console.error("Error fetching theme settings:", fetchError);
      if (fetchError.status === 404) {
        toast.info("No custom theme found. Using default settings.");
      } else {
        toast.error("Error loading theme settings.");
      }
    }
  }, [isError, fetchError]);

  // Save theme settings with RTK Query
  const handleSaveThemeSettings = useCallback(async (themeColors = colors) => {
    if (!companyId) {
      toast.error("Company ID not found!");
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveThemeSettings({
        companyId,
        themeSettings: themeColors,
      }).unwrap();

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message || "Failed to save theme settings.");
      }
    } catch (error) {
      console.error("Error saving theme settings:", error);
      if (error.data?.message) {
        toast.error(error.data.message);
      } else {
        toast.error("Error saving theme settings.");
      }
    } finally {
      setIsSaving(false);
    }
  }, [companyId, colors, saveThemeSettings]);

  // Handle color change with debouncing
  const handleColorChange = useCallback((key, value) => {
    const updatedColors = { ...colors, [key]: value };
    setColors(updatedColors);

    // Apply to DOM immediately for real-time preview
    document.body.style.setProperty(`--${key}`, value);

    // Debounce API call
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      handleSaveThemeSettings(updatedColors);
    }, 1000);
  }, [colors, handleSaveThemeSettings]);

  // Reset colors to default with RTK Query
  const handleResetColors = useCallback(async () => {
    if (!companyId) {
      toast.error("Company ID not found!");
      return;
    }

    try {
      const result = await resetThemeSettings({ companyId }).unwrap();

      if (result.success) {
        const defaultColors = result.data;
        setColors(defaultColors);
        applyThemeToDOM(defaultColors);
        toast.success("Theme reset to default successfully!");
      } else {
        toast.error(result.message || "Failed to reset theme.");
      }
    } catch (error) {
      console.error("Error resetting theme:", error);
      if (error.data?.message) {
        toast.error(error.data.message);
      } else {
        toast.error("Error resetting theme settings.");
      }
    }
  }, [companyId, resetThemeSettings, applyThemeToDOM]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading theme settings...</span>
      </div>
    );
  }

  return (
    <div>
      <OutletHeading name="Theme Color Settings" />

      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-[var(--dark-gray)] font-semibold text-lg">Theme Colors</h2>
          {isSaving && (
            <span className="text-blue-500 text-sm flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
              Saving...
            </span>
          )}
        </div>

        {colorFields.map(({ key, label }) => (
          <div key={key} className="flex flex-col md:flex-row text-[var(--dark-gray)] items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div
                className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
                style={{ backgroundColor: colors[key] }}
              ></div>
              <label className="font-medium">{label}</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                className="h-10 w-16 rounded cursor-pointer border border-gray-300"
                value={colors[key]}
                onChange={(e) => handleColorChange(key, e.target.value)}
              />
              <input
                type="text"
                className="w-20 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={colors[key]}
                onChange={(e) => handleColorChange(key, e.target.value)}
                pattern="^#[0-9A-Fa-f]{6}$"
                placeholder="#000000"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-8 space-x-3">
        <button
          className="btn btn-reset px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 transition-colors"
          onClick={handleResetColors}
          disabled={isSaving || isLoading}
        >
          Reset to Default
        </button>
        <button
          className="btn btn-primary px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
          onClick={() => handleSaveThemeSettings()}
          disabled={isSaving || isLoading}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default SettingsGeneral;