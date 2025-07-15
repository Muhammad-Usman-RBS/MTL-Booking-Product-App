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
import { useGetGeneralPricingPublicQuery } from "../../../redux/api/generalPricingApi";

const NewBooking = ({ editBookingData = null, onClose }) => {
  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;
  const userEmail = user?.email || "";

  const { data: hourlyPackages = [] } = useGetAllHourlyRatesQuery(companyId, { skip: !companyId });
  const { data: generalPricing } = useGetGeneralPricingPublicQuery(companyId, { skip: !companyId });

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

  // Calculate additional drop-off pricing manually
  const extraDropoffPrice = (count) => {
    const base = 0; // fallback if no generalPricing
    const rate = generalPricing?.minAdditionalDropOff || base;
    return Math.max(0, (count - 1)) * rate;
  };

  // convert primaryJourneyData date + hour + minute to a JS Date
  const getJourneyDate = (data) => {
    if (!data.date) return null;
    const dt = new Date(data.date);
    dt.setHours(Number(data.hour || 0));
    dt.setMinutes(Number(data.minute || 0));
    return dt;
  };

  const { calculatedFare: primaryFare, pricingMode: primaryFareMode, } = useBookingFare({
    companyId,
    pickup: primaryJourneyData.pickup,
    dropoff: dropOffs1[0],
    selectedVehicle,
    mode,
    selectedHourly,
    dropOffPrice: extraDropoffPrice(dropOffs1.length),
    journeyDateTime: getJourneyDate(primaryJourneyData),
    includeAirportFees: true,
    includeChildSeat: vehicleExtras.childSeat > 0,
    childSeatCount: vehicleExtras.childSeat,
  });

  const { calculatedFare: returnFare, pricingMode: returnFareMode, } = useBookingFare({
    companyId,
    pickup: returnJourneyData.pickup,
    dropoff: dropOffs2[0],
    selectedVehicle,
    mode,
    selectedHourly,
    dropOffPrice: extraDropoffPrice(dropOffs2.length),
    journeyDateTime: getJourneyDate(returnJourneyData),
    includeAirportFees: true,
    includeChildSeat: vehicleExtras.childSeat > 0,
    childSeatCount: vehicleExtras.childSeat,
  });

  const [fareDetails, setFareDetails] = useState({
    paymentMethod: "Cash",
    cardPaymentReference: "",
    paymentGateway: "",
    journeyFare: 0,
    driverFare: 0,
    returnJourneyFare: 0,
    returnDriverFare: 0,
    emailNotifications: { admin: false, customer: false },
    appNotifications: { customer: false }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyId || !primaryJourneyData.pickup || !dropOffs1[0]) {
      return toast.error("Missing required fields");
    }

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

    const isReverseJourney =
      returnJourneyToggle &&
      primaryJourneyData.pickup?.trim() === dropOffs2[0]?.trim() &&
      dropOffs1[0]?.trim() === returnJourneyData.pickup?.trim();

    const vehicleData = {
      vehicleName: selectedVehicle?.vehicleName || "",
      ...vehicleExtras,
    };

    const passengerData = passengerDetails;

    // NEW common fare & payment fields
    const paymentFields = {
      paymentMethod: fareDetails.paymentMethod,
      cardPaymentReference: fareDetails.cardPaymentReference,
      paymentGateway: fareDetails.paymentGateway,
      journeyFare: parseFloat(fareDetails.journeyFare) || 0,
      driverFare: parseFloat(fareDetails.driverFare) || 0,
      returnJourneyFare: parseFloat(fareDetails.returnJourneyFare) || 0,
      returnDriverFare: parseFloat(fareDetails.returnDriverFare) || 0,
      emailNotifications: {
        admin: !!fareDetails.emailNotifications.admin,
        customer: !!fareDetails.emailNotifications.customer,
      },
      appNotifications: {
        customer: !!fareDetails.appNotifications.customer,
      },
    };

    try {
      // ✅ Case 1: One booking with reverse journey
      if (returnJourneyToggle && isReverseJourney) {
        const payload = {
          mode,
          returnJourneyToggle: false,
          companyId,
          referrer: document.referrer || "manual",
          vehicle: vehicleData,
          passenger: passengerData,
          primaryJourney: {
            ...primaryJourneyData,
            dropoff: dropOffs1[0],
            additionalDropoff1: dropOffs1[1] || null,
            additionalDropoff2: dropOffs1[2] || null,
            hourlyOption: mode === "Hourly" && selectedHourly?.label ? selectedHourly.label : null,
            fare: primaryFare,
            ...dynamicFields1,
          },
          returnJourney: {
            ...returnJourneyData,
            dropoff: dropOffs2[0],
            additionalDropoff1: dropOffs2[1] || null,
            additionalDropoff2: dropOffs2[2] || null,
            hourlyOption: mode === "Hourly" && selectedHourly?.label ? selectedHourly.label : null,
            fare: returnFare,
            ...dynamicFields2,
          },
          PassengerEmail: emailNotify.customer ? passengerDetails.email : null,
          ClientAdminEmail: emailNotify.admin ? userEmail : null,
          ...paymentFields,
        };

        await createBooking(payload).unwrap();
        toast.success("Return journey booked with primary journey.");
        onClose?.();
        return;
      }

      // ✅ Case 2: Primary + second saved as returnJourney
      const payload1 = {
        mode,
        returnJourneyToggle: false,
        companyId,
        referrer: document.referrer || "manual",
        vehicle: vehicleData,
        passenger: passengerData,
        primaryJourney: {
          ...primaryJourneyData,
          dropoff: dropOffs1[0],
          additionalDropoff1: dropOffs1[1] || null,
          additionalDropoff2: dropOffs1[2] || null,
          hourlyOption: mode === "Hourly" && selectedHourly?.label ? selectedHourly.label : null,
          fare: primaryFare,
          ...dynamicFields1,
        },
        PassengerEmail: emailNotify.customer ? passengerDetails.email : null,
        ClientAdminEmail: emailNotify.admin ? userEmail : null,
        ...paymentFields,
      };

      await createBooking(payload1).unwrap();

      if (returnJourneyToggle) {
        const payload2 = {
          mode,
          returnJourneyToggle: true,
          companyId,
          referrer: document.referrer || "manual",
          vehicle: vehicleData,
          passenger: passengerData,
          primaryJourney: {
            ...primaryJourneyData,
            dropoff: dropOffs1[0],
            additionalDropoff1: dropOffs1[1] || null,
            additionalDropoff2: dropOffs1[2] || null,
            hourlyOption: mode === "Hourly" && selectedHourly?.label ? selectedHourly.label : null,
            fare: primaryFare,
            ...dynamicFields1,
          },
          returnJourney: {
            ...returnJourneyData,
            dropoff: dropOffs2[0],
            additionalDropoff1: dropOffs2[1] || null,
            additionalDropoff2: dropOffs2[2] || null,
            hourlyOption: mode === "Hourly" && selectedHourly?.label ? selectedHourly.label : null,
            fare: returnFare,
            ...dynamicFields2,
          },
          PassengerEmail: emailNotify.customer ? passengerDetails.email : null,
          ClientAdminEmail: emailNotify.admin ? userEmail : null,
          ...paymentFields,
        };

        await createBooking(payload2).unwrap();
      }

      toast.success("Two bookings created. Return journey saved inside returnJourney.");
      onClose?.();
    } catch (err) {
      toast.error("Booking failed.");
    }
  };

  return (
    <>
      {!editBookingData?._id && <OutletHeading name="New Booking" />}
      <div className="flex flex-col items-center justify-center mb-6 space-y-4">
        <div className="flex">
          {["Transfer", "Hourly"].map((tab) => (
            <button
              key={tab}
              onClick={() => setMode(tab)}
              className={`px-6 py-2 font-semibold text-sm border cursor-pointer ${mode === tab
                ? "bg-white text-[var(--main-color)] border-2 border-[var(--main-color)]"
                : "bg-[#f9fafb] text-gray-700 border-gray-300"
                } ${tab === "Transfer" ? "rounded-l-md" : "rounded-r-md"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Hourly Dropdown */}
        {mode === "Hourly" && (
          <div className="w-full max-w-xs">
            <SelectOption
              options={hourlyPackages.map((pkg) => ({
                label: `${pkg.distance} miles ${pkg.hours} hours`,
                value: JSON.stringify({
                  distance: pkg.distance,
                  hours: pkg.hours,
                }),
              }))}
              value={JSON.stringify(selectedHourly?.value)}
              onChange={(e) => {
                const selected = hourlyPackages.find(
                  (pkg) =>
                    JSON.stringify({
                      distance: pkg.distance,
                      hours: pkg.hours,
                    }) === e.target.value
                );
                setSelectedHourly({
                  label: `${selected.distance} miles ${selected.hours} hours`,
                  value: {
                    distance: selected.distance,
                    hours: selected.hours,
                  },
                });
              }}
            />
          </div>
        )}
      </div>

      <div className="w-full flex flex-col items-center gap-6">
        <div className={`w-full ${returnJourneyToggle ? "lg:max-w-6xl gap-4" : "lg:max-w-4xl"} flex flex-col lg:flex-row`}>
          {/* Journey 1 */}
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

          {/* Journey 2 (conditionally shown) */}
          {returnJourneyToggle && (
            <div className="w-full transition-all duration-200 ease-in-out transform">
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
            </div>
          )}
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center mt-6 mb-6">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="col-span-6">
          <div className="bg-white shadow-lg rounded-2xl border border-gray-200">
            <div className="bg-[#0f192d] px-6 rounded-t-2xl py-3">
              <h2 className="text-xl font-bold text-gray-50">Passenger & Vehicle Details:-</h2>
            </div>
            <div className="p-6">
              <PassengerDetails passengerDetails={passengerDetails} setPassengerDetails={setPassengerDetails} />
              <hr className="mb-6 mt-6 border-gray-300" />
              <VehicleSelection setSelectedVehicle={setSelectedVehicle} setVehicleExtras={setVehicleExtras} editBookingData={editBookingData} />
            </div>
          </div>
        </div>
        <div className="col-span-6">
          <FareSection emailNotify={emailNotify} fareDetails={fareDetails} setFareDetails={setFareDetails} setEmailNotify={setEmailNotify} handleSubmit={handleSubmit} isLoading={isLoading} editBookingData={editBookingData} />
        </div>
      </div>

      <div className="flex justify-center mt-12">
        <button
          onClick={handleSubmit}
          className="btn btn-success font-semibold px-6 py-2 rounded-md shadow transition"
          disabled={isLoading}
        >
          {isLoading
            ? "Processing..."
            : editBookingData && editBookingData._id
              ? "Update Booking"
              : "Submit Booking"}
        </button>
      </div>
    </>
  );
};

export default NewBooking;
