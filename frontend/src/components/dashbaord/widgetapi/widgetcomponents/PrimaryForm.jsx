import React, { useEffect, useMemo, useState } from 'react'
import SelectOption from '../../../../constants/constantscomponents/SelectOption';
import { useGetBookingSettingQuery } from "../../../../redux/api/bookingSettingsApi";
import { toast } from 'react-toastify';
import { normalizeCoverageRules, decideCoverage } from "../../../../utils/coverageUtils";
import { useGetAllCoveragesQuery } from "../../../../redux/api/coverageApi"
import { useLazyGeocodeQuery, useLazySearchGooglePlacesQuery } from '../../../../redux/api/googleApi';
import { useGetAllBookingRestrictionsQuery } from "../../../../redux/api/bookingRestrictionDateApi";
import { useBookingRestrictionWatcher } from "../../../../utils/bookingRestrictionUtils";

const PrimaryForm = ({
  formData,
  pickupSuggestions = [],
  pickupType,
  setPickupType,
  dropOffs = [],
  setDropOffs,
  setPickupSuggestions,
  setDropOffTypes,
  setDropOffSuggestions,
  dropOffSuggestions = [],
  activeDropIndex,
  setActiveDropIndex,
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
  companyId
}) => {
  // booking settings
  const { data: bookingSettingData, isFetching: isSettingLoading } =
    useGetBookingSettingQuery();
  const [pickupCoords, setPickupCoords] = useState(null);
  const [triggerSearchAutocomplete] = useLazySearchGooglePlacesQuery();
  const [triggerGeocode] = useLazyGeocodeQuery();

  const [dropoffCoords, setDropoffCoords] = useState({});
  const { data: coveragesResp } = useGetAllCoveragesQuery(companyId, {
    skip: !companyId,
  });

  // Booking Restriction
  const { data: restrictionsResp } = useGetAllBookingRestrictionsQuery(companyId, {
    skip: !companyId,
  });

  const restrictions = useMemo(
    () => (restrictionsResp?.data ?? restrictionsResp ?? []),
    [restrictionsResp]
  );

  useBookingRestrictionWatcher(formData, restrictions, (hit, labels) => {
    const title = hit.caption || "Booking Restriction";
    toast.info(`${title}: ${labels.from} → ${labels.to}. Bookings are restricted in this window.`);
  });

  // hourly Enabled method
  const hourlyEnabled = !!(
    bookingSettingData?.setting?.hourlyPackage ??
    bookingSettingData?.setting?.hourLyPackage
  );

  // Advance booking validation function
  const validateAdvanceBooking = (selectedDate, selectedHour, selectedMinute) => {
    if (!bookingSettingData?.setting?.advanceBookingMin) return true;

    const { value, unit } = bookingSettingData.setting.advanceBookingMin;

    if (!selectedDate || selectedHour === '' || selectedMinute === '') return true;

    // Current time
    const now = new Date();

    // Selected booking time
    const bookingDateTime = new Date(`${selectedDate}T${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}:00`);

    // Calculate minimum advance time in milliseconds
    let advanceTimeMs = 0;
    switch (unit.toLowerCase()) {
      case 'hours':
      case 'hour':
        advanceTimeMs = value * 60 * 60 * 1000;
        break;
      case 'minutes':
      case 'minute':
        advanceTimeMs = value * 60 * 1000;
        break;
      case 'days':
      case 'day':
        advanceTimeMs = value * 24 * 60 * 60 * 1000;
        break;
      default:
        console.warn('Unknown time unit:', unit);
        return true;
    }

    // Minimum allowed booking time
    const minBookingTime = new Date(now.getTime() + advanceTimeMs);

    if (bookingDateTime < minBookingTime) {
      const timeText = value === 1 ? unit.slice(0, -1) : unit; // Remove 's' if value is 1
      toast.error(`Booking must be made at least ${value} ${timeText} in advance!`);
      return false;
    }

    return true;
  };

  // Enhanced handleChange with validation
  const handleChangeWithValidation = (e) => {
    const { name, value } = e.target;

    // Update form data first
    handleChange(e);

    // If date/time field changed, validate advance booking
    if (name === 'date' || name === 'hour' || name === 'minute') {
      setTimeout(() => {
        const updatedFormData = { ...formData, [name]: value };
        validateAdvanceBooking(
          updatedFormData.date,
          updatedFormData.hour,
          updatedFormData.minute
        );
      }, 0);
    }
  };

  // hourly disabled -> agar user Hourly par ho to Transfer par switch + hourly selection clear
  useEffect(() => {
    if (!hourlyEnabled && mode === "Hourly") {
      setMode("Transfer");
      setSelectedHourly?.(null);
    }
  }, [hourlyEnabled, mode, setMode, setSelectedHourly]);

  const handlePickupChange = (e) => {
    const val = e.target.value;
    setFormData({ ...formData, pickup: val });
    if (val.length >= 3) fetchSuggestions(val, setPickupSuggestions);
    else setPickupSuggestions([]);
  };
  // tabs list settings ke mutabiq
  const TABS = hourlyEnabled ? ["Transfer", "Hourly"] : ["Transfer"];

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

  const handlePickupSelect = async (sug) => {
    const full = `${sug.name} - ${sug.formatted_address}`;
    const coords = sug.location ? { lat: Number(sug.location.lat), lng: Number(sug.location.lng) } : null;

    if (!checkCoverage(full, "pickup", coords)) return;
    setFormData((prev) => ({ ...prev, pickup: full }));

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

  return (
    <>


      <div className="flex justify-center mb-4">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMode(tab)}
            className={`px-6 py-2 font-semibold text-sm border cursor-pointer 
              ${mode === tab
                ? "bg-white text-[var(--main-color)] border-2 border-[var(--main-color)]"
                : "bg-[#f9fafb] text-gray-700 border-[var(--light-gray)]"}
              ${tab === "Transfer" ? "rounded-l-md" : "rounded-r-md"}`}
            disabled={tab === "Hourly" && (isSettingLoading || !hourlyEnabled)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Hourly dropdown only if enabled */}
      {mode === "Hourly" && hourlyEnabled && (
        <div className="flex justify-center">
          <SelectOption
            options={formattedHourlyOptions.map((opt) => ({
              label: opt.label,
              value: JSON.stringify(opt.value),
            }))}
            value={selectedHourly ? JSON.stringify(selectedHourly.value) : ""}
            onChange={(e) => {
              const selected = formattedHourlyOptions.find(
                (opt) => JSON.stringify(opt.value) === e.target.value
              );
              setSelectedHourly(selected || null);
              setFormData((prev) => ({
                ...prev,
                hourlyOption: selected || null,
                originalHourlyOption: selected || null,
              }));
            }}
          />
        </div>
      )}

      {/* Pickup Location */}
      <div className="relative mb-4">
        {/* <input
                type="text"
                name="pickup"
                placeholder="Pickup Location"
                value={formData.pickup}
                onChange={handlePickupChange}
                className="custom_input w-full"
              /> */}
        <input
          type="text"
          name="pickup"
          placeholder="Pickup Location"
          value={formData.pickup}
          onChange={handlePickupChange}
          onBlur={() => formData.pickup && checkCoverage(formData.pickup, "pickup", pickupCoords)}
          className="custom_input w-full"
        />

        {pickupSuggestions.length > 0 && (
          <ul className="absolute z-20 bg-white border rounded shadow max-h-40 overflow-y-auto w-full">
            {/* <li
                    onClick={() => {
                      setformData({
                        ...formData,
                        pickup: formData.pickup,
                      });
                      setPickupType("location");
                      setPickupSuggestions([]);
                    }}
                    className="p-2 text-xs sm:text-sm bg-blue-50 hover:bg-blue-100 cursor-pointer border-b"
                  >
                    ➕ Use: "{formData.pickup}"
                  </li> */}
            <li
              onClick={async () => {
                const val = (formData.pickup || "").trim();
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
                setFormData((prev) => ({ ...prev, pickup: val }));
                setPickupType("location");
                setPickupCoords(coords);
                setPickupSuggestions([]);
              }}
              className="p-2 text-xs sm:text-sm bg-blue-50 hover:bg-blue-100 cursor-pointer border-b"
            >
              ➕ Use: "{formData.pickup}"
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

      {pickupType === "location" && !formData.pickup?.toLowerCase().includes("airport") && (
        <div className="mb-6 animate-slideDown">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Door Number / Building Details
          </label>
          <input
            name="pickupDoorNumber"
            placeholder="e.g., Building A, Floor 3, Apt 205"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
            value={formData.pickupDoorNumber}
            onChange={handleChange}
          />
        </div>
      )}

      {(pickupType === "airport" || formData.pickup?.toLowerCase().includes("airport")) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 animate-slideDown">
          {/* Arriving From */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Arriving From
            </label>
            <input
              name="arrivefrom"
              placeholder="City/Country"
              value={formData.arrivefrom}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
            />
          </div>

          {/* Pick Me After */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Pick Me After
            </label>
            <input
              name="pickmeAfter"
              placeholder="Time (e.g., 2:30 PM)"
              value={formData.pickmeAfter}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
            />
          </div>

          {/* Flight Number */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Flight Number
            </label>
            <input
              name="flightNumber"
              placeholder="e.g., AA123"
              value={formData.flightNumber}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
            />
          </div>
        </div>
      )}

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
              value={formData[`dropoff_terminal_${idx}`] || ""}
              placeholder="Terminal No."
              className="custom_input w-full"
              onChange={handleChange}
            />
          )}
          {dropOffTypes[idx]?.toLowerCase()?.includes("location") && (
            <input
              name={`dropoffDoorNumber${idx}`}
              value={formData[`dropoffDoorNumber${idx}`] || ""}
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
          onChange={handleChangeWithValidation}
          className="custom_input"
        />
        <select
          name="hour"
          value={formData.hour}
          onChange={handleChangeWithValidation}
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
          onChange={handleChangeWithValidation}
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
