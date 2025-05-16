// import React from "react";
// import WidgetBooking from "./WidgetBooking"

// const WidgetAPI = () => {
//   const iframeCode = `<iframe src="https://www.megatransfers.com/booking-form.php" class="iframe-responsive" style="width:100%;min-height:550px" title="Book Now"></iframe>`;

//   return (
//     <div>
//       <div className="mb-6">
//         <h2 className="text-2xl font-bold text-gray-600 mb-2">
//           🔌 Widget / API Integration
//         </h2>
//         <p className="text-gray-600 mt-1 text-sm sm:text-base ps-2">
//           Use the following iframe code to embed your booking form on any
//           website.
//         </p>
//       </div>

//       <div className="bg-white border border-gray-200 rounded-lg shadow p-5 mb-10">
//         <label className="block text-sm font-semibold text-gray-700 mb-2">
//           iFrame Widget:
//         </label>
//         <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto text-gray-800">
//           <code>{iframeCode}</code>
//         </pre>
//       </div>
//       <WidgetBooking />
//     </div>
//   );
// };

// export default WidgetAPI;





import React, { useState, useEffect } from 'react';
import CAR_DATA from './CAR_DATA';
import {
  Check,
  AlertCircle,
  ReceiptText,
  PlaneTakeoff,
  PlaneLanding,
  Clock,
  CalendarDays,
  MapPin,
} from "lucide-react";
import CarCardSection from './CarCardSection';

const WidgetApi = ({
  baseRate = '197.87',
  meetAndGreet = '10.50',
  estimatedTax = '15.00',
}) => {
  const [carList, setCarList] = useState([]);
  const [selectedCarId, setSelectedCarId] = useState(null);

  useEffect(() => {
    setCarList(CAR_DATA);
    setSelectedCarId(CAR_DATA[0]?.id); // default to first car
  }, []);
  return (
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  {/* 8 Columns: Airport Route Card */}
  <div className="lg:col-span-8 w-full">
    <div className="backdrop-blur-md bg-white/80 border border-gray-200 shadow-xl rounded-2xl overflow-hidden transition hover:shadow-2xl">
      <div className="grid md:grid-cols-3 grid-cols-1">
        {/* FROM */}
        <div className="flex items-center gap-4 bg-gradient-to-r from-red-100 via-white to-white px-6 py-6 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none shadow-sm">
          <div className="p-2 bg-red-50 rounded-full">
            <PlaneTakeoff className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-red-800">London Heathrow (LHR)</h4>
            <p className="text-sm text-gray-600">All Terminals</p>
          </div>
        </div>
        {/* CENTER */}
        <div className="flex flex-col items-center justify-center text-center px-6 py-6 border-y md:border-x md:border-y-0 border-gray-300 bg-white text-gray-800">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
            <CalendarDays className="w-4 h-4 text-blue-500" />
            <span>Wed, May 14, 2025</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-black mb-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>09:40 PM → 10:29 PM (GMT+1)</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4 text-green-500" />
            <span>69.6 km</span>
          </div>
        </div>
        {/* TO */}
        <div className="flex items-center justify-end md:justify-start gap-4 bg-gradient-to-l from-green-100 via-white to-white px-6 py-6 rounded-b-2xl md:rounded-r-2xl md:rounded-bl-none shadow-sm">
          <div className="text-right md:text-left">
            <h4 className="text-base font-semibold text-green-800">Gatwick Airport</h4>
            <p className="text-sm text-gray-600">North Terminal</p>
          </div>
          <div className="p-2 bg-green-50 rounded-full">
            <PlaneLanding className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>
    </div>

    <div className='mt-6'>
      <CarCardSection
        carList={CAR_DATA} // ✅ must be defined and an array
        selectedCarId={selectedCarId}
        onSelect={setSelectedCarId}
      />
    </div>
  </div>

  {/* 4 Columns: Price Breakdown */}
  <div className="lg:col-span-4 w-full space-y-8">
    {/* Price Breakdown */}
    <div className="rounded-2xl p-6 bg-white shadow-md border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-gray-800 font-semibold text-lg">
          <ReceiptText className="w-5 h-5 text-blue-500" />
          <span>Price Breakdown</span>
        </div>
        <span className="text-sm text-gray-500">Rate</span>
      </div>
      <div className="space-y-4 text-sm text-gray-700">
        <div className="flex justify-between pb-2 border-b border-dashed border-gray-300">
          <span>Base Fare</span>
          <span className="font-medium text-gray-900">£{baseRate}</span>
        </div>
        <div className="flex justify-between pb-2 border-b border-dashed border-gray-300">
          <span>Meet & Greet</span>
          <span className="font-medium text-gray-900">£{meetAndGreet}</span>
        </div>
        <div className="flex justify-between">
          <span>Estimated Tax</span>
          <span className="font-medium text-gray-900">£{estimatedTax}</span>
        </div>
      </div>
    </div>

    {/* Included Services */}
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
        ✅ All Classes Include:
      </h3>
      <ul className="space-y-3 text-sm text-gray-700">
        {[
          'Free cancellation up until 1 hour before pickup',
          'Free 60 minutes of wait time',
          'Meet & Greet',
          'Complimentary bottle of water',
        ].map((item, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-500 mt-1" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-yellow-800 mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600" />
          Please Note
        </h4>
        <p className="text-sm text-yellow-900">
          Child/booster seats must be added for safety reasons. If you are traveling with children, please add them during booking.
        </p>
      </div>
    </div>
  </div>
</div>

  );
};

export default WidgetApi;
