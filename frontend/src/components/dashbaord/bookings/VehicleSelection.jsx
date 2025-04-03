import React, { useState } from "react";
import { Users, Baby, Briefcase, Luggage, ChevronDown } from "lucide-react";
import IMAGES from "../../../assets/images";

const vehicleOptions = [
  {
    name: "Standard Saloon",
    image: IMAGES.bmwI7,
    passengers: 3,
    childSeats: 2,
    handLuggage: 2,
    checkinLuggage: 2,
  },
  {
    name: "VIP Saloon",
    image: IMAGES.mercedesVClass,
    passengers: 3,
    childSeats: 1,
    handLuggage: 2,
    checkinLuggage: 2,
  },
  {
    name: "Executive Saloon",
    image: IMAGES.mercedesSClass,
    passengers: 3,
    childSeats: 1,
    handLuggage: 2,
    checkinLuggage: 2,
  },
  {
    name: "Luxury MPV",
    image: IMAGES.mercedesVito,
    passengers: 6,
    childSeats: 2,
    handLuggage: 6,
    checkinLuggage: 6,
  },
];

const VehicleSelection = () => {
  const [selectedVehicle, setSelectedVehicle] = useState(vehicleOptions[0]);
  const [open, setOpen] = useState(false);

  const toggleDropdown = () => setOpen((prev) => !prev);

  const selectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setOpen(false);
  };

  const IconRow = ({ vehicle }) => (
    <div className="flex flex-wrap gap-2 text-xs text-gray-600 mt-1">
      <span className="flex items-center gap-1">
        <Users className="w-4 h-4" /> {vehicle.passengers}
      </span>
      <span className="flex items-center gap-1">
        <Baby className="w-4 h-4" /> {vehicle.childSeats}
      </span>
      <span className="flex items-center gap-1">
        <Briefcase className="w-4 h-4" /> {vehicle.handLuggage}
      </span>
      <span className="flex items-center gap-1">
        <Luggage className="w-4 h-4" /> {vehicle.checkinLuggage}
      </span>
    </div>
  );

  return (
    <div className="bg-gray-50 border border-gray-200 rounded p-4 w-full max-w-4xl mx-auto mt-6">
      <h3 className="text-lg font-bold mb-4">Vehicle:</h3>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Panel: Image + Dropdown */}
        <div className="flex flex-col items-center w-full lg:w-1/3">
          <div className="bg-white border border-gray-300 rounded-lg shadow-md p-3 mb-4">
            <img
              src={selectedVehicle.image}
              alt={selectedVehicle.name}
              className="w-28 h-16 object-contain"
            />
          </div>

          {/* Custom Dropdown */}
          <div className="relative w-full">
            <button
              onClick={toggleDropdown}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-md text-left shadow flex justify-between items-center"
            >
              <div className="flex flex-col">
                <div className="font-semibold text-sm">
                  {selectedVehicle.name}
                </div>
                <div className="flex flex-wrap gap-2 text-xs mt-1 text-white">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" /> {selectedVehicle.passengers}
                  </span>
                  <span className="flex items-center gap-1">
                    <Baby className="w-4 h-4" /> {selectedVehicle.childSeats}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />{" "}
                    {selectedVehicle.handLuggage}
                  </span>
                  <span className="flex items-center gap-1">
                    <Luggage className="w-4 h-4" />{" "}
                    {selectedVehicle.checkinLuggage}
                  </span>
                </div>
              </div>
              <ChevronDown className="ml-3 w-4 h-4 text-white" />
            </button>

            {open && (
              <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-72 overflow-y-auto">
                {vehicleOptions.map((vehicle, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectVehicle(vehicle)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 transition"
                  >
                    <div className="font-medium text-sm text-gray-800">
                      {vehicle.name}
                    </div>
                    <IconRow vehicle={vehicle} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Dropdown Fields */}
        <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 items-end">
          {[
            {
              label: "Passenger",
              count: selectedVehicle.passengers,
            },
            {
              label: "Child Seats",
              count: selectedVehicle.childSeats + 1,
            },
            {
              label: "Hand Luggage",
              count: selectedVehicle.handLuggage + 1,
            },
            {
              label: "Check-in Luggage",
              count: selectedVehicle.checkinLuggage + 1,
            },
          ].map((item, idx) => (
            <div key={idx} className="w-full">
              <label className="text-sm font-medium block mb-1">
                {item.label}
              </label>
              <select className="w-full border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring focus:ring-gray-600">
                {[...Array(item.count).keys()].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VehicleSelection;
