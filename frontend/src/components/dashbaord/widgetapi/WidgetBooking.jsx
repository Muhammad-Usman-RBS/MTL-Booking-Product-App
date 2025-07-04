import React, { useEffect, useState, useMemo } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SelectOption from '../../../constants/constantscomponents/SelectOption';
import { useGetAllHourlyRatesQuery } from "../../../redux/api/hourlyPricingApi";
import { useLazySearchGooglePlacesQuery, useLazyGetDistanceQuery } from '../../../redux/api/googleApi';
import { useGetGeneralPricingPublicQuery } from '../../../redux/api/generalPricingApi';
import { useLazyGeocodeQuery } from '../../../redux/api/googleApi';

const WidgetBooking = ({ onSubmitSuccess, companyId: parentCompanyId, isReturnJourney = false,
    returnPickup = '',
    returnDropoff = '',
    onReturnPickupChange = () => { },
    onReturnDropoffChange = () => { } }) => {
    const companyId = parentCompanyId || new URLSearchParams(window.location.search).get('company') || '';
    const { data: hourlyPackages = [] } = useGetAllHourlyRatesQuery(companyId, { skip: !companyId });
    const { data: generalPricing } = useGetGeneralPricingPublicQuery(companyId, { skip: !companyId });

    const [mode, setMode] = useState('Transfer');
    const [dropOffs, setDropOffs] = useState(['']);
    const [pickupSuggestions, setPickupSuggestions] = useState([]);
    const [dropOffSuggestions, setDropOffSuggestions] = useState([]);
    const [activeDropIndex, setActiveDropIndex] = useState(null);
    const [pickupType, setPickupType] = useState(null);
    const [dropOffTypes, setDropOffTypes] = useState({});
    const [selectedHourly, setSelectedHourly] = useState('');
    const [minAdditionalDropOff, setminAdditionalDropOff] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [triggerGeocode] = useLazyGeocodeQuery();
    const [returnPickupType, setReturnPickupType] = useState('');
    const [returnDropoffType, setReturnDropoffType] = useState('');
    const [returnPickupSuggestions, setReturnPickupSuggestions] = useState([]);
    const [returnDropoffSuggestions, setReturnDropoffSuggestions] = useState([]);
    const [returnDropOffs, setReturnDropOffs] = useState([]);
    const [activeReturnDropIndex, setActiveReturnDropIndex] = useState(null);

    // Format hourly options
    const formattedHourlyOptions = useMemo(() => {
        return hourlyPackages.map(pkg => ({
            label: `${pkg.distance} miles ${pkg.hours} hours`,
            value: { distance: pkg.distance, hours: pkg.hours },
        }));
    }, [hourlyPackages]);

    useEffect(() => {
        if (formattedHourlyOptions.length) {
            setSelectedHourly(formattedHourlyOptions[0]);
            setFormData(prev => ({
                ...prev,
                hourlyOption: formattedHourlyOptions[0],
                originalHourlyOption: formattedHourlyOptions[0]
            }));
        }
    }, [formattedHourlyOptions]);

    // Fetch the pricing for additional drop-offs once the API response is available
    useEffect(() => {
        if (generalPricing && generalPricing.minAdditionalDropOff) {
            setminAdditionalDropOff(generalPricing.minAdditionalDropOff); // Set the additional drop-off price
        }
    }, [generalPricing]);

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
        hourlyOption: { value: { distance: 0, hours: 0 } },
        originalHourlyOption: { value: { distance: 0, hours: 0 } },
    });

    const [triggerSearchAutocomplete] = useLazySearchGooglePlacesQuery();
    const [triggerDistance] = useLazyGetDistanceQuery();

    const extractPostcode = (text) => {
        const match = text?.match(/\b[A-Z]{1,2}\d{1,2}[A-Z]?\b/i);
        return match ? match[0].toUpperCase() : null;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const fetchSuggestions = async (query, setter) => {
        if (!query) return setter([]);
        try {
            const res = await triggerSearchAutocomplete(query).unwrap();
            const results = res.predictions.map(r => ({
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
        setFormData(prev => ({ ...prev, pickup: val }));
        if (val.length >= 3) fetchSuggestions(val, setPickupSuggestions);
        else setPickupSuggestions([]);
    };

    const handlePickupSelect = (sug) => {
        const full = `${sug.name} - ${sug.formatted_address}`;
        setFormData(prev => ({ ...prev, pickup: full }));
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
        setDropOffTypes(prev => ({ ...prev, [idx]: sug.source }));
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

    // Calculate price for additional drop-offs
    const calculateminAdditionalDropOff = () => {
        const additionalDropoffsCount = dropOffs.length - 1; // excluding the first drop-off (which is free)
        return additionalDropoffsCount * minAdditionalDropOff; // Each additional drop-off costs the dynamic price
    };

    useEffect(() => {
        const additionalDropOffPrice = calculateminAdditionalDropOff();
        setTotalPrice(additionalDropOffPrice);
    }, [dropOffs, minAdditionalDropOff]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.pickup || dropOffs[0].trim() === '') {
            toast.error("Pickup and at least one Drop Off is required.");
            return;
        }

        const dynamicFields = {};
        dropOffs.forEach((_, idx) => {
            dynamicFields[`dropoffDoorNumber${idx}`] = formData[`dropoffDoorNumber${idx}`] || '';
            dynamicFields[`dropoff_terminal_${idx}`] = formData[`dropoff_terminal_${idx}`] || '';
        });

        const pickupPostcode = extractPostcode(formData.pickup);
        const dropoffPostcode = extractPostcode(dropOffs[0]);

        const payload = {
            ...formData,
            dropoff: dropOffs[0],
            direction: formData.direction || "One Way",
            additionalDropoff1: dropOffs[1] || null,
            additionalDropoff2: dropOffs[2] || null,
            mode,
            returnJourney: false,
            companyId,
            referrer: document.referrer,
            pickupPostcode,
            dropoffPostcode,
            totalPrice,
            ...dynamicFields,
        };

        try {
            const origin = formData.pickup?.replace('Custom Input - ', '').split(' - ').pop()?.trim();
            const destination = dropOffs[0]?.replace('Custom Input - ', '').split(' - ').pop()?.trim();

            if (!origin || !destination) {
                toast.error("Origin or destination is empty.");
                return;
            }

            const res = await triggerDistance({ origin, destination }).unwrap();

            if (res?.distanceText && res?.durationText) {
                payload.distanceText = res.distanceText;
                payload.durationText = res.durationText;

                //  Add coordinates
                const pickupCoord = await triggerGeocode(origin).unwrap();
                const dropoffCoord = await triggerGeocode(destination).unwrap();
                payload.pickupCoordinates = pickupCoord?.location ? [pickupCoord.location] : [];
                payload.dropoffCoordinates = dropoffCoord?.location ? [dropoffCoord.location] : [];

                if (mode === "Hourly") {
                    let miles = 0;

                    if (res.distanceText.includes("km")) {
                        const km = parseFloat(res.distanceText.replace("km", "").trim());
                        miles = parseFloat((km * 0.621371).toFixed(2));
                    } else if (res.distanceText.includes("mi")) {
                        miles = parseFloat(res.distanceText.replace("mi", "").trim());
                    }

                    const userSelected = formData?.hourlyOption?.value;

                    if (userSelected) {
                        if (miles > userSelected.distance) {
                            const upgraded = hourlyPackages.find(pkg => pkg.distance >= miles);
                            if (upgraded) {
                                toast.info(`Your selected hourly package was upgraded to ${upgraded.distance} miles / ${upgraded.hours} hours due to trip length.`);
                                payload.hourlyOption = {
                                    label: `${upgraded.distance} miles ${upgraded.hours} hours`,
                                    value: { distance: upgraded.distance, hours: upgraded.hours }
                                };
                            } else {
                                toast.warning("No hourly package covers this distance.");
                            }

                        } else {
                            payload.hourlyOption = formData.hourlyOption;
                        }
                    } else {
                        const autoMatch = hourlyPackages.find(pkg => pkg.distance >= miles);
                        if (autoMatch) {
                            payload.hourlyOption = {
                                label: `${autoMatch.distance} miles ${autoMatch.hours} hours`,
                                value: { distance: autoMatch.distance, hours: autoMatch.hours }
                            };
                        } else {
                            toast.warning("No hourly package found for this distance.");
                        }
                    }
                }
            }

        } catch (err) {
            console.error("Distance API error:", err);
        }

        localStorage.setItem("bookingForm", JSON.stringify(payload));
        if (onSubmitSuccess) {
            const returnPayload = isReturnJourney
                ? {
                    returnDate: formData.returnDate || '',
                    returnHour: formData.returnHour || '',
                    returnMinute: formData.returnMinute || '',
                    returnPickupDoorNumber: formData.returnPickupDoorNumber || '',
                    returnDropoffDoorNumber: formData.returnDropoffDoorNumber || '',
                    returnDropoffTerminal: formData.returnDropoffTerminal || '',
                    returnArriveFrom: formData.returnArriveFrom || '',
                    returnFlightNumber: formData.returnFlightNumber || '',
                    returnPickmeAfter: formData.returnPickmeAfter || '',
                    returnAdditionalDropoff1: returnDropOffs[0] || '',
                    returnAdditionalDropoff2: returnDropOffs[1] || '',
                }
                : {};

            onSubmitSuccess({
                ...payload,
                ...returnPayload,
                mode,
                dropOffPrice: totalPrice,
            });
        }
    };

    const handleReturnDropOffChange = (idx, val) => {
        const updated = [...returnDropOffs];
        updated[idx] = val;
        setReturnDropOffs(updated);
        setActiveReturnDropIndex(idx);
        if (val.length >= 3) fetchSuggestions(val, setReturnDropoffSuggestions);
        else setReturnDropoffSuggestions([]);
    };

    const handleReturnDropOffSelect = (idx, sug) => {
        const full = `${sug.name} - ${sug.formatted_address}`;
        const updated = [...returnDropOffs];
        updated[idx] = full;
        setReturnDropOffs(updated);
        setReturnDropoffSuggestions([]);
        setReturnDropoffTypes(prev => ({ ...prev, [idx]: sug.source }));
    };

    const addReturnDropOff = () => {
        if (returnDropOffs.length >= 3) return;
        setReturnDropOffs([...returnDropOffs, '']);
    };

    const removeReturnDropOff = (idx) => {
        const updated = returnDropOffs.filter((_, i) => i !== idx);
        setReturnDropOffs(updated);
        const updatedTypes = { ...returnDropoffTypes };
        delete updatedTypes[idx];
        setReturnDropoffTypes(updatedTypes);
    };

    return (
        <div className="max-w-xl w-full mx-auto mt-6 px-4 sm:px-0">
            <form
                onSubmit={handleSubmit}
                className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200 rounded-2xl shadow-md px-5 py-6 space-y-6 text-sm"
            >
                <ToastContainer />

                {!isReturnJourney && (
                    <>
                        <div className="flex justify-center mb-4">
                            {["Transfer", "Hourly"].map((tab) => (
                                <button
                                    key={tab}
                                    type='button'
                                    onClick={() => setMode(tab)}
                                    className={`px-6 py-2 font-medium transition-all cursor-pointer duration-200 ${mode === tab ? "bg-[#f3f4f6] text-dark border border-black" : "bg-[#f3f4f6] text-dark"} ${tab === "Transfer" ? "rounded-l-md" : "rounded-r-md"}`}
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
                                    <li
                                        onClick={() => {
                                            setFormData({ ...formData, pickup: formData.pickup });
                                            setPickupType("location");
                                            setPickupSuggestions([]);
                                        }}
                                        className="p-2 bg-blue-50 hover:bg-blue-100 cursor-pointer text-xs border-b"
                                    >
                                        ➕ Use: "{formData.pickup}"
                                    </li>
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

                        {/* Pickup Details */}
                        {pickupType === "location" && (
                            <input
                                name="pickupDoorNumber"
                                placeholder="Pickup Door No."
                                className="custom_input"
                                value={formData.pickupDoorNumber}
                                onChange={handleChange}
                            />
                        )}

                        {pickupType === "airport" && (
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
                                        <li
                                            onClick={() => {
                                                const updated = [...dropOffs];
                                                updated[idx] = dropOffs[idx];
                                                setDropOffs(updated);
                                                setDropOffTypes((prev) => ({ ...prev, [idx]: "location" }));
                                                setDropOffSuggestions([]);
                                            }}
                                            className="p-2 bg-blue-50 hover:bg-blue-100 cursor-pointer text-xs border-b"
                                        >
                                            ➕ Use: "{dropOffs[idx]}"
                                        </li>
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

                                {dropOffTypes[idx] === "airport" && (
                                    <input
                                        name={`dropoff_terminal_${idx}`}
                                        value={formData[`dropoff_terminal_${idx}`] || ""}
                                        placeholder="Terminal No."
                                        className="custom_input"
                                        onChange={handleChange}
                                    />
                                )}

                                {dropOffTypes[idx] === "location" && (
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
                                        className="btn btn-cancel"
                                    >
                                        &minus;
                                    </button>
                                )}
                            </div>
                        ))}

                        {dropOffs.length < 3 && (
                            <button
                                type="button"
                                onClick={addDropOff}
                                className="btn btn-edit text-xs px-4 py-2 w-full sm:w-auto"
                            >
                                + Add Drop Off
                            </button>
                        )}

                        {/* Date & Time */}
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

                        < textarea
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
                )}

                {isReturnJourney && (
                    <>
                        {/* Return Pickup Location */}
                        <div className="relative">
                            <label className="text-xs font-medium text-gray-600 mb-1 block">Return Pickup Location</label>
                            <input
                                type="text"
                                value={returnPickup}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    onReturnPickupChange(val);
                                    if (val.length >= 3) fetchSuggestions(val, setReturnPickupSuggestions);
                                    else setReturnPickupSuggestions([]);
                                }}
                                className="custom_input"
                                placeholder="Enter return pickup location"
                            />
                            {returnPickupSuggestions.length > 0 && (
                                <ul className="absolute z-20 bg-white border rounded shadow max-h-40 overflow-y-auto w-full mt-1">
                                    {returnPickupSuggestions.map((sug, idx) => (
                                        <li
                                            key={idx}
                                            onClick={() => {
                                                onReturnPickupChange(`${sug.name} - ${sug.formatted_address}`);
                                                setReturnPickupSuggestions([]);
                                                setReturnPickupType(sug.source);
                                            }}
                                            className="p-2 hover:bg-gray-100 cursor-pointer text-xs"
                                        >
                                            {sug.name} - {sug.formatted_address}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Return Pickup Details */}
                        {returnPickupType === "location" && (
                            <input
                                name="returnPickupDoorNumber"
                                placeholder="Return Pickup Door No."
                                className="custom_input"
                                value={formData.returnPickupDoorNumber || ""}
                                onChange={handleChange}
                            />
                        )}

                        {/* Return Drop Offs */}
                        {[returnDropoff, ...returnDropOffs].map((val, idx) => (
                            <div key={idx} className="relative space-y-2">
                                <label className="text-xs text-gray-600">Return Additional Drop Off {idx + 1}</label>
                                <input
                                    type="text"
                                    value={val}
                                    placeholder={`Return Drop Off ${idx + 1}`}
                                    onChange={(e) => {
                                        const newValue = e.target.value;
                                        if (idx === 0) {
                                            onReturnDropoffChange(newValue);
                                        } else {
                                            handleReturnDropOffChange(idx - 1, newValue);
                                        }
                                    }}
                                    className="custom_input"
                                />
                                {idx > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => removeReturnDropOff(idx - 1)}
                                        className="btn btn-cancel"
                                    >
                                        &minus;
                                    </button>
                                )}
                            </div>
                        ))}

                        {returnDropOffs.length < 2 && (
                            <button
                                type="button"
                                onClick={addReturnDropOff}
                                className="btn btn-edit text-xs px-4 py-2 w-full sm:w-auto"
                            >
                                + Add Return Drop Off
                            </button>
                        )}

                        {returnPickupType === "airport" && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <input
                                    name="returnArriveFrom"
                                    placeholder="Arriving From"
                                    value={formData.returnArriveFrom || ""}
                                    onChange={handleChange}
                                    className="custom_input"
                                />
                                <input
                                    name="returnPickmeAfter"
                                    placeholder="Pick Me After"
                                    value={formData.returnPickmeAfter || ""}
                                    onChange={handleChange}
                                    className="custom_input"
                                />
                                <input
                                    name="returnFlightNumber"
                                    placeholder="Flight No."
                                    value={formData.returnFlightNumber || ""}
                                    onChange={handleChange}
                                    className="custom_input"
                                />
                            </div>
                        )}

                        {/* Return Drop Off Details */}
                        {returnDropoffType === "airport" && (
                            <input
                                name="returnDropoffTerminal"
                                placeholder="Return Terminal No."
                                value={formData.returnDropoffTerminal || ""}
                                onChange={handleChange}
                                className="custom_input"
                            />
                        )}

                        {returnDropoffType === "location" && (
                            <input
                                name="returnDropoffDoorNumber"
                                placeholder="Return Drop Off Door No."
                                value={formData.returnDropoffDoorNumber || ""}
                                onChange={handleChange}
                                className="custom_input"
                            />
                        )}

                        {/* Return Date & Time */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <input
                                type="date"
                                name="returnDate"
                                value={formData.returnDate || ""}
                                onChange={handleChange}
                                className="custom_input"
                            />
                            <select
                                name="returnHour"
                                value={formData.returnHour || ""}
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
                                name="returnMinute"
                                value={formData.returnMinute || ""}
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
                    </>
                )}


            </form>
        </div>
    );
};

export default WidgetBooking;
