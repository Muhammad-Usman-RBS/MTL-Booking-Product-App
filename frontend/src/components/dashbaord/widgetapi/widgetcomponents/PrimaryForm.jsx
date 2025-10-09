import React, { useEffect, useMemo, useState } from 'react'
import SelectOption from '../../../../constants/constantscomponents/SelectOption';
import { useGetBookingSettingQuery } from "../../../../redux/api/bookingSettingsApi";
import { toast } from 'react-toastify';
import { normalizeCoverageRules, decideCoverage } from "../../../../utils/coverageUtils";
import { useGetAllCoveragesQuery } from "../../../../redux/api/coverageApi"
import { useLazyGeocodeQuery, useLazySearchGooglePlacesQuery } from '../../../../redux/api/googleApi';
import { useGetAllBookingRestrictionsQuery } from "../../../../redux/api/bookingRestrictionDateApi";
import { useBookingRestrictionWatcher } from "../../../../utils/bookingRestrictionUtils";
import Icons from '../../../../assets/icons';

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


      <div className="grid grid-cols-4 gap-3">
        {/* Date (Bada Column) */}
        <div className="flex flex-col col-span-2">
          <label className="block text-xs mt-1 text-[var(--dark-gray)]">
            Pick Up Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChangeWithValidation}
            className="custom_input"
          />
        </div>

        {/* Hour */}
        <div className="flex flex-col col-span-1">
          <label className="block text-xs mt-1 text-[var(--dark-gray)]">
            Hour
          </label>
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
        </div>

        {/* Minute */}
        <div className="flex flex-col col-span-1">
          <label className="block text-xs mt-1 text-[var(--dark-gray)]">
            Minute
          </label>
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
      </div>

      <div className="relative mb-6">
        <div className="relative">
          <input
            type="text"
            name="pickup"
            placeholder="Enter pickup location"
            value={formData.pickup}
            onChange={handlePickupChange}
            onBlur={() => formData.pickup && checkCoverage(formData.pickup, "pickup", pickupCoords)}
            className="custom_input"
          />
        </div>

        {pickupSuggestions.length > 0 && (
          <ul className="absolute z-20 bg-white border-2 border-gray-200 rounded-lg shadow-lg mt-2 max-h-60 overflow-y-auto w-full animate-fadeIn">
            <li
              onClick={async () => {
                const val = (formData.pickup || "").trim();
                if (!val) return;

                let coords = null;
                try {
                  const g = await triggerGeocode(val).unwrap();
                  if (g?.location && Number.isFinite(g.location.lat) && Number.isFinite(g.location.lng)) {
                    coords = { lat: Number(g.location.lat), lng: Number(g.location.lng) };
                  }
                } catch (err) {
                  console.warn("Geocode failed, falling back to text-only coverage check", err);
                }

                if (!checkCoverage(val, "pickup", coords)) return;

                setFormData((prev) => ({ ...prev, pickup: val }));
                setPickupType("location");
                setPickupCoords(coords);
                setPickupSuggestions([]);
              }}
              className="p-3 text-sm bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 cursor-pointer border-b border-gray-200 transition-all duration-200 flex items-center gap-2"
            >
              <span className="text-blue-600">➕</span>
              <span className="font-medium">Use: "{formData.pickup}"</span>
            </li>

            {pickupSuggestions.map((sug, idx) => (
              <li
                key={idx}
                onClick={() => handlePickupSelect(sug)}
                className="p-3 text-sm hover:bg-gray-50 cursor-pointer transition-all duration-150 border-b border-gray-100 last:border-0"
              >
                <div className="font-medium text-gray-800">{sug.name}</div>
                <div className="text-xs text-gray-500 mt-1">{sug.formatted_address}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pickup Door Number */}
      {pickupType === "location" && !formData.pickup?.toLowerCase().includes("airport") && (
        <div className="mb-6 animate-slideDown">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Door Number / Building Details
          </label>
          <input
            name="pickupDoorNumber"
            placeholder="e.g., Building A, Floor 3, Apt 205"
            className="custom_input"
            value={formData.pickupDoorNumber}
            onChange={handleChange}
          />
        </div>
      )}

      {/* Airport Details */}
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
            className="custom_input"
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
            className="custom_input"
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
            className="custom_input"
            />
          </div>
        </div>
      )}

      {/* Drop-off Locations */}
      <div className="space-y-3">
        {dropOffs.map((val, idx) => (
          <div
            key={idx}
            className="relative flex items-center gap-2 animate-slideDown"
          >
            <div className="flex-1 relative">
              <input
                type="text"
                value={val}
                placeholder={idx === dropOffs.length - 1 ? "Drop-off Location" : `Via Stop ${idx + 1}`}
                onChange={(e) => handleDropOffChange(idx, e.target.value)}
                onBlur={() => {
                  const coords = dropoffCoords[idx] || null;
                  dropOffs[idx] && checkCoverage(dropOffs[idx], "dropoff", coords);
                }}
                className="custom_input"
              />
            </div>

            {/* Add / Remove Button */}
            {idx === dropOffs.length - 1 && dropOffs.length < 5 ? (
              <button
                type="button"
                onClick={addDropOff}
                className="btn btn-edit"
              >
                + Add Dropdoff
              </button>
            ) : (
              <button
                type="button"
                onClick={() => removeDropOff(idx)}
              >
                <div className="icon-box icon-box-danger">
                  <Icons.Minus size={17} />
                </div>
              </button>
            )}
          </div>
        ))}
      </div>


      <label className="block text-xs p-0 m-0 text-[var(--dark-gray)]">
        Special Notes
      </label>
      <textarea
        name="notes"
        placeholder="Special Notes"
        className="custom_input mt-1"
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
