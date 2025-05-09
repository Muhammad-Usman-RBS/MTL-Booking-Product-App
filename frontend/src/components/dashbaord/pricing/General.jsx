import React, { useEffect, useState } from "react";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import { toast } from "react-toastify";
import { getGeneralPricing, updateGeneralPricing } from "../../../utils/authService"; 

const General = () => {
  const [formData, setFormData] = useState({
    type: "general",
    priceDecimals: "2",
    minAdditionalDropOff: "10",
    childSeatPrice: "5",
    cardPaymentType: "Percentage",
    cardPaymentAmount: "0",
  });

  const token = JSON.parse(localStorage.getItem("user"))?.token;

  const fetchPricing = async () => {
    try {
      const res = await getGeneralPricing(token);
      if (res.data) {
        setFormData(res.data);
      }
    } catch (error) {
      toast.error("Failed to fetch pricing.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateGeneralPricing(formData, token);
      toast.success("Pricing updated successfully!");
    } catch (error) {
      toast.error("Failed to update pricing.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    fetchPricing();
  }, []);

  return (
    <>
      <OutletHeading name="General Pricing" />
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6 space-y-6"
      >
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Price Decimals
          </label>
          <input
            type="number"
            name="priceDecimals"
            value={formData.priceDecimals}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Minimum Price for Additional Drop Off
          </label>
          <div className="flex">
            <input
              type="number"
              name="minAdditionalDropOff"
              value={formData.minAdditionalDropOff}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="px-4 flex items-center border border-l-0 border-gray-300 bg-gray-100 rounded-r-md">
              GBP
            </span>
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Child Seat Price
          </label>
          <div className="flex">
            <input
              type="number"
              name="childSeatPrice"
              value={formData.childSeatPrice}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="px-4 flex items-center border border-l-0 border-gray-300 bg-gray-100 rounded-r-md">
              GBP
            </span>
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Card Payment Price Type
          </label>
          <SelectOption
            width="full"
            options={["Percentage", "Amount"]}
            value={formData.cardPaymentType}
            onChange={(e) =>
              setFormData({ ...formData, cardPaymentType: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Card Payment Amount / Percentage
          </label>
          <div className="flex">
            <input
              type="number"
              name="cardPaymentAmount"
              value={formData.cardPaymentAmount}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="px-4 flex items-center border border-l-0 border-gray-300 bg-gray-100 rounded-r-md">
              {formData.cardPaymentType === "Percentage" ? "%" : "GBP"}
            </span>
          </div>
        </div>

        <div className="text-center">
          <button type="submit" className="btn btn-success">
            UPDATE
          </button>
        </div>
      </form>
    </>
  );
};

export default General;
