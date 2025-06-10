import React, { useEffect, useState } from "react";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import { toast } from "react-toastify";
import {
  useGetGeneralPricingQuery,
  useUpdateGeneralPricingMutation,
} from "../../../redux/api/generalPricingApi";

const General = () => {
  const [formData, setFormData] = useState({
    type: "general",
    pickupAirportPrice: "2",
    dropoffAirportPrice: "2",
    minAdditionalDropOff: "10",
    childSeatPrice: "5",
    cardPaymentType: "Percentage",
    cardPaymentAmount: "0",
  });

  const { data, isSuccess, isError } = useGetGeneralPricingQuery();
  const [updateGeneralPricing, { isLoading }] = useUpdateGeneralPricingMutation();

  useEffect(() => {
    if (isSuccess && data) {
      setFormData(data);
    } else if (isError) {
      toast.error("Failed to fetch pricing.");
    }
  }, [isSuccess, isError, data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateGeneralPricing(formData).unwrap();
      toast.success("Pricing updated successfully!");
    } catch (error) {
      toast.error("Failed to update pricing.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <>
      <OutletHeading name="General Pricing" />
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6 space-y-6"
      >
        <OutletHeading name="Location Category Pricing" />
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Pickup Section */}
          <div className="flex-1">
            <label className="block text-gray-700 font-semibold mb-2">
              Pickup:
            </label>
            <div className="flex gap-2 items-center mt-3">
              <label className="block font-medium text-gray-500">Airport:</label>
              <input
                type="number"
                name="pickupAirportPrice"
                value={formData.pickupAirportPrice}
                onChange={handleChange}
                className="custom_input"
              />
            </div>
          </div>

          {/* Vertical Line */}
          <div className="hidden sm:block w-[1px] bg-gray-300 mx-4"></div>

          {/* Drop Off Section */}
          <div className="flex-1">
            <label className="block text-gray-700 font-semibold mb-2">
              Drop Off:
            </label>
            <div className="flex gap-2 items-center mt-3">
              <label className="block font-medium text-gray-500">Airport:</label>
              <input
                type="number"
                name="dropoffAirportPrice"
                value={formData.dropoffAirportPrice}
                onChange={handleChange}
                className="custom_input"
              />
            </div>
          </div>
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
          <button type="submit" className="btn btn-success" disabled={isLoading}>
            {isLoading ? "UPDATING..." : "UPDATE"}
          </button>
        </div>
      </form>
    </>
  );
};

export default General;
