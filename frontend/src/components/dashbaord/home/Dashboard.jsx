import React, { useState } from "react";
import SelectDateRange from "../../../constants/constantscomponents/SelectDateRange";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import RoleCards from "./DashboardCard";
import DriverPortalHome from "../../../portals/driverportal/home/DriverPortalHome";
import { useSelector } from "react-redux";
import CustomerCard from "./CustomerCard";

const Dashboard = () => {
  const user = useSelector((state) => state.auth.user)

  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  return (
    <>
      <OutletHeading name={ user?.role === 'driver' ? "Assigned Bookings" :"Stats"} />
      {user.role === "driver" ? (
        <DriverPortalHome />
      ) : user.role === "customer" ? (
        <>
          <CustomerCard />
        </>
      ) :
        <div className="space-y-6 max-w-full">
          {/* Filter Box */}
       

          {/* <button className="btn btn-primary">Primary</button>

        <button className="btn btn-success">Success</button>

        <button className="btn btn-cancel">Cancel</button>

        <button className="btn btn-edit">Edit</button>

        <button className="btn btn-reset">Reset</button>

        <button className="btn btn-outline">Outline</button> */}

          <RoleCards />
        </div>
      }
    </>
  );
};

export default Dashboard;
