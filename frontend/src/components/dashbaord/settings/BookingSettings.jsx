import React, { useState } from "react";
import SelectedSearch from "../../../constants/constantscomponents/SelectedSearch";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";

const BookingSettings = () => {
  const [country, setCountry] = useState([]);
  const [timezone, setTimezone] = useState([]);
  const [currency, setCurrency] = useState([]);
  const [distanceUnit, setDistanceUnit] = useState([]);

  const dropdownOptions = {
    country: [{ label: "United Kingdom" }],
    timezone: [{ label: "Europe/London" }],
    currency: [{ label: "Pound sterling (GBP)" }],
    distanceUnit: [{ label: "Miles" }, { label: "Kilometers" }],
  };

  return (
    <div>
      <OutletHeading name="Booking Settings" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Operating country
          </label>
          <SelectedSearch
            selected={country}
            setSelected={setCountry}
            statusList={dropdownOptions.country}
            placeholder="Operating country"
            showCount={false}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Timezone</label>
          <SelectedSearch
            selected={timezone}
            setSelected={setTimezone}
            statusList={dropdownOptions.timezone}
            placeholder="Timezone"
            showCount={false}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Currency</label>
          <SelectedSearch
            selected={currency}
            setSelected={setCurrency}
            statusList={dropdownOptions.currency}
            placeholder="Currency"
            showCount={false}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Maximum additional drop offs
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-1"
            defaultValue="3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Google Maps API key (Browser)
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Google Maps API key (Server)
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Google Maps API key (Android)
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Google Maps API key (iOS)
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Open route service API key
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-1"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Avoid routes</label>
          <div className="space-x-4 mt-1">
            <label className="inline-flex items-center">
              <input type="checkbox" className="mr-2" /> Highways
            </label>
            <label className="inline-flex items-center">
              <input type="checkbox" className="mr-2" /> Tolls
            </label>
            <label className="inline-flex items-center">
              <input type="checkbox" className="mr-2" /> Ferries
            </label>
          </div>
        </div>
        <br />
        <div>
          <label className="block text-sm font-medium mb-1">
            Distance Unit
          </label>
          <SelectedSearch
            selected={distanceUnit}
            setSelected={setDistanceUnit}
            statusList={dropdownOptions.distanceUnit}
            placeholder="Distance unit"
            showCount={false}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Order prefix</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-1"
          />
        </div>

        {[
          "Auto Customer Registration",
          "Auto Bookings Accept",
          "Hourly Package",
        ].map((label) => (
          <div key={label}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <select className="w-full border border-gray-300 rounded px-3 py-1">
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium mb-1">Route</label>
          <select className="w-full border border-gray-300 rounded px-3 py-1">
            <option>Shortest Duration</option>
            <option>Shortest Distance</option>
          </select>
        </div>
        {[
          { label: "Advance booking minimum", value: "12", unit: "Hours" },
          { label: "Advance booking maximum", value: "2", unit: "Years" },
          { label: "Cancel booking", value: "6", unit: "Hours" },
        ].map(({ label, value, unit }) => (
          <div key={label}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-1"
                defaultValue={value}
              />
              <select className="border border-gray-300 rounded px-2">
                <option>{unit}</option>
              </select>
            </div>
          </div>
        ))}

        <div className="md:col-span-3">
          <label className="block text-sm font-medium mb-1">
            Cancel Booking Terms
          </label>
          <textarea className="w-full border border-gray-300 rounded px-3 py-2"></textarea>
        </div>

        <div className="md:col-span-2">
          <button className="btn btn-reset">Update</button>
        </div>
      </div>
    </div>
  );
};

export default BookingSettings;
