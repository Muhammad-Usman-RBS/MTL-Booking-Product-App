import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VehicleSelection from "./VehicleSelection";
import PassengerDetails from "./PassengerDetails";
import FareSection from "./FareSection";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import JourneyCard from "./JourneyCard";
import { useCreateBookingMutation } from "../../../redux/api/bookingApi";

const hourlyOptions = [
  "40 miles 4 hours", "60 miles 6 hours", "80 miles 8 hours"
];

const NewBooking = () => {
  const [mode, setMode] = useState("Transfer");
  const [returnJourney, setReturnJourney] = useState(false);
  const [selectedHourly, setSelectedHourly] = useState(hourlyOptions[0]);

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleExtras, setVehicleExtras] = useState({
    passenger: 0,
    childSeat: 0,
    handLuggage: 0,
    checkinLuggage: 0,
  });

  const [journey1Data, setJourney1Data] = useState({
    pickmeAfter: "",
    flightNumber: "",
    arrivefrom: "",
    doorNumber: "",
    pickup: "",
    date: "",
    hour: "",
    minute: "",
    notes: "",
    internalNotes: ""
  });
  const [dropOffs1, setDropOffs1] = useState([""]);

  const [journey2Data, setJourney2Data] = useState({
    pickmeAfter: "",
    flightNumber: "",
    arrivefrom: "",
    doorNumber: "",
    pickup: "",
    date: "",
    hour: "",
    minute: "",
    notes: "",
    internalNotes: ""
  });
  const [dropOffs2, setDropOffs2] = useState([""]);

  const [createBooking, { isLoading }] = useCreateBookingMutation();

  const handleSubmit = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const companyId = user?.companyId;

      if (!companyId || companyId.length !== 24) {
        toast.error("Valid companyId is required from logged-in user");
        return;
      }

      if (!selectedVehicle?.vehicleName) {
        toast.error("Please select a vehicle.");
        return;
      }

      const payload = {
        mode,
        returnJourney,
        companyId,
        vehicle: {
          vehicleName: selectedVehicle.vehicleName,
          passenger: vehicleExtras.passenger,
          childSeat: vehicleExtras.childSeat,
          handLuggage: vehicleExtras.handLuggage,
          checkinLuggage: vehicleExtras.checkinLuggage,
        },
        journey1: {
          pickmeAfter: journey1Data.pickmeAfter,
          flightNumber: journey1Data.flightNumber,
          arrivefrom: journey1Data.arrivefrom,
          doorNumber: journey1Data.doorNumber,
          pickup: journey1Data.pickup,
          dropoff: dropOffs1[0],
          additionalDropoff1: dropOffs1[1] || null,
          additionalDropoff2: dropOffs1[2] || null,
          notes: journey1Data.notes,
          internalNotes: journey1Data.internalNotes,
          date: journey1Data.date,
          hour: journey1Data.hour,
          minute: journey1Data.minute,
          fare: 0,
          hourlyOption: mode === "Hourly" ? selectedHourly : null,
          companyId,
        },
      };

      if (returnJourney) {
        payload.journey2 = {
          pickmeAfter: journey2Data.pickmeAfter,
          flightNumber: journey2Data.flightNumber,
          arrivefrom: journey2Data.arrivefrom,
          doorNumber: journey2Data.doorNumber,
          pickup: journey2Data.pickup,
          dropoff: dropOffs2[0],
          additionalDropoff1: dropOffs2[1] || null,
          additionalDropoff2: dropOffs2[2] || null,
          notes: journey2Data.notes,
          internalNotes: journey2Data.internalNotes,
          date: journey2Data.date,
          hour: journey2Data.hour,
          minute: journey2Data.minute,
          fare: 0,
          hourlyOption: mode === "Hourly" ? selectedHourly : null,
        };
      }

      await createBooking(payload).unwrap();
      toast.success("Booking created successfully!");
    } catch (error) {
      console.error("Create booking error:", error);
      toast.error(error?.data?.message || "Booking failed");
    }
  };

  return (
    <>
      <ToastContainer />
      <div>
        <OutletHeading name="New Booking" />

        {/* Tabs */}
        <div className="flex justify-center mb-4">
          {["Transfer", "Hourly"].map((tab) => (
            <button
              key={tab}
              onClick={() => setMode(tab)}
              className={`px-6 py-2 font-medium transition-all cursor-pointer duration-200 ${mode === tab
                  ? "bg-[#f3f4f6] text-dark border border-black"
                  : "bg-[#f3f4f6] text-dark"
                } ${tab === "Transfer" ? "rounded-l-md" : "rounded-r-md"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Hourly Options */}
        {mode === "Hourly" && (
          <div className="flex justify-center">
            <SelectOption
              options={hourlyOptions}
              value={selectedHourly}
              onChange={(e) => setSelectedHourly(e.target.value)}
              width="w-full md:w-64"
            />
          </div>
        )}

        {/* Journey 1 */}
        <JourneyCard
          title="Journey 1"
          journeyData={journey1Data}
          setJourneyData={setJourney1Data}
          dropOffs={dropOffs1}
          setDropOffs={setDropOffs1}
        />

        {/* Return Journey Toggle */}
        <div className="flex items-center mt-6 w-full max-w-4xl mx-auto">
          <label className="flex items-center cursor-pointer relative">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={returnJourney}
              onChange={(e) => setReturnJourney(e.target.checked)}
            />
            <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors duration-300"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transform peer-checked:translate-x-6 transition-transform duration-300"></div>
            <span className="ml-4 text-sm font-medium text-gray-800">Return Journey</span>
          </label>
        </div>

        {/* Journey 2 */}
        {returnJourney && (
          <JourneyCard
            title="Journey 2"
            journeyData={journey2Data}
            setJourneyData={setJourney2Data}
            dropOffs={dropOffs2}
            setDropOffs={setDropOffs2}
          />
        )}

        {/* Submit Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Submitting..." : "Submit Booking"}
          </button>
        </div>

        {/* Vehicle Section with Prop Passing */}
        <VehicleSelection
          setSelectedVehicle={setSelectedVehicle}
          setVehicleExtras={setVehicleExtras}
        />

        <PassengerDetails />
        <FareSection />
      </div>
    </>
  );
};

export default NewBooking;
