// import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
// import { useLazyGetDistanceQuery, useLazyGeocodeQuery } from "../redux/api/googleApi";
// import { useGetAllHourlyRatesQuery } from "../redux/api/hourlyPricingApi";
// import { useFetchAllPostcodePricesWidgetQuery } from "../redux/api/postcodePriceApi";
// import { useGetFixedPricesForWidgetQuery, useGetExtrasForWidgetQuery } from "../redux/api/fixedPriceApi";
// import { useGetAllVehiclesQuery } from "../redux/api/vehicleApi";
// import { useGetGeneralPricingPublicQuery } from "../redux/api/generalPricingApi";
// import { useGetDiscountsByCompanyIdQuery } from "../redux/api/discountApi";
// import { useGetBookingSettingQuery } from "../redux/api/bookingSettingsApi";
// import { toast } from "react-toastify";

// // Cache for geocoding results
// const geocodeCache = new Map();
// const distanceCache = new Map();

// export const useBookingFare = ({
//   companyId,
//   pickup,
//   dropoff,
//   selectedVehicle,
//   mode,
//   selectedHourly,
//   dropOffPrice = 0,
//   includeChildSeat = false,
//   childSeatCount = 0,
//   zoneFee = 0,
//   journeyDateTime = null
// }) => {
//   const hasErrorShown = useRef(false);
//   const [triggerGeocode] = useLazyGeocodeQuery();
//   const [triggerDistance] = useLazyGetDistanceQuery();

//   // Add ref to prevent multiple simultaneous calls
//   const isCalculating = useRef(false);
//   const lastCalculationKey = useRef('');

//   const { data: hourlyRates = [] } = useGetAllHourlyRatesQuery(companyId, { skip: !companyId });
//   const { data: postcodePrices = [] } = useFetchAllPostcodePricesWidgetQuery(companyId, { skip: !companyId });
//   const { data: fixedPrices = [] } = useGetFixedPricesForWidgetQuery(companyId, { skip: !companyId });
//   const { data: allVehicles = [] } = useGetAllVehiclesQuery();
//   const { data: generalPricing = {} } = useGetGeneralPricingPublicQuery(companyId, { skip: !companyId });
//   const { data: discounts = [] } = useGetDiscountsByCompanyIdQuery(companyId, { skip: !companyId });
//   const { data: extrasPricing = [] } = useGetExtrasForWidgetQuery(companyId, { skip: !companyId });
//   const { data: bookingSettings = {} } = useGetBookingSettingQuery(undefined, { skip: !companyId });

//   const avoidRoutes = bookingSettings?.avoidRoutes || {};
//   const isAvoidActive = !!(avoidRoutes?.highways || avoidRoutes?.tolls || avoidRoutes?.ferries);

//   const [distanceText, setDistanceText] = useState('');
//   const [durationText, setDurationText] = useState('');
//   const [miles, setMiles] = useState(0);
//   const [pickupCoords, setPickupCoords] = useState([]);
//   const [dropoffCoords, setDropoffCoords] = useState([]);
//   const [calculatedFare, setCalculatedFare] = useState(0);
//   const [pricingMode, setPricingMode] = useState('');
//   const [breakdown, setBreakdown] = useState({});
//   const [hourlyError, setHourlyError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   // Debug extrasPricing data
//   useEffect(() => {
//     console.log('=== EXTRAS PRICING DEBUG ===');
//     console.log('extrasPricing:', extrasPricing);
//     console.log('extrasPricing length:', extrasPricing?.length);
//     console.log('extrasPricing type:', typeof extrasPricing);
//     console.log('Is array:', Array.isArray(extrasPricing));

//     if (extrasPricing && extrasPricing.length > 0) {
//       console.log('Sample zone structure:', extrasPricing[0]);
//       console.log('Sample zone coordinates:', extrasPricing[0]?.coordinates);
//       console.log('Sample zone price:', extrasPricing[0]?.price);
//     }
//     console.log('=== END EXTRAS PRICING DEBUG ===');
//   }, [extrasPricing]);

//   const isValidAddress = (address) => {
//     return typeof address === 'string' && address.trim().length > 5 && /[a-zA-Z0-9]/.test(address);
//   };

//   // Memoize helper functions to prevent recreating them on every render
//   const extractPostcode = useCallback((address) => {
//     const match = address?.match(/\b[A-Z]{1,2}\d{1,2}[A-Z]?\b/i);
//     return match ? match[0].toUpperCase() : null;
//   }, []);

//   const getLatLng = useCallback(async (address) => {
//     if (!address) return null;

//     // Check cache first
//     if (geocodeCache.has(address)) {
//       return geocodeCache.get(address);
//     }

//     try {
//       const res = await triggerGeocode(address).unwrap();
//       const location = res?.location || null;

//       // Cache the result
//       geocodeCache.set(address, location);
//       return location;
//     } catch (error) {
//       console.error('Geocoding error:', error);
//       return null;
//     }
//   }, [triggerGeocode]);

//   const getDistance = useCallback(async (origin, destination) => {
//     const parts = [];
//     if (avoidRoutes.highways) parts.push('highways');
//     if (avoidRoutes.tolls) parts.push('tolls');
//     if (avoidRoutes.ferries) parts.push('ferries');
//     const avoidParam = parts.join('|');

//     const cacheKey = `${origin}-${destination}-${avoidParam}`;
//     if (distanceCache.has(cacheKey)) return distanceCache.get(cacheKey);

//     try {
//       const res = await triggerDistance({ origin, destination, avoid: avoidParam, companyId }).unwrap();
//       distanceCache.set(cacheKey, res);
//       return res;
//     } catch {
//       return null;
//     }
//   }, [triggerDistance, avoidRoutes.highways, avoidRoutes.tolls, avoidRoutes.ferries, companyId]);

//   const getVehiclePriceForDistance = useCallback((vehicle, miles) => {
//     if (!vehicle?.slabs || !Array.isArray(vehicle.slabs)) return 0;
//     let total = 0;
//     let remaining = miles;
//     const slabs = [...vehicle.slabs].sort((a, b) => a.from - b.from);
//     for (const slab of slabs) {
//       if (remaining <= 0) break;
//       const slabDistance = slab.to - slab.from;
//       const useMiles = Math.min(remaining, slabDistance);
//       total += useMiles * (slab.pricePerMile || 0);
//       remaining -= useMiles;
//     }
//     return total;
//   }, []);

//   // ZONE PRICES WITH UPDATED SYNC METHOD START
//   const EPS = 1e-6; // ~ few cm/low meters tolerance in degrees

//   const isPointOnSegment = (p, a, b) => {
//     const cross = (p.lng - a.lng) * (b.lat - a.lat) - (p.lat - a.lat) * (b.lng - a.lng);
//     if (Math.abs(cross) > EPS) return false;
//     const dot = (p.lng - a.lng) * (b.lng - a.lng) + (p.lat - a.lat) * (b.lat - a.lat);
//     if (dot < -EPS) return false;
//     const lenSq = (b.lng - a.lng) ** 2 + (b.lat - a.lat) ** 2;
//     if (dot - lenSq > EPS) return false;
//     return true;
//   };

//   const pointInPolygon = useCallback((point, poly = []) => {
//     if (!point || !Array.isArray(poly) || poly.length < 3) {
//       console.log('pointInPolygon: Invalid input data');
//       return false;
//     }

//     // Validate coordinates
//     const validPoly = poly.filter(coord => 
//       coord && 
//       typeof coord.lat === 'number' && 
//       typeof coord.lng === 'number' && 
//       !isNaN(coord.lat) && 
//       !isNaN(coord.lng)
//     );

//     if (validPoly.length < 3) {
//       console.log('pointInPolygon: Not enough valid coordinates');
//       return false;
//     }

//     // Quick reject with bbox to save time
//     let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
//     for (const c of validPoly) {
//       if (c.lat < minLat) minLat = c.lat;
//       if (c.lat > maxLat) maxLat = c.lat;
//       if (c.lng < minLng) minLng = c.lng;
//       if (c.lng > maxLng) maxLng = c.lng;
//     }

//     if (
//       point.lat < minLat - EPS || point.lat > maxLat + EPS ||
//       point.lng < minLng - EPS || point.lng > maxLng + EPS
//     ) {
//       return false;
//     }

//     // on-edge = inside
//     for (let i = 0, j = validPoly.length - 1; i < validPoly.length; j = i++) {
//       if (isPointOnSegment(point, validPoly[j], validPoly[i])) return true;
//     }

//     // ray casting
//     let inside = false;
//     for (let i = 0, j = validPoly.length - 1; i < validPoly.length; j = i++) {
//       const xi = validPoly[i].lng, yi = validPoly[i].lat;
//       const xj = validPoly[j].lng, yj = validPoly[j].lat;
//       const intersect =
//         ((yi > point.lat) !== (yj > point.lat)) &&
//         (point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi + 0.0) + xi);
//       if (intersect) inside = !inside;
//     }
//     return inside;
//   }, []);

//   // replace your old isWithinZone with this:
//   const isWithinZone = useCallback((point, zoneCoords) => pointInPolygon(point, zoneCoords), [pointInPolygon]);

//   const getZonePrice = useCallback((pickupCoord, dropoffCoord) => {
//     for (const zone of fixedPrices) {
//       const direction = (zone.direction || '').toLowerCase();

//       const pickupInPickupZone = isWithinZone(pickupCoord, zone.pickupCoordinates);
//       const dropoffInDropoffZone = isWithinZone(dropoffCoord, zone.dropoffCoordinates);

//       const pickupInDropoffZone = isWithinZone(pickupCoord, zone.dropoffCoordinates);
//       const dropoffInPickupZone = isWithinZone(dropoffCoord, zone.pickupCoordinates);

//       if (direction === 'both ways') {
//         if ((pickupInPickupZone && dropoffInDropoffZone) || (pickupInDropoffZone && dropoffInPickupZone)) {
//           return zone.price;
//         }
//       } else if (direction === 'one way') {
//         if (pickupInPickupZone && dropoffInDropoffZone) {
//           return zone.price;
//         }
//       }
//     }
//     return null;
//   }, [fixedPrices, isWithinZone]);

//   // MAIN FIX: Updated getZoneEntryFee function
//   const getZoneEntryFee = useCallback((pickupCoord, dropoffCoord) => {
//     console.log('\n=== ZONE ENTRY FEE CALCULATION START ===');
//     console.log('Pickup Coord:', pickupCoord);
//     console.log('Dropoff Coord:', dropoffCoord);
//     console.log('Extras Pricing Data Length:', extrasPricing?.length);

//     // Validate inputs
//     if (!pickupCoord || !dropoffCoord) {
//       console.log('Missing coordinates - returning 0');
//       return 0;
//     }

//     if (!extrasPricing || !Array.isArray(extrasPricing) || extrasPricing.length === 0) {
//       console.log('No extrasPricing data - returning 0');
//       return 0;
//     }

//     let totalZoneFee = 0;
//     const matchedZones = [];

//     extrasPricing.forEach((zone, index) => {
//       console.log(`\n--- Checking Zone ${index + 1}: ${zone.zone} ---`);
//       console.log('Zone Price:', zone.price, '(Type:', typeof zone.price, ')');
//       console.log('Coordinates Count:', zone.coordinates?.length);

//       // Validate zone data
//       if (!zone.coordinates || !Array.isArray(zone.coordinates) || zone.coordinates.length < 3) {
//         console.log(`Skipping zone ${zone.zone} - invalid coordinates`);
//         return;
//       }

//       // Validate and parse price
//       const zonePrice = parseFloat(zone.price);
//       if (isNaN(zonePrice) || zonePrice <= 0) {
//         console.log(`Skipping zone ${zone.zone} - invalid price: ${zone.price}`);
//         return;
//       }

//       // Check coordinates format
//       const hasValidCoords = zone.coordinates.every(coord => 
//         coord && 
//         typeof coord.lat === 'number' && 
//         typeof coord.lng === 'number' && 
//         !isNaN(coord.lat) && 
//         !isNaN(coord.lng)
//       );

//       if (!hasValidCoords) {
//         console.log(`Skipping zone ${zone.zone} - invalid coordinate format`);
//         console.log('Coordinate sample:', zone.coordinates[0]);
//         return;
//       }

//       // Check if pickup is in this zone
//       const pickupInZone = pointInPolygon(pickupCoord, zone.coordinates);
//       console.log(`Pickup in ${zone.zone}:`, pickupInZone);

//       // Check if dropoff is in this zone
//       const dropoffInZone = pointInPolygon(dropoffCoord, zone.coordinates);
//       console.log(`Dropoff in ${zone.zone}:`, dropoffInZone);

//       if (pickupInZone || dropoffInZone) {
//         console.log(`✅ ZONE MATCH! ${zone.zone} - Price: ${zonePrice}`);

//         matchedZones.push({
//           zone: zone.zone,
//           price: zonePrice,
//           pickupInZone,
//           dropoffInZone
//         });

//         totalZoneFee += zonePrice;
//       } else {
//         console.log(`No match for ${zone.zone}`);
//       }
//     });

//     console.log('\n=== ZONE ENTRY FEE RESULTS ===');
//     console.log('Matched Zones:', matchedZones);
//     console.log('Total Zone Entry Fee:', totalZoneFee);
//     console.log('=== END ZONE ENTRY FEE CALCULATION ===\n');

//     return totalZoneFee;
//   }, [extrasPricing, pointInPolygon]);

//   const getValidDynamicPricing = useCallback(() => {
//     if (!Array.isArray(discounts) || !journeyDateTime) return 0;
//     for (let item of discounts) {
//       const from = new Date(item.fromDate);
//       const to = new Date(item.toDate);
//       if (item.status === "Active" && from <= journeyDateTime && to >= journeyDateTime) {
//         if (item.category === "Surcharge" && item.surchargePrice > 0) return item.surchargePrice;
//         if (item.category === "Discount" && item.discountPrice > 0) return -item.discountPrice;
//       }
//     }
//     return 0;
//   }, [discounts, journeyDateTime]);

//   // Create a memoized calculation key to prevent unnecessary recalculations
//   const calculationKey = useMemo(() => {
//     return JSON.stringify({
//       pickup,
//       dropoff,
//       vehicleName: selectedVehicle?.vehicleName,
//       mode,
//       selectedHourly: selectedHourly?.value,
//       dropOffPrice,
//       includeChildSeat,
//       childSeatCount,
//       zoneFee,
//       journeyDateTime: journeyDateTime?.getTime(),
//       avoid: {
//         highways: !!avoidRoutes.highways,
//         tolls: !!avoidRoutes.tolls,
//         ferries: !!avoidRoutes.ferries
//       }
//     });
//   }, [
//     pickup,
//     dropoff,
//     selectedVehicle?.vehicleName,
//     mode,
//     selectedHourly?.value,
//     dropOffPrice,
//     includeChildSeat,
//     childSeatCount,
//     zoneFee,
//     journeyDateTime,
//     avoidRoutes
//   ]);

//   // Debounced calculation function
//   const calculateFare = useCallback(async () => {
//     // Prevent multiple simultaneous calculations
//     if (isCalculating.current || !pickup || !dropoff || !selectedVehicle) return;

//     if (!isValidAddress(pickup) || !isValidAddress(dropoff)) {
//       if (!hasErrorShown.current) {
//         toast.error("Invalid address entered. Please use a complete location.");
//         hasErrorShown.current = true;
//       }
//       return;
//     }

//     // Check if we already calculated for this set of parameters
//     if (lastCalculationKey.current === calculationKey) {
//       return;
//     }

//     isCalculating.current = true;
//     lastCalculationKey.current = calculationKey;
//     setIsLoading(true);

//     try {
//       const origin = pickup.includes(" - ") ? pickup.split(" - ").pop().trim() : pickup;
//       const destination = dropoff.includes(" - ") ? dropoff.split(" - ").pop().trim() : dropoff;
//       const pickupPostcode = extractPostcode(pickup);
//       const dropoffPostcode = extractPostcode(dropoff);
//       const isAirportJourney = pickup.toLowerCase().includes('airport') || dropoff.toLowerCase().includes('airport');
//       const isPickupAirport = pickup.toLowerCase().includes('airport');
//       const isDropoffAirport = dropoff.toLowerCase().includes('airport');

//       const pickupAirportFee = isPickupAirport ? parseFloat(generalPricing?.pickupAirportPrice || 0) : 0;
//       const dropoffAirportFee = isDropoffAirport ? parseFloat(generalPricing?.dropoffAirportPrice || 0) : 0;
//       const totalAirportFee = pickupAirportFee + dropoffAirportFee;

//       // Get coordinates and distance in parallel
//       const [pickupCoord, dropoffCoord, distRes] = await Promise.all([
//         getLatLng(origin),
//         getLatLng(destination),
//         getDistance(origin, destination)
//       ]);

//       if (!pickupCoord || !dropoffCoord || !distRes) {
//         if (!hasErrorShown.current) {
//           toast.error("Unable to get location data. Please check your addresses.");
//           hasErrorShown.current = true;
//         }
//         return;
//       }

//       setPickupCoords([pickupCoord]);
//       setDropoffCoords([dropoffCoord]);

//       const distText = distRes?.distanceText || "";
//       const durText = distRes?.durationText || "";
//       setDistanceText(distText);
//       setDurationText(durText);

//       let totalMiles = 0;
//       if (distText.includes("km")) {
//         const km = parseFloat(distText.replace("km", "").trim());
//         totalMiles = parseFloat((km * 0.621371).toFixed(2));
//       } else if (distText.includes("mi")) {
//         totalMiles = parseFloat(distText.replace("mi", "").trim());
//       }
//       setMiles(totalMiles);

//       let baseFare = 0;
//       let pricing = '';
//       const vehicleName = selectedVehicle?.vehicleName;
//       const matchedVehicle = allVehicles.find(v => v.vehicleName === vehicleName);
//       const markupPercent = parseFloat(matchedVehicle?.percentageIncrease || 0);

//       // Calculate zone entry fee for ALL cases (not just zone pricing)
//       console.log('\n🎯 CALCULATING ZONE ENTRY FEE FOR ALL CASES');
//       const calculatedZoneEntryFee = getZoneEntryFee(pickupCoord, dropoffCoord);
//       console.log('Final Calculated Zone Entry Fee:', calculatedZoneEntryFee);

//       if (mode === "Hourly") {
//         const selected = hourlyRates.find(
//           (r) => r.distance === selectedHourly?.value?.distance && r.hours === selectedHourly?.value?.hours
//         );
//         baseFare = selected?.vehicleRates?.[selectedVehicle.vehicleName] || 0;
//         pricing = 'hourly';
//       } else {
//         if (isAvoidActive) {
//           // Force mileage when avoid flags are on
//           baseFare = getVehiclePriceForDistance(selectedVehicle, totalMiles);
//           pricing = 'mileage';
//         } else {
//           // postcode -> zone -> mileage
//           const postcodeMatch = postcodePrices.find(
//             (p) =>
//             ((p.pickup === pickupPostcode && p.dropoff === dropoffPostcode) ||
//               (p.pickup === dropoffPostcode && p.dropoff === pickupPostcode))
//           );

//           if (postcodeMatch) {
//             baseFare = postcodeMatch.vehicleRates?.[vehicleName] ?? postcodeMatch.price;
//             pricing = 'postcode';
//           } else {
//             const zonePrice = getZonePrice(pickupCoord, dropoffCoord);
//             if (zonePrice !== null) {
//               baseFare = zonePrice;
//               pricing = 'zone';
//             } else {
//               baseFare = getVehiclePriceForDistance(selectedVehicle, totalMiles);
//               pricing = 'mileage';
//             }
//           }
//         }
//       }

//       const markupAmount = (baseFare * markupPercent) / 100;
//       let finalFare = baseFare + markupAmount + totalAirportFee;

//       const surchargePercent = getValidDynamicPricing();
//       const surchargeAmount = (surchargePercent / 100) * baseFare;
//       finalFare += surchargeAmount;

//       const childSeatUnitPrice = includeChildSeat ? parseFloat(generalPricing?.childSeatPrice || 0) : 0;
//       const totalChildSeatCharge = includeChildSeat ? childSeatCount * childSeatUnitPrice : 0;

//       // Add all fees including zone entry fee
//       finalFare += dropOffPrice + totalChildSeatCharge + zoneFee + calculatedZoneEntryFee;

//       console.log('\n💰 FINAL FARE BREAKDOWN:');
//       console.log('- Base Fare:', baseFare);
//       console.log('- Markup Amount:', markupAmount);
//       console.log('- Total Airport Fee:', totalAirportFee);
//       console.log('- Manual Zone Fee (zoneFee prop):', zoneFee);
//       console.log('- Calculated Zone Entry Fee:', calculatedZoneEntryFee);
//       console.log('- Child Seat Charge:', totalChildSeatCharge);
//       console.log('- Drop Off Price:', dropOffPrice);
//       console.log('- Surcharge Amount:', surchargeAmount);
//       console.log('- FINAL TOTAL:', finalFare);

//       const breakdownDetails = {
//         baseFare: parseFloat(baseFare.toFixed(2)),
//         markupAmount: parseFloat(markupAmount.toFixed(2)),
//         pickupAirportFee: parseFloat(pickupAirportFee.toFixed(2)),
//         dropoffAirportFee: parseFloat(dropoffAirportFee.toFixed(2)),
//         totalAirportFee: parseFloat(totalAirportFee.toFixed(2)),
//         dropOffPrice: parseFloat(dropOffPrice.toFixed(2)),
//         childSeatUnitPrice: parseFloat(childSeatUnitPrice.toFixed(2)),
//         childSeatCount,
//         totalChildSeatCharge: parseFloat(totalChildSeatCharge.toFixed(2)),
//         manualZoneFee: parseFloat(zoneFee.toFixed(2)), // Manual zone fee from props
//         calculatedZoneEntryFee: parseFloat(calculatedZoneEntryFee.toFixed(2)), // Auto-calculated from API
//         totalZoneFees: parseFloat((zoneFee + calculatedZoneEntryFee).toFixed(2)), // Combined
//         surchargePercentage: surchargePercent,
//         surchargeAmount: parseFloat(surchargeAmount.toFixed(2)),
//         total: parseFloat(finalFare.toFixed(2)),
//         pricingMode: pricing,
//         distanceText: distText,
//         durationText: durText,
//         avoidRoutes: { ...avoidRoutes },
//         forcedMileage: isAvoidActive
//       };

//       setCalculatedFare(breakdownDetails.total);
//       setPricingMode(pricing);
//       setBreakdown(breakdownDetails);
//       hasErrorShown.current = false;
//     } catch (error) {
//       console.error('Fare calculation error:', error);
//       toast.error("Error calculating fare. Please try again.");
//     } finally {
//       isCalculating.current = false;
//       setIsLoading(false);
//     }
//   }, [
//     pickup,
//     dropoff,
//     selectedVehicle,
//     selectedHourly,
//     mode,
//     dropOffPrice,
//     includeChildSeat,
//     childSeatCount,
//     generalPricing,
//     zoneFee,
//     hourlyRates,
//     postcodePrices,
//     fixedPrices,
//     allVehicles,
//     discounts,
//     journeyDateTime,
//     calculationKey,
//     extractPostcode,
//     getLatLng,
//     getDistance,
//     getVehiclePriceForDistance,
//     getZonePrice,
//     getZoneEntryFee,
//     getValidDynamicPricing,
//     avoidRoutes.highways,
//     avoidRoutes.tolls,
//     avoidRoutes.ferries,
//     companyId
//   ]);

//   // Debounced effect for fare calculation
//   useEffect(() => {
//     const timeoutId = setTimeout(() => {
//       calculateFare();
//     }, 300); // 300ms debounce

//     return () => clearTimeout(timeoutId);
//   }, [calculationKey, calculateFare]);

//   // Hourly Error Logic
//   useEffect(() => {
//     if (mode === "Hourly" && selectedHourly?.value?.distance && miles) {
//       const original = selectedHourly.value;
//       const actualMiles = miles;

//       if (actualMiles > Number(original.distance)) {
//         const warningMsg = `You've selected ${original.distance} miles for ${original.hours} hours, but your trip is ${actualMiles} miles. Prices are shown for your selected package. Extra charges may apply.`;
//         setHourlyError(warningMsg);
//       } else {
//         setHourlyError('');
//       }
//     }
//   }, [mode, selectedHourly, miles]);

//   // Cleanup function to clear caches periodically
//   useEffect(() => {
//     const cleanup = () => {
//       if (geocodeCache.size > 100) {
//         geocodeCache.clear();
//       }
//       if (distanceCache.size > 100) {
//         distanceCache.clear();
//       }
//     };

//     const interval = setInterval(cleanup, 300000);
//     return () => clearInterval(interval);
//   }, []);

//   return {
//     calculatedFare,
//     pricingMode,
//     breakdown,
//     distanceText,
//     durationText,
//     miles,
//     pickupCoords,
//     dropoffCoords,
//     hourlyError,
//     isLoading,
//     avoidRoutes,
//   };
// };














import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useLazyGetDistanceQuery, useLazyGeocodeQuery } from "../redux/api/googleApi";
import { useGetAllHourlyRatesQuery } from "../redux/api/hourlyPricingApi";
import { useFetchAllPostcodePricesWidgetQuery } from "../redux/api/postcodePriceApi";
import { useGetFixedPricesForWidgetQuery, useGetExtrasForWidgetQuery } from "../redux/api/fixedPriceApi";
import { useGetAllVehiclesQuery } from "../redux/api/vehicleApi";
import { useGetGeneralPricingPublicQuery } from "../redux/api/generalPricingApi";
import { useGetDiscountsByCompanyIdQuery } from "../redux/api/discountApi";
import { useGetBookingSettingQuery } from "../redux/api/bookingSettingsApi";
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
  const { data: bookingSettings = {} } = useGetBookingSettingQuery(undefined, { skip: !companyId });

  const avoidRoutes = bookingSettings?.avoidRoutes || {};
  const isAvoidActive = !!(avoidRoutes?.highways || avoidRoutes?.tolls || avoidRoutes?.ferries);

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

  // Debug extrasPricing data
  useEffect(() => {
    console.log('=== EXTRAS PRICING DEBUG ===');
    console.log('extrasPricing:', extrasPricing);
    console.log('extrasPricing length:', extrasPricing?.length);
    console.log('extrasPricing type:', typeof extrasPricing);
    console.log('Is array:', Array.isArray(extrasPricing));

    if (extrasPricing && extrasPricing.length > 0) {
      console.log('Sample zone structure:', extrasPricing[0]);
      console.log('Sample zone coordinates:', extrasPricing[0]?.coordinates);
      console.log('Sample zone price:', extrasPricing[0]?.price);
    }
    console.log('=== END EXTRAS PRICING DEBUG ===');
  }, [extrasPricing]);

  // Mashhood Working
  // const isValidAddress = (address) => {
  //   return typeof address === 'string' && address.trim().length > 5 && /[a-zA-Z0-9]/.test(address);
  // };

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
    const parts = [];
    if (avoidRoutes.highways) parts.push('highways');
    if (avoidRoutes.tolls) parts.push('tolls');
    if (avoidRoutes.ferries) parts.push('ferries');
    const avoidParam = parts.join('|');

    const cacheKey = `${origin}-${destination}-${avoidParam}`;
    if (distanceCache.has(cacheKey)) return distanceCache.get(cacheKey);

    try {
      const res = await triggerDistance({ origin, destination, avoid: avoidParam, companyId }).unwrap();
      distanceCache.set(cacheKey, res);
      return res;
    } catch {
      return null;
    }
  }, [triggerDistance, avoidRoutes.highways, avoidRoutes.tolls, avoidRoutes.ferries, companyId]);

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

  // ZONE PRICES WITH UPDATED SYNC METHOD START
  const EPS = 1e-6; // ~ few cm/low meters tolerance in degrees

  const isPointOnSegment = (p, a, b) => {
    const cross = (p.lng - a.lng) * (b.lat - a.lat) - (p.lat - a.lat) * (b.lng - a.lng);
    if (Math.abs(cross) > EPS) return false;
    const dot = (p.lng - a.lng) * (b.lng - a.lng) + (p.lat - a.lat) * (b.lat - a.lat);
    if (dot < -EPS) return false;
    const lenSq = (b.lng - a.lng) ** 2 + (b.lat - a.lat) ** 2;
    if (dot - lenSq > EPS) return false;
    return true;
  };

  const pointInPolygon = useCallback((point, poly = []) => {
    if (!point || !Array.isArray(poly) || poly.length < 3) {
      console.log('pointInPolygon: Invalid input data');
      return false;
    }

    // Validate coordinates
    const validPoly = poly.filter(coord =>
      coord &&
      typeof coord.lat === 'number' &&
      typeof coord.lng === 'number' &&
      !isNaN(coord.lat) &&
      !isNaN(coord.lng)
    );

    if (validPoly.length < 3) {
      console.log('pointInPolygon: Not enough valid coordinates');
      return false;
    }

    // Quick reject with bbox to save time
    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
    for (const c of validPoly) {
      if (c.lat < minLat) minLat = c.lat;
      if (c.lat > maxLat) maxLat = c.lat;
      if (c.lng < minLng) minLng = c.lng;
      if (c.lng > maxLng) maxLng = c.lng;
    }

    if (
      point.lat < minLat - EPS || point.lat > maxLat + EPS ||
      point.lng < minLng - EPS || point.lng > maxLng + EPS
    ) {
      return false;
    }

    // on-edge = inside
    for (let i = 0, j = validPoly.length - 1; i < validPoly.length; j = i++) {
      if (isPointOnSegment(point, validPoly[j], validPoly[i])) return true;
    }

    // ray casting
    let inside = false;
    for (let i = 0, j = validPoly.length - 1; i < validPoly.length; j = i++) {
      const xi = validPoly[i].lng, yi = validPoly[i].lat;
      const xj = validPoly[j].lng, yj = validPoly[j].lat;
      const intersect =
        ((yi > point.lat) !== (yj > point.lat)) &&
        (point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi + 0.0) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }, []);

  // replace your old isWithinZone with this:
  const isWithinZone = useCallback((point, zoneCoords) => pointInPolygon(point, zoneCoords), [pointInPolygon]);

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

  // MAIN FIX: Updated getZoneEntryFee function
  const getZoneEntryFee = useCallback((pickupCoord, dropoffCoord) => {
    console.log('\n=== ZONE ENTRY FEE CALCULATION START ===');
    console.log('Pickup Coord:', pickupCoord);
    console.log('Dropoff Coord:', dropoffCoord);
    console.log('Extras Pricing Data Length:', extrasPricing?.length);

    // Validate inputs
    if (!pickupCoord || !dropoffCoord) {
      console.log('Missing coordinates - returning 0');
      return 0;
    }

    if (!extrasPricing || !Array.isArray(extrasPricing) || extrasPricing.length === 0) {
      console.log('No extrasPricing data - returning 0');
      return 0;
    }

    let totalZoneFee = 0;
    const matchedZones = [];

    extrasPricing.forEach((zone, index) => {
      console.log(`\n--- Checking Zone ${index + 1}: ${zone.zone} ---`);
      console.log('Zone Price:', zone.price, '(Type:', typeof zone.price, ')');
      console.log('Coordinates Count:', zone.coordinates?.length);

      // Validate zone data
      if (!zone.coordinates || !Array.isArray(zone.coordinates) || zone.coordinates.length < 3) {
        console.log(`Skipping zone ${zone.zone} - invalid coordinates`);
        return;
      }

      // Validate and parse price
      const zonePrice = parseFloat(zone.price);
      if (isNaN(zonePrice) || zonePrice <= 0) {
        console.log(`Skipping zone ${zone.zone} - invalid price: ${zone.price}`);
        return;
      }

      // Check coordinates format
      const hasValidCoords = zone.coordinates.every(coord =>
        coord &&
        typeof coord.lat === 'number' &&
        typeof coord.lng === 'number' &&
        !isNaN(coord.lat) &&
        !isNaN(coord.lng)
      );

      if (!hasValidCoords) {
        console.log(`Skipping zone ${zone.zone} - invalid coordinate format`);
        console.log('Coordinate sample:', zone.coordinates[0]);
        return;
      }

      // Check if pickup is in this zone
      const pickupInZone = pointInPolygon(pickupCoord, zone.coordinates);
      console.log(`Pickup in ${zone.zone}:`, pickupInZone);

      // Check if dropoff is in this zone
      const dropoffInZone = pointInPolygon(dropoffCoord, zone.coordinates);
      console.log(`Dropoff in ${zone.zone}:`, dropoffInZone);

      if (pickupInZone || dropoffInZone) {
        console.log(`✅ ZONE MATCH! ${zone.zone} - Price: ${zonePrice}`);

        matchedZones.push({
          zone: zone.zone,
          price: zonePrice,
          pickupInZone,
          dropoffInZone
        });

        totalZoneFee += zonePrice;
      } else {
        console.log(`No match for ${zone.zone}`);
      }
    });

    console.log('\n=== ZONE ENTRY FEE RESULTS ===');
    console.log('Matched Zones:', matchedZones);
    console.log('Total Zone Entry Fee:', totalZoneFee);
    console.log('=== END ZONE ENTRY FEE CALCULATION ===\n');

    return totalZoneFee;
  }, [extrasPricing, pointInPolygon]);

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
      journeyDateTime: journeyDateTime?.getTime(),
      avoid: {
        highways: !!avoidRoutes.highways,
        tolls: !!avoidRoutes.tolls,
        ferries: !!avoidRoutes.ferries
      }
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
    journeyDateTime,
    avoidRoutes
  ]);

  // FIXED: Get percentage increase from vehicle data
  const getVehiclePercentage = useCallback((vehicleName) => {
    const matchedVehicle = allVehicles.find(v => v.vehicleName === vehicleName);
    if (!matchedVehicle) return 0;

    const raw = matchedVehicle.percentageIncrease ?? 0;

    // Handle string percentage values (e.g., "20%")
    const cleanPercentage = typeof raw === "string"
      ? Number(raw.replace("%", ""))
      : Number(raw);

    const percentage = isNaN(cleanPercentage) ? 0 : cleanPercentage;

    console.log(`🔢 Vehicle: ${vehicleName}, Raw percentage: ${raw}, Clean percentage: ${percentage}`);
    return percentage;
  }, [allVehicles]);

  // Debounced calculation function
  const calculateFare = useCallback(async () => {
    // Prevent multiple simultaneous calculations
    if (isCalculating.current || !pickup || !dropoff || !selectedVehicle) return;

    // Mashhood Working
    // if (!isValidAddress(pickup) || !isValidAddress(dropoff)) {
    //   if (!hasErrorShown.current) {
    //     toast.error("Invalid address entered. Please use a complete location.");
    //     hasErrorShown.current = true;
    //   }
    //   return;
    // }

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
      const isPickupAirport = pickup.toLowerCase().includes('airport');
      const isDropoffAirport = dropoff.toLowerCase().includes('airport');

      const pickupAirportFee = isPickupAirport ? parseFloat(generalPricing?.pickupAirportPrice || 0) : 0;
      const dropoffAirportFee = isDropoffAirport ? parseFloat(generalPricing?.dropoffAirportPrice || 0) : 0;
      const totalAirportFee = pickupAirportFee + dropoffAirportFee;

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
      const vehicleName = selectedVehicle?.vehicleName;

      // FIXED: Get percentage for this vehicle
      const markupPercent = getVehiclePercentage(vehicleName);

      // Calculate zone entry fee for ALL cases (not just zone pricing)
      console.log('\n🎯 CALCULATING ZONE ENTRY FEE FOR ALL CASES');
      const calculatedZoneEntryFee = getZoneEntryFee(pickupCoord, dropoffCoord);
      console.log('Final Calculated Zone Entry Fee:', calculatedZoneEntryFee);

      if (mode === "Hourly") {
        const selected = hourlyRates.find(
          (r) => r.distance === selectedHourly?.value?.distance && r.hours === selectedHourly?.value?.hours
        );
        baseFare = selected?.vehicleRates?.[selectedVehicle.vehicleName] || 0;
        pricing = 'hourly';

        console.log(`💰 HOURLY PRICING - Base: ${baseFare}, No markup applied for hourly`);
      } else {
        if (isAvoidActive) {
          // Force mileage when avoid flags are on
          baseFare = getVehiclePriceForDistance(selectedVehicle, totalMiles);
          pricing = 'mileage';
          console.log(`💰 MILEAGE PRICING (Avoid Active) - Base: ${baseFare}, Markup: ${markupPercent}%`);
        } else {
          // postcode -> zone -> mileage priority
          const postcodeMatch = postcodePrices.find(
            (p) =>
            ((p.pickup === pickupPostcode && p.dropoff === dropoffPostcode) ||
              (p.pickup === dropoffPostcode && p.dropoff === pickupPostcode))
          );

          if (postcodeMatch) {
            baseFare = postcodeMatch.vehicleRates?.[vehicleName] ?? postcodeMatch.price;
            pricing = 'postcode';
            console.log(`💰 POSTCODE PRICING - Base: ${baseFare}, Markup: ${markupPercent}%`);
          } else {
            const zonePrice = getZonePrice(pickupCoord, dropoffCoord);
            if (zonePrice !== null) {
              baseFare = zonePrice;
              pricing = 'zone';
              console.log(`💰 ZONE PRICING - Base: ${baseFare}, Markup: ${markupPercent}%`);
            } else {
              baseFare = getVehiclePriceForDistance(selectedVehicle, totalMiles);
              pricing = 'mileage';
              console.log(`💰 MILEAGE PRICING - Base: ${baseFare}, Markup: ${markupPercent}%`);
            }
          }
        }
      }

      // FIXED: Apply percentage markup correctly based on pricing mode
      let finalBaseFare = baseFare;
      let markupAmount = 0;

      if (pricing === 'hourly') {
        // For hourly mode, no markup is applied
        markupAmount = 0;
        finalBaseFare = baseFare;
      } else if (pricing === 'postcode' || pricing === 'zone') {
        // For postcode and zone pricing, apply markup to base fare
        markupAmount = (baseFare * markupPercent) / 100;
        finalBaseFare = baseFare + markupAmount;
      } else {
        // For mileage pricing, markup is already included in the base calculation
        markupAmount = 0;
        finalBaseFare = baseFare;
      }

      console.log(`🔢 MARKUP CALCULATION:
        - Pricing Mode: ${pricing}
        - Base Fare: ${baseFare}
        - Markup Percent: ${markupPercent}%
        - Markup Amount: ${markupAmount}
        - Final Base Fare: ${finalBaseFare}`);

      // Apply surcharge to the base fare (before markup for consistency)
      const surchargePercent = getValidDynamicPricing();
      const surchargeAmount = (baseFare * surchargePercent) / 100;

      const childSeatUnitPrice = includeChildSeat ? parseFloat(generalPricing?.childSeatPrice || 0) : 0;
      const totalChildSeatCharge = includeChildSeat ? childSeatCount * childSeatUnitPrice : 0;

      // FIXED: Final calculation with proper order
      let finalFare = finalBaseFare + surchargeAmount + totalAirportFee + dropOffPrice + totalChildSeatCharge + zoneFee + calculatedZoneEntryFee;

      console.log('\n💰 FINAL FARE BREAKDOWN:');
      console.log('- Base Fare:', baseFare);
      console.log('- Markup Amount:', markupAmount);
      console.log('- Final Base Fare (after markup):', finalBaseFare);
      console.log('- Surcharge Amount:', surchargeAmount);
      console.log('- Total Airport Fee:', totalAirportFee);
      console.log('- Manual Zone Fee (zoneFee prop):', zoneFee);
      console.log('- Calculated Zone Entry Fee:', calculatedZoneEntryFee);
      console.log('- Child Seat Charge:', totalChildSeatCharge);
      console.log('- Drop Off Price:', dropOffPrice);
      console.log('- FINAL TOTAL:', finalFare);

      const breakdownDetails = {
        baseFare: parseFloat(baseFare.toFixed(2)),
        markupAmount: parseFloat(markupAmount.toFixed(2)),
        markupPercent: markupPercent,
        finalBaseFare: parseFloat(finalBaseFare.toFixed(2)),
        pickupAirportFee: parseFloat(pickupAirportFee.toFixed(2)),
        dropoffAirportFee: parseFloat(dropoffAirportFee.toFixed(2)),
        totalAirportFee: parseFloat(totalAirportFee.toFixed(2)),
        dropOffPrice: parseFloat(dropOffPrice.toFixed(2)),
        childSeatUnitPrice: parseFloat(childSeatUnitPrice.toFixed(2)),
        childSeatCount,
        totalChildSeatCharge: parseFloat(totalChildSeatCharge.toFixed(2)),
        manualZoneFee: parseFloat(zoneFee.toFixed(2)), // Manual zone fee from props
        calculatedZoneEntryFee: parseFloat(calculatedZoneEntryFee.toFixed(2)), // Auto-calculated from API
        totalZoneFees: parseFloat((zoneFee + calculatedZoneEntryFee).toFixed(2)), // Combined
        surchargePercentage: surchargePercent,
        surchargeAmount: parseFloat(surchargeAmount.toFixed(2)),
        total: parseFloat(finalFare.toFixed(2)),
        pricingMode: pricing,
        distanceText: distText,
        durationText: durText,
        avoidRoutes: { ...avoidRoutes },
        forcedMileage: isAvoidActive
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
    getValidDynamicPricing,
    getVehiclePercentage, // Added this dependency
    avoidRoutes.highways,
    avoidRoutes.tolls,
    avoidRoutes.ferries,
    companyId
  ]);

  // Debounced effect for fare calculation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calculateFare();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [calculationKey, calculateFare]);

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
    isLoading,
    avoidRoutes,
  };
};