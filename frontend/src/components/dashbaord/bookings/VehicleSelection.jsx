import React, { useEffect, useState } from "react";
import Icons from "../../../assets/icons";
import { useGetAllVehiclesQuery } from "../../../redux/api/vehicleApi";
import { toast } from "react-toastify";

const VehicleSelection = ({
  setSelectedVehicle,
  setVehicleExtras,
  editBookingData,
}) => {
  const { data: vehicleOptions = [], isLoading } = useGetAllVehiclesQuery();
  const [localSelectedVehicle, setLocalSelectedVehicle] = useState(null);
  const [open, setOpen] = useState(false);
  const [selections, setSelections] = useState({
    passenger: 0,
    childSeat: 0,
    handLuggage: 0,
    checkinLuggage: 0,
  });

  useEffect(() => {
    if (vehicleOptions.length > 0) {
      let defaultVehicle = vehicleOptions[0];

      // 🛠 If editBookingData is available, match the vehicle by name
      if (editBookingData?.vehicle?.vehicleName) {
        const matched = vehicleOptions.find(
          (v) => v.vehicleName === editBookingData.vehicle.vehicleName
        );
        if (matched) defaultVehicle = matched;

        // Set extras from editBookingData if available
        const extras = {
          passenger: editBookingData.vehicle.passenger ?? 0,
          childSeat: editBookingData.vehicle.childSeat ?? 0,
          handLuggage: editBookingData.vehicle.handLuggage ?? 0,
          checkinLuggage: editBookingData.vehicle.checkinLuggage ?? 0,
        };
        setSelections(extras);
        setVehicleExtras(extras);
      }

      setLocalSelectedVehicle(defaultVehicle);
      setSelectedVehicle(defaultVehicle);
    }
  }, [vehicleOptions, editBookingData]);

  const toggleDropdown = () => setOpen((prev) => !prev);

  const selectVehicle = (vehicle) => {
    setLocalSelectedVehicle(vehicle);
    setSelectedVehicle(vehicle);
    updateMaxValues(vehicle);
    setOpen(false);
  };

  const updateMaxValues = (vehicle) => {
    setSelections({
      passenger: 0,
      childSeat: 0,
      handLuggage: 0,
      checkinLuggage: 0,
    });
    setVehicleExtras({
      passenger: 0,
      childSeat: 0,
      handLuggage: 0,
      checkinLuggage: 0,
    });
  };
  const handleSelectChange = (type, value) => {
    const parsedValue = parseInt(value);
    if (type === 'childSeat' && parsedValue > 0 && selections.passenger <= 1) {
      toast.error("Child seats require at least 2 passengers");
      return;
    }
    let updated = {
      ...selections,
      [type]: parsedValue,
    };
    if (type === 'passenger' && parsedValue <= 1) {
      updated.childSeat = 0;
    }
    setSelections(updated);
    setVehicleExtras(updated);
  };
  if (isLoading || !localSelectedVehicle) {
    return (
      <div className="text-center text-gray-500 py-10">
        Loading available vehicles...
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="flex flex-col lg:flex-row gap-6 overflow-visible">
          <div className="flex flex-col items-center w-full lg:w-1/3">
            <div className="bg-white border border-[var(--light-gray)] rounded-lg shadow-md w-full text-center mb-4">
              {localSelectedVehicle.image ? (
                <img
                  src={localSelectedVehicle.image}
                  alt={localSelectedVehicle.vehicleName}
                  className=""
                />
              ) : (
                <span className="text-sm">No File uploaded</span>
              )}
            </div>
            <div className="relative w-full">
              <button
                onClick={toggleDropdown}
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-md text-left shadow flex justify-between items-center"
              >
                <div className="flex flex-col w-full">
                  {/* Vehicle Name + Dropdown Icon */}
                  <div className="font-semibold text-sm flex justify-between items-center flex-wrap gap-2">
                    {localSelectedVehicle.vehicleName}
                    <Icons.ChevronDown className="w-4 h-4 text-white" />
                  </div>

                  {/* Vehicle Attributes – responsive */}
                  <div className="grid grid-cols-4 lg:grid-cols-4 gap-x-4 gap-y-2 text-xs text-white mt-2">
                    <span className="flex items-center gap-1">
                      <Icons.Users className="w-4 h-4" />
                      {localSelectedVehicle.passengers}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icons.Baby className="w-4 h-4" />
                      {localSelectedVehicle.childSeat}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icons.Briefcase className="w-4 h-4" />
                      {localSelectedVehicle.handLuggage}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icons.Luggage className="w-4 h-4" />
                      {localSelectedVehicle.checkinLuggage}
                    </span>
                  </div>
                </div>
              </button>

              {open && (
                <div className="absolute z-50 bottom-full mb-2 w-full bg-white border border-[var(--light-gray)] rounded-md shadow-lg max-h-72 overflow-y-auto sm:max-h-80">
                  {vehicleOptions.map((vehicle, idx) => (
                    <button
                      key={vehicle._id || idx}
                      onClick={() => selectVehicle(vehicle)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 transition"
                    >
                      {/* Vehicle Name */}
                      <div className="font-medium text-sm text-gray-800">
                        {vehicle.vehicleName}
                      </div>

                      {/* Vehicle Capacity Info */}
                      <div className="grid grid-cols-4 lg:grid-cols-4 gap-x-4 gap-y-2 mt-2 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Icons.Users className="w-4 h-4" />
                          {vehicle.passengers}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icons.Baby className="w-4 h-4" />
                          {vehicle.childSeat}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icons.Briefcase className="w-4 h-4" />
                          {vehicle.handLuggage}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icons.Luggage className="w-4 h-4" />
                          {vehicle.checkinLuggage}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            {[
              {
                label: "Passenger",
                key: "passenger",
                max: localSelectedVehicle.passengers,
              },
              {
                label: "Child Seats",
                key: "childSeat",
                max: localSelectedVehicle.childSeat,
              },
              {
                label: "Hand Luggage",
                key: "handLuggage",
                max: localSelectedVehicle.handLuggage,
              },
              {
                label: "Check-in Luggage",
                key: "checkinLuggage",
                max: localSelectedVehicle.checkinLuggage,
              },
            ].map(({ label, key, max }) => (
              <div key={key} className="w-full">
                <label className="text-sm font-medium block mb-1">
                  {label}
                </label>
                <select
                  value={selections[key]}
                  onChange={(e) => handleSelectChange(key, e.target.value)}
                  className="w-full border border-[var(--light-gray)] rounded px-2 py-2 focus:outline-none focus:ring focus:ring-gray-600"
                >
                  {[...Array(max + 1).keys()].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default VehicleSelection;
