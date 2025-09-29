import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { apiSlice } from "../redux/slices/apiSlice";
import { initSocket, getSocket } from "../utils/socket";

export default function useNotificationsRealtime() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);

  const VITE_API_BASE_URL =
    (typeof import.meta !== "undefined" &&
      import.meta.env?.VITE_API_BASE_URL) ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:5000");

  useEffect(() => {
    const empKey =
      user?.role === "driver"
        ? String(user?.employeeNumber || "")
        : String(user?._id || "");
    const s = initSocket({
      apiBase: VITE_API_BASE_URL,
      employeeNumber: empKey,
      companyId: String(user?.companyId || ""),
      token: user?.token,
    });

    const onNew = (notif) => {
      console.log("[SOCKET] notification:new", notif?._id);
      dispatch(
        apiSlice.util.updateQueryData(
          "getUserNotifications",
          empKey,
          (draft) => {
            if (
              Array.isArray(draft) &&
              !draft.find((d) => d._id === notif._id)
            ) {
              draft.unshift(notif);
            }
          }
        )
      );
    };

    const onUpdate = (msg) => {
      console.log("[SOCKET] notification:update", msg);
      dispatch(
        apiSlice.util.updateQueryData(
          "getUserNotifications",
          empKey,
          (draft) => {
            if (!Array.isArray(draft)) return;
            const { type, id } = msg || {};
            if (type === "read-all") draft.forEach((d) => (d.isRead = true));
            else if (type === "read-single" && id) {
              const f = draft.find((d) => d._id === id);
              if (f) f.isRead = true;
            } else if (type === "deleted" && id) {
              const i = draft.findIndex((d) => d._id === id);
              if (i >= 0) draft.splice(i, 1);
            }
          }
        )
      );
    };
    if (s && typeof s.on === "function") {
        s.on("notification:new", onNew);
        s.on("notification:update", onUpdate);
      }

    return () => {
      const sock = getSocket();
      sock?.off("notification:new", onNew);
      sock?.off("notification:update", onUpdate);
    };
  }, [user?.role, user?._id, user?.employeeNumber, user?.companyId, dispatch]);
}
