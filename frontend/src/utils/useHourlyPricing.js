// import { useEffect, useMemo, useState } from "react";
// import { toast } from "react-toastify";

// export const useHourlyPricing = ({
//   mode,
//   primaryJourneyData,
//   dropOffs1,
//   returnJourneyData,
//   dropOffs2,
//   selectedHourly,
//   selectedVehicle,
//   returnJourneyToggle,
//   hourlyPackages,
//   triggerDistance,
// }) => {
//   const [hourlyError, setHourlyError] = useState("");
//   const [returnHourlyError, setReturnHourlyError] = useState("");
//   const [actualMiles, setActualMiles] = useState(null);
//   const [returnActualMiles, setReturnActualMiles] = useState(null);

//   // Generate hourly dropdown options
//   const formattedHourlyOptions = useMemo(() => {
//     return hourlyPackages.map((pkg) => ({
//       label: `${pkg.distance} miles ${pkg.hours} hours`,
//       value: { distance: pkg.distance, hours: pkg.hours },
//     }));
//   }, [hourlyPackages]);

//   // Fetch distance for primary journey
//   useEffect(() => {
//     const fetchDistance = async () => {
//       if (
//         mode !== "Hourly" ||
//         !primaryJourneyData.pickup ||
//         !dropOffs1[0] ||
//         !selectedHourly
//       ) {
//         setHourlyError("");
//         return;
//       }

//       const origin = primaryJourneyData.pickup
//         ?.replace("Custom Input - ", "")
//         .split(" - ")
//         .pop()
//         ?.trim();
//       const destination = dropOffs1[0]
//         ?.replace("Custom Input - ", "")
//         .split(" - ")
//         .pop()
//         ?.trim();

//       if (!origin || !destination) return;

//       try {
//         const res = await triggerDistance({ origin, destination }).unwrap();

//         let miles = 0;
//         if (res?.distanceText?.includes("km")) {
//           const km = parseFloat(res.distanceText.replace("km", "").trim());
//           miles = parseFloat((km * 0.621371).toFixed(2));
//         } else if (res?.distanceText?.includes("mi")) {
//           miles = parseFloat(res.distanceText.replace("mi", "").trim());
//         }

//         setActualMiles(miles);

//         const selectedMiles = Number(selectedHourly.value?.distance);

//         if (miles > selectedMiles) {
//           const warningMsg = `You've selected ${selectedMiles} miles for ${selectedHourly.value.hours} hours, but your trip is ${miles} miles. Extra charges may apply.`;
//           setHourlyError(warningMsg);
//           toast.warning(warningMsg);
//         } else {
//           setHourlyError("");
//         }
//       } catch (err) {
//         console.warn("Distance fetch failed:", err);
//       }
//     };

//     fetchDistance();
//   }, [primaryJourneyData.pickup, dropOffs1, selectedHourly, mode]);

//   // Fetch distance for return journey
//   useEffect(() => {
//     const fetchReturnDistance = async () => {
//       if (
//         mode !== "Hourly" ||
//         !returnJourneyToggle ||
//         !returnJourneyData.pickup ||
//         !dropOffs2[0] ||
//         !selectedHourly
//       ) {
//         setReturnHourlyError("");
//         return;
//       }

//       const origin = returnJourneyData.pickup
//         ?.replace("Custom Input - ", "")
//         .split(" - ")
//         .pop()
//         ?.trim();
//       const destination = dropOffs2[0]
//         ?.replace("Custom Input - ", "")
//         .split(" - ")
//         .pop()
//         ?.trim();

//       if (!origin || !destination) return;

//       try {
//         const res = await triggerDistance({ origin, destination }).unwrap();

//         let miles = 0;
//         if (res?.distanceText?.includes("km")) {
//           const km = parseFloat(res.distanceText.replace("km", "").trim());
//           miles = parseFloat((km * 0.621371).toFixed(2));
//         } else if (res?.distanceText?.includes("mi")) {
//           miles = parseFloat(res.distanceText.replace("mi", "").trim());
//         }

//         setReturnActualMiles(miles);

//         const selectedMiles = Number(selectedHourly.value?.distance);

//         if (miles > selectedMiles) {
//           const warningMsg = `You've selected ${selectedMiles} miles for ${selectedHourly.value.hours} hours (Return), but your return trip is ${miles} miles. Extra charges may apply.`;
//           setReturnHourlyError(warningMsg);
//           toast.warning(warningMsg);
//         } else {
//           setReturnHourlyError("");
//         }
//       } catch (err) {
//         console.warn("Return distance fetch failed:", err);
//       }
//     };

//     fetchReturnDistance();
//   }, [returnJourneyData.pickup, dropOffs2, selectedHourly, mode, returnJourneyToggle]);

//   // Get vehicle fare for selected hourly package
//   const matchedHourlyPackage = hourlyPackages.find(
//     (pkg) =>
//       pkg.distance === selectedHourly?.value?.distance &&
//       pkg.hours === selectedHourly?.value?.hours
//   );

//   const vehicleHourlyFare =
//     matchedHourlyPackage?.vehicleRates?.[selectedVehicle?.vehicleName] || 0;

//   return {
//     formattedHourlyOptions,
//     hourlyError,
//     returnHourlyError,
//     actualMiles,
//     returnActualMiles,
//     vehicleHourlyFare,
//   };
// };
