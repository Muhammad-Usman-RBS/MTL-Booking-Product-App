import React from "react";
import { Link } from "react-router-dom";
import SelectedSearch from "../../../constants/constantscomponents/SelectedSearch";
import SelectDateRange from "../../../constants/constantscomponents/SelectDateRange";
import Icons from "../../../assets/icons";
import { useGetAllDriversQuery } from "../../../redux/api/driverApi";
import { useSelector } from "react-redux";

const BookingsFilters = ({
  futureCount,
  selectedStatus,
  setSelectedStatus,
  selectedDrivers,
  setSelectedDrivers,
  selectedPassengers,
  setSelectedPassengers,
  selectedVehicleTypes,
  setSelectedVehicleTypes,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  showDiv,
  setShowDiv,
  setShowColumnModal,
  setShowKeyboardModal,
  statusList,
  passengerList,
  vehicleList,
}) => {
  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;

  const { data: driverData } = useGetAllDriversQuery(companyId, {
    skip: !companyId,
  });

  const driverListForFilter =
    driverData?.drivers?.map((driver) => ({
      label: driver?.DriverData?.firstName || "Unnamed",
      value: driver?._id,
    })) || [];
  return (
    <>
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between w-full mb-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full">
          <div className="flex gap-2">
            <Link to="/dashboard/bookings/new">
              <button className="btn btn-reset">
                <Icons.Plus size={20} />
              </button>
            </Link>
            <button
              onClick={() => setShowDiv(!showDiv)}
              className="btn btn-outline"
              title="Filters"
            >
              <Icons.Filter size={16} />
            </button>
          </div>
          <div className="w-full sm:w-64">
            <SelectedSearch
              selected={selectedStatus}
              setSelected={setSelectedStatus}
              statusList={statusList}
              showCount={true}
            />
          </div>
          <div className="w-full sm:w-72">
            <SelectDateRange
            futureCount={futureCount}
              startDate={startDate}
              placeholder="Select Driver"
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowColumnModal(true)}
              className="btn btn-reset"
            >
              <Icons.Columns3 size={20} />
            </button>
            <button
              onClick={() => setShowKeyboardModal(true)}
              className="btn btn-outline"
            >
              <Icons.Keyboard size={16} />
            </button>
          </div>
        </div>
      </div>

      {showDiv && (
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4">
          <div className="w-full sm:w-64">
            <SelectedSearch
              selected={selectedDrivers}
              setSelected={setSelectedDrivers}
              statusList={driverListForFilter}
              placeholder="Select Driver"
              showCount={false}
            />
          </div>
          <div className="w-full sm:w-64">
            <SelectedSearch
              selected={selectedPassengers}
              setSelected={setSelectedPassengers}
              statusList={passengerList}
              placeholder="Select Passenger"
              showCount={false}
            />
          </div>
          <div className="w-full sm:w-64">
            <SelectedSearch
              selected={selectedVehicleTypes}
              setSelected={setSelectedVehicleTypes}
              statusList={vehicleList}
              placeholder="Select Vehicle"
              showCount={false}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default BookingsFilters;
