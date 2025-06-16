import React from 'react';
import {
  Check, AlertCircle, ReceiptText, PlaneTakeoff, PlaneLanding, Clock, MapPin
} from "lucide-react";
import CarCardSection from './CarCardSection';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ✅ Single global fallback function
const renderOrPlaceholder = (value, placeholder = 'N/A') => {
  return value ? value : (
    <span className="text-gray-400 italic">{placeholder}</span>
  );
};

const WidgetBookingInformation = () => {

  const dummyFormData = {
    pickup: "",
    dropoff: "",
    arrivefrom: "",
    doorNumber: "",
    date: "",
    hour: "",
    minute: ""
  };

  const dummyDistanceText = "";
  const dummyDurationText = "";
  const dummyBaseRate = "";
  const meetAndGreet = "";
  const estimatedTax = "";

  const dummyCarList = [
    { _id: "1", vehicleName: "", price: null },
  ];

  return (
    <>
      <ToastContainer />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:col-span-8 w-full">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-md p-6 w-full">
            <div className="text-center mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-1">
                {renderOrPlaceholder(dummyFormData.date)}
              </h3>
              <div className="text-xl font-semibold text-gray-900">
                {renderOrPlaceholder(`${dummyFormData.hour}:${dummyFormData.minute}`)} <span className="text-sm text-gray-500">&nbsp;(GMT+1)</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-4 py-3 bg-white border border-gray-100 rounded-xl">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <PlaneTakeoff className="w-8 h-8 text-red-500" />
                <div>
                  <p className="font-medium text-sm text-red-800">
                    {renderOrPlaceholder(dummyFormData.pickup)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Door No. {renderOrPlaceholder(dummyFormData.doorNumber)}
                  </p>
                </div>
              </div>
              <div className="text-gray-400 text-2xl hidden md:block">→</div>
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <div className="text-right">
                  <p className="font-medium text-sm text-green-800">
                    {renderOrPlaceholder(dummyFormData.dropoff)}
                  </p>
                  <p className="text-xs text-gray-500">
                    From: {renderOrPlaceholder(dummyFormData.arrivefrom)}
                  </p>
                </div>
                <PlaneLanding className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-3 mt-4 text-sm text-gray-600 px-2">
              <span>
                Estimated arrival at <strong className="text-gray-800">
                  {renderOrPlaceholder("11:15 AM")}
                </strong> (GMT+1)
              </span>
              <div className="flex justify-end items-center gap-4 text-sm text-gray-700 mt-2">
                <div className="flex items-center gap-1"><MapPin className="w-4 h-4 text-blue-500" /><span>Approximately Distance: {renderOrPlaceholder(dummyDistanceText)}</span></div>
                <div className="flex items-center gap-1"><Clock className="w-4 h-4 text-blue-500" /><span>Time: {renderOrPlaceholder(dummyDurationText)}</span></div>
              </div>
            </div>
          </div>

          <div className='mt-6'>
            <CarCardSection
              carList={dummyCarList}
              selectedCarId={"1"}
              onSelect={() => {}}
            />
            <div className="text-right mt-4">
              <button className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-md shadow hover:bg-blue-700 transition">
                Next
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 w-full space-y-8">
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
                <span className="font-medium text-gray-900">£{renderOrPlaceholder(dummyBaseRate)}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-dashed border-gray-300">
                <span>Meet & Greet</span>
                <span className="font-medium text-gray-900">£{renderOrPlaceholder(meetAndGreet)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">✅ All Classes Include:</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              {["Free cancellation up until 1 hour before pickup", "Free 60 minutes of wait time", "Meet & Greet"].map((item, idx) => (
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
    </>
  );
};

export default WidgetBookingInformation;
