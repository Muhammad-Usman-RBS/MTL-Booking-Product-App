import React from "react";
import RoleCards from "./RoleCards";
import { useSelector } from "react-redux";
import CustomerCard from "./CustomerCard";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import DriverPortalHome from "../../../portals/driverportal/home/DriverPortalHome";
import LoadingEffect from "../../common/LoadingEffect";
import Icons from "../../../assets/icons";

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
          <LoadingEffect />

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button className="btn btn-success">Submit</button>
              <button className="btn btn-cancel">Cancel</button>
              <button className="btn btn-back">Back</button>
              <button className="btn btn-edit">Edit</button>
              <button className="btn btn-primary">Primary</button>
            </div>

               {/* Icons */}
            <div style={{ display: "flex", gap: "12px" }}>
              <div className="icon-box icon-box-primary">
                <Icons.Download size={17} />
              </div>
              <div className="icon-box icon-box-success">
                <Icons.Check size={17} />
              </div>
              <div className="icon-box icon-box-danger">
                <Icons.Trash size={17} />
              </div>
              <div className="icon-box icon-box-warning">
                <Icons.AlertTriangle size={17} />
              </div>
              <div className="icon-box icon-box-info">
                <Icons.Info size={17} />
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "12px" }}>
              <div className="tab tab-success">Active</div>
              <div className="tab tab-danger">Blocked</div>
              <div className="tab tab-suspended">Suspended</div>
            </div>

          </div>


        </div>
      }
    </>
  );
};

export default Dashboard;
