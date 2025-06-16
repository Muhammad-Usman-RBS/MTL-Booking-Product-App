import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SelectOption from '../../../constants/constantscomponents/SelectOption';
import { useLazySearchGooglePlacesQuery } from '../../../redux/api/googleApi';
import { useFetchAllPostcodePricesWidgetQuery } from '../../../redux/api/postcodePriceApi';
import { findCheckedPrice } from '../../../utils/postcodeLogic';

const WidgetBooking = ({ onCheckedPriceFound, companyId }) => {

    const [mode, setMode] = useState('Transfer');
    const [dropOffs, setDropOffs] = useState(['']);
    const [pickupType, setPickupType] = useState(null);
    const [dropOffTypes, setDropOffTypes] = useState({});
    const [pickupSuggestions, setPickupSuggestions] = useState([]);
    const [dropOffSuggestions, setDropOffSuggestions] = useState([]);
    const [activeDropIndex, setActiveDropIndex] = useState(null);
    const [triggerSearchAutocomplete] = useLazySearchGooglePlacesQuery();

    const [formData, setFormData] = useState({
        pickup: '',
        arrivefrom: '',
        pickmeAfter: '',
        flightNumber: '',
        pickupDoorNumber: '',
        notes: '',
        date: '',
        hour: '',
        minute: ''
    });

    const { data: postcodePrices = [] } = useFetchAllPostcodePricesWidgetQuery(companyId, {
        skip: !companyId
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Pickup Autocomplete
    const handlePickupChange = async (e) => {
        const val = e.target.value;
        setFormData(prev => ({ ...prev, pickup: val }));

        if (val.length >= 3) {
            try {
                const res = await triggerSearchAutocomplete(val).unwrap();
                const results = res.predictions.map(r => ({
                    name: r.name || r.structured_formatting?.main_text,
                    formatted_address: r.formatted_address || r.description,
                    source: r.source || (r.types?.includes('airport') ? 'airport' : 'location'),
                }));
                setPickupSuggestions(results);
            } catch (err) {
                console.error('Autocomplete error:', err);
            }
        } else {
            setPickupSuggestions([]);
        }
    };

    const handlePickupSelect = (sug) => {
        const full = `${sug.name} - ${sug.formatted_address}`;
        setFormData(prev => ({ ...prev, pickup: full }));
        setPickupType(sug.source);
        setPickupSuggestions([]);
    };

    // DropOff Autocomplete
    const handleDropOffChange = async (idx, val) => {
        const updated = [...dropOffs];
        updated[idx] = val;
        setDropOffs(updated);
        setActiveDropIndex(idx);

        if (val.length >= 3) {
            try {
                const res = await triggerSearchAutocomplete(val).unwrap();
                const results = res.predictions.map(r => ({
                    name: r.name || r.structured_formatting?.main_text,
                    formatted_address: r.formatted_address || r.description,
                    source: r.source || (r.types?.includes('airport') ? 'airport' : 'location'),
                }));
                setDropOffSuggestions(results);
            } catch (err) {
                console.error('Autocomplete error:', err);
            }
        } else {
            setDropOffSuggestions([]);
        }
    };

    const handleDropOffSelect = (idx, sug) => {
        const full = `${sug.name} - ${sug.formatted_address}`;
        const updated = [...dropOffs];
        updated[idx] = full;
        setDropOffs(updated);
        setDropOffTypes(prev => ({ ...prev, [idx]: sug.source }));
        setDropOffSuggestions([]);
    };

    const addDropOff = () => {
        if (dropOffs.length >= 3) return;
        setDropOffs([...dropOffs, '']);
    };

    const removeDropOff = (index) => {
        const updated = [...dropOffs];
        updated.splice(index, 1);
        setDropOffs(updated);
    };

    // ✅ GET QUOTE — PURE
    const handleGetQuote = () => {
        if (mode !== 'Transfer') {
            alert("Only Transfer Mode supported for pricing.");
            return;
        }

        if (!postcodePrices.length) {
            alert("Pricing data not loaded.");
            return;
        }

        const matched = findCheckedPrice(postcodePrices, formData.pickup, dropOffs[0]);

        if (matched) {
            console.log("Price Found:", matched);
            if (onCheckedPriceFound) {
                onCheckedPriceFound(matched);
            }
        } else {
            alert("No matching price found for the given locations.");
        }
    };

    return (
        <div className="max-w-xl w-full mx-auto mt-6 px-4 sm:px-0">
            <form className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200 rounded-2xl shadow-md px-5 py-6 space-y-6 text-sm">
                <ToastContainer />

                <div className="flex justify-center mb-4">
                    {["Transfer", "Hourly"].map((tab) => (
                        <button
                            key={tab}
                            type='button'
                            onClick={() => setMode(tab)}
                            className={`px-6 py-2 font-medium transition-all duration-200 ${mode === tab ? "bg-[#f3f4f6] text-dark border border-black" : "bg-[#f3f4f6] text-dark"} ${tab === "Transfer" ? "rounded-l-md" : "rounded-r-md"}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {mode === "Hourly" && (
                    <div className="flex justify-center">
                        <SelectOption options={[]} value={''} onChange={() => { }} />
                    </div>
                )}

                {/* Pickup Location */}
                <div className="relative">
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Pickup Location</label>
                    <input
                        type="text"
                        name="pickup"
                        placeholder="Enter pickup location"
                        value={formData.pickup}
                        onChange={handlePickupChange}
                        className="custom_input"
                    />
                    {pickupSuggestions.length > 0 && (
                        <ul className="absolute z-20 bg-white border rounded shadow max-h-40 overflow-y-auto w-full mt-1">
                            {pickupSuggestions.map((sug, idx) => (
                                <li
                                    key={idx}
                                    onClick={() => handlePickupSelect(sug)}
                                    className="p-2 hover:bg-gray-100 cursor-pointer text-xs"
                                >
                                    {sug.name} - {sug.formatted_address}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Drop Offs */}
                {dropOffs.map((val, idx) => (
                    <div key={idx} className="relative space-y-2">
                        <label className="text-xs text-gray-600">Drop Off {idx + 1}</label>
                        <input
                            type="text"
                            value={val}
                            placeholder={`Drop Off ${idx + 1}`}
                            onChange={(e) => handleDropOffChange(idx, e.target.value)}
                            className="custom_input"
                        />
                        {dropOffSuggestions.length > 0 && activeDropIndex === idx && (
                            <ul className="absolute z-20 bg-white border rounded shadow max-h-40 overflow-y-auto w-full mt-1">
                                {dropOffSuggestions.map((sug, i) => (
                                    <li
                                        key={i}
                                        onClick={() => handleDropOffSelect(idx, sug)}
                                        className="p-2 hover:bg-gray-100 cursor-pointer text-xs"
                                    >
                                        {sug.name} - {sug.formatted_address}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {idx > 0 && (
                            <button type="button" onClick={() => removeDropOff(idx)} className="text-xs text-red-600 absolute right-1 top-0">&minus;</button>
                        )}
                    </div>
                ))}

                {dropOffs.length < 3 && (
                    <button type="button" onClick={addDropOff} className="btn btn-edit text-xs px-4 py-2 w-full sm:w-auto">
                        + Add Drop Off
                    </button>
                )}

                {/* Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input type="date" name="date" value={formData.date} onChange={handleChange} className="custom_input" />
                    <select name="hour" value={formData.hour} onChange={handleChange} className="custom_input">
                        <option value="">HH</option>
                        {[...Array(24).keys()].map((h) => (
                            <option key={h} value={h}>{h.toString().padStart(2, "0")}</option>
                        ))}
                    </select>
                    <select name="minute" value={formData.minute} onChange={handleChange} className="custom_input">
                        <option value="">MM</option>
                        {[...Array(60).keys()].map((m) => (
                            <option key={m} value={m}>{m.toString().padStart(2, "0")}</option>
                        ))}
                    </select>
                </div>

                <textarea name="notes" placeholder="Notes" className="custom_input" value={formData.notes} onChange={handleChange} rows={2} />

                <div className="text-right">
                    <button type="button" onClick={handleGetQuote} className="bg-amber-500 text-white px-5 py-2 rounded-md text-sm shadow hover:bg-amber-600">
                        GET QUOTE
                    </button>
                </div>
            </form>
        </div>
    );
};

export default WidgetBooking;
