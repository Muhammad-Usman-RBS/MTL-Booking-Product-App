import React, { useState } from "react";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import { hourlyData } from "../../../constants/dashboardTabsData/data";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const HourlyPackages = () => {
  const [data, setData] = useState(hourlyData);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleEdit = (pkg) => {
    setSelectedPackage(pkg);
    setShowModal(true);
  };

  const handleUpdate = () => {
    const updated = data.map((item) =>
      item.distance === selectedPackage.distance &&
      item.hours === selectedPackage.hours
        ? selectedPackage
        : item
    );
    setData(updated);
    toast.success("Package Updated!");
    setShowModal(false);
  };

  const tableHeaders = [
    { label: "Distance", key: "distance" },
    { label: "Hours", key: "hours" },
    { label: "Standard Saloon", key: "standardSaloon" },
    { label: "Executive Saloon", key: "executiveSaloon" },
    { label: "VIP Saloon", key: "vipSaloon" },
    { label: "Luxury MPV", key: "luxuryMpv" },
    { label: "8 Passenger MPV", key: "passengerMpv" },
    { label: "Action", key: "actions" },
  ];

  const tableData = data.map((item) => ({
    ...item,
    actions: (
      <div className="flex gap-2">
        <Icons.Pencil
          title="Edit"
          onClick={() => handleEdit(item)}
          className="w-8 h-8 p-2 rounded-md hover:bg-green-600 hover:text-white text-gray-600 border border-gray-300 cursor-pointer"
        />
        <Icons.Trash
          title="Delete"
          className="w-8 h-8 p-2 rounded-md hover:bg-red-600 hover:text-white text-gray-600 border border-gray-300 cursor-pointer"
        />
      </div>
    ),
  }));

  return (
    <>
      <div>
        <OutletHeading name="Hourly Package" />
        <button className="btn btn-edit mb-4">Add New</button>
        <CustomTable
          tableHeaders={tableHeaders}
          tableData={tableData}
          showPagination={true}
          showSorting={true}
        />
      </div>

      <CustomModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        heading={`Edit ${selectedPackage?.distance} miles ${selectedPackage?.hours} Hours`}
      >
        <div className="mx-auto p-4 font-sans space-y-4">
          {[
            { label: "Distance", key: "distance" },
            { label: "Hours", key: "hours" },
            { label: "Standard Saloon", key: "standardSaloon" },
            { label: "Executive Saloon", key: "executiveSaloon" },
            { label: "VIP Saloon", key: "vipSaloon" },
            { label: "Luxury MPV", key: "luxuryMpv" },
            { label: "8 Passenger MPV", key: "passengerMpv" },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700">
                {label}
              </label>
              <input
                type="number"
                className="custom_input"
                value={selectedPackage?.[key] || ""}
                onChange={(e) =>
                  setSelectedPackage({
                    ...selectedPackage,
                    [key]: parseFloat(e.target.value),
                  })
                }
              />
            </div>
          ))}

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowModal(false)}
              className="btn btn-cancel"
            >
              Cancel
            </button>
            <button onClick={handleUpdate} className="btn btn-reset">
              Update
            </button>
          </div>
        </div>
      </CustomModal>
    </>
  );
};

export default HourlyPackages;
