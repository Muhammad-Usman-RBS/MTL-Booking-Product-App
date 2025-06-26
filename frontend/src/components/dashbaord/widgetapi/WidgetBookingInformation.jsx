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
import { useGetFixedPricesForWidgetQuery } from '../../../redux/api/fixedPriceApi';

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
  const [matchedZoneToZonePrice, setMatchedZoneToZonePrice] = useState(null);
  const [hourlyError, setHourlyError] = useState('');
  const [triggerGeocode] = useLazyGeocodeQuery();
  const [fixedZonePrice, setFixedZonePrice] = useState(null);

  const [triggerDistance] = useLazyGetDistanceQuery();
  const { data: carList = [], isLoading, error } = useGetPublicVehiclesQuery(companyId, { skip: !companyId });
  const { data: hourlyRates = [] } = useGetAllHourlyRatesQuery(companyId, { skip: !companyId });

  // ✅ Fetch Postcode Prices
  const { data: postcodePrices = [] } = useFetchAllPostcodePricesWidgetQuery(companyId, { skip: !companyId });
  const { data: extras = [] } = useGetExtrasForWidgetQuery(companyId, { skip: !companyId });
  const zones = extras.filter(item => item.zone);

  const { data: generalPricing } = useGetGeneralPricingPublicQuery(companyId, { skip: !companyId });

  const { data: fixedPrices = [] } = useGetFixedPricesForWidgetQuery(companyId, { skip: !companyId });

  const { data: zoneToZonePrices = [] } = useGetFixedPricesForWidgetQuery(companyId, { skip: !companyId });

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

  const isWithinBoundingBox = (point, boundsArray) => {
    if (!point || !boundsArray || boundsArray.length < 4) return false;

    const lats = boundsArray.map(coord => coord.lat);
    const lngs = boundsArray.map(coord => coord.lng);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    return (
      point.lat >= minLat &&
      point.lat <= maxLat &&
      point.lng >= minLng &&
      point.lng <= maxLng
    );
  };

  const matchFixedPrice = (pickupCoords, dropoffCoords, direction) => {
    if (!Array.isArray(fixedPrices) || fixedPrices.length === 0) return null;
    if (!pickupCoords?.length || !dropoffCoords?.length) return null;

    for (const zone of fixedPrices) {
      const pickupInZone = pickupCoords.some(p =>
        isWithinBoundingBox(p, zone.pickupCoordinates)
      );
      const dropoffInZone = dropoffCoords.some(d =>
        isWithinBoundingBox(d, zone.dropoffCoordinates)
      );

      const reversePickupInZone = dropoffCoords.some(d =>
        isWithinBoundingBox(d, zone.pickupCoordinates)
      );
      const reverseDropoffInZone = pickupCoords.some(p =>
        isWithinBoundingBox(p, zone.dropoffCoordinates)
      );

      if (zone.direction === "One Way") {
        if (pickupInZone && dropoffInZone && direction === "One Way") {
          return zone.price;
        }
      }

      if (zone.direction === "Both Ways") {
        const forwardMatch = pickupInZone && dropoffInZone;
        const reverseMatch = reversePickupInZone && reverseDropoffInZone;

        if (direction === "One Way" && (forwardMatch || reverseMatch)) {
          return zone.price;
        }

        if (direction === "Both Ways" && (forwardMatch || reverseMatch)) {
          return zone.price * 2;
        }
      }
    }

    return null;
  };

  useEffect(() => {
    if (!formData?.pickupCoordinates || !formData?.dropoffCoordinates || !formData?.direction) return;

    const price = matchFixedPrice(
      formData.pickupCoordinates,
      formData.dropoffCoordinates,
      formData.direction
    );

    setFixedZonePrice(price);
  }, [formData, fixedPrices]);

  // Checked Zone Entry Price
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
      actualMiles !== null
    ) {
      const original = formData?.originalHourlyOption?.value;

      if (original) {
        const selectedSlab = hourlyRates.find(pkg =>
          Number(pkg.distance) === Number(original.distance) &&
          Number(pkg.hours) === Number(original.hours)
        );

        if (selectedSlab) {
          setMatchedHourlyRate(selectedSlab.vehicleRates || {});

          if (actualMiles > Number(original.distance)) {
            const warningMsg = `You've selected ${original.distance} miles for ${original.hours} hours, but your trip is ${actualMiles} miles. Prices are shown for your selected package. Extra charges may apply.`;
            setHourlyError(warningMsg);
          } else {
            setHourlyError('');
          }

        } else {
          setMatchedHourlyRate(null);
          setHourlyError("Selected hourly package not found.");
        }
      } else {
        // fallback for any edge case where originalHourlyOption is missing
        const fallback = hourlyRates.find(pkg => Number(pkg.distance) >= actualMiles) ||
          [...hourlyRates].sort((a, b) => b.distance - a.distance)[0];

        if (fallback) {
          setMatchedHourlyRate(fallback.vehicleRates || {});
          setHourlyError("No selected package found. Showing closest match.");
        } else {
          setMatchedHourlyRate(null);
          setHourlyError("No suitable hourly package found.");
        }
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
    setFormData(JSON.parse(storedForm));
    if (!storedForm) {
      toast.error("No booking form found.");
      return;
    }

    const data = JSON.parse(storedForm);

    const origin = data.pickup?.replace("Custom Input - ", "").split(" - ").pop()?.trim();
    const destination = data.dropoff?.replace("Custom Input - ", "").split(" - ").pop()?.trim();

    // Run everything inside an async IIFE
    (async () => {
      if (origin && destination) {
        try {
          const [pickupCoord, dropoffCoord] = await Promise.all([
            getLatLng(origin),
            getLatLng(destination)
          ]);

          setFormData({
            ...data,
            direction: data.direction || "One Way",
            pickupCoordinates: pickupCoord ? [pickupCoord] : [],
            dropoffCoordinates: dropoffCoord ? [dropoffCoord] : [],
          });

          const res = await triggerDistance({ origin, destination }).unwrap();

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
        } catch (err) {
          toast.warn("Distance or geolocation failed.");
        }
      }

      const pickupCode = extractPostcode(data.pickup);
      const dropoffCode = extractPostcode(data.dropoff);
      setPickupPostcode(pickupCode);
      setDropoffPostcode(dropoffCode);
    })();
  }, []);


  const getLatLng = async (address) => {
    const res = await triggerGeocode(address).unwrap();
    return res?.location || null;
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
  if (selectedCarId && carList.length > 0) {
    const selectedCar = carList.find(car => car._id === selectedCarId);
    if (!selectedCar) return;

    const raw = selectedCar.percentageIncrease ?? 0;
    const cleanPercentage = typeof raw === "string" ? Number(raw.replace("%", "")) : Number(raw);
    const percentage = isNaN(cleanPercentage) ? 0 : cleanPercentage;

    let base = 0;

    if (formData?.mode === "Hourly") {
      // ✅ Don't apply percentage for hourly, use pure hourly rate
      base = matchedHourlyRate?.[selectedCar?.vehicleName] || 0;
    } else if (fixedZonePrice !== null) {
      base = fixedZonePrice;
    } else if (matchedZoneToZonePrice !== null) {
      base = matchedZoneToZonePrice;
    } else if (matchedPostcodePrice?.price !== undefined) {
      base = matchedPostcodePrice.price;
    } else {
      base = getVehiclePriceForDistance(selectedCar, actualMiles || 0);
    }

    const final =
      formData?.mode === "Hourly"
        ? base // ✅ No percentage added in hourly
        : base + (base * (percentage / 100)); // ✅ Apply % in all non-hourly modes

    setBaseRate(final.toFixed(2));
  }
}, [
  selectedCarId,
  carList,
  actualMiles,
  formData?.mode,
  matchedHourlyRate,
  matchedZoneToZonePrice,
  matchedPostcodePrice,
  fixedZonePrice
]);

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

    // ✅ Send selected car and final total price to parent
    onNext({
      totalPrice: calculatedTotalPrice,
      selectedCar: {
        ...selectedCar,
        passenger: selectedCar?.passengers || 0,
        childSeat: selectedCar?.childSeat || 0,
        handLuggage: selectedCar?.handLuggage || 0,
        checkinLuggage: selectedCar?.checkinLuggage || 0
      }

    });
  };

  // const calculatedTotalPrice =
  //   Number(baseRate) +
  //   (matchedZonePrice || 0) +
  //   (matchedZoneToZonePrice || 0) +
  //   (dropOffPrice || 0) +
  //   pickupAirportPrice +
  //   dropoffAirportPrice;

  const isHourlyMode = formData?.mode === "Hourly";

  const calculatedTotalPrice =
    Number(baseRate) +
    (isHourlyMode ? 0 : (matchedZonePrice || 0)) +
    (isHourlyMode ? 0 : (matchedZoneToZonePrice || 0)) +
    (isHourlyMode ? 0 : (matchedPostcodePrice?.price || 0)) +
    (dropOffPrice || 0) +
    (pickupAirportPrice || 0) +
    (dropoffAirportPrice || 0);

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
              <div className="flex flex-col items-end gap-2 w-full md:w-auto justify-end text-right">
                {[formData?.dropoff, formData?.additionalDropoff1, formData?.additionalDropoff2]
                  .filter(Boolean)
                  .map((location, index, array) => (
                    <div key={index} className="flex items-center justify-end gap-2">
                      <div>
                        <p className="font-medium text-sm text-green-800">{location}</p>
                        {index === array.length - 1 && (
                          <p className="text-xs text-gray-500">
                            {formData?.arrivefrom ? `From: ${formData.arrivefrom}` : "Destination"}
                          </p>
                        )}
                      </div>
                      <Icons.PlaneLanding className="w-5 h-5 text-green-500" />
                    </div>
                  ))}
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
              <div className='flex gap-3 items-center'>
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
              carList={(() => {
                const baseFixedZonePrice = fixedZonePrice || 0;
                const baseZoneToZonePrice = matchedZoneToZonePrice || 0;
                const basePostcodePrice = matchedPostcodePrice?.price || 0;
                const isHourly = formData?.mode === "Hourly";

                return carList.map((car) => {
                  let price = 0;
                  let label = "";

                  const raw = car.percentageIncrease ?? 0;
                  const cleanPercentage = typeof raw === "string"
                    ? Number(raw.replace("%", ""))
                    : Number(raw);
                  const percentage = isNaN(cleanPercentage) ? 0 : cleanPercentage;

                  if (isHourly) {
                    // ✅ Only use hourly rate directly
                    price = matchedHourlyRate?.[car.vehicleName] || 0;
                    label = `Hourly rate: £${price.toFixed(2)}`;
                  } else if (fixedZonePrice !== null) {
                    const final = baseFixedZonePrice + (baseFixedZonePrice * (percentage / 100));
                    price = parseFloat(final.toFixed(2));
                    label = `Fixed Zone: £${baseFixedZonePrice.toFixed(2)} + ${percentage}% = £${price.toFixed(2)}`;
                  } else if (matchedZoneToZonePrice !== null) {
                    const final = baseZoneToZonePrice + (baseZoneToZonePrice * (percentage / 100));
                    price = parseFloat(final.toFixed(2));
                    label = `Zone: £${baseZoneToZonePrice.toFixed(2)} + ${percentage}% = £${price.toFixed(2)}`;
                  } else if (matchedPostcodePrice) {
                    const final = basePostcodePrice + (basePostcodePrice * (percentage / 100));
                    price = parseFloat(final.toFixed(2));
                    label = `Postcode: £${basePostcodePrice.toFixed(2)} + ${percentage}% = £${price.toFixed(2)}`;
                  } else {
                    const base = getVehiclePriceForDistance(car, actualMiles || 0);
                    const final = base + (base * (percentage / 100));
                    price = parseFloat(final.toFixed(2));
                    label = `Distance rate: £${base.toFixed(2)} + ${percentage}% = £${price.toFixed(2)}`;
                  }

                  return {
                    ...car,
                    price,
                    labelWithBreakdown: label,
                  };
                });
              })()}
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
          <div className="rounded-2xl p-6 bg-white shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-gray-800 font-semibold text-lg">
                <Icons.ReceiptText className="w-5 h-5 text-blue-500" />
                <span>Price Breakdown</span>
              </div>
              <span className="text-sm text-gray-500">GBP</span>
            </div>

            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-between border-b border-dashed pb-2">
                <span>Base Fare</span>
                <span className="font-medium text-gray-900">£{baseRate}</span>
              </div>

              {fixedZonePrice !== null && (
                <div className="flex justify-between border-b border-dashed pb-2">
                  <span>Fixed Zone Price</span>
                  <span className="font-medium text-gray-900">£{fixedZonePrice.toFixed(2)}</span>
                </div>
              )}

              {!isHourlyMode && matchedZonePrice !== null && (
                <div className="flex justify-between border-b border-dashed pb-2">
                  <span>Zone Toll Price</span>
                  <span className="font-medium text-gray-900">£{matchedZonePrice.toFixed(2)}</span>
                </div>
              )}

              {matchedZoneToZonePrice !== null && (
                <div className="flex justify-between border-b border-dashed pb-2">
                  <span>Zone-to-Zone Price</span>
                  <span className="font-medium text-gray-900">£{matchedZoneToZonePrice.toFixed(2)}</span>
                </div>
              )}

              {!isHourlyMode && matchedPostcodePrice && (
                <div className="flex justify-between border-b border-dashed pb-2">
                  <span>Postcode Price</span>
                  <span className="font-medium text-gray-900">£{matchedPostcodePrice.price.toFixed(2)}</span>
                </div>
              )}

              {dropOffPrice > 0 && (
                <div className="flex justify-between border-b border-dashed pb-2">
                  <span>Additional Drop-Offs</span>
                  <span className="font-medium text-gray-900">£{dropOffPrice.toFixed(2)}</span>
                </div>
              )}

              {(pickupAirportPrice > 0 || dropoffAirportPrice > 0) && (
                <div className="flex justify-between border-b border-dashed pb-2">
                  <span>Meet & Greet (Airport)</span>
                  <span className="font-medium text-gray-900">
                    £{(pickupAirportPrice + dropoffAirportPrice).toFixed(2)}
                  </span>
                </div>
              )}

              {isHourlyMode && (
                <div className="mt-4 text-sm font-medium text-blue-600">
                  Hourly Package Selected – Extras added where applicable
                </div>
              )}

              {!isHourlyMode && fixedZonePrice !== null && (
                <div className="flex justify-between border-b border-dashed pb-2">
                  <span>Fixed Zone Price</span>
                  <span className="font-medium text-gray-900">£{fixedZonePrice.toFixed(2)}</span>
                </div>
              )}

              {!isHourlyMode && matchedZoneToZonePrice !== null && (
                <div className="flex justify-between border-b border-dashed pb-2">
                  <span>Zone-to-Zone Price</span>
                  <span className="font-medium text-gray-900">£{matchedZoneToZonePrice.toFixed(2)}</span>
                </div>
              )}


              <div className="flex justify-between pt-2 mt-12 border-t border-gray-300 text-base font-semibold">
                <span>Total</span>
                <span>£{calculatedTotalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">✅ All Classes Include:</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              {["Free cancellation", "Free 60 minutes wait", "Meet & Greet"].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Icons.Check className="w-4 h-4 text-green-500 mt-1" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-yellow-800 mb-2 flex items-center gap-2">
                <Icons.AlertCircle className="w-4 h-4 text-yellow-600" />
                Please Note
              </h4>
              <p className="text-sm text-yellow-900">
                Child seats must be added for safety reasons.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WidgetBookingInformation;
