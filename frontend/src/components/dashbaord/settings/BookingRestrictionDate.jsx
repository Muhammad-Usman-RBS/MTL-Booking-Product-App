import React, { useState } from "react";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import { toast } from "react-toastify";
import { useCreateBookingRestrictionMutation, useDeleteBookingRestrictionMutation, useGetAllBookingRestrictionsQuery, useUpdateBookingRestrictionMutation} from "../../../redux/api/bookingRestrictionDateApi";
import DeleteModal from "../../../constants/constantscomponents/DeleteModal";
import { useSelector } from "react-redux";

const BookingRestrictionDate = () => {
  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [createBookingRestriction] = useCreateBookingRestrictionMutation();
  const {
    data: apiData,
    isLoading,
    isError,
  } = useGetAllBookingRestrictionsQuery(companyId);
  console.log(user)
  const [updateBookingRestriction] = useUpdateBookingRestrictionMutation();
  const [deleteBookingRestriction] = useDeleteBookingRestrictionMutation();

  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Any Status");

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };
  const handleAddNew = () => {
    setSelectedItem({
      caption: "",
      recurring: "No",
      from: "",
      to: "",
      status: "Active",
      companyId: companyId,
      
    });
    setShowModal(true);
  };

  const handleUpdate = async () => {
    try {
      const { _id, caption, recurring, from, to, status } = selectedItem;

      if (!caption || !recurring || !from || !to || !status) {
        toast.error("All fields are required!");
        return;
      }

      const payload = {
        caption,
        recurring,
        from: new Date(from),
        to: new Date(to),
        status,
        companyId
      };

      if (_id) {
        // Edit mode
        const response = await updateBookingRestriction({
          id: _id,
          updatedData: payload,
        }).unwrap();
        toast.success("Booking Restriction Updated!");
        console.log("Updated Booking Restriction:", response);
      } else {
        // Create mode
        const response = await createBookingRestriction(payload).unwrap();
        toast.success("Booking Restriction Created!");
        console.log("Created Booking Restriction:", response);
      }

      setShowModal(false);
    } catch (error) {
      console.error("Submit failed:", error);
      toast.error("Failed to save booking restriction");
    }
  };

  const handleDelete = async (_id) => {
    try {
      await deleteBookingRestriction(_id).unwrap();
      toast.success("Booking Restriction Deleted!");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete booking restriction");
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    const time = date.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${day.toString().padStart(2, "0")}-${month}-${year} ${time}`;
  };
  const tableData = filteredData.map((item) => ({
    ...item,
    from: formatDate(item.from),
    to: formatDate(item.to),
    actions: (
      <div className="flex gap-2">
        <Icons.Pencil
          title="Edit"
          onClick={() => handleEdit(item)}
          className="w-8 h-8 p-2 rounded-md hover:bg-green-600 hover:text-white text-gray-600 border border-gray-300 cursor-pointer"
        />
        <Icons.Trash
          title="Delete"
          onClick={() => {
            setItemToDelete(item);
            setShowDeleteModal(true);
          }}
          className="w-8 h-8 p-2 rounded-md hover:bg-red-600 hover:text-white text-gray-600 border border-gray-300 cursor-pointer"
        />
      </div>
    ),
  }));
  if (isLoading) {
    return <p className="text-center py-10">Loading booking restrictions...</p>;
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
          data.find((d) => d.caption === selectedItem?.caption)
            ? `Edit`
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
              value={selectedItem?.recurring || ""}
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
              placeholder="e.g. 02-Jan 23:55"
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
              ADD
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
