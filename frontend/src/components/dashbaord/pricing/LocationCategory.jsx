import React, { useState } from "react";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";

const LocationCategory = () => {
  const [formData, setFormData] = useState({
    priceDecimals: "10",
    minAdditionalDropOff: "10",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <div>
      <OutletHeading name="Location Category Pricing" />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Pickup Section */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-600">Pickup:</h2>
            <label className="block font-medium mb-1 mt-4">Airport</label>
            <input
              type="number"
              name="priceDecimals"
              value={formData.priceDecimals}
              onChange={handleChange}
              className="custom_input"
            />
          </div>

          {/* Vertical Line */}
          <div className="hidden sm:block w-[1px] bg-gray-300 mx-4"></div>

          {/* Drop Off Section */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-600">Drop Off:</h2>
            <label className="block font-medium mb-1 mt-4">Airport</label>
            <div className="flex">
              <input
                type="number"
                name="minAdditionalDropOff"
                value={formData.minAdditionalDropOff}
                onChange={handleChange}
                className="custom_input"
              />
              <span className="px-4 py-1 border border-gray-300 rounded-r-md bg-gray-100">
                GBP
              </span>
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-reset">
          UPDATE
        </button>
      </form>
    </div>
  );
};

export default LocationCategory;
