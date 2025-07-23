import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useLazyGetDistanceQuery, useLazyGeocodeQuery } from "../redux/api/googleApi";
import { useGetAllHourlyRatesQuery } from "../redux/api/hourlyPricingApi";
import { useFetchAllPostcodePricesWidgetQuery } from "../redux/api/postcodePriceApi";
import { useGetFixedPricesForWidgetQuery, useGetExtrasForWidgetQuery } from "../redux/api/fixedPriceApi";
import { useGetAllVehiclesQuery } from "../redux/api/vehicleApi";
import { useGetGeneralPricingPublicQuery } from "../redux/api/generalPricingApi";
import { useGetDiscountsByCompanyIdQuery } from "../redux/api/discountApi";
import { toast } from "react-toastify";

// Cache for geocoding results
const geocodeCache = new Map();
const distanceCache = new Map();

export const useBookingFare = ({
  companyId,
  pickup,
  dropoff,
  selectedVehicle,
  mode,
  selectedHourly,
  dropOffPrice = 0,
  includeChildSeat = false,
  childSeatCount = 0,
  zoneFee = 0,
  journeyDateTime = null
}) => {
  const hasErrorShown = useRef(false);
  const [triggerGeocode] = useLazyGeocodeQuery();
  const [triggerDistance] = useLazyGetDistanceQuery();

  // Add ref to prevent multiple simultaneous calls
  const isCalculating = useRef(false);
  const lastCalculationKey = useRef('');

  const { data: hourlyRates = [] } = useGetAllHourlyRatesQuery(companyId, { skip: !companyId });
  const { data: postcodePrices = [] } = useFetchAllPostcodePricesWidgetQuery(companyId, { skip: !companyId });
  const { data: fixedPrices = [] } = useGetFixedPricesForWidgetQuery(companyId, { skip: !companyId });
  const { data: allVehicles = [] } = useGetAllVehiclesQuery();
  const { data: generalPricing = {} } = useGetGeneralPricingPublicQuery(companyId, { skip: !companyId });
  const { data: discounts = [] } = useGetDiscountsByCompanyIdQuery(companyId, { skip: !companyId });
  const { data: extrasPricing = [] } = useGetExtrasForWidgetQuery(companyId, { skip: !companyId });

  const [distanceText, setDistanceText] = useState('');
  const [durationText, setDurationText] = useState('');
  const [miles, setMiles] = useState(0);
  const [pickupCoords, setPickupCoords] = useState([]);
  const [dropoffCoords, setDropoffCoords] = useState([]);
  const [calculatedFare, setCalculatedFare] = useState(0);
  const [pricingMode, setPricingMode] = useState('');
  const [breakdown, setBreakdown] = useState({});
  const [hourlyError, setHourlyError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isValidAddress = (address) => {
    return typeof address === 'string' && address.trim().length > 5 && /[a-zA-Z0-9]/.test(address);
  };

  // Memoize helper functions to prevent recreating them on every render
  const extractPostcode = useCallback((address) => {
    const match = address?.match(/\b[A-Z]{1,2}\d{1,2}[A-Z]?\b/i);
    return match ? match[0].toUpperCase() : null;
  }, []);

  const getLatLng = useCallback(async (address) => {
    if (!address) return null;

    // Check cache first
    if (geocodeCache.has(address)) {
      return geocodeCache.get(address);
    }

    try {
      const res = await triggerGeocode(address).unwrap();
      const location = res?.location || null;

      // Cache the result
      geocodeCache.set(address, location);
      return location;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }, [triggerGeocode]);

  const getDistance = useCallback(async (origin, destination) => {
    const cacheKey = `${origin}-${destination}`;

    // Check cache first
    if (distanceCache.has(cacheKey)) {
      return distanceCache.get(cacheKey);
    }

    try {
      const res = await triggerDistance({ origin, destination }).unwrap();

      // Cache the result
      distanceCache.set(cacheKey, res);
      return res;
    } catch (error) {
      console.error('Distance calculation error:', error);
      return null;
    }
  }, [triggerDistance]);

  const getVehiclePriceForDistance = useCallback((vehicle, miles) => {
    if (!vehicle?.slabs || !Array.isArray(vehicle.slabs)) return 0;
    let total = 0;
    let remaining = miles;
    const slabs = [...vehicle.slabs].sort((a, b) => a.from - b.from);
    for (const slab of slabs) {
      if (remaining <= 0) break;
      const slabDistance = slab.to - slab.from;
      const useMiles = Math.min(remaining, slabDistance);
      total += useMiles * (slab.pricePerMile || 0);
      remaining -= useMiles;
    }
    return total;
  }, []);

  const isWithinZone = useCallback((point, zone) => {
    if (!point || !zone || zone.length < 4) return false;
    const lats = zone.map(c => c.lat);
    const lngs = zone.map(c => c.lng);
    return (
      point.lat >= Math.min(...lats) &&
      point.lat <= Math.max(...lats) &&
      point.lng >= Math.min(...lngs) &&
      point.lng <= Math.max(...lngs)
    );
  }, []);

  const getZoneEntryFee = useCallback((pickupCoord, dropoffCoord) => {
    const matchedZone = extrasPricing.find((zone) =>
      isWithinZone(pickupCoord, zone.coordinates)
    ) || extrasPricing.find((zone) =>
      isWithinZone(dropoffCoord, zone.coordinates)
    );
    return matchedZone?.price || 0;
  }, [extrasPricing, isWithinZone]);

  const getZonePrice = useCallback((pickupCoord, dropoffCoord) => {
    for (const zone of fixedPrices) {
      const direction = (zone.direction || '').toLowerCase();

      const pickupInPickupZone = isWithinZone(pickupCoord, zone.pickupCoordinates);
      const dropoffInDropoffZone = isWithinZone(dropoffCoord, zone.dropoffCoordinates);

      const pickupInDropoffZone = isWithinZone(pickupCoord, zone.dropoffCoordinates);
      const dropoffInPickupZone = isWithinZone(dropoffCoord, zone.pickupCoordinates);

      if (direction === 'both ways') {
        if ((pickupInPickupZone && dropoffInDropoffZone) || (pickupInDropoffZone && dropoffInPickupZone)) {
          return zone.price;
        }
      } else if (direction === 'one way') {
        if (pickupInPickupZone && dropoffInDropoffZone) {
          return zone.price;
        }
      }
    }
    return null;
  }, [fixedPrices, isWithinZone]);

  const getValidDynamicPricing = useCallback(() => {
    if (!Array.isArray(discounts) || !journeyDateTime) return 0;
    for (let item of discounts) {
      const from = new Date(item.fromDate);
      const to = new Date(item.toDate);
      if (item.status === "Active" && from <= journeyDateTime && to >= journeyDateTime) {
        if (item.category === "Surcharge" && item.surchargePrice > 0) return item.surchargePrice;
        if (item.category === "Discount" && item.discountPrice > 0) return -item.discountPrice;
      }
    }
    return 0;
  }, [discounts, journeyDateTime]);

  // Create a memoized calculation key to prevent unnecessary recalculations
  const calculationKey = useMemo(() => {
    return JSON.stringify({
      pickup,
      dropoff,
      vehicleName: selectedVehicle?.vehicleName,
      mode,
      selectedHourly: selectedHourly?.value,
      dropOffPrice,
      includeChildSeat,
      childSeatCount,
      zoneFee,
      journeyDateTime: journeyDateTime?.getTime()
    });
  }, [
    pickup,
    dropoff,
    selectedVehicle?.vehicleName,
    mode,
    selectedHourly?.value,
    dropOffPrice,
    includeChildSeat,
    childSeatCount,
    zoneFee,
    journeyDateTime
  ]);

  // Debounced calculation function
  const calculateFare = useCallback(async () => {
    // Prevent multiple simultaneous calculations
    if (isCalculating.current || !pickup || !dropoff || !selectedVehicle) return;

    if (!isValidAddress(pickup) || !isValidAddress(dropoff)) {
      if (!hasErrorShown.current) {
        toast.error("Invalid address entered. Please use a complete location.");
        hasErrorShown.current = true;
      }
      return;
    }

    // Check if we already calculated for this set of parameters
    if (lastCalculationKey.current === calculationKey) {
      return;
    }

    isCalculating.current = true;
    lastCalculationKey.current = calculationKey;
    setIsLoading(true);

    try {
      const origin = pickup.includes(" - ") ? pickup.split(" - ").pop().trim() : pickup;
      const destination = dropoff.includes(" - ") ? dropoff.split(" - ").pop().trim() : dropoff;
      const pickupPostcode = extractPostcode(pickup);
      const dropoffPostcode = extractPostcode(dropoff);
      const isAirportJourney = pickup.toLowerCase().includes('airport') || dropoff.toLowerCase().includes('airport');
      const flatAirportFee = isAirportJourney ? 20 : 0;

      // Get coordinates and distance in parallel
      const [pickupCoord, dropoffCoord, distRes] = await Promise.all([
        getLatLng(origin),
        getLatLng(destination),
        getDistance(origin, destination)
      ]);

      if (!pickupCoord || !dropoffCoord || !distRes) {
        if (!hasErrorShown.current) {
          toast.error("Unable to get location data. Please check your addresses.");
          hasErrorShown.current = true;
        }
        return;
      }

      setPickupCoords([pickupCoord]);
      setDropoffCoords([dropoffCoord]);

      const distText = distRes?.distanceText || "";
      const durText = distRes?.durationText || "";
      setDistanceText(distText);
      setDurationText(durText);

      let totalMiles = 0;
      if (distText.includes("km")) {
        const km = parseFloat(distText.replace("km", "").trim());
        totalMiles = parseFloat((km * 0.621371).toFixed(2));
      } else if (distText.includes("mi")) {
        totalMiles = parseFloat(distText.replace("mi", "").trim());
      }
      setMiles(totalMiles);

      let baseFare = 0;
      let pricing = '';
      let extraZoneFee = 0;
      const vehicleName = selectedVehicle?.vehicleName;
      const matchedVehicle = allVehicles.find(v => v.vehicleName === vehicleName);
      const markupPercent = parseFloat(matchedVehicle?.percentageIncrease || 0);

      if (mode === "Hourly") {
        const selected = hourlyRates.find(
          (r) => r.distance === selectedHourly?.value?.distance && r.hours === selectedHourly?.value?.hours
        );
        baseFare = selected?.vehicleRates?.[selectedVehicle.vehicleName] || 0;
        pricing = 'hourly';
      } else {
        const postcodeMatch = postcodePrices.find(
          (p) =>
          ((p.pickup === pickupPostcode && p.dropoff === dropoffPostcode) ||
            (p.pickup === dropoffPostcode && p.dropoff === pickupPostcode))
        );

        if (postcodeMatch) {
          baseFare = postcodeMatch.vehicleRates?.[vehicleName] ?? postcodeMatch.price;
          pricing = 'postcode';
        } else {
          const zonePrice = getZonePrice(pickupCoord, dropoffCoord);

          if (zonePrice !== null) {
            baseFare = zonePrice;
            pricing = 'zone';
            extraZoneFee = getZoneEntryFee(pickupCoord, dropoffCoord);
          } else {
            baseFare = getVehiclePriceForDistance(selectedVehicle, totalMiles);
            pricing = 'mileage';
          }
        }
      }

      const markupAmount = (baseFare * markupPercent) / 100;
      let finalFare = baseFare + markupAmount + flatAirportFee;

      const surchargePercent = getValidDynamicPricing();
      const surchargeAmount = (surchargePercent / 100) * baseFare;
      finalFare += surchargeAmount;

      const childSeatUnitPrice = includeChildSeat ? parseFloat(generalPricing?.childSeatPrice || 0) : 0;
      const totalChildSeatCharge = includeChildSeat ? childSeatCount * childSeatUnitPrice : 0;
      finalFare += dropOffPrice + totalChildSeatCharge + zoneFee + extraZoneFee;

      const breakdownDetails = {
        baseFare: parseFloat(baseFare.toFixed(2)),
        markupAmount: parseFloat(markupAmount.toFixed(2)),
        airportFee: flatAirportFee,
        dropOffPrice,
        childSeatUnitPrice: parseFloat(childSeatUnitPrice.toFixed(2)),
        childSeatCount,
        totalChildSeatCharge: parseFloat(totalChildSeatCharge.toFixed(2)),
        zoneFee,
        zoneEntryFee: parseFloat(extraZoneFee.toFixed(2)),
        surchargePercentage: surchargePercent,
        surchargeAmount: parseFloat(surchargeAmount.toFixed(2)),
        total: parseFloat(finalFare.toFixed(2)),
        pricingMode: pricing,
        distanceText: distText,
        durationText: durText
      };

      setCalculatedFare(breakdownDetails.total);
      setPricingMode(pricing);
      setBreakdown(breakdownDetails);
      hasErrorShown.current = false;
    } catch (error) {
      console.error('Fare calculation error:', error);
      toast.error("Error calculating fare. Please try again.");
    } finally {
      isCalculating.current = false;
      setIsLoading(false);
    }
  }, [
    pickup,
    dropoff,
    selectedVehicle,
    selectedHourly,
    mode,
    dropOffPrice,
    includeChildSeat,
    childSeatCount,
    generalPricing,
    zoneFee,
    hourlyRates,
    postcodePrices,
    fixedPrices,
    allVehicles,
    discounts,
    journeyDateTime,
    calculationKey,
    extractPostcode,
    getLatLng,
    getDistance,
    getVehiclePriceForDistance,
    getZonePrice,
    getZoneEntryFee,
    getValidDynamicPricing
  ]);

  // Debounced effect for fare calculation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calculateFare();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [calculationKey]);

  // Hourly Error Logic
  useEffect(() => {
    if (mode === "Hourly" && selectedHourly?.value?.distance && miles) {
      const original = selectedHourly.value;
      const actualMiles = miles;

      if (actualMiles > Number(original.distance)) {
        const warningMsg = `You've selected ${original.distance} miles for ${original.hours} hours, but your trip is ${actualMiles} miles. Prices are shown for your selected package. Extra charges may apply.`;
        setHourlyError(warningMsg);
      } else {
        setHourlyError('');
      }
    }
  }, [mode, selectedHourly, miles]);

  // Cleanup function to clear caches periodically
  useEffect(() => {
    const cleanup = () => {
      if (geocodeCache.size > 100) {
        geocodeCache.clear();
      }
      if (distanceCache.size > 100) {
        distanceCache.clear();
      }
    };

    const interval = setInterval(cleanup, 300000);
    return () => clearInterval(interval);
  }, []);

  return {
    calculatedFare,
    pricingMode,
    breakdown,
    distanceText,
    durationText,
    miles,
    pickupCoords,
    dropoffCoords,
    hourlyError,
    isLoading
  };
};