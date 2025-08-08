import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import { useGetBookingSettingQuery, useUpdateBookingSettingMutation } from "../../../redux/api/bookingSettingsApi";
import { setCurrency } from "../../../redux/slices/currencySlice";
import { setTimezone } from "../../../redux/slices/timezoneSlice";
import { toast } from "react-toastify";
import countries from "../../../constants/constantscomponents/countries";
import timezoneOptions from "../../../constants/constantscomponents/timezones";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import currencyOptions from "../../../constants/constantscomponents/currencyOptions";

const BookingSettings = () => {
  const dispatch = useDispatch();
  const { data, isLoading } = useGetBookingSettingQuery();
  const [updateBookingSetting] = useUpdateBookingSettingMutation();

  const [country, setCountry] = useState("United Kingdom");
  const [timezone, setTimezoneState] = useState("Europe/London");
  const [currency, setCurrencyState] = useState("GBP");

  useEffect(() => {
    if (data?.setting) {
      if (data.setting.operatingCountry) {
        setCountry(data.setting.operatingCountry);
      }
      if (data.setting.timezone) {
        setTimezoneState(data.setting.timezone);
      }
      if (data.setting.currency) {
        setCurrencyState(data.setting.currency[0]?.value || "GBP"); 
      }
    }
  }, [data]);

  const handleUpdate = async () => {
    try {
      const selectedCurrency = currencyOptions.find(option => option.value === currency);
      const formData = {
        operatingCountry: country || "United Kingdom",
        timezone: timezone || "Europe/London",
        currency: [{ label: selectedCurrency.label, value: selectedCurrency.value, symbol: selectedCurrency.symbol }],
      };

      await updateBookingSetting(formData).unwrap();

      dispatch(setTimezone(timezone));
      dispatch(setCurrency(currency));

      toast.success("Settings updated successfully!");
    } catch (err) {
      console.error("Update failed", err);
      toast.error("Failed to update settings");
    }
  };

  const handleCurrencyChange = (newCurrency) => {
    setCurrencyState(newCurrency);
    dispatch(setCurrency(newCurrency)); 
  };

  const handleTimezoneChange = (newTimezone) => {
    setTimezoneState(newTimezone);
    dispatch(setTimezone(newTimezone)); 
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <OutletHeading name="Booking Settings" />
      
      <div className="bg-white p-6 rounded-lg shadow-lg mb-4">
        <div className="text-sm text-blue-600 mb-4">
          <strong>Note:</strong> Currency and timezone changes will apply to the entire application.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SelectOption
            label="Operating Country"
            options={countries}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />

          <SelectOption
            label="Timezone"
            options={timezoneOptions}
            value={timezone}
            onChange={(e) => handleTimezoneChange(e.target.value)}
          />

          <div>
            <SelectOption
              label="Currency"
              options={currencyOptions}
              value={currency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
            />
            <div className="text-xs text-gray-500 mt-1">
              Current: <span className="font-medium">{currency}</span>
            </div>
          </div>

          <div className="md:col-span-3">
            <button 
              className="btn btn-reset mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={handleUpdate}
            >
              Update Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSettings;

