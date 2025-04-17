import React, { useState } from "react";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import SelectOption from "../../../constants/constantscomponents/SelectOption";

const General = () => {
  const [formData, setFormData] = useState({
    priceDecimals: "2",
    minAdditionalDropOff: "10",
    childSeatPrice: "5",
    cardPaymentType: "Percentage",
    cardPaymentAmount: "0",
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
      <OutletHeading name="General Pricing" />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block font-medium mb-1">Price Decimals</label>
            <input
              type="number"
              name="priceDecimals"
              value={formData.priceDecimals}
              onChange={handleChange}
              className="custom_input"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              Minimum price for additional drop off
            </label>
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

          <div>
            <label className="block font-medium mb-1">Child seat price</label>
            <div className="flex">
              <input
                type="number"
                name="childSeatPrice"
                value={formData.childSeatPrice}
                onChange={handleChange}
                className="custom_input"
              />
              <span className="px-4 py-1 border border-gray-300 rounded-r-md bg-gray-100">
                GBP
              </span>
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">
              Card payment Amount / Percentage
            </label>
            <div className="flex">
              <input
                type="number"
                name="cardPaymentAmount"
                value={formData.cardPaymentAmount}
                onChange={handleChange}
                className="custom_input"
              />
              <span className="px-4 py-1 border border-gray-300 rounded-r-md bg-gray-100">
                GBP
              </span>
            </div>
          </div>
        </div>

        <label className="block font-medium mb-1">
          Card payment price type
        </label>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="w-full md:w-64">
            <SelectOption width="full" options={["Percentage", "Amount"]} />
          </div>

          <div>
            <button type="submit" className="btn btn-reset">
              UPDATE
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default General;
