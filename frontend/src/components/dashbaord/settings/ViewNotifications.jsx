
import React, { useState, useEffect } from "react";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";

const ViewNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setNotifications([
        {
          id: 1,
          type: "success",
          title: "Payment Successful",
          message: "Your subscription payment has been processed successfully.",
          time: "2 minutes ago",
          isRead: false,
        },
        {
          id: 2,
          type: "alert",
          title: "Security Alert",
          message:
            "New login detected from Chrome on Windows. If this wasn't you, please secure your account.",
          time: "1 hour ago",
          isRead: false,
        },
        {
          id: 3,
          type: "info",
          title: "Feature Update",
          message:
            "We've added new dashboard widgets to help you track your progress better.",
          time: "3 hours ago",
          isRead: true,
        },
        {
          id: 4,
          type: "primary",
          title: "Welcome!",
          message:
            "Welcome to our platform! Get started by exploring your dashboard.",
          time: "1 day ago",
          isRead: true,
        },
        {
          id: 5,
          type: "alert",
          title: "Account Verification",
          message:
            "Please verify your email address to complete your account setup.",
          time: "2 days ago",
          isRead: false,
        },
        {
          id: 6,
          type: "success",
          title: "Profile Updated",
          message: "Your profile information has been updated successfully.",
          time: "3 days ago",
          isRead: true,
        },
      ]);
      setLoading(false);
    }, 1200);
  }, []);

  // Utility: Map type to icon with theme colors from CSS variables
  const getNotificationIcon = (type) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case "success":
        return <Icons.CheckCircle />;
      case "alert":
        return <Icons.AlertCircle />;
      case "info":
        return <Icons.Info />;
      case "primary":
        return <Icons.Bell />;
      default:
        return <Icons.Bell />;
    }
  };

  // Utility: Map type to left border color using CSS vars
  const getNotificationBorder = (type) => {
    switch (type) {
      case "success":
        return "border-l-[6px] border-l-success-color";
      case "alert":
        return "border-l-[6px] border-l-alert-red";
      case "info":
        return "border-l-[6px] border-l-main-color";
      case "primary":
        return "border-l-[6px] border-l-primary-dark-red";
      default:
        return "border-l-[6px] border-l-medium-grey";
    }
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const deleteNotification = (id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <section>
      <header className=" flex  px-2 py-1 justify-between">
        <OutletHeading name="Notification" />

        {notifications.length > 0 && (
          <div className="flex gap-3 mb-5">
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="btn btn-success" F>
                Mark All Read
              </button>
            )}
            <button onClick={clearAll} className="btn btn-cancel ">
              Clear All
            </button>
          </div>
        )}
      </header>

      <hr className="mb-6 border-[var(--light-gray)]" />
      <main>
        {loading ? (
          <p
            className="text-center text-medium-grey"
            style={{ fontFamily: "'Roboto', sans-serif" }}
          >
            Loading notifications...
          </p>
        ) : notifications.length === 0 ? (
          <div
            className="bg-cream rounded-xl shadow-sm border border-medium-grey p-12 text-center"
            role="region"
            aria-live="polite"
          >
            <Icons.Bell
              className="w-16 h-16 mx-auto mb-4 text-medium-grey"
              aria-hidden="true"
            />
            <h2
              className="text-xl font-semibold mb-2"
              style={{
                fontFamily: "'Poppins', sans-serif",
                color: "var(--dark-black)",
              }}
            >
              No Notifications
            </h2>
            <p
              className="text-medium-grey"
              style={{ fontFamily: "'Roboto', sans-serif" }}
            >
              You're all caught up! We'll notify you when something new happens.
            </p>
          </div>
        ) : (
          <ul
            className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-scroll-thumb scrollbar-track-scroll-track rounded-md"
            tabIndex={0}
            aria-label="List of notifications"
          >
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`bg-cream border border-medium-grey rounded-xl shadow-sm transition-shadow duration-300 hover:shadow-md
                  ${!notification.isRead ? "ring-2 ring-primary" : ""}
                `}
              >
                <article
                  className={`flex items-start gap-4 p-6 rounded-xl border-l-8
                    ${
                      notification.type === "success"
                        ? "border-l-success-color"
                        : notification.type === "alert"
                        ? "border-l-alert-red"
                        : notification.type === "info"
                        ? "border-l-main-color"
                        : notification.type === "primary"
                        ? "border-l-primary-dark-red"
                        : "border-l-medium-grey"
                    }
                  `}
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <div className="flex-shrink-0" aria-hidden="true">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className="font-semibold truncate"
                        style={{
                          fontFamily: "'Poppins', sans-serif",
                          color: "var(--dark-black)",
                        }}
                      >
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <span
                          className="w-2 h-2 bg-primary rounded-full flex-shrink-0 animate-pulse"
                          aria-label="Unread notification"
                          title="Unread"
                        />
                      )}
                    </div>
                    <p
                      className="text-sm mb-2 leading-relaxed"
                      style={{
                        fontFamily: "'Roboto', sans-serif",
                        color: "var(--medium-grey)",
                      }}
                    >
                      {notification.message}
                    </p>
                    <time
                      className="text-xs"
                      style={{
                        fontFamily: "'Roboto', sans-serif",
                        color: "var(--medium-grey)",
                      }}
                      dateTime={new Date().toISOString()}
                    >
                      {notification.time}
                    </time>
                  </div>

                  <div className="flex flex-col items-center gap-2 ml-4 flex-shrink-0">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 rounded-lg hover:bg-primary-light text-primary transition-colors"
                        aria-label={`Mark notification titled "${notification.title}" as read`}
                      >
                        <Icons.CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 rounded-lg hover:bg-alert-light text-alert-red transition-colors"
                      aria-label={`Delete notification titled "${notification.title}"`}
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
