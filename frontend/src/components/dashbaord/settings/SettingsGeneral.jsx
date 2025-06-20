import React, { useState } from "react";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import PhoneInput from "react-phone-input-2";

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
          <label className="  text-gray-600 font-semibold  text-lg ">Company Information</label>
        </div>

        <div className="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0">
          <div className="w-full md:w-1/2">
            <label className="block text-gray-600 mb-2">Company name</label>
            <input
              className="custom_input"
              type="text"
              placeholder="Mega Transfers Limited"
            />
          </div>

          <div className="w-full md:w-1/2">
            <label className="block text-gray-600 mb-2">Contact Number</label>
            <PhoneInput country={'gb'} inputClass="w-full custom_input" inputStyle={{ width: "100%" }} />

          </div>
        </div>

        <div className="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0">
          <div className="w-full md:w-1/2">
            <label className="block text-gray-600 mb-2">Email address</label>
            <input
              type="email"
              className="custom_input"
              placeholder="booking@megatransfers.co.uk"
            />
          </div>

          <div className="w-full md:w-1/2">
            <label className="block text-gray-600 mb-2">Company address</label>
            <input
              type="text"
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
            <label className="block text-gray-600 mb-2">Upload Logo</label>
            <div className="flex items-center space-x-4">
              <div className="h-24 w-32  border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-500">
                {logo ? (
                  <img src={logo} alt="Logo Preview" className="h-full  object-contain" />
                ) : (
                  <div className="w-44 h-24   flex items-center justify-center text-gray-500 text-xs font-light">
                    No File Uploaded
                  </div>)}
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
            <label className="block text-gray-600 mb-2">Upload Favicon</label>
            <div className="flex items-center space-x-4">
              <div className="h-24 w-32 border border-dashed border-gray-300  flex items-center justify-center text-xs text-gray-500">
                {favicon ? (
                  <img src={favicon} alt="Favicon Preview" className="h-full object-contain" />
                ) : (
                  <div className="w-44 h-24   flex items-center justify-center text-gray-500 text-xs font-light">
                    No File Uploaded
                  </div>
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

        <label className="  text-gray-600 font-semibold  text-lg " >Additional Information</label>
      </div>
      <div className=" grid grid-cols-2  gap-x-6 gap-y-4">
        <div className="w-full">
          <label className="block text-gray-600 mb-2">Cookie Consent</label>
          <SelectOption width="full" options={["Yes", "No"]} />
        </div>

        <div className="w-full">
          <label className="block text-gray-600 mb-2">Trading Name</label>
          <input
            className="custom_input"
            type="text"
            placeholder=""
          />
        </div>

        <div className="w-full">
          <label className="block text-gray-600 mb-2">License number</label>
          <input
            className="custom_input"
            type="text"
            placeholder=""
          />
        </div>

        <div className="w-full">
          <label className="block text-gray-600 mb-2">License reference link</label>
          <input
            className="custom_input"
            type="text"
            placeholder=""
          />
        </div>
      </div>
      <hr className="border-gray-300 mt-8 mb-6" />

      {/* Theme Colors */}
      <div className="space-y-4  mb-8">
        <h2 className=" text-gray-600 font-semibold  text-lg ">Theme Colors</h2>

        {colorFields.map(({ key, label }) => (
          <div
            key={key}
            className="flex flex-col md:flex-row text-gray-600 items-center justify-between"
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


      <div className="text-right mt-8 flex items-center justify-center">
        <button className="btn btn-reset">UPDATE</button>
      </div>
    </div>
  );
};

export default SettingsGeneral;