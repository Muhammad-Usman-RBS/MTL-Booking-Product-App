import React, { useState } from "react";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import { surchargeLocationData } from "../../../constants/dashboardTabsData/data";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DiscountsByLocation = () => {
  const [data, setData] = useState(surchargeLocationData);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [locationTypeFilter, setLocationTypeFilter] = useState("All");

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleUpdate = () => {
    const updated = data.map((item) =>
      item.location === selectedItem.location ? selectedItem : item
    );
    setData(updated);
    toast.success("Location Discount/Surcharge Updated!");
    setShowModal(false);
  };

  const handleAddNew = () => {
    setSelectedItem({
      locationType: "Both",
      location: "",
      category: "Discount",
      priceType: "Amount",
      price: 0,
    });
    setShowModal(true);
  };

  const filteredData =
    locationTypeFilter === "All"
      ? data
      : data.filter((item) => item.locationType === locationTypeFilter);

  const tableHeaders = [
    { label: "Location Type", key: "locationType" },
    { label: "Location", key: "location" },
    { label: "Category", key: "category" },
    { label: "Price (GBP)", key: "price" },
    { label: "Action", key: "actions" },
  ];

  const tableData = filteredData.map((item) => ({
    ...item,
    price: `${item.price.toFixed(2)} ${
      item.priceType === "Percentage" ? "%" : "GBP"
    }`,
    actions: (
      <div className="flex gap-2">
        <Icons.Pencil
          title="Edit"
          onClick={() => handleEdit(item)}
          className="w-8 h-8 p-2 rounded-md hover:bg-green-600 hover:text-white text-gray-600 border border-gray-300 cursor-pointer"
        />
        <Icons.Trash
          title="Delete"
          onClick={() => {
            const filtered = data.filter((d) => d.location !== item.location);
            setData(filtered);
            toast.success("Deleted successfully");
          }}
          className="w-8 h-8 p-2 rounded-md hover:bg-red-600 hover:text-white text-gray-600 border border-gray-300 cursor-pointer"
        />
      </div>
    ),
  }));

  return (
    <>
      <div>
        <OutletHeading name="Location - Discount / Surcharge Pricing" />
        <div className="flex justify-between items-center mb-4">
          <button className="btn btn-edit" onClick={handleAddNew}>
            Add New
          </button>
          <SelectOption
            label="Location Type"
            width="40"
            value={locationTypeFilter}
            onChange={(e) => setLocationTypeFilter(e.target.value)}
            options={["All", "Pickup", "Dropoff", "Both"]}
          />
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
        heading={
          selectedItem?.location
            ? `Edit ${selectedItem.location}`
            : "Add New Entry"
        }
      >
        <div className="w-96 mx-auto p-4 font-sans space-y-4">
          <SelectOption
            label="Location Type"
            width="full"
            value={selectedItem?.locationType || ""}
            onChange={(e) =>
              setSelectedItem({ ...selectedItem, locationType: e.target.value })
            }
            options={["Pickup", "Dropoff", "Both"]}
          />

          <div>
            <label className="block text-sm font-medium">Location</label>
            <textarea
              className="custom_input"
              placeholder="Location/Zone/Postcode"
              value={selectedItem?.location || ""}
              onChange={(e) =>
                setSelectedItem({ ...selectedItem, location: e.target.value })
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
            options={["Discount", "Surcharge"]}
          />

          <SelectOption
            label="Price Type"
            width="full"
            value={selectedItem?.priceType || ""}
            onChange={(e) =>
              setSelectedItem({ ...selectedItem, priceType: e.target.value })
            }
            options={["Amount", "Percentage"]}
          />

          <div>
            <label className="block text-sm font-medium">
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
              {selectedItem?.location ? "Update" : "Add"}
            </button>
          </div>
        </div>
      </CustomModal>
    </>
  );
};

export default DiscountsByLocation;
