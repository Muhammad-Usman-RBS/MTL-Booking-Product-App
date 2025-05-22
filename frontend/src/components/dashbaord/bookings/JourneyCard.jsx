import React, { useState } from "react";
import { toast } from "react-toastify";
import { useLazySearchGooglePlacesQuery } from "../../../redux/api/googleApi";

const JourneyCard = ({ title, journeyData, setJourneyData, dropOffs, setDropOffs }) => {
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
                source: r.source || (r.types?.includes('airport') ? 'airport' : 'location'),
            }));
            setter(results);
        } catch (err) {
            console.error('Autocomplete error:', err);
        }
    };

    const handlePickupChange = (e) => {
        const val = e.target.value;
        setJourneyData({ ...journeyData, pickup: val });
        if (val.length >= 3) fetchSuggestions(val, setPickupSuggestions);
        else setPickupSuggestions([]);
    };

    const handlePickupSelect = (sug) => {
        const full = `${sug.name} - ${sug.formatted_address}`;
        setJourneyData((prev) => ({ ...prev, pickup: full }));
        setPickupType(sug.source);
        setPickupSuggestions([]);
    };

    const handleDropOffChange = (idx, val) => {
        const updated = [...dropOffs];
        updated[idx] = val;
        setDropOffs(updated);
        setActiveDropIndex(idx);
        if (val.length >= 3) fetchSuggestions(val, setDropOffSuggestions);
        else setDropOffSuggestions([]);
    };

    const handleDropOffSelect = (idx, sug) => {
        const full = `${sug.name} - ${sug.formatted_address}`;
        const updated = [...dropOffs];
        updated[idx] = full;
        setDropOffs(updated);
        setDropOffSuggestions([]);
        setDropOffTypes((prev) => ({ ...prev, [idx]: sug.source }));
    };

    const addDropOff = () => {
        if (dropOffs.length >= 3) {
            toast.warning('Maximum 3 drop-offs allowed.');
            return;
        }
        setDropOffs([...dropOffs, '']);
    };

    const removeDropOff = (index) => {
        const updated = [...dropOffs];
        updated.splice(index, 1);
        const types = { ...dropOffTypes };
        delete types[index];
        setDropOffs(updated);
        setDropOffTypes(types);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setJourneyData((prev) => ({ ...prev, [name]: value }));
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

            <div className="relative">
                <input type="text" name="pickup" placeholder="Pickup Location" value={journeyData.pickup} onChange={handlePickupChange} className="custom_input" />
                {pickupSuggestions.length > 0 && (
                    <ul className="absolute z-10 bg-white border rounded shadow max-h-40 overflow-y-auto w-full">
                        <li
                            onClick={() => {
                                setJourneyData({ ...journeyData, pickup: journeyData.pickup });
                                setPickupType("location");
                                setPickupSuggestions([]);
                            }}
                            className="p-2 bg-blue-50 hover:bg-blue-100 cursor-pointer border-b"
                        >
                            ➕ Use: "{journeyData.pickup}"
                        </li>
                        {pickupSuggestions.map((sug, idx) => (
                            <li key={idx} onClick={() => handlePickupSelect(sug)} className="p-2 hover:bg-gray-100 cursor-pointer">
                                {sug.name} - {sug.formatted_address}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {pickupType === "location" && (
                <input name="pickupDoorNumber" placeholder="Pickup Door No." className="custom_input" value={journeyData.pickupDoorNumber || ""} onChange={handleChange} />
            )}
            {pickupType === "airport" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
                    <input name="arrivefrom" placeholder="Arriving From" value={journeyData.arrivefrom || ""} onChange={handleChange} className="custom_input" />
                    <input name="pickmeAfter" placeholder="Pick Me After" value={journeyData.pickmeAfter || ""} onChange={handleChange} className="custom_input" />
                    <input name="flightNumber" placeholder="Flight No." value={journeyData.flightNumber || ""} onChange={handleChange} className="custom_input" />
                </div>
            )}

            {dropOffs.map((val, idx) => (
                <div key={idx} className="relative mt-4">
                    <input
                        type="text"
                        value={val}
                        placeholder={`Drop Off ${idx + 1}`}
                        onChange={(e) => handleDropOffChange(idx, e.target.value)}
                        className="custom_input"
                    />
                    {dropOffSuggestions.length > 0 && activeDropIndex === idx && (
                        <ul className="absolute z-10 bg-white border rounded shadow max-h-40 overflow-y-auto w-full top-full left-0 mt-1">
                            <li
                                onClick={() => {
                                    const updated = [...dropOffs];
                                    updated[idx] = dropOffs[idx];
                                    setDropOffs(updated);
                                    setDropOffTypes((prev) => ({ ...prev, [idx]: "location" }));
                                    setDropOffSuggestions([]);
                                }}
                                className="p-2 bg-blue-50 hover:bg-blue-100 cursor-pointer border-b"
                            >
                                ➕ Use: "{dropOffs[idx]}"
                            </li>
                            {dropOffSuggestions.map((sug, i) => (
                                <li key={i} onClick={() => handleDropOffSelect(idx, sug)} className="p-2 hover:bg-gray-100 cursor-pointer">
                                    {sug.name} - {sug.formatted_address}
                                </li>
                            ))}
                        </ul>
                    )}

                    {dropOffTypes[idx] === "airport" && (
                        <input
                            name={`dropoff_terminal_${idx}`}
                            value={journeyData[`dropoff_terminal_${idx}`] || ''}
                            placeholder="Terminal No."
                            className="custom_input mt-4"
                            onChange={handleChange}
                        />
                    )}

                    {dropOffTypes[idx] === "location" && (
                        <input
                            name={`dropoffDoorNumber${idx}`}
                            value={journeyData[`dropoffDoorNumber${idx}`] || ''}
                            placeholder="Drop Off Door No."
                            className="custom_input mt-4"
                            onChange={handleChange}
                        />
                    )}

                    {idx > 0 && (
                        <button type="button" onClick={() => removeDropOff(idx)} className="btn btn-cancel absolute right-0 top-0 mt-1 mr-2">&minus;</button>
                    )}
                </div>
            ))}

            {dropOffs.length < 3 && (
                <button type="button" onClick={addDropOff} className="btn btn-edit mt-4 mb-4">+ Add Drop Off</button>
            )}

            <textarea name="notes" placeholder="Notes" rows="3" className="custom_input" value={journeyData.notes} onChange={handleChange} />
            <textarea name="internalNotes" placeholder="Internal Notes" rows="3" className="custom_input" value={journeyData.internalNotes} onChange={handleChange} />
        </div>
    );
};

export default JourneyCard;
