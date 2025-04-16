import React, { useState } from "react";

const ClientProposal = () => {
  const [clientName, setClientName] = useState("John Doe");
  const [companyName, setCompanyName] = useState("Mega Transfers Limited");
  const [companyAddress, setCompanyAddress] = useState("123 Main Street, City");
  const [contactNumber, setContactNumber] = useState("+123456789");
  const [companyEmail, setCompanyEmail] = useState("info@mega.com");
  const [passengerName, setPassengerName] = useState("John Doe");
  const [totalAmount, setTotalAmount] = useState("$90");
  const [logoFile, setLogoFile] = useState(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) setLogoFile(URL.createObjectURL(file));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col lg:flex-row gap-6 justify-center items-start">
      {/* Left Panel: Input Form */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-8 w-full lg:max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-blue-600 text-center">
          Edit Proposal
        </h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Company Address
            </label>
            <input
              type="text"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Contact Number
            </label>
            <input
              type="text"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Company Email
            </label>
            <input
              type="email"
              value={companyEmail}
              onChange={(e) => setCompanyEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Passenger Name
            </label>
            <input
              type="text"
              value={passengerName}
              onChange={(e) => setPassengerName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Total Amount
            </label>
            <input
              type="text"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Upload Logo
            </label>
            <label
              htmlFor="profile-upload"
              className="inline-block bg-blue-600 text-white px-4 py-2 mt-1 rounded-md cursor-pointer hover:bg-blue-700 transition"
            >
              Choose File
            </label>
            <input
              id="profile-upload"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Right Panel: Preview Certificate Style */}
      <div className="relative bg-[#003366] text-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
        <div className="p-8 border-b border-white">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold mb-2">{companyName}</div>
              <div className="text-sm">{companyAddress}</div>
              <div className="text-sm">{contactNumber}</div>
              <div className="text-sm">{companyEmail}</div>
            </div>
            {logoFile && (
              <img
                src={logoFile}
                alt="Logo"
                className="w-20 h-20 object-contain rounded-md bg-white p-1"
              />
            )}
          </div>
        </div>

        <div className="p-8 border-b border-white">
          <p className="text-lg">
            Thank you for travelling with {companyName}, {passengerName}!
          </p>
          <p className="text-sm mt-1">We hope you enjoyed your trip.</p>
        </div>

        <div className="p-8 bg-white text-black">
          <div className="flex justify-between items-center text-xl font-bold border-b pb-2 mb-4">
            <span>Total</span>
            <span>{totalAmount}</span>
          </div>
          <p className="text-sm mb-1 font-semibold text-gray-800">
            JOURNEY SUMMARY
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Thank you for riding with us! Feel free to reach back to pre-book
            your next ride. If you have any issues with the service you
            received, please let us know via contact us.
          </p>
          <p className="text-xs text-gray-500 italic">
            This is not a tax invoice.
          </p>
          <a
            href="#"
            className="text-blue-600 underline text-sm mt-2 inline-block"
          >
            Download Receipt
          </a>
        </div>

        <div className="w-full h-24 bg-[#003366] flex items-center justify-center">
          <p className="text-white font-semibold text-lg tracking-wide">
            Thank you for choosing {companyName}!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClientProposal;
