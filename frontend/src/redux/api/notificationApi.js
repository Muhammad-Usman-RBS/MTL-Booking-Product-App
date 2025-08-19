// src/redux/api/notificationApi.js
import { apiSlice } from "../slices/apiSlice";
import { io as socketClient } from "socket.io-client";

// ---- Base URL resolution (safe for browser builds) ----
const VITE_API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  (typeof window !== "undefined" && window.APP_API_URL) || // optional global fallback
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:5000");

// Helper to safely update cache list
const updateList = (draft, fn) => {
  if (Array.isArray(draft)) fn(draft);
};

export const notificationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // CREATE
    createNotification: builder.mutation({
      query: (body) => ({
        url: `/notification/createNotification`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Notification", id: "LIST" }],
    }),

    // LIST (subscribes to Socket.IO for live updates)
    getUserNotifications: builder.query({
      query: (employeeNumber) =>
        `/notification/get-notification-byId/${employeeNumber}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map((n) => ({ type: "Notification", id: n._id })),
              { type: "Notification", id: "LIST" },
            ]
          : [{ type: "Notification", id: "LIST" }],
      refetchOnFocus: true,
      refetchOnReconnect: true,

      // Realtime: attach Socket.IO when cache entry is active
      async onCacheEntryAdded(
        employeeNumber,
        { updateCachedData, cacheEntryRemoved, getState, extra }
      ) {
        if (!employeeNumber) return;

        // Try to read companyId from auth slice (if present)
        let companyId;
        try {
          const st = getState && getState();
          companyId =
            st &&
            st.auth &&
            (st.auth.user?.companyId || st.auth.companyId);
        } catch (_) {
          companyId = undefined;
        }

        // NOTE: some socket.io versions don't like URLSearchParams; use plain object
        const socket = socketClient(VITE_API_BASE_URL, {
          transports: ["websocket"],
          withCredentials: true,
          path: "/socket.io",
          query: {
            employeeNumber: String(employeeNumber),
            ...(companyId ? { companyId: String(companyId) } : {}),
          },
        });

        const handleNew = (notif) => {
          updateCachedData((draft) =>
            updateList(draft, (list) => {
              if (!list.find((x) => x._id === notif._id)) {
                list.unshift(notif);
              }
            })
          );
        };

        const handleUpdate = (msg) => {
          const { type, id } = msg || {};
          updateCachedData((draft) =>
            updateList(draft, (list) => {
              if (type === "read-all") {
                list.forEach((n) => (n.isRead = true));
              } else if (type === "read-single" && id) {
                const f = list.find((n) => n._id === id);
                if (f) f.isRead = true;
              } else if (type === "deleted" && id) {
                const idx = list.findIndex((n) => n._id === id);
                if (idx >= 0) list.splice(idx, 1);
              }
            })
          );
        };

        socket.on("notification:new", handleNew);
        socket.on("notification:update", handleUpdate);

        // Cleanup when the cache subscription is removed
        await cacheEntryRemoved;
        socket.off("notification:new", handleNew);
        socket.off("notification:update", handleUpdate);
        socket.close();
      },
    }),

    // MARK SINGLE READ (optimistic)
    markAsRead: builder.mutation({
      query: (id) => ({
        url: `/notification/read-single-notification/${id}`,
        method: "PATCH",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        let employeeNumber;
        try {
          const st = getState();
          employeeNumber =
            st?.auth?.user?.employeeNumber ?? st?.auth?.employeeNumber;
        } catch (_) {
          employeeNumber = undefined;
        }
        if (!employeeNumber) return;

        const patch = dispatch(
          apiSlice.util.updateQueryData(
            "getUserNotifications",
            employeeNumber,
            (draft) => {
              const found = Array.isArray(draft)
                ? draft.find((n) => n._id === id)
                : null;
              if (found) found.isRead = true;
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: (res, err, id) => [
        { type: "Notification", id },
        { type: "Notification", id: "LIST" },
      ],
    }),

    // MARK ALL READ (optimistic)
    markAllAsRead: builder.mutation({
      query: (employeeNumber) => ({
        url: `/notification/read-all-notification/${employeeNumber}`,
        method: "PATCH",
      }),
      async onQueryStarted(employeeNumber, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          apiSlice.util.updateQueryData(
            "getUserNotifications",
            employeeNumber,
            (draft) => {
              if (Array.isArray(draft)) draft.forEach((n) => (n.isRead = true));
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: [{ type: "Notification", id: "LIST" }],
    }),

    // DELETE (optimistic)
    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `/notification/delete-notification/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        let employeeNumber;
        try {
          const st = getState();
          employeeNumber =
            st?.auth?.user?.employeeNumber ?? st?.auth?.employeeNumber;
        } catch (_) {
          employeeNumber = undefined;
        }
        if (!employeeNumber) return;

        const patch = dispatch(
          apiSlice.util.updateQueryData(
            "getUserNotifications",
            employeeNumber,
            (draft) => {
              if (!Array.isArray(draft)) return;
              const idx = draft.findIndex((n) => n._id === id);
              if (idx >= 0) draft.splice(idx, 1);
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: (res, err, id) => [
        { type: "Notification", id },
        { type: "Notification", id: "LIST" },
      ],
    }),
  }),
  // keepExistingTokens true prevents endpoint re-injection warnings across HMR
  overrideExisting: true,
});

export const {
  useDeleteNotificationMutation,
  useGetUserNotificationsQuery,
  useCreateNotificationMutation,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationApi;
