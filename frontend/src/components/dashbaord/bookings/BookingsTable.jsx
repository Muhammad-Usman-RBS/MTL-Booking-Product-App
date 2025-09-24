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
  useSendBookingEmailMutation,
  useUpdateBookingStatusMutation,
} from "../../../redux/api/bookingApi";
import {
  useGetAllJobsQuery,
  useUpdateJobStatusMutation,
} from "../../../redux/api/jobsApi";
import Icons from "../../../assets/icons";
import { useGetAllDriversQuery } from "../../../redux/api/driverApi";
import moment from "moment-timezone";
import { useGetBookingSettingQuery } from "../../../redux/api/bookingSettingsApi";
import { useBookingTableLogic } from "./bookingTable/useBookingTableLogic";
import { BookingTableRenderer } from "./bookingTable/BookingTableRenderer";

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
  isAnyModalOpen,
  selectedRow,
  setSelectedRow,
  selectedDrivers,
  startDate,
  endDate,
}) => {
  const user = useSelector((state) => state.auth.user);
  const timezone = useSelector((state) => state.timezone?.timezone) || "UTC";
  const companyId = user?.companyId;
  const [tooltip, setTooltip] = useState({ show: false, text: "", x: 0, y: 0 });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

  // API hooks
  const [updateJobStatus] = useUpdateJobStatusMutation();
  const [sendBookingEmail] = useSendBookingEmailMutation();
  const [deleteBooking] = useDeleteBookingMutation();
  const [updateBookingStatus] = useUpdateBookingStatusMutation();

  const { data: bookingSettingData } = useGetBookingSettingQuery(companyId, {
    skip: user?.role !== "customer",
  });

  const {
    data: bookingData = {},
    isLoading: isBookingsLoading,
    error: bookingsError,
    refetch: refetchBookings,
  } = useGetAllBookingsQuery(companyId, {
    skip: !companyId || user?.role === "driver",
  });

  const {
    data: jobData = {},
    isLoading: isJobsLoading,
    refetch: refetchJobs,
  } = useGetAllJobsQuery(companyId, { skip: !companyId });

  const { data: driversData = {} } = useGetAllDriversQuery(companyId, {
    skip: !companyId,
  });

  // Custom hook for business logic
  const {
    filteredBookings,
    filteredTableHeaders,
    exportTableData,
    emptyTableRows,
    isDriver,
    refetch,
    getErrMsg,
    allHeaders,
    tableHeaders,
  } = useBookingTableLogic({
    user,
    companyId,
    bookingData,
    jobData,
    driversData,
    assignedDrivers,
    selectedStatus,
    selectedPassengers,
    selectedDrivers,
    selectedVehicleTypes,
    selectedColumns,
    startDate,
    endDate,
    timezone,
    bookingSettingData,
    refetchBookings,
    refetchJobs,
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

      const updateStatus = async (id, status) => {
        if (isDriver) {
          await updateJobStatus({ jobId: id, jobStatus: status }).unwrap();
        } else {
          await updateBookingStatus({
            id,
            status,
            updatedBy: `${user.role} | ${user.fullName}`,
          }).unwrap();
        }
      };

      if (isAnyModalOpen || selectedRow == null) return;
      const selectedBooking = filteredBookings.find(
        (b) => b._id === selectedRow
      );
      if (!selectedBooking) return;

      const key = event.key.toLowerCase();

      if (event.shiftKey) {
        if (key === "a") {
          const wasAlreadyAccepted = (selectedBooking.statusAudit || []).some(
            (audit) => String(audit.status || "").toLowerCase() === "accepted"
          );

          if (wasAlreadyAccepted) {
            toast.error("This booking has already been accepted previously.");
            return;
          }

          const getIdStr = (v) =>
            v?._id?.toString?.() ||
            v?.$oid ||
            v?.toString?.() ||
            String(v || "");

          const driversArr = Array.isArray(selectedBooking.drivers)
            ? selectedBooking.drivers
            : [];

          if (driversArr.length !== 1) {
            toast.error(
              "Select a single driver before marking booking as Accepted."
            );
            return;
          }

          const singleDriver = driversArr[0];
          const singleDriverId = getIdStr(
            typeof singleDriver === "object" ? singleDriver._id : singleDriver
          );

          const jobsArray = jobData?.jobs || [];
          const jobForDriver = jobsArray.find(
            (j) =>
              getIdStr(j?.bookingId) === getIdStr(selectedBooking?._id) &&
              getIdStr(j?.driverId) === singleDriverId
          );

          if (!jobForDriver?._id) {
            toast.error(
              "No job found for the selected driver. Create/assign the job first."
            );
            return;
          }

          try {
            await updateJobStatus({
              jobId: jobForDriver._id,
              jobStatus: "Accepted",
            }).unwrap();

            const siblingJobs = jobsArray.filter(
              (j) =>
                getIdStr(j?.bookingId) === getIdStr(selectedBooking?._id) &&
                getIdStr(j?._id) !== getIdStr(jobForDriver._id)
            );
            await Promise.all(
              siblingJobs.map((j) =>
                updateJobStatus({
                  jobId: j._id,
                  jobStatus: "Already Assigned",
                })
              )
            );

            await updateBookingStatus({
              id: selectedBooking._id,
              status: "Accepted",
              updatedBy: `${user.role} | ${user.fullName}`,
            }).unwrap();

            toast.success("Status updated to Accepted");
            refetch();
          } catch (err) {
            toast.error(getErrMsg(err));
            console.error(err);
            refetch();
          }
          return;
        }
        if (key === "c") {
          try {
            await updateBookingStatus({
              id: selectedBooking._id,
              status: "Cancelled",
              updatedBy: `${user.role} | ${user.fullName}`,
            }).unwrap();

            toast.success("Booking status set to Cancelled");

            // 📧 Send email to passenger
            if (selectedBooking?.passenger?.email) {
              try {
                await sendBookingEmail({
                  bookingId: selectedBooking._id,
                  email: selectedBooking.passenger.email,
                  type: "cancellation",
                }).unwrap();
                toast.success("Cancellation email sent to customer");
              } catch (err) {
                toast.error("Failed to send cancellation email to customer");
                console.error("❌ Email error:", err);
              }
            } else {
              toast.info(
                "No passenger email found to send cancellation notice"
              );
            }

            // 📧 Send email to all assigned drivers
            if (
              Array.isArray(selectedBooking?.drivers) &&
              selectedBooking.drivers.length > 0
            ) {
              for (const drv of selectedBooking.drivers) {
                const driverEmail =
                  drv?.email ||
                  drv?.DriverData?.email ||
                  drv?.driverInfo?.email;
                if (driverEmail) {
                  try {
                    await sendBookingEmail({
                      bookingId: selectedBooking._id,
                      email: driverEmail,
                      type: "cancellation-driver",
                    }).unwrap();
                    toast.success(
                      `Cancellation email sent to driver: ${driverEmail}`
                    );
                  } catch (err) {
                    console.error("❌ Driver email error:", err);
                    toast.error("Failed to send cancellation email to driver");
                  }
                }
              }
            }

            refetch();
          } catch (err) {
            toast.error(getErrMsg(err));
            console.error("❌ Cancel booking error:", err);
          }
          return;
        }

        if (key === "r") {
          const newStatus = "Ride Started";
          updateStatus(selectedBooking._id, newStatus);
          toast.success(`Status updated to "${newStatus}"`);
          refetch();
          return;
        }

        if (key === "o") {
          const newStatus = "On Route";
          await updateStatus(selectedBooking._id, newStatus);
          toast.success(`Status updated to "${newStatus}"`);
          refetch();
          return;
        }
        if (key === "n") {
          const newStatus = "No Show";
          await updateStatus(selectedBooking._id, newStatus);
          toast.success(`Status updated to "${newStatus}"`);
          refetch();
          return;
        }

        if (key === "l") {
          const newStatus = "At Location";
          await updateStatus(selectedBooking._id, newStatus);
          toast.success(`Status updated to "${newStatus}"`);
          refetch();
          return;
        }

        if (key === "d") {
          if (user?.role === "driver") {
            toast.info("Drivers are not allowed to delete bookings");
            return;
          }
          if (user?.role === "customer") {
            toast.info("Customers are not allowed to delete bookings");
            return;
          }

          try {
            await updateBookingStatus({
              id: selectedBooking._id,
              status: "Deleted",
              updatedBy: `${user.role} | ${user.fullName}`,
            }).unwrap();
            toast.success("Booking marked as Deleted");
            refetch();
          } catch (err) {
            toast.error(getErrMsg(err));
            console.error(err);
          }
          return;
        }

        if (key === "e") {
          if (user?.role === "driver") {
            toast.info("Drivers are not allowed to edit bookings");
            return;
          }

          const bookingSetting =
            bookingSettingData?.setting || bookingSettingData?.bookingSetting;

          if (
            user?.role === "customer" &&
            bookingSetting?.companyId === user?.companyId
          ) {
            const cancelWindow = bookingSetting?.cancelBookingWindow;
            if (
              cancelWindow &&
              isWithinCancelWindow(selectedBooking, cancelWindow)
            ) {
              const windowText = `${
                cancelWindow.value
              } ${cancelWindow.unit.toLowerCase()}`;
              toast.error(
                `Cannot edit booking. Pickup time is within the ${windowText} cancellation window.`
              );
              return;
            }
          }

          const editedData = { ...selectedBooking };
          editedData.__editReturn = !!selectedBooking.returnJourney;
          setEditBookingData(editedData);
          setShowEditModal(true);
          return;
        }
      }

      if (key === "enter") {
        openViewModal(selectedBooking);
      }
      if (event.ctrlKey && key === "c") {
        const newStatus = "Completed";
        await updateStatus(selectedBooking._id, newStatus);
        toast.success(`Status updated to "${newStatus}"`);
        refetch();
        return;
      }
      if (event.ctrlKey && key === "d") {
        if (selectedBooking?.status === "Deleted") {
          toast.error("Booking already deleted – Driver assignment disabled");
          return;
        }

        if (user?.role === "customer") {
          toast.warn("Customer cannot access drivers list");
          return;
        }

        if (String(selectedBooking.status).toLowerCase() === "cancelled") {
          toast.error(
            "This booking has been cancelled. Driver selection is disabled."
          );
          return;
        }

        openDriverModal(selectedBooking.driver);
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
    isAnyModalOpen,
    assignedDrivers,
    selectedDeleteId,
  ]);

  // Window focus effect
  useEffect(() => {
    function handleFocus() {
      if (isDriver) {
        refetchJobs();
      } else {
        refetchBookings();
        refetchJobs();
      }
    }

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [refetchBookings, refetchJobs, isDriver]);

  // Document click effect
  useEffect(() => {
    function handleDocClick(e) {
      if (selectedActionRow == null) return;

      const clickedTrigger = e.target.closest(".js-actions-trigger");
      const clickedMenu = e.target.closest(".js-actions-menu");
      if (!clickedTrigger && !clickedMenu) {
        setSelectedActionRow(null);
      }
    }

    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, [selectedActionRow, setSelectedActionRow]);

  // Loading states
  if (!companyId) {
    return (
      <CustomTable
        tableHeaders={tableHeaders.filter(
          (header) => selectedColumns[header.key]
        )}
        tableData={[]}
        exportTableData={[]}
        emptyMessage={emptyMessage}
        showSearch
        showRefresh
      />
    );
  }

  if (isDriver ? isJobsLoading : isBookingsLoading) {
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
      <BookingTableRenderer
        filteredTableHeaders={filteredTableHeaders}
        filteredBookings={filteredBookings}
        emptyTableRows={emptyTableRows}
        exportTableData={exportTableData}
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
        openViewModal={openViewModal}
        user={user}
        updateBookingStatus={updateBookingStatus}
        updateJobStatus={updateJobStatus}
        sendBookingEmail={sendBookingEmail}
        refetch={refetch}
        getErrMsg={getErrMsg}
        selectedActionRow={selectedActionRow}
        setSelectedActionRow={setSelectedActionRow}
        openAuditModal={openAuditModal}
        openDriverModal={openDriverModal}
        setEditBookingData={setEditBookingData}
        setShowEditModal={setShowEditModal}
        actionMenuItems={actionMenuItems}
        setSelectedDeleteId={setSelectedDeleteId}
        setShowDeleteModal={setShowDeleteModal}
        showDeleteModal={showDeleteModal}
        selectedDeleteId={selectedDeleteId}
        toast={toast}
        tooltip={tooltip}
        setTooltip={setTooltip}
        driversData={driversData}
        jobData={jobData}
        assignedDrivers={assignedDrivers}
        bookingSettingData={bookingSettingData}
        isDriver={isDriver}
        Icons={Icons}
        SelectStatus={SelectStatus}
        GripHorizontal={GripHorizontal}
        moment={moment}
        timezone={timezone}
        emptyMessage="No bookings found..."
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onConfirm={async () => {
          try {
            await updateBookingStatus({
              id: selectedDeleteId,
              status: "Deleted",
              updatedBy: `${user.role} | ${user.fullName}`,
            }).unwrap();
            toast.success("Booking marked as Deleted");
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

      {tooltip.show && (
        <div
          className="fixed z-[9999] w-[250px] max-w-sm px-3 py-4 text-[13px] text-[var(--dark-gray)] leading-relaxed bg-white border border-gray-300 rounded-md transition-all duration-300 ease-in-out"
          style={{
            top: tooltip.y,
            left: tooltip.x,
            transform: "translate(-50%, -100%)",
          }}
        >
          {tooltip.text}
        </div>
      )}
    </>
  );
};

export default BookingsTable;
