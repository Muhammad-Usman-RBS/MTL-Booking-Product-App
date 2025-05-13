import React, { useState } from "react";
import { toast } from "react-toastify";
import {
    useLazySearchGooglePlacesQuery,
} from "../../../redux/api/googleApi";

const JourneyCard = ({
    title,
    journeyData,
    setJourneyData,
    dropOffs,
    setDropOffs,
}) => {
    const [pickupSuggestions, setPickupSuggestions] = useState([]);
    const [dropOffSuggestions, setDropOffSuggestions] = useState([]);
    const [activeDropIndex, setActiveDropIndex] = useState(null);
    const [isAirportApi, setIsAirportApi] = useState(false);
    const [isLocationApi, setIsLocationApi] = useState(false);

    const [triggerSearchAutocomplete] = useLazySearchGooglePlacesQuery();

    const fetchSuggestions = async (query, setter) => {
        if (!query) {
            setter([]);
            return;
        }
        try {
            const response = await triggerSearchAutocomplete(query).unwrap();
            const results = response.predictions.map((r) => ({
                name: r.structured_formatting?.main_text,
                formatted_address: r.description,
                source: r.types?.includes("airport") ? "airport" : "location",
            }));
            setter(results);
        } catch (error) {
            console.error("Error fetching autocomplete:", error);
        }
    };

    const addDropOff = () => {
        if (dropOffs.length >= 3) {
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

    const handlePickupChange = (e) => {
        const { value } = e.target;
        setJourneyData({ ...journeyData, pickup: value });
        fetchSuggestions(value, setPickupSuggestions);
    };

    const handleDropoffChange = (index, value) => {
        const updated = [...dropOffs];
        updated[index] = value;
        setDropOffs(updated);
        setActiveDropIndex(index);
        fetchSuggestions(value, setDropOffSuggestions);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setJourneyData({ ...journeyData, [name]: value });
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
                    <input
                        type="date"
                        name="date"
                        className="custom_input"
                        value={journeyData.date}
                        onChange={handleChange}
                    />
                    <div className="flex gap-4 w-full sm:w-1/2">
                        <select
                            name="hour"
                            className="custom_input"
                            value={journeyData.hour}
                            onChange={handleChange}
                        >
                            <option disabled value="">
                                HH
                            </option>
                            {[...Array(24).keys()].map((h) => (
                                <option key={h} value={h}>
                                    {h.toString().padStart(2, "0")}
                                </option>
                            ))}
                        </select>
                        <select
                            name="minute"
                            className="custom_input"
                            value={journeyData.minute}
                            onChange={handleChange}
                        >
                            <option disabled value="">
                                MM
                            </option>
                            {[...Array(60).keys()].map((m) => (
                                <option key={m} value={m}>
                                    {m.toString().padStart(2, "0")}
                                </option>
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
                        {pickupSuggestions.map((sug, idx) => (
                            <li
                                key={idx}
                                onClick={() => {
                                    setJourneyData({
                                        ...journeyData,
                                        pickup: `${sug.name} - ${sug.formatted_address}`,
                                    });
                                    setIsAirportApi(sug.source === "airport");
                                    setIsLocationApi(sug.source === "location");
                                    setPickupSuggestions([]);
                                }}
                                className="p-2 hover:bg-gray-100 cursor-pointer"
                            >
                                {sug.name} - {sug.formatted_address}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {isAirportApi && (
                <div className="mb-4">
                    <input
                        type="text"
                        name="doorNumber"
                        placeholder="Door No."
                        className="custom_input"
                        value={journeyData.doorNumber || ""}
                        onChange={handleChange}
                    />
                </div>
            )}

            {isLocationApi && (
                <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                        type="text"
                        name="arrivefrom"
                        placeholder="Arriving From"
                        className="custom_input"
                        value={journeyData.arrivefrom || ""}
                        onChange={handleChange}
                    />
                    <input
                        type="text"
                        name="pickmeAfter"
                        placeholder="Pick Me After"
                        className="custom_input"
                        value={journeyData.pickmeAfter || ""}
                        onChange={handleChange}
                    />
                    <input
                        type="text"
                        name="flightNumber"
                        placeholder="Flight No."
                        className="custom_input"
                        value={journeyData.flightNumber || ""}
                        onChange={handleChange}
                    />
                </div>
            )}

            {dropOffs.map((val, idx) => (
                <div key={idx} className="relative mb-2 flex items-center">
                    <input
                        type="text"
                        value={val}
                        placeholder={`Drop Off${idx === 0 ? "" : ` ${idx + 1}`}`}
                        onChange={(e) => handleDropoffChange(idx, e.target.value)}
                        className="custom_input w-full"
                    />
                    {idx > 0 && (
                        <button
                            type="button"
                            onClick={() => removeDropOff(idx)}
                            className="btn btn-cancel text-white px-3 rounded ml-2"
                        >
                            &minus;
                        </button>
                    )}
                    {dropOffSuggestions.length > 0 && activeDropIndex === idx && (
                        <ul className="absolute z-10 bg-white border rounded shadow max-h-40 overflow-y-auto w-full top-full left-0 mt-1">
                            {dropOffSuggestions.map((sug, index) => (
                                <li
                                    key={index}
                                    onClick={() => {
                                        const updated = [...dropOffs];
                                        updated[idx] = `${sug.name} - ${sug.formatted_address}`;
                                        setDropOffs(updated);
                                        setDropOffSuggestions([]);
                                    }}
                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                >
                                    {sug.name} - {sug.formatted_address}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ))}

            <button type="button" onClick={addDropOff} className="btn btn-edit mb-4">
                + Additional Drop Off
            </button>

            <textarea
                name="notes"
                placeholder="Notes"
                rows="3"
                className="custom_input"
                value={journeyData.notes}
                onChange={handleChange}
            />
            <textarea
                name="internalNotes"
                placeholder="Internal Notes"
                rows="3"
                className="custom_input"
                value={journeyData.internalNotes}
                onChange={handleChange}
            />
        </div>
    );
};

export default JourneyCard;
