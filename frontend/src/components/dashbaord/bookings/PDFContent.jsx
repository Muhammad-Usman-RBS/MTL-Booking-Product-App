// components/PDFContent.jsx
import React, { forwardRef } from "react";

const PDFContent = forwardRef((props, ref) => {
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
      <div
        style={{
          textAlign: "center",
          borderBottom: "1px solid #ccc",
          paddingBottom: "16px",
        }}
      >
        <img
          src={props.logoUrl}
          alt="Logo"
          style={{ height: "40px", margin: "0 auto" }}
        />
        <a
          href="https://www.megatransfers.com"
          style={{
            color: "#2563eb",
            fontWeight: "500",
            fontSize: "12px",
            display: "block",
            textDecoration: "none",
            marginTop: "4px",
          }}
        >
          www.megatransfers.com
        </a>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "24px",
            marginTop: "8px",
            fontSize: "12px",
          }}
        >
          <span>📞 +44 208 961 1818</span>
          <span>📱 +447944596095</span>
        </div>
      </div>

      {/* Booking Info */}
      <div style={{ marginTop: "20px" }}>
        <p>
          <strong>Order No.:</strong> 2503287940
        </p>
        <p>
          <strong>Payment Reference:</strong> Payment Link
        </p>

        <div style={{ marginTop: "12px" }}>
          <strong style={{ display: "block" }}>Pickup</strong>
          <p>
            <span style={{ color: "#6b7280" }}>Date & Time:</span> 24 Jun 2025
            08:00 (24 Hrs)
          </p>
          <p>
            <span style={{ color: "#6b7280" }}>Address:</span> Citadines
            Apart'hotel Holborn-Covent Garden London, 94-99 High Holborn, London
            WC1V 6LF, UK
          </p>
          <p>
            <span style={{ color: "#6b7280" }}>Door No.:</span> —
          </p>
        </div>

        <div style={{ marginTop: "12px" }}>
          <strong style={{ display: "block" }}>Drop Off</strong>
          <p>
            <span style={{ color: "#6b7280" }}>Address:</span> DoubleTree by
            Hilton Stratford-upon-Avon, Arden St, Stratford-upon-Avon CV37 6QQ,
            UK
          </p>
          <p>
            <span style={{ color: "#6b7280" }}>Door No.:</span> —
          </p>
        </div>
      </div>

      {/* Vehicle Info */}
      <div style={{ marginTop: "20px" }}>
        <strong style={{ display: "block" }}>Vehicle Details:</strong>
        <p>Vehicle: 8 Passenger MPV</p>
        <p>Passengers: 7</p>
        <p>Small Luggage: 6</p>
        <p>Large Luggage: 6</p>
      </div>

      {/* Passenger Info */}
      <div style={{ marginTop: "20px" }}>
        <strong style={{ display: "block" }}>Passenger Details:</strong>
        <p>Passenger Name: Vivian Donnell</p>
        <p>Email Address: Viviandonnell@gmail.com</p>
        <p>Contact Number: +13059348070</p>
      </div>

      {/* Fare */}
      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <div
          style={{
            display: "inline-block",
            backgroundColor: "#d1fae5",
            border: "1px solid #10b981",
            color: "#047857",
            padding: "10px 20px",
            borderRadius: "6px",
            fontWeight: "600",
          }}
        >
          Fare:
          <span style={{ color: "#065f46", fontWeight: "bold" }}>400 GBP</span>
          Card Payment
        </div>
      </div>

      {/* Terms */}
      <p style={{ textAlign: "center", fontSize: "12px", marginTop: "16px" }}>
        This order is subjected to our
        <a href="#" style={{ textDecoration: "underline", color: "#2563eb" }}>
          Terms And Conditions
        </a>
        &
        <a href="#" style={{ textDecoration: "underline", color: "#2563eb" }}>
          Privacy and Security
        </a>
      </p>

      {/* Footer */}
      <div
        style={{
          backgroundColor: "#1f2937",
          color: "#fff",
          textAlign: "center",
          fontSize: "10px",
          padding: "16px",
          marginTop: "24px",
          borderRadius: "8px",
        }}
      >
        <p>© 2025 Mega Transfers Limited | All rights reserved.</p>
        <p>Licence Number: 008684 | Licensed Under: TFL</p>
        <p>1st Floor, 29 Minerva Road, London, NW10 6HJ</p>
        <p>VAT Number - 442612419</p>
      </div>
    </div>
  );
});

export default PDFContent;
