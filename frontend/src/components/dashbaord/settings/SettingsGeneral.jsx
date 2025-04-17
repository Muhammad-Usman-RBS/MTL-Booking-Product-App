import React, { useState } from "react";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import SelectOption from "../../../constants/constantscomponents/SelectOption";

const SettingsGeneral = () => {
  const [logo, setLogo] = useState(null);
  const [favicon, setFavicon] = useState(null);

  const [colors, setColors] = useState({
    topFooterBg: "#2A7B9B",
    topFooterText: "#000000",
    menuBg: "#57C785",
    menuText: "#EDDD53",
    bgPrimary: "#76E070",
    bgSecondary: "#E070D1",
    textPrimary: "#1f2937",
    textSecondary: "#6b7280",
  });

  const handleColorChange = (key, value) => {
    setColors((prev) => ({ ...prev, [key]: value }));
  };

  const colorFields = [
    { key: "topFooterBg", label: "Top Bar & Footer Background Color" },
    { key: "topFooterText", label: "Top Bar & Footer Text Color" },
    { key: "menuBg", label: "Menu Background Color" },
    { key: "menuText", label: "Menu Text Color" },
    { key: "bgPrimary", label: "Background Color Primary" },
    { key: "bgSecondary", label: "Background Color Secondary" },
    { key: "textPrimary", label: "Text Color Primary" },
    { key: "textSecondary", label: "Text Color Secondary" },
  ];

  const handleLogoChange = (e) => {
    setLogo(URL.createObjectURL(e.target.files[0]));
  };

  const handleFaviconChange = (e) => {
    setFavicon(URL.createObjectURL(e.target.files[0]));
  };

  return (
    <div>
      <OutletHeading name="General Settings" />

      {/* Language Section */}
      <div className="space-y-4">
        <div>
          <label className="block font-semibold mb-2">Dashboard Language</label>
        </div>

        <div className="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0">
          <div className="w-full md:w-1/2">
            <label className="block font-semibold mb-2">Google Translate</label>
            <SelectOption width="full" options={["Yes", "No"]} />
          </div>
          <div className="w-full md:w-1/2">
            <label className="block font-semibold mb-2">Cookie Consent</label>
            <SelectOption width="full" options={["Yes", "No"]} />
          </div>
        </div>
      </div>

      {/* Branding Section */}
      <div className="space-y-6 mt-4">
        <div className="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0">
          <div className="w-full md:w-1/2">
            <label className="block font-semibold mb-2">Company name</label>
            <input
              className="custom_input"
              type="text"
              placeholder="Mega Transfers Limited"
            />
          </div>
          <div className="w-full md:w-1/2">
            <label className="block font-semibold mb-2">Trading name</label>
            <input
              className="custom_input"
              type="text"
              placeholder="Mega Transfers Limited"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0">
          <div>
            <label className="block font-semibold mb-2">Upload Logo</label>
            <label
              htmlFor="logo-upload"
              className="btn btn-edit cursor-pointer bg-gray-100 border p-2 rounded-md"
            >
              Choose File
            </label>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
            {logo && (
              <img
                src={logo}
                alt="Logo Preview"
                className="mt-2 h-16 object-contain"
              />
            )}
          </div>

          <div>
            <label className="block font-semibold mb-2">Upload Favicon</label>
            <label
              htmlFor="favicon-upload"
              className="btn btn-edit cursor-pointer bg-gray-100 border p-2 rounded-md"
            >
              Choose File
            </label>
            <input
              id="favicon-upload"
              type="file"
              accept="image/*"
              onChange={handleFaviconChange}
              className="hidden"
            />
            {favicon && (
              <img
                src={favicon}
                alt="Favicon Preview"
                className="mt-2 h-16 object-contain"
              />
            )}
          </div>
        </div>
      </div>

      {/* Theme Colors */}
      <div className="space-y-4 mt-8 mb-8">
        <h2 className="text-xl font-bold text-gray-800">Theme Colors</h2>

        {colorFields.map(({ key, label }) => (
          <div
            key={key}
            className="flex flex-col md:flex-row  items-center justify-between"
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

      {/* Company Info */}
      <div className="space-y-6">
        {[
          {
            label: "Contact number",
            placeholder: "+44 208 961 1818",
            type: "text",
          },
          {
            label: "Email address",
            placeholder: "booking@megatransfers.co.uk",
            type: "email",
          },
          { label: "Company address", placeholder: "", type: "text" },
          { label: "License number", placeholder: "", type: "text" },
          { label: "License reference link", placeholder: "", type: "text" },
        ].map(({ label, placeholder, type }) => (
          <div key={label}>
            <label className="block font-semibold mb-2">{label}</label>
            <input
              className="custom_input"
              type={type}
              placeholder={placeholder}
            />
          </div>
        ))}
      </div>

      <div className="text-right mt-4">
        <button className="btn btn-reset">UPDATE</button>
      </div>
    </div>
  );
};

export default SettingsGeneral;
