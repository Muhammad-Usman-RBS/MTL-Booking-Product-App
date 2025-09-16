import React from "react";
import CustomTable from "../../../../constants/constantscomponents/CustomTable";

export const BookingTableRenderer = ({
  filteredTableHeaders,
  filteredBookings,
  emptyTableRows,
  exportTableData,
  selectedRow,
  setSelectedRow,
  openViewModal,
  user,
  updateBookingStatus,
  updateJobStatus,
  sendBookingEmail,
  refetch,
  getErrMsg,
  selectedActionRow,
  setSelectedActionRow,
  openAuditModal,
  openDriverModal,
  setEditBookingData,
  setShowEditModal,
  actionMenuItems,
  isDeletedTab,
  setSelectedDeleteId,
  setShowDeleteModal,
  toast,
  tooltip,
  setTooltip,
  driversData,
  jobData,
  assignedDrivers,
  bookingSettingData,
  isDriver,
  Icons,
  SelectStatus,
  GripHorizontal,
  moment,
  timezone,
}) => {
  const getIdStr = (v) =>
    v?._id?.toString?.() || v?.$oid || v?.toString?.() || String(v || "");

  const isWithinCancelWindow = (booking, cancelWindow) => {
    if (!booking || !cancelWindow) return false;

    const journey = booking.returnJourneyToggle ? booking.returnJourney : booking.primaryJourney;
    if (!journey?.date || journey.hour === undefined || journey.minute === undefined) {
      return false;
    }

    const pickupDate = new Date(journey.date);
    pickupDate.setHours(journey.hour);
    pickupDate.setMinutes(journey.minute);
    pickupDate.setSeconds(0);
    pickupDate.setMilliseconds(0);

    const now = new Date();
    const timeDiffMs = pickupDate.getTime() - now.getTime();

    let windowMs = cancelWindow.value;
    switch (cancelWindow.unit) {
      case "Minutes":
        windowMs *= 60 * 1000;
        break;
      case "Hours":
        windowMs *= 60 * 60 * 1000;
        break;
      case "Days":
        windowMs *= 24 * 60 * 60 * 1000;
        break;
      case "Weeks":
        windowMs *= 7 * 24 * 60 * 60 * 1000;
        break;
      case "Months":
        windowMs *= 30 * 24 * 60 * 60 * 1000;
        break;
      case "Years":
        windowMs *= 365 * 24 * 60 * 60 * 1000;
        break;
      default:
        windowMs *= 60 * 60 * 1000;
    }

    return timeDiffMs < windowMs;
  };

  const isCancelledByRole = (item, roles = []) => {
    if (String(item?.status).toLowerCase() !== "cancelled") return false;
    if (!Array.isArray(item?.statusAudit)) return false;

    const entry = item.statusAudit
      .slice()
      .reverse()
      .find((a) => String(a?.status || "").trim().toLowerCase() === "cancelled");

    if (!entry) return false;

    const byRaw = String(entry.updatedBy || "").toLowerCase();
    return roles.some((role) => byRaw.includes(role.toLowerCase()));
  };

  const formatVehicle = (v) =>
    !v || typeof v !== "object"
      ? "-"
      : `${v.vehicleName || "N/A"} | ${v.passenger || 0} | ${v.handLuggage || 0
      } | ${v.checkinLuggage || 0}`;

  const formatPassenger = (p) =>
    !p || typeof p !== "object"
      ? "-"
      : `${p.name || "N/A"} | ${p.email || 0} | +${p.phone || 0}`;

  const formatDriver = (item) => {
    const allDrivers = driversData?.drivers || [];
    const jobsArray = jobData?.jobs || [];

    const resolveDriverNameByRef = (drv) => {
      const idStr = getIdStr(drv);

      const d =
        allDrivers.find((x) => getIdStr(x?._id) === idStr) ||
        allDrivers.find((x) => getIdStr(x?.userId) === idStr);

      const first = d?.DriverData?.firstName || "";
      const last = d?.DriverData?.surName || "";

      const display = [first, last].filter(Boolean).join(" ").trim();
      return display || "Unknown Driver";
    };

    const acceptedJob = (jobsArray || []).find(
      (j) =>
        getIdStr(j?.bookingId) === getIdStr(item?._id) &&
        String(j?.jobStatus).toLowerCase() === "accepted"
    );

    if (acceptedJob) {
      const fullNameFromJob = acceptedJob?.driverId?.fullName;
      const name = fullNameFromJob;
      return <div className="text-sm text-gray-700">{name}</div>;
    }

    if (
      String(item?.status).toLowerCase() === "accepted" &&
      Array.isArray(item?.drivers) &&
      item.drivers.length === 1
    ) {
      const single = item.drivers[0];
      const name =
        single?.name || resolveDriverNameByRef(single) || "Unknown Driver";
      return <div className="text-sm text-gray-700">{name}</div>;
    }

    if (String(item.jobStatus).toLowerCase() === "rejected") {
      let driverName;

      const rejectedAudit = (item.statusAudit || [])
        .slice()
        .reverse()
        .find(
          (e) =>
            String(e.status).toLowerCase() === "rejected" &&
            String(e.updatedBy || "")
              .toLowerCase()
              .startsWith("driver")
        );

      const nameFromAudit = rejectedAudit?.updatedBy?.split(" | ")[1]?.trim();
      if (nameFromAudit) driverName = nameFromAudit;

      if (!driverName) {
        const rejectedJob = jobsArray
          .filter(
            (j) =>
              j.bookingId?.toString() === item._id?.toString() &&
              String(j.jobStatus).toLowerCase() === "rejected"
          )
          .sort(
            (a, b) =>
              new Date(b.updatedAt || b.createdAt) -
              new Date(a.updatedAt || a.createdAt)
          )[0];

        if (rejectedJob) {
          driverName = resolveDriverNameByRef(rejectedJob.driverId);
        }
      }

      return (
        <div className="text-red-500 italic">
          <div className="font-medium">
            {driverName || "Unknown Driver"} - Rejected
          </div>
          <div className="text-xs hover:underline text-gray-500 mt-1">
            Click here to Select Driver
          </div>
        </div>
      );
    }

    if (
      item.jobStatus === "New" &&
      Array.isArray(item.drivers) &&
      item.drivers.length > 0
    ) {
      const driverNames = item.drivers
        .map((d) => d.name || "Unnamed Driver")
        .join(", ");
      return (
        <div className="text-orange-600 italic">
          <div className="font-medium">Booking sent to: {driverNames}</div>
          <div className="text-xs text-gray-500 mt-1">
            (Awaiting acceptance)
          </div>
        </div>
      );
    }

    const drivers = item.drivers || [];
    if (drivers.length === 0) {
      return (
        <span className="text-[var(--dark-grey)]">
          <Icons.CircleUserRound />
        </span>
      );
    }

    const acceptedDrivers = drivers
      .map((driver, index) => {
        const driverId = typeof driver === "object" ? driver._id : driver;
        const driverName = driver.name || "Unnamed Driver";

        const driverJobs = jobsArray.filter(
          (job) =>
            (job.driverId?.toString() === driverId?.toString() ||
              job.driverId?._id?.toString() === driverId?.toString()) &&
            job.bookingId?.toString() === item._id?.toString()
        );

        const hasAcceptedJob = driverJobs.some(
          (job) => job.jobStatus === "Accepted"
        );

        if (hasAcceptedJob) {
          return (
            <div key={index} className="text-sm text-gray-700">
              {driverName}
            </div>
          );
        }
        return null;
      })
      .filter(Boolean);

    if (acceptedDrivers.length === 0) {
      return (
        <span className="text-[var(--dark-grey)]">
          <Icons.CircleUserRound />
        </span>
      );
    }

    return acceptedDrivers;
  };

  // Generate table data
  let tableData = [];
  if (!filteredBookings || filteredBookings.length === 0) {
    tableData = emptyTableRows;
  } else {
    tableData = filteredBookings.map((item, index) => {
      const row = { _id: item._id };

      filteredTableHeaders.forEach(({ key }) => {
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
          case "date": {
            const journey = item.returnJourney
              ? item.returnJourney
              : item.primaryJourney;
            const rawDate = journey?.date;
            const hour = journey?.hour;
            const minute = journey?.minute;

            if (!rawDate || hour === undefined || minute === undefined) {
              row[key] = "-";
              break;
            }
            const combinedDate = new Date(rawDate);
            combinedDate.setHours(hour);
            combinedDate.setMinutes(minute);
            combinedDate.setSeconds(0);
            combinedDate.setMilliseconds(0);
            const formatted = combinedDate.toLocaleString("en-GB", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            });

            row[key] = formatted;
            break;
          }
          case "pickUp":
            const pickupLocation = item.returnJourney
              ? item.returnJourney?.pickup || "-"
              : item.primaryJourney?.pickup || "-";

            row[key] = (
              <div
                className="w-full max-w-[250px] truncate whitespace-nowrap cursor-default"
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltip({
                    show: true,
                    text: pickupLocation,
                    x: rect.left + rect.width / 2,
                    y: rect.top - 10,
                  });
                }}
                onMouseLeave={() =>
                  setTooltip({ show: false, text: "", x: 0, y: 0 })
                }
              >
                {pickupLocation}
              </div>
            );
            break;
          case "dropOff":
            const dropoffLocation = item.returnJourney
              ? item.returnJourney?.dropoff || "-"
              : item.primaryJourney?.dropoff || "-";

            row[key] = (
              <div
                className="w-full max-w-[250px] truncate whitespace-nowrap cursor-default"
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltip({
                    show: true,
                    text: dropoffLocation,
                    x: rect.left + rect.width / 2,
                    y: rect.top - 10,
                  });
                }}
                onMouseLeave={() =>
                  setTooltip({ show: false, text: "", x: 0, y: 0 })
                }
              >
                {dropoffLocation}
              </div>
            );
            break;
          case "vehicle":
            row[key] = item.vehicle?.vehicleName || "-";
            break;
          case "payment":
            row[key] = item.paymentMethod || "-";
            break;
          case "journeyFare":
            row[key] = item.journeyFare !== undefined ? item.journeyFare : "-";
            break;
          case "driverFare":
            row[key] = item.driverFare !== undefined ? item.driverFare : "-";
            break;
          case "returnJourneyFare":
            row[key] =
              item.returnJourneyFare !== undefined
                ? item.returnJourneyFare
                : "-";
            break;
          case "returnDriverFare":
            row[key] =
              item.returnDriverFare !== undefined ? item.returnDriverFare : "-";
            break;
            
     case "flightNumber": {
  const journey = item.returnJourneyToggle ? item.returnJourney : item.primaryJourney;
  row[key] = journey?.flightNumber || "-";
  break;
}

case "originAirport": {
  const journey = item.returnJourneyToggle ? item.returnJourney : item.primaryJourney;
  row[key] = journey?.originAirport || "-";
  break;
}

case "destinationAirport": {
  const journey = item.returnJourneyToggle ? item.returnJourney : item.primaryJourney;
  row[key] = journey?.destinationAirport || "-";
  break;
}

case "flightArrivalScheduled": {
  const journey = item.returnJourneyToggle ? item.returnJourney : item.primaryJourney;
  row[key] = journey?.flightArrival?.scheduled
    ? new Date(journey.flightArrival.scheduled).toLocaleString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "-";
  break;
}

case "flightArrivalEstimated": {
  const journey = item.returnJourneyToggle ? item.returnJourney : item.primaryJourney;
  row[key] = journey?.flightArrival?.estimated
    ? new Date(journey.flightArrival.estimated).toLocaleString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "-";
  break;
}

case "flightArrivalActual": {
  const journey = item.returnJourneyToggle ? item.returnJourney : item.primaryJourney;
  row[key] = journey?.flightArrival?.actual
    ? new Date(journey.flightArrival.actual).toLocaleString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "-";
  break;
}

          case "createdAt":
            row[key] = item.createdAt
              ? moment(item.createdAt)
                .tz(timezone)
                .format("DD/MM/YYYY HH:mm:ss")
              : "-";
            break;
          case "driver":
            const disabledByClientOrCustomer = isCancelledByRole(item, ["clientadmin", "customer"]);
            const content = formatDriver(item);

            if (disabledByClientOrCustomer) {
              row[key] = (
                <div
                  className="text-gray-400 opacity-60 cursor-not-allowed select-none"
                  title="Driver selection disabled — booking cancelled by Clientadmin/Customer"
                  aria-disabled="true"
                >
                  {content}
                </div>
              );
              break;
            }

            row[key] =
              user?.role === "customer" ? (
                formatDriver(item)
              ) : (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    if (selectedRow !== item._id) {
                      setSelectedRow(item._id);
                    }
                    openDriverModal(item);
                  }}
                >
                  {formatDriver(item)}
                </div>
              );
            break;
          case "status": {
            const latestCancelledBy = (() => {
              if (
                item.status !== "Cancelled" ||
                !Array.isArray(item.statusAudit)
              )
                return null;

              const entry = item.statusAudit
                .slice()
                .reverse()
                .find(
                  (a) => (a.status || "").trim().toLowerCase() === "cancelled"
                );

              if (!entry) return null;

              const byRaw = (entry.updatedBy || "unknown").toLowerCase();
              const name = entry.updatedBy?.split(" | ")[1] || "";

              if (byRaw.includes("clientadmin"))
                return { role: "Clientadmin", name };
              if (byRaw.includes("customer")) return { role: "Customer", name };
              return null;
            })();

            if (latestCancelledBy) {
              row[key] = (
                <span className="text-red-500 text-xs italic">
                  {`Booking Cancelled by ${latestCancelledBy.role}: ${latestCancelledBy.name}`}
                </span>
              );
              break;
            }

            if (user?.role === "customer") {
              const displayStatus = item?.status || "No Show";
              row[key] = <span className="text-gray-700">{displayStatus}</span>;
              break;
            }

            row[key] = (
              <SelectStatus
                value={
                  isDriver ? item.jobStatus || "New" : item.status || "No Show"
                }
                onChange={async (newStatus) => {
                  try {
                    if (isDriver) {
                      const response = await updateJobStatus({
                        jobId: item.jobId,
                        jobStatus: newStatus,
                      }).unwrap();

                      if (
                        !response.success &&
                        response.message?.includes("already been accepted")
                      ) {
                        toast.warning(
                          "This booking was just accepted by another driver!"
                        );
                        refetch();
                        return;
                      }
                      toast.success("Status updated");
                      refetch();
                      return;
                    }

                    if (String(newStatus).toLowerCase() === "accepted") {
                      if (
                        !["new", "pending"].includes(
                          String(item?.status).toLowerCase()
                        )
                      ) {
                        toast.error("You can only mark 'Accepted' from 'New'.");
                        return;
                      }

                      const driversArr = Array.isArray(item.drivers)
                        ? item.drivers
                        : [];
                      if (driversArr.length !== 1) {
                        toast.error(
                          "Select a single driver before marking booking as Accepted."
                        );
                        return;
                      }

                      const singleDriver = driversArr[0];
                      const singleDriverId = getIdStr(
                        typeof singleDriver === "object"
                          ? singleDriver._id
                          : singleDriver
                      );

                      const jobsArray = jobData?.jobs || [];
                      const jobForDriver = jobsArray.find(
                        (j) =>
                          getIdStr(j?.bookingId) === getIdStr(item?._id) &&
                          getIdStr(j?.driverId) === singleDriverId
                      );

                      if (!jobForDriver?._id) {
                        toast.error(
                          "No job found for the selected driver. Create/assign the job first."
                        );
                        return;
                      }

                      await updateJobStatus({
                        jobId: jobForDriver._id,
                        jobStatus: "Accepted",
                      }).unwrap();

                      const siblingJobs = jobsArray.filter(
                        (j) =>
                          getIdStr(j?.bookingId) === getIdStr(item?._id) &&
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
                    }

                    await updateBookingStatus({
                      id: item._id,
                      status: newStatus,
                      updatedBy: `${user.role} | ${user.fullName}`,
                    }).unwrap();

                    toast.success("Status updated");
                    refetch();
                  } catch (err) {
                    toast.error(getErrMsg(err));
                    console.error(err);
                    refetch();
                  }
                }}
              />
            );
            break;
          }
          case "actions":
            if (isDeletedTab) {
              row[key] = (
                <button
                  onClick={async () => {
                    try {
                      await updateBookingStatus({
                        id: item._id,
                        status: "Pending",
                        updatedBy: `${user.role} | ${user.fullName}`,
                      }).unwrap();
                      toast.success("Booking restored successfully");
                      refetch();
                    } catch (err) {
                      toast.error(getErrMsg(err));
                      console.error(err);
                    }
                  }}
                  className="btn btn-reset"
                >
                  Restore
                </button>
              );
            } else {
              row[key] = (
                <div className="text-center">
                  <button
                    onClick={() =>
                      setSelectedActionRow(
                        selectedActionRow === index ? null : index
                      )
                    }
                    className="p-2 rounded hover:bg-gray-100 transition js-actions-trigger"
                  >
                    <GripHorizontal
                      size={18}
                      className="text-[var(--dark-gray)]"
                    />
                  </button>

                  {selectedActionRow === index && (
                    <div className="mt-2 w-56 bg-white border border-gray-200 rounded-lg js-actions-menu shadow-lg animate-slide-in">
                      {actionMenuItems
                        .filter((action) => {
                          if (user?.role === "driver") {
                            return (
                              action === "View" || action === "Status Audit"
                            );
                          }
                          if (
                            user?.role === "customer" &&
                            action === "Delete"
                          ) {
                            return false;
                          }
                          return true;
                        })
                        .map((action, i) => (
                          <button
                            key={i}
                            onClick={async () => {
                              try {
                                if (action === "Status Audit") {
                                  openAuditModal(item.statusAudit);
                                } else if (action === "View") {
                                  openViewModal(item);
                                } else if (action === "Edit") {
                                  if (user?.role === "driver") {
                                    toast.info("Drivers cannot edit bookings");
                                    return;
                                  }

                                  const bookingSetting = bookingSettingData?.setting || bookingSettingData?.bookingSetting;

                                  if (user?.role === "customer" && bookingSetting?.companyId === user?.companyId) {
                                    const cancelWindow = bookingSetting?.cancelBookingWindow;
                                    if (cancelWindow && isWithinCancelWindow(item, cancelWindow)) {
                                      const windowText = `${cancelWindow.value} ${cancelWindow.unit.toLowerCase()}`;
                                      toast.error(`Cannot edit booking. Pickup time is within the ${windowText} cancellation window.`);
                                      return;
                                    }
                                  }

                                  const editedData = { ...item };
                                  editedData.__editReturn = !!item.returnJourney;
                                  setEditBookingData(editedData);
                                  setShowEditModal(true);
                                } else if (action === "Delete") {
                                  if (isDeletedTab) {
                                    setSelectedDeleteId(item._id);
                                    setShowDeleteModal(true);
                                  } else {
                                    await updateBookingStatus({
                                      id: item._id,
                                      status: "Deleted",
                                      updatedBy: `${user.role} | ${user.fullName}`,
                                    }).unwrap();
                                    toast.success("Booking moved to deleted");
                                    refetch();
                                    setSelectedActionRow(null);
                                  }
                                } else if (action === "Copy Booking") {
                                  const copied = { ...item };
                                  delete copied._id;
                                  if (copied.passenger?._id)
                                    delete copied.passenger._id;
                                  if (copied.vehicle?._id)
                                    delete copied.vehicle._id;
                                  if (copied.primaryJourney?._id)
                                    delete copied.primaryJourney._id;
                                  if (copied.returnJourney?._id)
                                    delete copied.returnJourney._id;

                                  copied.bookingId = "";
                                  copied.status = "Pending";
                                  copied.statusAudit = [];
                                  copied.createdAt = new Date().toISOString();
                                  copied.drivers = [];
                                  copied.__copyMode = true;

                                  if (item.returnJourney) {
                                    copied.primaryJourney = {
                                      ...item.returnJourney,
                                    };
                                    delete copied.returnJourney;
                                    copied.__copyReturn = false;
                                  } else {
                                    copied.__copyReturn = false;
                                  }

                                  setEditBookingData(copied);
                                  setShowEditModal(true);
                                }
                              } catch (err) {
                                toast.error(getErrMsg(err));
                                console.error(err);
                              }
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                          >
                            {action}
                          </button>
                        ))}

                      {user?.role?.toLowerCase() === "clientadmin" &&
                        item.status !== "Cancelled" && (
                          <button
                            onClick={async () => {
                              try {
                                await updateBookingStatus({
                                  id: item._id,
                                  status: "Cancelled",
                                  updatedBy: `${user.role} | ${user.fullName}`,
                                }).unwrap();

                                toast.success("Booking status set to Cancelled");

                                if (item?.passenger?.email) {
                                  try {
                                    await sendBookingEmail({
                                      bookingId: item._id,
                                      email: item.passenger.email,
                                      type: "cancellation",
                                    }).unwrap();

                                    toast.success("Cancellation email sent to customer");
                                  } catch (emailErr) {
                                    toast.error("Failed to send cancellation email");
                                    console.error("❌ Email error:", emailErr);
                                  }
                                } else {
                                  toast.info("No passenger email found to send cancellation notice");
                                }

                                if (Array.isArray(item?.drivers) && item.drivers.length > 0) {
                                  for (const drv of item.drivers) {
                                    const driverEmail =
                                      drv?.email || drv?.DriverData?.email || drv?.driverInfo?.email;
                                    if (driverEmail) {
                                      try {
                                        await sendBookingEmail({
                                          bookingId: item._id,
                                          email: driverEmail,
                                          type: "cancellation-driver",
                                        }).unwrap();

                                        toast.success(`Cancellation email sent to driver: ${driverEmail}`);
                                      } catch (err) {
                                        console.error("❌ Driver email error:", err);
                                        toast.error("Failed to send cancellation email to driver");
                                      }
                                    }
                                  }
                                }

                                refetch();
                                setSelectedActionRow(null);
                              } catch (err) {
                                toast.error(getErrMsg(err));
                                console.error("❌ Cancel booking error:", err);
                              }
                            }}
                            className="w-full cursor-pointer text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition border-t border-gray-100"
                          >
                            Cancel Booking
                          </button>
                        )}
                    </div>
                  )}
                </div>
              );
            }
            break;
          default:
            row[key] = item[key] || "-";
        }
      });
      return row;
    });
  }

  return (
    <CustomTable
      tableHeaders={filteredTableHeaders}
      tableData={tableData}
      exportTableData={exportTableData}
      showSearch
      showRefresh
      showDownload
      showPagination
      showSorting
      selectedRow={selectedRow}
      setSelectedRow={setSelectedRow}
      onRowDoubleClick={(row) => {
        const selectedBooking = filteredBookings.find(
          (b) => b._id === row._id
        );
        if (selectedBooking) {
          openViewModal(selectedBooking);
        }
      }}
    />
  );
};