import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import SelectedSearch from "../../../constants/constantscomponents/SelectedSearch";
import SelectDateRange from "../../../constants/constantscomponents/SelectDateRange";
import Icons from "../../../assets/icons";
import { useGetAllDriversQuery } from "../../../redux/api/driverApi";
import { useSelector } from "react-redux";


const BookingsFilters = ({
  handleStatusChange,
  futureCount,
  selectedStatus,
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
              <button
                title="Add New Booking"
                className="icon-box icon-box-primary"
              >
                <Icons.Plus size={17} />
              </button>
            </Link>
            <button
              className="icon-box icon-box-info"
              onClick={() => setShowDiv(!showDiv)}
              title="Additional Filters"
            >
              <Icons.Filter size={17} />
            </button>
          </div>
          <div className="w-full sm:w-64">
            <SelectedSearch
              selected={selectedStatus}
              setSelected={handleStatusChange}
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
              className="icon-box icon-box-info"
              title="Column's Visibility"
            >
              <Icons.Columns3 size={17} />
            </button>
            <button
              onClick={() => setShowKeyboardModal(true)}
              className="icon-box icon-box-primary"
              title="Keyboard Shortcuts"
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
