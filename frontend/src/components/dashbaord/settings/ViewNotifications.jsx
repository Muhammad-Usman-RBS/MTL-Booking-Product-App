import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import {
  useDeleteNotificationMutation,
  useGetUserNotificationsQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} from "../../../redux/api/notificationApi";
import { useLoading } from "../../common/LoadingProvider";

const ViewNotifications = () => {
  const {showLoading, hideLoading} = useLoading()
  const user = useSelector((state) => state?.auth?.user);
  const empArg =
  user?.role === "driver"
    ? String(user?.employeeNumber || "")
    : String(user?._id || "");

const {
  data: notifications = [],
  refetch: refetchNotifications,
  isLoading,
} = useGetUserNotificationsQuery(empArg, {
  skip: !empArg,
});

  
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  
  const [deleteNotificationMutation] = useDeleteNotificationMutation();
  
  useEffect(()=> {
       if(isLoading) {
         showLoading()
       } else {
         hideLoading()
       }
     },[isLoading])

  const deleteNotification = async (id) => {
    try {
      await deleteNotificationMutation(id);
      refetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };
  const clearAll = async () => {
    try {
      // Delete all notifications one by one
      const deletePromises = notifications.map((notification) =>
        deleteNotification(notification._id)
      );
      await Promise.all(deletePromises);
      refetchNotifications();
    } catch (error) {
      console.error("Error clearing all notifications:", error);
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds !== 1 ? "s" : ""} ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      refetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead(empArg);
      refetchNotifications();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleDeleteNotification = async (id) => {
    await deleteNotification(id);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <section>
      <header className="flex justify-between items-center mb-4">
        <OutletHeading name="Notification" />
        {notifications.length > 0 && (
          <div className="flex gap-3">
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead} className="btn btn-success">
                Mark All Read
              </button>
            )}
            <button onClick={clearAll} className="btn btn-cancel">
              Clear All
            </button>
          </div>
        )}
      </header>

      <hr className="mb-6 border-[var(--light-gray)]" />

      <main>
        { notifications.length === 0 ? (
          <div className="  p-12 text-center">
            <Icons.Bell className="w-16 h-16 mx-auto mb-4 text-[var(--medium-grey)]" />
            <h2 className="text-xl font-semibold mb-2 text-[var(--dark-black)]">
              No Notifications
            </h2>
            <p className="text-[var(--dark-grey)]">
              You're all caught up! We'll notify you when something new happens.
            </p>
          </div>
        ) : (
          <ul className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {notifications.map((notification) => (
              <li
                key={notification._id}
                className={`bg-white  hover:shadow-lg transition-all duration-300`}
              >
                <article className="flex items-start gap-4 p-6">
                  <div className="flex-shrink-0">
                    <Icons.Bell className="w-5 h-5 text-[var(--main-color)]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[var(--navy-blue)] text-base truncate">
                        {notification.status || "New Notification"}
                      </h3>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-[var(--main-color)] rounded-full animate-pulse" />
                      )}
                    </div>

                    <p className="text-sm mb-1 text-[var(--dark-grey)] leading-snug">
                      Booking #{notification.bookingId || "—"}
                    </p>

                    <p className="text-sm mb-1 text-[var(--dark-grey)] leading-snug">
                      {notification?.primaryJourney?.pickup ||
                        notification?.returnJourney?.pickup ||
                        "No pickup location"}
                    </p>

                    <time className="text-xs text-[var(--dark-grey)] italic">
                      {getTimeAgo(notification.bookingSentAt)}
                    </time>
                  </div>

                  <div className="flex flex-col items-center gap-2 ml-4">
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="p-2 rounded-lg hover:bg-[var(--light-blue)] text-[var(--main-color)] transition-colors"
                        title="Mark as Read"
                      >
                        <Icons.CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notification._id)}
                      className="p-2 rounded-lg hover:bg-red-100 text-[var(--alert-red)] transition-colors"
                      title="Delete Notification"
                    >
                      <Icons.X className="w-5 h-5" />
                    </button>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </main>
    </section>
  );
};

export default ViewNotifications;
