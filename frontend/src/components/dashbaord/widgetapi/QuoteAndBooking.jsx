// import React, { useEffect, useState } from 'react';
// import WidgetBooking from './WidgetBooking';
// import CarCardSection from './CarCardSection';
// import { useGetAllVehiclesQuery } from '../../../redux/api/vehicleApi';
// import { useCreateBookingMutation } from '../../../redux/api/bookingApi';
// import { toast, ToastContainer } from 'react-toastify';

// const QuoteAndBooking = () => {
//   const [bookingData, setBookingData] = useState(null);
//   const [selectedVehicleId, setSelectedVehicleId] = useState(null);
//   const [distanceKm, setDistanceKm] = useState(null);

//   const { data: carList = [], isLoading } = useGetAllVehiclesQuery();
//   const [createBooking] = useCreateBookingMutation();

//   // Step 1: Load booking form from localStorage
//   useEffect(() => {
//     const stored = localStorage.getItem('bookingForm');
//     if (stored) {
//       const parsed = JSON.parse(stored);
//       setBookingData(parsed);
//       if (parsed.pickup && parsed.dropoff) {
//         calculateDistance(parsed.pickup, parsed.dropoff);
//       }
//     }
//   }, []);

//   // Step 2: Google Distance Matrix API
//   const calculateDistance = async (origin, destination) => {
//     try {
//       const apiKey = process.env.REACT_APP_GOOGLE_LOCATION_API;
//       const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;
//       const response = await fetch(`/proxy-google?url=${encodeURIComponent(url)}`);
//       const data = await response.json();
//       const meters = data?.rows?.[0]?.elements?.[0]?.distance?.value || 0;
//       const km = meters / 1000;
//       setDistanceKm(km.toFixed(1));
//     } catch (err) {
//       console.error('❌ Distance fetch failed:', err);
//       toast.error('Could not calculate distance');
//     }
//   };

//   const handleQuoteSubmit = (formValues) => {
//     setBookingData(formValues);
//     localStorage.setItem('bookingForm', JSON.stringify(formValues));
//     if (formValues.pickup && formValues.dropoff) {
//       calculateDistance(formValues.pickup, formValues.dropoff);
//     }
//   };

//   const handleSubmitBooking = async () => {
//     if (!bookingData || !selectedVehicleId) {
//       toast.error('Please fill the form and select a vehicle.');
//       return;
//     }

//     const payload = {
//       ...bookingData,
//       vehicleId: selectedVehicleId,
//       distanceKm,
//     };

//     try {
//       await createBooking(payload).unwrap();
//       toast.success('🚗 Booking saved successfully!');
//       setBookingData(null);
//       setSelectedVehicleId(null);
//       localStorage.removeItem('bookingForm');
//     } catch (error) {
//       toast.error('❌ Booking failed.');
//       console.error(error);
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto py-10 px-4">
//       <ToastContainer />
//       {!bookingData && <WidgetBooking onQuoteSubmit={handleQuoteSubmit} />}
//       {bookingData && (
//         <>
//           <h2 className="text-xl font-bold mt-10 mb-4">Available Vehicles</h2>
//           {isLoading ? (
//             <p>Loading vehicles...</p>
//           ) : (
//             <CarCardSection
//               carList={carList}
//               selectedCarId={selectedVehicleId}
//               onSelect={setSelectedVehicleId}
//             />
//           )}

//           <div className="text-right mt-6">
//             <button
//               onClick={handleSubmitBooking}
//               className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
//             >
//               Submit Booking
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default QuoteAndBooking;
