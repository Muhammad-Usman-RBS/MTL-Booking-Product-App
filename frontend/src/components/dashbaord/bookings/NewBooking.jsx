import React, { useState, useEffect, useMemo } from "react";
import { toast, ToastContainer } from "react-toastify";
import FareSection from "./FareSection";
import JourneyCard from "./JourneyCard";
import "react-toastify/dist/ReactToastify.css";
import PassengerDetails from "./PassengerDetails";
import VehicleSelection from "./VehicleSelection";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import { useLazyGetDistanceQuery } from "../../../redux/api/googleApi";
import { useGetAllHourlyRatesQuery } from "../../../redux/api/hourlyPricingApi";
import { useSelector } from "react-redux";
import {
  useCreateBookingMutation,
  useUpdateBookingMutation,
} from "../../../redux/api/bookingApi";

const NewBooking = ({ editBookingData = null, onClose }) => {
  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;

  console.log("asdsa", companyId)
  const { data: hourlyPackages = [] } = useGetAllHourlyRatesQuery(companyId, {
    skip: !companyId,
  });

  const [mode, setMode] = useState("Transfer");
  const [returnJourney, setReturnJourney] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleExtras, setVehicleExtras] = useState({
    passenger: 0,
    childSeat: 0,
    handLuggage: 0,
    checkinLuggage: 0,
  });
  const [passengerDetails, setPassengerDetails] = useState({
    name: "",
    email: "",
    phone: "",
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
  const [selectedHourly, setSelectedHourly] = useState(null);

  const formattedHourlyOptions = useMemo(() => {
    return hourlyPackages.map(pkg => ({
      label: `${pkg.distance} miles ${pkg.hours} hours`,
      value: { distance: pkg.distance, hours: pkg.hours },
    }));
  }, [hourlyPackages]);

  useEffect(() => {
    if (editBookingData) {
      setMode(editBookingData.mode || "Transfer");
      setReturnJourney(editBookingData.returnJourney || false);
      setSelectedVehicle(editBookingData.vehicle || null);

      // ✅ Fix default fallback values
      setVehicleExtras({
        passenger: editBookingData.vehicle?.passenger ?? 0,
        childSeat: editBookingData.vehicle?.childSeat ?? 0,
        handLuggage: editBookingData.vehicle?.handLuggage ?? 0,
        checkinLuggage: editBookingData.vehicle?.checkinLuggage ?? 0,
      });

      setPassengerDetails({
        name: editBookingData.passenger?.name || "",
        email: editBookingData.passenger?.email || "",
        phone: editBookingData.passenger?.phone || "",
      });

      setJourney1Data({
        pickup: editBookingData.journey1?.pickup || "",
        date: editBookingData.journey1?.date || "",
        hour: editBookingData.journey1?.hour || "",
        minute: editBookingData.journey1?.minute || "",
        arrivefrom: editBookingData.journey1?.arrivefrom || "",
        pickmeAfter: editBookingData.journey1?.pickmeAfter || "",
        flightNumber: editBookingData.journey1?.flightNumber || "",
        pickupDoorNumber: editBookingData.journey1?.pickupDoorNumber || "",
        notes: editBookingData.journey1?.notes || "",
        internalNotes: editBookingData.journey1?.internalNotes || "",
        dropoffDoorNumber0: editBookingData.journey1?.dropoffDoorNumber0 || "",
        dropoff_terminal_0: editBookingData.journey1?.dropoff_terminal_0 || "",
      });

      setDropOffs1([
        editBookingData.journey1?.dropoff || "",
        editBookingData.journey1?.additionalDropoff1 || "",
        editBookingData.journey1?.additionalDropoff2 || "",
      ].filter(Boolean)); // clean empty entries

      // ✅ Return Journey — only if selected
      if (editBookingData.returnJourney) {
        setJourney2Data({
          pickup: editBookingData.journey2?.pickup || "",
          date: editBookingData.journey2?.date || "",
          hour: editBookingData.journey2?.hour || "",
          minute: editBookingData.journey2?.minute || "",
          arrivefrom: editBookingData.journey2?.arrivefrom || "",
          pickmeAfter: editBookingData.journey2?.pickmeAfter || "",
          flightNumber: editBookingData.journey2?.flightNumber || "",
          pickupDoorNumber: editBookingData.journey2?.pickupDoorNumber || "",
          notes: editBookingData.journey2?.notes || "",
          internalNotes: editBookingData.journey2?.internalNotes || "",
          dropoffDoorNumber0: editBookingData.journey2?.dropoffDoorNumber0 || "",
          dropoff_terminal_0: editBookingData.journey2?.dropoff_terminal_0 || "",
        });

        setDropOffs2([
          editBookingData.journey2?.dropoff || "",
          editBookingData.journey2?.additionalDropoff1 || "",
          editBookingData.journey2?.additionalDropoff2 || "",
        ].filter(Boolean));
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
      returnJourney: false, // ✅ always false now; treated as a single booking
      companyId,
      referrer: document.referrer || "manual",
      vehicle: {
        vehicleName: selectedVehicle?.vehicleName || "",
        ...vehicleExtras,
      },
      passenger: passengerDetails,
      journey1: {
        ...journey1Data,
        dropoff: dropOffs1[0],
        additionalDropoff1: dropOffs1[1] || null,
        additionalDropoff2: dropOffs1[2] || null,
        hourlyOption:
          mode === 'Hourly' && selectedHourly?.label
            ? selectedHourly.label
            : null,
        ...dynamicFields1,
      },
    };

    // Return Journey Payload (separate booking if needed)
    const returnPayload = {
      mode,
      returnJourney: false, // ✅ separate booking = false
      companyId,
      referrer: document.referrer || "manual",
      vehicle: {
        vehicleName: selectedVehicle?.vehicleName || "",
        ...vehicleExtras,
      },
      passenger: passengerDetails,
      journey1: {
        ...journey2Data,
        dropoff: dropOffs2[0],
        additionalDropoff1: dropOffs2[1] || null,
        additionalDropoff2: dropOffs2[2] || null,
        hourlyOption:
          mode === 'Hourly' && selectedHourly?.label
            ? selectedHourly.label
            : null,
        ...dynamicFields2,
      },
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

    // After triggerDistance call for returnPayload:
    try {
      const origin2 = journey2Data.pickup?.split(" - ").pop()?.trim();
      const destination2 = dropOffs2[0]?.split(" - ").pop()?.trim();

      if (returnJourney && origin2 && destination2) {
        const res2 = await triggerDistance({ origin: origin2, destination: destination2 }).unwrap();
        if (res2?.distanceText && res2?.durationText) {
          returnPayload.journey1.distanceText = res2.distanceText;
          returnPayload.journey1.durationText = res2.durationText;
        }
      }
    } catch (err) {
      console.warn("⚠️ Return journey distance error:", err);
    }


    try {
      if (editBookingData && editBookingData._id) {
        // Update only the primary journey (editing return bookings is separate)
        await updateBooking({ id: editBookingData._id, updatedData: payload }).unwrap();
        toast.success("Booking updated successfully.");
      } else {
        // Create primary journey booking
        await createBooking(payload).unwrap();
        toast.success("Primary journey booking submitted.");

        // If return journey is selected, submit it as a separate booking
        if (returnJourney) {
          await createBooking(returnPayload).unwrap();
          toast.success("Return journey booking submitted.");
        }
      }

      // Close modal or reset UI
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
              options={formattedHourlyOptions.map(opt => ({
                label: opt.label,
                value: JSON.stringify(opt.value),
              }))}
              value={JSON.stringify(selectedHourly?.value)}
              onChange={(e) => {
                const selected = formattedHourlyOptions.find(
                  opt => JSON.stringify(opt.value) === e.target.value
                );
                setSelectedHourly(selected);
              }}
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

        <VehicleSelection
          setSelectedVehicle={setSelectedVehicle}
          setVehicleExtras={setVehicleExtras}
          editBookingData={editBookingData}
        />

        <PassengerDetails
          passengerDetails={passengerDetails}
          setPassengerDetails={setPassengerDetails}
        />
        
        <FareSection handleSubmit={handleSubmit} isLoading={isLoading} editBookingData={editBookingData} />
      </div>
    </>
  );
};

export default NewBooking;
