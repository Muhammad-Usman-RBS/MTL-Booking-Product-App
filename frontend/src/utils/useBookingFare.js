import { useEffect, useState } from 'react';
import { useLazyGetDistanceQuery, useLazyGeocodeQuery } from "../redux/api/googleApi";
import { useGetAllHourlyRatesQuery } from "../redux/api/hourlyPricingApi";
import { useFetchAllPostcodePricesWidgetQuery } from "../redux/api/postcodePriceApi";
import { useGetFixedPricesForWidgetQuery } from "../redux/api/fixedPriceApi";
import { useGetAllVehiclesQuery } from "../redux/api/vehicleApi";

export const useBookingFare = ({
  companyId,
  pickup,
  dropoff,
  selectedVehicle,
  mode,
  selectedHourly,
  dropOffPrice = 0,
  includeAirportFees = false,
}) => {
  const [triggerGeocode] = useLazyGeocodeQuery();
  const [triggerDistance] = useLazyGetDistanceQuery();

  const { data: hourlyRates = [] } = useGetAllHourlyRatesQuery(companyId, { skip: !companyId });
  const { data: postcodePrices = [] } = useFetchAllPostcodePricesWidgetQuery(companyId, { skip: !companyId });
  const { data: fixedPrices = [] } = useGetFixedPricesForWidgetQuery(companyId, { skip: !companyId });
  const { data: allVehicles = [] } = useGetAllVehiclesQuery();

  const [distanceText, setDistanceText] = useState('');
  const [durationText, setDurationText] = useState('');
  const [miles, setMiles] = useState(0);
  const [pickupCoords, setPickupCoords] = useState([]);
  const [dropoffCoords, setDropoffCoords] = useState([]);

  const extractPostcode = (address) => {
    const match = address?.match(/\b[A-Z]{1,2}\d{1,2}[A-Z]?\b/i);
    return match ? match[0].toUpperCase() : null;
  };

  const getLatLng = async (address) => {
    if (!address) return null;
    const res = await triggerGeocode(address).unwrap();
    return res?.location || null;
  };

  const getVehiclePriceForDistance = (vehicle, miles) => {
    if (!vehicle?.slabs) return 0;
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
  };

  const isWithinZone = (point, zone) => {
    if (!point || !zone || zone.length < 4) return false;
    const lats = zone.map((c) => c.lat);
    const lngs = zone.map((c) => c.lng);
    return (
      point.lat >= Math.min(...lats) &&
      point.lat <= Math.max(...lats) &&
      point.lng >= Math.min(...lngs) &&
      point.lng <= Math.max(...lngs)
    );
  };

  const getZonePrice = (pickup, dropoff) => {
    for (const zone of fixedPrices) {
      const isPickupInZone = pickup.some((p) => isWithinZone(p, zone.pickupCoordinates));
      const isDropoffInZone = dropoff.some((d) => isWithinZone(d, zone.dropoffCoordinates));
      if (isPickupInZone && isDropoffInZone) return zone.price;
    }
    return null;
  };

  const [calculatedFare, setCalculatedFare] = useState(0);
  const [pricingMode, setPricingMode] = useState('');
  const [breakdown, setBreakdown] = useState({});

  useEffect(() => {
    const calculate = async () => {
      if (!pickup || !dropoff || !selectedVehicle) return;

      const origin = pickup?.includes(" - ") ? pickup.split(" - ").pop().trim() : pickup;
      const destination = dropoff?.includes(" - ") ? dropoff.split(" - ").pop().trim() : dropoff;
      const pickupPostcode = extractPostcode(pickup);
      const dropoffPostcode = extractPostcode(dropoff);

      const [pickupCoord, dropoffCoord] = await Promise.all([
        getLatLng(origin),
        getLatLng(destination)
      ]);

      setPickupCoords([pickupCoord]);
      setDropoffCoords([dropoffCoord]);

      const distRes = await triggerDistance({ origin, destination }).unwrap();
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

      let price = 0;
      let pricing = '';

      const matchedVehicle = allVehicles.find(v => v.vehicleName === selectedVehicle?.vehicleName);
      const percentageRate = matchedVehicle?.percentageIncrease || 0;

      if (mode === "Hourly") {
        const selected = hourlyRates.find(
          (r) => r.distance === selectedHourly?.value?.distance && r.hours === selectedHourly?.value?.hours
        );
        price = selected?.vehicleRates?.[selectedVehicle.vehicleName] || 0;
        pricing = 'hourly';
      } else {
        const postcodeMatch = postcodePrices.find(
          (p) =>
            (p.pickup === pickupPostcode && p.dropoff === dropoffPostcode) ||
            (p.pickup === dropoffPostcode && p.dropoff === pickupPostcode)
        );

        if (postcodeMatch && selectedVehicle?.vehicleName) {
          const basePrice = postcodeMatch.vehicleRates?.[selectedVehicle.vehicleName] || postcodeMatch.price || 0;
          price = basePrice + (basePrice * percentageRate) / 100;
          pricing = 'postcode';

        } else {
          const zonePrice = getZonePrice([pickupCoord], [dropoffCoord]);
          if (zonePrice) {
            price = zonePrice + (zonePrice * percentageRate) / 100;
            pricing = 'zone';
          } else {
            const base = getVehiclePriceForDistance(selectedVehicle, totalMiles);
            price = base + (base * percentageRate) / 100;
            pricing = 'mileage';
          }
        }
      }

      price += dropOffPrice;

      setCalculatedFare(price);
      setPricingMode(pricing);
      setBreakdown({
        base: price - dropOffPrice,
        dropOff: dropOffPrice,
        pricingMode: pricing,
        distanceText: distText,
        durationText: durText,
      });
    };

    calculate();
  }, [pickup, dropoff, selectedVehicle, selectedHourly, mode]);

  return {
    calculatedFare,
    pricingMode,
    breakdown,
    distanceText,
    durationText,
    miles,
    pickupCoords,
    dropoffCoords
  };
};
