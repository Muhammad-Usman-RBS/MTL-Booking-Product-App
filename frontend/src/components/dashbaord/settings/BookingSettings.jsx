import React, { useEffect, useState } from "react";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import {
  useGetBookingSettingQuery,
  useUpdateBookingSettingMutation,
} from "../../../redux/api/bookingSettingsApi";
import { toast } from "react-toastify";
import countries from "../../../constants/constantscomponents/countries";
import timezoneOptions from "../../../constants/constantscomponents/timezones";
import SelectOption from "../../../constants/constantscomponents/SelectOption";

const BookingSettings = () => {
  const { data, isLoading } = useGetBookingSettingQuery();
  const [updateBookingSetting] = useUpdateBookingSettingMutation();

  const [country, setCountry] = useState({ label: "United Kingdom" });
  const [timezone, setTimezone] = useState({ label: "Europe/London" });

  const findOption = (options, label) =>
    options.find((item) => item.label === label) || { label };

  useEffect(() => {
    if (data?.setting) {
      if (data.setting.operatingCountry) {
        setCountry(findOption(countries, data.setting.operatingCountry));
      }
      if (data.setting.timezone) {
        setTimezone(findOption(timezoneOptions, data.setting.timezone));
      }
    }
  }, [data]);

  const handleUpdate = async () => {
    try {
      const formData = {
        operatingCountry: country?.label || "United Kingdom",
        timezone: timezone?.label || "Europe/London",
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
        {/* Operating Country */}
        <SelectOption
          label="Operating Country"
          options={countries}
          value={country?.label || ""}
          onChange={(e) => {
            const selected = countries.find((item) => item.label === e.target.value);
            if (selected) setCountry(selected);
          }}
        />

        {/* Timezone */}
        <SelectOption
          label="Timezone"
          options={timezoneOptions}
          value={timezone?.label || ""}
          onChange={(e) => {
            const selected = timezoneOptions.find((item) => item.label === e.target.value);
            if (selected) setTimezone(selected);
          }}
        />

        {/* Update Button */}
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
