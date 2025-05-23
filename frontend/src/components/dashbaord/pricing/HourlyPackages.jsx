import React, { useState, useEffect } from "react";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import DeleteModal from "../../../constants/constantscomponents/DeleteModal"; 
import { Pencil, Trash } from "lucide-react";
import { toast } from "react-toastify";
import {
  useGetAllHourlyRatesQuery,
  useAddHourlyPackageMutation,
  useUpdateHourlyPackageMutation,
  useDeleteHourlyPackageMutation,
} from "../../../redux/api/hourlyPricingApi";

const HourlyPackages = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    distance: "",
    hours: "",
    standardSaloon: "",
    executiveSaloon: "",
    vipSaloon: "",
    luxuryMPV: "",
    eightPassengerMPV: "",
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const companyId = user?.companyId;

  const [addHourlyPackage, { isLoading: adding }] = useAddHourlyPackageMutation();
  const [updateHourlyPackage, { isLoading: updating }] = useUpdateHourlyPackageMutation();
  const [deleteHourlyPackage] = useDeleteHourlyPackageMutation();

  const {
    data: rawData = [],
    isLoading: loading,
    error,
    refetch,
  } = useGetAllHourlyRatesQuery(companyId, {
    skip: !companyId || companyId === "null",
  });

  const tableHeaders = [
    { key: "distance", label: "Distance" },
    { key: "hours", label: "Hours" },
    { key: "standardSaloon", label: "Standard Saloon" },
    { key: "executiveSaloon", label: "Executive Saloon" },
    { key: "vipSaloon", label: "VIP Saloon" },
    { key: "luxuryMPV", label: "Luxury MPV" },
    { key: "eightPassengerMPV", label: "8 Passenger MPV" },
    { key: "actions", label: "Action" },
  ];

  const formattedData = rawData.map((item) => ({
    ...item,
    actions: (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleEdit(item)}
          className="p-1 text-blue-600 hover:text-blue-800"
          title="Edit"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => openDeleteModal(item._id)}
          className="p-1 text-red-600 hover:text-red-800"
          title="Delete"
        >
          <Trash size={16} />
        </button>
      </div>
    ),
  }));

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      distance: item.distance,
      hours: item.hours,
      standardSaloon: item.standardSaloon,
      executiveSaloon: item.executiveSaloon,
      vipSaloon: item.vipSaloon,
      luxuryMPV: item.luxuryMPV,
      eightPassengerMPV: item.eightPassengerMPV,
    });
    setIsModalOpen(true);
    setFormError("");
  };

  // Open the delete confirmation modal and store the ID
  const openDeleteModal = (id) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Delete handler with API call and notifications
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteHourlyPackage(deleteId).unwrap();
      toast.success("Hourly package deleted successfully");
      setIsDeleteModalOpen(false);
      setDeleteId(null);
      refetch();
    } catch (err) {
      toast.error("Failed to delete hourly package");
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setEditingId(null);
    setFormData({
      distance: "",
      hours: "",
      standardSaloon: "",
      executiveSaloon: "",
      vipSaloon: "",
      luxuryMPV: "",
      eightPassengerMPV: "",
    });
    setFormError("");
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!companyId) {
      toast.error("Company ID missing");
      return;
    }

    const payload = { ...formData, companyId };

    try {
      if (editingId) {
        await updateHourlyPackage({
          id: editingId,
          updatedData: payload,
        }).unwrap();
        toast.success("Package updated successfully");
      } else {
        await addHourlyPackage(payload).unwrap();
        toast.success("Package added successfully");
      }

      await refetch();
      handleCloseModal();
    } catch (error) {
      console.error("Submission error:", error);
      setFormError(error?.data?.message || "Submission failed");
    } finally {
      setEditingId(null);
    }
  };

  useEffect(() => {
    if (companyId) {
      refetch();
    }
  }, [companyId]);

  return (
    <div className="p-4">
      <OutletHeading name="Hourly Package" />

      <button onClick={handleOpenModal} className="mb-6 btn btn-edit">
        Add New
      </button>

      {loading ? (
        <div className="flex justify-center p-8">
          <p>Loading data...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Failed to load data.
          <button onClick={refetch} className="ml-2 underline">
            Retry
          </button>
        </div>
      ) : (
        <CustomTable
          tableHeaders={tableHeaders}
          tableData={formattedData}
          showPagination={true}
          showSorting={true}
        />
      )}

      {/* Add/Edit Modal */}
      <CustomModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        heading={editingId ? "Edit Hourly Package" : "Add Hourly Package"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          {[
            { label: "Distance", name: "distance" },
            { label: "Hours", name: "hours" },
            { label: "Standard Saloon", name: "standardSaloon" },
            { label: "Executive Saloon", name: "executiveSaloon" },
            { label: "VIP Saloon", name: "vipSaloon" },
            { label: "Luxury MPV", name: "luxuryMPV" },
            { label: "8 Passenger MPV", name: "eightPassengerMPV" },
          ].map(({ label, name }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700">{label}</label>
              <input
                type="number"
                name={name}
                value={formData[name]}
                onChange={handleInputChange}
                className="custom_input"
                required
              />
            </div>
          ))}

          {formError && <p className="text-red-600">{formError}</p>}

          <div className="flex justify-end space-x-3 pt-2">
            <button type="submit" className="btn btn-reset" disabled={adding || updating}>
              {editingId ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={handleCloseModal}
              className="btn btn-cancel"
            >
              Cancel
            </button>
          </div>
        </form>
      </CustomModal>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onConfirm={handleDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeleteId(null);
        }}
      />
    </div>
  );
};

export default HourlyPackages;