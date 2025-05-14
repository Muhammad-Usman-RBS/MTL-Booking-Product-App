import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLazySearchGooglePlacesQuery } from '../../../redux/api/googleApi';
import { useSubmitWidgetFormMutation } from '../../../redux/api/widgetApi';
import { useCreateBookingMutation } from '../../../redux/api/bookingApi';
import SelectOption from '../../../constants/constantscomponents/SelectOption';

const hourlyOptions = ['40 miles 4 hours', '60 miles 6 hours', '80 miles 8 hours'];

const WidgetBooking = () => {
    const [mode, setMode] = useState('Transfer');
    const [selectedHourly, setSelectedHourly] = useState(hourlyOptions[0]);
    const [dropOffs, setDropOffs] = useState(['']);
    const [pickupSuggestions, setPickupSuggestions] = useState([]);
    const [dropOffSuggestions, setDropOffSuggestions] = useState([]);
    const [activeDropIndex, setActiveDropIndex] = useState(null);
    const [selectedPickup, setSelectedPickup] = useState(null);
    const [selectedDropOffs, setSelectedDropOffs] = useState({});
    const [isAirportApi, setIsAirportApi] = useState(false);
    const [isLocationApi, setIsLocationApi] = useState(false);
    const [pickupManuallyTyped, setPickupManuallyTyped] = useState(false);
    const [dropOffManuallyTyped, setDropOffManuallyTyped] = useState({});

    const [formData, setFormData] = useState({
        pickup: '', dropoff: '', pickmeAfter: '', flightNumber: '', arrivefrom: '',
        doorNumber: '', notes: '', internalNotes: '', date: '', hour: '', minute: '', hourlyOption: ''
    });

    const [companyId, setCompanyId] = useState('');
    const [createBooking] = useCreateBookingMutation();
    const [submitWidgetForm] = useSubmitWidgetFormMutation();
    const [triggerSearchAutocomplete] = useLazySearchGooglePlacesQuery();

    // useEffect(() => {
    //     const params = new URLSearchParams(window.location.search);
    //     const cid = params.get('company');
    //     if (cid) setCompanyId(cid);
    // }, []);

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
                name: r.structured_formatting?.main_text,
                formatted_address: r.description,
                source: r.types?.includes('airport') ? 'airport' : 'location',
            }));
            setter(results);
        } catch (err) {
            console.error('Autocomplete error:', err);
        }
    };

    const renderSortedSuggestions = (suggestions, selected, onSelect) => {
        const unique = [...new Map(suggestions.map((item) => [item.formatted_address, item])).values()];
        const sorted = selected
            ? [
                ...unique.filter(i => `${i.name} - ${i.formatted_address}` === selected),
                ...unique.filter(i => `${i.name} - ${i.formatted_address}` !== selected)
            ]
            : unique;

        return sorted.map((sug, idx) => (
            <li
                key={idx}
                onClick={() => onSelect(sug)}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
                {sug.name} - {sug.formatted_address}
            </li>
        ));
    };

    const handlePickupChange = (e) => {
        const val = e.target.value;
        setPickupManuallyTyped(true);
        setFormData({ ...formData, pickup: val });
        if (val.length >= 3) {
            fetchSuggestions(val, setPickupSuggestions);
        } else {
            setPickupSuggestions([]);
        }
    };


    const handlePickupSelect = (sug) => {
        const full = `${sug.name} - ${sug.formatted_address}`;
        setFormData({ ...formData, pickup: full });
        setSelectedPickup(full);
        setIsAirportApi(sug.source === 'airport');
        setIsLocationApi(sug.source === 'location');
        setPickupSuggestions([]);
        setPickupManuallyTyped(false);
    };


    const handleDropOffChange = (idx, val) => {
        const updated = [...dropOffs];
        updated[idx] = val;
        setDropOffs(updated);
        setActiveDropIndex(idx);
        setDropOffManuallyTyped((prev) => ({ ...prev, [idx]: true }));

        if (val.length >= 3) {
            fetchSuggestions(val, setDropOffSuggestions);
        } else {
            setDropOffSuggestions([]);
        }
    };

    const handleDropOffSelect = (idx, sug) => {
        const full = `${sug.name} - ${sug.formatted_address}`;
        const updated = [...dropOffs];
        updated[idx] = full;
        setDropOffs(updated);
        setSelectedDropOffs((prev) => ({ ...prev, [idx]: full }));
        setDropOffSuggestions([]);
        setDropOffManuallyTyped((prev) => ({ ...prev, [idx]: false }));
    };


    const addDropOff = () => {
        if (dropOffs.length >= 3) {
            toast.warning('Maximum 3 drop-offs allowed.');
            return;
        }
        setDropOffs([...dropOffs, '']);
    };

    const removeDropOff = (idx) => {
        const updated = [...dropOffs];
        updated.splice(idx, 1);
        setDropOffs(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const referrer = document.referrer;

        if (!selectedPickup && formData.pickup) {
            formData.pickup = `Custom Input - ${formData.pickup}`;
        }

        dropOffs.forEach((val, idx) => {
            if (!selectedDropOffs[idx] && val) {
                dropOffs[idx] = `Custom Input - ${val}`;
            }
        });


        const payload = {
            mode,
            returnJourney: false,
            companyId,
            referrer,
            journey1: {
                ...formData,
                dropoff: dropOffs[0],
                additionalDropoff1: dropOffs[1] || null,
                additionalDropoff2: dropOffs[2] || null,
                fare: 0,
                hourlyOption: mode === 'Hourly' ? selectedHourly : null,
            },
        };

        try {
            await submitWidgetForm(payload).unwrap();
            toast.success('🎯 Booking submitted successfully!');
            setFormData({
                pickup: '', dropoff: '', pickmeAfter: '', flightNumber: '', arrivefrom: '',
                doorNumber: '', notes: '', internalNotes: '', date: '', hour: '', minute: '', hourlyOption: ''
            });
            setDropOffs(['']);
        } catch (err) {
            console.error('Booking submission error:', err);
            toast.error(err?.data?.message || '❌ Booking submission failed');
        }
    };

    return (
        <>
            <ToastContainer />
            <div className="max-w-2xl">
                <form onSubmit={handleSubmit} className="bg-gradient-to-br from-[#ffffff] via-[#f9fafb] to-[#f1f5f9] border border-gray-200 shadow-sm rounded-xl px-6 py-7 space-y-6">
                    <div className="flex justify-center">
                        <div className="inline-flex border border-amber-200 bg-amber-50 rounded-full shadow-md overflow-hidden">
                            {['Transfer', 'Hourly'].map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setMode(tab)}
                                    className={`px-6 py-2 text-sm font-bold uppercase tracking-wide transition-all ${mode === tab
                                        ? 'bg-amber-500 text-white'
                                        : 'text-amber-800 hover:bg-amber-100'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {mode === 'Hourly' && (
                        <div className="w-full sm:w-1/2 mx-auto">
                            <SelectOption
                                options={hourlyOptions}
                                value={selectedHourly}
                                onChange={(e) => setSelectedHourly(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="space-y-4 text-sm text-gray-800">
                        <div className="relative">
                            <input
                                type="text"
                                name="pickup"
                                placeholder="Pickup Location"
                                autoComplete="off"
                                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                value={formData.pickup}
                                onChange={handlePickupChange}
                            />
                            {pickupSuggestions.length > 0 && pickupManuallyTyped && (
                                <ul className="absolute z-[9999] bg-white border border-gray-300 rounded mt-1 shadow max-h-40 overflow-y-auto w-full text-xs">
                                    {renderSortedSuggestions(pickupSuggestions, selectedPickup, handlePickupSelect)}
                                </ul>
                            )}

                        </div>

                        {isAirportApi && (
                            <input
                                type="text"
                                name="doorNumber"
                                placeholder="Door No."
                                className="w-full px-3 py-2 rounded-md border border-gray-300"
                                value={formData.doorNumber}
                                onChange={handleChange}
                            />
                        )}

                        {isLocationApi && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <input name="arrivefrom" placeholder="Arriving From" value={formData.arrivefrom} onChange={handleChange} className="px-3 py-2 rounded-md border border-gray-300" />
                                <input name="pickmeAfter" placeholder="Pick Me After" value={formData.pickmeAfter} onChange={handleChange} className="px-3 py-2 rounded-md border border-gray-300" />
                                <input name="flightNumber" placeholder="Flight No." value={formData.flightNumber} onChange={handleChange} className="px-3 py-2 rounded-md border border-gray-300" />
                            </div>
                        )}

                        {dropOffs.map((val, idx) => (
                            <div key={idx} className="relative flex items-center gap-2">
                                <input
                                    type="text"
                                    value={val}
                                    placeholder={`Drop Off${idx === 0 ? '' : ` ${idx + 1}`}`}
                                    onChange={(e) => handleDropOffChange(idx, e.target.value)}
                                    className="w-full px-3 py-2 rounded-md border border-gray-300"
                                />
                                {idx > 0 && (
                                    <button type="button" onClick={() => removeDropOff(idx)} className="text-red-500 hover:text-red-700 text-xs">✕</button>
                                )}
                                {dropOffSuggestions.length > 0 && activeDropIndex === idx && dropOffManuallyTyped[idx] && (
                                    <ul className="absolute z-[9999] bg-white border border-gray-300 rounded mt-1 shadow max-h-40 overflow-y-auto w-full text-xs">
                                        {renderSortedSuggestions(
                                            dropOffSuggestions,
                                            selectedDropOffs[idx],
                                            (sug) => handleDropOffSelect(idx, sug)
                                        )}
                                    </ul>
                                )}

                            </div>
                        ))}

                        {dropOffs.length < 3 && (
                            <button type="button" onClick={addDropOff} className="text-blue-500 hover:underline text-xs">
                                + Add Drop Off
                            </button>
                        )}

                        <div className="grid grid-cols-3 gap-2">
                            <input type="date" name="date" value={formData.date} onChange={handleChange} className="px-3 py-2 rounded-md border border-gray-300" />
                            <select name="hour" value={formData.hour} onChange={handleChange} className="px-2 py-2 rounded-md border border-gray-300">
                                <option value="">HH</option>
                                {[...Array(24).keys()].map(h => <option key={h} value={h}>{h.toString().padStart(2, '0')}</option>)}
                            </select>
                            <select name="minute" value={formData.minute} onChange={handleChange} className="px-2 py-2 rounded-md border border-gray-300">
                                <option value="">MM</option>
                                {[...Array(60).keys()].map(m => <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-1 gap-2">
                            <textarea name="notes" placeholder="Notes" className="w-full px-3 py-2 rounded-md border border-gray-300" value={formData.notes} onChange={handleChange} rows={2} />
                            {/* <textarea name="internalNotes" placeholder="Internal Notes" className="w-full px-3 py-2 rounded-md border border-gray-300" value={formData.internalNotes} onChange={handleChange} rows={2} /> */}
                        </div>

                        <div className="text-right pt-2">
                            <button type="submit" className="bg-amber-500 text-white font-semibold px-6 py-2 rounded-md shadow-md transition-all duration-300 border-2 border-amber-500 hover:bg-white hover:text-amber-600 hover:border-amber-600 hover:shadow-lg">
                                Submit
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

export default WidgetBooking;
