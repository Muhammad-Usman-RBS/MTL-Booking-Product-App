// src/pages/settings/BookingRestrictionDate.jsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Icons from "../../../assets/icons";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import DeleteModal from "../../../constants/constantscomponents/DeleteModal";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import {
  useCreateBookingRestrictionMutation,
  useDeleteBookingRestrictionMutation,
  useGetAllBookingRestrictionsQuery,
  useUpdateBookingRestrictionMutation,
} from "../../../redux/api/bookingRestrictionDateApi";
import { useLoading } from "../../common/LoadingProvider";

/* ---------- Helpers (timezone-safe) ---------- */

// For <input type="datetime-local"> value (LOCAL, no Z)
const toLocalInputValue = (dateLike) => {
  if (!dateLike) return "";
  const d = new Date(dateLike);
  if (isNaN(d)) return "";
  const pad = (n) => String(n).padStart(2, "0");
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${y}-${m}-${day}T${hh}:${mm}`;
};

// Convert LOCAL input string -> ISO (UTC) for API/DB
const localInputToISO = (localStr) => {
  // localStr like "2025-08-18T15:15"
  if (!localStr) return null;
  const d = new Date(localStr);
  if (isNaN(d)) return null;
  return d.toISOString();
};

// Pretty table display in LOCAL timezone
const formatDateForTable = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date)) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  const time = date.toLocaleTimeString("en-GB", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${day}-${month}-${year} ${time}`;
};
/* --------------------------------------------- */

const BookingRestrictionDate = () => {
  const { showLoading, hideLoading } = useLoading();
  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;

  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [createBookingRestriction] = useCreateBookingRestrictionMutation();
  const {
    data: apiData,
    isLoading,
    isError,
  } = useGetAllBookingRestrictionsQuery(companyId);
  const [updateBookingRestriction] = useUpdateBookingRestrictionMutation();
  const [deleteBookingRestriction] = useDeleteBookingRestrictionMutation();

  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Any Status");

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading]);
  const handleEdit = (item) => {
    setSelectedItem({
      ...item,
      // IMPORTANT: show local values in the input (no UTC shift)
      from: toLocalInputValue(item.from),
      to: toLocalInputValue(item.to),
    });
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setSelectedItem({
      caption: "",
      recurring: "No",
      from: "",
      to: "",
      status: "Active",
      companyId,
    });
    setIsEditMode(false);
    setShowModal(true);
  };

  const handleUpdate = async () => {
    try {
      const { _id, caption, recurring, from, to, status } = selectedItem || {};

      if (!caption || !recurring || !from || !to || !status) {
        toast.error("All fields are required!");
        return;
      }

      // Normalize to ISO UTC before sending to API
      const payload = {
        caption,
        recurring,
        from: localInputToISO(from),
        to: localInputToISO(to),
        status,
        companyId,
      };

      if (!payload.from || !payload.to) {
        toast.error("Invalid date/time values!");
        return;
      }

      if (_id) {
        await updateBookingRestriction({
          id: _id,
          updatedData: payload,
        }).unwrap();
        toast.success("Booking Restriction Updated!");
      } else {
        await createBookingRestriction(payload).unwrap();
        toast.success("Booking Restriction Created!");
      }
      setShowModal(false);
    } catch (error) {
      console.error("Submit failed:", error);
      toast.error("Failed to save booking restriction");
    }
  };

  const data = apiData?.data || [];
  const filteredData =
    statusFilter === "Any Status"
      ? data
      : data.filter((item) => item.status === statusFilter);

  const tableHeaders = [
    { label: "Caption", key: "caption" },
    { label: "Recurring", key: "recurring" },
    { label: "From", key: "from" },
    { label: "To", key: "to" },
    { label: "Status", key: "status" },
    { label: "Action", key: "actions" },
  ];

  const tableData = filteredData.map((item) => ({
    ...item,
    from: formatDateForTable(item.from),
    to: formatDateForTable(item.to),
    actions: (
      <div className="flex gap-2">
        <div className="icon-box icon-box-warning">
          <Icons.Pencil
            title="Edit"
            onClick={() => handleEdit(item)}
            className="size-4"
          />
        </div>
        <div className="icon-box icon-box-danger">
          <Icons.Trash
            title="Delete"
            onClick={() => {
              setItemToDelete(item);
              setShowDeleteModal(true);
            }}
            className="size-4"
          />
        </div>
      </div>
    ),
  }));

  if (!companyId) {
    return (
      <p className="text-center text-red-600 py-10">
        Company ID is not available. Please contact Admin
      </p>
    );
  }
  if (isError) {
    return (
      <p className="text-center text-red-600 py-10">
        Failed to load booking restrictions.
      </p>
    );
  }

  return (
    <>
      <div>
        <OutletHeading name="Booking Restriction - Date & Time" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-2 mb-4">
          <SelectOption
            width="40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={["Any Status", "Active", "Inactive"]}
          />
          <div>
            <button onClick={handleAddNew} className="btn btn-edit">
              Add New
            </button>
          </div>
        </div>

        <CustomTable
          filename="Booking-Restrictions-list"
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
          selectedItem && selectedItem._id
            ? "Edit"
            : "Add New Booking Restriction"
        }
      >
        <div className="mx-auto w-96 p-4 font-sans space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Caption
            </label>
            <input
              type="text"
              className="custom_input"
              value={selectedItem?.caption || ""}
              onChange={(e) =>
                setSelectedItem({ ...selectedItem, caption: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Recurring
            </label>
            <select
              className="custom_input"
              value={selectedItem?.recurring || "No"}
              onChange={(e) =>
                setSelectedItem({ ...selectedItem, recurring: e.target.value })
              }
            >
              <option value="No">No</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              From
            </label>
            <input
              type="datetime-local"
              className="custom_input"
              value={selectedItem?.from || ""}
              onChange={(e) =>
                setSelectedItem({ ...selectedItem, from: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              To
            </label>
            <input
              type="datetime-local"
              className="custom_input"
              value={selectedItem?.to || ""}
              onChange={(e) =>
                setSelectedItem({ ...selectedItem, to: e.target.value })
              }
              placeholder="e.g. 2025-01-02T23:55"
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
              {isEditMode ? "Update" : "Add"}
            </button>
          </div>
        </div>
      </CustomModal>

      <DeleteModal
        isOpen={showDeleteModal}
        onConfirm={async () => {
          try {
            await deleteBookingRestriction(itemToDelete._id).unwrap();
            toast.success("Booking Restriction Deleted!");
          } catch (error) {
            console.error("Delete failed:", error);
            toast.error("Failed to delete booking restriction");
          } finally {
            setShowDeleteModal(false);
            setItemToDelete(null);
          }
        }}
        onCancel={() => {
          setShowDeleteModal(false);
          setItemToDelete(null);
        }}
      />
    </>
  );
};

export default BookingRestrictionDate;
