import React, { useEffect, useMemo, useState } from "react";
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
import { useGetBookingSettingQuery } from "../../../redux/api/bookingSettingsApi";
import { useLoading } from "../../common/LoadingProvider";

const FixedPricing = () => {
  const {showLoading , hideLoading} = useLoading()
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isNew, setIsNew] = useState(true);

  const { data: zones = [] , isLoading:isLoadingAllZones } = useGetAllZonesQuery();
  const zoneByName = useMemo(
    () => new Map(zones.map((z) => [z.name, z])),
    [zones]
  );
  const zoneById = useMemo(
    () => new Map(zones.map((z) => [z._id, z])),
    [zones]
  );

  const { data: fixedPrices = [], refetch, isFetching , isLoading:isLoadingAllFixedPricing } = useGetAllFixedPricesQuery();

  const [createFixedPrice, { isLoading: creating }] = useCreateFixedPriceMutation();
  const [updateFixedPrice, { isLoading: updating }] = useUpdateFixedPriceMutation();
  const [deleteFixedPrice, { isLoading: deleting }] = useDeleteFixedPriceMutation();

  const [priceChange, setPriceChange] = useState(0);
  const [deleteItemId, setDeleteItemId] = useState(null);

  const { data: bookingSettingData , isLoading: isLoadingBookingsSettings } = useGetBookingSettingQuery();
  useEffect(() => {
    if(isLoadingAllFixedPricing || isLoadingAllZones || isLoadingBookingsSettings) {
      showLoading()
    } else{ 
      hideLoading()
    }
  }, [isLoadingAllFixedPricing , isLoadingAllZones , isLoadingBookingsSettings , showLoading , hideLoading])
   // currency from booking settings
  const currencySetting = bookingSettingData?.setting?.currency?.[0] || {};
  const currencySymbol = currencySetting?.symbol || "£";
  const currencyCode = currencySetting?.value || "GBP";

  const zonesOptions = useMemo(
    () =>
      zones.map((z) => ({
        value: z.name, // SelectOption uses .value/.label
        label: z.name,
        id: z._id,
        coordinates: z.coordinates,
      })),
    [zones]
  );

  const handleEdit = (item) => {
    // Try to resolve by id (normalized), then name (legacy)
    const pickupZone =
      (item.pickupZone && zoneById.get(item.pickupZone)) ||
      (item.pickupZoneId && zoneById.get(item.pickupZoneId)) ||
      zoneByName.get(item.pickup) ||
      {
        // fallback to embedded coords if zone not found
        name: item.pickup,
        _id: undefined,
        coordinates: item.pickupCoordinates || [],
      };

    const dropoffZone =
      (item.dropoffZone && zoneById.get(item.dropoffZone)) ||
      (item.dropoffZoneId && zoneById.get(item.dropoffZoneId)) ||
      zoneByName.get(item.dropoff) ||
      {
        name: item.dropoff,
        _id: undefined,
        coordinates: item.dropoffCoordinates || [],
      };

    setIsNew(false);
    setSelectedItem({
      ...item,
      pickup: pickupZone,
      dropoff: dropoffZone,
    });
    setShowModal(true);
  };

  const confirmDelete = (id) => setDeleteItemId(id);

  const handleAddNew = () => {
    setIsNew(true);
    setSelectedItem({
      direction: "One Way",
      pickup: null,
      dropoff: null,
      price: 0,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    const { pickup, dropoff, price, direction, _id } = selectedItem || {};

    if (!pickup || !dropoff || price === undefined || price === null || isNaN(Number(price))) {
      toast.error("Please select pickup, dropoff and enter a valid price");
      return;
    }

    // prefer zone coords if selected from list; otherwise keep whatever is present
    const pickupCoords = pickup?.coordinates || selectedItem?.pickupCoordinates || [];
    const dropoffCoords = dropoff?.coordinates || selectedItem?.dropoffCoordinates || [];

    const payload = {
      // normalized fields (for new backend)
      pickupZoneId: pickup?._id,
      dropoffZoneId: dropoff?._id,
      // legacy fields (for current backend)
      pickup: pickup?.name,
      pickupCoordinates: pickupCoords,
      dropoff: dropoff?.name,
      dropoffCoordinates: dropoffCoords,
      price: parseFloat(price),
      direction: direction === "Both Ways" ? "Both Ways" : "One Way",
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
      await refetch();
    } catch (err) {
      if (err?.status === 409) {
        toast.error("This pickup-dropoff pair already exists.");
      } else {
        toast.error(err?.data?.message || "Operation failed");
      }
    }
  };

  const handleBulkUpdate = async () => {
    const delta = parseFloat(priceChange);
    if (isNaN(delta)) {
      toast.error("Enter a valid number.");
      return;
    }
    if (!fixedPrices?.length) return;

    try {
      // naive sequential; if you have a bulk API use that
      for (const item of fixedPrices) {
        const updatedPrice = Number(item.price) + delta;

        await updateFixedPrice({
          id: item._id,
          // send both normalized and legacy so either backend accepts
          pickupZoneId: item.pickupZone || item.pickupZoneId,
          dropoffZoneId: item.dropoffZone || item.dropoffZoneId,
          pickup: item.pickup,
          pickupCoordinates: item.pickupCoordinates,
          dropoff: item.dropoff,
          dropoffCoordinates: item.dropoffCoordinates,
          price: updatedPrice,
          direction: item.direction,
        }).unwrap();
      }

      toast.success("All prices updated successfully!");
      await refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Bulk update failed.");
    }
  };

  const tableHeaders = [
    { label: "Pick Up", key: "pickup" },
    { label: "Drop Off", key: "dropoff" },
    // { label: "Price (GBP)", key: "price" },
    { label: `Price (${currencyCode})`, key: "price" },
    { label: "Action", key: "actions" },
  ];

  const tableData = fixedPrices.map((item) => ({
    ...item,
    // show names from item; they’re already strings
    actions: (
      <div className="flex gap-2">
        <Icons.Pencil
          title="Edit"
          onClick={() => handleEdit(item)}
          className="w-8 h-8 p-2 rounded-md hover:bg-green-600 hover:text-white text-[var(--dark-gray)] border border-[var(--light-gray)] cursor-pointer"
        />
        <Icons.Trash
          title="Delete"
          onClick={() => confirmDelete(item._id)}
          className="w-8 h-8 p-2 rounded-md hover:bg-red-600 hover:text-white text-[var(--dark-gray)] border border-[var(--light-gray)] cursor-pointer"
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
                // placeholder="GBP"
                 placeholder={currencyCode}
                value={priceChange}
                onChange={(e) => setPriceChange(e.target.value)}
              />
              <button className="btn btn-edit" onClick={handleBulkUpdate} disabled={updating}>
                Update
              </button>
            </div>
          </div>
          <button className="btn btn-back" onClick={handleAddNew}>
            Add New
          </button>
        </div>

        <CustomTable
          filename="Fixed-Pricing-list"
          tableHeaders={tableHeaders}
          tableData={tableData}
          showPagination={true}
          showSorting={true}
          isLoading={isFetching}
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
              value={selectedItem?.direction || "One Way"}
              onChange={(e) =>
                setSelectedItem((prev) => ({
                  ...prev,
                  direction: e.target.value,
                }))
              }
              options={["One Way", "Both Ways"]}
            />
          </div>

          {/* Pick Up */}
          <div>
            <SelectOption
              label="Pick Up"
              width="full"
              value={selectedItem?.pickup?.name || ""}
              onChange={(e) => {
                const zone = zoneByName.get(e.target.value);
                setSelectedItem((prev) => ({
                  ...prev,
                  pickup: zone
                    ? zone
                    : {
                      name: e.target.value,
                      _id: undefined,
                      coordinates: prev?.pickup?.coordinates || [],
                    },
                }));
              }}
              options={zonesOptions}
            />
          </div>

          {/* Drop Off */}
          <div>
            <SelectOption
              label="Drop Off"
              width="full"
              value={selectedItem?.dropoff?.name || ""}
              onChange={(e) => {
                const zone = zoneByName.get(e.target.value);
                setSelectedItem((prev) => ({
                  ...prev,
                  dropoff: zone
                    ? zone
                    : {
                      name: e.target.value,
                      _id: undefined,
                      coordinates: prev?.dropoff?.coordinates || [],
                    },
                }));
              }}
              options={zonesOptions}
            />
          </div>

          {/* Price */}
          <div>
            {/* <label className="block text-gray-700 font-semibold mb-1">Price (GBP)</label> */}
            <label className="block text-gray-700 font-semibold mb-1">Price ({currencyCode})</label>
 
            <input
              type="number"
              className="custom_input"
              value={selectedItem?.price ?? 0}
              onChange={(e) =>
                setSelectedItem((prev) => ({
                  ...prev,
                  price: e.target.value === "" ? "" : parseFloat(e.target.value),
                }))
              }
              // placeholder="Enter fixed price in GBP"
              placeholder={`Enter fixed price in ${currencyCode}`}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-2 gap-3">
            <button onClick={() => setShowModal(false)} className="btn btn-cancel">
              Cancel
            </button>
            <button onClick={handleSave} className="btn btn-edit" disabled={creating || updating}>
              {isNew ? (creating ? "Adding..." : "Add") : updating ? "Updating..." : "Update"}
            </button>
          </div>
        </div>
      </CustomModal>

      <DeleteModal
        isOpen={!!deleteItemId}
        onConfirm={async () => {
          try {
            await deleteFixedPrice(deleteItemId).unwrap();
            toast.success("Deleted successfully");
            await refetch();
          } catch {
            toast.error("Failed to delete");
          } finally {
            setDeleteItemId(null);
          }
        }}
        onCancel={() => setDeleteItemId(null)}
        loading={deleting}
      />

      <hr className="mb-12 mt-12 border-[var(--light-gray)]" />
      <ExtrasPrcing />
    </>
  );
};

export default FixedPricing;
