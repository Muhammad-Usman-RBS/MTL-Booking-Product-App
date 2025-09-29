import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectBookmarkedThemes,
  setThemeColors,
  selectSelectedThemeId,
  setSelectedThemeId,
  toggleBookmarkTheme,
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
import { STATIC_THEME_DATA } from "../../../constants/dashboardTabsData/data";
import GoogleTranslateButton from "../../../utils/GoogleTranslateButton";
import FontSelector from "../../common/FontSelector";

const STATIC_THEME_KEY = "anonThemeClass";
const STATIC_BOOKMARKS_KEY = "anonThemeBookmarks";
const isStaticId = (id) =>
  ["theme-dark-1", "theme-dark-2", "theme-light-1"].includes(id);
const STATIC_THEMES = ["theme-dark-1", "theme-dark-2", "theme-light-1"];

const applyThemeClass = (className) => {
  const root = document.documentElement;
  STATIC_THEMES.forEach((c) => root.classList.remove(c));
  if (className) root.classList.add(className);
};

function Navbar() {
  const TimeRef = useRef(null);
  const usertooltipRef = useRef(null);
  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;
  const isStaticMode = !user?.companyId;
  const themeBtnRef = useRef(null);
  const email = user?.email || "No Email";
  const name = user?.fullName || "Guest";
  const profileImg = user?.profileImage;
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [themeBtnWidth, setThemeBtnWidth] = useState(null);
  const selectedThemeId = useSelector(selectSelectedThemeId);
  const [activeBookmarkId, setActiveBookmarkId] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const { data: jobData, refetch } = useGetAllJobsQuery(companyId, {
    skip: !companyId,
  });

  const dispatch = useDispatch();
  const [applyThemeSettings] = useApplyThemeSettingsMutation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);
  const JobsList = jobData?.jobs || [];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (usertooltipRef && !usertooltipRef?.current?.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  useEffect(() => {
    const onFocus = () => {
      if (companyId && refetch) {
        refetch();
      }
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

  const bookmarks = useSelector(selectBookmarkedThemes);

  useEffect(() => {
    if (!isStaticMode) return;
    try {
      const saved = JSON.parse(
        localStorage.getItem(STATIC_BOOKMARKS_KEY) || "[]"
      );

      if (saved.length > 0) {
        // Add any missing saved bookmarks into Redux (no duplicates)
        saved.forEach((b) => {
          if (!bookmarks.find((x) => x._id === b._id)) {
            dispatch(
              toggleBookmarkTheme({
                _id: b._id,
                themeSettings: b.themeSettings || {},
                label: b.label || b._id,
              })
            );
          }
        });
      } else {
        // First-time seed from STATIC_THEME_DATA
        const seed = (STATIC_THEME_DATA || []).map((t) => ({
          _id: t.id,
          themeSettings: t.colors,
          label: t.name,
        }));
        localStorage.setItem(STATIC_BOOKMARKS_KEY, JSON.stringify(seed));
        seed.forEach((b) => {
          if (!bookmarks.find((x) => x._id === b._id)) {
            dispatch(toggleBookmarkTheme(b));
          }
        });
      }
    } catch (e) {
      console.error("Failed to hydrate static bookmarks in navbar:", e);
    }
  }, [isStaticMode, dispatch]);
  useEffect(() => {
    setActiveBookmarkId(selectedThemeId || null);
  }, [selectedThemeId]);
  useEffect(() => {
    if (themeBtnRef.current) {
      setThemeBtnWidth(themeBtnRef.current.offsetWidth);
    }
  }, [isModalOpen]);
  useEffect(() => {
    if (!isStaticMode) return;
    const staticOnly = (bookmarks || []).filter((b) =>
      ["theme-dark-1", "theme-dark-2", "theme-light-1"].includes(b._id)
    );
    localStorage.setItem(STATIC_BOOKMARKS_KEY, JSON.stringify(staticOnly));
  }, [isStaticMode, bookmarks]);
  useEffect(() => {
    if (!isStaticMode) return;
    if (!bookmarks || bookmarks.length === 0) return;

    const staticOnly = bookmarks.filter((b) =>
      ["theme-dark-1", "theme-dark-2", "theme-light-1"].includes(b._id)
    );
    localStorage.setItem(STATIC_BOOKMARKS_KEY, JSON.stringify(staticOnly));
  }, [isStaticMode, bookmarks]);

  useEffect(() => {
    if (!isStaticMode) return;
    const cls = localStorage.getItem(STATIC_THEME_KEY);
    if (cls) setActiveBookmarkId(cls);
  }, [isStaticMode]);
  // const { data: notifications = [], refetch: refetchNotifications } =
  // useGetUserNotificationsQuery(user?.employeeNumber, {
  //   skip: !user?.employeeNumber,
  // });

  useEffect(() => {
    if (!isStaticMode) return;

    const saved = JSON.parse(
      localStorage.getItem(STATIC_BOOKMARKS_KEY) || "[]"
    );
    const hasAny = (bookmarks?.length ?? 0) > 0 || saved.length > 0;
    if (hasAny) return;

    const seed = (STATIC_THEME_DATA || []).map((t) => ({
      _id: t.id,
      themeSettings: t.colors,
      label: t.name,
    }));

    localStorage.setItem(STATIC_BOOKMARKS_KEY, JSON.stringify(seed));
    seed.forEach((b) => dispatch(toggleBookmarkTheme(b)));
  }, [isStaticMode, bookmarks?.length, dispatch]);

  const handleApplyBookmarkedTheme = useCallback(
    async (b) => {
      try {
        if (!user?.companyId || isStaticId(b._id)) {
          applyThemeClass(b._id);
          localStorage.setItem(STATIC_THEME_KEY, b._id);

          setActiveBookmarkId(b._id);

          dispatch(setSelectedThemeId(null));

          setIsModalOpen(false);
          return;
        }
        const res = await applyThemeSettings({
          companyId: user.companyId,
          themeId: b._id,
        }).unwrap();

        const applied = res?.theme?.themeSettings || b.themeSettings || {};
        const root = document.documentElement;
        ["bg", "text", "primary", "hover", "active"].forEach((k) => {
          if (applied[k]) root.style.setProperty(`--${k}`, applied[k]);
        });
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

  const displayName = (name || "")
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
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
            {["clientadmin", "superadmin", "demo"].includes(user?.role)
              ? "Admin Panel"
              : user?.role === "driver"
              ? "Driver Portal"
              : user?.role === "customer"
              ? "Customer Portal"
              : user?.role === "staffmember"
              ? "Manager Portal"
              : user?.role === "associateadmin"
              ? "associate admin"
              : "Portal"}
          </h1>
        </div>
        <div className="flex items-center  justify-end gap-2 sm:gap-4 flex-wrap">
          <FontSelector />
          <div
            className="cursor-pointer  relative border border-theme bg-theme p-2 rounded-lg "
            onClick={() => setShowTooltip(true)}
            onMouseLeave={handleMouseLeave}
          >
            <Icons.BellPlus className="size-4 text-theme" />
            <div>
              {notifications.length >= 1 && (
                <span className="absolute -top-2 -right-2 bg-red-400 text-xs py-[0.5px] px-1 rounded-full">
                  {notifications.filter((n) => !n.isRead).length}
                </span>
              )}
            </div>

            {showTooltip && (
              <div
                onMouseEnter={handleMouseEnterTooltip}
                onMouseLeave={handleMouseLeave}
                className="bg-white absolute border-[var(--light-gray)] border-[1.5px] top-12 lg:right-0 -right-24    text-black z-[999] lg:w-96 w-72 max-h-96 overflow-hidden"
              >
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
                    notifications.map((data) => {
                      const isDocExpiry = data.status === "Document Expired";

                      return (
                        <div
                          key={data._id}
                          onClick={() => {
                            if (!isDocExpiry) {
                              handleNotificationClick(data.jobId);
                            }
                            setShowTooltip(false);
                          }}
                          className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 ${
                            data.isRead ? "bg-gray-50 opacity-60" : "bg-white"
                          } ${
                            isDocExpiry ? "cursor-default" : "cursor-pointer"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              {isDocExpiry ? (
                                <>
                                  <div className="flex items-start justify-between">
                                    <h4 className="text-xs text-gray-700 font-medium">
                                      Document Expired
                                    </h4>
                                    <span className="text-xs font-medium text-gray-600">
                                      <span>Employee Number:</span>
                                      #{data.expiryDetails
                                        .driverEmployeeNumber ||
                                        "New Notification"}
                                    </span>
                                  </div>
                                  <p className="text-xs text-[var(--dark-gray)] mt-1">
                                    Driver:
                                    <span className="font-medium">
                                      {data.expiryDetails?.driverName}
                                    </span>
                                  </p>
                                  <p className="text-xs text-red-600 mt-1">
                                    Expired:
                                    {data.expiryDetails?.expiredDocuments?.join(
                                      ", "
                                    )}
                                  </p>
                                </>
                              ) : (
                                /* Booking Notification */
                                <>
                                  <div className="flex items-start justify-between">
                                    <h4 className="text-sm text-gray-700">
                                      {data.status || "New Notification"}
                                    </h4>
                                    <div>
                                      <span className="text-xs text-gray-700">
                                        #{data?.bookingId || "_"}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-xs text-[var(--dark-gray)] mt-1 line-clamp-1">
                                    {data?.primaryJourney?.pickup ||
                                      data?.returnJourney?.pickup}
                                  </p>
                                </>
                              )}

                              {/* Common footer for both types */}
                              <div className="flex items-center mt-2 justify-between">
                                <div className="flex items-center space-x-1">
                                  <Icons.Clock className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">
                                    {getTimeAgo(
                                      data.bookingSentAt || data.createdAt
                                    )}
                                  </span>
                                </div>
                                <div>
                                  {!data.isRead && (
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        try {
                                          await markAsRead(data._id).unwrap();
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
                      );
                    })}
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
          {(isStaticMode ||
            user?.role === "clientadmin" ||
            user?.role === "superadmin") && (
            <div className="relative" ref={themeBtnRef}>
              <button
                onClick={() => setIsModalOpen((v) => !v)}
                className="p-2 rounded-lg cursor-pointer border border-theme bg-theme text-black shadow-md hover:bg-gray-100"
                title="Select Theme"
              >
                <Icons.Palette className=" w-4 h-4 text-theme" />
              </button>

              {/* Modal / Popup */}
              {isModalOpen && (
                <div
                  role="dialog"
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 p-3"
                >
                  {bookmarks && bookmarks.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold hidden lg:block text-gray-700">
                          Choose&nbsp;Theme
                        </h3>
                      </div>
                      <div className="space-y-2">
                        {bookmarks.map((b) => (
                          <button
                            key={b._id}
                            type="button"
                            onClick={() => {
                              handleApplyBookmarkedTheme(b);
                              setIsModalOpen(false);
                            }}
                            className={`w-full p-2 rounded-lg cursor-pointer border transition hover:scale-[1.02] hover:shadow 
                ${
                  activeBookmarkId === b._id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                }`}
                          >
                            <div className="flex space-x-3  justify-center">
                              <div
                                className="w-4 h-4  rounded-sm border"
                                style={{
                                  backgroundColor: b?.themeSettings?.bg,
                                }}
                              />
                              <div
                                className="w-4 h-4  rounded-sm border"
                                style={{
                                  backgroundColor: b?.themeSettings?.text,
                                }}
                              />
                              <div
                                className="w-4 h-4  rounded-sm border"
                                style={{
                                  backgroundColor: b?.themeSettings?.primary,
                                }}
                              />
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <span className="text-2xl">🎨</span>
                      <Link
                        to="/dashboard/settings/general"
                        onClick={() => setIsModalOpen(false)}
                        className="block mt-2 text-sm text-blue-600"
                      >
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
                className="flex cursor-pointer items-center gap-2 p-2 rounded-lg bg-theme border border-theme text-sm shadow-md text-black hover:bg-gray-100 transition duration-200"
              >
                <Icons.User className="w-4 h-4 text-theme" />
              </button>

              {isDropdownOpen && (
                <div
                  ref={usertooltipRef}
                  onMouseEnter={handleMouseEnterTooltip}
                  onMouseLeave={handleMouseLeave}
                  className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg z-50"
                >
                  <div className="border-b">
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
                      <div className="min-w-0 w-24">
                        <p className="font-semibold truncate whitespace-nowrap">
                          {displayName}
                        </p>
                        <p className="font-light text-sm">
                          {user?.role === "clientadmin"
                            ? "Admin"
                            : user?.role.charAt(0).toUpperCase() +
                              user?.role.slice(1)}
                        </p>
                      </div>
                    </div>

                    <div className="ps-4 py-2">
                      <p className="text-sm truncate text-[var(--dark-gray)]">
                        {email}
                      </p>
                    </div>
                  </div>

                  <ul className="py-2" role="menu">
                    <li role="menuitem">
                      <Link
                        to="/dashboard/profile"
                        className="block w-full px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        Profile
                      </Link>
                    </li>
                    <li role="menuitem">
                      <Link
                        to="/dashboard/logout"
                        className="block w-full px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        Logout
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          <GoogleTranslateButton />
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
