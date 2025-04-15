import React, { useState } from "react";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import { congestionchargesData } from "../../../constants/dashboardTabsData/data";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CongestionCharges = () => {
  const [data, setData] = useState(congestionchargesData);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleUpdate = () => {
    const updated = data.map((item) =>
      item.caption === selectedItem.caption ? selectedItem : item
    );
    setData(updated);
    toast.success("Congestion Charge Updated!");
    setShowModal(false);
  };

  const tableHeaders = [
    { label: "Caption", key: "caption" },
    { label: "Locations", key: "locations" },
    { label: "Days", key: "days" },
    { label: "Time", key: "time" },
    { label: "Category", key: "category" },
    { label: "Price (GBP)", key: "price" },
    { label: "Action", key: "actions" },
  ];

  const tableData = data.map((item) => ({
    ...item,
    days: item.days.join(", "),
    time: `${item.fromTime} - ${item.toTime}`,
    price: `${item.price.toFixed(2)} GBP`,
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
        <OutletHeading name="Congestion Charges" />
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
        heading={`Edit ${selectedItem?.caption}`}
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
              Locations
            </label>
            <textarea
              rows={2}
              className="custom_input"
              value={selectedItem?.locations || ""}
              onChange={(e) =>
                setSelectedItem({ ...selectedItem, locations: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Days
            </label>
            <div className="grid grid-cols-3 gap-2">
              {daysOfWeek.map((day) => (
                <label key={day} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedItem?.days?.includes(day)}
                    onChange={(e) => {
                      const updatedDays = e.target.checked
                        ? [...(selectedItem?.days || []), day]
                        : selectedItem?.days?.filter((d) => d !== day);
                      setSelectedItem({ ...selectedItem, days: updatedDays });
                    }}
                  />
                  {day}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              From Time
            </label>
            <input
              type="time"
              className="custom_input"
              value={selectedItem?.fromTime || ""}
              onChange={(e) =>
                setSelectedItem({ ...selectedItem, fromTime: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              To Time
            </label>
            <input
              type="time"
              className="custom_input"
              value={selectedItem?.toTime || ""}
              onChange={(e) =>
                setSelectedItem({ ...selectedItem, toTime: e.target.value })
              }
            />
          </div>

          <SelectOption
            label="Category"
            width="full"
            value={selectedItem?.category || ""}
            onChange={(e) =>
              setSelectedItem({ ...selectedItem, category: e.target.value })
            }
            options={["Surcharge", "Discount"]}
          />

          <SelectOption
            label="Price Type"
            width="full"
            value={selectedItem?.priceType || ""}
            onChange={(e) =>
              setSelectedItem({ ...selectedItem, priceType: e.target.value })
            }
            options={["Percentage", "Amount"]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amount / Percentage
            </label>
            <input
              type="number"
              className="custom_input"
              value={selectedItem?.price || 0}
              onChange={(e) =>
                setSelectedItem({
                  ...selectedItem,
                  price: parseFloat(e.target.value),
                })
              }
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

export default CongestionCharges;
