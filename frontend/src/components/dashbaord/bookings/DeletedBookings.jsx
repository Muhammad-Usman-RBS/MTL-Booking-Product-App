import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import {
  useDeleteBookingMutation,
  useGetAllBookingsQuery,
  useRestoreOrDeleteBookingMutation,
} from "../../../redux/api/bookingApi";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import Icons from "../../../assets/icons";
import DeleteModal from "../../../constants/constantscomponents/DeleteModal";

const DeletedBookings = () => {
  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;

  const { data, isLoading, refetch } = useGetAllBookingsQuery(companyId);
  const [restoreOrDeleteBooking] = useRestoreOrDeleteBookingMutation();
  const [deletedBookings, setDeletedBookings] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteBooking] = useDeleteBookingMutation();
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

  const handleDeleteClick = (id) => {
    setSelectedDeleteId(id);
    setShowDeleteModal(true);
  };
  useEffect(() => {
    if (data?.bookings) {
      const deleted = data.bookings.filter(
        (b) =>
          b.status === "Deleted" &&
          b?.companyId?.toString() === companyId?.toString()
      );
      setDeletedBookings(deleted);
    }
  }, [data, companyId]);

  const tableHeaders = [
    { label: "Booking ID", key: "bookingId" },
    { label: "Passenger", key: "passenger" },
    { label: "Pick Up", key: "pickup" },
    { label: "Drop Off", key: "dropoff" },
    { label: "Date", key: "date" },
    { label: "Status", key: "status" },
    { label: "Actions", key: "actions" },
  ];

  const formatPassenger = (p) =>
    !p || typeof p !== "object"
      ? "-"
      : `${p.name || "N/A"} | ${p.email || "N/A"} | ${p.phone || "N/A"}`;

  const tableData = deletedBookings.map((b) => ({
    _id: b._id,
    bookingId: b.bookingId || "-",
    passenger: formatPassenger(b.passenger),
    pickup: b.primaryJourney?.pickup || "-",
    dropoff: b.primaryJourney?.dropoff || "-",
    date: b.createdAt ? new Date(b.createdAt).toLocaleString() : "-",
    status: b.status || "-",
    actions: (
      <>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                await restoreOrDeleteBooking({
                  id: b._id,
                  action: "restore",
                  updatedBy: `${user.role} | ${user.fullName}`,
                }).unwrap();
                toast.success("Booking restored successfully");
                refetch();
              } catch (error) {
                toast.error("Failed to restore booking");
              }
            }}
            className="btn btn-reset"
          >
            Restore
          </button>
          <button className="btn btn-cancel" onClick={() => handleDeleteClick(b._id)}>Delete</button>

        </div>
      </>
    ),
  }));

  return (
    <>
      <OutletHeading name="Deleted Bookings " />
      <CustomTable
        tableHeaders={tableHeaders}
        tableData={tableData}
        exportTableData={tableData}
        emptyMessage="No deleted bookings found"
        showSearch
        showRefresh
        showDownload
      />
      <DeleteModal
        isOpen={showDeleteModal}
        onConfirm={async () => {
          try {
            await deleteBooking(selectedDeleteId).unwrap();
            toast.success("Booking permanently deleted");
            setShowDeleteModal(false);
            setSelectedDeleteId(null);
            refetch();
          } catch {
            toast.error("Deletion failed");
          }
        }}
        onCancel={() => {
          setShowDeleteModal(false);
          setSelectedDeleteId(null);
        }}
      />
    </>
  );
};

export default DeletedBookings;
