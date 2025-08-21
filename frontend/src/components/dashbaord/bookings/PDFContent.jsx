import React, { forwardRef } from "react";
import IMAGES from "../../../assets/images";
import { BASE_API_URL } from "../../../config";

const PDFContent = forwardRef(({ viewData = {}, companyData = {} }, ref) => {

  const isAirport = (s = "") => s.toLowerCase().includes("airport");


  // short-hands
  const pj = viewData?.returnJourneyToggle
  ? viewData?.returnJourney || {}
  : viewData?.primaryJourney || {};  
  const pickupIsAirport = isAirport(pj.pickup);
  const dropIsAirport   = isAirport(pj.dropoff);

  const imagePath = companyData.profileImage
    ? `/${companyData.profileImage.replace(/\\/g, "/")}`
    : null;
  const finalImageUrl = imagePath ? `${BASE_API_URL}${imagePath}` : IMAGES.dashboardLargeLogo;

  const formatDateTime = (dateStr, hour, minute) => {
    if (!dateStr || hour == null || minute == null) return "N/A";
    const d = new Date(dateStr);
    d.setHours(Number(hour));
    d.setMinutes(Number(minute));
    d.setSeconds(0);
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  return (

    <div
      ref={ref}
      id="pdf-container"
      style={{
        padding: "20px",
        fontSize: "12px",
        width: "794px",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: -1,
        opacity: 0,
        pointerEvents: "none",
        fontFamily: "Arial, sans-serif",
        color: "#000",
        backgroundColor: "#fff",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <div>
          <img
            src={finalImageUrl}
            alt="Company Logo"
            onError={(e) => (e.target.src = IMAGES.dashboardLargeLogo)}
            style={{ height: "100px", marginBottom: "6px" }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
          <div style={{ color: "#1e3a8a", fontSize: "13px", lineHeight: "1.5" }}>

            <h2 style={{ margin: "0", fontSize: "19px", fontWeight: "600" }}>
              {companyData?.companyName}
            </h2>
            <div style={{ fontSize: "12px", color: "#6b7280", maxWidth: "300px", marginTop: "6%", display: "flex" }}>
              🏢 <p style={{marginLeft: "3%"}}>{companyData?.address}</p>
            </div>

            <div style={{ fontSize: "12px", color: "#6b7280", maxWidth: "300px", marginTop: "6%", display: "flex" }}>
            📱 <p style={{marginLeft: "3%"}}> +{companyData?.contact}  </p> 

            </div>

           
          </div>

          <div style={{ textAlign: "right", fontSize: "13px" }}>
            <h2 style={{ margin: "0 0 8px 0", fontSize: "19px", fontWeight: "600", color: "#1e3a8a" }}>
              Booking Confirmation
            </h2>
            <p>
  <strong>Date & Time:</strong>{" "}
  {pj.date && pj.hour != null
    ? formatDateTime(pj.date, pj.hour, pj.minute)
    : "N/A"}
</p>

            <p><strong>Order No.:</strong> {viewData?.bookingId || "N/A"}</p>
            <p><strong>Payment Type:</strong> {viewData?.payment || "Card Payment"}</p>
            <p><strong>Payment Reference:</strong> {viewData?.paymentRef || "Payment Link"}</p>
            <p style={{ fontWeight: "bold", color: "red", fontFamily: "Times New Roman", fontSize: "20px" }}>
              <strong>Fare:</strong> {viewData?.returnJourneyToggle ? viewData.returnJourneyFare :viewData.journeyFare || 0} GBP
            </p>
          </div>
        </div>
      </div>

      <hr style={{ borderColor: "#e5e7eb", margin: "20px 0" }} />

      {/* Journey + Vehicle + Passenger */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "25px", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 300px", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px", backgroundColor: "#f9fafb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h4 style={{ fontSize: "16px", marginBottom: "10px", color: "#111827" }}>Journey</h4>
          <div style={{ marginBottom: "12px" }}>
            <h5 style={{ margin: "0 0 4px", fontSize: "13px", color: "#2563eb" }}>Pickup</h5>
            <p style={{ margin: 0 }}>
  <strong style={{ color: "#6b7280" }}>Address:</strong> {pj.pickup || "N/A"}
</p>

{pickupIsAirport ? (
  <>
    <p style={{ margin: "4px 0" }}>
      <strong style={{ color: "#6b7280" }}>Arriving From:</strong> {pj.arrivefrom || "—"}
    </p>
    <p style={{ margin: "4px 0" }}>
      <strong style={{ color: "#6b7280" }}>Pick Me After:</strong> {pj.pickmeAfter || "—"}
    </p>
    <p style={{ margin: "4px 0" }}>
      <strong style={{ color: "#6b7280" }}>Flight No.:</strong> {pj.flightNumber || "—"}
    </p>
  </>
) : (
  <p style={{ margin: "4px 0" }}>
    <strong style={{ color: "#6b7280" }}>Door No.:</strong> {pj.pickupDoorNumber || "—"}
  </p>
)}
          </div>
          <div>
            <h5 style={{ margin: "0 0 4px", fontSize: "13px", color: "#2563eb" }}>Drop Off</h5>
            <p style={{ margin: 0 }}><strong style={{ color: "#6b7280" }}>Address:</strong> {pj.dropoff || "N/A"}</p>
            {dropIsAirport ? 
              <>
  <p style={{ margin: "4px 0" }}>
    <strong style={{ color: "#6b7280" }}>Terminal:</strong> {pj.dropoff_terminal_0 || "—"}
  </p> 
              </>
              :
  <>
  <p style={{ margin: "4px 0" }}>
    <strong style={{ color: "#6b7280" }}>Door No.:</strong> {pj.dropoffDoorNumber0 || "—"}
  </p>
  </> 
  }
 </div>
        </div>

        <div style={{ flex: "1 1 200px", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px", backgroundColor: "#f9fafb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h4 style={{ fontSize: "16px", marginBottom: "10px", color: "#111827" }}>Vehicle Details</h4>
          <p style={{ margin: "4px 0" }}><strong>Vehicle:</strong> {viewData?.vehicle?.vehicleName || "N/A"}</p>
          <p style={{ margin: "4px 0" }}><strong>Passengers:</strong> {viewData?.vehicle?.passenger || 0}</p>
          <p style={{ margin: "4px 0" }}><strong>Small Luggage:</strong> {viewData?.vehicle?.handLuggage || 0}</p>
          <p style={{ margin: "4px 0" }}><strong>Large Luggage:</strong> {viewData?.vehicle?.checkinLuggage || 0}</p>
          <hr style={{ borderColor: "#e5e7eb", margin: "20px 0" }} />
          <h4 style={{ fontSize: "16px",  color: "#111827" }}>Notes</h4>
          <p >{pj.notes || "None"}</p>
        </div>

      </div>
      <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px", backgroundColor: "#f9fafb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <h4 style={{ fontSize: "16px", marginBottom: "15px", color: "#111827" }}>Passenger Details</h4>
        <p style={{ margin: "4px 0" }}><strong>Name:</strong> {viewData?.passenger?.name || "N/A"}</p>
        <p style={{ margin: "4px 0" }}><strong>Email:</strong> {viewData?.passenger?.email || "N/A"}</p>
        <p style={{ margin: "4px 0" }}><strong>Phone:</strong> {viewData?.passenger?.phone || "N/A"}</p>
      </div>

      {/* Footer */}
      <div style={{ marginTop: "5%", backgroundColor: "#111827", color: "#d1d5db", padding: "20px", borderRadius: "8px", fontSize: "14px", lineHeight: "1.6", textAlign: "center" }}>
        <p style={{ textAlign: "center", marginBottom: "10px" }}>
          This order is subject to our
          &nbsp;<a href="#" style={{ color: "#2563eb", textDecoration: "underline" }}>Terms and Conditions</a>&nbsp;
          and
          &nbsp;<a href="#" style={{ color: "#2563eb", textDecoration: "underline" }}>Privacy Policy</a>&nbsp;.
        </p>
        <p style={{paddingBottom:"2%"}}>
          © 2025 Mega Transfers Limited. All rights reserved.<br />
          Licence Number: 008684 | Licensed Under: TFL<br />
          1st Floor, 29 Minerva Road, London, NW10 6HJ<br />
        </p>
      </div>
    </div>
  );
});

export default PDFContent;