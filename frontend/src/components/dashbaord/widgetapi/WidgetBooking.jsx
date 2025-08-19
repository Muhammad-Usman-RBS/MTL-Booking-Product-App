import React, { useEffect, useState, useMemo } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useGetAllHourlyRatesQuery } from "../../../redux/api/hourlyPricingApi";
import { useCreateBookingMutation } from '../../../redux/api/bookingApi';
import { useLazySearchGooglePlacesQuery, useLazyGetDistanceQuery } from '../../../redux/api/googleApi';
import { useGetGeneralPricingPublicQuery } from '../../../redux/api/generalPricingApi';
import { useLazyGeocodeQuery } from '../../../redux/api/googleApi';
import 'react-toastify/dist/ReactToastify.css';
import ReturnForm from './widgetcomponents/ReturnForm';
import PrimaryForm from './widgetcomponents/PrimaryForm';

const WidgetBooking = ({ onSubmitSuccess, companyId: parentCompanyId, isReturnForm = false }) => {
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

    // Format hourly options
    const formattedHourlyOptions = useMemo(() => {
        return hourlyPackages.map(pkg => ({
            label: `${pkg.distance} miles ${pkg.hours} hours`,
            value: { distance: pkg.distance, hours: pkg.hours },
        }));
    }, [hourlyPackages]);

    useEffect(() => {
        if (isReturnForm) {
            const stored = localStorage.getItem("bookingForm");
            if (stored) {
                const prev = JSON.parse(stored);
                setFormData(prevData => ({
                    ...prevData,
                    pickup: prev.dropoff || "",
                }));
                setDropOffs([prev.pickup || ""]);
            }
        }
    }, [isReturnForm]);

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

    const [returnFormData, setReturnFormData] = useState({
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
        terminal: '',
    });

    const [createBooking] = useCreateBookingMutation();
    const [triggerSearchAutocomplete] = useLazySearchGooglePlacesQuery();
    const [triggerDistance] = useLazyGetDistanceQuery();

    const extractPostcode = (text) => {
        const match = text?.match(/\b[A-Z]{1,2}\d{1,2}[A-Z]?\b/i);
        return match ? match[0].toUpperCase() : null;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (isReturnForm) {
            setReturnFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
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

        if (isReturnForm) {
            // Return form validation
            if (!returnFormData.date || returnFormData.hour === '' || returnFormData.minute === '') {
                toast.error("Please fill in date, hour, and minute for the return journey.");
                return;
            }

            // Retrieve primary journey from localStorage
            const primaryData = JSON.parse(localStorage.getItem("bookingForm"));
            if (!primaryData) {
                toast.error("Primary journey data is missing.");
                return;
            }

            const returnPayload = {
                ...primaryData,
                // returnJourneyToggle: true,
                returnJourney: {
                    ...returnFormData, // Includes date, hour, minute properly
                    dropoff: dropOffs[0],
                    additionalDropoff1: dropOffs[1] || null,
                    additionalDropoff2: dropOffs[2] || null,
                },
            };

            try {
                const response = await createBooking(returnPayload).unwrap();
                toast.success("Return journey booked successfully!");
                onSubmitSuccess && onSubmitSuccess({
                    returnBooking: {
                        ...returnFormData,
                        pickup,
                        dropoff: dropOffs[0],
                        additionalDropoff1: dropOffs[1] || null,
                        additionalDropoff2: dropOffs[2] || null,
                        pickupDoorNumber: returnFormData.pickupDoorNumber || null,
                        dropoffDoorNumber: returnFormData.dropoffDoorNumber || null,
                        terminal: returnFormData.terminal || null,
                        arrivefrom: returnFormData.arrivefrom || null,
                        flightNumber: returnFormData.flightNumber || null,
                        pickmeAfter: returnFormData.pickmeAfter || null,
                        notes: returnFormData.notes || '',
                        date: returnFormData.date,
                        hour: returnFormData.hour,
                        minute: returnFormData.minute
                    }
                });
            } catch (error) {
                toast.error("Return journey booking failed.");
                console.error("Booking error:", error);
            }

            return;
        }

        // Primary journey logic
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
                                toast.info(`Upgraded to ${upgraded.distance} miles / ${upgraded.hours} hours.`);
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

        // Save to localStorage for return journey
        localStorage.setItem("bookingForm", JSON.stringify(payload));

        // Trigger success callback
        if (onSubmitSuccess) {
            onSubmitSuccess({
                ...payload,
                mode,
                dropOffPrice: totalPrice
            });
        }
    };

    return (
        <div className="max-w-xl w-full mx-auto mt-6 px-4 sm:px-0">
            <form
                onSubmit={handleSubmit}
                className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-[var(--light-gray)] rounded-2xl shadow-lg px-6 py-5 space-y-6 text-base text-gray-700 transition duration-300 hover:shadow-xl"
            >
                {isReturnForm ? (
                    <ReturnForm
                        formData={formData}
                        returnFormData={returnFormData}
                        handleChange={handleChange}
                        dropOffs={dropOffs}
                    />
                ) : (
                    <PrimaryForm
                    companyId={companyId}
                        formData={formData}
                        handleSubmit={handleSubmit}
                        handlePickupChange={handlePickupChange}
                        pickupSuggestions={pickupSuggestions}
                        handlePickupSelect={handlePickupSelect}
                        pickupType={pickupType}
                        setPickupType={setPickupType}
                        dropOffs={dropOffs}
                        setDropOffs={setDropOffs}
                        dropOffSuggestions={dropOffSuggestions}
                        setPickupSuggestions={setPickupSuggestions}
                        setDropOffSuggestions={setDropOffSuggestions}
                        activeDropIndex={activeDropIndex}
                        setActiveDropIndex={setActiveDropIndex}
                        setDropOffTypes={setDropOffTypes}
                        handleDropOffChange={handleDropOffChange}
                        handleDropOffSelect={handleDropOffSelect}
                        dropOffTypes={dropOffTypes}
                        removeDropOff={removeDropOff}
                        addDropOff={addDropOff}
                        handleChange={handleChange}
                        setMode={setMode}
                        mode={mode}
                        formattedHourlyOptions={formattedHourlyOptions}
                        selectedHourly={selectedHourly}
                        setSelectedHourly={setSelectedHourly}
                        setFormData={setFormData}
                    />
                )}
            </form>
        </div>
    );
};

export default WidgetBooking;
