// import React, { useState, useEffect } from "react";
// import { toast } from "react-toastify";
// import FareSection from "./FareSection";
// import JourneyCard from "./JourneyCard";
// import "react-toastify/dist/ReactToastify.css";
// import PassengerDetails from "./PassengerDetails";
// import VehicleSelection from "./VehicleSelection";
// import SelectOption from "../../../constants/constantscomponents/SelectOption";
// import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
// import { useSelector } from "react-redux";
// import { useCreateBookingMutation, useUpdateBookingMutation } from "../../../redux/api/bookingApi";
// import { useGetAllHourlyRatesQuery } from "../../../redux/api/hourlyPricingApi";
// import { useBookingFare } from "../../../utils/useBookingFare";
// import { useGetGeneralPricingPublicQuery } from "../../../redux/api/generalPricingApi";

// const NewBooking = ({ editBookingData = null, onClose }) => {
//   const user = useSelector((state) => state.auth.user);
//   const companyId = user?.companyId;
//   const userEmail = user?.email || "";
//   const isCopyMode = !!editBookingData?.__copyMode;
//   const hasUpdatedPrimaryFareOnce = React.useRef(false);
//   const hasUpdatedReturnFareOnce = React.useRef(false);

//   const { data: hourlyPackages = [] } = useGetAllHourlyRatesQuery(companyId, { skip: !companyId });
//   const { data: generalPricing } = useGetGeneralPricingPublicQuery(companyId, { skip: !companyId });

//   const [emailNotify, setEmailNotify] = useState({ admin: false, customer: false });
//   const [mode, setMode] = useState("Transfer");
//   const [returnJourneyToggle, setreturnJourneyToggle] = useState(false);
//   const [selectedVehicle, setSelectedVehicle] = useState(null);
//   const [selectedHourly, setSelectedHourly] = useState(null);
//   const [vehicleExtras, setVehicleExtras] = useState({ passenger: 0, childSeat: 0, handLuggage: 0, checkinLuggage: 0 });
//   const [passengerDetails, setPassengerDetails] = useState({ name: "", email: "", phone: "" });

//   const [primaryJourneyData, setPrimaryJourneyData] = useState({ pickup: "", date: "", hour: "", minute: "" });
//   const [returnJourneyData, setReturnJourneyData] = useState({ pickup: "", date: "", hour: "", minute: "" });
//   const [dropOffs1, setDropOffs1] = useState([""]);
//   const [dropOffs2, setDropOffs2] = useState([""]);

//   const [createBooking, { isLoading }] = useCreateBookingMutation();
//   const [updateBooking] = useUpdateBookingMutation();
//   const [localEditData, setLocalEditData] = useState(null);

//   // Calculate additional drop-off pricing manually
//   const extraDropoffPrice = (count) => {
//     const base = 0; // fallback if no generalPricing
//     const rate = generalPricing?.minAdditionalDropOff || base;
//     return Math.max(0, (count - 1)) * rate;
//   };

//   // convert primaryJourneyData date + hour + minute to a JS Date
//   const getJourneyDate = (data) => {
//     if (!data.date) return null;
//     const dt = new Date(data.date);
//     dt.setHours(Number(data.hour || 0));
//     dt.setMinutes(Number(data.minute || 0));
//     return dt;
//   };

//   const journeyDateTime = getJourneyDate(primaryJourneyData);
//   // const isReturnJourney = !!editBookingData?.__editReturn || !!editBookingData?.__copyReturn;
//   const isReturnJourney = !!editBookingData?.__editReturn || !!editBookingData?.__copyReturn || returnJourneyToggle;

//   const { calculatedFare: primaryFare, pricingMode: primaryFareMode, hourlyError: hourlyError } = useBookingFare({
//     companyId,
//     pickup: primaryJourneyData.pickup,
//     dropoff: dropOffs1[0],
//     selectedVehicle,
//     mode,
//     selectedHourly,
//     dropOffPrice: extraDropoffPrice(dropOffs1.length),
//     journeyDateTime,
//     includeAirportFees: true,
//     includeChildSeat: vehicleExtras.childSeat > 0,
//     childSeatCount: vehicleExtras.childSeat,
//   });

//   const { calculatedFare: returnFare, pricingMode: returnFareMode, } = useBookingFare({
//     companyId,
//     pickup: returnJourneyData.pickup,
//     dropoff: dropOffs2[0],
//     selectedVehicle,
//     mode,
//     selectedHourly,
//     dropOffPrice: extraDropoffPrice(dropOffs2.length),
//     journeyDateTime,
//     includeAirportFees: true,
//     includeChildSeat: vehicleExtras.childSeat > 0,
//     childSeatCount: vehicleExtras.childSeat,
//   });

//   const [fareDetails, setFareDetails] = useState({
//     paymentMethod: "Cash",
//     cardPaymentReference: "",
//     paymentGateway: "",
//     journeyFare: 0,
//     driverFare: 0,
//     returnJourneyFare: 0,
//     returnDriverFare: 0,
//     emailNotifications: { admin: false, customer: false },
//     appNotifications: { customer: false }
//   });

//   useEffect(() => {
//     if (!editBookingData) return;

//     // Deep clone to safely update fare later
//     const cloned = JSON.parse(JSON.stringify(editBookingData));
//     setLocalEditData(cloned);

//     const isReturnJourneyEdit = cloned.__editReturn || cloned.__copyReturn;
//     setreturnJourneyToggle(isReturnJourneyEdit);

//     const journeyData = isReturnJourneyEdit
//       ? cloned.returnJourney || {}
//       : cloned.primaryJourney || {};

//     const dropOffList = [
//       journeyData.dropoff || "",
//       journeyData.additionalDropoff1 || "",
//       journeyData.additionalDropoff2 || "",
//     ].filter(Boolean);

//     const journeyState = {
//       pickup: journeyData.pickup || "",
//       dropoff: journeyData.dropoff || "",
//       date: journeyData.date?.slice(0, 10) || "",
//       hour: journeyData.hour?.toString().padStart(2, "0") || "",
//       minute: journeyData.minute?.toString().padStart(2, "0") || "",
//       notes: journeyData.notes || "",
//       internalNotes: journeyData.internalNotes || "",
//       arrivefrom: journeyData.arrivefrom || "",
//       flightNumber: journeyData.flightNumber || "",
//       pickmeAfter: journeyData.pickmeAfter || "",
//       fare: journeyData.fare || "",
//       pickupDoorNumber: journeyData.pickupDoorNumber || "",
//       terminal: journeyData.terminal || "",
//       distanceText: journeyData.distanceText || "",
//       durationText: journeyData.durationText || "",
//     };

//     if (isReturnJourneyEdit) {
//       setReturnJourneyData(journeyState);
//       setDropOffs2(dropOffList);
//     } else {
//       setPrimaryJourneyData(journeyState);
//       setDropOffs1(dropOffList);
//     }

//     setPassengerDetails({
//       name: cloned.passenger?.name || "",
//       email: cloned.passenger?.email || "",
//       phone: cloned.passenger?.phone || "",
//     });

//     setSelectedVehicle(cloned.vehicle || null);

//     setVehicleExtras({
//       passenger: cloned.vehicle?.passenger || 0,
//       childSeat: cloned.vehicle?.childSeat || 0,
//       handLuggage: cloned.vehicle?.handLuggage || 0,
//       checkinLuggage: cloned.vehicle?.checkinLuggage || 0,
//     });

//     setFareDetails((prev) => ({
//       ...prev,
//       paymentMethod: cloned.paymentMethod || "Cash",
//       cardPaymentReference: cloned.cardPaymentReference || "",
//       paymentGateway: cloned.paymentGateway || "",
//       journeyFare: cloned.journeyFare || 0,
//       driverFare: cloned.driverFare || 0,
//       returnJourneyFare: cloned.returnJourneyFare || 0,
//       returnDriverFare: cloned.returnDriverFare || 0,
//       emailNotifications: {
//         admin: cloned?.emailNotifications?.admin || false,
//         customer: cloned?.emailNotifications?.customer || false,
//       },
//       appNotifications: {
//         customer: cloned?.appNotifications?.customer || false,
//       },
//     }));
//   }, [editBookingData]);

//   // For primary journey fare update
//   useEffect(() => {
//     if (localEditData?.primaryJourney && hasUpdatedPrimaryFareOnce.current) {
//       setLocalEditData((prev) => ({
//         ...prev,
//         primaryJourney: {
//           ...prev.primaryJourney,
//           fare: primaryFare,
//         },
//       }));
//     } else {
//       hasUpdatedPrimaryFareOnce.current = true;
//     }
//   }, [primaryFare]);

//   // For return journey fare update
//   useEffect(() => {
//     if (localEditData?.returnJourney && hasUpdatedReturnFareOnce.current) {
//       setLocalEditData((prev) => ({
//         ...prev,
//         returnJourney: {
//           ...prev.returnJourney,
//           fare: returnFare,
//         },
//       }));
//     } else {
//       hasUpdatedReturnFareOnce.current = true;
//     }
//   }, [returnFare]);



//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const isReturnJourney = !!editBookingData?.__editReturn || !!editBookingData?.__copyReturn;
//     const isEditing = !!editBookingData?._id && !editBookingData?.__copyMode;

//     if (!companyId) {
//       return toast.error("Missing company ID");
//     }

//     if (isReturnJourney) {
//       if (!returnJourneyData?.pickup || !dropOffs2[0]) {
//         return toast.error("Missing return journey fields");
//       }
//     } else {
//       if (!primaryJourneyData?.pickup || !dropOffs1[0]) {
//         return toast.error("Missing primary journey fields");
//       }
//     }

//     const buildDynamicFields = (dropOffs, journeyData) => {
//       const dynamic = {};
//       dropOffs.forEach((_, i) => {
//         dynamic[`dropoffDoorNumber${i}`] = journeyData?.[`dropoffDoorNumber${i}`] || "";
//         dynamic[`dropoff_terminal_${i}`] = journeyData?.[`dropoff_terminal_${i}`] || "";
//       });
//       return dynamic;
//     };

//     const dynamicFields1 = buildDynamicFields(dropOffs1, primaryJourneyData);
//     const dynamicFields2 = buildDynamicFields(dropOffs2, returnJourneyData);

//     const vehicleData = {
//       vehicleName: selectedVehicle?.vehicleName || "",
//       ...vehicleExtras,
//     };

//     const paymentFields = {
//       paymentMethod: fareDetails.paymentMethod,
//       cardPaymentReference: fareDetails.cardPaymentReference,
//       paymentGateway: fareDetails.paymentGateway,
//       journeyFare: parseFloat(fareDetails.journeyFare) || 0,
//       driverFare: parseFloat(fareDetails.driverFare) || 0,
//       returnJourneyFare: parseFloat(fareDetails.returnJourneyFare) || 0,
//       returnDriverFare: parseFloat(fareDetails.returnDriverFare) || 0,
//       emailNotifications: {
//         admin: !!fareDetails?.emailNotifications?.admin,
//         customer: !!fareDetails?.emailNotifications?.customer,
//       },
//       appNotifications: {
//         customer: !!fareDetails?.appNotifications?.customer,
//       },
//     };

//     const basePayload = {
//       mode,
//       companyId,
//       referrer: document.referrer || "manual",
//       vehicle: vehicleData,
//       passenger: passengerDetails,
//       paymentMethod: paymentFields.paymentMethod,
//       cardPaymentReference: paymentFields.cardPaymentReference,
//       paymentGateway: paymentFields.paymentGateway,
//       emailNotifications: paymentFields.emailNotifications,
//       appNotifications: paymentFields.appNotifications,
//       PassengerEmail: emailNotify.customer ? passengerDetails.email : null,
//       ClientAdminEmail: emailNotify.admin ? userEmail : null,
//     };

//     try {
//       if (isEditing) {
//         const updatePayload = {
//           ...basePayload,
//           journeyFare: isReturnJourney ? paymentFields.returnJourneyFare : paymentFields.journeyFare,
//           driverFare: isReturnJourney ? paymentFields.returnDriverFare : paymentFields.driverFare,
//           returnDriverFare: isReturnJourney ? paymentFields.returnDriverFare : paymentFields.returnDriverFare,
//           returnJourneyFare: isReturnJourney ? paymentFields.returnJourneyFare : paymentFields.returnJourneyFare,
//         };

//         if (isReturnJourney) {
//           updatePayload.returnJourney = {
//             ...returnJourneyData,
//             dropoff: dropOffs2[0],
//             additionalDropoff1: dropOffs2[1] || null,
//             additionalDropoff2: dropOffs2[2] || null,
//             hourlyOption: mode === "Hourly" && selectedHourly?.label ? selectedHourly.label : null,
//             fare: returnFare,
//             ...dynamicFields2,
//           };
//           updatePayload.returnJourneyToggle = true;
//         } else {
//           updatePayload.primaryJourney = {
//             ...primaryJourneyData,
//             dropoff: dropOffs1[0],
//             additionalDropoff1: dropOffs1[1] || null,
//             additionalDropoff2: dropOffs1[2] || null,
//             hourlyOption: mode === "Hourly" && selectedHourly?.label ? selectedHourly.label : null,
//             fare: primaryFare,
//             ...dynamicFields1,
//           };
//         }

//         await updateBooking({
//           id: editBookingData._id,
//           updatedData: { bookingData: updatePayload },
//         }).unwrap();

//         toast.success(`${isReturnJourney ? "Return" : "Primary"} booking updated successfully`);
//       }

//       // ✅ CREATE MODE (Copy or New)
//       else {
//         // ➤ 1. Create primary booking
//         const primaryPayload = {
//           ...basePayload,
//           journeyFare: paymentFields.journeyFare,
//           driverFare: paymentFields.driverFare,
//           primaryJourney: {
//             ...primaryJourneyData,
//             dropoff: dropOffs1[0],
//             additionalDropoff1: dropOffs1[1] || null,
//             additionalDropoff2: dropOffs1[2] || null,
//             hourlyOption: mode === "Hourly" && selectedHourly?.label ? selectedHourly.label : null,
//             fare: primaryFare,
//             ...dynamicFields1,
//           },
//         };

//         await createBooking(primaryPayload).unwrap();
//         toast.success("Primary booking created successfully");

//         // ➤ 2. Create return booking if toggle is ON
//         if (returnJourneyToggle && dropOffs2[0]) {
//           const returnPayload = {
//             ...basePayload,
//             journeyFare: paymentFields.returnJourneyFare,
//             driverFare: paymentFields.returnDriverFare,
//             returnJourneyFare: paymentFields.returnJourneyFare,
//             returnDriverFare: paymentFields.returnDriverFare,
//             returnJourney: {
//               ...returnJourneyData,
//               dropoff: dropOffs2[0],
//               additionalDropoff1: dropOffs2[1] || null,
//               additionalDropoff2: dropOffs2[2] || null,
//               hourlyOption: mode === "Hourly" && selectedHourly?.label ? selectedHourly.label : null,
//               fare: returnFare,
//               ...dynamicFields2,
//             },
//             returnJourneyToggle: true,
//           };

//           delete returnPayload.primaryJourney;

//           await createBooking(returnPayload).unwrap();
//           toast.success("Return journey booking created successfully");
//         }
//       }

//       onClose?.();
//     } catch (err) {
//       console.error(err);
//       toast.error("Booking operation failed.");
//     }
//   };

//   // Add here:
//   const isEditing = !!editBookingData?._id || !!editBookingData?.__copyMode;

//   return (
//     <>
//       {!editBookingData && (
//         <OutletHeading name="New Booking" />
//       )}
//       <div className="flex flex-col items-center justify-center mb-6 space-y-4">
//         <div className="flex">
//           {["Transfer", "Hourly"].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setMode(tab)}
//               className={`px-6 py-2 font-semibold text-sm border cursor-pointer ${mode === tab
//                 ? "bg-white text-[var(--main-color)] border-2 border-[var(--main-color)]"
//                 : "bg-[#f9fafb] text-gray-700 border-gray-300"
//                 } ${tab === "Transfer" ? "rounded-l-md" : "rounded-r-md"}`}
//             >
//               {tab}
//             </button>
//           ))}
//         </div>

//         {mode === "Hourly" && hourlyError && (
//           <div className="text-sm text-red-600 text-center max-w-2xl mb-4">
//             {hourlyError}
//           </div>
//         )}

//         {/* Hourly Dropdown */}
//         {mode === "Hourly" && (
//           <div className="w-full max-w-xs">
//             <SelectOption
//               options={hourlyPackages.map((pkg) => ({
//                 label: `${pkg.distance} miles ${pkg.hours} hours`,
//                 value: JSON.stringify({
//                   distance: pkg.distance,
//                   hours: pkg.hours,
//                 }),
//               }))}
//               value={selectedHourly ? JSON.stringify(selectedHourly.value) : ""}
//               onChange={(e) => {
//                 const selectedValue = e.target.value;
//                 if (!selectedValue) {
//                   setSelectedHourly(null); // Reset to default
//                 } else {
//                   const selected = hourlyPackages.find(
//                     (pkg) =>
//                       JSON.stringify({
//                         distance: pkg.distance,
//                         hours: pkg.hours,
//                       }) === selectedValue
//                   );
//                   if (selected) {
//                     setSelectedHourly({
//                       label: `${selected.distance} miles ${selected.hours} hours`,
//                       value: {
//                         distance: selected.distance,
//                         hours: selected.hours,
//                       },
//                     });
//                   }
//                 }
//               }}
//             />
//           </div>
//         )}
//       </div>

//       <div className="w-full flex flex-col items-center gap-6">
//         <div className={`w-full ${returnJourneyToggle ? "lg:max-w-6xl gap-4" : "lg:max-w-4xl"} flex flex-col lg:flex-row`}>
//           {/* Journey 1 */}
//           {(!isEditing || !isReturnJourney || returnJourneyToggle) && (
//             <JourneyCard
//               title="Journey 1"
//               journeyData={primaryJourneyData}
//               setJourneyData={setPrimaryJourneyData}
//               dropOffs={dropOffs1}
//               setDropOffs={setDropOffs1}
//               editBookingData={localEditData}
//               fare={localEditData?.primaryJourney?.fare || primaryFare}
//               pricingMode={primaryFareMode}
//               selectedVehicle={selectedVehicle}
//               mode={mode}
//             />
//           )}
//           {/* Journey 2 (conditionally shown) */}
//           {(isReturnJourney || (!isEditing && returnJourneyToggle)) && (
//             <div className="w-full transition-all duration-200 ease-in-out transform">
//               <JourneyCard
//                 title="Journey 2"
//                 journeyData={returnJourneyData}
//                 setJourneyData={setReturnJourneyData}
//                 dropOffs={dropOffs2}
//                 setDropOffs={setDropOffs2}
//                 editBookingData={localEditData}
//                 fare={localEditData?.returnJourney?.fare || primaryFare}
//                 pricingMode={returnFareMode}
//                 selectedVehicle={selectedVehicle}
//                 mode={mode}
//               />
//             </div>
//           )}
//         </div>

//         {/* Toggle Switch */}
//         <div className="flex items-center mt-6 mb-6">
//           <label className="flex items-center cursor-pointer relative">
//             <input
//               type="checkbox"
//               className="sr-only peer"
//               checked={returnJourneyToggle}
//               onChange={(e) => setreturnJourneyToggle(e.target.checked)}
//             />
//             <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors duration-300"></div>
//             <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transform peer-checked:translate-x-6 transition-transform duration-300"></div>
//             <span className="ml-4 text-sm font-medium text-gray-800">Return Journey</span>
//           </label>
//         </div>
//       </div>
//       <div
//         className={`grid grid-cols-1 lg:grid-cols-12 gap-6 ${editBookingData?._id || editBookingData?.__copyMode ? "px-6" : ""
//           }`}
//       >
//         <div className="col-span-6">
//           <div className="bg-white shadow-lg rounded-2xl border border-gray-200">
//             <div className="bg-[#0f192d] px-6 rounded-t-2xl py-3">
//               <h2 className="text-xl font-bold text-gray-50">Passenger & Vehicle Details:-</h2>
//             </div>
//             <div className="p-6">
//               <PassengerDetails passengerDetails={passengerDetails} setPassengerDetails={setPassengerDetails} />
//               <hr className="mb-6 mt-6 border-gray-300" />
//               <VehicleSelection setSelectedVehicle={setSelectedVehicle} setVehicleExtras={setVehicleExtras} editBookingData={editBookingData} />
//             </div>
//           </div>
//         </div>
//         <div className="col-span-6">
//           <FareSection emailNotify={emailNotify} fareDetails={fareDetails} setFareDetails={setFareDetails} setEmailNotify={setEmailNotify} handleSubmit={handleSubmit} isLoading={isLoading} editBookingData={editBookingData} />
//         </div>
//       </div>

//       <div className="flex justify-center mt-12">
//         <button
//           onClick={handleSubmit}
//           className="btn btn-success font-semibold px-6 py-2 rounded-md shadow transition"
//           disabled={isLoading}
//         >
//           {isLoading
//             ? "Processing..."
//             : editBookingData && editBookingData._id
//               ? "Update Booking"
//               : "Submit Booking"}
//         </button>
//       </div>
//     </>
//   );
// };

// export default NewBooking;