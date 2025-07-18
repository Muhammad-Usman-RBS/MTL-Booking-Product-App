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
    pickupAirportPrice: "0",
    dropoffAirportPrice: "0",
    minAdditionalDropOff: "0",
    childSeatPrice: "0",
    cardPaymentType: "Card",
    cardPaymentAmount: "0",
    invoiceTaxPercent: "0",
  });

  const { data, isSuccess, isError, refetch } = useGetGeneralPricingQuery();
  const [updateGeneralPricing, { isLoading }] =
    useUpdateGeneralPricingMutation();
  console.log("datais", data);
  useEffect(() => {
    if (data) {
      setFormData({
        pickupAirportPrice: data.pickupAirportPrice ?? "0",
        dropoffAirportPrice: data.dropoffAirportPrice ?? "0",
        minAdditionalDropOff: data.minAdditionalDropOff ?? "0",
        childSeatPrice: data.childSeatPrice ?? "0",
        cardPaymentType: data.cardPaymentType || "Card",
        cardPaymentAmount: data.cardPaymentAmount ?? "0",
        invoiceTaxPercent: data.invoiceTaxPercent ?? "0",
      });

      refetch();
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

  const handlePaymentTypeChange = (e) => {
    const newType = e.target.value;
    setFormData({
      ...formData,
      cardPaymentType: newType,
      cardPaymentAmount: newType === "Cash" ? "0" : formData.cardPaymentAmount,
    });
  };

  return (
    <>
      <OutletHeading name="General Pricing" />
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6 space-y-6"
      >
        <OutletHeading name="Location Category Pricing" />

        {/* Pickup and Dropoff */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-gray-700 font-semibold mb-2">
              Pickup:
            </label>
            <div className="flex gap-2 items-center mt-3">
              <label className="block font-medium text-gray-500">
                Airport:
              </label>
              <input
                type="number"
                name="pickupAirportPrice"
                value={formData.pickupAirportPrice}
                onChange={handleChange}
                className="custom_input"
              />
            </div>
          </div>

          <div className="hidden sm:block w-[1px] bg-gray-300 mx-4"></div>

          <div className="flex-1">
            <label className="block text-gray-700 font-semibold mb-2">
              Drop Off:
            </label>
            <div className="flex gap-2 items-center mt-3">
              <label className="block font-medium text-gray-500">
                Airport:
              </label>
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

        {/* Additional Drop Off */}
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

        {/* Child Seat */}
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
            Invoice Tax Percentage
          </label>
          <div className="flex">
            <input
              type="number"
              name="invoiceTaxPercent"
              value={formData.invoiceTaxPercent}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Card Payment Type */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Card Payment Price Type
          </label>
          <SelectOption
            width="full"
            options={["Card", "Cash"]}
            value={formData.cardPaymentType}
            onChange={handlePaymentTypeChange}
          />
        </div>

        {/* Card Payment Amount */}
        {formData.cardPaymentType === "Card" && (
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Card Payment Percentage
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
                %
              </span>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="text-center">
          <button
            type="submit"
            className="btn btn-success"
            disabled={isLoading}
          >
            {isLoading ? "UPDATING..." : "UPDATE"}
          </button>
        </div>
      </form>
    </>
  );
};

export default General;
