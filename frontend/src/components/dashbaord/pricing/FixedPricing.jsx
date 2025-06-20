import React, { useState } from "react";
import Icons from "../../../assets/icons";
import ExtrasPrcing from "./ExtrasPrcing";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import { toast } from "react-toastify";
import { useGetAllZonesQuery } from "../../../redux/api/zoneApi";
import {
  useGetAllFixedPricesQuery,
  useCreateFixedPriceMutation,
  useUpdateFixedPriceMutation,
  useDeleteFixedPriceMutation,
} from "../../../redux/api/fixedPriceApi";

const FixedPricing = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);

  const { data: zones = [] } = useGetAllZonesQuery();
  const { data: fixedPrices = [], refetch } = useGetAllFixedPricesQuery();
  const [createFixedPrice] = useCreateFixedPriceMutation();
  const [updateFixedPrice] = useUpdateFixedPriceMutation();
  const [deleteFixedPrice] = useDeleteFixedPriceMutation();
  const [priceChange, setPriceChange] = useState(0);

  const handleEdit = (item) => {
    setIsNew(false);
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setIsNew(true);
    setSelectedItem({
      direction: "Both Ways",
      pickup: null,
      dropoff: null,
      price: 0,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    const { pickup, dropoff, price, direction, _id } = selectedItem;

    if (!pickup || !dropoff || !price) {
      toast.error("Please fill all fields");
      return;
    }

    const payload = {
      pickup: pickup?.name,
      pickupCoordinates: pickup?.coordinates,
      dropoff: dropoff?.name,
      dropoffCoordinates: dropoff?.coordinates,
      price: parseFloat(price),
      direction:
        direction === "One Way" || direction === "Both Ways"
          ? direction
          : "One Way",
    };

    try {
      if (isNew) {
        await createFixedPrice(payload).unwrap();
        toast.success("Fixed Price Added!");
      } else {
        await updateFixedPrice({ id: _id, ...payload }).unwrap();
        toast.success("Fixed Price Updated!");
      }
      setShowModal(false);
      refetch();
    } catch (err) {
      if (err?.status === 409) {
        toast.error("This pickup-dropoff pair already exists.");
      } else {
        toast.error("Operation failed");
      }
    }
  };

  const handleBulkUpdate = async () => {
    const value = parseFloat(priceChange);
    if (isNaN(value)) {
      toast.error("Enter a valid number.");
      return;
    }

    try {
      for (const item of fixedPrices) {
        const updatedPrice = item.price + value;
        await updateFixedPrice({
          id: item._id,
          pickup: item.pickup,
          dropoff: item.dropoff,
          price: updatedPrice,
          direction: item.direction,
        }).unwrap();
      }

      toast.success("All prices updated successfully!");
      refetch();
    } catch (err) {
      toast.error("Bulk update failed.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteFixedPrice(id);
      toast.success("Deleted successfully");
      refetch();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const tableHeaders = [
    { label: "Pick Up", key: "pickup" },
    { label: "Drop Off", key: "dropoff" },
    { label: "Price (GBP)", key: "price" },
    { label: "Action", key: "actions" },
  ];

  const tableData = fixedPrices.map((item) => ({
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
          onClick={() => handleDelete(item._id)}
          className="w-8 h-8 p-2 rounded-md hover:bg-red-600 hover:text-white text-gray-600 border border-gray-300 cursor-pointer"
        />
      </div>
    ),
  }));

  return (
    <>
      <div>
        <OutletHeading name="Fixed Pricing" />
        <div className="flex justify-between items-center mb-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Increase / Decrease All Fixed Prices
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                className="custom_input w-32"
                placeholder="GBP"
                value={priceChange}
                onChange={(e) => setPriceChange(e.target.value)}
              />
              <button className="btn btn-reset" onClick={handleBulkUpdate}>
                Update
              </button>
            </div>
          </div>
          <button className="btn btn-edit" onClick={handleAddNew}>
            Add New
          </button>
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
        heading={`${isNew ? "Add" : "Edit"} Fixed Price`}
      >
        <div className="space-y-6 w-96 px-2 sm:px-4 pt-2 text-sm">
          {/* Direction */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Direction</label>
            <SelectOption
              width="full"
              value={selectedItem?.direction || ""}
              onChange={(val) =>
                setSelectedItem({ ...selectedItem, direction: val?.value || val })
              }
              options={["One Way", "Both Ways"]}
            />
          </div>

          {/* Pickup */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Pick Up</label>
            <input
              type="text"
              className="custom_input"
              placeholder="Type or select a pickup zone"
              value={selectedItem?.pickup?.name || ""}
              onChange={(e) => {
                const filtered = zones.filter((z) =>
                  z.name.toLowerCase().includes(e.target.value.toLowerCase())
                );
                setPickupSuggestions(filtered);
              }}
              onFocus={() => setPickupSuggestions(zones)}
              onBlur={() => setTimeout(() => setPickupSuggestions([]), 100)}
            />
            {pickupSuggestions.length > 0 && (
              <ul className="absolute z-10 bg-white border rounded shadow max-h-40 overflow-y-auto w-full mt-1">
                {pickupSuggestions.map((zone, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      setSelectedItem({ ...selectedItem, pickup: zone });
                      setPickupSuggestions([]);
                    }}
                    className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                  >
                    {zone.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Drop Off */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Drop Off</label>
            <input
              type="text"
              className="custom_input"
              placeholder="Type or select a dropoff zone"
              value={selectedItem?.dropoff?.name || ""}
              onChange={(e) => {
                const filtered = zones.filter((z) =>
                  z.name.toLowerCase().includes(e.target.value.toLowerCase())
                );
                setDropoffSuggestions(filtered);
              }}
              onFocus={() => setDropoffSuggestions(zones)}
              onBlur={() => setTimeout(() => setDropoffSuggestions([]), 100)}
            />
            {dropoffSuggestions.length > 0 && (
              <ul className="absolute z-10 bg-white border rounded shadow max-h-40 overflow-y-auto w-full mt-1">
                {dropoffSuggestions.map((zone, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      setSelectedItem({ ...selectedItem, dropoff: zone });
                      setDropoffSuggestions([]);
                    }}
                    className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                  >
                    {zone.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Price (GBP)</label>
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
              placeholder="Enter fixed price in GBP"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-2 gap-3">
            <button
              onClick={() => setShowModal(false)}
              className="btn btn-cancel"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn btn-reset"
            >
              {isNew ? "Add" : "Update"}
            </button>
          </div>
        </div>
      </CustomModal>

      <hr className="mb-12 mt-12 border-gray-300" />
      <ExtrasPrcing />
    </>
  );
};

export default FixedPricing;
