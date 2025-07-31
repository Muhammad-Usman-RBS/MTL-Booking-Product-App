import { apiSlice } from "../apiSlice";

export const notificationApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
      createNotification: builder.mutation({
        query: (body) => ({
          url: `/notification/createNotification`,
          method: "POST",
          body,
        }),
      }),
    getUserNotifications: builder.query({
      query: (employeeNumber) => `/notification/get-notification-byId/${employeeNumber}`,
    }),
    markAsRead: builder.mutation({
      query: (id) => ({
        url: `/notification/read-single-notification/${id}`,
        method: "PATCH",
      }),
    }),
    markAllAsRead: builder.mutation({
      query: (employeeNumber) => ({
        url: `/notification/read-all-notification/${employeeNumber}`,
        method: "PATCH",
      }),
    }),
    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `/notification/delete-notification/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useDeleteNotificationMutation,
  useGetUserNotificationsQuery,
  useCreateNotificationMutation,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationApi;
