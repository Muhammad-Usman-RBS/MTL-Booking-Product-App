import React, { useEffect, useState } from "react";
import { Users, Baby, Briefcase, Luggage, ChevronDown } from "lucide-react";
import { useGetAllVehiclesQuery } from "../../../redux/api/vehicleApi";

const VehicleSelection = () => {
  const { data: vehicleOptions = [], isLoading } = useGetAllVehiclesQuery();
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (vehicleOptions.length > 0 && !selectedVehicle) {
      setSelectedVehicle(vehicleOptions[0]);
    }
  }, [vehicleOptions]);

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
        <Baby className="w-4 h-4" /> {vehicle.childSeat}
      </span>
      <span className="flex items-center gap-1">
        <Briefcase className="w-4 h-4" /> {vehicle.smallLuggage}
      </span>
      <span className="flex items-center gap-1">
        <Luggage className="w-4 h-4" /> {vehicle.largeLuggage}
      </span>
    </div>
  );

  if (isLoading || !selectedVehicle) {
    return (
      <div className="text-center text-gray-500 py-10">
        Loading available vehicles...
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded p-4 w-full max-w-4xl mx-auto mt-6">
      <h3 className="text-xl font-semibold mb-4">Vehicle:-</h3>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Panel */}
        <div className="flex flex-col items-center w-full lg:w-1/3">
          <div className="bg-white border border-gray-300 rounded-lg shadow-md p-3 mb-4">
            <img
              src={selectedVehicle.image}
              alt={selectedVehicle.vehicleName}
              className="w-28 h-16 object-contain"
            />
          </div>

          {/* Dropdown */}
          <div className="relative w-full">
            <button
              onClick={toggleDropdown}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-md text-left shadow flex justify-between items-center"
            >
              <div className="flex flex-col">
                <div className="font-semibold text-sm">{selectedVehicle.vehicleName}</div>
                <div className="flex gap-4 text-xs text-white mt-1">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" /> {selectedVehicle.passengers}
                  </span>
                  <span className="flex items-center gap-1">
                    <Baby className="w-4 h-4" /> {selectedVehicle.childSeat}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" /> {selectedVehicle.smallLuggage}
                  </span>
                  <span className="flex items-center gap-1">
                    <Luggage className="w-4 h-4" /> {selectedVehicle.largeLuggage}
                  </span>
                </div>
              </div>
              <ChevronDown className="ml-3 w-4 h-4 text-white" />
            </button>


            {open && (
              <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-72 overflow-y-auto">
                {vehicleOptions.map((vehicle, idx) => (
                  <button
                    key={vehicle._id || idx}
                    onClick={() => selectVehicle(vehicle)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 transition"
                  >
                    <div className="font-medium text-sm text-gray-800">
                      {vehicle.vehicleName}
                    </div>
                    <IconRow vehicle={vehicle} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          {[
            { label: "Passenger", count: selectedVehicle.passengers + 1 },
            { label: "Child Seats", count: selectedVehicle.childSeat + 1 },
            { label: "Hand Luggage", count: selectedVehicle.smallLuggage + 1 },
            { label: "Check-in Luggage", count: selectedVehicle.largeLuggage + 1 },
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
