import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import {
  useGetBookingSettingQuery,
  useUpdateBookingSettingMutation,
} from "../../../redux/api/bookingSettingsApi";
import { setCurrency } from "../../../redux/slices/currencySlice";
import { setTimezone } from "../../../redux/slices/timezoneSlice";
import { toast } from "react-toastify";
import countries from "../../../constants/constantscomponents/countries";
import timezoneOptions from "../../../constants/constantscomponents/timezones";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import currencyOptions from "../../../constants/constantscomponents/currencyOptions";
import { useLoading } from "../../common/LoadingProvider";

const YES_NO = ["Yes", "No"];
const DISTANCE_UNITS = ["Miles", "KMs"];
const CURRENCY_APPLICATION = ["All Bookings", "New Bookings Only"];

const TIME_UNITS_MIN = ["Hours"];
const TIME_UNITS_CANCEL = ["Hours", "Days"];

const BookingSettings = () => {
  const {showLoading, hideLoading}= useLoading()
  const dispatch = useDispatch();
  const { data, isLoading } = useGetBookingSettingQuery();
  const [updateBookingSetting] = useUpdateBookingSettingMutation();

  // state
  const [country, setCountry] = useState("United Kingdom");
  const [timezone, setTimezoneState] = useState("Europe/London");
  const [currency, setCurrencyState] = useState("GBP");
  const [currencyApplication, setCurrencyApplication] = useState("New Bookings Only");

  const [googleApiKeys, setGoogleApiKeys] = useState({
    browser: "",
    server: "",
    android: "",
    ios: "",
  });

  const [avoidRoutes, setAvoidRoutes] = useState({
    highways: false,
    tolls: false,
    ferries: false,
  });

  const [distanceUnit, setDistanceUnit] = useState("Miles");
  const [hourlyPackage, setHourlyPackage] = useState("No");

  const [advanceBookingMin, setAdvanceBookingMin] = useState({
    value: 12,
    unit: "Hours",
  });
  const [cancelBookingWindow, setCancelBookingWindow] = useState({
    value: 6,
    unit: "Hours",
  });

  const [cancelBookingTerms, setCancelBookingTerms] = useState("");

   useEffect(()=> {
        if(isLoading) {
          showLoading()
        } else {
          hideLoading()
        }
      },[isLoading])

  // hydrate from API
  useEffect(() => {
    const setting = data?.setting;
    if (!setting) return;

    if (setting.operatingCountry) setCountry(setting.operatingCountry);
    if (setting.timezone) {
      setTimezoneState(setting.timezone);
      dispatch(setTimezone(setting.timezone));
    }

    if (Array.isArray(setting.currency) && setting.currency[0]?.value) {
      setCurrencyState(setting.currency[0].value);
      dispatch(setCurrency(setting.currency[0].value));
    }

    if (setting.currencyApplication) {
      setCurrencyApplication(setting.currencyApplication);
    }

    setGoogleApiKeys({
      browser: setting.googleApiKeys?.browser || "",
      server: setting.googleApiKeys?.server || "",
      android: setting.googleApiKeys?.android || "",
      ios: setting.googleApiKeys?.ios || "",
    });

    setAvoidRoutes({
      highways: !!setting.avoidRoutes?.highways,
      tolls: !!setting.avoidRoutes?.tolls,
      ferries: !!setting.avoidRoutes?.ferries,
    });

    if (setting.distanceUnit) setDistanceUnit(setting.distanceUnit);
    setHourlyPackage(setting.hourlyPackage ? "Yes" : "No");

    if (setting.advanceBookingMin) setAdvanceBookingMin(setting.advanceBookingMin);
    if (setting.cancelBookingWindow) setCancelBookingWindow(setting.cancelBookingWindow);

    setCancelBookingTerms(setting.cancelBookingTerms || "");
  }, [data, dispatch]);

  const handleUpdate = async () => {
    try {
      const selectedCurrency =
        currencyOptions.find((opt) => opt.value === currency) || {
          label: "British Pound",
          value: "GBP",
          symbol: "£",
        };

      const payload = {
        operatingCountry: country || "United Kingdom",
        timezone: timezone || "Europe/London",
        currency: [
          {
            label: selectedCurrency.label,
            value: selectedCurrency.value,
            symbol: selectedCurrency.symbol,
          },
        ],
        currencyApplication: currencyApplication || "New Bookings Only",

        googleApiKeys,
        avoidRoutes,
        distanceUnit,
        hourlyPackage: hourlyPackage === "Yes",

        advanceBookingMin: {
          value: Number(advanceBookingMin.value ?? 12),
          unit: TIME_UNITS_MIN.includes(advanceBookingMin.unit)
            ? advanceBookingMin.unit
            : "Hours",
        },
        cancelBookingWindow: {
          value: Number(cancelBookingWindow.value ?? 6),
          unit: TIME_UNITS_CANCEL.includes(cancelBookingWindow.unit)
            ? cancelBookingWindow.unit
            : "Hours",
        },

        cancelBookingTerms,
      };

      await updateBookingSetting(payload).unwrap();
      dispatch(setTimezone(timezone));
      dispatch(setCurrency(currency));
      toast.success("Settings updated successfully!");
    } catch (err) {
      console.error("Update failed", err);
      toast.error("Failed to update settings");
    }
  };

  const handleCurrencyChange = (e) => setCurrencyState(e.target.value);
  const handleTimezoneChange = (e) => setTimezoneState(e.target.value);

  return (
    <div>
      <OutletHeading name="Booking Settings" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Operating Country */}
        <SelectOption
          label="Operating Country"
          options={countries}
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />

        {/* Timezone */}
        <SelectOption
          label="Timezone"
          options={timezoneOptions}
          value={timezone}
          onChange={handleTimezoneChange}
        />

        {/* Currency */}
        <SelectOption
          label="Currency"
          options={currencyOptions}
          value={currency}
          onChange={handleCurrencyChange}
        />

        {/* Currency Application */}
        <SelectOption
          label="Apply Currency To"
          options={CURRENCY_APPLICATION}
          value={currencyApplication}
          onChange={(e) => setCurrencyApplication(e.target.value)}
        />

        {/* Google API Keys */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Google Maps API key (Browser)
          </label>
          <input
            type="text"
            className="w-full border border-[var(--light-gray)] rounded px-3 py-1"
            value={googleApiKeys.browser}
            onChange={(e) =>
              setGoogleApiKeys((p) => ({ ...p, browser: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Google Maps API key (Server)
          </label>
          <input
            type="text"
            className="w-full border border-[var(--light-gray)] rounded px-3 py-1"
            value={googleApiKeys.server}
            onChange={(e) =>
              setGoogleApiKeys((p) => ({ ...p, server: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Google Maps API key (Android)
          </label>
          <input
            type="text"
            className="w-full border border-[var(--light-gray)] rounded px-3 py-1"
            value={googleApiKeys.android}
            onChange={(e) =>
              setGoogleApiKeys((p) => ({ ...p, android: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Google Maps API key (iOS)
          </label>
          <input
            type="text"
            className="w-full border border-[var(--light-gray)] rounded px-3 py-1"
            value={googleApiKeys.ios}
            onChange={(e) =>
              setGoogleApiKeys((p) => ({ ...p, ios: e.target.value }))
            }
          />
        </div>

        {/* Distance Unit */}
        <SelectOption
          label="Distance Unit"
          options={DISTANCE_UNITS}
          value={distanceUnit}
          onChange={(e) => setDistanceUnit(e.target.value)}
        />

        {/* Hourly Package */}
        <SelectOption
          label="Hourly Package"
          options={YES_NO}
          value={hourlyPackage}
          onChange={(e) => setHourlyPackage(e.target.value)}
        />

        {/* Advance booking minimum */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Advance booking minimum
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              className="w-full border border-[var(--light-gray)] rounded px-3 py-1"
              value={advanceBookingMin.value}
              onChange={(e) =>
                setAdvanceBookingMin((p) => ({ ...p, value: e.target.value }))
              }
            />
            <SelectOption
              options={TIME_UNITS_MIN}
              value={advanceBookingMin.unit}
              onChange={(e) =>
                setAdvanceBookingMin((p) => ({ ...p, unit: e.target.value }))
              }
            />
          </div>
        </div>

        {/* Cancel booking window */}
        <div>
          <label className="block text-sm font-medium mb-1">Cancel booking</label>
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              className="w-full border border-[var(--light-gray)] rounded px-3 py-1"
              value={cancelBookingWindow.value}
              onChange={(e) =>
                setCancelBookingWindow((p) => ({ ...p, value: e.target.value }))
              }
            />
            <SelectOption
              options={TIME_UNITS_CANCEL}
              value={cancelBookingWindow.unit}
              onChange={(e) =>
                setCancelBookingWindow((p) => ({ ...p, unit: e.target.value }))
              }
            />
          </div>
        </div>

        {/* Avoid Routes */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Avoid routes</label>
          <div className="space-x-4 mt-1">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={avoidRoutes.highways}
                onChange={(e) =>
                  setAvoidRoutes((p) => ({ ...p, highways: e.target.checked }))
                }
              />
              Highways
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={avoidRoutes.tolls}
                onChange={(e) =>
                  setAvoidRoutes((p) => ({ ...p, tolls: e.target.checked }))
                }
              />
              Tolls
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={avoidRoutes.ferries}
                onChange={(e) =>
                  setAvoidRoutes((p) => ({ ...p, ferries: e.target.checked }))
                }
              />
              Ferries
            </label>
          </div>
        </div>

        {/* Save */}
        <div className="md:col-span-3">
          <button
            className="btn btn-edit mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={handleUpdate}
          >
            Update Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSettings;