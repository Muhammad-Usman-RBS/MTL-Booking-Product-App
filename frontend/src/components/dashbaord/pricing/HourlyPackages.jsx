import React, { useState, useEffect } from "react";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import DeleteModal from "../../../constants/constantscomponents/DeleteModal";
import { toast } from "react-toastify";
import Icons from "../../../assets/icons";
import { useSelector } from "react-redux";
import {
  useGetAllHourlyRatesQuery,
  useAddHourlyPackageMutation,
  useUpdateHourlyPackageMutation,
  useDeleteHourlyPackageMutation,
} from "../../../redux/api/hourlyPricingApi";
import { useGetAllVehiclesQuery } from "../../../redux/api/vehicleApi";
import { useGetBookingSettingQuery } from "../../../redux/api/bookingSettingsApi";
import { useLoading } from "../../common/LoadingProvider";

const HourlyPackages = () => {
  const {showLoading , hideLoading} = useLoading()
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({ distance: "", hours: "" });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;

  const { data: bookingSettingData , isLoading: isLoadingBookingsSettings } = useGetBookingSettingQuery();
  const currencySetting = bookingSettingData?.setting?.currency?.[0] || {};
  const currencySymbol = currencySetting?.symbol || "£";
  const currencyCode = currencySetting?.value || "GBP";

  const [addHourlyPackage, { isLoading: adding }] =
    useAddHourlyPackageMutation();
  const [updateHourlyPackage, { isLoading: updating }] =
    useUpdateHourlyPackageMutation();
  const [deleteHourlyPackage] = useDeleteHourlyPackageMutation();

  const {
    data: rawData = [],
    isLoading: loading,
    error,
    refetch,
  } = useGetAllHourlyRatesQuery(companyId, {
    skip: !companyId,
  });

  const { data: vehicles = [], isLoading: isLoadingAllVehicles } = useGetAllVehiclesQuery(companyId, {
    skip: !companyId,
  });
useEffect(() => {
  if(loading || isLoadingAllVehicles ||  isLoadingBookingsSettings) {
    showLoading()
  } else {
    hideLoading()
  }
}, [showLoading , hideLoading , loading , isLoadingAllVehicles, isLoadingBookingsSettings])
  const tableHeaders = [
    { key: "distance", label: "Distance (Miles)" },
    { key: "hours", label: "Hours" },
    ...vehicles.map((v) => ({ key: v.vehicleName, label: v.vehicleName })),
    { key: "actions", label: "Action" },
  ];

  const formattedData = rawData.map((item) => {
    const row = {
      distance: item.distance,
      hours: item.hours,
    };

    vehicles.forEach((v) => {
      row[v.vehicleName] =
        item.vehicleRates?.[v.vehicleName] !== undefined
          // ? `£${item.vehicleRates[v.vehicleName]}`
          ? `${currencySymbol}${Number(item.vehicleRates[v.vehicleName]).toFixed(2)}`
          : "-";
    });

    row.actions = (
      <div className="flex gap-2">
        <Icons.Pencil
          title="Edit"
          onClick={() => handleEdit(item)}
          className="w-8 h-8 p-2 rounded-md hover:bg-green-600 hover:text-white text-[var(--dark-gray)] border border-[var(--light-gray)] cursor-pointer"
        />
        <Icons.Trash
          title="Delete"
          onClick={() => openDeleteModal(item._id)}
          className="w-8 h-8 p-2 rounded-md hover:bg-red-600 hover:text-white text-[var(--dark-gray)] border border-[var(--light-gray)] cursor-pointer"
        />
      </div>
    );

    return row;
  });

  const handleEdit = (item) => {
    const updatedForm = {
      distance: item.distance,
      hours: item.hours,
    };

    vehicles.forEach((v) => {
      updatedForm[v.vehicleName] = item.vehicleRates?.[v.vehicleName] ?? "";
    });

    setFormData(updatedForm);
    setEditingId(item._id);
    setIsModalOpen(true);
    setFormError("");
  };

  const openDeleteModal = (id) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

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
    const base = { distance: "", hours: "" };
    vehicles.forEach((v) => {
      base[v.vehicleName] = "";
    });

    setFormData(base);
    setEditingId(null);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!companyId) {
      toast.error("Company ID missing");
      return;
    }

    const payload = {
      distance: formData.distance,
      hours: formData.hours,
      companyId,
    };

    vehicles.forEach((v) => {
      payload[v.vehicleName] = parseFloat(formData[v.vehicleName]) ?? "";
    });

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
    if (companyId) refetch();
  }, [companyId]);

  return (
    <div>
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

      {/* Modal */}
      <CustomModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        heading={editingId ? "Edit Hourly Package" : "Add Hourly Package"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 p-4 w-96">
          {[
            { label: "Distance (Miles)", name: "distance" },
            { label: "Hours", name: "hours" },
            ...vehicles.map((v) => ({
              label: v.vehicleName,
              name: v.vehicleName,
            })),
          ].map(({ label, name }, idx) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700">
                {/* {label}
                {idx >= 2 ? " (£)" : ""} */}
                {label}{idx >= 2 ? ` (${currencySymbol})` : ""}
              </label>
              <input
                type="number"
                name={name}
                value={formData[name] !== undefined ? formData[name] : ""}
                onChange={handleInputChange}
                className="custom_input"
                required
              />
            </div>
          ))}

          {formError && <p className="text-red-600">{formError}</p>}

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="submit"
              className="btn btn-reset"
              disabled={adding || updating}
            >
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
