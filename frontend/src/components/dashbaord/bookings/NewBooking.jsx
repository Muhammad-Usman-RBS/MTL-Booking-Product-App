import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VehicleSelection from "./VehicleSelection";
import PassengerDetails from "./PassengerDetails";
import FareSection from "./FareSection";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import JourneyCard from "./JourneyCard";
import {
  useCreateBookingMutation,
  useUpdateBookingMutation,
} from "../../../redux/api/bookingApi";
import { useLazyGetDistanceQuery } from "../../../redux/api/googleApi";
import { useSelector } from "react-redux";

const hourlyOptions = ["40 miles 4 hours", "60 miles 6 hours", "80 miles 8 hours"];

const NewBooking = ({ editBookingData = null, onClose }) => {
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
    pickup: "",
    date: "",
    hour: "",
    minute: "",
    arrivefrom: "",
    pickmeAfter: "",
    flightNumber: "",
    pickupDoorNumber: "",
    notes: "",
    internalNotes: "",
  });
  const [dropOffs1, setDropOffs1] = useState([""]);

  const [journey2Data, setJourney2Data] = useState({
    pickup: "",
    date: "",
    hour: "",
    minute: "",
    arrivefrom: "",
    pickmeAfter: "",
    flightNumber: "",
    pickupDoorNumber: "",
    notes: "",
    internalNotes: "",
  });
  const [dropOffs2, setDropOffs2] = useState([""]);

  const [createBooking, { isLoading }] = useCreateBookingMutation();
  const [updateBooking] = useUpdateBookingMutation();
  const [triggerDistance] = useLazyGetDistanceQuery();

  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;

  useEffect(() => {
    if (editBookingData) {
      setMode(editBookingData.mode || "Transfer");
      setReturnJourney(editBookingData.returnJourney || false);
      setSelectedVehicle(editBookingData.vehicle || null);
      setVehicleExtras({
        passenger: editBookingData.vehicle?.passenger || 0,
        childSeat: editBookingData.vehicle?.childSeat || 0,
        handLuggage: editBookingData.vehicle?.handLuggage || 0,
        checkinLuggage: editBookingData.vehicle?.checkinLuggage || 0,
      });

      setJourney1Data(editBookingData.journey1 || {});
      setDropOffs1([
        editBookingData.journey1?.dropoff || "",
        editBookingData.journey1?.additionalDropoff1 || "",
        editBookingData.journey1?.additionalDropoff2 || ""
      ]);

      if (editBookingData.returnJourney) {
        setJourney2Data(editBookingData.journey2 || {});
        setDropOffs2([
          editBookingData.journey2?.dropoff || "",
          editBookingData.journey2?.additionalDropoff1 || "",
          editBookingData.journey2?.additionalDropoff2 || ""
        ]);
      }

      if (editBookingData.journey1?.hourlyOption) {
        setSelectedHourly(editBookingData.journey1.hourlyOption);
      }
    }
  }, [editBookingData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!companyId || companyId.length !== 24) {
      toast.error("Missing or invalid company ID.");
      return;
    }

    if (!journey1Data.pickup || dropOffs1[0].trim() === "") {
      toast.error("Pickup and at least one Drop Off is required.");
      return;
    }

    const dynamicFields1 = {};
    dropOffs1.forEach((_, idx) => {
      dynamicFields1[`dropoffDoorNumber${idx}`] = journey1Data[`dropoffDoorNumber${idx}`] || "";
      dynamicFields1[`dropoff_terminal_${idx}`] = journey1Data[`dropoff_terminal_${idx}`] || "";
    });

    const dynamicFields2 = {};
    dropOffs2.forEach((_, idx) => {
      dynamicFields2[`dropoffDoorNumber${idx}`] = journey2Data[`dropoffDoorNumber${idx}`] || "";
      dynamicFields2[`dropoff_terminal_${idx}`] = journey2Data[`dropoff_terminal_${idx}`] || "";
    });

    const payload = {
      mode,
      returnJourney,
      companyId,
      referrer: document.referrer || "manual",
      vehicle: {
        vehicleName: selectedVehicle?.vehicleName || "",
        ...vehicleExtras,
      },
      journey1: {
        ...journey1Data,
        dropoff: dropOffs1[0],
        additionalDropoff1: dropOffs1[1] || null,
        additionalDropoff2: dropOffs1[2] || null,
        hourlyOption: mode === "Hourly" ? selectedHourly : null,
        ...dynamicFields1,
      },
      ...(returnJourney && {
        journey2: {
          ...journey2Data,
          dropoff: dropOffs2[0],
          additionalDropoff1: dropOffs2[1] || null,
          additionalDropoff2: dropOffs2[2] || null,
          hourlyOption: mode === "Hourly" ? selectedHourly : null,
          ...dynamicFields2,
        },
      }),
    };

    try {
      const origin = journey1Data.pickup?.split(" - ").pop()?.trim();
      const destination = dropOffs1[0]?.split(" - ").pop()?.trim();

      if (origin && destination) {
        const res = await triggerDistance({ origin, destination }).unwrap();
        if (res?.distanceText && res?.durationText) {
          payload.journey1.distanceText = res.distanceText;
          payload.journey1.durationText = res.durationText;
        }
      }
    } catch (err) {
      console.warn("⚠️ Distance matrix error:", err);
    }

    try {
      if (editBookingData && editBookingData._id) {
        await updateBooking({ id: editBookingData._id, updatedData: payload }).unwrap();
        toast.success("Booking updated successfully.");
      } else {
        await createBooking(payload).unwrap();
        toast.success("Booking submitted successfully.");
      }
      if (onClose) onClose();
    } catch (err) {
      console.error("❌ Booking error:", err);
      toast.error("Failed to process booking.");
    }
  };

  return (
    <>
      <ToastContainer />
      <div className={editBookingData ? "ps-5 pe-5 pt-5" : "ps-0 pe-0"}>
        <div className={editBookingData ? "hidden" : "block"}>
          <OutletHeading name={editBookingData && !editBookingData._id ? "Copy Booking" : "New Booking"} />
        </div>

        <div className="flex justify-center mb-4">
          {["Transfer", "Hourly"].map((tab) => (
            <button
              key={tab}
              onClick={() => setMode(tab)}
              className={`px-6 py-2 font-medium transition-all cursor-pointer duration-200 ${mode === tab ? "bg-[#f3f4f6] text-dark border border-black" : "bg-[#f3f4f6] text-dark"} ${tab === "Transfer" ? "rounded-l-md" : "rounded-r-md"}`}
            >
              {tab}
            </button>
          ))}
        </div>

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

        <JourneyCard
          title="Journey 1"
          journeyData={journey1Data}
          setJourneyData={setJourney1Data}
          dropOffs={dropOffs1}
          setDropOffs={setDropOffs1}
        />

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

        {returnJourney && (
          <JourneyCard
            title="Journey 2"
            journeyData={journey2Data}
            setJourneyData={setJourney2Data}
            dropOffs={dropOffs2}
            setDropOffs={setDropOffs2}
          />
        )}

        <div className="flex justify-center mt-8">
          <button
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading
              ? "Processing..."
              : editBookingData && editBookingData._id
              ? "Update Booking"
              : "Submit Booking"}
          </button>
        </div>

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
