import React, { useState } from "react";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import IMAGES from "../../../assets/images";

const AddCompanyAccount = () => {
  const yesNoOptions = ["Yes", "No"];
  const bookingPaymentOptions = ["Pay Now", "Pay Later", "Bank Transfer"];
  const invoicePaymentOptions = ["Pay Via Debit/Credit Card", "Bank", "Cash"];
  const countryOptions = ["United Kingdom", "Pakistan", "USA"];

  const [profileImage, setProfileImage] = useState(null);

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  return (
    <div>
      <OutletHeading name="Add Account" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        {profileImage ? (
          <img
            src={profileImage}
            alt="Profile Preview"
            className="w-24 h-24 rounded-full object-cover border-gray-300 border-2"
          />
        ) : (
          <img
            src={IMAGES.dummyImg}
            alt="Profile Preview"
            className="w-24 h-24 rounded-full object-cover border-gray-300 border-2"
          />
        )}

        <div>
          <label className="block font-medium text-sm mb-1">Upload Image</label>
          <label
            htmlFor="driver-upload"
            className="btn btn-edit mt-1 cursor-pointer inline-block"
          >
            Choose File
          </label>
          <input
            id="driver-upload"
            type="file"
            accept="image/*"
            onChange={handleProfileImageChange}
            className="hidden"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <div>
          <label className="block font-medium mb-1">Company Name *</label>
          <input className="custom_input w-full" />
        </div>

        <div>
          <label className="block font-medium mb-1">
            Primary Contact Name *
          </label>
          <input className="custom_input w-full" />
        </div>

        <div>
          <label className="block font-medium mb-1">Email *</label>
          <input type="email" className="custom_input w-full" />
        </div>

        <div>
          <label className="block font-medium mb-1">Website</label>
          <input type="url" className="custom_input w-full" />
        </div>

        <div>
          <label className="block font-medium mb-1">
            Primary Contact Designation *
          </label>
          <input className="custom_input w-full" />
        </div>

        <div>
          <label className="block font-medium mb-1">Contact *</label>
          <input
            type="tel"
            className="custom_input w-full"
            placeholder="+44 7400 123456"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">City</label>
          <input className="custom_input w-full" />
        </div>

        <div>
          <label className="block font-medium mb-1">Invoice Due Days *</label>
          <input type="number" min="1" className="custom_input w-full" />
        </div>

        <div>
          <label className="block font-medium mb-1">State/County</label>
          <input className="custom_input w-full" />
        </div>

        <div>
          <label className="block font-medium mb-1">Postcode/Zip Code</label>
          <input className="custom_input w-full" />
        </div>

        <div>
          <label className="block font-medium mb-1">Passphrase</label>
          <input className="custom_input w-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="grid grid-cols-1 gap-4">
          <div className="w-full md:w-64">
            <label className="block font-medium mb-1">Country *</label>
            <SelectOption options={countryOptions} />
          </div>

          <div className="w-full md:w-64">
            <label className="block font-medium mb-1">
              Payment Options (Bookings) *
            </label>
            <SelectOption options={bookingPaymentOptions} />
          </div>

          <div className="w-full md:w-64">
            <label className="block font-medium mb-1">
              Payment Options (Invoice Payment) *
            </label>
            <SelectOption options={invoicePaymentOptions} />
          </div>

          <div className="w-full md:w-64">
            <label className="block font-medium mb-1">
              Locations Display (Invoice) *
            </label>
            <SelectOption options={yesNoOptions} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block font-medium mb-1">Address</label>
            <textarea className="custom_input w-full" rows={3}></textarea>
          </div>

          <div>
            <label className="block font-medium mb-1">Invoice Terms</label>
            <textarea className="custom_input w-full" rows={4}></textarea>
          </div>
        </div>
      </div>

      <div className="mt-8 text-right">
        <button className="btn btn-reset">Update</button>
      </div>
    </div>
  );
};

export default AddCompanyAccount;
