import React, { useState } from "react";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import { toast } from "react-toastify";
import {
    useGetAllZonesQuery,
} from "../../../redux/api/zoneApi";
import {
    useGetAllExtrasQuery,
    useCreateExtraMutation,
    useUpdateExtraMutation,
    useDeleteExtraMutation,
} from "../../../redux/api/fixedPriceApi";

const ExtrasPricing = () => {
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isNew, setIsNew] = useState(true);
    const [zoneSuggestions, setZoneSuggestions] = useState([]);

    const { data: zones = [] } = useGetAllZonesQuery();
    const { data: extras = [], refetch } = useGetAllExtrasQuery();
    const [createExtra] = useCreateExtraMutation();
    const [updateExtra] = useUpdateExtraMutation();
    const [deleteExtra] = useDeleteExtraMutation();

    const handleEdit = (item) => {
        setIsNew(false);
        setSelectedItem(item);
        setShowModal(true);
    };

    const handleAddNew = () => {
        setIsNew(true);
        setSelectedItem({
            zone: "",
            price: 0,
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        const { zone, price, _id } = selectedItem;

        if (!zone || !price) {
            toast.error("Please fill all fields");
            return;
        }

        const payload = {
            zone: zone.toString(),
            price: parseFloat(price),
        };

        try {
            if (isNew) {
                await createExtra(payload).unwrap();
                toast.success("Extra Added!");
            } else {
                await updateExtra({ id: _id, ...payload }).unwrap();
                toast.success("Extra Updated!");
            }
            setShowModal(false);
            refetch();
        } catch (err) {
            if (err?.status === 409) {
                toast.error("This zone already exists.");
            } else {
                toast.error("Operation failed");
            }
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteExtra(id);
            toast.success("Deleted successfully");
            refetch();
        } catch {
            toast.error("Failed to delete");
        }
    };

    const tableHeaders = [
        { label: "Zone Name", key: "zone" },
        { label: "Zone Entry Charge", key: "price" },
        { label: "Action", key: "actions" },
    ];

    const tableData = extras.map((item) => ({
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
                <OutletHeading name="Extras Pricing" />
                <button className="btn btn-edit mb-3" onClick={handleAddNew}>
                    Add New
                </button>

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
                heading={`${isNew ? "Add" : "Edit"} Extras`}
            >
                <div className="space-y-6 w-96 px-2 sm:px-4 pt-2 text-sm">
                    {/* Zone Name */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Zone Name</label>
                        <input
                            type="text"
                            className="custom_input"
                            placeholder="Type or select a zone"
                            value={selectedItem?.zone || ""}
                            onChange={(e) => {
                                setSelectedItem({ ...selectedItem, zone: e.target.value });
                                setZoneSuggestions(
                                    zones.map((z) => z.name).filter((z) =>
                                        z.toLowerCase().includes(e.target.value.toLowerCase())
                                    )
                                );
                            }}
                            onFocus={() => setZoneSuggestions(zones.map((z) => z.name))}
                            onBlur={() => setTimeout(() => setZoneSuggestions([]), 100)}
                        />
                        {zoneSuggestions.length > 0 && (
                            <ul className="absolute z-10 bg-white border rounded shadow max-h-40 overflow-y-auto w-full mt-1">
                                {zoneSuggestions.map((zone, index) => (
                                    <li
                                        key={index}
                                        onClick={() => {
                                            setSelectedItem({ ...selectedItem, zone });
                                            setZoneSuggestions([]);
                                        }}
                                        className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                                    >
                                        {zone}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Price Per Zone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Zone Entry Charge</label>
                        <input
                            type="number"
                            className="custom_input rounded-lg border border-gray-300 shadow-sm"
                            value={selectedItem?.price || 0}
                            onChange={(e) =>
                                setSelectedItem({
                                    ...selectedItem,
                                    price: parseFloat(e.target.value),
                                })
                            }
                            placeholder="Enter Price in GBP"
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
        </>
    );
};

export default ExtrasPricing;
