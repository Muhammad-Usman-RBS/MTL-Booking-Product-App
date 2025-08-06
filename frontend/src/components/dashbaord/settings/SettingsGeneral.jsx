import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import { colorFields } from "../../../constants/dashboardTabsData/data";
import useUIStore from "../../../store/useUIStore";
import {
  useFetchAllCompaniesQuery,
  useUpdateCompanyMutation,
} from "../../../redux/api/companyApi";

const SettingsGeneral = () => {
  const theme = useUIStore((state) => state.theme);
  const debounceRef = useRef(null);

  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;

  const { data: allCompanies = [] } = useFetchAllCompaniesQuery(undefined, {
    skip: !companyId,
  });

  const [updateCompany, { isLoading }] = useUpdateCompanyMutation();

  const getThemeColorVariables = () => {
    const styles = getComputedStyle(document.body);
    return {
      bg: styles.getPropertyValue("--bg").trim(),
      text: styles.getPropertyValue("--text").trim(),
      primary: styles.getPropertyValue("--primary").trim(),
      hover: styles.getPropertyValue("--hover").trim(),
      active: styles.getPropertyValue("--active").trim(),
    };
  };

  const [colors, setColors] = useState(getThemeColorVariables());

  const handleColorChange = (key, value) => {
    const updatedColors = { ...colors, [key]: value };
    setColors(updatedColors);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      document.body.style.setProperty(`--${key}`, value);

      const overrides = JSON.parse(
        localStorage.getItem("theme-overrides") || "{}"
      );
      overrides[theme] = updatedColors;
      localStorage.setItem("theme-overrides", JSON.stringify(overrides));
    }, 300);
  };

  const handleResetColors = () => {
    const getDefaultThemeColors = () => {
      const temp = document.createElement("div");
      temp.style.display = "none";
      temp.className = theme;
      document.body.appendChild(temp);

      const styles = getComputedStyle(temp);
      const defaultColors = {
        bg: styles.getPropertyValue("--bg").trim(),
        text: styles.getPropertyValue("--text").trim(),
        primary: styles.getPropertyValue("--primary").trim(),
        hover: styles.getPropertyValue("--hover").trim(),
        active: styles.getPropertyValue("--active").trim(),
      };

      document.body.removeChild(temp);
      return defaultColors;
    };

    const defaultColors = getDefaultThemeColors();

    setColors(defaultColors);

    Object.entries(defaultColors).forEach(([key, value]) => {
      document.body.style.setProperty(`--${key}`, value);
    });

    const overrides = JSON.parse(
      localStorage.getItem("theme-overrides") || "{}"
    );
    delete overrides[theme];
    localStorage.setItem("theme-overrides", JSON.stringify(overrides));
  };

  useEffect(() => {
    const overrides = JSON.parse(
      localStorage.getItem("theme-overrides") || "{}"
    );
    const themeOverrides = overrides[theme];

    if (themeOverrides) {
      setColors(themeOverrides);
      Object.entries(themeOverrides).forEach(([key, val]) =>
        document.body.style.setProperty(`--${key}`, val)
      );
    } else {
      setColors(getThemeColorVariables());
    }
  }, [theme]);

  return (
    <div>
      <OutletHeading name="Theme Color Settings" />

      <div className="space-y-4 mb-8">
        <h2 className="text-[var(--dark-gray)] font-semibold text-lg">Theme Colors</h2>

        {colorFields.map(({ key, label }) => (
          <div
            key={key}
            className="flex flex-col md:flex-row text-[var(--dark-gray)] items-center justify-between"
          >
            <label className="font-medium">{label}</label>
            <input
              type="color"
              className="h-10 w-16"
              value={colors[key]}
              onChange={(e) => handleColorChange(key, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="text-center mt-8 space-x-3">
        <button
          className="btn btn-reset"
          onClick={handleResetColors}
          disabled={isLoading}
        >
          Reset to Default
        </button>
      </div>
    </div>
  );
};

export default SettingsGeneral;
