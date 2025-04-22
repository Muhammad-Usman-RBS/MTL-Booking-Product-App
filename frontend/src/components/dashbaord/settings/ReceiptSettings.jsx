import React, { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import IMAGES from "../../../assets/images";
import { receiptData } from "../../../constants/dashboardTabsData/data";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import { downloadPDF } from "../../../constants/constantscomponents/pdfDownload";

const ReceiptSettings = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ ...receiptData[0] });
  const [logo, setLogo] = useState(IMAGES.dashboardLargeLogo);
  const [isDownloading, setIsDownloading] = useState(false);

  const status = form.status;

  const subtotal = form.rides.reduce(
    (acc, ride) => acc + parseFloat(ride.amount),
    0
  );
  const discount = 0;
  const deposit = 0;
  const balanceDue = subtotal - discount - deposit;

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleCompanyChange = (field, value) => {
    setForm({ ...form, company: { ...form.company, [field]: value } });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setLogo(imageUrl);
    }
  };

  const handleDownload = () => {
    downloadPDF("invoiceToDownload", `Invoice-${form.invoiceNo}.pdf`);
  };

  const handleRideChange = (index, field, value) => {
    const updatedRides = [...form.rides];
    updatedRides[index][field] = value;
    setForm({ ...form, rides: updatedRides });
  };

  const thStyle = {
    padding: "8px",
    border: "1px solid #ccc",
    textAlign: "left",
  };

  const tdStyle = {
    padding: "8px",
    border: "1px solid #ccc",
    verticalAlign: "top",
  };

  const subInfoStyle = {
    color: "#6B7280",
    margin: "4px 0",
    fontSize: "13px",
  };

  return (
    <>
      <OutletHeading name="Receipt Template" />
      <div
        id="invoiceToDownload"
        style={{
          ...(isDownloading
            ? {
              width: "794px",
              minHeight: "1123px",
              padding: "32px",
              backgroundColor: "white",
              fontSize: "14px",
              border: "none",
              boxShadow: "0 0 0 white",
              margin: "auto",
            }
            : {
              padding: "16px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              backgroundColor: "white",
              fontSize: "14px",
              marginTop: "16px",
            }),
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div>
            {isEditing ? (
              <>
                <div style={{ marginBottom: "12px" }}>
                  <label
                    htmlFor="logo-upload"
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#2563EB",
                      color: "white",
                      borderRadius: "6px",
                      cursor: "pointer",
                      display: "inline-block",
                    }}
                  >
                    Change Logo
                  </label>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    style={{ display: "none" }}
                  />
                </div>

                <br />
                <img
                  src={logo}
                  alt="Uploaded Logo"
                  style={{ height: "40px", margin: "10px 0" }}
                />
              </>
            ) : (
              <img
                src={logo}
                alt="Logo"
                style={{ height: "40px", marginBottom: "8px" }}
              />
            )}

            {isEditing ? (
              <>
                <input
                  value={form.company.name}
                  onChange={(e) => handleCompanyChange("name", e.target.value)}
                />
                <br />
                <input
                  value={form.company.address}
                  onChange={(e) =>
                    handleCompanyChange("address", e.target.value)
                  }
                />
                <br />
                <input
                  value={form.company.vat}
                  onChange={(e) => handleCompanyChange("vat", e.target.value)}
                />
                <br />
                <input
                  value={form.company.email}
                  onChange={(e) => handleCompanyChange("email", e.target.value)}
                />
                <br />
                <input
                  value={form.company.phone}
                  onChange={(e) => handleCompanyChange("phone", e.target.value)}
                />
              </>
            ) : (
              <>
                <h2
                  style={{
                    fontWeight: "700",
                    fontSize: "20px",
                    marginTop: "40px",
                    color: "#4A5565",
                  }}
                >
                  {form.company.name}
                </h2>
                <p>{form.company.address}</p>
                <p>VAT: {form.company.vat}</p>
                <a href={`mailto:${form.company.email}`}>
                  {form.company.email}
                </a>
                <p>{form.company.phone}</p>
              </>
            )}
          </div>

          <div>
            <h2
              style={{ fontSize: "20px", color: "#4A5565", fontWeight: "bold" }}
            >
              INVOICE
            </h2>
            <p style={{ color: "#6B7280" }}>#{form.invoiceNo}</p>

            {isEditing ? (
              <>
                <p>
                  Invoice Date:
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => handleChange("date", e.target.value)}
                  />
                </p>
                <p>
                  Due Date:
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => handleChange("dueDate", e.target.value)}
                  />
                </p>
                <p style={{ fontWeight: "bold", marginTop: "10px" }}>Bill To</p>
                <input
                  value={form.customer}
                  onChange={(e) => handleChange("customer", e.target.value)}
                />
                <br />
                <input
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
                <br />
                <input
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </>
            ) : (
              <>
                <p>Invoice Date: {form.date}</p>
                <p>Due Date: {form.dueDate}</p>
                <p style={{ fontWeight: "bold", marginTop: "10px" }}>Bill To</p>
                <p>{form.customer}</p>
                <a href={`mailto:${form.email}`}>{form.email}</a>
                <p>{form.phone}</p>
              </>
            )}
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ backgroundColor: "#4A5565", color: "white" }}>
            <tr>
              <th style={thStyle}>#</th>
              <th style={thStyle}>Item</th>
              <th style={thStyle}>Tax</th>
              <th style={thStyle}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {form.rides.map((ride, index) => (
              <tr key={index}>
                <td style={tdStyle}>{index + 1}</td>
                <td style={tdStyle}>
                  <strong>
                    {isEditing ? (
                      <>
                        <input
                          value={ride.number}
                          onChange={(e) =>
                            handleRideChange(index, "number", e.target.value)
                          }
                        />
                        -
                        <input
                          value={ride.passenger}
                          onChange={(e) =>
                            handleRideChange(index, "passenger", e.target.value)
                          }
                        />
                        <p style={subInfoStyle}>
                          Pickup:
                          <input
                            value={ride.pickup}
                            onChange={(e) =>
                              handleRideChange(index, "pickup", e.target.value)
                            }
                          />
                        </p>
                        <p style={subInfoStyle}>
                          Drop off:
                          <input
                            value={ride.drop}
                            onChange={(e) =>
                              handleRideChange(index, "drop", e.target.value)
                            }
                          />
                        </p>
                        <p style={subInfoStyle}>
                          Date & Time:
                          <input
                            value={ride.datetime}
                            onChange={(e) =>
                              handleRideChange(
                                index,
                                "datetime",
                                e.target.value
                              )
                            }
                          />
                        </p>
                      </>
                    ) : (
                      <>
                        {ride.number} - {ride.passenger}
                        <p style={subInfoStyle}>Pickup: {ride.pickup}</p>
                        <p style={subInfoStyle}>Drop off: {ride.drop}</p>
                        <p style={subInfoStyle}>Date & Time: {ride.datetime}</p>
                      </>
                    )}
                  </strong>
                </td>
                <td style={tdStyle}>
                  {isEditing ? (
                    <input
                      value={ride.tax}
                      onChange={(e) =>
                        handleRideChange(index, "tax", e.target.value)
                      }
                    />
                  ) : (
                    ride.tax
                  )}
                </td>
                <td style={tdStyle}>
                  {isEditing ? (
                    <input
                      value={ride.amount}
                      onChange={(e) =>
                        handleRideChange(index, "amount", e.target.value)
                      }
                    />
                  ) : (
                    `£${ride.amount}`
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ textAlign: "right", marginTop: "16px" }}>
          <p>Sub Total: £{subtotal.toFixed(2)}</p>
          <p>Discount: £{discount.toFixed(2)}</p>
          <p>Deposit: £{deposit.toFixed(2)}</p>
          <p style={{ fontWeight: "bold" }}>
            Balance Due: £{balanceDue.toFixed(2)}
          </p>
        </div>

        <div
          style={{
            marginTop: "16px",
            borderTop: "1px solid #ccc",
            paddingTop: "8px",
          }}
        >
          <p style={{ fontWeight: "600" }}>Notes</p>
          <p style={{ color: "#4B5563", fontSize: "13px" }}>
            T&Cs apply. Please call for detail.
          </p>
        </div>
      </div>
      <div className="flex justify-between mt-3">
        <button className="btn btn-primary" onClick={handleDownload}>
          Donwload
        </button>
        <button onClick={handleEditToggle} className="btn btn-edit">
          {isEditing ? "Save" : "Edit"}
        </button>
      </div>
    </>
  );
};

export default ReceiptSettings;
