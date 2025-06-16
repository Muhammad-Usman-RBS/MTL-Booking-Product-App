import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
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
  const userEmail = user?.email || "";

  const companyId = user?.companyId;

  const { data: hourlyPackages = [] } = useGetAllHourlyRatesQuery(companyId, {
    skip: !companyId,
  });
  const [emailNotify, setEmailNotify] = useState({
    admin: false,
    customer: false,
  });
  const [mode, setMode] = useState("Transfer");
  const [returnJourneyToggle, setreturnJourneyToggle] = useState(false);
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

  const [primaryJourneyData, setprimaryJourneyData] = useState({
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

  const [returnJourneyData, setreturnJourneyData] = useState({
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
    return hourlyPackages.map((pkg) => ({
      label: `${pkg.distance} miles ${pkg.hours} hours`,
      value: { distance: pkg.distance, hours: pkg.hours },
    }));
  }, [hourlyPackages]);

  useEffect(() => {
    if (editBookingData) {
      setMode(editBookingData.mode || "Transfer");
      setreturnJourneyToggle(editBookingData.returnJourneyToggle || false);
      setSelectedVehicle(editBookingData.vehicle || null);

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

      setprimaryJourneyData({
        pickup: editBookingData.primaryJourney?.pickup || "",
        date: editBookingData.primaryJourney?.date || "",
        hour: editBookingData.primaryJourney?.hour || "",
        minute: editBookingData.primaryJourney?.minute || "",
        arrivefrom: editBookingData.primaryJourney?.arrivefrom || "",
        pickmeAfter: editBookingData.primaryJourney?.pickmeAfter || "",
        flightNumber: editBookingData.primaryJourney?.flightNumber || "",
        pickupDoorNumber:
          editBookingData.primaryJourney?.pickupDoorNumber || "",
        notes: editBookingData.primaryJourney?.notes || "",
        internalNotes: editBookingData.primaryJourney?.internalNotes || "",
        dropoffDoorNumber0:
          editBookingData.primaryJourney?.dropoffDoorNumber0 || "",
        dropoff_terminal_0:
          editBookingData.primaryJourney?.dropoff_terminal_0 || "",
      });

      setDropOffs1(
        [
          editBookingData.primaryJourney?.dropoff || "",
          editBookingData.primaryJourney?.additionalDropoff1 || "",
          editBookingData.primaryJourney?.additionalDropoff2 || "",
        ].filter(Boolean)
      );

      if (editBookingData.returnJourneyToggle) {
        setreturnJourneyData({
          pickup: editBookingData.returnJourney?.pickup || "",
          date: editBookingData.returnJourney?.date || "",
          hour: editBookingData.returnJourney?.hour || "",
          minute: editBookingData.returnJourney?.minute || "",
          arrivefrom: editBookingData.returnJourney?.arrivefrom || "",
          pickmeAfter: editBookingData.returnJourney?.pickmeAfter || "",
          flightNumber: editBookingData.returnJourney?.flightNumber || "",
          pickupDoorNumber:
            editBookingData.returnJourney?.pickupDoorNumber || "",
          notes: editBookingData.returnJourney?.notes || "",
          internalNotes: editBookingData.returnJourney?.internalNotes || "",
          dropoffDoorNumber0:
            editBookingData.returnJourney?.dropoffDoorNumber0 || "",
          dropoff_terminal_0:
            editBookingData.returnJourney?.dropoff_terminal_0 || "",
        });

        setDropOffs2(
          [
            editBookingData.returnJourney?.dropoff || "",
            editBookingData.returnJourney?.additionalDropoff1 || "",
            editBookingData.returnJourney?.additionalDropoff2 || "",
          ].filter(Boolean)
        );
      }

      if (editBookingData.primaryJourney?.hourlyOption) {
        setSelectedHourly(editBookingData.primaryJourney.hourlyOption);
      }
    }
  }, [editBookingData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!companyId || companyId.length !== 24) {
      toast.error("Missing or invalid company ID.");
      return;
    }

    if (!primaryJourneyData.pickup || dropOffs1[0].trim() === "") {
      toast.error("Pickup and at least one Drop Off is required.");
      return;
    }

    const dynamicFields1 = {};
    dropOffs1.forEach((_, idx) => {
      dynamicFields1[`dropoffDoorNumber${idx}`] =
        primaryJourneyData[`dropoffDoorNumber${idx}`] || "";
      dynamicFields1[`dropoff_terminal_${idx}`] =
        primaryJourneyData[`dropoff_terminal_${idx}`] || "";
    });

    const dynamicFields2 = {};
    dropOffs2.forEach((_, idx) => {
      dynamicFields2[`dropoffDoorNumber${idx}`] =
        returnJourneyData[`dropoffDoorNumber${idx}`] || "";
      dynamicFields2[`dropoff_terminal_${idx}`] =
        returnJourneyData[`dropoff_terminal_${idx}`] || "";
    });

    const payload = {
      mode,
      returnJourneyToggle,
      companyId,
      referrer: document.referrer || "manual",

      vehicle: {
        vehicleName: selectedVehicle?.vehicleName || "",
        ...vehicleExtras,
      },
      passenger: passengerDetails,
      primaryJourney: {
        ...primaryJourneyData,
        dropoff: dropOffs1[0],
        additionalDropoff1: dropOffs1[1] || null,
        additionalDropoff2: dropOffs1[2] || null,
        hourlyOption:
          mode === "Hourly" && selectedHourly?.label
            ? selectedHourly.label
            : null,
        ...dynamicFields1,
      },
    };
    payload.PassengerEmail = emailNotify.customer
      ? passengerDetails?.email || ""
      : null;
    payload.ClientAdminEmail = emailNotify.admin ? userEmail || "" : null;

    const returnPayload = {
      mode,
      returnJourneyToggle: false,
      companyId,

      referrer: document.referrer || "manual",
      vehicle: {
        vehicleName: selectedVehicle?.vehicleName || "",
        ...vehicleExtras,
      },
      passenger: passengerDetails,

      returnJourney: {
        ...returnJourneyData,
        dropoff: dropOffs2[0],
        additionalDropoff1: dropOffs2[1] || null,
        additionalDropoff2: dropOffs2[2] || null,
        hourlyOption:
          mode === "Hourly" && selectedHourly?.label
            ? selectedHourly.label
            : null,
        ...dynamicFields2,
      },
    };
    returnPayload.PassengerEmail = emailNotify.customer
      ? passengerDetails?.email || ""
      : null;
    returnPayload.ClientAdminEmail = emailNotify.admin ? userEmail || "" : null;

    try {
      const origin = primaryJourneyData.pickup?.split(" - ").pop()?.trim();
      const destination = dropOffs1[0]?.split(" - ").pop()?.trim();

      if (origin && destination) {
        const res = await triggerDistance({ origin, destination }).unwrap();
        if (res?.distanceText && res?.durationText) {
          payload.primaryJourney.distanceText = res.distanceText;
          payload.primaryJourney.durationText = res.durationText;
        }
      }
    } catch (err) {
      console.warn("⚠️ Distance matrix error:", err);
    }

    try {
      if (returnJourneyToggle) {
        const origin2 = returnJourneyData.pickup?.split(" - ").pop()?.trim();
        const destination2 = dropOffs2[0]?.split(" - ").pop()?.trim();

        if (origin2 && destination2) {
          const res2 = await triggerDistance({
            origin: origin2,
            destination: destination2,
          }).unwrap();
          if (res2?.distanceText && res2?.durationText) {
            returnPayload.primaryJourney.distanceText = res2.distanceText;
            returnPayload.primaryJourney.durationText = res2.durationText;
          }
        }
      }
    } catch (err) {
      console.warn("⚠️ Return journey distance error:", err);
    }

    try {
      if (editBookingData && editBookingData._id) {
        await updateBooking({
          id: editBookingData._id,
          updatedData: payload,
        }).unwrap();
        toast.success("Booking updated successfully.");
      } else {
        // Add return journey data to the same payload if toggle is on
        if (returnJourneyToggle) {
          payload.returnJourney = {
            ...returnJourneyData,
            dropoff: dropOffs2[0],
            additionalDropoff1: dropOffs2[1] || null,
            additionalDropoff2: dropOffs2[2] || null,
            hourlyOption:
              mode === "Hourly" && selectedHourly?.label
                ? selectedHourly.label
                : null,
            ...dynamicFields2,
          };
        }

        // Make only ONE API call with both journeys
        await createBooking(payload).unwrap();
        toast.success(
          returnJourneyToggle
            ? "Booking with return journey created successfully."
            : "Booking created successfully."
        );
      }

      if (onClose) onClose();
    } catch (err) {
      console.error("❌ Booking error:", err);
      toast.error("Failed to process booking.");
    }
  };

  return (
    <>
      <div className={editBookingData ? "ps-5 pe-5 pt-5" : "ps-0 pe-0"}>
        <div className={editBookingData ? "hidden" : "block"}>
          <OutletHeading
            name={
              editBookingData && !editBookingData._id
                ? "Copy Booking"
                : "New Booking"
            }
          />
        </div>

        <div className="flex justify-center mb-4">
          {["Transfer", "Hourly"].map((tab) => (
            <button
              key={tab}
              onClick={() => setMode(tab)}
              className={`px-6 py-2 font-medium transition-all cursor-pointer duration-200 ${
                mode === tab
                  ? "bg-[#f3f4f6] text-dark border border-black"
                  : "bg-[#f3f4f6] text-dark"
              } ${tab === "Transfer" ? "rounded-l-md" : "rounded-r-md"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {mode === "Hourly" && (
          <div className="flex justify-center">
            <SelectOption
              options={formattedHourlyOptions.map((opt) => ({
                label: opt.label,
                value: JSON.stringify(opt.value),
              }))}
              value={JSON.stringify(selectedHourly?.value)}
              onChange={(e) => {
                const selected = formattedHourlyOptions.find(
                  (opt) => JSON.stringify(opt.value) === e.target.value
                );
                setSelectedHourly(selected);
              }}
              width="w-full md:w-64"
            />
          </div>
        )}

        <JourneyCard
          title="Journey 1"
          journeyData={primaryJourneyData}
          setJourneyData={setprimaryJourneyData}
          dropOffs={dropOffs1}
          setDropOffs={setDropOffs1}
        />

        <div className="flex items-center mt-6 w-full max-w-4xl mx-auto">
          <label className="flex items-center cursor-pointer relative">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={returnJourneyToggle}
              onChange={(e) => setreturnJourneyToggle(e.target.checked)}
            />
            <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors duration-300"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transform peer-checked:translate-x-6 transition-transform duration-300"></div>
            <span className="ml-4 text-sm font-medium text-gray-800">
              Return Journey
            </span>
          </label>
        </div>

        {returnJourneyToggle && (
          <JourneyCard
            title="Journey 2"
            journeyData={returnJourneyData}
            setJourneyData={setreturnJourneyData}
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

        <FareSection
          emailNotify={emailNotify}
          setEmailNotify={setEmailNotify}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          editBookingData={editBookingData}
        />
      </div>
    </>
  );
};

export default NewBooking;
