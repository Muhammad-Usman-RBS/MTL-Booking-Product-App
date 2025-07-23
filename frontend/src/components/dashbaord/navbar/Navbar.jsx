import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Icons from "../../../assets/icons";
import IMAGES from "../../../assets/images";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import { themes } from "../../../constants/dashboardTabsData/data";
import {
  useGetUserNotificationsQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} from "../../../redux/api/notificationApi";
import useUIStore from "../../../store/useUIStore";
import JourneyDetailsModal from "../bookings/JourneyDetailsModal";
import { useGetAllBookingsQuery } from "../../../redux/api/bookingApi";

function Navbar() {
  const TimeRef = useRef(null);
  const user = useSelector((state) => state.auth.user);
  const email = user?.email || "No Email";
  const name = user?.fullName || "Guest";
  const profileImg = user?.profileImage;
  const navigate = useNavigate();
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const setTheme = useUIStore((state) => state.setTheme);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [showJourneyModal, setShowJourneyModal] = useState(false);
  const { data: bookings } = useGetAllBookingsQuery(user?.companyId);

  const { data: notifications = [], refetch: refetchNotifications } =
    useGetUserNotificationsQuery(user?.employeeNumber, {
      skip: !user?.employeeNumber,
    });

  const [customTheme, setCustomTheme] = useState({
    bg: "#ffffff",
    text: "#000000",
    hoverActive: "#F7BE7E",
  });

  const [firstName, lastName] = name.split(" ");
  const displayName = `${firstName || ""} ${lastName || ""}`.trim();

  const handleMouseLeave = () => {
    TimeRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 400);
  };

  const handleMouseEnterTooltip = () => {
    if (TimeRef.current) {
      clearTimeout(TimeRef.current);
      TimeRef.current = null;
    }
  };
  const bookingList = bookings?.bookings || [];
  const selectedBooking = bookingList.find(
    (booking) => booking.bookingId === selectedBookingId
  );

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

  useEffect(() => {
    if (!user?.companyId) return;
  }, [user?.companyId]);
  return (
    <>
      <nav className="bg-theme text-theme z-20 relative p-[17.2px] flex  justify-between items-start gap-2 sm:gap-4">
        <div className=" flex mt-1.5  space-x-2">
          <button onClick={toggleSidebar} className=" cursor-pointer">
            <Icons.Menu className="size-6 text-theme" />
          </button>

          <h1 className="text-xl hidden lg:block font-bold uppercase">
            {[
              "clientadmin",
              "superadmin",
              "manager",
              "demo",
              "associate admin",
              "staffmember",
            ].includes(user?.role)
              ? "Admin Panel"
              : user?.role === "driver"
              ? "Driver Portal"
              : user?.role === "customer"
              ? "Customer Portal"
              : "Portal"}
          </h1>
        </div>
        <div className="flex items-center  justify-end gap-2 sm:gap-4 flex-wrap">
          <div className="relative">
            <button
              onClick={() => setIsThemeOpen(!isThemeOpen)}
              className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white border border-[var(--light-gray)] text-sm shadow-md text-black hover:bg-gray-100 transition duration-200"
            >
              <span className="text-lg">🎨</span>
              <span>Select Theme</span>
            </button>

            {isThemeOpen && (
              <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow-lg z-50 w-[135px] max-h-64 overflow-y-auto px-2 py-2">
                {themes.map((theme, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setTheme(theme.value);
                      if (theme.value === "custom") setIsModalOpen(true);
                      setIsThemeOpen(false);
                    }}
                    className="cursor-pointer hover:bg-gray-100 px-1 py-1 rounded flex justify-between items-center"
                  >
                    {theme.value !== "custom" ? (
                      <>
                        <div
                          className="w-5 h-5 rounded"
                          style={{
                            backgroundColor: theme.bg,
                            border: "1px solid #ccc",
                          }}
                        ></div>
                        <div
                          className="w-5 h-5 rounded"
                          style={{
                            backgroundColor: theme.hoverActive,
                            border: "1px solid #ccc",
                          }}
                        ></div>
                        <div
                          className="w-5 h-5 rounded"
                          style={{
                            backgroundColor: theme.text,
                            border: "1px solid #ccc",
                          }}
                        ></div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-sm text-amber-700 font-semibold bg-amber-100 px-2 py-2 rounded-lg">
                        <span className="text-lg">🎨</span>
                        <span className="text-center">
                          Choose your favorite color
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex lg:flex-row md:flex-row sm:flex-row xs flex-row-reverse">
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[var(--light-gray)] text-sm shadow-md text-black hover:bg-gray-100 transition duration-200"
              >
                <Icons.User className="w-4 h-4 text-dark" />
                <span>User</span>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg z-50">
                  <div className="border-b   text- ">
                    <div className="ps-4 pt-4 flex items-center space-x-3">
                      {profileImg &&
                      profileImg !== "" &&
                      profileImg !== "default" ? (
                        <img
                          src={profileImg}
                          alt="Profile"
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <img
                          src={IMAGES.dummyImg}
                          alt="Default"
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="font-semibold">{displayName}</p>
                      </div>
                    </div>

                    <div className="ps-4 py-2 ">
                      <p className="text-sm truncate  text-[var(--dark-gray)]">
                        {email}
                      </p>
                    </div>
                  </div>

                  <ul className="py-2">
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                      <Link to="/dashboard/profile">Profile</Link>
                    </li>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                      <Link to="/dashboard/logout">Logout</Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div
              className="cursor-pointer lg:mt-0 mt-2 relative hover:bg-white/30 backdrop-blur-md p-2 mx-1 rounded-full"
              onClick={() => setShowTooltip(true)}
              onMouseLeave={handleMouseLeave}
            >
              <Icons.BellPlus className="size-5" />
              <div>
                {notifications.length >= 1 && (
                  <span className="absolute -top-2 right-0 bg-red-400 text-xs py-[0.5px] px-1 rounded-full">
                    {notifications.filter((n) => !n.isRead).length}
                  </span>
                )}
              </div>

              {showTooltip && (
                <div
                  onMouseEnter={handleMouseEnterTooltip}
                  onMouseLeave={handleMouseLeave}
                  className="bg-white absolute border-[var(--light-gray)] border-[1.5px] top-12 lg:right-0 -right-1/2   text-black z-[999] lg:w-96 w-72 max-h-96 overflow-hidden"
                >
                  <div className="border-b px-4 py-3 text-theme bg-theme">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Notifications</h3>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            await markAllAsRead(user.employeeNumber);

                            refetchNotifications();
                          } catch (err) {
                            console.error(
                              "Error marking all notifications as read:",
                              err
                            );
                          }
                        }}
                        className="text-sm"
                      >
                        Mark all as read
                      </button>
                    </div>
                  </div>
                  {(!Array.isArray(notifications) ||
                    notifications.length === 0) && (
                    <div className="px-4 py-3 text-gray-500 text-sm">
                      No new notifications
                    </div>
                  )}
                  {/* Notifications List */}
                  <div className="max-h-64 overflow-y-auto">
                    {Array.isArray(notifications) &&
                      notifications.map((data) => (
                        <div
                          key={data._id}
                          onClick={() => {
                            setSelectedBookingId(data.bookingId);
                            setShowJourneyModal(true);
                            setShowTooltip(false);
                            navigate("/dashboard/bookings/list");
                          }}
                          className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 ${
                            data.isRead ? "bg-gray-50 opacity-60" : "bg-white"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`flex-1 `}>
                              <div className="flex items-start justify-between">
                                <h4 className={`text-sm text-gray-700`}>
                                  {data.status || "New Notification"}
                                </h4>
                                <div>
                                  <span className="text-xs text-gray-700">
                                    #{data.bookingId || "—"}
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-[var(--dark-gray)] mt-1 line-clamp-1 ">
                                {data?.primaryJourney?.pickup ||
                                  data?.returnJourney?.pickup}
                              </p>
                              <div className="flex items-center mt-2 justify-between">
                                <div className="flex items-center space-x-1">
                                  <Icons.Clock className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">
                                    {getTimeAgo(data.bookingSentAt)}
                                  </span>
                                </div>
                                <div>
                                  {!data.isRead && (
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        try {
                                          await markAsRead(data._id);
                                          refetchNotifications();
                                          setReadNotifications(
                                            (prev) =>
                                              new Set([...prev, data._id])
                                          );
                                        } catch (err) {
                                          console.error(
                                            "Error marking notification as read:",
                                            err
                                          );
                                        }
                                      }}
                                      className="text-xs px-2 py-1 text-black cursor-pointer"
                                    >
                                      Mark as read
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 text-theme bg-theme border-t">
                    <Link
                      onClick={() => setShowTooltip(false)}
                      to="/dashboard/settings/notifications"
                      className="w-full text-center text-sm  font-medium flex items-center justify-center gap-2"
                    >
                      <Icons.Eye className="w-4 h-4" />
                      View All Notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 🎨 Custom Theme Modal */}
      <CustomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        heading="Customize Your Theme"
      >
        <div className="px-6 pt-4 pb-2 text-black space-y-4">
          {/* Background Color */}
          <div className="flex items-center justify-between">
            <label className="font-semibold">Background Color</label>
            <input
              type="color"
              value={customTheme.bg}
              onChange={(e) => {
                const value = e.target.value;
                setCustomTheme((prev) => ({ ...prev, bg: value }));
                document.documentElement.style.setProperty("--bg", value);
              }}
              className="w-18 h-12 cursor-pointer"
            />
          </div>

          {/* Text Color */}
          <div className="flex items-center justify-between">
            <label className="font-semibold">Text Color</label>
            <input
              type="color"
              value={customTheme.text}
              onChange={(e) => {
                const value = e.target.value;
                setCustomTheme((prev) => ({ ...prev, text: value }));
                document.documentElement.style.setProperty("--text", value);
              }}
              className="w-18 h-12 cursor-pointer"
            />
          </div>

          {/* Hover/Active Color */}
          <div className="flex items-center justify-between">
            <label className="font-semibold">Hover/Active Color</label>
            <input
              type="color"
              value={customTheme.hoverActive}
              onChange={(e) => {
                const value = e.target.value;
                setCustomTheme((prev) => ({ ...prev, hoverActive: value }));
                document.documentElement.style.setProperty("--hover", value);
                document.documentElement.style.setProperty("--active", value);
              }}
              className="w-18 h-12 cursor-pointer"
            />
          </div>
        </div>
      </CustomModal>
      <CustomModal
        isOpen={showJourneyModal}
        onClose={() => setShowJourneyModal(false)}
        heading="Journey Details"
      >
        <JourneyDetailsModal viewData={selectedBooking} />
      </CustomModal>
    </>
  );
}

export default Navbar;
