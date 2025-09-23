// import React, { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import { toast } from "react-toastify";
// import CustomTable from "../../../constants/constantscomponents/CustomTable";
// import { useDeleteBookingMutation, useGetAllBookingsQuery, useRestoreOrDeleteBookingMutation } from "../../../redux/api/bookingApi";
// import DeleteModal from "../../../constants/constantscomponents/DeleteModal";
// import CustomModal from "../../../constants/constantscomponents/CustomModal";
// import { useLoading } from "../../common/LoadingProvider";
// import JourneyDetailsModal from "./JourneyDetailsModal";
// import OutletBtnHeading from "../../../constants/constantscomponents/OutletBtnHeading";
// import Icons from "../../../assets/icons";

// const DeletedBookings = () => {
//   const user = useSelector((state) => state.auth.user);
//   const companyId = user?.companyId;
//   const { showLoading, hideLoading } = useLoading();

//   const { data, isLoading, refetch } = useGetAllBookingsQuery(companyId);
//   const [restoreOrDeleteBooking] = useRestoreOrDeleteBookingMutation();
//   const [deletedBookings, setDeletedBookings] = useState([]);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [deleteBooking] = useDeleteBookingMutation();
//   const [selectedDeleteId, setSelectedDeleteId] = useState(null);
//   const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
//   const [isBulkDeleting, setIsBulkDeleting] = useState(false);

//   // Add these states for modal functionality
//   const [showViewModal, setShowViewModal] = useState(false);
//   const [viewData, setViewData] = useState([]);

//   useEffect(() => {
//     if (isLoading) {
//       showLoading();
//     } else {
//       hideLoading();
//     }
//   }, [isLoading, showLoading, hideLoading]);

//   const handleDeleteClick = (id) => {
//     setSelectedDeleteId(id);
//     setShowDeleteModal(true);
//   };

//   // Add this function for opening view modal
//   const openViewModal = (view) => {
//     setViewData(view || []);
//     setShowViewModal(true);
//   };

//   useEffect(() => {
//     if (data?.bookings) {
//       const deleted = data.bookings.filter(
//         (b) =>
//           b.status === "Deleted" &&
//           b?.companyId?.toString() === companyId?.toString()
//       );
//       setDeletedBookings(deleted);
//     }
//   }, [data, companyId]);

//   const tableHeaders = [
//     { label: "Booking ID", key: "bookingId" },
//     { label: "Passenger", key: "passenger" },
//     { label: "Pick Up", key: "pickup" },
//     { label: "Drop Off", key: "dropoff" },
//     { label: "Date", key: "date" },
//     { label: "Status", key: "status" },
//     { label: "Actions", key: "actions" },
//   ];

//   const formatPassenger = (p) =>
//     !p || typeof p !== "object"
//       ? "-"
//       : `${p.name || "N/A"}`;

//   const tableData = deletedBookings.map((b) => ({
//     _id: b._id,
//     bookingId: b.bookingId || "-",
//     passenger: formatPassenger(b.passenger),
//     pickup:
//       b.returnJourneyToggle && b.returnJourney
//         ? b.returnJourney.pickup || "-"
//         : b.primaryJourney?.pickup || "-",

//     dropoff:
//       b.returnJourneyToggle && b.returnJourney
//         ? b.returnJourney.dropoff || "-"
//         : b.primaryJourney?.dropoff || "-",

//     date: b.createdAt ? new Date(b.createdAt).toLocaleString() : "-",
//     status: b.status || "-",
//     actions: (
//       <>
//         <div className="flex gap-2">
//           {/* Restore Button */}
//           <button
//             onClick={async () => {
//               try {
//                 await restoreOrDeleteBooking({
//                   id: b._id,
//                   action: "restore",
//                   updatedBy: `${user.role} | ${user.fullName}`,
//                 }).unwrap();
//                 toast.success("Booking restored successfully");
//                 refetch();
//               } catch (error) {
//                 toast.error("Failed to restore booking");
//               }
//             }}
//             className="btn btn-reset"
//             title="Restore Booking"
//           >
//             <Icons.RotateCcw size={16} />
//           </button>

//           {/* Delete Button */}
//           <button
//             className="btn btn-cancel"
//             title="Delete Booking"
//             onClick={() => handleDeleteClick(b._id)}
//           >
//             <Icons.Trash2 size={16} />
//           </button>

//           {/* View Button */}
//           <button
//             className="btn btn-edit !text-white"
//             title="View Booking Details"
//             onClick={() => openViewModal(b)}
//           >
//             <Icons.Eye size={16} />
//           </button>
//         </div>
//       </>
//     ),
//   }));

//   return (
//     <>
//       <OutletBtnHeading
//         name="Deleted Bookings"
//         buttonLabel="Delete All Permanently"
//         buttonBg="btn btn-cancel"
//         onButtonClick={() => setShowBulkDeleteModal(true)}
//         disabled={!deletedBookings.length}
//       />
//       <CustomTable
//         tableHeaders={tableHeaders}
//         tableData={tableData}
//         exportTableData={tableData}
//         emptyMessage="No deleted bookings found..."
//         showSearch
//         showRefresh
//         showDownload
//         // Add onRowDoubleClick functionality
//         onRowDoubleClick={(row) => {
//           const selectedBooking = deletedBookings.find(
//             (b) => b._id === row._id
//           );
//           if (selectedBooking) {
//             openViewModal(selectedBooking);
//           }
//         }}
//       />
//       <DeleteModal
//         isOpen={showDeleteModal}
//         onConfirm={async () => {
//           try {
//             await deleteBooking(selectedDeleteId).unwrap();
//             toast.success("Booking permanently deleted");
//             setShowDeleteModal(false);
//             setSelectedDeleteId(null);
//             refetch();
//           } catch {
//             toast.error("Deletion failed");
//           }
//         }}
//         onCancel={() => {
//           setShowDeleteModal(false);
//           setSelectedDeleteId(null);
//         }}
//       />
//       <DeleteModal
//         isOpen={showBulkDeleteModal}
//         onConfirm={async () => {
//           try {
//             setIsBulkDeleting(true);
//             const ids = (deletedBookings || []).map((b) => b._id);
//             await Promise.all(ids.map((id) => deleteBooking(id).unwrap()));
//             toast.success("All deleted bookings permanently removed");
//             setShowBulkDeleteModal(false);
//             refetch();
//           } catch (e) {
//             toast.error("Bulk deletion failed");
//           } finally {
//             setIsBulkDeleting(false);
//           }
//         }}
//         onCancel={() => {
//           setShowBulkDeleteModal(false);
//         }}
//       />

//       {/* Add CustomModal for viewing journey details */}
//       <CustomModal
//         isOpen={showViewModal}
//         onClose={() => setShowViewModal(false)}
//         heading="Deleted Booking Details"
//       >
//         <JourneyDetailsModal viewData={viewData} />
//       </CustomModal>
//     </>
//   );
// };

// export default DeletedBookings;