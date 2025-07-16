import React, { useState } from "react";
import { toast } from "react-toastify";
import Icons from "../../../assets/icons";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import DeleteModal from "../../../constants/constantscomponents/DeleteModal";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import {
  useCreateFixedPriceMutation,
  useDeleteFixedPriceMutation,
  useGetAllFixedPricesQuery,
  useUpdateFixedPriceMutation,
} from "../../../redux/api/fixedPriceApi";
import { useGetAllZonesQuery } from "../../../redux/api/zoneApi";
import ExtrasPrcing from "./ExtrasPrcing";

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
  const [deleteItemId, setDeleteItemId] = useState(null);

  const handleEdit = (item) => {
    const pickupZone = zones.find((z) => z.name === item.pickup);
    const dropoffZone = zones.find((z) => z.name === item.dropoff);

    setIsNew(false);
    setSelectedItem({
      ...item,
      pickup: pickupZone || {
        name: item.pickup,
        coordinates: item.pickupCoordinates,
      },
      dropoff: dropoffZone || {
        name: item.dropoff,
        coordinates: item.dropoffCoordinates,
      },
    });
    setShowModal(true);
  };

  const confirmDelete = (id) => {
    setDeleteItemId(id);
  };

  const handleAddNew = () => {
    setIsNew(true);
    setSelectedItem({
      direction: "",
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
          pickupCoordinates: item.pickupCoordinates, // retain existing coordinates
          dropoff: item.dropoff,
          dropoffCoordinates: item.dropoffCoordinates, // retain existing coordinates
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
          className="w-8 h-8 p-2 rounded-md hover:bg-green-600 hover:text-white text-[var(--dark-gray)] border border-gray-300 cursor-pointer"
        />
        <Icons.Trash
          title="Delete"
          onClick={() => confirmDelete(item._id)}
          className="w-8 h-8 p-2 rounded-md hover:bg-red-600 hover:text-white text-[var(--dark-gray)] border border-gray-300 cursor-pointer"
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
            <label className="block text-gray-700 font-semibold mb-1">
              Direction
            </label>
            <SelectOption
              width="full"
              value={selectedItem?.direction || ""}
              onChange={(e) =>
                setSelectedItem({
                  ...selectedItem,
                  direction: e.target.value,
                })
              }
              options={["One Way", "Both Ways"]}
            />
          </div>

        
          <div>
            <SelectOption
              label="Pick Up"
              width="full"
              value={selectedItem?.pickup?.name || ""}
              onChange={(e) => {
                console.log("Pickup onChange triggered:", e.target.value);
                const selectedZone = zones.find(
                  (z) => z.name === e.target.value
                );
                console.log("Selected pickup zone:", selectedZone);
                setSelectedItem({
                  ...selectedItem,
                  pickup: selectedZone || null,
                });
              }}
              options={zones.map((zone) => ({
                value: zone.name,
                label: zone.name,
                coordinates: zone.coordinates,
              }))}
            />
          </div>

          {/* Drop Off */}
          <div>
            <SelectOption
              label="Drop Off"
              width="full"
              value={selectedItem?.dropoff?.name || ""}
              onChange={(e) => {
                console.log("Dropoff onChange triggered:", e.target.value);
                const selectedZone = zones.find(
                  (z) => z.name === e.target.value
                );
                console.log("Selected dropoff zone:", selectedZone);
                setSelectedItem({
                  ...selectedItem,
                  dropoff: selectedZone || null,
                });
              }}
              options={zones.map((zone) => ({
                value: zone.name,
                label: zone.name,
                coordinates: zone.coordinates,
              }))}
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Price (GBP)
            </label>
            <input
              type="number"
              className="custom_input"
              value={selectedItem?.price}
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
            <button onClick={handleSave} className="btn btn-reset">
              {isNew ? "Add" : "Update"}
            </button>
          </div>
        </div>
      </CustomModal>

      <DeleteModal
        isOpen={!!deleteItemId}
        onConfirm={async () => {
          try {
            await deleteFixedPrice(deleteItemId);
            toast.success("Deleted successfully");
            refetch();
          } catch {
            toast.error("Failed to delete");
          } finally {
            setDeleteItemId(null);
          }
        }}
        onCancel={() => setDeleteItemId(null)}
      />

      <hr className="mb-12 mt-12 border-gray-300" />
      <ExtrasPrcing />
    </>
  );
};

export default FixedPricing;
