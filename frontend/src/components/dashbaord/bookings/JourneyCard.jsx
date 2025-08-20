import React, { useEffect, useState, useRef, useMemo } from "react";
import { toast } from "react-toastify";
import { useLazySearchGooglePlacesQuery, useLazyGeocodeQuery } from "../../../redux/api/googleApi";
import { normalizeCoverageRules, decideCoverage } from "../../../utils/coverageUtils";
import { useGetAllCoveragesQuery } from "../../../redux/api/coverageApi"
import { useSelector } from 'react-redux';

const JourneyCard = ({
  title,
  journeyData,
  setJourneyData,
  dropOffs,
  setDropOffs,
  fare,
  mode,
  primaryFare,
  selectedVehicle,
  matchedPostcodePrice,
  isCopyMode,
  pricingMode,
  isEditMode,
}) => {
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropOffSuggestions, setDropOffSuggestions] = useState([]);
  const [dropOffTypes, setDropOffTypes] = useState({});
  const [activeDropIndex, setActiveDropIndex] = useState(null);
  const [pickupType, setPickupType] = useState(null);
  const [currency, symbol] = useSelector((state) => [state.currency.currency, state.currency.symbol]);
  const [triggerSearchAutocomplete] = useLazySearchGooglePlacesQuery();
  const [triggerGetPlaceDetails] = useLazyGeocodeQuery();
  const [triggerGeocode] = useLazyGeocodeQuery();

  // Store selected coords (optional but helpful)
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState({});

  const inputRef = useRef(null);

  const companyId = useSelector(
    (s) => s?.auth?.user?.companyId || s?.auth?.user?.company?._id || s?.company?.id
  );
  const { data: coveragesResp } = useGetAllCoveragesQuery(companyId, {
    skip: !companyId,
  });

  const coverageRules = useMemo(
    () => normalizeCoverageRules(coveragesResp),
    [coveragesResp]
  );

  const checkCoverage = (text, scope, coords) => {
    const res = decideCoverage(text, scope, coverageRules, coords);
    if (!res.allowed) {
      toast.warning(`We currently don't serve this ${scope} area. (${res.reason})`);
      return false;
    }
    return true;
  };

  useEffect(() => {

    if (!isEditMode) return;
    // Auto-detect pickup type in edit mode
    if (journeyData.pickup && !pickupType) {
      const lowerPickup = journeyData.pickup.toLowerCase();
      if (lowerPickup.includes("airport")) {
        setPickupType("airport");
      } else {
        setPickupType("location");
      }
    }

    // Auto-detect drop-off types in edit mode
    dropOffs.forEach((val, idx) => {
      if (val && !dropOffTypes[idx]) {
        const lower = val.toLowerCase();
        setDropOffTypes((prev) => ({
          ...prev,
          [idx]: lower.includes("airport") ? "airport" : "location",
        }));
      }
    });
  }, [journeyData.pickup, dropOffs]);

  const fetchSuggestions = async (query, setter) => {
    if (!query) return setter([]);
    try {
      const res = await triggerSearchAutocomplete(query).unwrap();
      const results = res.predictions.map((r) => ({
        place_id: r.place_id, // KEEP THIS
        name: r.name || r.structured_formatting?.main_text,
        formatted_address: r.formatted_address || r.description,
        source: r.source || (r.types?.includes("airport") ? "airport" : "location"),
        location: r.location || null, // <<— ADD THIS (backend now sends geometry.location)
      }));
      setter(results);
    } catch (err) {
      console.error("Autocomplete error:", err);
    }
  };


  const handlePickupChange = (e) => {
    const val = e.target.value;
    setJourneyData({ ...journeyData, pickup: val });
    if (val.length >= 3) fetchSuggestions(val, setPickupSuggestions);
    else setPickupSuggestions([]);
  };

  // const handlePickupSelect = (sug) => {
  //   const full = `${sug.name} - ${sug.formatted_address}`;
  //   setJourneyData((prev) => ({ ...prev, pickup: full }));
  //   setPickupType(sug.source);
  //   setPickupSuggestions([]);
  // };
  const handlePickupSelect = async (sug) => {
    const full = `${sug.name} - ${sug.formatted_address}`;
    const coords = sug.location ? { lat: Number(sug.location.lat), lng: Number(sug.location.lng) } : null;

    if (!checkCoverage(full, "pickup", coords)) return;

    setJourneyData((prev) => ({ ...prev, pickup: full }));
    setPickupType(sug.source);
    setPickupCoords(coords); // save if found
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

  // const handleDropOffSelect = (idx, sug) => {
  //   const full = `${sug.name} - ${sug.formatted_address}`;
  //   const updated = [...dropOffs];
  //   updated[idx] = full;
  //   setDropOffs(updated);
  //   setDropOffSuggestions([]);
  //   setDropOffTypes((prev) => ({ ...prev, [idx]: sug.source }));
  // };

  const handleDropOffSelect = async (idx, sug) => {
    const full = `${sug.name} - ${sug.formatted_address}`;
    const coords = sug.location ? { lat: Number(sug.location.lat), lng: Number(sug.location.lng) } : null;

    if (!checkCoverage(full, "dropoff", coords)) return;

    const updated = [...dropOffs];
    updated[idx] = full;
    setDropOffs(updated);
    setDropOffTypes((prev) => ({ ...prev, [idx]: sug.source }));
    setDropoffCoords((prev) => ({ ...prev, [idx]: coords })); // save
    setDropOffSuggestions([]);
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
    const types = { ...dropOffTypes };
    delete types[index];
    setDropOffs(updated);
    setDropOffTypes(types);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJourneyData((prev) => ({ ...prev, [name]: value }));
  };


  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.showPicker?.(); // open date picker in modern browsers
      inputRef.current.focus();        // ensure focus for older support
    }
  };

  return (
    <>
      <div className="w-full flex justify-center">
        <div className="w-full max-w-4xl bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-between items-start sm:items-center gap-2 px-4 py-3 bg-[#101828] rounded-t-xl border-b border-gray-200">
            <h2 className="text-xl font-bold text-[#f5f5f5]">{title}:-</h2>
            <div className="text-left sm:text-right w-full sm:w-auto">
              <span className="inline-block px-4 py-1.5 text-base font-semibold text-white border border-white rounded-md bg-transparent">
                Fare: {symbol}{fare?.toFixed(2) || "0.00"} {/* Use the symbol from Redux */}
              </span>
              {/* <div className="text-sm text-white mt-1">
                                <span className="text-xs font-normal text-gray-300">
                                    ({selectedVehicle?.vehicleName || "N/A"})
                                </span>
                            </div> */}
              {pricingMode === "postcode" &&
                matchedPostcodePrice?.price &&
                selectedVehicle?.percentageRate > 0 && (
                  <p className="text-xs mt-1 text-gray-400">
                    Base: £{matchedPostcodePrice.price.toFixed(2)} +{" "}
                    {selectedVehicle.percentageRate}% = £{fare?.toFixed(2)}
                  </p>
                )}
            </div>
          </div>

          {/* Form Body */}
          <div className="px-4 sm:px-6 pb-6 pt-2">
            {/* Date + Time */}
            <div className="mb-4">
              <label className="block text-xs mt-4 font-medium text-[var(--dark-gray)] mb-1">
                Pick Up Date & Time
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <label onClick={handleClick} style={{ display: "block", width: "100%", cursor: "pointer" }}>
                  <input
                    type="date"
                    name="date"
                    ref={inputRef}
                    className="custom_input w-full"
                    value={journeyData.date?.slice(0, 10) || ""}
                    onChange={handleChange}
                    style={{ pointerEvents: "none" }}
                  />
                </label>
                <div className="flex gap-2 w-full sm:w-1/2">
                  <select
                    name="hour"
                    className="custom_input w-full"
                    value={
                      journeyData.hour === "" || journeyData.hour === undefined
                        ? ""
                        : journeyData.hour.toString().padStart(2, "0")
                    }
                    onChange={(e) =>
                      handleChange({
                        target: {
                          name: "hour",
                          value: e.target.value.padStart(2, "0"),
                        },
                      })
                    }
                  >
                    <option value="">HH</option>
                    {[...Array(24).keys()].map((h) => (
                      <option key={h} value={h.toString().padStart(2, "0")}>
                        {h.toString().padStart(2, "0")}
                      </option>
                    ))}
                  </select>

                  <select
                    name="minute"
                    className="custom_input w-full"
                    value={
                      journeyData.minute === "" || journeyData.minute === undefined
                        ? ""
                        : journeyData.minute.toString().padStart(2, "0")
                    }
                    onChange={(e) =>
                      handleChange({
                        target: {
                          name: "minute",
                          value: e.target.value.padStart(2, "0"),
                        },
                      })
                    }
                  >
                    <option value="">MM</option>
                    {[...Array(60).keys()].map((m) => (
                      <option key={m} value={m.toString().padStart(2, "0")}>
                        {m.toString().padStart(2, "0")}
                      </option>
                    ))}
                  </select>

                </div>
              </div>
            </div>

            {/* Pickup Location */}
            <div className="relative mb-4">
              {/* <input
                type="text"
                name="pickup"
                placeholder="Pickup Location"
                value={journeyData.pickup}
                onChange={handlePickupChange}
                className="custom_input w-full"
              /> */}
              <input
                type="text"
                name="pickup"
                placeholder="Pickup Location"
                value={journeyData.pickup}
                onChange={handlePickupChange}
                onBlur={() => journeyData.pickup && checkCoverage(journeyData.pickup, "pickup", pickupCoords)}
                className="custom_input w-full"
              />

              {pickupSuggestions.length > 0 && (
                <ul className="absolute z-20 bg-white border rounded shadow max-h-40 overflow-y-auto w-full">
                  {/* <li
                    onClick={() => {
                      setJourneyData({
                        ...journeyData,
                        pickup: journeyData.pickup,
                      });
                      setPickupType("location");
                      setPickupSuggestions([]);
                    }}
                    className="p-2 text-xs sm:text-sm bg-blue-50 hover:bg-blue-100 cursor-pointer border-b"
                  >
                    ➕ Use: "{journeyData.pickup}"
                  </li> */}
                  <li
                    onClick={async () => {
                      const val = (journeyData.pickup || "").trim();
                      if (!val) return;

                      // 1) Geocode typed text to get {lat,lng}
                      let coords = null;
                      try {
                        const g = await triggerGeocode(val).unwrap(); // from useLazyGeocodeQuery
                        if (g?.location && Number.isFinite(g.location.lat) && Number.isFinite(g.location.lng)) {
                          coords = { lat: Number(g.location.lat), lng: Number(g.location.lng) };
                        }
                      } catch (err) {
                        console.warn("Geocode failed, falling back to text-only coverage check", err);
                      }

                      // 2) Coverage check (uses polygon when coords exist)
                      if (!checkCoverage(val, "pickup", coords)) return;

                      // 3) Apply selection
                      setJourneyData((prev) => ({ ...prev, pickup: val }));
                      setPickupType("location");
                      setPickupCoords(coords);
                      setPickupSuggestions([]);
                    }}
                    className="p-2 text-xs sm:text-sm bg-blue-50 hover:bg-blue-100 cursor-pointer border-b"
                  >
                    ➕ Use: "{journeyData.pickup}"
                  </li>


                  {pickupSuggestions.map((sug, idx) => (
                    <li
                      key={idx}
                      onClick={() => handlePickupSelect(sug)}
                      className="p-2 text-xs sm:text-sm hover:bg-gray-100 cursor-pointer"
                    >
                      {sug.name} - {sug.formatted_address}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Pickup Door / Airport Details */}
            {pickupType?.toLowerCase()?.includes("location") && (
              <input
                name="pickupDoorNumber"
                placeholder="Pickup Door No."
                className="custom_input mb-4 w-full"
                value={journeyData.pickupDoorNumber || ""}
                onChange={handleChange}
              />
            )}
            {pickupType?.toLowerCase().includes("airport") && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <input
                  name="arrivefrom"
                  placeholder="Arriving From"
                  value={journeyData.arrivefrom || ""}
                  onChange={handleChange}
                  className="custom_input"
                />
                <input
                  name="pickmeAfter"
                  placeholder="Pick Me After"
                  value={journeyData.pickmeAfter || ""}
                  onChange={handleChange}
                  className="custom_input"
                />
                <input
                  name="flightNumber"
                  placeholder="Flight No."
                  value={journeyData.flightNumber || ""}
                  onChange={handleChange}
                  className="custom_input"
                />
              </div>
            )}

            {/* Dropoffs */}
            {dropOffs.map((val, idx) => (
              <div
                key={idx}
                className="relative flex flex-col sm:flex-row sm:items-center gap-2 mb-4"
              >
                {/* <input
                  type="text"
                  value={val}
                  placeholder={`Drop Off ${idx + 1}`}
                  onChange={(e) => handleDropOffChange(idx, e.target.value)}
                  className="custom_input w-full"
                /> */}
                <input
                  type="text"
                  value={val}
                  placeholder={`Drop Off ${idx + 1}`}
                  onChange={(e) => handleDropOffChange(idx, e.target.value)}
                  onBlur={() => {
                    const coords = dropoffCoords[idx] || null;
                    dropOffs[idx] && checkCoverage(dropOffs[idx], "dropoff", coords);
                  }}
                  className="custom_input w-full"
                />
                {/* Suggestions */}
                {dropOffSuggestions.length > 0 && activeDropIndex === idx && (
                  <ul className="absolute z-30 bg-white border rounded shadow max-h-40 overflow-y-auto w-full top-full left-0 mt-1">
                    {/* <li
                      onClick={() => {
                        const updated = [...dropOffs];
                        updated[idx] = dropOffs[idx];
                        setDropOffs(updated);
                        setDropOffTypes((prev) => ({
                          ...prev,
                          [idx]: "location",
                        }));
                        setDropOffSuggestions([]);
                      }}
                      className="p-2 bg-blue-50 hover:bg-blue-100 cursor-pointer border-b text-xs"
                    >
                      ➕ Use: "{dropOffs[idx]}"
                    </li> */}
                    <li
                      onClick={async () => {
                        const val = (dropOffs[idx] || "").trim();
                        if (!val) return;

                        // 1) Geocode typed text → lat/lng
                        let coords = null;
                        try {
                          const g = await triggerGeocode(val).unwrap(); // from useLazyGeocodeQuery
                          if (g?.location && Number.isFinite(g.location.lat) && Number.isFinite(g.location.lng)) {
                            coords = { lat: Number(g.location.lat), lng: Number(g.location.lng) };
                          }
                        } catch (err) {
                          console.warn("Dropoff geocode failed, fallback to text-only check", err);
                        }

                        // 2) Coverage check
                        if (!checkCoverage(val, "dropoff", coords)) return;

                        // 3) Update state
                        const updated = [...dropOffs];
                        updated[idx] = val;
                        setDropOffs(updated);

                        setDropOffTypes((prev) => ({ ...prev, [idx]: "location" }));

                        setDropoffCoords((prev) => ({
                          ...prev,
                          [idx]: coords,
                        }));

                        setDropOffSuggestions([]);
                      }}
                      className="p-2 bg-blue-50 hover:bg-blue-100 cursor-pointer border-b text-xs"
                    >
                      ➕ Use: "{dropOffs[idx]}"
                    </li>

                    {dropOffSuggestions.map((sug, i) => (
                      <li
                        key={i}
                        onClick={() => handleDropOffSelect(idx, sug)}
                        className="p-2 text-xs hover:bg-gray-100 cursor-pointer"
                      >
                        {sug.name} - {sug.formatted_address}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Extra Fields */}
                {dropOffTypes[idx]?.toLowerCase()?.includes("airport") && (
                  <input
                    name={`dropoff_terminal_${idx}`}
                    value={journeyData[`dropoff_terminal_${idx}`] || ""}
                    placeholder="Terminal No."
                    className="custom_input w-full"
                    onChange={handleChange}
                  />
                )}
                {dropOffTypes[idx]?.toLowerCase()?.includes("location") && (
                  <input
                    name={`dropoffDoorNumber${idx}`}
                    value={journeyData[`dropoffDoorNumber${idx}`] || ""}
                    placeholder="Drop Off Door No."
                    className="custom_input w-full"
                    onChange={handleChange}
                  />
                )}

                {/* Remove Button */}
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => removeDropOff(idx)}
                    className="btn btn-cancel text-sm px-3 py-1 w-fit sm:w-auto"
                  >
                    &minus;
                  </button>
                )}
              </div>
            ))}

            {/* Add Dropoff */}
            {dropOffs.length < 3 && (
              <button
                type="button"
                onClick={addDropOff}
                className="btn btn-edit w-full sm:w-auto text-sm px-4 py-2 mb-4"
              >
                + Add Drop Off
              </button>
            )}

            {/* Notes */}
            <textarea
              name="notes"
              placeholder="Notes"
              rows="2"
              className="custom_input mb-2 w-full"
              value={journeyData.notes}
              onChange={handleChange}
            />
            <textarea
              name="internalNotes"
              placeholder="Internal Notes"
              rows="2"
              className="custom_input w-full"
              value={journeyData.internalNotes}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default JourneyCard;
