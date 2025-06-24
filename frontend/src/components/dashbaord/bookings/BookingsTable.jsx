import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { GripHorizontal } from "lucide-react";
import SelectStatus from "./SelectStatus";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import DeleteModal from "../../../constants/constantscomponents/DeleteModal";
import {
  useGetAllBookingsQuery,
  useDeleteBookingMutation,
  useUpdateBookingStatusMutation,
} from "../../../redux/api/bookingApi";
import Icons from "../../../assets/icons";

const BookingsTable = ({
  assignedDrivers,
  selectedColumns,
  selectedActionRow,
  setSelectedActionRow,
  openAuditModal,
  openViewModal,
  openDriverModal,
  actionMenuItems,
  setEditBookingData,
  setShowEditModal,
  selectedStatus,
  selectedPassengers,
  selectedVehicleTypes,
  setShowViewModal,
  setShowAuditModal,
  setShowDriverModal,
  isAnyModalOpen ,
  selectedRow,
  setSelectedRow
}) => {

  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;

  const tableHeaders = [
    { label: "Booking Id", key: "bookingId" },
    { label: "Type", key: "bookingType" },
    { label: "Passenger", key: "passenger" },
    { label: "Date & Time", key: "date" },
    { label: "Pick Up", key: "pickUp" },
    { label: "Drop Off", key: "dropOff" },
    { label: "Vehicle", key: "vehicle" },
    { label: "Payment", key: "payment" },
    { label: "Fare", key: "fare" },
    { label: "DR Fare", key: "drFare" },
    { label: "Driver", key: "driver" },
    { label: "Status", key: "status" },
    { label: "Actions", key: "actions" },
  ];

  const { data, isLoading, error, refetch } = useGetAllBookingsQuery(companyId);
  const [deleteBooking] = useDeleteBookingMutation();
  const [updateBookingStatus] = useUpdateBookingStatusMutation();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

  const bookings = (data?.bookings || []).filter(
    (b) => b?.companyId?.toString() === companyId?.toString()
  );

  let filteredBookings = bookings.filter((b) => {
    const statusMatch =
      selectedStatus.includes("All") || selectedStatus.length === 0
        ? true
        : selectedStatus.includes(b.status);

    const passengerMatch =
      selectedPassengers.length === 0
        ? true
        : selectedPassengers.includes(b.passenger?.name);

    return statusMatch && passengerMatch;
  });

  filteredBookings.sort((a, b) => {
    let aMatch = 0;
    let bMatch = 0;
    if (selectedVehicleTypes.includes(a.vehicle?.vehicleName)) aMatch++;
    if (selectedVehicleTypes.includes(b.vehicle?.vehicleName)) bMatch++;
    return bMatch - aMatch;
  });
  useEffect(() => {
    async function handleKeyDown(event) {
      if (event.key === "Escape") {
        setShowAuditModal(false);
        setShowViewModal(false);
        setShowDriverModal(false);
        setShowEditModal(false);
        setShowDeleteModal(false);
        setSelectedActionRow(null);
      }

      if (isAnyModalOpen  || selectedRow == null) return;

      const selectedBooking = filteredBookings[selectedRow];
      if (!selectedBooking) return;

      const key = event.key.toLowerCase();

      if (event.shiftKey) {
        if (key === "c") {
          updateBookingStatus({
            id: selectedBooking._id,
            status: "Cancel",
            updatedBy: `${user.role} | ${user.fullName}`,
          })
            .unwrap()
            .then(() => {
              toast.success('Status updated to "Cancel"');
              refetch();
            })
            .catch(() => {
              toast.error("Failed to update status");
            });
          return;
        }

        if (key === "d") {
          setSelectedDeleteId(selectedBooking._id);
          setShowDeleteModal(true);
          return;
        }

        if (key === "e") {
          setEditBookingData(selectedBooking);
          setShowEditModal(true);
          return;
        }

        if (event.shiftKey && key === "r") {
          if (!selectedDeleteId) {
            toast.info("No recently deleted booking to restore");
            return;
          }

          try {
            await updateBookingStatus({
              id: selectedDeleteId,
              isDeleted: false,
              updatedBy: `${user.role} | ${user.fullName}`,
            }).unwrap();

            toast.success("Booking restored");
            refetch();
            setSelectedDeleteId(null);
          } catch (err) {
            toast.error("Failed to restore booking");
          }
        }
      }

      const statusMap = {
        a: "Accepted",
        o: "On Route",
        l: "At Location",
        r: "Ride Started",
        n: "No Show",
        c: "Completed",
      };
    
      if (key === "d") {
        openDriverModal(selectedBooking.driver);
      } else if (key === "enter") {
        openViewModal(selectedBooking);
      } else if (key in statusMap) {
        const newStatus = statusMap[key];
        updateBookingStatus({
          id: selectedBooking._id,
          status: newStatus,
          updatedBy: `${user.role} | ${user.fullName}`,
        })
          .unwrap()
          .then(() => {
            toast.success(`Status updated to "${newStatus}"`);
            refetch();
          })
          .catch(() => {
            toast.error("Failed to update status");
          });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    selectedRow,
    filteredBookings,
    user,
    updateBookingStatus,
    openDriverModal,
    openViewModal,
    refetch,
    isAnyModalOpen 
  ]);

  if (error || bookings.length === 0) {
    return (
      <CustomTable
        tableHeaders={tableHeaders.filter(
          (header) => selectedColumns[header.key]
        )}
        tableData={[]}
        exportTableData={[]}
        emptyMessage={error ? "Error loading bookings" : "No bookings found"}
        showSearch
        showRefresh
      />
    );
  }

  const formatVehicle = (v) =>
    !v || typeof v !== "object"
      ? "-"
      : `${v.vehicleName || "N/A"} | ${v.passenger || 0} | ${
          v.handLuggage || 0
        } | ${v.checkinLuggage || 0}`;

  const formatPassenger = (p) =>
    !p || typeof p !== "object"
      ? "-"
      : `${p.name || "N/A"} | ${p.email || 0} | ${p.phone || 0}`;

  const tableData = filteredBookings.map((item, index) => {
    const row = {};
    tableHeaders.forEach(({ key }) => {
      if (!selectedColumns[key]) return;

      switch (key) {
        case "bookingId":
          row[key] = item.bookingId || "";
          break;
        case "bookingType":
          row[key] = item?.returnJourney ? "Return" : "Primary";
          break;
        case "passenger":
          row[key] = formatPassenger(item.passenger);
          break;
        case "date":
          row[key] = item.createdAt
            ? new Date(item.createdAt).toLocaleString()
            : "-";
          break;
          case "pickUp":
            row[key] = (
              <div className="relative group w-full max-w-[250px] truncate whitespace-nowrap">
              {item.primaryJourney?.pickup || "-"}
              <div className="absolute top-full left-0 z-[999] hidden group-hover:flex w-max max-w-[300px] bg-white text-gray-800 text-xs border border-gray-300 rounded-md shadow-md p-2 mt-1">
              TEST: {item.primaryJourney?.pickup}
              </div>

            </div>
            );
            break;
         case "dropOff":
        row[key] = (
          <div className="relative group w-full max-w-[250px] truncate whitespace-nowrap">
          {item.primaryJourney?.dropoff || "-"}
          <div className="absolute top-full left-0 z-[999]  hidden group-hover:block w-max max-w-[300px] bg-white text-gray-800 text-xs border border-gray-300 rounded-md shadow-md p-2 mt-1">
            {item.primaryJourney?.dropoff}
          </div>
        </div>
        );
        break;
        case "vehicle":
          row[key] = item.vehicle?.vehicleName || "-";
          break;
        case "payment":
          row[key] = item.payment || "-";
          break;
        case "fare":
          row[key] = item.fare || "-";
          break;
        case "drFare":
          row[key] = item.drFare || "-";
          break;
          case "driver":
            const driversForThisRow = assignedDrivers?.[index];
            row[key] = driversForThisRow && driversForThisRow.length > 0 ? (
              <div
                onClick={() => {
                  setSelectedRow(index);            
                  openDriverModal(item.driver);        
                }}
                className="text-sm text-gray-700 space-y-0.5 cursor-pointer"
              >
                {driversForThisRow.map((driver, i) => (
                  <div key={i}>{driver.name}</div>
                ))}
              </div>
            ) : (
              <button
                className="cursor-pointer"
                onClick={() => {
                  setSelectedRow(index);             
                  openDriverModal(item.driver);       
                }}
              >
                <Icons.CircleUserRound />
              </button>
            );
            break;
          
        case "status":
          row[key] = (
            <SelectStatus
              value={item.status || "No Show"}
              onChange={async (newStatus) => {
                try {
                  await updateBookingStatus({
                    id: item._id,
                    isDeleted: true,

                    status: newStatus,
                    updatedBy: `${user.role} | ${user.fullName}`,
                  }).unwrap();
                  toast.success("Status updated");
                  refetch();
                } catch (err) {
                  console.error("Status update failed:", err);
                  toast.error("Failed to update status");
                }
              }}
            />
          );
          break;
        case "actions":
          row[key] = (
            <div className="text-center">
              <button
                onClick={() =>
                  setSelectedActionRow(
                    selectedActionRow === index ? null : index
                  )
                }
                className="p-2 rounded hover:bg-gray-100 transition"
              >
                <GripHorizontal size={18} className="text-gray-600" />
              </button>
              {selectedActionRow === index && (
                <div className="mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg animate-slide-in">
                  {actionMenuItems.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (action === "Status Audit")
                          openAuditModal(item.statusAudit);
                        else if (action === "View") openViewModal(item);
                        else if (action === "Edit") {
                          setEditBookingData(item);
                          setShowEditModal(true);
                        } else if (action === "Delete") {
                          setSelectedDeleteId(item._id);
                          setShowDeleteModal(true);
                        } else if (action === "Copy Booking") {
                          const copied = { ...item };
                          delete copied._id;
                          setEditBookingData(copied);
                          setShowEditModal(true);
                        }
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
          break;
        default:
          row[key] = item[key] || "-";
      }
    });
    return row;
  });

  const exportTableData = filteredBookings.map((item) => ({
    bookingId: item.bookingId,
    bookingType: item?.returnJourney ? "Return" : "Primary",
    passenger: formatPassenger(item.passenger),
    date: item.createdAt ? new Date(item.createdAt).toLocaleString() : "-",
    pickUp: item.primaryJourney?.pickup || "-",
    dropOff: item.primaryJourney?.dropoff || "-",
    vehicle: formatVehicle(item.vehicle),
    payment: item.payment || "-",
    fare: item.fare || "-",
    drFare: item.drFare || "-",
    driver: item.driver || "-",
    status: item.statusAudit?.at(-1)?.status || item.status || "-",
  }));

  if (!companyId) {
    return (
      <CustomTable
        tableHeaders={tableHeaders.filter(
          (header) => selectedColumns[header.key]
        )}
        tableData={[]}
        exportTableData={[]}
        emptyMessage="Invalid company ID"
        showSearch
        showRefresh
      />
    );
  }

  if (isLoading) {
    return (
      <CustomTable
        tableHeaders={tableHeaders.filter(
          (header) => selectedColumns[header.key]
        )}
        tableData={[]}
        exportTableData={[]}
        emptyMessage="Loading bookings..."
        showSearch
        showRefresh
      />
    );
  }
  return (
    <>
      <CustomTable
        tableHeaders={tableHeaders.filter(
          (header) => selectedColumns[header.key]
        )}
        tableData={tableData}
        exportTableData={exportTableData}
        showSearch
        showRefresh
        showDownload
        showPagination
        showSorting
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
      />
      <DeleteModal
        isOpen={showDeleteModal}
        onConfirm={async () => {
          try {
            await deleteBooking(selectedDeleteId).unwrap();
            toast.success("Booking deleted");
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

export default BookingsTable;
