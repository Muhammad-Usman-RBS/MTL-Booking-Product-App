import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VehicleSelection from "./VehicleSelection";
import PassengerDetails from "./PassengerDetails";
import FareSection from "./FareSection";
import SelectOption from "../../../constants/SelectOption";
import Icons from "../../../assets/icons";

const MAX_DROPOFFS = 3;

const hourlyOptions = [
  "🚗 40 miles • ⏱ 4 Hours",
  "🚗 60 miles • ⏱ 6 Hours",
  "🚗 80 miles • ⏱ 8 Hours",
];

const JourneyCard = ({ title }) => {
  const [dropOffs, setDropOffs] = useState([""]);

  const addDropOff = () => {
    if (dropOffs.length >= MAX_DROPOFFS) {
      toast.warning("Maximum 3 drop-offs allowed.");
      return;
    }
    setDropOffs([...dropOffs, ""]);
  };

  const removeDropOff = (index) => {
    const updated = [...dropOffs];
    updated.splice(index, 1);
    setDropOffs(updated);
  };

  const updateDropOff = (index, value) => {
    const updated = [...dropOffs];
    updated[index] = value;
    setDropOffs(updated);
  };

  return (
    <div className="bg-white shadow-lg rounded-xl w-full max-w-4xl mx-auto p-6 border border-gray-300 mt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
        <h3 className="text-lg font-bold mb-4">{title}</h3>
        <hr />
        <div className="text-sm font-bold text-white btn-reset btn px-4 py-1 rounded">
          Fare: £0
        </div>
      </div>

      {/* Pick Up Date & Time */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2 text-gray-700">
          Pick Up Date & Time
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="date"
            className="border border-gray-300 focus:border-gray-600 focus:ring-1 focus:ring-gray-600 focus:outline-none rounded px-3 py-2 w-full sm:w-1/2"
          />
          <div className="flex gap-4 w-full sm:w-1/2">
            {/* Hours Dropdown */}
            <div className="relative w-full">
              <select
                className="block w-full appearance-none border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm text-gray-700 bg-white transition"
                defaultValue="HH"
              >
                <option disabled>HH</option>
                {[...Array(24).keys()].map((h) => (
                  <option key={h} className=" h-24">
                    {h.toString().padStart(2, "0")}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                <Icons.ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {/* Minutes Dropdown */}
            <div className="relative w-full">
              <select
                className="block w-full appearance-none border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm text-gray-700 bg-white transition"
                defaultValue="MM"
              >
                <option disabled>MM</option>
                {[...Array(60).keys()].map((m) => (
                  <option key={m}>{m.toString().padStart(2, "0")}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                <Icons.ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pick Up & Drop Offs */}
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Pick Up"
          className="custom_input"
        />

        {dropOffs.map((val, idx) => (
          <div key={idx} className="flex gap-2">
            <input
              type="text"
              value={val}
              placeholder={`Drop Off${idx === 0 ? "" : ` ${idx + 1}`}`}
              onChange={(e) => updateDropOff(idx, e.target.value)}
              className="custom_input"
            />
            {idx > 0 && (
              <button
                onClick={() => removeDropOff(idx)}
                className="btn btn-cancel text-white px-3 rounded "
                title="Remove"
              >
                &minus;
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addDropOff}
          className="border border-gray-300 px-4 py-2 rounded btn btn-edit text-white transition"
        >
          + Additional Drop Off
        </button>

        <textarea
          placeholder="Notes"
          rows="3"
          className="custom_input transition-all duration-300"
        />

        <textarea
          placeholder="Internal Notes"
          rows="3"
          className="custom_input transition-all duration-300"
        ></textarea>
      </div>
    </div>
  );
};

const NewBooking = () => {
  const [mode, setMode] = useState("Transfer");
  const [returnJourney, setReturnJourney] = useState(false);
  const [selectedHourly, setSelectedHourly] = useState(hourlyOptions[0]);

  return (
    <>
      <ToastContainer />
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">New Booking</h2>
        <hr className="mb-6 border-gray-300" />

        {/* Tabs */}
        <div className="flex justify-center mb-4">
          {["Transfer", "Hourly"].map((tab) => (
            <button
              key={tab}
              onClick={() => setMode(tab)}
              className={`px-6 py-2 font-medium transition-all cursor-pointer duration-200 ${
                mode === tab
                  ? "bg-orange-400 text-white"
                  : "bg-white text-orange-400 border border-orange-400"
              } ${tab === "Transfer" ? "rounded-l-md" : "rounded-r-md"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Hourly Info */}
        {mode === "Hourly" && (
          <div className="flex justify-center">
            <SelectOption
              options={hourlyOptions}
              value={selectedHourly}
              onChange={(e) => setSelectedHourly(e.target.value)}
              width="64"
            />
          </div>
        )}

        {/* Journey 1 */}
        <JourneyCard title="Journey 1" />

        {/* Toggle Switch */}
        <div className="flex items-center mt-6 w-full max-w-4xl mx-auto ">
          <label className="flex items-center cursor-pointer relative">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={returnJourney}
              onChange={(e) => setReturnJourney(e.target.checked)}
            />
            <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors duration-300"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transform peer-checked:translate-x-6 transition-transform duration-300"></div>
            <span className="ml-4 text-sm font-medium text-gray-800">
              Return Journey
            </span>
          </label>
        </div>

        {/* Journey 2 (Return) */}
        {returnJourney && <JourneyCard title="Journey 2" />}

        <VehicleSelection />
        <PassengerDetails />
        <FareSection />
      </div>
    </>
  );
};

export default NewBooking;
