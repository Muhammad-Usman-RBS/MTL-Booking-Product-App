import React, { useEffect, useRef, useState } from "react";
import PhoneInput from "react-phone-input-2";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import {
  colorFields,
  yesNoOptions,
} from "../../../constants/dashboardTabsData/data";
import {
  useFetchAllCompaniesQuery,
  useUpdateCompanyMutation,
} from "../../../redux/api/companyApi";
import useUIStore from "../../../store/useUIStore";
const SettingsGeneral = () => {
  const theme = useUIStore((state) => state.theme);
  const debounceRef = useRef(null);

  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;

  const { data: allCompanies = [] } = useFetchAllCompaniesQuery(undefined, {
    skip: !companyId,
  });
  const companyData = allCompanies.find((company) => company._id === companyId);
  const [updateCompany, { isLoading }] = useUpdateCompanyMutation();
  const [logo, setLogo] = useState(null);
  const [favicon, setFavicon] = useState(null);
  const [formState, setFormState] = useState({
    companyName: companyData?.companyName || "",
    contact: companyData?.contact || "",
    email: companyData?.email || "",
    address: companyData?.address || "",
    cookieConsent: companyData?.cookieConsent || "",
    tradingName: companyData?.tradingName || "",
    licenseNo: companyData?.licenseNo || "",
    licenseReferenceLink: companyData?.licenseReferenceLink || "",
  });

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
  const handleUpdate = async () => {
    const formData = new FormData();

    for (const key in formState) {
      let value = formState[key];
      // Handle cookieConsent object conversion
      if (
        key === "cookieConsent" &&
        typeof value === "object" &&
        value !== null
      ) {
        value = value.value || "No";
      }
      formData.append(key, value);
    }
    if (logo) formData.append("profileImage", logo);
    if (favicon) formData.append("favicon", favicon);

    try {
      await updateCompany({ id: companyId, formData }).unwrap();
      toast.success("Company settings updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update company settings");
    }
  };
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) setLogo(file);
  };
  const handleFaviconChange = (e) => {
    const file = e.target.files[0];
    if (file) setFavicon(file);
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
    if (companyData) {
      setFormState({
        companyName: companyData.companyName || "",
        contact: companyData.contact || "",
        email: companyData.email || "",
        address: companyData.address || "",
        cookieConsent: companyData.cookieConsent || "",
        tradingName: companyData.tradingName || "",
        licenseNo: companyData.licenseNo || "",
        licenseReferenceLink: companyData.licenseReferenceLink || "",
      });
    }
  }, [companyData]);
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
      <OutletHeading name="General Settings" />

      {/* Language Section */}
      <div className="space-y-4">
        <div>
          <label className="  text-[var(--dark-gray)] font-semibold  text-lg ">
            Company Information
          </label>
        </div>

        <div className="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0">
          <div className="w-full md:w-1/2">
            <label className="block text-[var(--dark-gray)] mb-2">Company name</label>
            <input
              className="custom_input"
              type="text"
              value={formState.companyName}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  companyName: e.target.value,
                }))
              }
            />
          </div>

          <div className="w-full md:w-1/2">
            <label className="block text-[var(--dark-gray)] mb-2">Contact Number</label>
            <PhoneInput
              country={"gb"}
              inputClass=" w-full"
              value={formState.contact}
              inputStyle={{ width: "100%" }}
              onChange={(value) =>
                setFormState((prev) => ({ ...prev, contact: value }))
              }
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0">
          <div className="w-full md:w-1/2">
            <label className="block text-[var(--dark-gray)] mb-2">Email address</label>
            <input
              type="email"
              value={formState.email}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, email: e.target.value }))
              }
              className="custom_input"
              placeholder="booking@megatransfers.co.uk"
            />
          </div>

          <div className="w-full md:w-1/2">
            <label className="block text-[var(--dark-gray)] mb-2">Company address</label>
            <input
              type="text"
              value={formState.address}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, address: e.target.value }))
              }
              className="custom_input"
              placeholder=""
            />
          </div>
        </div>
      </div>

      {/* Branding Section */}
      <div className="space-y-6 mt-4">
        <div className="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0">
          {/* Logo Upload */}
          <div className="w-full md:w-1/2">
            <label className="block text-[var(--dark-gray)] mb-2">Upload Logo</label>
            <div className="flex items-center space-x-4">
              <div className="h-24 w-32    flex items-center justify-center text-xs text-gray-500">
                {logo ? (
                  <img
                    src={URL.createObjectURL(logo)}
                    alt="Logo Preview"
                    className="h-full object-contain"
                  />
                ) : companyData?.profileImage ? (
                  <img
                    src={companyData.profileImage}
                    alt="Current Logo"
                    className="h-full object-contain"
                  />
                ) : (
                  <div className="...">No File Uploaded</div>
                )}
              </div>
              <div>
                <label
                  htmlFor="logo-upload"
                  className="btn bg-[#f3e8e1] text-gray-700 px-4 py-2 rounded-md cursor-pointer"
                >
                  Choose file
                </label>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Favicon Upload */}
          <div className="w-full md:w-1/2">
            <label className="block text-[var(--dark-gray)] mb-2">Upload Favicon</label>
            <div className="flex items-center space-x-4">
              <div className="h-24 w-32  flex items-center justify-center text-xs text-gray-500">
                {favicon ? (
                  <img
                    src={URL.createObjectURL(favicon)}
                    alt="Logo Preview"
                    className="h-full object-contain"
                  />
                ) : companyData?.favicon ? (
                  <img
                    src={companyData.favicon}
                    alt="Current Logo"
                    className="h-full object-contain"
                  />
                ) : (
                  <div className="border border-dashed border-gray-300 ">No File Uploaded</div>
                )}
              </div>
              <div>
                <label
                  htmlFor="favicon-upload"
                  className="btn bg-[#f3e8e1] text-gray-700 px-4 py-2 rounded-md cursor-pointer"
                >
                  Choose file
                </label>
                <input
                  id="favicon-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFaviconChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <hr className="border-gray-300 mt-8 mb-5" />
      {/* Company Info */}
      <div className="mb-4 ">
        <label className="  text-[var(--dark-gray)] font-semibold  text-lg ">
          Additional Information
        </label>
      </div>
      <div className=" grid grid-cols-2  gap-x-6 gap-y-4">
        <div className="w-full">
          <label className="block text-[var(--dark-gray)] mb-2">Cookie Consent</label>
          <SelectOption
            width="full"
            value={formState.cookieConsent}
            onChange={(val) => {
              const selectedValue = val.target ? val.target.value : val;
              setFormState((prev) => ({
                ...prev,
                cookieConsent: selectedValue,
              }));
            }}
            options={yesNoOptions}
          />
        </div>

        <div className="w-full">
          <label className="block text-[var(--dark-gray)] mb-2">Trading Name</label>
          <input
            value={formState.tradingName}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, tradingName: e.target.value }))
            }
            className="custom_input"
            type="text"
            placeholder=""
          />
        </div>

        <div className="w-full">
          <label className="block text-[var(--dark-gray)] mb-2">License number</label>
          <input
            className="custom_input"
            value={formState.licenseNo}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, licenseNo: e.target.value }))
            }
            type="text"
            placeholder=""
          />
        </div>

        <div className="w-full">
          <label className="block text-[var(--dark-gray)] mb-2">
            License reference link
          </label>
          <input
            value={formState.licenseReferenceLink}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                licenseReferenceLink: e.target.value,
              }))
            }
            className="custom_input"
            type="text"
            placeholder=""
          />
        </div>
      </div>
      <hr className="border-gray-300 mt-8 mb-6" />

      {/* Theme Colors */}
      <div className="space-y-4  mb-8">
        <h2 className=" text-[var(--dark-gray)] font-semibold  text-lg ">Theme Colors</h2>

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

      <div className="text-right mt-8 space-x-3 flex items-center justify-center">
        <button
          className="btn btn-reset"
          onClick={handleUpdate}
          disabled={isLoading}
        >
          {isLoading ? "Updating..." : "UPDATE"}
        </button>
        <button className="btn btn-edit" onClick={handleResetColors}>
          Reset to Default
        </button>
      </div>
    </div>
  );
};

export default SettingsGeneral;
