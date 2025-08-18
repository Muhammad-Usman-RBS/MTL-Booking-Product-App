import React, { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { skipToken } from "@reduxjs/toolkit/query/react";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import { colorFields } from "../../../constants/dashboardTabsData/data";
import {
  useFetchThemeSettingsQuery,
  useSaveThemeSettingsMutation,
  useResetThemeSettingsMutation,
  useFetchThemeHistoryQuery,
  useDeleteThemeSettingsMutation,
} from "../../../redux/api/themeApi";
import { Bookmark, BookmarkCheck, CheckSquare, Square } from "lucide-react";
import Icons from "../../../assets/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  selectThemeColors,
  selectThemeHistory,
  selectThemeLimitReached,
  selectSelectedThemeId,
  setThemeColors,
  setThemeHistory,
  setSelectedThemeId,
  selectBookmarkedThemes,
  toggleBookmarkTheme,
  removeBookmarkById,
} from "../../../redux/slices/themeSlice";

const applyThemeVars = (theme) => {
  if (!theme) return;
  const root = document.documentElement;
  Object.entries(theme).forEach(([k, v]) =>
    root.style.setProperty(`--${k}`, v)
  );
};

const SettingsGeneral = () => {
  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;
  const debounceRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const dispatch = useDispatch();
  const colors = useSelector(selectThemeColors);
  const history = useSelector(selectThemeHistory);
  const limitReached = useSelector(selectThemeLimitReached);
  const selectedThemeId = useSelector(selectSelectedThemeId);
  const bookmarks = useSelector(selectBookmarkedThemes);

  const {
    data: themeData,
    error: fetchError,
    isLoading,
    isSuccess,
    isError,
  } = useFetchThemeSettingsQuery(companyId ?? skipToken);
  const {
    data: historyRes,
    isFetching: isHistoryLoading,
    isSuccess: isHistorySuccess,
    refetch: refetchHistory,
  } = useFetchThemeHistoryQuery(companyId ?? skipToken);
  const [saveThemeSettings] = useSaveThemeSettingsMutation();
  const [resetThemeSettings] = useResetThemeSettingsMutation();
  const [deleteThemeSettings] = useDeleteThemeSettingsMutation();

  const applyThemeToDOM = useCallback((themeColors) => {
    applyThemeVars(themeColors);
  }, []);
  useEffect(() => {
    if (!isSuccess || !themeData?.success || !themeData?.data) return;

    const fetchedColors = themeData.data;
    dispatch(setThemeColors(fetchedColors));
    applyThemeToDOM(fetchedColors);

    if (
      themeData.message !== "No custom theme found, returning default theme"
    ) {
      toast.success("Theme settings loaded successfully!");
    }
  }, [dispatch, isSuccess, themeData, applyThemeToDOM]);

  useEffect(() => {
    if (
      isHistorySuccess &&
      historyRes?.success &&
      Array.isArray(historyRes.data)
    ) {
      dispatch(setThemeHistory(historyRes.data));
    }
  }, [isHistorySuccess, historyRes]);
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
  const handleSaveThemeSettings = useCallback(
    async (themeColors = colors) => {
      if (limitReached) {
        toast.error(
          "Theme limit reached (max 5). Delete a previous theme to save a new one."
        );
        return;
      }
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
          applyThemeToDOM(themeColors);
          toast.success(result.message);
          // refresh history so limit & list stay in sync
          await refetchHistory();
        } else {
          toast.error(result.message || "Failed to save theme settings.");
        }
      } catch (error) {
        toast.error(
          error?.data?.message ||
            error?.message ||
            "Error saving theme settings."
        );
      } finally {
        setIsSaving(false);
      }
    },
    [
      companyId,
      colors,
      saveThemeSettings,
      applyThemeToDOM,
      limitReached,
      refetchHistory,
    ]
  );

  const handleColorChange = useCallback(
    (key, value) => {
      const updatedColors = { ...colors, [key]: value };
      dispatch(setThemeColors(updatedColors));
      document.documentElement.style.setProperty(`--${key}`, value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [colors, dispatch]
  );

  const handleResetColors = useCallback(async () => {
    if (!companyId) {
      toast.error("Company ID not found!");
      return;
    }

    try {
      const result = await resetThemeSettings({ companyId }).unwrap();
      if (result.success) {
        const defaultColors = result.data;
        dispatch(setThemeColors(defaultColors));
        applyThemeToDOM(defaultColors);
        toast.success("Theme reset to default successfully!");
        await refetchHistory();
      } else {
        toast.error(result.message || "Failed to reset theme.");
      }
    } catch (error) {
      toast.error(error?.data?.message || "Error resetting theme settings.");
    }
  }, [
    companyId,
    resetThemeSettings,
    applyThemeToDOM,
    limitReached,
    dispatch,
    refetchHistory,
  ]);

  const handleApplyThemeFromHistory = (themeDoc) => {
    dispatch(setSelectedThemeId(themeDoc._id));
    dispatch(setThemeColors(themeDoc.themeSettings));
    applyThemeToDOM(themeDoc.themeSettings);
  };
  const handleDeleteTheme = async (e, id) => {
    e.stopPropagation();
    e.preventDefault();
    if (!companyId) {
      toast.error("Company ID not found!");
      return;
    }
    try {
      const res = await deleteThemeSettings(companyId).unwrap();
      dispatch(removeBookmarkById(id)); // also drop from bookmarks
      toast.success(res?.message || "Theme deleted");
      await refetchHistory();
    } catch (err) {
      toast.error(
        err?.data?.message || err?.message || "Failed to delete theme"
      );
    }
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

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
        {limitReached && (
          <div className="mb-4 p-3 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 flex items-center gap-3">
            <Icons.AlertCircle className="w-5 h-5" />
            <div>
              <div className="font-semibold">Theme limit reached</div>
              <div className="text-sm">
                Delete any previous theme to create a new one.
                <strong>Max 5 themes</strong>.
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <h2 className="text-[var(--dark-gray)] font-semibold text-lg">
            Theme Colors
          </h2>
          {isSaving && (
            <span className="text-blue-500 text-sm flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
              Saving...
            </span>
          )}
        </div>

        {colorFields.map(({ key, label }) => (
          <div
            key={key}
            className="flex flex-col md:flex-row text-[var(--dark-gray)] items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
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
                disabled={limitReached}
              />
              <input
                type="text"
                className="w-20 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={colors[key]}
                onChange={(e) => handleColorChange(key, e.target.value)}
                pattern="^#[0-9A-Fa-f]{6}$"
                placeholder="#000000"
                disabled={limitReached}
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
          disabled={isSaving || isLoading || limitReached}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
      {/* Replace the entire Theme History Section with this: */}
      <div className="mt-12">
        <h3 className="text-[var(--dark-gray)] font-semibold text-lg mb-4">
          Your Saved Themes
        </h3>

        {isHistoryLoading ? (
          <div className="text-gray-500">Loading your themes…</div>
        ) : history.length === 0 ? (
          <div className="text-gray-500">No saved themes yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map((t) => {
              const isSelected = selectedThemeId === t._id;
              const ts = t.createdAt
                ? new Date(t.createdAt).toLocaleString()
                : "";
              const c = t.themeSettings || {};

              return (
                <div
                  key={t._id}
                  className={`p-4 rounded-lg border transition cursor-pointer ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                  onClick={(e) => {
                    e.preventDefault(); // Prevent any form submission
                    handleApplyThemeFromHistory(t);
                  }}
                >
                  {/* Rest of the card content stays the same */}
                  <div className="flex items-center justify-between mb-3">
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-blue-50"
                      title={
                        bookmarks.find((b) => b._id === t._id)
                          ? "Unpin from Navbar"
                          : "Pin to Navbar"
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        const isPinned = !!bookmarks.find(
                          (b) => b._id === t._id
                        );
                        if (!isPinned && bookmarks.length >= 3) {
                          toast.error(
                            "You can pin up to 3 themes in the navbar."
                          );
                          return;
                        }
                        dispatch(
                          toggleBookmarkTheme({
                            _id: t._id,
                            themeSettings: c, 
                            label: ts || "", 
                          })
                        );
                      }}
                    >
                      {bookmarks.find((b) => b._id === t._id) ? (
                        <BookmarkCheck className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Bookmark className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    <button
                      type="button"
                      className="cursor-pointer"
                      onClick={(e) => handleDeleteTheme(e, t._id)}
                      title="Delete this theme"
                    >
                      <Icons.Trash className="w-5 h-5 text-red-500" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {["bg", "text", "primary", "hover", "active"].map((k) => (
                      <div key={k} className="flex flex-col items-center">
                        <div
                          className="w-8 h-8 rounded-full border-2 border-gray-200 shadow-sm"
                          style={{ backgroundColor: c[k] || "#ffffff" }}
                          title={`${k}: ${c[k] || ""}`}
                        />
                        <span className="text-[10px] text-gray-500 mt-1 capitalize">
                          {k}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsGeneral;
