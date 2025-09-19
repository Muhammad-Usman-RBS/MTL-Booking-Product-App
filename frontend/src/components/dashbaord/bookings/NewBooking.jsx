import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

// Components
import FareSection from "./createBooking/FareSection";
import JourneyCard from "./createBooking/JourneyCard";
import PassengerDetails from "./createBooking/PassengerDetails";

// Shared / Reusable Components
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";

// Hooks & Utils
import { useBookingFare } from "../../../utils/useBookingFare";

// API Hooks
import { useGetAllHourlyRatesQuery } from "../../../redux/api/hourlyPricingApi";
import { useGetBookingSettingQuery } from "../../../redux/api/bookingSettingsApi";
import { useGetGeneralPricingPublicQuery } from "../../../redux/api/generalPricingApi";
import { useGetCorporateCustomerByVatQuery } from "../../../redux/api/corporateCustomerApi";
import { useCreateBookingMutation, useUpdateBookingMutation } from "../../../redux/api/bookingApi";

// Styles
import "react-toastify/dist/ReactToastify.css";
import VehicleSelection from "./createBooking/VehicleSelection";

const NewBooking = ({ editBookingData = null, onClose }) => {
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;
  const userEmail = user?.email || "";
  const isCopyMode = !!editBookingData?.__copyMode;
  const userRole = user?.role || "";
  const vatnumber = user?.vatnumber || "";

  const isEditing = !!editBookingData?._id && !editBookingData?.__copyMode;

  const [mode, setMode] = useState("Transfer");
  const [selectedHourly, setSelectedHourly] = useState(null);

  const { data: customerByVat, isFetching, error } = useGetCorporateCustomerByVatQuery(vatnumber, {
    skip: !vatnumber,
  });

  const { data: bookingSettingData, isFetching: isBookingSettingLoading } = useGetBookingSettingQuery();

  const hourlyEnabled = !!(bookingSettingData?.setting?.hourlyPackage ?? bookingSettingData?.setting?.hourLyPackage);

  useEffect(() => {
    if (!hourlyEnabled && mode === "Hourly") {
      setMode("Transfer");
      setSelectedHourly(null);
    }
  }, [hourlyEnabled, mode]);

  const TABS = hourlyEnabled ? ["Transfer", "Hourly"] : ["Transfer"];

  const [hasChangedPrimaryLocations, setHasChangedPrimaryLocations] =
    useState(false);
  const [hasChangedReturnLocations, setHasChangedReturnLocations] =
    useState(false);

  const [originalPrimaryLocations, setOriginalPrimaryLocations] =
    useState(null);
  const [originalReturnLocations, setOriginalReturnLocations] = useState(null);

  const { data: hourlyPackages = [] } = useGetAllHourlyRatesQuery(companyId, {
    skip: !companyId,
  });
  const { data: generalPricing } = useGetGeneralPricingPublicQuery(companyId, {
    skip: !companyId,
  });

  const [emailNotify, setEmailNotify] = useState({
    admin: false,
    customer: false,
  });
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

  const [primaryJourneyData, setPrimaryJourneyData] = useState({
    pickup: "",
    date: "",
    hour: "",
    minute: "",
  });
  const [returnJourneyData, setReturnJourneyData] = useState({
    pickup: "",
    date: "",
    hour: "",
    minute: "",
  });
  const [dropOffs1, setDropOffs1] = useState([""]);
  const [dropOffs2, setDropOffs2] = useState([""]);
  const [pickupType1, setPickupType1] = useState(null);
  const [pickupType2, setPickupType2] = useState(null);
  const [dropOffTypes1, setDropOffTypes1] = useState({});
  const [dropOffTypes2, setDropOffTypes2] = useState({});
  const [createBooking, { isLoading }] = useCreateBookingMutation();
  const [updateBooking] = useUpdateBookingMutation();
  const [localEditData, setLocalEditData] = useState(null);

  const extraDropoffPrice = (count) => {
    const base = 0;
    const rate = generalPricing?.minAdditionalDropOff || base;
    return Math.max(0, count - 1) * rate;
  };

  const getJourneyDate = (data) => {
    if (!data.date) return null;
    const dt = new Date(data.date);
    dt.setHours(Number(data.hour || 0));
    dt.setMinutes(Number(data.minute || 0));
    return dt;
  };

  const journeyDateTime = getJourneyDate(primaryJourneyData);
  const isReturnJourney =
    !!editBookingData?.__editReturn ||
    !!editBookingData?.__copyReturn ||
    returnJourneyToggle;

  const shouldCalculatePrimaryFare =
    !editBookingData || hasChangedPrimaryLocations;
  const shouldCalculateReturnFare =
    !editBookingData || hasChangedReturnLocations;

  const {
    calculatedFare: primaryFare,
    pricingMode: primaryFareMode,
    hourlyError: hourlyError,
    distanceText: primaryDistanceText,
    durationText: primaryDurationText,
  } = useBookingFare({
    companyId,
    pickup: primaryJourneyData.pickup,
    dropoff: dropOffs1[0],
    selectedVehicle,
    mode,
    selectedHourly,
    dropOffPrice: extraDropoffPrice(dropOffs1.length),
    journeyDateTime,
    includeAirportFees: true,
    includeChildSeat: vehicleExtras.childSeat > 0,
    childSeatCount: vehicleExtras.childSeat,
    enabled: shouldCalculatePrimaryFare,
  });

  const {
    calculatedFare: returnFare,
    distanceText: returnDistanceText,
    durationText: returnDurationText,
    pricingMode: returnFareMode,
  } = useBookingFare({
    companyId,
    pickup: returnJourneyData.pickup,
    dropoff: dropOffs2[0],
    selectedVehicle,
    mode,
    selectedHourly,
    dropOffPrice: extraDropoffPrice(dropOffs2.length),
    journeyDateTime,
    includeAirportFees: true,
    includeChildSeat: vehicleExtras.childSeat > 0,
    childSeatCount: vehicleExtras.childSeat,
    enabled: shouldCalculateReturnFare,
  });

  const [fareDetails, setFareDetails] = useState({
    paymentMethod: "Cash",
    cardPaymentReference: "",
    paymentGateway: "",
    journeyFare: "",
    driverFare: "",
    returnJourneyFare: "",
    returnDriverFare: "",
    emailNotifications: { admin: false, customer: false },
    appNotifications: { customer: false },
  });

  const checkPrimaryLocationsChanged = () => {
    if (!originalPrimaryLocations) return false;

    return (
      originalPrimaryLocations.pickup !== primaryJourneyData.pickup ||
      JSON.stringify(originalPrimaryLocations.dropOffs) !==
      JSON.stringify(dropOffs1)
    );
  };

  const checkReturnLocationsChanged = () => {
    if (!originalReturnLocations) return false;

    return (
      originalReturnLocations.pickup !== returnJourneyData.pickup ||
      JSON.stringify(originalReturnLocations.dropOffs) !==
      JSON.stringify(dropOffs2)
    );
  };

  useEffect(() => {
    if (primaryFare != null) {
      setFareDetails((p) => {
        if (!fareTouched.journey) {
          return { ...p, journeyFare: primaryFare };
        }
        return p;
      });
    }
  }, [primaryFare, hasChangedPrimaryLocations]);

  useEffect(() => {
    if (returnJourneyToggle && returnFare != null) {
      setFareDetails((p) => {
        if (!fareTouched.return) {
          return { ...p, returnJourneyFare: returnFare };
        }
        return p;
      });
    }
  }, [returnFare, hasChangedReturnLocations, returnJourneyToggle]);

  useEffect(() => {
    if (customerByVat?.paymentOptionsInvoice) {
      setFareDetails((prevDetails) => ({
        ...prevDetails,
        paymentMethod: customerByVat.paymentOptionsInvoice,
      }));
    } else {
      setFareDetails((prevDetails) => ({
        ...prevDetails,
        paymentMethod: "Cash",
      }));
    }
  }, [customerByVat]);

  useEffect(() => {
    if (originalPrimaryLocations) {
      setHasChangedPrimaryLocations(checkPrimaryLocationsChanged());
    }
  }, [primaryJourneyData.pickup, dropOffs1]);

  useEffect(() => {
    if (editBookingData) {
      setFareDetails((prev) => ({
        ...prev,
        journeyFare: editBookingData.journeyFare || "",
        returnJourneyFare: editBookingData.returnJourneyFare || "",
      }));
    }
  }, [editBookingData]);

  useEffect(() => {
    if (originalReturnLocations) {
      setHasChangedReturnLocations(checkReturnLocationsChanged());
    }
  }, [returnJourneyData.pickup, dropOffs2]);

  useEffect(() => {
    if (!editBookingData) return;

    const cloned = JSON.parse(JSON.stringify(editBookingData));
    setLocalEditData(cloned);

    const isReturnJourneyEdit = cloned.__editReturn || cloned.__copyReturn;
    setreturnJourneyToggle(isReturnJourneyEdit);

    const journeyData = isReturnJourneyEdit
      ? cloned.returnJourney || {}
      : cloned.primaryJourney || {};

    const dropOffList = [
      journeyData.dropoff || "",
      journeyData.additionalDropoff1 || "",
      journeyData.additionalDropoff2 || "",
    ].filter(Boolean);

    const dynamicDropFields = Object.fromEntries(
      dropOffList.map((_, idx) => [
        `dropoffDoorNumber${idx}`,
        journeyData[`dropoffDoorNumber${idx}`] || "",
      ])
    );

    const dynamicTerminalFields = Object.fromEntries(
      dropOffList.map((_, idx) => [
        `dropoff_terminal_${idx}`,
        journeyData[`dropoff_terminal_${idx}`] || "",
      ])
    );

    const journeyState = {
      pickup: journeyData.pickup || "",
      dropoff: journeyData.dropoff || "",
      date: journeyData.date?.slice(0, 10) || "",
      hour: journeyData.hour?.toString().padStart(2, "0") || "",
      minute: journeyData.minute?.toString().padStart(2, "0") || "",
      notes: journeyData.notes || "",
      internalNotes: journeyData.internalNotes || "",
      arrivefrom: journeyData.arrivefrom || "",
      flightNumber: journeyData.flightNumber || "",
      pickmeAfter: journeyData.pickmeAfter || "",
      fare: journeyData.fare || "",
      pickupDoorNumber: journeyData.pickupDoorNumber || "",
      terminal: journeyData.terminal || "",
      distanceText: journeyData.distanceText || "",
      durationText: journeyData.durationText || "",
      ...dynamicDropFields,
      ...dynamicTerminalFields,
    };

    if (isReturnJourneyEdit) {
      setReturnJourneyData(journeyState);
      setDropOffs2(dropOffList);
      setOriginalReturnLocations({
        pickup: journeyState.pickup,
        dropOffs: [...dropOffList],
      });
    } else {
      setPrimaryJourneyData(journeyState);
      setDropOffs1(dropOffList);
      setOriginalPrimaryLocations({
        pickup: journeyState.pickup,
        dropOffs: [...dropOffList],
      });
    }

    if (cloned.returnJourney && !isReturnJourneyEdit) {
      const dynamicDropFieldsReturn = Object.fromEntries(
        returnDropOffList.map((_, idx) => [
          `dropoffDoorNumber${idx}`,
          cloned.returnJourney[`dropoffDoorNumber${idx}`] || "",
        ])
      );

      const dynamicTerminalFieldsReturn = Object.fromEntries(
        returnDropOffList.map((_, idx) => [
          `dropoff_terminal_${idx}`,
          cloned.returnJourney[`dropoff_terminal_${idx}`] || "",
        ])
      );

      const returnJourneyState = {
        pickup: cloned.returnJourney.pickup || "",
        dropoff: cloned.returnJourney.dropoff || "",
        date: cloned.returnJourney.date?.slice(0, 10) || "",
        hour: cloned.returnJourney.hour?.toString().padStart(2, "0") || "",
        minute: cloned.returnJourney.minute?.toString().padStart(2, "0") || "",
        notes: cloned.returnJourney.notes || "",
        internalNotes: cloned.returnJourney.internalNotes || "",
        arrivefrom: cloned.returnJourney.arrivefrom || "",
        flightNumber: cloned.returnJourney.flightNumber || "",
        pickmeAfter: cloned.returnJourney.pickmeAfter || "",
        fare: cloned.returnJourney.fare || "",
        pickupDoorNumber: cloned.returnJourney.pickupDoorNumber || "",
        terminal: cloned.returnJourney.terminal || "",
        distanceText: cloned.returnJourney.distanceText || "",
        durationText: cloned.returnJourney.durationText || "",
        ...dynamicDropFieldsReturn,
        ...dynamicTerminalFieldsReturn,
      };

      setReturnJourneyData(returnJourneyState);
      setDropOffs2(returnDropOffList);
      setOriginalReturnLocations({
        pickup: returnJourneyState.pickup,
        dropOffs: [...returnDropOffList],
      });
      const returnDropOffList = [
        cloned.returnJourney.dropoff || "",
        cloned.returnJourney.additionalDropoff1 || "",
        cloned.returnJourney.additionalDropoff2 || "",
      ].filter(Boolean);

      setReturnJourneyData(returnJourneyState);
      setDropOffs2(returnDropOffList);
      setOriginalReturnLocations({
        pickup: returnJourneyState.pickup,
        dropOffs: [...returnDropOffList],
      });
    }

    setPassengerDetails({
      name: cloned.passenger?.name || "",
      email: cloned.passenger?.email || "",
      phone: cloned.passenger?.phone || "",
    });

    setSelectedVehicle(cloned.vehicle || null);

    setVehicleExtras({
      passenger: cloned.vehicle?.passenger || 0,
      childSeat: cloned.vehicle?.childSeat || 0,
      handLuggage: cloned.vehicle?.handLuggage || 0,
      checkinLuggage: cloned.vehicle?.checkinLuggage || 0,
    });

    setFareDetails((prev) => ({
      ...prev,
      paymentMethod: cloned.paymentMethod || "",
      cardPaymentReference: cloned.cardPaymentReference || "",
      paymentGateway: cloned.paymentGateway || "",
      journeyFare: cloned.journeyFare,
      driverFare: cloned.driverFare,
      returnJourneyFare: cloned.returnJourneyFare,
      returnDriverFare: cloned.returnDriverFare,
      emailNotifications: {
        admin: cloned?.emailNotifications?.admin || false,
        customer: cloned?.emailNotifications?.customer || false,
      },
      appNotifications: {
        customer: cloned?.appNotifications?.customer || false,
      },
    }));
  }, [editBookingData]);

  // NEW: track manual edits
  const [fareTouched, setFareTouched] = useState({ journey: false, return: false });

  useEffect(() => {
    if (primaryFare != null && !fareTouched.journey) {
      setFareDetails((p) => ({
        ...p,
        journeyFare: p.journeyFare || primaryFare, // Preserve existing journeyFare if already set
      }));
    }
  }, [primaryFare, fareTouched.journey]);

  useEffect(() => {
    if (returnJourneyToggle && returnFare != null && !fareTouched.return) {
      setFareDetails((p) => ({ ...p, returnJourneyFare: returnFare }));
    }
  }, [returnFare, returnJourneyToggle, fareTouched.return]);

  // Update local edit data with new calculated fares only when locations change
  useEffect(() => {
    if (
      localEditData?.primaryJourney &&
      hasChangedPrimaryLocations &&
      primaryFare
    ) {
      setLocalEditData((prev) => ({
        ...prev,
        primaryJourney: {
          ...prev.primaryJourney,
          fare: primaryFare,
        },
      }));
    }
  }, [primaryFare, hasChangedPrimaryLocations]);

  useEffect(() => {
    if (primaryFare && !fareDetails.journeyFare) {
      setFareDetails((prev) => ({
        ...prev,
        journeyFare: primaryFare,
      }));
    }
  }, [primaryFare]);

  useEffect(() => {
    if (primaryFare != null) {
      setFareDetails((prev) => {
        if (isEditing && !hasChangedPrimaryLocations) {
          return { ...prev, journeyFare: editBookingData.journeyFare };
        }
        return { ...prev, journeyFare: primaryFare };
      });
    }
  }, [primaryFare, isEditing, hasChangedPrimaryLocations, editBookingData?.journeyFare]);

  useEffect(() => {
    if (returnJourneyToggle && returnFare != null) {
      setFareDetails((prev) => {
        // ✅ if editing, always keep DB value unless user changed locations
        if (isEditing && !hasChangedReturnLocations) {
          return { ...prev, returnJourneyFare: editBookingData.returnJourneyFare };
        }
        // ✅ new booking or changed return locations → allow recalculated fare
        return { ...prev, returnJourneyFare: returnFare };
      });
    }
  }, [returnFare, returnJourneyToggle, isEditing, hasChangedReturnLocations, editBookingData?.returnJourneyFare]);

  const handlePrimaryJourneyDataChange = (newData) => {
    setPrimaryJourneyData(newData);
  };

  // Custom wrapper for setReturnJourneyData to track changes
  const handleReturnJourneyDataChange = (newData) => {
    setReturnJourneyData(newData);
  };

  // Custom wrapper for setDropOffs1 to track changes
  const handleDropOffs1Change = (newDropOffs) => {
    setDropOffs1(newDropOffs);
  };

  // Custom wrapper for setDropOffs2 to track changes
  const handleDropOffs2Change = (newDropOffs) => {
    setDropOffs2(newDropOffs);
  };

  // Get the display fare (original if not changed, calculated if changed)
  const getDisplayPrimaryFare = () => {
    if (!editBookingData) return primaryFare;
    if (hasChangedPrimaryLocations) return primaryFare;
    return localEditData?.primaryJourney?.fare || primaryFare;
  };

  const getDisplayReturnFare = () => {
    if (!editBookingData) return returnFare;
    if (hasChangedReturnLocations) return returnFare;
    return localEditData?.returnJourney?.fare || returnFare;
  };
  const validateAdvanceForJourney = (journey, journeyType = "primary") => {
    const setting = bookingSettingData?.setting?.advanceBookingMin;
    if (!setting) return true; // no rule configured

    const { value, unit } = setting;
    const { date, hour, minute } = journey || {};
    if (!date || hour === "" || minute === "") return true; // incomplete -> skip

    const now = new Date();
    const bookingDateTime = new Date(
      `${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`
    );

    let advanceMs = 0;
    const u = String(unit || "").toLowerCase();
    if (u === "hour" || u === "hours") advanceMs = value * 60 * 60 * 1000;
    else if (u === "minute" || u === "minutes") advanceMs = value * 60 * 1000;
    else if (u === "day" || u === "days") advanceMs = value * 24 * 60 * 60 * 1000;
    else return true; // unknown unit → don't block

    const minAllowed = new Date(now.getTime() + advanceMs);
    if (bookingDateTime < minAllowed) {
      const timeText = value === 1
        ? (u.endsWith("s") ? u.slice(0, -1) : u)
        : (u.endsWith("s") ? u : `${u}s`);
      // Only show toast for primary journey
      if (journeyType === "primary") {
        toast.error(`Booking must be made at least ${value} ${timeText} in advance!`);
      }
      return false;
    }
    return true;
  };
  const validateReturnJourneyTime = (primaryJourney, returnJourney) => {
    if (!primaryJourney.date || !returnJourney.date) return true;
    if (primaryJourney.hour === "" || primaryJourney.minute === "") return true;
    if (returnJourney.hour === "" || returnJourney.minute === "") return true;

    const primaryDateTime = new Date(
      `${primaryJourney.date}T${String(primaryJourney.hour).padStart(2, "0")}:${String(primaryJourney.minute).padStart(2, "0")}:00`
    );

    const returnDateTime = new Date(
      `${returnJourney.date}T${String(returnJourney.hour).padStart(2, "0")}:${String(returnJourney.minute).padStart(2, "0")}:00`
    );

    if (returnDateTime <= primaryDateTime) {
      toast.error("Return journey must be scheduled after the primary journey!");
      return false;
    }

    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userRole !== "clientadmin") {
      if (!validateAdvanceForJourney(primaryJourneyData, "primary")) return;

      if (returnJourneyToggle && dropOffs2[0]) {
        if (!validateAdvanceForJourney(returnJourneyData, "return")) return;
        if (!validateReturnJourneyTime(primaryJourneyData, returnJourneyData)) return;
      }
    }

    const isReturnJourney =
      !!editBookingData?.__editReturn || !!editBookingData?.__copyReturn;

    if (!companyId) {
      return toast.error("Missing company ID");
    }

    if (isReturnJourney) {
      if (!returnJourneyData?.pickup || !dropOffs2[0]) {
        return toast.error("Missing return journey fields");
      }
    } else {
      if (!primaryJourneyData?.pickup || !dropOffs1[0]) {
        return toast.error("Missing primary journey fields");
      }
    }

    const buildDynamicFields = (dropOffs, journeyData) => {
      const dynamic = {};
      dropOffs.forEach((_, i) => {
        dynamic[`dropoffDoorNumber${i}`] =
          journeyData?.[`dropoffDoorNumber${i}`] || "";
        dynamic[`dropoff_terminal_${i}`] =
          journeyData?.[`dropoff_terminal_${i}`] || "";
      });
      return dynamic;
    };

    const dynamicFields1 = buildDynamicFields(dropOffs1, primaryJourneyData);
    const dynamicFields2 = buildDynamicFields(dropOffs2, returnJourneyData);

    const vehicleData = {
      vehicleName: selectedVehicle?.vehicleName || "",
      ...vehicleExtras,
    };

    const paymentFields = {
      paymentMethod: fareDetails.paymentMethod,
      cardPaymentReference: fareDetails.cardPaymentReference,
      paymentGateway: fareDetails.paymentGateway,
      journeyFare: parseFloat(fareDetails.journeyFare),
      driverFare: parseFloat(fareDetails.driverFare),
      returnJourneyFare: parseFloat(fareDetails.returnJourneyFare),
      returnDriverFare: parseFloat(fareDetails.returnDriverFare) || 0,
      emailNotifications: {
        admin: !!fareDetails?.emailNotifications?.admin,
        customer: !!fareDetails?.emailNotifications?.customer,
      },
      appNotifications: {
        customer: !!fareDetails?.appNotifications?.customer,
      },
    };

    const basePayload = {
      mode,
      companyId,
      referrer: document.referrer || "manual",
      vehicle: vehicleData,
      passenger: passengerDetails,
      paymentMethod: paymentFields.paymentMethod,
      cardPaymentReference: paymentFields.cardPaymentReference,
      paymentGateway: paymentFields.paymentGateway,
      emailNotifications: paymentFields.emailNotifications,
      appNotifications: paymentFields.appNotifications,
      PassengerEmail: emailNotify.customer ? passengerDetails.email : null,
      ClientAdminEmail: emailNotify.admin ? userEmail : null,
    };

    try {
      if (isEditing) {
        const isAirportAddress = (address = "") =>
          address.toLowerCase().includes("airport");

        if (!isAirportAddress(primaryJourneyData.pickup)) {
          delete primaryJourneyData.pickmeAfter;
          delete primaryJourneyData.flightNumber;
          delete primaryJourneyData.arrivefrom;
        } else {
          delete primaryJourneyData.pickupDoorNumber;
        }

        if (returnJourneyToggle && dropOffs2[0]) {
          if (!isAirportAddress(returnJourneyData.pickup)) {
            delete returnJourneyData.pickmeAfter;
            delete returnJourneyData.flightNumber;
            delete returnJourneyData.arrivefrom;
          } else {
            delete returnJourneyData.pickupDoorNumber;
          }
        }
        const updatePayload = {
          ...basePayload,
          journeyFare: paymentFields.journeyFare,
          driverFare: paymentFields.driverFare,
          returnJourneyFare: paymentFields.returnJourneyFare,
          returnDriverFare: paymentFields.returnDriverFare,
        };

        if (isReturnJourney) {
          updatePayload.returnJourney = {
            ...returnJourneyData,
            dropoff: dropOffs2[0],
            additionalDropoff1: dropOffs2[1] || null,
            additionalDropoff2: dropOffs2[2] || null,
            hourlyOption:
              mode === "Hourly" && selectedHourly?.label
                ? selectedHourly.label
                : null,
            fare: getDisplayReturnFare(),
            ...dynamicFields2,
          };
          updatePayload.returnJourneyToggle = true;
        } else {
          updatePayload.primaryJourney = {
            ...primaryJourneyData,
            dropoff: dropOffs1[0],
            additionalDropoff1: dropOffs1[1] || null,
            additionalDropoff2: dropOffs1[2] || null,
            hourlyOption:
              mode === "Hourly" && selectedHourly?.label
                ? selectedHourly.label
                : null,
            fare: getDisplayPrimaryFare(),
            ...dynamicFields1,
          };
        }

        await updateBooking({
          id: editBookingData._id,
          updatedData: { bookingData: updatePayload },
        }).unwrap();

        toast.success(
          `${isReturnJourney ? "Return" : "Primary"
          } booking updated successfully`
        );
      }

      // ✅ CREATE MODE (Copy or New)
      else {
        // ➤ 1. Create primary booking
        const paymentMethodToUse =
          customerByVat?.paymentOptionsInvoice || fareDetails.paymentMethod;


        const primaryPayload = {
          ...basePayload,
          journeyFare: parseFloat(fareDetails.journeyFare),
          driverFare: parseFloat(fareDetails.driverFare) || 0,
          primaryJourney: {
            ...primaryJourneyData,
            dropoff: dropOffs1[0],
            additionalDropoff1: dropOffs1[1] || null,
            additionalDropoff2: dropOffs1[2] || null,
            distanceText: primaryDistanceText,
            durationText: primaryDurationText,
            hourlyOption:
              mode === "Hourly" && selectedHourly?.label
                ? selectedHourly.label
                : null,
            fare: getDisplayPrimaryFare(),
            ...dynamicFields1,
            paymentMethod: paymentMethodToUse,
          },
        };

        await createBooking(primaryPayload).unwrap();
        toast.success("Primary booking created successfully");

        // Redirect after booking creation

        // ➤ 2. Create return booking if toggle is ON
        if (returnJourneyToggle && dropOffs2[0]) {
          const returnPayload = {
            ...basePayload,
            returnJourneyFare: parseFloat(fareDetails.returnJourneyFare) || 0,
            returnDriverFare: parseFloat(fareDetails.returnDriverFare) || 0,
            returnJourney: {
              ...returnJourneyData,
              dropoff: dropOffs2[0],
              additionalDropoff1: dropOffs2[1] || null,
              additionalDropoff2: dropOffs2[2] || null,
              distanceText: returnDistanceText,
              durationText: returnDurationText,
              hourlyOption:
                mode === "Hourly" && selectedHourly?.label
                  ? selectedHourly.label
                  : null,
              fare: getDisplayReturnFare(),
              ...dynamicFields2,
            },
            returnJourneyToggle: true,
          };

          delete returnPayload.primaryJourney;

          await createBooking(returnPayload).unwrap();
          toast.success("Return journey booking created successfully");
          // navigate("/dashboard/bookings/list");
        }
      }

      onClose?.();
    } catch (err) {
      console.error(err);
      toast.error("Booking operation failed.");
    }
  };
  useEffect(() => {
    if (userRole !== "clientadmin") {
      validateAdvanceForJourney(primaryJourneyData, "primary");
    }
  }, [primaryJourneyData.date, primaryJourneyData.hour, primaryJourneyData.minute]);

  useEffect(() => {
    if (userRole !== "clientadmin" && returnJourneyToggle) {
      validateAdvanceForJourney(returnJourneyData, "return");
    }
  }, [userRole, returnJourneyToggle, returnJourneyData.date, returnJourneyData.hour, returnJourneyData.minute]);
  useEffect(() => {
    if (returnJourneyToggle &&
      primaryJourneyData.date && primaryJourneyData.hour !== "" && primaryJourneyData.minute !== "" &&
      returnJourneyData.date && returnJourneyData.hour !== "" && returnJourneyData.minute !== "") {
      validateReturnJourneyTime(primaryJourneyData, returnJourneyData);
    }
  }, [
    returnJourneyToggle,
    primaryJourneyData.date, primaryJourneyData.hour, primaryJourneyData.minute,
    returnJourneyData.date, returnJourneyData.hour, returnJourneyData.minute
  ]);


  useEffect(() => {
    if (returnJourneyToggle && primaryJourneyData.pickup && dropOffs1[0]) {
      const primaryPickup = primaryJourneyData.pickup;
      const primaryDropoff = dropOffs1[0] || "";

      const primaryPickupIsAirport = primaryPickup.toLowerCase().includes("airport");
      const primaryDropoffIsAirport = primaryDropoff.toLowerCase().includes("airport");

      setReturnJourneyData(prev => ({
        ...prev,
        pickup: primaryDropoff,
        pickupDoorNumber: "",
        arrivefrom: "",
        pickmeAfter: "",
        flightNumber: "",
        dropoffDoorNumber0: "",
        dropoff_terminal_0: "",
        ...(primaryDropoffIsAirport
          ? { arrivefrom: primaryJourneyData.dropoff_terminal_0 || "" }
          : { pickupDoorNumber: primaryJourneyData.dropoffDoorNumber0 || "" }),
        ...(primaryPickupIsAirport
          ? { dropoff_terminal_0: primaryJourneyData.terminal || primaryJourneyData.arrivefrom || "" }
          : { dropoffDoorNumber0: primaryJourneyData.pickupDoorNumber || "" }),
      }));

      setDropOffs2([primaryPickup]);
      setPickupType2(primaryDropoffIsAirport ? "airport" : "location");
      setDropOffTypes2(prev => ({
        ...prev,
        0: primaryPickupIsAirport ? "airport" : "location",
      }));
    }
  }, [returnJourneyToggle, primaryJourneyData, dropOffs1]);
  return (
    <>
      {!editBookingData && <OutletHeading name="New Booking" />}
      <div className="flex flex-col items-center justify-center mb-6 space-y-4">
        <div className="flex">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setMode(tab)}
              className={`px-6 py-2 font-semibold text-sm border cursor-pointer ${mode === tab
                ? "bg-white text-[var(--main-color)] border-2 border-[var(--main-color)]"
                : "bg-[#f9fafb] text-gray-700 border-gray-300"
                } ${tab === "Transfer" ? "rounded-l-md" : "rounded-r-md"}`}
              disabled={tab === "Hourly" && isBookingSettingLoading} // optional
            >
              {tab}
            </button>
          ))}
        </div>

        {mode === "Hourly" && hourlyEnabled && hourlyError && (
          <div className="text-sm text-red-600 text-center max-w-2xl mb-4">
            {hourlyError}
          </div>
        )}

        {/* Hourly Dropdown */}
        {mode === "Hourly" && hourlyEnabled && (
          <div className="w-full max-w-xs">
            <SelectOption
              options={hourlyPackages.map((pkg) => ({
                label: `${pkg.distance} miles ${pkg.hours} hours`,
                value: JSON.stringify({ distance: pkg.distance, hours: pkg.hours }),
              }))}
              value={selectedHourly ? JSON.stringify(selectedHourly.value) : ""}
              onChange={(e) => {
                const selectedValue = e.target.value;
                if (!selectedValue) {
                  setSelectedHourly(null);
                } else {
                  const selected = hourlyPackages.find(
                    (pkg) =>
                      JSON.stringify({ distance: pkg.distance, hours: pkg.hours }) === selectedValue
                  );
                  if (selected) {
                    setSelectedHourly({
                      label: `${selected.distance} miles ${selected.hours} hours`,
                      value: { distance: selected.distance, hours: selected.hours },
                    });
                  }
                }
              }}
            />
          </div>
        )}
      </div>

      <div className="w-full flex flex-col items-center gap-6">
        <div
          className={`w-full ${returnJourneyToggle ? "lg:max-w-6xl gap-4" : "lg:max-w-4xl"
            } flex flex-col lg:flex-row`}
        >
          {/* Journey 1 */}
          {(!isEditing && !returnJourneyToggle) ||
            (isEditing && !isReturnJourney) ||
            (!isEditing && returnJourneyToggle) ? (
            <JourneyCard
              title="Journey 1"
              isEditMode={!!editBookingData?._id}
              journeyData={primaryJourneyData}
              setJourneyData={handlePrimaryJourneyDataChange}
              dropOffs={dropOffs1}
              setDropOffs={handleDropOffs1Change}
              editBookingData={localEditData}
              fare={getDisplayPrimaryFare()}
              pricingMode={primaryFareMode}
              selectedVehicle={selectedVehicle}
              mode={mode}
              pickupType={pickupType1}
              setPickupType={setPickupType1}
              dropOffTypes={dropOffTypes1}
              setDropOffTypes={setDropOffTypes1}

            />
          ) : null}
          {/* Journey 2 (conditionally shown) */}
          {(isEditing && isReturnJourney) ||
            (!isEditing && returnJourneyToggle) ? (
            <div className="w-full transition-all duration-200 ease-in-out transform">
              <JourneyCard
                title="Journey 2"
                isEditMode={!!editBookingData?._id}
                journeyData={returnJourneyData}
                setJourneyData={handleReturnJourneyDataChange}
                dropOffs={dropOffs2}
                setDropOffs={handleDropOffs2Change}
                editBookingData={localEditData}
                fare={getDisplayReturnFare()}
                pricingMode={returnFareMode}
                selectedVehicle={selectedVehicle}
                mode={mode}
                pickupType={pickupType2}
                setPickupType={setPickupType2}
                dropOffTypes={dropOffTypes2}
                setDropOffTypes={setDropOffTypes2}
              />
            </div>
          ) : null}
        </div>

        {/* Toggle Switch */}
        <div className="flex  items-center mt-6 mb-6 gap-3">
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer relative">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={returnJourneyToggle}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setreturnJourneyToggle(checked);

                  if (checked && primaryJourneyData.pickup && dropOffs1[0]) {
                    // 🔄 Perform swap logic here (was in handleSwapLocations)
                    const primaryPickup = primaryJourneyData.pickup;
                    const primaryDropoff = dropOffs1[0] || "";

                    const primaryPickupIsAirport = primaryPickup.toLowerCase().includes('airport');
                    const primaryDropoffIsAirport = primaryDropoff.toLowerCase().includes('airport');

                    setReturnJourneyData(prev => ({
                      ...prev,
                      pickup: primaryDropoff,
                      pickupDoorNumber: "",
                      arrivefrom: "",
                      pickmeAfter: "",
                      flightNumber: "",
                      dropoffDoorNumber0: "",
                      dropoff_terminal_0: "",
                      ...(primaryDropoffIsAirport
                        ? { arrivefrom: primaryJourneyData.dropoff_terminal_0 || "" }
                        : { pickupDoorNumber: primaryJourneyData.dropoffDoorNumber0 || "" }),
                      ...(primaryPickupIsAirport
                        ? { dropoff_terminal_0: primaryJourneyData.terminal || primaryJourneyData.arrivefrom || "" }
                        : { dropoffDoorNumber0: primaryJourneyData.pickupDoorNumber || "" }),
                    }));

                    setDropOffs2([primaryPickup]);
                    setPickupType2(primaryDropoffIsAirport ? "airport" : "location");
                    setDropOffTypes2(prev => ({
                      ...prev,
                      0: primaryPickupIsAirport ? "airport" : "location",
                    }));

                    toast.success("Locations swapped for return journey");
                  }
                }}
              />
              <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors duration-300"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transform peer-checked:translate-x-6 transition-transform duration-300"></div>
              <span className="ml-4 text-sm font-medium text-gray-800">
                Return Journey
              </span>
            </label>
          </div>

        </div>
      </div>
      <div
        className={`grid grid-cols-1 lg:grid-cols-12 gap-6 ${editBookingData?._id || editBookingData?.__copyMode ? "px-6" : ""
          }`}
      >

        {/* Left Column - Billing (if customer) + VehicleSelection */}
        <div className="col-span-6 flex flex-col gap-6">
          {/* Always show VehicleSelection */}
          <VehicleSelection
            setSelectedVehicle={setSelectedVehicle}
            setVehicleExtras={setVehicleExtras}
            editBookingData={editBookingData}
          />
        </div>
        {/* Right Column - Passenger + Fare */}
        <div className="col-span-6">
          <div className="bg-white shadow-lg rounded-2xl border border-gray-200 h-full">
            <div className="bg-[#0f192d] px-6 rounded-t-2xl py-3">
              <h2 className="text-xl font-bold text-gray-50">
                Passenger & Fare Details:-
              </h2>
            </div>
            <div className="p-6">
              <PassengerDetails
                passengerDetails={passengerDetails}
                setPassengerDetails={setPassengerDetails}
              />
              <hr className="mb-3 mt-5 border-gray-300" />
              <FareSection
                returnJourneyToggle={returnJourneyToggle}
                fareDetails={fareDetails}
                setFareDetails={setFareDetails}
                calculatedJourneyFare={primaryFare}
                calculatedReturnFare={returnFare}
                setEmailNotify={setEmailNotify}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
                editBookingData={editBookingData}
                onFareManuallyEdited={(which) =>
                  setFareTouched((t) => ({ ...t, [which]: true }))
                }
                userRole={userRole}
                vatnumber={vatnumber}
                isFetching={isFetching}
                error={error}
                customerByVat={customerByVat}
              />
            </div>
          </div>
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
