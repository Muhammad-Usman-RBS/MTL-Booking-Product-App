import React from "react";
import IMAGES from "../../../assets/images";

const ViewModal = ({ data }) => {
  if (!data) return null;

  return (
    <div
      id="invoice-content"
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <img
          src={IMAGES.dashboardLargeLogo}
          alt="Mega Transfers Limited"
          style={{ width: "120px", margin: "0 auto 10px", display: "block" }}
        />

        <h2 style={{ margin: 0 }}>Mega Transfers Limited</h2>
        <p style={{ margin: 0 }}>
          1st Floor, 29 Minerva Road, London, England, NW10 6HJ VAT Number -
          442612419 asasdasdas
        </p>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
          marginTop: "40px",
        }}
      >
        <div>
          <strong>0233 Hassan Butt</strong>
          <br />
          Muhammad Hassan Butt
        </div>
        <div>
          <strong>Period:</strong> 03-03-2025 To 09-03-2025
        </div>
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "20px",
        }}
      >
        <thead>
          <tr>
            <th style={thStyle}>Order No.</th>
            <th style={thStyle}>Date & Time</th>
            <th style={thStyle}>Payment</th>
            <th style={thStyle}>Cash</th>
            <th style={thStyle}>Fare</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={tdStyle}>2503027728</td>
            <td style={tdStyle}>03-03-2025 20:00</td>
            <td style={tdStyle}>Account</td>
            <td style={tdStyle}>0 GBP</td>
            <td style={tdStyle}>96 GBP</td>
          </tr>
          <tr>
            <td
              colSpan={5}
              style={{ ...tdStyle, paddingTop: "10px", paddingBottom: "10px" }}
            >
              <strong>Name:</strong> Gbemisola
              <br />
              <strong>Journey:</strong> 81 Lancaster Gate, London W2 3NH, UK
              <br />
              Virgin Atlantic Upper Class Wing, Terminal 3, Nelson Rd, Longford,
              Hounslow TW6 1QG, UK
              <br />
              <strong>Vehicle:</strong> 8 Passenger MPV
            </td>
          </tr>
        </tbody>
      </table>

      <div style={infoRow}>
        <strong>Total Jobs</strong> <span>1</span>
      </div>
      <div style={infoRow}>
        <strong>Total Cash Collected</strong> <span>0 GBP</span>
      </div>
      <div style={infoRow}>
        <strong>Total Driver Fare</strong> <span>96 GBP</span>
      </div>
      <div style={infoRow}>
        <strong>Previous Due</strong> <span>87.50 GBP</span>
      </div>
      <div style={infoRow}>
        <strong>Payment for statement 18-11-2024 to 24-11-2024</strong>
        <span>-87.5 GBP</span>
      </div>
      <div style={{ ...infoRow, fontWeight: "bold" }}>
        <strong>Due</strong> <span>96 GBP</span>
      </div>
    </div>
  );
};

const thStyle = {
  border: "1px solid #ccc",
  padding: "8px",
  background: "#f0f0f0",
  textAlign: "left",
};

const tdStyle = {
  border: "1px solid #ccc",
  padding: "8px",
};

const infoRow = {
  display: "flex",
  justifyContent: "space-between",
  margin: "8px 0",
};

export default ViewModal;
