import React, { useState } from "react";
import IMAGES from "../../../assets/images";

const NewDriver = () => {
  const [driverImage, setDriverImage] = useState(null);
  const [vehicleImage, setVehicleImage] = useState(null);

  const handleDriverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDriverImage(URL.createObjectURL(file));
    }
  };

  const handleVehicleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVehicleImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="px-6 py-4">
      <h2 className="text-2xl font-bold mb-4">Add Driver</h2>
      <form className="space-y-4">
        {/* PROFILE PICTURE */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          {driverImage ? (
            <img
              src={driverImage}
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
            <label className="block font-medium text-sm mb-1">
              Upload Driver Image
            </label>
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
              onChange={handleDriverImageChange}
              className="hidden"
            />
          </div>
        </div>

        {/* DRIVER SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label>Driver No. *</label>
            <input className="custom_input" required />
          </div>
          <div>
            <label>Short Name *</label>
            <input className="custom_input" required />
          </div>
          <div>
            <label>Full Name *</label>
            <input className="custom_input" required />
          </div>
          <div>
            <label>Email *</label>
            <input type="email" className="custom_input" required />
          </div>
          <div>
            <label>Contact *</label>
            <input type="tel" className="custom_input" required />
          </div>
          <div className="md:col-span-2">
            <label>Address</label>
            <textarea className="custom_input" rows="2" />
          </div>
          <div>
            <label>D.O.B.</label>
            <input type="date" className="custom_input" />
          </div>
          <div>
            <label>Nationality</label>
            <input className="custom_input" />
          </div>
          <div>
            <label>Driving License</label>
            <input className="custom_input" />
          </div>
          <div>
            <label>Driving License Expiry</label>
            <input type="date" className="custom_input" />
          </div>
          <div>
            <label>Driver Taxi License</label>
            <input className="custom_input" />
          </div>
          <div>
            <label>Driver Taxi License Expiry</label>
            <input type="date" className="custom_input" />
          </div>
          <div>
            <label>Driver PCO Card</label>
            <input className="custom_input" />
          </div>
          <div>
            <label>Driver PCO Card Expiry</label>
            <input type="date" className="custom_input" />
          </div>
          <div>
            <label>NI Number</label>
            <input className="custom_input" />
          </div>
        </div>

        {/* VEHICLE SECTION */}
        <h3 className="text-xl font-semibold mt-6">Vehicle Information</h3>
        {/* Vehicle PICTURE */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          {vehicleImage ? (
            <img
              src={vehicleImage}
              alt="Profile Preview"
              className="w-64 h-40 object-cover border-gray-300 border-2"
            />
          ) : (
            <img
              src={IMAGES.dummyImg}
              alt="Profile Preview"
              className="w-24 h-24 rounded-full object-cover border-gray-300 border-2"
            />
          )}

          <div>
            <label className="block font-medium text-sm mb-1">
              Upload Car Image
            </label>
            <label
              htmlFor="vehicle-upload"
              className="btn btn-edit mt-1 cursor-pointer inline-block"
            >
              Choose File
            </label>
            <input
              id="vehicle-upload"
              type="file"
              accept="image/*"
              onChange={handleVehicleImageChange}
              className="hidden"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label>Vehicle Make</label>
            <input className="custom_input" />
          </div>
          <div>
            <label>Vehicle Model</label>
            <input className="custom_input" />
          </div>
          <div>
            <label>Vehicle Color</label>
            <input className="custom_input" />
          </div>
          <div>
            <label>Vehicle Reg. No.</label>
            <input className="custom_input" />
          </div>
          <div>
            <label>Vehicle Insurance</label>
            <input className="custom_input" />
          </div>
          <div>
            <label>Vehicle Insurance Expiry</label>
            <input type="date" className="custom_input" />
          </div>
          <div>
            <label>Vehicle Taxi License</label>
            <input className="custom_input" />
          </div>
          <div>
            <label>Vehicle Taxi License Expiry</label>
            <input type="date" className="custom_input" />
          </div>
          <div>
            <label>Vehicle Condition</label>
            <input className="custom_input" />
          </div>
          <div>
            <label>Vehicle Condition Expiry</label>
            <input type="date" className="custom_input" />
          </div>
          <div>
            <label>Car V5</label>
            <input className="custom_input" />
          </div>
        </div>

        {/* VEHICLE TYPES */}
        <div className="mt-4">
          <label className="block font-semibold">Vehicle Types *</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
            <label>
              <input type="checkbox" /> Standard Saloon
            </label>
            <label>
              <input type="checkbox" /> Executive Saloon
            </label>
            <label>
              <input type="checkbox" /> VIP Saloon
            </label>
            <label>
              <input type="checkbox" /> Luxury MPV
            </label>
            <label>
              <input type="checkbox" /> 8 Passenger MPV
            </label>
            <label>
              <input type="checkbox" /> Select All
            </label>
          </div>
        </div>

        {/* SUBMIT */}
        <div className="text-center mt-6">
          <button type="submit" className="btn btn-reset">
            UPDATE
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewDriver;
