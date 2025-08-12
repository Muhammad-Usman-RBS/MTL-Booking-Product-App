// import React, { useEffect, useState } from "react";
// import {  useSelector } from "react-redux";
// import { toast } from "react-toastify";
// import IMAGES from "../../../assets/images";
// import { useAdminGetAllDriversQuery } from "../../../redux/api/adminApi";
// import {
//   useGetAllBookingsQuery,
//   useSendBookingEmailMutation,
//   useUpdateBookingMutation,
// } from "../../../redux/api/bookingApi";
// import { useGetAllDriversQuery } from "../../../redux/api/driverApi";
// import {
//   useCreateJobMutation,
//   useDeleteJobMutation,
// } from "../../../redux/api/jobsApi";
// import {
//   useCreateNotificationMutation,
// } from "../../../redux/api/notificationApi";
// const ViewDriver = ({ selectedRow, setShowDriverModal, onDriversUpdate }) => {
//   const user = useSelector((state) => state.auth.user);
//   const companyId = user?.companyId;
//   const [createNotification] = useCreateNotificationMutation();
//   const [deleteJob] = useDeleteJobMutation();

//   const [createJob] = useCreateJobMutation();

//   const [updateBooking] = useUpdateBookingMutation();
//   const [initialDrivers, setInitialDrivers] = useState([]);

//   const [selectedDrivers, setSelectedDrivers] = useState([]);
//   const [selectAll, setSelectAll] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [showMatching, setShowMatching] = useState(false);
//   const [sendEmailChecked, setSendEmailChecked] = useState(false);

//   const [sendBookingEmail] = useSendBookingEmailMutation();

//   const { data: drivers = [], isLoading } = useGetAllDriversQuery(companyId, {
//     skip: !companyId,
//   });

//   const { data: bookingData, refetch: refetchBookings } =
//     useGetAllBookingsQuery(companyId);

//   const { data: allUsers = [] } = useAdminGetAllDriversQuery();
//   const allBookings = bookingData?.bookings || [];

//   const selectedBooking = allBookings.find(
//     (booking) => booking._id === selectedRow
//   );
//   const bookingVehicleType =
//     selectedBooking?.vehicle?.vehicleName?.trim().toLowerCase() || "";
//   const filteredDriver = (drivers?.drivers || []).filter((driver) => {
//     const name = driver?.DriverData?.firstName?.toLowerCase() || "";
//     const carMake = driver?.VehicleData?.carMake?.toLowerCase() || "";
//     const carModel = driver?.VehicleData?.carModal?.toLowerCase() || "";
//     const vehicleTypes = driver?.VehicleData?.vehicleTypes || [];
//     const matchesSearch =
//       name.includes(searchTerm) ||
//       carMake.includes(searchTerm) ||
//       carModel.includes(searchTerm);

//     const matchesVehicle = showMatching
//       ? vehicleTypes.some(
//           (type) =>
//             typeof type === "string" &&
//             type.trim().toLowerCase() === bookingVehicleType
//         )
//       : true;

//     return matchesSearch && matchesVehicle;
//   });

//   {
//     isLoading && <p>Loading drivers...</p>;
//   }

//   useEffect(() => {
//     if (selectedBooking?.drivers) {
//       const preSelected = (drivers?.drivers || []).filter((driver) =>
//         selectedBooking.drivers.some(
//           (d) => d.driverId === driver._id || d.userId === driver._id
//         )
//       );
//       setSelectedDrivers(preSelected);
//       setInitialDrivers(preSelected); // Store initial state for comparison
//     }
//   }, [selectedBooking, drivers]);

//   useEffect(() => {
//     const all = (filteredDriver || []).map((d) => String(d._id));
//     const chosen = new Set(
//       (selectedDrivers || []).map((d) =>
//         String(d._id ?? d.userId ?? d.driverId)
//       )
//     );

//     const allSelected = all.length > 0 && all.every((id) => chosen.has(id));
//     if (selectAll !== allSelected) setSelectAll(allSelected);
//   }, [filteredDriver, selectedDrivers]);

//   const handleSendEmail = async () => {
//     try {
//       if (!companyId) {
//         toast.error("Company ID is missing. Please log in again.");
//         return;
//       }

//       const booking = allBookings.find((b) => b._id === selectedRow);

//       if (!booking?._id) {
//         toast.error("Please select a booking first.");
//         return;
//       }

//       if (selectedDrivers.length === 0) {
//         const { _id, createdAt, updatedAt, __v, ...restBookingData } = booking;

//         const removedDrivers = initialDrivers.filter(
//           (initial) =>
//             !selectedDrivers.some(
//               (current) =>
//                 current._id === initial._id ||
//                 current.driverId === initial._id ||
//                 current.userId === initial._id
//             )
//         );

//         // 2. Delete jobs for removed drivers
//         for (const driver of removedDrivers) {
//           const driverEmail = driver?.DriverData?.email?.toLowerCase().trim();
//           const matchedUser = (allUsers?.drivers || []).find(
//             (user) =>
//               user.email?.toLowerCase().trim() === driverEmail &&
//               user.role?.toLowerCase() === "driver"
//           );

//           if (!matchedUser?._id || !selectedBooking?._id) continue;

//           const jobs = jobsData?.jobs || [];

//           const matchedJob = jobs.find(
//             (job) =>
//               job.bookingId === selectedBooking._id &&
//               job.driverId === matchedUser._id
//           );

//           if (matchedJob?._id) {
//             try {
//               await deleteJob(matchedJob._id).unwrap();
//               toast.success(
//                 `Removed job for ${driver?.DriverData?.firstName || "Driver"}`
//               );
//             } catch (err) {
//               toast.error(`Failed to delete job for ${driver?.DriverData?.firstName}`);
//             }
//           }
//         }

//         await updateBooking({
//           id: booking._id,
//           updatedData: {
//             bookingData: {
//               ...restBookingData,
//               drivers: [],
//             },
//           },
//         }).unwrap();

//         if (typeof refetchBookings === "function") {
//           refetchBookings();
//         }
//         toast.success("All drivers removed from this booking.");
//         setShowDriverModal(false);
//         if (onDriversUpdate) {
//           onDriversUpdate(selectedRow, []);
//         }
//         return;
//       }

//       for (const driver of selectedDrivers) {
//         const driverEmail = driver?.DriverData?.email?.toLowerCase().trim();

//         const matchedUser = (allUsers?.drivers || []).find(
//           (user) =>
//             user.email?.toLowerCase().trim() === driverEmail &&
//             user.role?.toLowerCase() === "driver"
//         );

//         if (!driverEmail || !matchedUser) {
//           toast.error(
//             `${
//               driver?.DriverData?.firstName || "Driver"
//             } has no valid user account or driver role. Assignment blocked.`
//           );
//           return;
//         }
//       }

//       const { _id, createdAt, updatedAt, __v, ...restBookingData } = booking;

//       const driverObjects = selectedDrivers
//         .map((driver) => {
//           const driverEmail = driver?.DriverData?.email?.toLowerCase().trim();
//           const matchedUser = (allUsers?.drivers || []).find(
//             (user) =>
//               user.email?.toLowerCase().trim() === driverEmail &&
//               user.role?.toLowerCase() === "driver"
//           );

//           return {
//             _id: matchedUser?._id,
//             userId: matchedUser?._id,
//             driverId: driver._id,
//             name: driver?.DriverData?.firstName || "Unnamed",
//             email: driver?.DriverData?.email,
//             employeeNumber: driver?.DriverData?.employeeNumber,
//             contact: driver?.DriverData?.contact,
//           };
//         })
//         .filter((obj) => obj._id);
//       await updateBooking({
//         id: booking._id,
//         updatedData: {
//           bookingData: {
//             ...restBookingData,
//             drivers: driverObjects,
//           },
//         },
//       }).unwrap();

//       if (typeof refetchBookings === "function") {
//         refetchBookings();
//       }

//       toast.success("Booking updated with selected drivers.");

//       await Promise.all(
//         selectedDrivers.map(async (driver) => {
//           const matchedUser = (allUsers?.drivers || []).find(
//             (user) =>
//               user.email?.toLowerCase().trim() ===
//                 driver?.DriverData?.email?.toLowerCase().trim() &&
//               user.role?.toLowerCase() === "driver"
//           );

//           const jobPayload = {
//             bookingId: booking._id,
//             driverId: matchedUser?._id,
//             assignedBy: user._id,
//             companyId,
//           };

//           try {
//             const jobRes = await createJob(jobPayload).unwrap();
//             toast.success(`Job created for ${driver.DriverData?.firstName}`);
//           } catch (err) {
//             toast.error(
//               `Failed to create job for ${driver.DriverData?.firstName}`
//             );
//           }
//         })
//       );

//       if (sendEmailChecked) {
//         await Promise.all(
//           selectedDrivers.map(async (driver) => {
//             const email = driver?.DriverData?.email;
//             if (!email) {
//               toast.warning(
//                 `${
//                   driver?.DriverData?.firstName || "Driver"
//                 } has no email. Skipped.`
//               );
//               return;
//             }

//             const payload = {
//               bookingId: booking._id,
//               email,
//             };

//             try {
//               await sendBookingEmail(payload).unwrap();
//               toast.success(`Email sent to ${driver.DriverData?.firstName}`);
//             } catch (err) {
//               console.error("❌ Email error:", err);
//               toast.error(`Failed to send to ${driver.DriverData?.firstName}`);
//             }
//           })
//         );
//       }

//       if (selectedDrivers.length > 0) {
//         await Promise.all(
//           selectedDrivers.map(async (driver) => {
//             const { DriverData } = driver;

//             if (!DriverData?.employeeNumber) {
//               toast.warning(
//                 `${
//                   DriverData?.firstName || "Driver"
//                 } has no employee number. Skipped.`
//               );
//               return;
//             }

//             const notificationPayload = {
//               employeeNumber: DriverData.employeeNumber,
//               bookingId: booking.bookingId,
//               status: booking.status,
//               primaryJourney: {
//                 pickup:
//                   booking?.primaryJourney?.pickup ||
//                   booking?.returnJourney?.pickup,
//                 dropoff:
//                   booking?.primaryJourney?.dropoff ||
//                   booking?.returnJourney?.dropoff,
//               },
//               bookingSentAt: new Date(),
//               createdBy: user?._id,
//               companyId,
//             };

//             try {
//               await createNotification(notificationPayload).unwrap();
//               toast.success(`Notification sent to ${DriverData?.firstName}`);
//             } catch (error) {
//               toast.error(`Failed to notify ${DriverData?.firstName}`);
//             }
//           })
//         );
//       }

//       setShowDriverModal(false);
//       if (onDriversUpdate) {
//         onDriversUpdate(selectedRow, selectedDrivers);
//       }
//     } catch (error) {
//       toast.error("Something went wrong while assigning drivers.");
//     }
//   };

//   const convertKmToMiles = (text) => {
//     if (!text || typeof text !== "string") return "—";
//     if (text.includes("km")) {
//       const km = parseFloat(text.replace("km", "").trim());
//       if (!isNaN(km)) {
//         return `${(km * 0.621371).toFixed(2)} miles`;
//       }
//     }
//     return text;
//   };

//   return (
//     <>
//       <div className="p-4 space-y-4 text-sm text-gray-800 w-full max-w-full">
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <div>
//             <label className="block font-semibold text-[var(--dark-gray)] mb-1">
//               Distance:
//             </label>
//             <p className="bg-gray-100 px-3 py-1.5 rounded">
//               {convertKmToMiles(
//                 selectedBooking?.primaryJourney?.distanceText ||
//                   selectedBooking?.returnJourney?.distanceText
//               ) || "Select a booking"}
//             </p>
//           </div>
//           <div>
//             <label className="block font-semibold text-[var(--dark-gray)] mb-1">
//               Fare:
//             </label>
//             <input
//               type="number"
//               className="custom_input"
//               value={
//                 selectedBooking?.driverFare ||
//                 selectedBooking?.returnDriverFare ||
//                 ""
//               }
//               readOnly
//             />
//           </div>
//         </div>

//         <div className="flex space-x-2">
//           <button
//             onClick={() => setShowMatching(false)}
//             className="btn btn-primary"
//           >
//             All Drivers
//           </button>
//           <button
//             onClick={() => setShowMatching(true)}
//             className="btn btn-reset"
//           >
//             Matching Drivers
//           </button>
//         </div>

//         <div className="flex items-center justify-between gap-2">
//           <div>
//             <input
//               type="text"
//               placeholder="Search driver"
//               className="custom_input"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
//             />
//           </div>
//           <label className="flex items-center space-x-2 text-sm">
//             <input
//               type="checkbox"
//               className="form-checkbox h-4 w-4 text-indigo-600"
//               checked={selectAll}
//               onChange={(e) => {
//                 const checked = e.target.checked;
//                 setSelectAll(checked);
//                 if (checked) {
//                   setSelectedDrivers(filteredDriver);
//                 } else {
//                   setSelectedDrivers([]);
//                 }
//               }}
//             />
//             <span>Select All</span>
//           </label>
//         </div>

//         <div className="max-h-48 overflow-y-auto pr-1 space-y-3 custom-scroll border border-gray-500 rounded-md">
//           {Array.isArray(filteredDriver) &&
//             filteredDriver.map((driver, i) => (
//               <label
//                 key={i}
//                 className="flex items-center gap-3 p-3    cursor-pointer"
//               >
//                 <img
//                   src={driver.UploadedData?.driverPicture || IMAGES.dummyImg}
//                   alt={driver.name}
//                   className="w-10 h-10 rounded-full object-cover border border-[var(--light-gray)]"
//                 />
//                 <div className="flex-1">
//                   <p className="font-medium text-gray-800">
//                     {driver.DriverData?.firstName}
//                   </p>
//                   <p className="text-xs text-gray-500">
//                     {driver.VehicleData?.carMake || "N/A"} |
//                     {driver.VehicleData?.carModal || "N/A"}
//                   </p>
//                 </div>
//                 <input
//                   type="checkbox"
//                   className="form-checkbox h-4 w-4 text-indigo-600"
//                   checked={selectedDrivers.some(
//                     (d) =>
//                       d._id === driver._id ||
//                       d.driverId === driver._id ||
//                       d.userId === driver._id
//                   )}
//                   onChange={() => {
//                     if (selectedDrivers.some((d) => d._id === driver._id)) {
//                       setSelectedDrivers((prev) =>
//                         prev.filter((d) => d._id !== driver._id)
//                       );
//                     } else {
//                       setSelectedDrivers((prev) => [...prev, driver]);
//                     }
//                   }}
//                 />
//               </label>
//             ))}
//         </div>

//         <div>
//           <label className="block font-semibold text-[var(--dark-gray)] mb-1">
//             Driver Notes:
//             <span className="italic text-red-500 underline">Empty</span>
//           </label>
//         </div>
//         <hr />
//         <div>
//           <label className="block font-semibold text-[var(--dark-gray)] mb-2">
//             Alerts
//           </label>
//           <div className="flex gap-4">
//             <label className="flex items-center gap-2">
//               <input
//                 type="checkbox"
//                 className="form-checkbox"
//                 checked={sendEmailChecked}
//                 onChange={(e) => setSendEmailChecked(e.target.checked)}
//               />
//               <span>Email</span>
//             </label>
//           </div>
//         </div>

//         <div className="pt-4">
//           <button onClick={handleSendEmail} className="btn btn-edit">
//             Update
//           </button>
//         </div>
//       </div>
//     </>
//   );
// };

// export default ViewDriver;

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import IMAGES from "../../../assets/images";
import { useAdminGetAllDriversQuery } from "../../../redux/api/adminApi";
import {
  useGetAllBookingsQuery,
  useSendBookingEmailMutation,
  useUpdateBookingMutation,
} from "../../../redux/api/bookingApi";
import { useGetAllDriversQuery } from "../../../redux/api/driverApi";
import {
  useCreateJobMutation,
  useDeleteJobMutation,
  useGetDriverJobsQuery,
} from "../../../redux/api/jobsApi";
import {
  notificationApi,
  useCreateNotificationMutation,
} from "../../../redux/api/notificationApi";
const ViewDriver = ({ selectedRow, setShowDriverModal, onDriversUpdate }) => {
  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;
  const [createNotification] = useCreateNotificationMutation();

  const { data: jobsData } = useGetDriverJobsQuery(companyId, {
    skip: !companyId,
  });
  const [createJob] = useCreateJobMutation();

  const [updateBooking] = useUpdateBookingMutation();

  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMatching, setShowMatching] = useState(false);
  const [sendEmailChecked, setSendEmailChecked] = useState(false);
  const [previouslySelectedDrivers, setPreviouslySelectedDrivers] = useState(
    []
  );

  const [sendBookingEmail] = useSendBookingEmailMutation();
  const [deleteJob] = useDeleteJobMutation();

  const { data: drivers = [], isLoading } = useGetAllDriversQuery(companyId, {
    skip: !companyId,
  });

  const { data: bookingData, refetch: refetchBookings } =
    useGetAllBookingsQuery(companyId);

  const { data: allUsers = [] } = useAdminGetAllDriversQuery();
  const allBookings = bookingData?.bookings || [];

  const selectedBooking = allBookings.find(
    (booking) => booking._id === selectedRow
  );
  const bookingVehicleType =
    selectedBooking?.vehicle?.vehicleName?.trim().toLowerCase() || "";
  const filteredDriver = (drivers?.drivers || []).filter((driver) => {
    const name = driver?.DriverData?.firstName?.toLowerCase() || "";
    const carMake = driver?.VehicleData?.carMake?.toLowerCase() || "";
    const carModel = driver?.VehicleData?.carModal?.toLowerCase() || "";
    const vehicleTypes = driver?.VehicleData?.vehicleTypes || [];
    const matchesSearch =
      name.includes(searchTerm) ||
      carMake.includes(searchTerm) ||
      carModel.includes(searchTerm);

    const matchesVehicle = showMatching
      ? vehicleTypes.some(
          (type) =>
            typeof type === "string" &&
            type.trim().toLowerCase() === bookingVehicleType
        )
      : true;

    return matchesSearch && matchesVehicle;
  });

  {
    isLoading && <p>Loading drivers...</p>;
  }
  const dispatch = useDispatch();
  useEffect(() => {
    if (selectedBooking?.drivers && allUsers?.drivers) {
      // Get user drivers that match the booking's assigned drivers
      const preSelected = (drivers?.drivers || []).filter((driver) => {
        const driverEmail = driver?.DriverData?.email?.toLowerCase().trim();
        const matchedUser = (allUsers?.drivers || []).find(
          (user) =>
            user.email?.toLowerCase().trim() === driverEmail &&
            user.role?.toLowerCase() === "driver"
        );

        return (
          matchedUser &&
          selectedBooking.drivers.some(
            (d) =>
              d.driverId === matchedUser._id || d.userId === matchedUser._id
          )
        );
      });

      setSelectedDrivers(preSelected);
      setPreviouslySelectedDrivers(preSelected);
    }
  }, [selectedBooking, drivers, allUsers]);

  useEffect(() => {
    const all = (filteredDriver || []).map((d) => String(d._id));
    const chosen = new Set(
      (selectedDrivers || []).map((d) =>
        String(d._id ?? d.userId ?? d.driverId)
      )
    );

    const allSelected = all.length > 0 && all.every((id) => chosen.has(id));
    if (selectAll !== allSelected) setSelectAll(allSelected);
  }, [filteredDriver, selectedDrivers]);
  const removeDriverJobsAndNotifications = async (
    removedUserDrivers,
    allJobs = []
  ) => {
    for (const removedUser of removedUserDrivers) {
      try {
        // removedUser is already a user object with _id
        const userId = removedUser._id;

        if (!userId) {
          console.warn(
            "User ID not found for removed user driver:",
            removedUser.email
          );
          continue;
        }
        const driverJobs = allJobs.filter((job) => {
          const jobBookingId = job.bookingId?.toString();
          const jobDriverId = job.driverId?.toString();
          const bookingId = selectedBooking?._id?.toString();
          const driverId = userId?.toString();

          return jobBookingId === bookingId && jobDriverId === driverId;
        });
        console.log("Jobs for this driver:", driverJobs);

        for (const job of driverJobs) {
          await deleteJob(job._id).unwrap();
        }

        // Step 3: Delete related notifications

        toast.success(
          `Removed job and notification for ${
            removedUser.firstName || removedUser.name || "driver"
          }`
        );
      } catch (error) {
        console.error(
          `❌ Failed to remove job/notification for driver ${removedDriver.DriverData?.firstName}:`,
          error
        );
        toast.error(
          `Failed to remove assignment for ${
            removedDriver.DriverData?.firstName || "driver"
          }`
        );
      }
    }
  };

  const handleSendEmail = async () => {
    try {
      const userEmailToIdMap = new Map(
        (allUsers?.drivers || [])
          .filter((user) => user.email && user.role?.toLowerCase() === "driver")
          .map((user) => [user.email.toLowerCase().trim(), user._id])
      );

      // Step 1: Get current selected user IDs
      const currentDriverIds = new Set(
        selectedDrivers
          .map((driver) => {
            const email = driver?.DriverData?.email?.toLowerCase().trim();
            return userEmailToIdMap.get(email);
          })
          .filter(Boolean) // remove undefined
      );
      console.log(currentDriverIds, "Current Driver IDs");
      const previousDriverIds = new Set(
        previouslySelectedDrivers
          .map((driver) => {
            const email = driver?.DriverData?.email?.toLowerCase().trim();
            return userEmailToIdMap.get(email);
          })
          .filter(Boolean)
      );

      // Find removed drivers - those who were previously selected but not currently selected
      const removedDrivers = (allUsers?.drivers || []).filter((user) => {
        return (
          user.role?.toLowerCase() === "driver" &&
          previousDriverIds.has(user._id) &&
          !currentDriverIds.has(user._id)
        );
      });
      console.log(removedDrivers, "Removed Drivers");
      if (removedDrivers.length > 0) {
        await removeDriverJobsAndNotifications(
          removedDrivers,
          jobsData?.jobs || []
        );
      }
      if (!companyId) {
        toast.error("Company ID is missing. Please log in again.");
        return;
      }

      const booking = allBookings.find((b) => b._id === selectedRow);

      if (!booking?._id) {
        toast.error("Please select a booking first.");
        return;
      }

      if (selectedDrivers.length === 0) {
        const { _id, createdAt, updatedAt, __v, ...restBookingData } = booking;

        await updateBooking({
          id: booking._id,
          updatedData: {
            bookingData: {
              ...restBookingData,
              drivers: [],
            },
          },
        }).unwrap();

        if (typeof refetchBookings === "function") {
          refetchBookings();
        }
        toast.success("All drivers removed from this booking.");
        setPreviouslySelectedDrivers(selectedDrivers);

        setShowDriverModal(false);
        if (onDriversUpdate) {
          onDriversUpdate(selectedRow, selectedDrivers);
        }
        return;
      }

      for (const driver of selectedDrivers) {
        const driverEmail = driver?.DriverData?.email?.toLowerCase().trim();

        const matchedUser = (allUsers?.drivers || []).find(
          (user) =>
            user.email?.toLowerCase().trim() === driverEmail &&
            user.role?.toLowerCase() === "driver"
        );

        if (!driverEmail || !matchedUser) {
          toast.error(
            `${
              driver?.DriverData?.firstName || "Driver"
            } has no valid user account or driver role. Assignment blocked.`
          );
          return;
        }
      }

      const { _id, createdAt, updatedAt, __v, ...restBookingData } = booking;

      const driverObjects = selectedDrivers
        .map((driver) => {
          const driverEmail = driver?.DriverData?.email?.toLowerCase().trim();
          const matchedUser = (allUsers?.drivers || []).find(
            (user) =>
              user.email?.toLowerCase().trim() === driverEmail &&
              user.role?.toLowerCase() === "driver"
          );

          return {
            _id: matchedUser?._id,
            userId: matchedUser?._id,
            driverId: driver._id,
            name: driver?.DriverData?.firstName || "Unnamed",
            email: driver?.DriverData?.email,
            employeeNumber: driver?.DriverData?.employeeNumber,
            contact: driver?.DriverData?.contact,
          };
        })
        .filter((obj) => obj._id);
      await updateBooking({
        id: booking._id,
        updatedData: {
          bookingData: {
            ...restBookingData,
            drivers: driverObjects,
          },
        },
      }).unwrap();

      if (typeof refetchBookings === "function") {
        refetchBookings();
      }

      toast.success("Booking updated with selected drivers.");

      // ✅ Create Jobs
      await Promise.all(
        selectedDrivers.map(async (driver) => {
          const matchedUser = (allUsers?.drivers || []).find(
            (user) =>
              user.email?.toLowerCase().trim() ===
                driver?.DriverData?.email?.toLowerCase().trim() &&
              user.role?.toLowerCase() === "driver"
          );

          const jobPayload = {
            bookingId: booking._id,
            driverId: matchedUser?._id,
            assignedBy: user._id,
            companyId,
          };

          try {
            const jobRes = await createJob(jobPayload).unwrap();
            toast.success(`Job created for ${driver.DriverData?.firstName}`);
          } catch (err) {
            toast.error(
              `Failed to create job for ${driver.DriverData?.firstName}`
            );
          }
        })
      );

      if (sendEmailChecked) {
        await Promise.all(
          selectedDrivers.map(async (driver) => {
            const email = driver?.DriverData?.email;
            if (!email) {
              toast.warning(
                `${
                  driver?.DriverData?.firstName || "Driver"
                } has no email. Skipped.`
              );
              return;
            }

            const payload = {
              bookingId: booking._id,
              email,
            };

            try {
              await sendBookingEmail(payload).unwrap();
              toast.success(`Email sent to ${driver.DriverData?.firstName}`);
            } catch (err) {
              console.error("❌ Email error:", err);
              toast.error(`Failed to send to ${driver.DriverData?.firstName}`);
            }
          })
        );
      }

      if (selectedDrivers.length > 0) {
        await Promise.all(
          selectedDrivers.map(async (driver) => {
            const { DriverData } = driver;

            if (!DriverData?.employeeNumber) {
              toast.warning(
                `${
                  DriverData?.firstName || "Driver"
                } has no employee number. Skipped.`
              );
              return;
            }

            const notificationPayload = {
              employeeNumber: DriverData.employeeNumber,
              bookingId: booking.bookingId,
              status: booking.status,
              primaryJourney: {
                pickup:
                  booking?.primaryJourney?.pickup ||
                  booking?.returnJourney?.pickup,
                dropoff:
                  booking?.primaryJourney?.dropoff ||
                  booking?.returnJourney?.dropoff,
              },
              bookingSentAt: new Date(),
              createdBy: user?._id,
              companyId,
            };

            try {
              await createNotification(notificationPayload).unwrap();
              toast.success(`Notification sent to ${DriverData?.firstName}`);
            } catch (error) {
              toast.error(`Failed to notify ${DriverData?.firstName}`);
            }
          })
        );
      }

      setShowDriverModal(false);
      if (onDriversUpdate) {
        onDriversUpdate(selectedRow, selectedDrivers);
      }
    } catch (error) {
      toast.error("Something went wrong while assigning drivers.");
    }
  };

  const convertKmToMiles = (text) => {
    if (!text || typeof text !== "string") return "—";
    if (text.includes("km")) {
      const km = parseFloat(text.replace("km", "").trim());
      if (!isNaN(km)) {
        return `${(km * 0.621371).toFixed(2)} miles`;
      }
    }
    return text;
  };

  return (
    <>
      <div className="p-4 space-y-4 text-sm text-gray-800 w-full max-w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-[var(--dark-gray)] mb-1">
              Distance:
            </label>
            <p className="bg-gray-100 px-3 py-1.5 rounded">
              {convertKmToMiles(
                selectedBooking?.primaryJourney?.distanceText ||
                  selectedBooking?.returnJourney?.distanceText
              ) || "Select a booking"}
            </p>
          </div>
          <div>
            <label className="block font-semibold text-[var(--dark-gray)] mb-1">
              Fare:
            </label>
            <input
              type="number"
              className="custom_input"
              value={
                selectedBooking?.driverFare ||
                selectedBooking?.returnDriverFare ||
                ""
              }
              readOnly
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setShowMatching(false)}
            className="btn btn-primary"
          >
            All Drivers
          </button>
          <button
            onClick={() => setShowMatching(true)}
            className="btn btn-reset"
          >
            Matching Drivers
          </button>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div>
            <input
              type="text"
              placeholder="Search driver"
              className="custom_input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
            />
          </div>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-indigo-600"
              checked={selectAll}
              onChange={(e) => {
                const checked = e.target.checked;
                setSelectAll(checked);
                if (checked) {
                  setSelectedDrivers(filteredDriver);
                } else {
                  setSelectedDrivers([]);
                }
              }}
            />
            <span>Select All</span>
          </label>
        </div>

        <div className="max-h-48 overflow-y-auto pr-1 space-y-3 custom-scroll border border-gray-500 rounded-md">
          {Array.isArray(filteredDriver) &&
            filteredDriver.map((driver, i) => (
              <label
                key={i}
                className="flex items-center gap-3 p-3    cursor-pointer"
              >
                <img
                  src={driver.UploadedData?.driverPicture || IMAGES.dummyImg}
                  alt={driver.name}
                  className="w-10 h-10 rounded-full object-cover border border-[var(--light-gray)]"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {driver.DriverData?.firstName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {driver.VehicleData?.carMake || "N/A"} |
                    {driver.VehicleData?.carModal || "N/A"}
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-indigo-600"
                  checked={selectedDrivers.some(
                    (d) =>
                      d._id === driver._id ||
                      d.driverId === driver._id ||
                      d.userId === driver._id
                  )}
                  onChange={() => {
                    if (selectedDrivers.some((d) => d._id === driver._id)) {
                      setSelectedDrivers((prev) =>
                        prev.filter((d) => d._id !== driver._id)
                      );
                      console.log(`Unchecked driver ID: ${driver._id}`);
                    } else {
                      setSelectedDrivers((prev) => [...prev, driver]);
                      // Log the driver ID when checked
                      console.log(`Checked driver ID: ${driver._id}`);
                    }
                  }}
                />
              </label>
            ))}
        </div>

        <div>
          <label className="block font-semibold text-[var(--dark-gray)] mb-1">
            Driver Notes:
            <span className="italic text-red-500 underline">Empty</span>
          </label>
        </div>
        <hr />
        <div>
          <label className="block font-semibold text-[var(--dark-gray)] mb-2">
            Alerts
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={sendEmailChecked}
                onChange={(e) => setSendEmailChecked(e.target.checked)}
              />
              <span>Email</span>
            </label>
          </div>
        </div>

        <div className="pt-4">
          <button onClick={handleSendEmail} className="btn btn-edit">
            Update
          </button>
        </div>
      </div>
    </>
  );
};

export default ViewDriver;
