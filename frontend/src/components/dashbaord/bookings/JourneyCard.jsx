import React, { useState } from "react";
import { toast } from "react-toastify";
import { useLazySearchGooglePlacesQuery } from "../../../redux/api/googleApi";

const JourneyCard = ({
  title,
  journeyData,
  setJourneyData,
  dropOffs,
  setDropOffs,
}) => {
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropOffSuggestions, setDropOffSuggestions] = useState([]);
  const [dropOffTypes, setDropOffTypes] = useState({});
  const [activeDropIndex, setActiveDropIndex] = useState(null);
  const [pickupType, setPickupType] = useState(null);

  const [triggerSearchAutocomplete] = useLazySearchGooglePlacesQuery();

  const fetchSuggestions = async (query, setter) => {
    if (!query) return setter([]);
    try {
      const res = await triggerSearchAutocomplete(query).unwrap();
      const results = res.predictions.map((r) => ({
        name: r.name || r.structured_formatting?.main_text,
        formatted_address: r.formatted_address || r.description,
        source: r.types?.includes("airport") ? "airport" : "location",
      }));
      setter(results);
    } catch (err) {
      console.error("Autocomplete Error:", err);
    }
  };

  const handlePickupChange = (e) => {
    const value = e.target.value;
    setJourneyData({ ...journeyData, pickup: value });
    if (value.length >= 3) fetchSuggestions(value, setPickupSuggestions);
    else setPickupSuggestions([]);
  };

  const handleDropoffChange = (idx, value) => {
    const updated = [...dropOffs];
    updated[idx] = value;
    setDropOffs(updated);
    setActiveDropIndex(idx);

    setJourneyData((prev) => ({
      ...prev,
      [`dropoffDoorNumber${idx}`]: "",
      [`dropoff_terminal_${idx}`]: "",
    }));

    if (value.length >= 3) fetchSuggestions(value, setDropOffSuggestions);
    else setDropOffSuggestions([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJourneyData({ ...journeyData, [name]: value });
  };

  const addDropOff = () => {
    if (dropOffs.length >= 3) {
      toast.warning("Maximum 3 drop-offs allowed.");
      return;
    }
    setDropOffs([...dropOffs, ""]);
  };

  const removeDropOff = (idx) => {
    const updated = [...dropOffs];
    updated.splice(idx, 1);
    const types = { ...dropOffTypes };
    delete types[idx];
    setDropOffs(updated);
    setDropOffTypes(types);
  };

  return (
    <div className="bg-white shadow-lg rounded-xl w-full max-w-4xl mx-auto p-6 border border-gray-300 mt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
        <h3 className="text-xl font-semibold mb-4">{title}:</h3>
        <div className="btn-edit btn">Fare: $0</div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2 text-gray-700">
          Pick Up Date & Time
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input type="date" name="date" className="custom_input" value={journeyData.date} onChange={handleChange} />
          <div className="flex gap-4 w-full sm:w-1/2">
            <select name="hour" className="custom_input" value={journeyData.hour} onChange={handleChange}>
              <option value="">HH</option>
              {[...Array(24).keys()].map((h) => (
                <option key={h} value={h}>{h.toString().padStart(2, "0")}</option>
              ))}
            </select>
            <select name="minute" className="custom_input" value={journeyData.minute} onChange={handleChange}>
              <option value="">MM</option>
              {[...Array(60).keys()].map((m) => (
                <option key={m} value={m}>{m.toString().padStart(2, "0")}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mb-4 relative">
        <input
          type="text"
          name="pickup"
          placeholder="Pick Up Location"
          className="custom_input"
          value={journeyData.pickup}
          onChange={handlePickupChange}
        />
        {pickupSuggestions.length > 0 && (
          <ul className="absolute z-10 bg-white border rounded shadow max-h-40 overflow-y-auto w-full">
            <li className="p-2 bg-blue-50 hover:bg-blue-100 cursor-pointer border-b" onClick={() => {
              setJourneyData({ ...journeyData, pickup: journeyData.pickup });
              setPickupType("location");
              setPickupSuggestions([]);
            }}>
              ➕ Use: "{journeyData.pickup}"
            </li>
            {pickupSuggestions.map((sug, idx) => (
              <li key={idx} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => {
                setJourneyData({
                  ...journeyData,
                  pickup: `${sug.name} - ${sug.formatted_address}`,
                });
                setPickupType(sug.source);
                setPickupSuggestions([]);
              }}>
                {sug.name} - {sug.formatted_address}
              </li>
            ))}
          </ul>
        )}
      </div>

      {pickupType === "location" && (
        <input type="text" name="pickupDoorNumber" placeholder="Pickup Door No." className="custom_input mb-4" value={journeyData.pickupDoorNumber || ""} onChange={handleChange} />
      )}
      {pickupType === "airport" && (
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input name="arrivefrom" placeholder="Arriving From" className="custom_input" value={journeyData.arrivefrom || ""} onChange={handleChange} />
          <input name="pickmeAfter" placeholder="Pick Me After" className="custom_input" value={journeyData.pickmeAfter || ""} onChange={handleChange} />
          <input name="flightNumber" placeholder="Flight No." className="custom_input" value={journeyData.flightNumber || ""} onChange={handleChange} />
        </div>
      )}

      {dropOffs.map((val, idx) => (
        <div key={idx} className="relative mb-2">
          <input type="text" value={val} placeholder={`Drop Off ${idx + 1}`} onChange={(e) => handleDropoffChange(idx, e.target.value)} className="custom_input w-full" />
          {idx > 0 && (
            <button type="button" onClick={() => removeDropOff(idx)} className="btn btn-cancel absolute right-0 top-0 mt-1 mr-2">&minus;</button>
          )}

          {dropOffSuggestions.length > 0 && activeDropIndex === idx && (
            <ul className="absolute z-10 bg-white border rounded shadow max-h-40 overflow-y-auto w-full top-full left-0 mt-1">
              <li className="p-2 bg-blue-50 hover:bg-blue-100 cursor-pointer border-b" onClick={() => {
                const updated = [...dropOffs];
                updated[idx] = dropOffs[idx];
                setDropOffs(updated);
                setDropOffTypes((prev) => ({ ...prev, [idx]: "location" }));
                setDropOffSuggestions([]);
              }}>
                ➕ Use: "{dropOffs[idx]}"
              </li>
              {dropOffSuggestions.map((sug, i) => (
                <li key={i} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => {
                  const updated = [...dropOffs];
                  updated[idx] = `${sug.name} - ${sug.formatted_address}`;
                  setDropOffs(updated);
                  setDropOffTypes((prev) => ({ ...prev, [idx]: sug.source }));
                  setDropOffSuggestions([]);
                }}>
                  {sug.name} - {sug.formatted_address}
                </li>
              ))}
            </ul>
          )}

          {dropOffTypes[idx] === "airport" && (
            <input type="text" name={`dropoff_terminal_${idx}`} placeholder="Terminal No." className="custom_input mt-2" value={journeyData[`dropoff_terminal_${idx}`] || ""} onChange={handleChange} />
          )}
          {dropOffTypes[idx] === "location" && (
            <input type="text" name={`dropoffDoorNumber${idx}`} placeholder="Drop Off Door No." className="custom_input mt-2" value={journeyData[`dropoffDoorNumber${idx}`] || ""} onChange={handleChange} />
          )}
        </div>
      ))}

      <button type="button" onClick={addDropOff} className="btn btn-edit mb-4">
        + Additional Drop Off
      </button>

      <textarea name="notes" placeholder="Notes" rows="3" className="custom_input" value={journeyData.notes} onChange={handleChange} />
      <textarea name="internalNotes" placeholder="Internal Notes" rows="3" className="custom_input" value={journeyData.internalNotes} onChange={handleChange} />
    </div>
  );
};

export default JourneyCard;
