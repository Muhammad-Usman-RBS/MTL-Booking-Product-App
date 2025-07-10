import React from 'react'

const ReturnForm = ({
    formData = {},
    returnFormData = {},
    handleChange = () => { },
    dropOffs = [],
}) => {
    return (
        <>
            <div className='space-y-3'>
                <div className="relative">
                    <label className="text-sm font-medium text-gray-400 mb-1 block">Pickup Location</label>
                    <input
                        type="text"
                        name="pickup"
                        value={formData.pickup}
                        placeholder="Pickup Location"
                        className="custom_input bg-gray-300"
                        disabled
                    />
                </div>

                {formData.pickup &&
                    formData.pickup.toLowerCase().includes("airport") && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <input
                                name="arrivefrom"
                                placeholder="Arriving From"
                                value={returnFormData.arrivefrom}
                                onChange={handleChange}
                                className="custom_input"
                            />
                            <input
                                name="pickmeAfter"
                                placeholder="Pick Me After"
                                value={returnFormData.pickmeAfter}
                                onChange={handleChange}
                                className="custom_input"
                            />
                            <input
                                name="flightNumber"
                                placeholder="Flight No."
                                value={returnFormData.flightNumber}
                                onChange={handleChange}
                                className="custom_input"
                            />
                        </div>
                    )}

                {formData.pickup &&
                    !formData.pickup.toLowerCase().includes("airport") && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <input
                                name="pickupDoorNumber"
                                placeholder="Pickup Door No."
                                value={returnFormData.pickupDoorNumber || ""}
                                onChange={handleChange}
                                className="custom_input"
                            />
                        </div>
                    )}

                {dropOffs.map((val, idx) => (
                    <div key={idx} className="relative space-y-2">
                        <label className="text-sm text-gray-600">Drop Off {idx + 1}</label>
                        <input
                            type="text"
                            value={val}
                            placeholder={`Drop Off ${idx + 1}`}
                            className="custom_input bg-gray-300"
                            disabled
                        />
                    </div>
                ))}

                {dropOffs.some(loc => loc && loc.toLowerCase().includes("airport")) && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                        <input
                            name="terminal"
                            placeholder="Terminal No."
                            value={returnFormData.terminal || ''}
                            onChange={handleChange}
                            className="custom_input"
                        />
                    </div>
                )}

                {dropOffs.some(loc => loc && !loc.toLowerCase().includes("airport")) && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                        <input
                            name="dropoffDoorNumber"
                            placeholder="Drop Off Door No."
                            value={returnFormData.dropoffDoorNumber || ""}
                            onChange={handleChange}
                            className="custom_input"
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                        type="date"
                        name="date"
                        value={returnFormData.date}
                        onChange={handleChange}
                        className="custom_input"

                    />
                    <select
                        name="hour"
                        value={returnFormData.hour}
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
                        value={returnFormData.minute}
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
                    value={returnFormData.notes}
                    onChange={handleChange}
                    rows={2}
                />

            </div>
        </>
    )
}

export default ReturnForm
