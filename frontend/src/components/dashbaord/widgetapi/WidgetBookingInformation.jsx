import React, { useEffect, useState } from 'react';
import {
  Check, AlertCircle, ReceiptText, PlaneTakeoff, PlaneLanding, Clock, MapPin
} from "lucide-react";
import CarCardSection from './CarCardSection';
import { useGetPublicVehiclesQuery } from '../../../redux/api/vehicleApi';
import { useLazyGetDistanceQuery } from '../../../redux/api/googleApi';
import { toast, ToastContainer } from 'react-toastify';

const WidgetBookingInformation = ({
  companyId: propCompanyId,
  onNext,
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

  const [triggerDistance] = useLazyGetDistanceQuery();
  const { data: carList = [], isLoading, error } = useGetPublicVehiclesQuery(companyId, {
    skip: !companyId,
  });

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
    if (!storedForm) {
      toast.error("No booking form found.");
      return;
    }

    const data = JSON.parse(storedForm);
    setFormData(data);

    const origin = data.pickup?.replace("Custom Input - ", "").split(" - ").pop()?.trim();
    const destination = data.dropoff?.replace("Custom Input - ", "").split(" - ").pop()?.trim();

    if (origin && destination) {
      triggerDistance({ origin, destination })
        .unwrap()
        .then(res => {
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
        })
        .catch(() => {
          setDistanceText(null);
          setDurationText(null);
          toast.warn("⚠️ Distance not found between given locations.");
        });
    }
  }, []);

  const getVehiclePriceForDistance = (vehicle, miles) => {
    if (!vehicle?.slabs || !Array.isArray(vehicle.slabs)) return null;
    const matchedSlab = vehicle.slabs.find(slab => miles >= slab.from && miles <= slab.to);
    return matchedSlab ? matchedSlab.price : null;
  };

  useEffect(() => {
    if (carList.length > 0) {
      setSelectedCarId(carList[0]._id);
    }
  }, [carList]);

  useEffect(() => {
    if (selectedCarId && carList.length > 0 && actualMiles !== null) {
      const selectedCar = carList.find(car => car._id === selectedCarId);
      const selectedPrice = getVehiclePriceForDistance(selectedCar, actualMiles);
      setBaseRate(selectedPrice || '0.00');
    }
  }, [selectedCarId, carList, actualMiles]);

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
    onNext();
  };

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
                <PlaneTakeoff className="w-8 h-8 text-red-500" />
                <div>
                  <p className="font-medium text-sm text-red-800">{formData?.pickup || "Pickup Location"}</p>
                  <p className="text-xs text-gray-500">{formData?.doorNumber ? `Door No. ${formData.doorNumber}` : "All Terminals"}</p>
                </div>
              </div>
              <div className="text-gray-400 text-2xl hidden md:block">→</div>
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <div className="text-right">
                  <p className="font-medium text-sm text-green-800">{formData?.dropoff || "Dropoff Location"}</p>
                  <p className="text-xs text-gray-500">{formData?.arrivefrom ? `From: ${formData.arrivefrom}` : "Destination"}</p>
                </div>
                <PlaneLanding className="w-8 h-8 text-green-500" />
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
              <div className="flex justify-end items-center gap-4 text-sm text-gray-700 mt-2">
                {distanceText && (<div className="flex items-center gap-1"><MapPin className="w-4 h-4 text-blue-500" /><span>{distanceText}</span></div>)}
                {durationText && (<div className="flex items-center gap-1"><Clock className="w-4 h-4 text-blue-500" /><span>{durationText}</span></div>)}
              </div>
            </div>
          </div>

          <div className="mt-6">
            {isLoading ? <p>Loading vehicles...</p> : error ? <p className="text-red-500">Failed to load vehicles.</p> : (
              <>
                {carList.length === 0 ? <p>No cars found.</p> : (
                  <CarCardSection
                    carList={carList.map(car => ({
                      ...car,
                      price: getVehiclePriceForDistance(car, actualMiles),
                    }))}
                    selectedCarId={selectedCarId}
                    onSelect={setSelectedCarId}
                  />
                )}
                <div className="text-right mt-4">
                  <button onClick={handleSubmitBooking} className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-md shadow hover:bg-blue-700 transition">
                    Next
                  </button>
                </div>
              </>
            )}
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