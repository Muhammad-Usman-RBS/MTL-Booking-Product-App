// import React, { useState } from "react";
// import { notifications as initialNotifications } from "../../../constants/dashboardTabsData/data";
// import { Link } from "react-router-dom";
// import Icons from "../../../assets/icons";
// import OutletHeading from "../../../constants/constantscomponents/OutletHeading";

// const ViewNotifications = () => {
//   const [notifications, setNotifications] = useState(initialNotifications);

//   const markAsRead = (id) => {
//     const updated = notifications.map((notification) =>
//       notification.id === id ? { ...notification, isRead: true } : notification
//     );
//     setNotifications(updated);
//   };

//   return (
//     <div>
//       <OutletHeading name="Notifications" />

//       <div className="border border-gray-300">
//         {notifications.map((notification) => (
//           <div
//             key={notification.id}
//             className={`px-6 py-4 border-b last:border-b-0 ${
//               !notification.isRead ? "bg-blue-50" : ""
//             }`}
//           >
//             <div className="flex justify-between items-start gap-4">
//               <div className="flex-1">
//                 <h4
//                   className={`text-md font-semibold ${
//                     !notification.isRead ? "text-gray-900" : "text-gray-700"
//                   }`}
//                 >
//                   {notification.title}
//                 </h4>
//                 <p className="text-sm text-gray-600 mt-1">
//                   {notification.message}
//                 </p>
//                 <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
//                   <Icons.Clock className="w-3 h-3" />
//                   {notification.time}
//                 </div>
//               </div>

//               {!notification.isRead && (
//                 <button
//                   onClick={() => markAsRead(notification.id)}
//                   className="text-sm text-blue-600 hover:underline flex items-center gap-1"
//                 >
//                   <Icons.Check className="w-4 h-4" />
//                   Mark as Read
//                 </button>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="mt-6 text-center">
//         <Link to="/dashboard/home" className="inline-flex items-center gap-2 ">
//           <Icons.ArrowDownUp className="w-4 h-4" />
//           Back to Dashboard
//         </Link>
//       </div>
//     </div>
//   );
// };

// export default ViewNotifications;


import React from 'react'

const ViewNotifications = () => {
  return (
    <div>ViewNotifications</div>
  )
}

export default ViewNotifications