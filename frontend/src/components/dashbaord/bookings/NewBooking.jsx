import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import FareSection from "./FareSection";
import JourneyCard from "./JourneyCard";
import "react-toastify/dist/ReactToastify.css";
import PassengerDetails from "./PassengerDetails";
import VehicleSelection from "./VehicleSelection";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import { useSelector } from "react-redux";
import { useCreateBookingMutation, useUpdateBookingMutation } from "../../../redux/api/bookingApi";
import { useGetAllHourlyRatesQuery } from "../../../redux/api/hourlyPricingApi";
import { useBookingFare } from "../../../utils/useBookingFare";

const NewBooking = ({ editBookingData = null, onClose }) => {
  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;
  const userEmail = user?.email || "";

  const { data: hourlyPackages = [] } = useGetAllHourlyRatesQuery(companyId, { skip: !companyId });
  const [emailNotify, setEmailNotify] = useState({ admin: false, customer: false });
  const [mode, setMode] = useState("Transfer");
  const [returnJourneyToggle, setreturnJourneyToggle] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedHourly, setSelectedHourly] = useState(null);
  const [vehicleExtras, setVehicleExtras] = useState({ passenger: 0, childSeat: 0, handLuggage: 0, checkinLuggage: 0 });
  const [passengerDetails, setPassengerDetails] = useState({ name: "", email: "", phone: "" });

  const [primaryJourneyData, setPrimaryJourneyData] = useState({ pickup: "", date: "", hour: "", minute: "" });
  const [returnJourneyData, setReturnJourneyData] = useState({ pickup: "", date: "", hour: "", minute: "" });
  const [dropOffs1, setDropOffs1] = useState([""]);
  const [dropOffs2, setDropOffs2] = useState([""]);

  const [createBooking, { isLoading }] = useCreateBookingMutation();
  const [updateBooking] = useUpdateBookingMutation();

  const { calculatedFare: primaryFare, pricingMode: primaryFareMode, } = useBookingFare({
    companyId,
    pickup: primaryJourneyData.pickup,
    dropoff: dropOffs1[0],
    selectedVehicle,
    mode,
    selectedHourly
  });

  const { calculatedFare: returnFare, pricingMode: returnFareMode, } = useBookingFare({
    companyId,
    pickup: returnJourneyData.pickup,
    dropoff: dropOffs2[0],
    selectedVehicle,
    mode,
    selectedHourly
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyId || !primaryJourneyData.pickup || !dropOffs1[0]) return toast.error("Missing required fields");

    const dynamicFields1 = {};
    dropOffs1.forEach((_, i) => {
      dynamicFields1[`dropoffDoorNumber${i}`] = primaryJourneyData[`dropoffDoorNumber${i}`] || "";
      dynamicFields1[`dropoff_terminal_${i}`] = primaryJourneyData[`dropoff_terminal_${i}`] || "";
    });

    const dynamicFields2 = {};
    dropOffs2.forEach((_, i) => {
      dynamicFields2[`dropoffDoorNumber${i}`] = returnJourneyData[`dropoffDoorNumber${i}`] || "";
      dynamicFields2[`dropoff_terminal_${i}`] = returnJourneyData[`dropoff_terminal_${i}`] || "";
    });

    const payload = {
      mode,
      returnJourneyToggle,
      companyId,
      referrer: document.referrer || "manual",
      vehicle: { vehicleName: selectedVehicle?.vehicleName || "", ...vehicleExtras },
      passenger: passengerDetails,
      primaryJourney: {
        ...primaryJourneyData,
        dropoff: dropOffs1[0],
        additionalDropoff1: dropOffs1[1] || null,
        additionalDropoff2: dropOffs1[2] || null,
        hourlyOption: mode === "Hourly" && selectedHourly?.label ? selectedHourly.label : null,
        fare: primaryFare,
        ...dynamicFields1
      },
      PassengerEmail: emailNotify.customer ? passengerDetails.email : null,
      ClientAdminEmail: emailNotify.admin ? userEmail : null
    };

    if (returnJourneyToggle) {
      payload.returnJourney = {
        ...returnJourneyData,
        dropoff: dropOffs2[0],
        additionalDropoff1: dropOffs2[1] || null,
        additionalDropoff2: dropOffs2[2] || null,
        hourlyOption: mode === "Hourly" && selectedHourly?.label ? selectedHourly.label : null,
        fare: returnFare,
        ...dynamicFields2
      };
    }

    try {
      if (editBookingData?._id) {
        await updateBooking({ id: editBookingData._id, updatedData: payload }).unwrap();
        toast.success("Booking updated successfully.");
      } else {
        await createBooking(payload).unwrap();
        toast.success("Booking created successfully.");
      }
      onClose?.();
    } catch (err) {
      toast.error("Booking failed.");
    }
  };

  return (
    <div className="">
      {!editBookingData?._id && <OutletHeading name="New Booking" />}
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
            options={hourlyPackages.map((pkg) => ({
              label: `${pkg.distance} miles ${pkg.hours} hours`,
              value: JSON.stringify({ distance: pkg.distance, hours: pkg.hours }),
            }))}
            value={JSON.stringify(selectedHourly?.value)}
            onChange={(e) => {
              const selected = hourlyPackages.find(
                (pkg) => JSON.stringify({ distance: pkg.distance, hours: pkg.hours }) === e.target.value
              );
              setSelectedHourly({
                label: `${selected.distance} miles ${selected.hours} hours`,
                value: { distance: selected.distance, hours: selected.hours }
              });
            }}
          />
        </div>
      )}

      <JourneyCard
        title="Journey 1"
        journeyData={primaryJourneyData}
        setJourneyData={setPrimaryJourneyData}
        dropOffs={dropOffs1}
        setDropOffs={setDropOffs1}
        fare={primaryFare}
        pricingMode={primaryFareMode}
        selectedVehicle={selectedVehicle}
        mode={mode}
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
          <span className="ml-4 text-sm font-medium text-gray-800">Return Journey</span>
        </label>
      </div>

      {returnJourneyToggle && (
        <JourneyCard
          title="Journey 2"
          journeyData={returnJourneyData}
          setJourneyData={setReturnJourneyData}
          dropOffs={dropOffs2}
          setDropOffs={setDropOffs2}
          fare={returnFare}
          pricingMode={returnFareMode}
          selectedVehicle={selectedVehicle}
          mode={mode}
        />
      )}

      <VehicleSelection setSelectedVehicle={setSelectedVehicle} setVehicleExtras={setVehicleExtras} editBookingData={editBookingData} />
      <PassengerDetails passengerDetails={passengerDetails} setPassengerDetails={setPassengerDetails} />
      <FareSection emailNotify={emailNotify} setEmailNotify={setEmailNotify} handleSubmit={handleSubmit} isLoading={isLoading} editBookingData={editBookingData} />
    </div>
  );
};

export default NewBooking;