import React, { useState, useEffect } from "react";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import DeleteModal from "../../../constants/constantscomponents/DeleteModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import {
  useCreateVehicleMutation,
  useDeleteVehicleMutation,
  useGetAllVehiclesQuery,
  useUpdateVehicleMutation,
} from "../../../redux/api/vehicleApi";

const VehiclePricing = () => {
  const { data: vehicleData = [], refetch } = useGetAllVehiclesQuery();
  const companyId = useSelector((state) => state.auth?.user?.companyId);

  const [createVehicle] = useCreateVehicleMutation();
  const [updateVehicle] = useUpdateVehicleMutation();
  const [deleteVehicle] = useDeleteVehicleMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState("All");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [imageOptions, setImageOptions] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    if (vehicleData?.length) {
      const uniqueImages = Array.from(
        new Set(vehicleData.map((v) => v.image).filter(Boolean))
      );
      setImageOptions(uniqueImages);
    }
  }, [vehicleData]);

  useEffect(() => {
    if (showModal) {
      setSelectedAccount((prev) => ({
        ...prev,
        features: prev?.features?.length ? prev.features : [""],
      }));
    }
  }, [showModal]);

  const handleEditModal = (record = {}) => {
    setSelectedAccount(record);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteVehicle(deleteId);
      toast.success("Vehicle deleted successfully");
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (err) {
      toast.error("Failed to delete vehicle");
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();

    if (!companyId) {
      toast.error("Company ID missing");
      return;
    }
    formData.append("companyId", companyId);
    formData.append("priceType", "Percentage");

    const parsedSlabs = (selectedAccount.slabs || []).map(s => ({
      from: Number(s.from),
      to: Number(s.to),
      price: Number(s.price)
    })).filter(s => !isNaN(s.from) && !isNaN(s.to) && !isNaN(s.price));
    formData.append("slabs", JSON.stringify(parsedSlabs));

    Object.entries(selectedAccount).forEach(([key, value]) => {
      if (key === "image" || key === "features" || key === "priceType" || key === "slabs") return;
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    if (uploadFile) {
      formData.append("image", uploadFile);
    } else if (selectedAccount.image) {
      formData.append("image", selectedAccount.image);
    }

    const cleanedFeatures = (selectedAccount.features || [])
      .map((f) => f.trim())
      .filter((f) => f);
    formData.append("features", JSON.stringify(cleanedFeatures));

    try {
      if (selectedAccount._id) {
        await updateVehicle({ id: selectedAccount._id, formData });
        toast.success("Vehicle updated successfully");
      } else {
        await createVehicle(formData);
        toast.success("Vehicle created successfully");
      }
      setShowModal(false);
      refetch();
    } catch (err) {
      toast.error("Error saving vehicle");
    }
  };

  const filteredData = vehicleData
    .filter((item) => item.companyId === companyId)
    .filter((item) =>
      Object.values(item).join(" ").toLowerCase().includes(searchTerm.toLowerCase())
    );

  const paginatedData =
    perPage === "All"
      ? filteredData
      : filteredData.slice((page - 1) * perPage, page * perPage);

  const tableHeaders = [
    { label: "Priority", key: "priority" },
    { label: "Vehicle Name", key: "vehicleName" },
    { label: "Passengers", key: "passengers" },
    { label: "Small Luggage", key: "smallLuggage" },
    { label: "Large Luggage", key: "largeLuggage" },
    { label: "Child Seat", key: "childSeat" },
    { label: "Percentage Rate", key: "percentageIncrease" },
    { label: "Action", key: "actions" },
  ];

  const tableData = paginatedData.map((item) => ({
    ...item,
    actions: (
      <div className="flex gap-2">
        <Icons.Pencil
          title="Edit"
          onClick={() => handleEditModal(item)}
          className="w-8 h-8 p-2 rounded-md hover:bg-green-600 hover:text-white text-gray-600 border border-gray-300 cursor-pointer"
        />
        <Icons.Trash
          title="Delete"
          onClick={() => {
            setDeleteId(item._id);
            setShowDeleteModal(true);
          }}
          className="w-8 h-8 p-2 rounded-md hover:bg-red-600 hover:text-white text-gray-600 border border-gray-300 cursor-pointer"
        />
      </div>
    ),
  }));

  return (
    <>
      <OutletHeading name="Vehicle Pricing" />
      <button className="btn btn-edit mb-4" onClick={() => handleEditModal({})}>
        Add New
      </button>

      <CustomTable
        tableHeaders={tableHeaders}
        tableData={tableData}
        showPagination={true}
        showSorting={true}
        currentPage={page}
        setCurrentPage={setPage}
        perPage={perPage}
      />

      {/* Create/Edit Modal */}
      <CustomModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        heading={
          selectedAccount?._id
            ? `Edit ${selectedAccount.vehicleName || "Vehicle"}`
            : "Add Vehicle"
        }
      >
        <div className="mx-auto p-4 font-sans space-y-4">
          {[
            "priority",
            "vehicleName",
            "passengers",
            "smallLuggage",
            "largeLuggage",
            "childSeat",
            "percentageIncrease",
          ].map((key) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 capitalize">
                {key === "percentageIncrease" ? "Percentage Increase (%)" : key.replace(/([A-Z])/g, " $1")}
              </label>
              <input
                type={key === "vehicleName" ? "text" : "number"}
                className="custom_input"
                value={selectedAccount?.[key] || ""}
                onChange={(e) =>
                  setSelectedAccount({
                    ...selectedAccount,
                    [key]: e.target.value,
                  })
                }
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700">Price Type</label>
            <input
              type="text"
              className="custom_input"
              value="Percentage"
              disabled
            />
          </div>

          {/* Features Fields */}
          <div className="mt-4">
            <label className="block text-sm font-semibold mb-1">Features</label>
            {selectedAccount?.features?.map((feature, index) => (
              <div key={index} className="flex gap-2 items-center mb-2">
                <input
                  type="text"
                  placeholder={`Feature ${index + 1}`}
                  className="custom_input flex-1"
                  value={feature}
                  onChange={(e) => {
                    const updated = [...selectedAccount.features];
                    updated[index] = e.target.value;
                    setSelectedAccount({ ...selectedAccount, features: updated });
                  }}
                />
                <button
                  className="text-red-500 font-bold"
                  onClick={() => {
                    const updated = [...selectedAccount.features];
                    updated.splice(index, 1);
                    setSelectedAccount({ ...selectedAccount, features: updated });
                  }}
                >
                  ✖
                </button>
              </div>
            ))}

            <button
              type="button"
              className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded"
              onClick={() => {
                if (selectedAccount.features.length >= 10) {
                  toast.warning("You can only add up to 10 features.");
                  return;
                }
                setSelectedAccount({
                  ...selectedAccount,
                  features: [...selectedAccount.features, ""],
                });
              }}
            >
              + Add More
            </button>
          </div>

          {/* Image Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image Path or URL</label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                className="custom_input flex-1"
                value={uploadFile ? uploadFile.name : selectedAccount?.image || ""}
                readOnly
              />
              <button
                type="button"
                className="px-3 py-1 bg-gray-200 border border-gray-400 rounded hover:bg-gray-300"
                onClick={() => setShowImageSelector(true)}
              >
                📁
              </button>
            </div>

            {selectedAccount?.image && (
              <div className="flex flex-col items-center mt-3">
                <img
                  src={selectedAccount.image}
                  alt="Preview"
                  className="w-32 h-20 object-cover rounded shadow"
                />
                {uploadFile && (
                  <p className="text-xs text-gray-500 mt-1">{uploadFile.name}</p>
                )}
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={handleSubmit} className="btn btn-reset">
              {selectedAccount?._id ? "Update" : "Create"}
            </button>
            <button onClick={() => setShowModal(false)} className="btn btn-cancel">
              Cancel
            </button>
          </div>
        </div>
      </CustomModal>

      {/* Image Selector Modal */}
      <CustomModal
        isOpen={showImageSelector}
        onClose={() => setShowImageSelector(false)}
        heading="Select Image"
      >
        <div className="grid grid-cols-8 gap-4 p-4">
          {imageOptions.map((imgPath) => (
            <img
              key={imgPath}
              src={imgPath}
              alt="vehicle"
              className="cursor-pointer rounded shadow border hover:border-blue-500"
              onClick={() => {
                setUploadFile(null);
                setSelectedAccount({ ...selectedAccount, image: imgPath });
                setShowImageSelector(false);
              }}
            />
          ))}
        </div>
        <div className="px-4 pb-4">
          <label className="block text-sm font-medium text-gray-700">
            Upload Image (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setUploadFile(file);
                setSelectedAccount((prev) => ({
                  ...prev,
                  image: "",
                }));
              }
            }}
            className="custom_input mt-2"
          />
        </div>
      </CustomModal>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeleteId(null);
          refetch();
        }}
      />
    </>
  );
};

export default VehiclePricing;
