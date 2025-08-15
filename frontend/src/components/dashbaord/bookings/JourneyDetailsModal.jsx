import React, { useState, useRef, useEffect } from "react";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import { useSendBookingEmailMutation } from "../../../redux/api/bookingApi";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import PDFContent from "./PDFContent";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Icons from "../../../assets/icons";
import moment from "moment-timezone";

const JourneyDetailsModal = ({ viewData = {} }) => {
  const [sendBookingEmail, { isLoading: isSending }] =
    useSendBookingEmailMutation();
  const [selectedType, setSelectedType] = useState("Send Customer");
  const [email, setEmail] = useState("");
  const pdfRef = useRef();

  const timezone =
    useSelector((state) => state.bookingSetting?.timezone) || "UTC";

  const companyId = localStorage.getItem("companyId");
  const companyList = useSelector((state) => state.company?.list);
  const companyData = Array.isArray(companyList)
    ? companyList.find((c) => c._id === companyId)
    : null;

  const loggedInUser = useSelector((state) => state.auth?.user);

  useEffect(() => {
    if (selectedType === "Send Customer") {
      setEmail(viewData?.passenger?.email || "");
    } else if (selectedType === "Send Client Admin") {
      setEmail(loggedInUser?.email || "");
    }
  }, [selectedType, viewData, loggedInUser]);

  const handleSendEmail = async () => {
    if (!email) return toast.info("Email is required");

    try {
      await sendBookingEmail({
        email,
        bookingId: viewData?._id,
      }).unwrap();
      toast.success("Email sent successfully!");
    } catch (err) {
      console.error("Failed to send email:", err);
      toast.error("Failed to send email");
    }
  };

  const downloadPDF = async () => {
    const input = pdfRef.current;
    if (!input) return;

    input.style.opacity = "1";
    input.style.position = "static";
    input.style.pointerEvents = "auto";

    await new Promise((resolve) => setTimeout(resolve, 500));

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdf.internal.pageSize.getHeight();

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
    }

    pdf.save("Booking-Confirmation.pdf");

    input.style.opacity = "0";
    input.style.position = "absolute";
    input.style.pointerEvents = "none";
  };

  const convertKmToMiles = (text) => {
    if (!text || typeof text !== "string") return "—";
    if (text.includes("km")) {
      const km = parseFloat(text.replace("km", "").trim());
      if (!isNaN(km)) {
        return `${(km * 0.621371).toFixed(2)} miles`;
      }
    }
    return text;
  };

  const formatDateTime = (dateStr, hour, minute) => {
    if (dateStr == null || hour == null || minute == null) return "N/A";

    const date = new Date(dateStr);
    date.setHours(Number(hour));
    date.setMinutes(Number(minute));
    date.setSeconds(0);
    date.setMilliseconds(0);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const sec = String(date.getSeconds()).padStart(2, "0");

    return `${day}/${month}/${year} ${hh}:${min}:${sec}`;
  };

  const pickupTime =
    viewData?.primaryJourney?.date && viewData?.primaryJourney?.hour
      ? formatDateTime(
          viewData.primaryJourney.date,
          viewData.primaryJourney.hour,
          viewData.primaryJourney.minute
        )
      : viewData?.returnJourneyToggle &&
        viewData?.returnJourney?.date &&
        viewData?.returnJourney?.hour
      ? formatDateTime(
          viewData.returnJourney.date,
          viewData.returnJourney.hour,
          viewData.returnJourney.minute
        )
      : "N/A";

  return (
    <>
      <div
        className="max-w-3xl w-full mx-auto space-y-5 p-5"
        id="pdf-container"
      >
        {/* Header */}
        <div
          className={`${
            loggedInUser.role === "driver" ? "hidden" : "flex"
          } flex-col md:flex-row md:items-center gap-3 md:gap-4`}
        >
          <SelectOption
            options={["Send Customer", "Send Client Admin"]}
            value={selectedType}
            onChange={(val) => {
              const selected =
                typeof val === "string" ? val : val?.target?.value;
              setSelectedType(selected);
            }}
          />
          <div className="flex items-center gap-2 w-full">
            <span className="text-sm text-gray-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 border border-[var(--light-gray)] px-2 py-1.5 rounded text-sm"
              placeholder="Enter email"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button
              className="btn btn-success text-sm px-4 py-1.5"
              onClick={handleSendEmail}
              disabled={isSending}
            >
              {isSending ? "Sending..." : "Send"}
            </button>
            <button
              onClick={downloadPDF}
              className="border px-4 py-1.5 rounded text-gray-700 hover:bg-gray-100 text-sm"
            >
              <Icons.Download size={20} />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-5 text-xs text-gray-800">
          <div className="space-y-2.5">
            <div>
              <strong>Booking ID:</strong> {viewData?.bookingId || "N/A"}
            </div>
            <div>
              <strong>Booked On:</strong>
              {viewData?.createdAt
                ? moment(viewData.createdAt)
                    .tz(timezone)
                    .format("DD/MM/YYYY HH:mm:ss")
                : "N/A"}
            </div>
            <div>
              <strong>Payment Reference:</strong>
              {viewData?.paymentMethod || "N/A"}
            </div>
            <div>
              <strong>Pick Up:</strong>
              <div className="ml-4 mt-1 space-y-1">
                <div>
                  <strong>Date & Time:</strong> {pickupTime}
                </div>
                <div>
                  <strong>Address:</strong>
                  {viewData?.primaryJourney?.pickup ||
                    (viewData?.returnJourneyToggle &&
                      viewData?.returnJourney?.pickup) ||
                    "N/A"}
                </div>
                {(viewData?.primaryJourney?.pickupDoorNumber ||
                  viewData?.returnJourney?.pickupDoorNumber) && (
                  <div>
                    <strong>Door No.:</strong>
                    {viewData?.primaryJourney?.pickupDoorNumber ||
                      (viewData?.returnJourneyToggle &&
                        viewData?.returnJourney?.pickupDoorNumber) ||
                      "—"}
                  </div>
                )}

                {(viewData?.primaryJourney?.pickmeAfter ||
                  viewData?.returnJourney?.pickmeAfter) && (
                  <div>
                    <strong>Pick Me After:</strong>
                    {viewData?.primaryJourney?.pickmeAfter ||
                      (viewData?.returnJourneyToggle &&
                        viewData?.returnJourney?.pickmeAfter) ||
                      "—"}
                  </div>
                )}

                {(viewData?.primaryJourney?.flightNumber ||
                  viewData?.returnJourney?.flightNumber) && (
                  <div>
                    <strong>Flight No.:</strong>
                    {viewData?.primaryJourney?.flightNumber ||
                      (viewData?.returnJourneyToggle &&
                        viewData?.returnJourney?.flightNumber) ||
                      "—"}
                  </div>
                )}

                {(viewData?.primaryJourney?.arrivefrom ||
                  viewData?.returnJourney?.arrivefrom) && (
                  <div>
                    <strong>Arrive From:</strong>
                    {viewData?.primaryJourney?.arrivefrom ||
                      (viewData?.returnJourneyToggle &&
                        viewData?.returnJourney?.arrivefrom) ||
                      "—"}
                  </div>
                )}
              </div>
              <hr className="text-[var(--light-gray)] my-2" />
            </div>
            <div>
              <strong>Drop Off:</strong>
              <div className="ml-4 mt-1 space-y-1">
                <div>
                  <strong>Address:</strong>
                  {viewData?.primaryJourney?.dropoff ||
                    (viewData?.returnJourneyToggle &&
                      viewData?.returnJourney?.dropoff) ||
                    "N/A"}
                </div>
                <div>
                  {(viewData?.primaryJourney?.dropoffDoorNumber0 ||
                    viewData?.returnJourney?.dropoffDoorNumber0) && (
                    <div>
                      <strong>Door No.:</strong>
                      {viewData?.primaryJourney?.dropoffDoorNumber0 ||
                        (viewData?.returnJourneyToggle &&
                          viewData?.returnJourney?.dropoffDoorNumber0) ||
                        "—"}
                    </div>
                  )}
                </div>
                <div>
                  {(viewData?.primaryJourney?.dropoff_terminal_0 ||
                    viewData?.returnJourney?.dropoff_terminal_0) && (
                    <div>
                      <strong>Terminal No.:</strong>
                      {viewData?.primaryJourney?.dropoff_terminal_0 ||
                        (viewData?.returnJourneyToggle &&
                          viewData?.returnJourney?.dropoff_terminal_0) ||
                        "—"}
                    </div>
                  )}
                </div>
              </div>

              {(viewData?.primaryJourney?.terminal ||
                viewData?.returnJourney?.terminal) && (
                <div>
                  <strong>Terminal:</strong>
                  {viewData?.primaryJourney?.terminal ||
                    (viewData?.returnJourneyToggle &&
                      viewData?.returnJourney?.terminal) ||
                    "—"}
                </div>
              )}
              <hr className="text-[var(--light-gray)] my-2" />
            </div>
          </div>

          <div className="space-y-3">
            {!(
              loggedInUser?.role === "driver" && viewData?.status !== "Accepted"
            ) && (
              <div>
                <strong>Passenger Details:</strong>
                <div className="ml-4 mt-1 space-y-1">
                  <div>
                    <strong>Name:</strong> {viewData?.passenger?.name || "N/A"}
                  </div>
                  <div>
                    <strong>Email:</strong>
                    {viewData?.passenger?.email || "N/A"}
                  </div>
                  <div>
                    <strong>Phone:</strong> +
                    {viewData?.passenger?.phone || "N/A"}
                  </div>
                </div>
                <hr className="text-[var(--light-gray)] my-2" />
              </div>
            )}

            <div>
              <strong>Vehicle Details:</strong>
              <div className="ml-4 mt-1 space-y-1">
                <div>
                  <strong>Vehicle:</strong>
                  {viewData?.vehicle?.vehicleName || "N/A"}
                </div>
                <div>
                  <strong>Passengers:</strong>
                  {viewData?.vehicle?.passenger || 0}
                </div>
                <div>
                  <strong>Child Seats:</strong>
                  {viewData?.vehicle?.childSeat || 0}
                </div>
                <div>
                  <strong>Small Luggage:</strong>
                  {viewData?.vehicle?.handLuggage || 0}
                </div>
                <div>
                  <strong>Large Luggage:</strong>
                  {viewData?.vehicle?.checkinLuggage || 0}
                </div>
              </div>
              <hr className="text-[var(--light-gray)] my-2" />
            </div>

            <div>
              <strong>Special Notes:</strong>
              <div className="ml-4 mt-1 italic text-gray-500">
                {viewData?.primaryJourney?.notes ||
                  (viewData?.returnJourneyToggle &&
                    viewData?.returnJourney?.notes) ||
                  "None"}
              </div>
              <hr className="text-[var(--light-gray)] my-2" />
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="btn btn-primary text-sm px-5 py-1.5">
            Fare:
            <span className="text-base">
              {loggedInUser.role === "driver" ? (
                <>{viewData?.driverFare || viewData?.returnDriverFare} GBP</>
              ) : (
                <>
                  {viewData?.primaryJourney?.fare ||
                    viewData?.returnJourneyFare}
                 &nbsp; GBP
                </>
              )}
            </span>
            <span className="text-xs ml-1">
              {viewData?.payment || "Card Payment"}
            </span>
          </div>
          <div className="text-[var(--dark-gray)] mt-2 text-xs">
            Approx. Distance:
            {convertKmToMiles(
              viewData?.primaryJourney?.distanceText ||
                (viewData?.returnJourneyToggle &&
                  viewData?.returnJourney?.distanceText)
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-gray-100 border-t border-[var(--light-gray)] p-3 rounded-md">
          <span className="text-gray-700 font-medium text-sm">
            This booking has been&nbsp;
            <span className="text-green-600 font-semibold">
              {viewData?.status || "Pending"}
            </span>
          </span>
        </div>
      </div>

      {/* Hidden PDF */}
      <PDFContent ref={pdfRef} viewData={viewData} companyData={companyData} />
    </>
  );
};

export default JourneyDetailsModal;
