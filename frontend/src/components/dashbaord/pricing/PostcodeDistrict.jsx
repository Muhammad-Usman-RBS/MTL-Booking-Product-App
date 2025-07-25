import React, { useState, useEffect } from "react";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useLazySearchPostcodeSuggestionsQuery } from "../../../redux/api/googleApi";
import {
  useFetchAllPostcodePricesQuery,
  useCreatePostcodePriceMutation,
  useUpdatePostcodePriceMutation,
  useDeletePostcodePriceMutation,
} from "../../../redux/api/postcodePriceApi";

const PostcodeDistrict = () => {
  const companyId = useSelector((state) => state.auth?.user?.companyId);

  const { data: fixedPrices = [], refetch } = useFetchAllPostcodePricesQuery();
  const [createFixedPrice] = useCreatePostcodePriceMutation();
  const [updateFixedPrice] = useUpdatePostcodePriceMutation();
  const [deleteFixedPrice] = useDeletePostcodePriceMutation();

  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [priceChange, setPriceChange] = useState(0);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);

  const [triggerPostcodeSuggestions] = useLazySearchPostcodeSuggestionsQuery();

  useEffect(() => {
    refetch();
  }, []);

  const handlePostcodeSuggestions = async (value, setSuggestions) => {
    if (!value || value.length < 1) {
      setSuggestions([]);
      return;
    }
    try {
      const { data } = await triggerPostcodeSuggestions(value);
      if (data?.postcodes?.length > 0) {
        setSuggestions([...new Set(data.postcodes)]);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error("Failed to fetch suggestions", err);
      setSuggestions([]);
    }
  };

  const handleEdit = (item) => {
    setIsNew(false);
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setIsNew(true);
    setSelectedItem({ pickup: "", dropoff: "", price: 0 });
    setShowModal(true);
  };

  const handleSave = async () => {
    const { pickup, dropoff, price, _id } = selectedItem;

    if (!pickup || !dropoff || !price) {
      toast.error("Please fill all fields");
      return;
    }

    const payload = {
      pickup: pickup.trim(),
      dropoff: dropoff.trim(),
      price: parseFloat(price),
      companyId,
    };

    try {
      if (isNew) {
        await createFixedPrice(payload).unwrap();
        toast.success("Postcode Price Added!");
      } else {
        await updateFixedPrice({ id: _id, ...payload }).unwrap();
        toast.success("Postcode Price Updated!");
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
          companyId,
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

  const filteredData = fixedPrices.filter(item => item.companyId === companyId);
  const tableData = filteredData.map((item) => ({
    ...item,
    actions: (
      <div className="flex gap-2">
        <Icons.Pencil title="Edit" onClick={() => handleEdit(item)} className="w-8 h-8 p-2 rounded-md hover:bg-green-600 hover:text-white text-[var(--dark-gray)] border border-[var(--light-gray)] cursor-pointer" />
        <Icons.Trash title="Delete" onClick={() => handleDelete(item._id)} className="w-8 h-8 p-2 rounded-md hover:bg-red-600 hover:text-white text-[var(--dark-gray)] border border-[var(--light-gray)] cursor-pointer" />
      </div>
    ),
  }));

  return (
    <>
      <OutletHeading name="Postcode District" />
      <div className="flex justify-between items-center mb-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Increase / Decrease All Prices</label>
          <div className="flex gap-2">
            <input type="number" className="custom_input w-32" placeholder="GBP" value={priceChange} onChange={(e) => setPriceChange(e.target.value)} />
            <button className="btn btn-reset" onClick={handleBulkUpdate}>Update</button>
          </div>
        </div>
        <button className="btn btn-edit" onClick={handleAddNew}>Add New</button>
      </div>

      <CustomTable tableHeaders={tableHeaders} tableData={tableData} showPagination={true} showSorting={true} />

      <CustomModal isOpen={showModal} onClose={() => setShowModal(false)} heading={`${isNew ? "Add" : "Edit"} Postcode Price`}>
        <div className="space-y-6 w-96 px-2 sm:px-4 pt-2 text-sm">
          {/* Pickup */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Postcode</label>
            <input
              type="text"
              className="custom_input"
              placeholder="Enter pickup postcode"
              value={selectedItem?.pickup || ""}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedItem({ ...selectedItem, pickup: val });
                handlePostcodeSuggestions(val, setPickupSuggestions);
              }}
              onBlur={() => setTimeout(() => setPickupSuggestions([]), 200)}
            />
            {pickupSuggestions.length > 0 && (
              <ul className="absolute z-10 bg-white border rounded shadow max-h-40 overflow-y-auto w-full mt-1">
                {pickupSuggestions.map((postcode, index) => (
                  <li key={index} onClick={() => { setSelectedItem({ ...selectedItem, pickup: postcode }); setPickupSuggestions([]); }} className="p-2 hover:bg-gray-100 cursor-pointer text-sm">{postcode}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Dropoff */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Dropoff Postcode</label>
            <input
              type="text"
              className="custom_input"
              placeholder="Enter dropoff postcode"
              value={selectedItem?.dropoff || ""}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedItem({ ...selectedItem, dropoff: val });
                handlePostcodeSuggestions(val, setDropoffSuggestions);
              }}
              onBlur={() => setTimeout(() => setDropoffSuggestions([]), 200)}
            />
            {dropoffSuggestions.length > 0 && (
              <ul className="absolute z-10 bg-white border rounded shadow max-h-40 overflow-y-auto w-full mt-1">
                {dropoffSuggestions.map((postcode, index) => (
                  <li key={index} onClick={() => { setSelectedItem({ ...selectedItem, dropoff: postcode }); setDropoffSuggestions([]); }} className="p-2 hover:bg-gray-100 cursor-pointer text-sm">{postcode}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Price (GBP)</label>
            <input type="number" className="custom_input" value={selectedItem?.price} onChange={(e) => setSelectedItem({ ...selectedItem, price: parseFloat(e.target.value) })} placeholder="Enter fixed price" />
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end pt-2 gap-3">
            <button onClick={() => setShowModal(false)} className="btn btn-cancel">Cancel</button>
            <button onClick={handleSave} className="btn btn-reset">{isNew ? "Add" : "Update"}</button>
          </div>
        </div>
      </CustomModal>
    </>
  );
};

export default PostcodeDistrict;
