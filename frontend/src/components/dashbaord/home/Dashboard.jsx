import React from "react";
import RoleCards from "./RoleCards";
import { useSelector } from "react-redux";
import CustomerCard from "./CustomerCard";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import DriverPortalHome from "../../../portals/driverportal/home/DriverPortalHome";

const Dashboard = () => {
  const user = useSelector((state) => state.auth.user)

  return (
    <>
      <OutletHeading name={user?.role === 'driver' ? "Assigned Bookings" : "Stats"} />
      {user.role === "driver" ? (
        <DriverPortalHome />
      ) : user.role === "customer" ? (
        <>
          <CustomerCard />
        </>
      ) :
        <div className="space-y-6 max-w-full">
          <RoleCards />
        </div>
      }
    </>
  );
};

export default Dashboard;
