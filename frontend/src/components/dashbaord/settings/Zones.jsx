import React, { useState } from "react";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import { zonesData } from "../../../constants/dashboardTabsData/data";
import { toast } from "react-toastify";
import CustomModal from "../../../constants/constantscomponents/CustomModal";

const Zones = () => {
  const [data, setData] = useState(zonesData);
  const [selectedZone, setSelectedZone] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");

  const handleEdit = (zone) => {
    setSelectedZone(zone);
    setShowModal(true);
  };

  const handleUpdate = () => {
    const updatedData = data.map((zone) =>
      zone.name === selectedZone.originalName
        ? { name: selectedZone.name }
        : zone
    );
    setData(updatedData);
    setShowModal(false);
    toast.success("Zone Updated!");
  };

  const handleDelete = (name) => {
    setData(data.filter((zone) => zone.name !== name));
    toast.success("Zone Deleted!");
  };

  const handleAddNewZone = () => {
    if (!newZoneName.trim()) return toast.error("Zone Name is required!");
    if (data.some((z) => z.name.toLowerCase() === newZoneName.toLowerCase())) {
      return toast.warning("Zone already exists!");
    }
    setData([...data, { name: newZoneName }]);
    setNewZoneName("");
    setShowForm(false);
    toast.success("Zone Added!");
  };

  const tableHeaders = [
    { label: "Zone Name", key: "name" },
    { label: "Action", key: "actions" },
  ];

  const tableData = data.map((zone) => ({
    ...zone,
    actions: (
      <div className="flex gap-2">
        <Icons.Pencil
          title="Edit"
          onClick={() => handleEdit({ ...zone, originalName: zone.name })}
          className="w-8 h-8 p-2 rounded-md hover:bg-green-600 hover:text-white text-gray-600 border border-gray-300 cursor-pointer"
        />
        <Icons.Trash
          title="Delete"
          onClick={() => handleDelete(zone.name)}
          className="w-8 h-8 p-2 rounded-md hover:bg-red-600 hover:text-white text-gray-600 border border-gray-300 cursor-pointer"
        />
      </div>
    ),
  }));

  return (
    <>
      <div>
        <OutletHeading name={showForm ? "Zone Editor" : "Zones"} />

        {showForm ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm font-medium text-gray-700 w-24">
                Zone Name
              </label>
              <input
                type="text"
                className="custom_input flex-1"
                value={newZoneName}
                onChange={(e) => setNewZoneName(e.target.value)}
                placeholder="Enter zone name"
              />
              <button className="btn btn-edit" onClick={handleAddNewZone}>
                Update
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setShowForm(false)}
              >
                Zone List
              </button>
            </div>

            <div className="h-[450px] mb-4">
              <iframe
                title="Zone Map"
                className="w-full h-full border rounded-md"
                src={`https://maps.google.com/maps?q=${
                  newZoneName || "UK"
                }&z=12&output=embed`}
                allowFullScreen
              ></iframe>
            </div>
          </>
        ) : (
          <>
            <button
              className="btn btn-edit mb-4"
              onClick={() => setShowForm(true)}
            >
              Add New
            </button>
            <CustomTable
              tableHeaders={tableHeaders}
              tableData={tableData}
              showPagination={true}
              showSorting={true}
            />
          </>
        )}
      </div>

      {/* Modal for Editing Existing Zone */}
      <CustomModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        heading={`Zone Editor`}
      >
        <div className="space-y-4 px-4 w-full">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 w-24">
              Zone Name
            </label>
            <input
              type="text"
              className="custom_input flex-1"
              value={selectedZone?.name || ""}
              onChange={(e) =>
                setSelectedZone({ ...selectedZone, name: e.target.value })
              }
            />
            <button className="btn btn-edit" onClick={handleUpdate}>
              Update
            </button>
          </div>

          <div className="h-[450px]">
            <iframe
              title="Zone Map"
              className="w-full h-full border rounded-md"
              src={`https://maps.google.com/maps?q=${selectedZone?.name}&z=12&output=embed`}
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </CustomModal>
    </>
  );
};

export default Zones;
