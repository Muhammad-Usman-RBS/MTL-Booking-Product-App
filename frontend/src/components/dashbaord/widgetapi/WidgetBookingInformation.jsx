import React, { useEffect, useState } from 'react';
import Icons from '../../../assets/icons';
import CarCardSection from './CarCardSection';
import { useGetPublicVehiclesQuery } from '../../../redux/api/vehicleApi';
import { useLazyGetDistanceQuery } from '../../../redux/api/googleApi';
import { toast, ToastContainer } from 'react-toastify';
import { useGetAllHourlyRatesQuery } from "../../../redux/api/hourlyPricingApi";
import { useFetchAllPostcodePricesWidgetQuery } from "../../../redux/api/postcodePriceApi";
import { useGetExtrasForWidgetQuery } from '../../../redux/api/fixedPriceApi';
import { useLazyGeocodeQuery } from '../../../redux/api/googleApi';
import { useGetGeneralPricingPublicQuery } from '../../../redux/api/generalPricingApi';

const WidgetBookingInformation = ({
  companyId: propCompanyId,
  onNext,
  totalPrice,
  dropOffPrice,
  postcodePrice,
  meetAndGreet = '10.50',
  estimatedTax = '15.00'
}) => {
  const companyId = propCompanyId || new URLSearchParams(window.location.search).get('company') || '';
  const [actualMiles, setActualMiles] = useState(null);
  const [selectedCarId, setSelectedCarId] = useState(null);
  const [formData, setFormData] = useState(null);
  const [distanceText, setDistanceText] = useState(null);
  const [durationText, setDurationText] = useState(null);
  const [baseRate, setBaseRate] = useState('0.00');
  const [matchedHourlyRate, setMatchedHourlyRate] = useState('');
  const [matchedZonePrice, setMatchedZonePrice] = useState(null);
  const [hourlyError, setHourlyError] = useState('');
  const [triggerGeocode] = useLazyGeocodeQuery();

  const [triggerDistance] = useLazyGetDistanceQuery();
  const { data: carList = [], isLoading, error } = useGetPublicVehiclesQuery(companyId, { skip: !companyId });
  const { data: hourlyRates = [] } = useGetAllHourlyRatesQuery(companyId, { skip: !companyId });

  // ✅ Fetch Postcode Prices
  const { data: postcodePrices = [] } = useFetchAllPostcodePricesWidgetQuery(companyId, { skip: !companyId });
  const { data: extras = [] } = useGetExtrasForWidgetQuery(companyId, { skip: !companyId });
  const zones = extras.filter(item => item.zone);

  const { data: generalPricing } = useGetGeneralPricingPublicQuery(companyId, { skip: !companyId });

  const isPickupAirport = formData?.pickup?.toLowerCase()?.includes('airport');
  const isDropoffAirport = formData?.dropoff?.toLowerCase()?.includes('airport');

  const pickupAirportPrice = isPickupAirport ? (generalPricing?.pickupAirportPrice || 0) : 0;
  const dropoffAirportPrice = isDropoffAirport ? (generalPricing?.dropoffAirportPrice || 0) : 0;

  const extractPostcode = (address) => {
    const match = address?.match(/\b[A-Z]{1,2}\d{1,2}[A-Z]?\b/i);
    return match ? match[0].toUpperCase() : null;
  };

  const [pickupPostcode, setPickupPostcode] = useState(null);
  const [dropoffPostcode, setDropoffPostcode] = useState(null);
  const [matchedPostcodePrice, setMatchedPostcodePrice] = useState(null);

  useEffect(() => {
    if (zones.length > 0 && formData?.pickup && formData?.dropoff) {
      const normalize = (str) => str?.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(' ').filter(Boolean);

      const pickupWords = normalize(formData.pickup);
      const dropoffWords = normalize(formData.dropoff);

      const pickupMatch = zones.find(z => pickupWords.includes(z.zone.toLowerCase()));
      const dropoffMatch = zones.find(z => dropoffWords.includes(z.zone.toLowerCase()));

      const matched = pickupMatch || dropoffMatch;

      if (matched) {
        setMatchedZonePrice(matched.price);
      } else {
        setMatchedZonePrice(null);
      }
    }
  }, [zones, formData]);

  useEffect(() => {
    if (
      formData?.mode === "Hourly" &&
      hourlyRates.length > 0 &&
      actualMiles !== null &&
      formData?.originalHourlyOption?.value
    ) {
      const selected = formData.originalHourlyOption.value;
      const match = hourlyRates.find(pkg =>
        Number(pkg.distance) === Number(selected.distance) &&
        Number(pkg.hours) === Number(selected.hours)
      );

      const warningMsg = `⚠️ Your trip is ${actualMiles} miles which exceeds the selected hourly package of ${selected.distance} miles. Additional charges will apply.`;

      if (match) {
        setMatchedHourlyRate(match.vehicleRates || {});

        if (actualMiles > selected.distance) {
          setHourlyError(warningMsg);
        } else {
          setHourlyError('');
        }
      } else {
        setMatchedHourlyRate(null);
        setHourlyError("Selected hourly package not available.");
      }
    }
  }, [formData, hourlyRates, actualMiles]);

  useEffect(() => {
    if (hourlyError) {
      toast.warning(hourlyError);
    }
  }, [hourlyError]);

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

  useEffect(() => {
    const storedForm = localStorage.getItem("bookingForm");
    if (!storedForm) {
      toast.error("No booking form found.");
      return;
    }

    const data = JSON.parse(storedForm);
    setFormData(data);

    const origin = data.pickup?.replace("Custom Input - ", "").split(" - ").pop()?.trim();
    const destination = data.dropoff?.replace("Custom Input - ", "").split(" - ").pop()?.trim();

    if (origin && destination) {
      triggerDistance({ origin, destination })
        .unwrap()
        .then(res => {
          if (res?.distanceText?.includes("km")) {
            const km = parseFloat(res.distanceText.replace("km", "").trim());
            const miles = parseFloat((km * 0.621371).toFixed(2));
            setDistanceText(`${miles} miles`);
            setActualMiles(miles);
          } else if (res?.distanceText?.includes("mi")) {
            const miles = parseFloat(res.distanceText.replace("mi", "").trim());
            setDistanceText(`${miles} miles`);
            setActualMiles(miles);
          }
          setDurationText(res?.durationText || null);
        })
        .catch(() => {
          setDistanceText(null);
          setDurationText(null);
          toast.warn("Distance not found between given locations.");
        });

      // ✅ Extract Postcodes after form loaded
      const pickupCode = extractPostcode(data.pickup);
      const dropoffCode = extractPostcode(data.dropoff);
      setPickupPostcode(pickupCode);
      setDropoffPostcode(dropoffCode);
    }
  }, []);

  const getLatLng = async (address) => {
    const res = await triggerGeocode(address).unwrap();
    if (res?.results?.length) {
      return res.results[0].geometry.location;  // { lat, lng }
    }
    return null;
  };

  // ✅ Match postcode pricing
  useEffect(() => {
    if (pickupPostcode && dropoffPostcode && postcodePrices.length > 0) {
      const match = postcodePrices.find(item =>
        (item.pickup.toUpperCase() === pickupPostcode && item.dropoff.toUpperCase() === dropoffPostcode) ||
        (item.pickup.toUpperCase() === dropoffPostcode && item.dropoff.toUpperCase() === pickupPostcode)
      );
      setMatchedPostcodePrice(match);
    }
  }, [pickupPostcode, dropoffPostcode, postcodePrices]);

  const getVehiclePriceForDistance = (vehicle, miles) => {
    if (!vehicle?.slabs || !Array.isArray(vehicle.slabs)) return 0;

    let totalPrice = 0;
    let remainingMiles = miles;

    const sortedSlabs = [...vehicle.slabs].sort((a, b) => a.from - b.from);

    for (let i = 0; i < sortedSlabs.length; i++) {
      const slab = sortedSlabs[i];

      if (remainingMiles <= 0) break;

      const slabDistance = slab.to - slab.from;
      const milesInThisSlab = Math.min(remainingMiles, slabDistance);

      totalPrice += milesInThisSlab * (slab.pricePerMile || 0);

      remainingMiles -= milesInThisSlab;
    }

    return parseFloat(totalPrice.toFixed(2));
  };

  useEffect(() => {
    if (carList.length > 0) {
      setSelectedCarId(carList[0]._id);
    }
  }, [carList]);

  useEffect(() => {
    if (selectedCarId && carList.length > 0 && actualMiles !== null) {
      const selectedCar = carList.find(car => car._id === selectedCarId);
      const selectedPrice =
        formData?.mode === "Hourly"
          ? selectedCar?.hourlyPrice || 0
          : getVehiclePriceForDistance(selectedCar, actualMiles);
      setBaseRate(selectedPrice || '0.00');
    }
  }, [selectedCarId, carList, actualMiles]);

  const handleSubmitBooking = () => {
    if (!selectedCarId || !formData) {
      toast.error("Please fill the form and select a vehicle.");
      return;
    }
    const selectedCar = carList.find(car => car._id === selectedCarId);
    if (!selectedCar) {
      toast.error("Please select a vehicle.");
      return;
    }
    localStorage.setItem("selectedVehicle", JSON.stringify(selectedCar));
    onNext();
  };

  // Calculate total price including drop-off price
  const zonePrice = matchedZonePrice || 0;
  const postcode = matchedPostcodePrice?.price || 0;

  const calculatedTotalPrice =
    (zonePrice > 0
      ? zonePrice
      : postcode
    ) + (dropOffPrice || 0)
    + pickupAirportPrice
    + dropoffAirportPrice;

  return (
    <>
      <ToastContainer />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:col-span-8 w-full">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-md p-6 w-full">
            <div className="text-center mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-1">
                {formData?.date ? new Date(formData.date).toLocaleDateString('en-UK', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'Date not selected'}
              </h3>
              <div className="text-xl font-semibold text-gray-900">
                {formData?.hour && formData?.minute ? `${String(formData.hour).padStart(2, '0')}:${String(formData.minute).padStart(2, '0')} ${formData?.hour < 12 ? 'AM' : 'PM'}` : 'Time not set'}
                <span className="text-sm text-gray-500">&nbsp;(GMT+1)</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-4 py-3 bg-white border border-gray-100 rounded-xl">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Icons.PlaneTakeoff className="w-8 h-8 text-red-500" />
                <div>
                  <p className="font-medium text-sm text-red-800">{formData?.pickup || "Pickup Location"}</p>
                  <p className="text-xs text-gray-500">{formData?.doorNumber ? `Door No. ${formData.doorNumber}` : "All Terminals"}</p>
                </div>
              </div>
              <div className="text-gray-400 text-2xl hidden md:block">→</div>
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <div className="text-right">
                  <p className="font-medium text-sm text-green-800">{formData?.dropoff || "Dropoff Location"}</p>
                  <p className="text-xs text-gray-500">{formData?.arrivefrom ? `From: ${formData.arrivefrom}` : "Destination"}</p>
                </div>
                <Icons.PlaneLanding className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-3 mt-4 text-sm text-gray-600 px-2">
              {durationText && (
                <span>
                  Estimated arrival at&nbsp;
                  <strong className="text-gray-800">
                    {formData?.hour && formData?.minute
                      ? (() => {
                        const dep = new Date();
                        dep.setHours(Number(formData.hour));
                        dep.setMinutes(Number(formData.minute));
                        const durParts = durationText.split(" ");
                        let minutes = 0;
                        for (let i = 0; i < durParts.length; i += 2) {
                          const val = parseInt(durParts[i]);
                          const unit = durParts[i + 1];
                          if (unit.startsWith("hour")) minutes += val * 60;
                          else if (unit.startsWith("min")) minutes += val;
                        }
                        dep.setMinutes(dep.getMinutes() + minutes);
                        return dep.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
                      })()
                      : "-"}
                  </strong>&nbsp;(GMT+1)
                </span>
              )}
              <div className="flex justify-end items-center gap-4 text-sm text-gray-700 mt-2">
                {matchedZonePrice !== null ? (
                  <div className="flex items-center gap-1">
                    Zone Price: <span>£{Number(matchedZonePrice).toFixed(2)}</span>
                  </div>
                ) : matchedPostcodePrice ? (
                  <div className="flex items-center gap-1">
                    Postcode Price: <span>£{Number(matchedPostcodePrice.price).toFixed(2)}</span>
                  </div>
                ) : null}

                {/* Display Total Price */}
                <div className="flex justify-between mt-4">
                  <span className="text-sm font-semibold">Total Price:</span>
                  <span className="text-sm">
                    ${calculatedTotalPrice.toFixed(2)}
                  </span>
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  {matchedZonePrice
                    ? `(Zone: £${matchedZonePrice} + Drop-Off: $${dropOffPrice || 0})`
                    : matchedPostcodePrice
                      ? `(Postcode: £${matchedPostcodePrice.price} + Drop-Off: $${dropOffPrice || 0})`
                      : `(Drop-Off Only: $${dropOffPrice || 0})`}
                </p>

                {distanceText && (<div className="flex items-center gap-1"><Icons.MapPin className="w-4 h-4 text-blue-500" /><span>{distanceText}</span></div>)}
                {durationText && (<div className="flex items-center gap-1"><Icons.Clock className="w-4 h-4 text-blue-500" /><span>{durationText}</span></div>)}
              </div>
            </div>
          </div>

          <div className='mt-6'>
            {hourlyError && (
              <div className="mt-4 mb-6 p-3 bg-yellow-100 text-yellow-900 text-sm rounded-md border border-yellow-300">
                {hourlyError}
              </div>
            )}
            <CarCardSection
              carList={carList.map(car => {
                let price = 0;
                if (formData?.mode === "Hourly") {
                  price = matchedHourlyRate?.[car.vehicleName] || 0;
                } else {
                  price = getVehiclePriceForDistance(car, actualMiles);
                }

                // ✅ Add Postcode Price
                if (matchedPostcodePrice) {
                  price += matchedPostcodePrice.price;
                }

                return { ...car, price };
              })}
              selectedCarId={selectedCarId}
              onSelect={setSelectedCarId}
            />
            <div className="text-right mt-4">
              <button
                onClick={handleSubmitBooking}
                className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-md shadow hover:bg-blue-700 transition"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 w-full space-y-8">
          {/* The right summary box — unchanged */}
        </div>
      </div>
    </>
  );
};

export default WidgetBookingInformation;
