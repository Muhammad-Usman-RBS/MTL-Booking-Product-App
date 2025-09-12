import React, { useEffect, useState } from "react";
import Icons from "../../../../assets/icons"; 
import { toast } from "react-toastify";
import { useGetAllVehiclesQuery } from "../../../../redux/api/vehicleApi";
import SelectOption from "../../../../constants/constantscomponents/SelectOption";

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

      if (editBookingData?.vehicle?.vehicleName) {
        const matched = vehicleOptions.find(
          (v) => v.vehicleName === editBookingData.vehicle.vehicleName
        );
        if (matched) defaultVehicle = matched;

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
      <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden h-full">
        <div className="bg-gradient-to-r from-[#0f192d] to-[#1e293b] px-6 py-4">
          <h2 className="text-xl font-bold text-white">Vehicle Details:-</h2>
        </div>

        <div className="p-6 space-y-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl shadow-inner w-full h-44 flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition cursor-pointer">
              {localSelectedVehicle.image ? (
                <img
                  src={localSelectedVehicle.image}
                  alt={localSelectedVehicle.vehicleName}
                  className="max-h-40 object-contain rounded-md"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-500">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/685/685686.png"
                    alt="No file"
                    className="w-12 h-12 mb-2 opacity-70"
                  />
                  <span className="text-sm font-medium">No Vehicle Uploaded</span>
                </div>
              )}
            </div>

            <div className="relative overflow-visible w-full">
              <button
                onClick={toggleDropdown}
                className="w-full bg-[#1e293b] text-white px-5 py-4 rounded-xl text-left shadow-md hover:shadow-lg hover:bg-[#0f172a] transition-all flex justify-between items-center"
              >
                <div className="flex flex-col w-full">
                  <div className="font-semibold text-sm flex justify-between items-center gap-2">
                    {localSelectedVehicle.vehicleName}
                    <Icons.ChevronDown className="w-4 h-4 text-white" />
                  </div>

                  <div className="grid grid-cols-4 gap-x-4 gap-y-2 text-xs text-gray-200 mt-3">
                    <span className="flex items-center gap-1">
                      <Icons.Users className="w-4 h-4" /> {localSelectedVehicle.passengers}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icons.Baby className="w-4 h-4" /> {localSelectedVehicle.childSeat}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icons.Briefcase className="w-4 h-4" /> {localSelectedVehicle.handLuggage}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icons.Luggage className="w-4 h-4" /> {localSelectedVehicle.checkinLuggage}
                    </span>
                  </div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {open && (
                <div className="absolute z-50 top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {vehicleOptions.map((vehicle, idx) => (
                    <button
                      key={vehicle._id || idx}
                      onClick={() => selectVehicle(vehicle)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 transition rounded-lg"
                    >
                      <div className="font-medium text-sm text-gray-800">
                        {vehicle.vehicleName}
                      </div>
                      <div className="grid grid-cols-4 gap-x-4 gap-y-2 mt-2 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Icons.Users className="w-4 h-4" /> {vehicle.passengers}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icons.Baby className="w-4 h-4" /> {vehicle.childSeat}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icons.Briefcase className="w-4 h-4" /> {vehicle.handLuggage}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icons.Luggage className="w-4 h-4" /> {vehicle.checkinLuggage}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { label: "Passenger", key: "passenger", max: localSelectedVehicle.passengers },
              { label: "Child Seats", key: "childSeat", max: localSelectedVehicle.childSeat },
              { label: "Hand Luggage", key: "handLuggage", max: localSelectedVehicle.handLuggage },
              { label: "Check-in Luggage", key: "checkinLuggage", max: localSelectedVehicle.checkinLuggage },
            ].map(({ label, key, max }) => (
              <div key={key} className="w-full">
                <SelectOption
                  label={label}
                  options={[...Array(max + 1).keys()].map((n) => ({
                    value: n,
                    label: n.toString(),
                  }))}
                  value={selections[key]}
                  onChange={(e) => handleSelectChange(key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default VehicleSelection;
