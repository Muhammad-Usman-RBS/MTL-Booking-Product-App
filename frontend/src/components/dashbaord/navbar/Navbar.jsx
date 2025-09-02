import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectBookmarkedThemes,
  setThemeColors,
  selectSelectedThemeId,
  setSelectedThemeId,
} from "../../../redux/slices/themeSlice";
import { Link } from "react-router-dom";
import Icons from "../../../assets/icons";
import IMAGES from "../../../assets/images";
import {
  useGetUserNotificationsQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} from "../../../redux/api/notificationApi";
import useUIStore from "../../../store/useUIStore";
import { useApplyThemeSettingsMutation } from "../../../redux/api/themeApi";
import DriverPortalHome from "../../../portals/driverportal/home/DriverPortalHome";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import { useGetAllJobsQuery } from "../../../redux/api/jobsApi";

function Navbar() {
  const TimeRef = useRef(null);
  const usertooltipRef = useRef(null);
  const user = useSelector((state) => state.auth.user);
  const themeBtnRef = useRef(null);
  const email = user?.email || "No Email";
  const name = user?.fullName || "Guest";
  const profileImg = user?.profileImage;
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [themeBtnWidth, setThemeBtnWidth] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const { data: jobData, refetch } = useGetAllJobsQuery(user?.companyId);

  const dispatch = useDispatch();
  const [applyThemeSettings] = useApplyThemeSettingsMutation();

  const JobsList = jobData?.jobs || [];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (usertooltipRef && !usertooltipRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  useEffect(() => {
    const onFocus = () => {
      refetch();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refetch]);
  const handleNotificationClick = (jobId) => {
    if (user?.role !== "driver") return;

    const foundJob = JobsList.find(
      (job) => String(job.bookingId) === String(jobId)
    );

    if (foundJob) {
      const formattedJob = {
        ...foundJob,
        _id: String(foundJob._id || foundJob.id || foundJob.jobId || ""),
        bookingId: String(foundJob.bookingId || ""),
        jobStatus:
          foundJob.jobStatus || foundJob.jobstatus || foundJob.status || "New",
        booking: foundJob.booking || foundJob,
      };

      setSelectedBooking(formattedJob);
      setIsBookingModalOpen(true);
    }
  };
  const handleApplyBookmarkedTheme = useCallback(
    async (b) => {
      try {
        if (!user?.companyId) return;
        const res = await applyThemeSettings({
          companyId: user.companyId,
          themeId: b._id,
        }).unwrap();

        const applied = res?.theme?.themeSettings || b.themeSettings || {};

        // apply to DOM
        const root = document.documentElement;
        ["bg", "text", "primary", "hover", "active"].forEach((k) => {
          if (applied[k]) root.style.setProperty(`--${k}`, applied[k]);
        });

        // update store
        dispatch(setThemeColors(applied));
        dispatch(setSelectedThemeId(b._id));
        setActiveBookmarkId(b._id);
        setIsModalOpen(false);
      } catch (e) {
        console.error(e);
      }
    },
    [applyThemeSettings, dispatch, user?.companyId]
  );
  const bookmarks = useSelector(selectBookmarkedThemes);
  const selectedThemeId = useSelector(selectSelectedThemeId);
  const [activeBookmarkId, setActiveBookmarkId] = useState(null);
  useEffect(() => {
    setActiveBookmarkId(selectedThemeId || null);
  }, [selectedThemeId]);
  useEffect(() => {
    if (themeBtnRef.current) {
      setThemeBtnWidth(themeBtnRef.current.offsetWidth);
    }
  }, [isModalOpen]);

  // const { data: notifications = [], refetch: refetchNotifications } =
  // useGetUserNotificationsQuery(user?.employeeNumber, {
  //   skip: !user?.employeeNumber,
  // });

  const empArg =
    user?.role === "driver"
      ? String(user?.employeeNumber || "")
      : String(user?._id || "");

  const { data: notifications = [] } = useGetUserNotificationsQuery(empArg, {
    skip: !empArg,
  });

  // Also make sure any place that calls markAllAsRead / markAsRead
  // continues to use ids returned from the list, and for markAllAsRead
  // pass the SAME empArg:

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
  useEffect(() => {
    const onDocClick = (e) => {
      if (themeBtnRef.current && !themeBtnRef.current.contains(e.target)) {
        setIsModalOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);
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
          <div
            className="cursor-pointer lg:mt-0 mt-2 relative hover:bg-white/30 backdrop-blur-md p-2 rounded-full"
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
              className="bg-white absolute border-[var(--light-gray)] border-[1.5px] top-12 lg:right-0 -right-1/2   text-black z-[999] lg:w-96 w-72 max-h-96 overflow-hidden">
                <div className="border-b px-4 py-3 text-theme bg-theme">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">Notifications</h3>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await markAllAsRead(empArg).unwrap();
                        } catch (err) {
                          console.error("Error marking all as read:", err);
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
                          handleNotificationClick(data.jobId);
                          setShowTooltip(false);
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
                                        await markAsRead(data._id).unwrap();
                                        refetchNotifications();
                                        setReadNotifications(
                                          (prev) => new Set([...prev, data._id])
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
          {/* Theme selector - only for admins */}
          {(user?.role === "clientadmin" || user?.role === "superadmin") && (
            <div className="relative" ref={themeBtnRef}>
              <button
                onClick={() => setIsModalOpen((v) => !v)}
                className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[var(--light-gray)] text-sm shadow-md text-black hover:bg-gray-100 transition duration-200"
              >
                <span>🎨</span>
                <span>Select Theme</span>
              </button>

              {isModalOpen && (
                <div
                  role="dialog"
                  style={{ width: themeBtnWidth || "auto" }}
                  className={`absolute right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 p-3 ${
                    isModalOpen && themeBtnRef.current
                      ? `w-[${themeBtnRef.current.offsetWidth}px]`
                      : ""
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {bookmarks && bookmarks.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-gray-700">
                          Choose Theme
                        </h3>
                      </div>
                      <div className="space-y-2">
                        {bookmarks.map((b) => {
                          const c = b.themeSettings || {};
                          return (
                            <button
                              key={b._id}
                              type="button"
                              onClick={() => {
                                handleApplyBookmarkedTheme(b);
                                setIsModalOpen(false);
                              }}
                              title={b.label || "Apply theme"}
                              className={`w-full p-2 border-1 rounded-lg transition-all duration-200 group hover:scale-[1.02] hover:shadow-lg 
             border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50
            `}
                            >
                              <div className="flex space-x-3 gap-1">
                                <div
                                  className="w-4 h-4 rounded-sm  border border-gray-300 shadow-sm"
                                  style={{ backgroundColor: c.bg }}
                                />
                                <div
                                  className="w-4 h-4  rounded-sm border border-gray-300 shadow-sm"
                                  style={{ backgroundColor: c.text }}
                                />
                                <div
                                  className="w-4 h-4  rounded-sm   border border-gray-300 shadow-sm"
                                  style={{ backgroundColor: c.primary }}
                                />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="text-center ">
                      <div className="size-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-2xl">🎨</span>
                      </div>
                      <Link
                        to="/dashboard/settings/general"
                        onClick={() => setIsModalOpen(false)}
                        className="inline-flex items-center  text-xs text-blue-600 hover:text-blue-700 "
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        Add Themes
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

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
                <div
                  ref={usertooltipRef}
                  onMouseEnter={handleMouseEnterTooltip}
                  onMouseLeave={handleMouseLeave}
                  className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg z-50"
                >
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
                      <div className="min-w-0">
                        <p className="font-semibold truncate ">{displayName}</p>
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
          </div>
        </div>
      </nav>
      <div className="">
        <CustomModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          heading="Booking Details"
        >
          <div
            className="w-full max-w-xl px-6 mt-3 py-1
           mx-auto"
          >
            <DriverPortalHome
              setIsBookingModalOpen={setIsBookingModalOpen}
              propJob={[selectedBooking]}
            />
          </div>
        </CustomModal>
      </div>
    </>
  );
}

export default Navbar;
