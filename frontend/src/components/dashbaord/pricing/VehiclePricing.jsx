import React, { useState, useEffect } from "react";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import {
  useCreateVehicleMutation,
  useDeleteVehicleMutation,
  useGetAllVehiclesQuery,
  useUpdateVehicleMutation,
} from "../../../redux/api/vehicleApi";

const VehiclePricing = () => {
  const { data: vehicleData = [], isLoading } = useGetAllVehiclesQuery();
  const [createVehicle] = useCreateVehicleMutation();
  const [updateVehicle] = useUpdateVehicleMutation();
  const [deleteVehicle] = useDeleteVehicleMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState("All");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [imageOptions, setImageOptions] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);

  useEffect(() => {
    const uniqueImages = Array.from(
      new Set(vehicleData.map((v) => v.image).filter(Boolean))
    );
    setImageOptions(uniqueImages);
  }, [vehicleData]);

  const handleEditModal = (record = {}) => {
    setSelectedAccount(record);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      await deleteVehicle(id);
      toast.success("Vehicle deleted successfully");
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    const user = JSON.parse(localStorage.getItem("user"));
    const companyId = user?.companyId;
    if (!companyId) return toast.error("Missing company ID");

    formData.append("companyId", companyId);

    Object.entries(selectedAccount).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === "priceType" && typeof value === "object") {
          formData.append(key, value.value || "");
        } else {
          formData.append(key, value);
        }
      }
    });

    if (uploadFile) {
      formData.append("image", uploadFile);
    }

    if (selectedAccount._id) {
      await updateVehicle({ id: selectedAccount._id, formData });
      toast.success("Vehicle updated successfully");
    } else {
      await createVehicle(formData);
      toast.success("Vehicle created successfully");
    }
    setShowModal(false);
  };

  const filteredData = vehicleData.filter((item) =>
    Object.values(item)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
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
    { label: "Price", key: "price" },
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
          onClick={() => handleDelete(item._id)}
          className="w-8 h-8 p-2 rounded-md hover:bg-red-600 hover:text-white text-gray-600 border border-gray-300 cursor-pointer"
        />
      </div>
    ),
  }));

  return (
    <>
      <OutletHeading name="Vehicle Pricing" />
      <div className="flex justify-end px-4 mb-4">
        <button className="btn btn-edit" onClick={() => handleEditModal({})}>
          Add New
        </button>
      </div>

      <CustomTable
        tableHeaders={tableHeaders}
        tableData={tableData}
        showPagination={true}
        showSorting={true}
        currentPage={page}
        setCurrentPage={setPage}
        perPage={perPage}
      />

      <CustomModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        heading={`Edit ${selectedAccount?.vehicleName || "Vehicle"}`}
      >
        <div className="mx-auto p-4 font-sans space-y-4">
          {["priority", "vehicleName", "passengers", "smallLuggage", "largeLuggage", "childSeat", "price"].map(
            (key) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, " $1")}
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
            )
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Price Type</label>
            <SelectOption
              width="full"
              options={["Percentage", "Amount"]}
              value={selectedAccount?.priceType}
              onChange={(val) =>
                setSelectedAccount({
                  ...selectedAccount,
                  priceType: val?.value || val,
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image Path or URL</label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                className="custom_input flex-1"
                value={selectedAccount?.image || ""}
                onChange={(e) =>
                  setSelectedAccount({
                    ...selectedAccount,
                    image: e.target.value,
                  })
                }
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
              <div className="flex justify-center">
                <img
                  src={selectedAccount.image}
                  alt="Preview"
                  className="mt-4 w-32 h-20 text-center object-cover rounded shadow"
                />
              </div>
            )}
          </div>

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

      <CustomModal
        isOpen={showImageSelector}
        onClose={() => setShowImageSelector(false)}
        heading="Select Image"
      >
        <div className="grid grid-cols-3 gap-4 p-4">
          {imageOptions.map((imgPath) => (
            <img
              key={imgPath}
              src={imgPath}
              alt="vehicle"
              className="cursor-pointer rounded shadow border hover:border-blue-500"
              onClick={() => {
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
                // Show temp preview in form
                const tempUrl = URL.createObjectURL(file);
                setSelectedAccount((prev) => ({
                  ...prev,
                  image: tempUrl,
                }));
              }
            }}
            className="custom_input mt-2"
          />

        </div>
      </CustomModal>
    </>
  );
};

export default VehiclePricing;