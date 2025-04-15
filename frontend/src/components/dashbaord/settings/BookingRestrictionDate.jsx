import React, { useState } from "react";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import { bookingRestrictionData } from "../../../constants/dashboardTabsData/data";
import { toast } from "react-toastify";

const BookingRestrictionDate = () => {
  const [data, setData] = useState(bookingRestrictionData);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Any Status");

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleUpdate = () => {
    const updated = data.map((item) =>
      item.caption === selectedItem.caption ? selectedItem : item
    );
    setData(updated);
    setShowModal(false);
    toast.success("Booking Restriction Updated!");
  };

  const handleDelete = (caption) => {
    setData(data.filter((item) => item.caption !== caption));
    toast.success("Entry Deleted!");
  };

  const filteredData =
    statusFilter === "Any Status"
      ? data
      : data.filter((item) => item.status === statusFilter);

  const tableHeaders = [
    { label: "Caption", key: "caption" },
    { label: "Recurring", key: "recurring" },
    { label: "From", key: "from" },
    { label: "To", key: "to" },
    { label: "Status", key: "status" },
    { label: "Action", key: "actions" },
  ];

  const tableData = filteredData.map((item) => ({
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
          onClick={() => handleDelete(item.caption)}
          className="w-8 h-8 p-2 rounded-md hover:bg-red-600 hover:text-white text-gray-600 border border-gray-300 cursor-pointer"
        />
      </div>
    ),
  }));

  return (
    <>
      <div>
        <OutletHeading name="Booking Restriction - Date & Time" />
        <div className="flex justify-between items-center mb-4">
          <SelectOption
            width="40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={["Any Status", "Active", "Inactive"]}
          />
          <div>
            <button className="btn btn-edit">Add New</button>
          </div>
        </div>

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
        heading={`Edit ${selectedItem?.caption || "New Entry"}`}
      >
        <div className="w-96 mx-auto p-4 font-sans space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Caption
            </label>
            <input
              type="text"
              className="custom_input"
              value={selectedItem?.caption || ""}
              onChange={(e) =>
                setSelectedItem({ ...selectedItem, caption: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Recurring
            </label>
            <select
              className="custom_input"
              value={selectedItem?.recurring || ""}
              onChange={(e) =>
                setSelectedItem({ ...selectedItem, recurring: e.target.value })
              }
            >
              <option value="No">No</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              From
            </label>
            <input
              type="text"
              className="custom_input"
              value={selectedItem?.from || ""}
              onChange={(e) =>
                setSelectedItem({ ...selectedItem, from: e.target.value })
              }
              placeholder="e.g. 01-Jan 00:00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              To
            </label>
            <input
              type="text"
              className="custom_input"
              value={selectedItem?.to || ""}
              onChange={(e) =>
                setSelectedItem({ ...selectedItem, to: e.target.value })
              }
              placeholder="e.g. 02-Jan 23:55"
            />
          </div>

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

export default BookingRestrictionDate;
