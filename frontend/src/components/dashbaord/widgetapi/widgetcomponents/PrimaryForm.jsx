import React from 'react'
import SelectOption from '../../../../constants/constantscomponents/SelectOption';
import Icons from '../../../../assets/icons';

const PrimaryForm = ({
    formData,
    handlePickupChange,
    pickupSuggestions = [],
    handlePickupSelect,
    pickupType,
    setPickupType,
    dropOffs = [],
    setDropOffs,
    setPickupSuggestions,
    setDropOffTypes,
    setDropOffSuggestions,
    dropOffSuggestions = [],
    activeDropIndex,
    handleDropOffChange,
    handleDropOffSelect,
    dropOffTypes = {},
    removeDropOff,
    addDropOff,
    handleChange,
    setMode,
    mode,
    formattedHourlyOptions = [],
    selectedHourly,
    setSelectedHourly,
    setFormData,
}) => {
    return (
        <>
            <div className="flex justify-center mb-4">
                {["Transfer", "Hourly"].map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => setMode(tab)}
                        className={`px-6 py-2 font-semibold text-sm border cursor-pointer 
                            ${mode === tab
                                ? "bg-white text-[var(--main-color)] border-2 border-[var(--main-color)]"
                                : "bg-[#f9fafb] text-gray-700 border-[var(--light-gray)]"
                            } 
                            ${tab === "Transfer" ? "rounded-l-md" : "rounded-r-md"}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {mode === "Hourly" && (
                <div className="flex justify-center">
                    <SelectOption
                        options={formattedHourlyOptions.map(opt => ({
                            label: opt.label,
                            value: JSON.stringify(opt.value),
                        }))}
                        value={JSON.stringify(selectedHourly?.value)}
                        onChange={(e) => {
                            const selected = formattedHourlyOptions.find(
                                opt => JSON.stringify(opt.value) === e.target.value
                            );
                            setSelectedHourly(selected);
                            setFormData(prev => ({
                                ...prev,
                                hourlyOption: selected,
                                originalHourlyOption: selected
                            }));
                        }}
                    />
                </div>
            )}

            <div className="relative">
                <label className="text-sm font-medium text-[var(--dark-gray)] mb-1 block">Pickup Location</label>
                <input
                    type="text"
                    name="pickup"
                    placeholder="Enter pickup location..."
                    value={formData.pickup}
                    onChange={handlePickupChange}
                    className="custom_input"
                />
                {pickupSuggestions.length > 0 && (
                    <ul className="absolute z-20 bg-white border rounded shadow max-h-40 overflow-y-auto w-full mt-1">
                        <li
                            onClick={() => {
                                setFormData({ ...formData, pickup: formData.pickup });
                                setPickupType("location");
                                setPickupSuggestions([]);
                            }}
                            className="p-2 bg-blue-50 hover:bg-blue-100 cursor-pointer text-sm border-b"
                        >
                            ➕ Use: "{formData.pickup}"
                        </li>
                        {pickupSuggestions.map((sug, idx) => (
                            <li
                                key={idx}
                                onClick={() => handlePickupSelect(sug)}
                                className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                            >
                                {sug.name} - {sug.formatted_address}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {pickupType === "location" && !formData.pickup?.toLowerCase().includes("airport") && (
                <input
                    name="pickupDoorNumber"
                    placeholder="Pickup Door No."
                    className="custom_input"
                    value={formData.pickupDoorNumber}
                    onChange={handleChange}
                />
            )}

            {(pickupType === "airport" || formData.pickup?.toLowerCase().includes("airport")) && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                        name="arrivefrom"
                        placeholder="Arriving From"
                        value={formData.arrivefrom}
                        onChange={handleChange}
                        className="custom_input"
                    />
                    <input
                        name="pickmeAfter"
                        placeholder="Pick Me After"
                        value={formData.pickmeAfter}
                        onChange={handleChange}
                        className="custom_input"
                    />
                    <input
                        name="flightNumber"
                        placeholder="Flight No."
                        value={formData.flightNumber}
                        onChange={handleChange}
                        className="custom_input"
                    />
                </div>
            )}

            {dropOffs.map((val, idx) => (
                <div key={idx} className="relative space-y-2">
                    <label className="text-sm text-[var(--dark-gray)]">Drop Off Location</label>
                    <input
                        type="text"
                        value={val}
                        placeholder="Enter Drop Off location..."
                        onChange={(e) => handleDropOffChange(idx, e.target.value)}
                        className="custom_input"
                    />
                    {dropOffSuggestions.length > 0 && activeDropIndex === idx && (
                        <ul className="absolute z-20 bg-white border rounded shadow max-h-40 overflow-y-auto w-full mt-1">
                            <li
                                onClick={() => {
                                    const updated = [...dropOffs];
                                    updated[idx] = dropOffs[idx];
                                    setDropOffs(updated);
                                    setDropOffTypes((prev) => ({ ...prev, [idx]: "location" }));
                                    setDropOffSuggestions([]);
                                }}
                                className="p-2 bg-blue-50 hover:bg-blue-100 cursor-pointer text-sm border-b"
                            >
                                ➕ Use: "{dropOffs[idx]}"
                            </li>
                            {dropOffSuggestions.map((sug, i) => (
                                <li
                                    key={i}
                                    onClick={() => handleDropOffSelect(idx, sug)}
                                    className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                                >
                                    {sug.name} - {sug.formatted_address}
                                </li>
                            ))}
                        </ul>
                    )}

                    {(dropOffTypes[idx] === "airport" || dropOffs[idx]?.toLowerCase().includes("airport")) && (
                        <input
                            name={`dropoff_terminal_${idx}`}
                            value={formData[`dropoff_terminal_${idx}`] || ""}
                            placeholder="Terminal No."
                            className="custom_input"
                            onChange={handleChange}
                        />
                    )}

                    {dropOffs[idx] &&
                        dropOffTypes[idx] !== "airport" &&
                        !dropOffs[idx]?.toLowerCase().includes("airport") && (
                            <input
                                name={`dropoffDoorNumber${idx}`}
                                value={formData[`dropoffDoorNumber${idx}`] || ""}
                                placeholder="Drop Off Door No."
                                className="custom_input"
                                onChange={handleChange}
                            />
                        )}

                    {idx > 0 && (
                        <button
                            type="button"
                            onClick={() => removeDropOff(idx)}
                            className="text-sm text-red-600 cursor-pointer absolute right-1 top-0"
                        >
                            <Icons.Delete />
                        </button>
                    )}
                </div>
            ))}

            {dropOffs.length < 3 && (
                <button
                    type="button"
                    onClick={addDropOff}
                    className="btn btn-edit text-sm px-4 py-2 w-full sm:w-auto"
                >
                    + Add Drop Off
                </button>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="custom_input"
                />
                <select
                    name="hour"
                    value={formData.hour}
                    onChange={handleChange}
                    className="custom_input"
                >
                    <option value="">HH</option>
                    {[...Array(24).keys()].map((h) => (
                        <option key={h} value={h}>
                            {h.toString().padStart(2, "0")}
                        </option>
                    ))}
                </select>
                <select
                    name="minute"
                    value={formData.minute}
                    onChange={handleChange}
                    className="custom_input"
                >
                    <option value="">MM</option>
                    {[...Array(60).keys()].map((m) => (
                        <option key={m} value={m}>
                            {m.toString().padStart(2, "0")}
                        </option>
                    ))}
                </select>
            </div>

            <textarea
                name="notes"
                placeholder="Notes"
                className="custom_input"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
            />

            <div className="text-right">
                <button
                    type="submit"
                    className="bg-amber-500 text-white px-5 py-2 rounded-md text-sm shadow hover:bg-amber-600"
                >
                    GET QUOTE
                </button>
            </div>
        </>
    )
}

export default PrimaryForm
