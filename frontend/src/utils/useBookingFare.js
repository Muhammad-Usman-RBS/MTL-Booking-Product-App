import { useEffect, useRef, useState, useCallback } from 'react';
import debounce from 'lodash.debounce';
import { useLazyGetDistanceQuery, useLazyGeocodeQuery } from '../redux/api/googleApi';
import { useGetAllHourlyRatesQuery } from '../redux/api/hourlyPricingApi';
import { useFetchAllPostcodePricesWidgetQuery } from '../redux/api/postcodePriceApi';
import { useGetFixedPricesForWidgetQuery } from '../redux/api/fixedPriceApi';
import { useGetAllVehiclesQuery } from '../redux/api/vehicleApi';
import { useGetGeneralPricingPublicQuery } from '../redux/api/generalPricingApi';
import { useGetDiscountsByCompanyIdQuery } from '../redux/api/discountApi';

export const useBookingFare = ({
  companyId,
  pickup,
  dropoff,
  selectedVehicle,
  mode,
  selectedHourly,
  journeyDateTime = null,
  dropOffPrice = 0,
  includeAirportFees = false,
  includeChildSeat = false,
  childSeatCount = 0,
}) => {
  /* ────────────────────── API hooks ────────────────────── */
  const [triggerGeocode] = useLazyGeocodeQuery();
  const [triggerDistance] = useLazyGetDistanceQuery();

  const { data: postcodePrices = [] } = useFetchAllPostcodePricesWidgetQuery(companyId, {
    skip: !companyId,
  });
  const { data: fixedPrices = [] } = useGetFixedPricesForWidgetQuery(companyId, {
    skip: !companyId,
  });
  const { data: generalPricing } = useGetGeneralPricingPublicQuery(companyId, {
    skip: !companyId,
  });
  const { data: discounts = [] } = useGetDiscountsByCompanyIdQuery(companyId, {
    skip: !companyId,
  });
  const { data: hourlyRates = [] } = useGetAllHourlyRatesQuery(companyId, {
    skip: !companyId,
  });
  const { data: allVehicles = [] } = useGetAllVehiclesQuery();

  /* ────────────────────── local state ────────────────────── */
  const [distanceText, setDistanceText] = useState('');
  const [durationText, setDurationText] = useState('');
  const [miles, setMiles] = useState(0);
  const [pickupCoords, setPickupCoords] = useState([]);
  const [dropoffCoords, setDropoffCoords] = useState([]);

  const [calculatedFare, setCalculatedFare] = useState(0);
  const [pricingMode, setPricingMode] = useState('');
  const [breakdown, setBreakdown] = useState({});

  /* ────────────────────── helpers ────────────────────── */
  const extractPostcode = (address) =>
    address?.match(/\b[A-Z]{1,2}\d{1,2}[A-Z]?\b/i)?.[0]?.toUpperCase() || null;

  const isValidAddress = (str) => /[a-zA-Z]{3,}/.test(str) && str.length > 5;

  const isAirport = (txt) => txt?.toLowerCase().includes('airport');

  const isWithinZone = (point, zone) => {
    if (!point || !zone?.length) return false;
    const lats = zone.map((c) => c.lat);
    const lngs = zone.map((c) => c.lng);
    return (
      point.lat >= Math.min(...lats) &&
      point.lat <= Math.max(...lats) &&
      point.lng >= Math.min(...lngs) &&
      point.lng <= Math.max(...lngs)
    );
  };

  // Fixed bidirectional zone pricing
  const getZonePrice = (pCoords, dCoords) => {
    for (const zone of fixedPrices) {
      const dir = zone.direction?.toLowerCase();
      const pInPick = pCoords.some((p) => isWithinZone(p, zone.pickupCoordinates));
      const dInDrop = dCoords.some((d) => isWithinZone(d, zone.dropoffCoordinates));
      const dInPick = dCoords.some((d) => isWithinZone(d, zone.pickupCoordinates));
      const pInDrop = pCoords.some((p) => isWithinZone(p, zone.dropoffCoordinates));

      // Enhanced bidirectional logic
      if (dir === 'both ways' || dir === 'bidirectional') {
        // For bidirectional zones, both A->B and B->A should work
        if ((pInPick && dInDrop) || (pInDrop && dInPick)) {
          return zone.price;
        }
      } else if (dir === 'one way') {
        // For one-way zones, only A->B works
        if (pInPick && dInDrop) {
          return zone.price;
        }
      }
    }
    return null;
  };

  const getVehiclePriceForDistance = (vehicle, mi) => {
    if (!vehicle?.slabs?.length) return 0;
    const slabs = [...vehicle.slabs].sort((a, b) => a.from - b.from);
    let total = 0,
      remain = mi;
    for (const slab of slabs) {
      if (remain <= 0) break;
      const span = slab.to - slab.from;
      const used = Math.min(remain, span);
      total += used * (slab.pricePerMile || 0);
      remain -= used;
    }
    return total;
  };

  // Enhanced postcode matching with better bidirectional support
  const findPostcodePrice = (pickupPostcode, dropoffPostcode, vehicleName) => {
    if (!pickupPostcode || !dropoffPostcode) return null;

    // First try exact match (pickup -> dropoff)
    let match = postcodePrices.find(p =>
      p.pickup === pickupPostcode && p.dropoff === dropoffPostcode
    );

    // If no exact match, try reverse (dropoff -> pickup) for bidirectional pricing
    if (!match) {
      match = postcodePrices.find(p =>
        p.pickup === dropoffPostcode && p.dropoff === pickupPostcode
      );
    }

    if (match) {
      // Return vehicle-specific rate or general price
      return match.vehicleRates?.[vehicleName] || match.price || 0;
    }

    return null;
  };

  /* ────────────────────── duplicate‑call guard ────────────────────── */
  const lastLookup = useRef({ pickup: '', dropoff: '' });

  /* ────────────────────── core calculation (debounced) ────────────────────── */
  const calculateFare = useCallback(
    debounce(async (pick, drop) => {
      /* Prevent double fetch for identical addresses */
      if (
        pick === lastLookup.current.pickup &&
        drop === lastLookup.current.dropoff
      )
        return;
      lastLookup.current = { pickup: pick, dropoff: drop };

      const origin = pick.split(' - ').pop().trim();
      const destination = drop.split(' - ').pop().trim();
      const pp = extractPostcode(pick);
      const dp = extractPostcode(drop);

      /* ── coordinate look‑ups ── */
      const [pCoord, dCoord] = await Promise.all([
        triggerGeocode(origin).unwrap().then((r) => r?.location ?? null),
        triggerGeocode(destination).unwrap().then((r) => r?.location ?? null),
      ]);
      setPickupCoords([pCoord]);
      setDropoffCoords([dCoord]);

      /* ── distance look‑up ── */
      const distRes = await triggerDistance({ origin, destination }).unwrap();
      const dText = distRes?.distanceText ?? '';
      const tText = distRes?.durationText ?? '';
      setDistanceText(dText);
      setDurationText(tText);

      const mi = dText.includes('km')
        ? +(parseFloat(dText) * 0.621371).toFixed(2)
        : +(parseFloat(dText) || 0);
      setMiles(mi);

      /* ── base‑fare calc ── */
      const vehicleCfg = allVehicles.find(
        (v) => v.vehicleName === selectedVehicle?.vehicleName,
      ) || { percentageIncrease: 0 };
      const markupPct = +vehicleCfg.percentageIncrease;

      let baseFare = 0;
      let modeUsed = '';

      if (mode === 'Hourly') {
        const match = hourlyRates.find(
          (r) =>
            r.distance === selectedHourly?.value?.distance &&
            r.hours === selectedHourly?.value?.hours,
        );
        baseFare = match?.vehicleRates?.[selectedVehicle.vehicleName] || 0;
        modeUsed = 'hourly';
      } else {
        // Enhanced postcode pricing with bidirectional support
        const postcodePrice = findPostcodePrice(pp, dp, selectedVehicle.vehicleName);

        if (postcodePrice !== null) {
          baseFare = postcodePrice;
          modeUsed = 'postcode';
        } else {
          // Check zone pricing (already has bidirectional support)
          const zPrice = getZonePrice([pCoord], [dCoord]);
          if (zPrice) {
            baseFare = zPrice;
            modeUsed = 'zone';
          } else {
            // Fall back to mileage-based pricing
            baseFare = getVehiclePriceForDistance(selectedVehicle, mi);
            modeUsed = 'mileage';
          }
        }

        // Apply vehicle markup
        baseFare += (baseFare * markupPct) / 100;
      }

      /* ── optional fees ── */
      const airportPickupFee =
        includeAirportFees && isAirport(pick) ? generalPricing?.pickupAirportPrice || 0 : 0;
      const airportDropoffFee =
        includeAirportFees && isAirport(drop) ? generalPricing?.dropoffAirportPrice || 0 : 0;
      const childSeatFee = includeChildSeat
        ? (generalPricing?.childSeatPrice || 0) * childSeatCount
        : 0;

      /* ── discount / surcharge ── */
      let surchargeVal = 0,
        discountVal = 0;

      if (discounts?.length && journeyDateTime) {
        const discount = discounts.find(
          (d) =>
            d.status === 'Active' &&
            d.category === 'Discount' &&
            new Date(d.fromDate) <= journeyDateTime &&
            new Date(d.toDate) >= journeyDateTime,
        );
        const surcharge = discounts.find(
          (d) =>
            d.status === 'Active' &&
            d.category === 'Surcharge' &&
            new Date(d.fromDate) <= journeyDateTime &&
            new Date(d.toDate) >= journeyDateTime,
        );

        if (discount?.discountPrice) {
          discountVal = (baseFare * parseFloat(discount.discountPrice)) / 100;
        }
        if (surcharge?.surchargePrice) {
          surchargeVal = (baseFare * parseFloat(surcharge.surchargePrice)) / 100;
        }
      }

      /* ── final total ── */
      const total =
        baseFare +
        dropOffPrice +
        airportPickupFee +
        airportDropoffFee +
        childSeatFee +
        surchargeVal -
        discountVal;

      setCalculatedFare(+total.toFixed(2));
      setPricingMode(modeUsed);
      setBreakdown({
        baseFare: +baseFare.toFixed(2),
        dropOffPrice: +dropOffPrice.toFixed(2),
        airportPickupFee: +airportPickupFee.toFixed(2),
        airportDropoffFee: +airportDropoffFee.toFixed(2),
        childSeatFee: +childSeatFee.toFixed(2),
        surchargeVal: +surchargeVal.toFixed(2),
        discountVal: +discountVal.toFixed(2),
        pricingMode: modeUsed,
        distanceText: dText,
        durationText: tText,
      });
    }, 600), // 600 ms debounce
    [
      allVehicles,
      childSeatCount,
      discounts,
      fixedPrices,
      generalPricing,
      hourlyRates,
      includeAirportFees,
      includeChildSeat,
      mode,
      postcodePrices,
      selectedHourly,
      selectedVehicle,
      triggerDistance,
      triggerGeocode,
      journeyDateTime,
      dropOffPrice,
    ],
  );

  /* ────────────────────── orchestrator effect ────────────────────── */
  useEffect(() => {
    if (
      !selectedVehicle ||
      !isValidAddress(pickup) ||
      !isValidAddress(dropoff)
    )
      return;

    calculateFare(pickup, dropoff);
  }, [pickup, dropoff, calculateFare, selectedVehicle]);

  /* ────────────────────── cleanup (cancel debounce) ────────────────────── */
  useEffect(() => () => calculateFare.cancel(), [calculateFare]);

  return {
    calculatedFare,
    pricingMode,
    breakdown,
    distanceText,
    durationText,
    miles,
    pickupCoords,
    dropoffCoords,
  };
};