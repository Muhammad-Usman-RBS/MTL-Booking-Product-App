import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLazySearchGooglePlacesQuery, useLazyGetDistanceQuery } from '../../../redux/api/googleApi';
import { useCreateBookingMutation } from '../../../redux/api/bookingApi';
import SelectOption from '../../../constants/constantscomponents/SelectOption';
import { useNavigate } from 'react-router-dom';

const hourlyOptions = ['40 miles 4 hours', '60 miles 6 hours', '80 miles 8 hours'];

const WidgetBooking = ({ onSubmitSuccess, companyId: parentCompanyId }) => {
    const [mode, setMode] = useState('Transfer');
    const [selectedHourly, setSelectedHourly] = useState(hourlyOptions[0]);
    const [dropOffs, setDropOffs] = useState(['']);
    const [pickupSuggestions, setPickupSuggestions] = useState([]);
    const [dropOffSuggestions, setDropOffSuggestions] = useState([]);
    const [activeDropIndex, setActiveDropIndex] = useState(null);
    const [pickupType, setPickupType] = useState(null);
    const [dropOffTypes, setDropOffTypes] = useState({});

    const [formData, setFormData] = useState({
        pickup: '',
        arrivefrom: '',
        pickmeAfter: '',
        flightNumber: '',
        pickupDoorNumber: '',
        notes: '',
        internalNotes: '',
        date: '',
        hour: '',
        minute: '',
        hourlyOption: '',
    });

    const navigate = useNavigate();
    const [createBooking] = useCreateBookingMutation();
    const [triggerSearchAutocomplete] = useLazySearchGooglePlacesQuery();
    const [triggerDistance] = useLazyGetDistanceQuery();

    const companyId = parentCompanyId || new URLSearchParams(window.location.search).get('company') || '';

    useEffect(() => {
        const sendHeight = () => {
            const height = document.documentElement.scrollHeight;
            window.parent.postMessage({ type: "setHeight", height }, "*");
        };
        sendHeight();
        const resizeObserver = new ResizeObserver(sendHeight);
        resizeObserver.observe(document.body);
        return () => resizeObserver.disconnect();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

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
        setFormData({ ...formData, pickup: val });
        if (val.length >= 3) fetchSuggestions(val, setPickupSuggestions);
        else setPickupSuggestions([]);
    };

    const handlePickupSelect = (sug) => {
        const full = `${sug.name} - ${sug.formatted_address}`;
        setFormData((prev) => ({ ...prev, pickup: full }));
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.pickup || dropOffs[0].trim() === '') {
            toast.error("Pickup and at least one Drop Off is required.");
            return;
        }

        const dynamicFields = {};
        dropOffs.forEach((val, idx) => {
            dynamicFields[`dropoffDoorNumber${idx}`] = formData[`dropoffDoorNumber${idx}`] || '';
            dynamicFields[`dropoff_terminal_${idx}`] = formData[`dropoff_terminal_${idx}`] || '';
        });

        const payload = {
            ...formData,
            dropoff: dropOffs[0],
            additionalDropoff1: dropOffs[1] || null,
            additionalDropoff2: dropOffs[2] || null,
            hourlyOption: mode === 'Hourly' ? selectedHourly : null,
            mode,
            returnJourney: false,
            companyId,
            referrer: document.referrer,
            ...dynamicFields,
        };

        try {
            const origin = formData.pickup?.replace("Custom Input - ", "").split(" - ").pop()?.trim();
            const destination = dropOffs[0]?.replace("Custom Input - ", "").split(" - ").pop()?.trim();

            if (!origin || !destination) {
                toast.error("Origin or destination is empty.");
                return;
            }

            const res = await triggerDistance({ origin, destination }).unwrap();
            if (res?.distanceText && res?.durationText) {
                payload.distanceText = res.distanceText;
                payload.durationText = res.durationText;
            }
        } catch (err) {
            console.error("Distance API error:", err);
        }

        localStorage.setItem("bookingForm", JSON.stringify(payload));
        if (onSubmitSuccess) onSubmitSuccess();
    };

    return (
        <div className="max-w-2xl">
            <form onSubmit={handleSubmit} className="bg-gradient-to-br from-[#ffffff] via-[#f9fafb] to-[#f1f5f9] border border-gray-200 shadow-sm rounded-xl px-6 py-7 space-y-6">
                <ToastContainer />

                <div className="relative">
                    <input type="text" name="pickup" placeholder="Pickup Location" value={formData.pickup} onChange={handlePickupChange} className="custom_input" />
                    {pickupSuggestions.length > 0 && (
                        <ul className="absolute z-10 bg-white border rounded shadow max-h-40 overflow-y-auto w-full">
                            <li
                                onClick={() => {
                                    setFormData({ ...formData, pickup: formData.pickup });
                                    setPickupType("location");
                                    setPickupSuggestions([]);
                                }}
                                className="p-2 bg-blue-50 hover:bg-blue-100 cursor-pointer border-b"
                            >
                                ➕ Use: "{formData.pickup}"
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
                    <input name="pickupDoorNumber" placeholder="Pickup Door No." className="custom_input" value={formData.pickupDoorNumber} onChange={handleChange} />
                )}
                {pickupType === "airport" && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input name="arrivefrom" placeholder="Arriving From" value={formData.arrivefrom} onChange={handleChange} className="custom_input" />
                        <input name="pickmeAfter" placeholder="Pick Me After" value={formData.pickmeAfter} onChange={handleChange} className="custom_input" />
                        <input name="flightNumber" placeholder="Flight No." value={formData.flightNumber} onChange={handleChange} className="custom_input" />
                    </div>
                )}

                {dropOffs.map((val, idx) => (
                    <div key={idx} className="relative">
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

                        {/* ✅ Terminal No. Field */}
                        {dropOffTypes[idx] === "airport" && (
                            <input
                                name={`dropoff_terminal_${idx}`}
                                value={formData[`dropoff_terminal_${idx}`] || ''}
                                placeholder="Terminal No."
                                className="custom_input mt-2"
                                onChange={handleChange}
                            />
                        )}

                        {/* ✅ Door No. Field */}
                        {dropOffTypes[idx] === "location" && (
                            <input
                                name={`dropoffDoorNumber${idx}`}
                                value={formData[`dropoffDoorNumber${idx}`] || ''}
                                placeholder="Drop Off Door No."
                                className="custom_input mt-2"
                                onChange={handleChange}
                            />
                        )}

                        {idx > 0 && (
                            <button type="button" onClick={() => removeDropOff(idx)} className="btn btn-cancel absolute right-0 top-0 mt-1 mr-2">&minus;</button>
                        )}
                    </div>
                ))}

                {dropOffs.length < 3 && (
                    <button type="button" onClick={addDropOff} className="btn btn-edit">+ Add Drop Off</button>
                )}

                {mode === 'Hourly' && (
                    <SelectOption options={hourlyOptions} value={selectedHourly} onChange={(e) => setSelectedHourly(e.target.value)} />
                )}

                <div className="grid grid-cols-3 gap-2">
                    <input type="date" name="date" value={formData.date} onChange={handleChange} className="custom_input" />
                    <select name="hour" value={formData.hour} onChange={handleChange} className="custom_input">
                        <option value="">HH</option>
                        {[...Array(24).keys()].map(h => <option key={h} value={h}>{h.toString().padStart(2, '0')}</option>)}
                    </select>
                    <select name="minute" value={formData.minute} onChange={handleChange} className="custom_input">
                        <option value="">MM</option>
                        {[...Array(60).keys()].map(m => <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>)}
                    </select>
                </div>

                <textarea name="notes" placeholder="Notes" className="custom_input" value={formData.notes} onChange={handleChange} rows={2} />

                <div className="text-right pt-2">
                    <button type="submit" className="bg-amber-500 text-white px-6 py-2 rounded-md shadow hover:bg-amber-600">
                        GET QUOTE
                    </button>
                </div>
            </form>
        </div>
    );
};

export default WidgetBooking;