import React, { useEffect, useState } from "react";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import { useGetBookingSettingQuery, useUpdateBookingSettingMutation, } from "../../../redux/api/bookingSettingsApi";
import { toast } from "react-toastify";
import countries from "../../../constants/constantscomponents/countries";
import timezoneOptions from "../../../constants/constantscomponents/timezones";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import currencyOptions from "../../../constants/constantscomponents/currencyOptions";

const BookingSettings = () => {
  const { data, isLoading } = useGetBookingSettingQuery();
  const [updateBookingSetting] = useUpdateBookingSettingMutation();

  const [country, setCountry] = useState("United Kingdom");
  const [timezone, setTimezone] = useState("Europe/London");
  const [currency, setCurrency] = useState("GBP");

  useEffect(() => {
    if (data?.setting) {
      if (data.setting.operatingCountry) {
        setCountry(data.setting.operatingCountry);
      }
      if (data.setting.timezone) {
        setTimezone(data.setting.timezone);
      }
      if (data.setting.currency) {
        setCurrency(data.setting.currency);
      }
    }
  }, [data]);

  const handleUpdate = async () => {
    try {
      const formData = {
        operatingCountry: country || "United Kingdom",
        timezone: timezone || "Europe/London",
        currency: currency || "GBP",
      };
      await updateBookingSetting(formData).unwrap();
      toast.success("Settings updated!");
    } catch (err) {
      console.error("Update failed", err);
      toast.error("Failed to update settings");
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <OutletHeading name="Booking Settings" />
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
          onChange={(e) => setTimezone(e.target.value)}
        />

        <div>
          <SelectOption
            label="Currency"
            options={currencyOptions}
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <button className="btn btn-reset mt-4" onClick={handleUpdate}>
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSettings;
