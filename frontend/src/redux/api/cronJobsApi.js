import { apiSlice } from '../slices/apiSlice';

export const cronJobsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Create a new cron job configuration
        createCronJob: builder.mutation({
            query: (data) => ({
                url: `/cronjobs/create`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["CronJobs"],
        }),

        // Get cron job configuration for a company
        getCronJob: builder.query({
            query: (companyId) => ({
                url: `/cronjobs?companyId=${companyId}`,
                method: "GET",
            }),
            providesTags: ["CronJobs"],
        }),

        // Get all cron jobs (super admin)
        getAllCronJobs: builder.query({
            query: ({ page = 1, limit = 10 } = {}) => ({
                url: `/cronjobs/all?page=${page}&limit=${limit}`,
                method: "GET",
            }),
            providesTags: ["CronJobs"],
        }),

        // Update cron job by ID
        updateCronJob: builder.mutation({
            query: ({ cronJobId, ...data }) => ({
                url: `/cronjobs/${cronJobId}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["CronJobs"],
        }),

        // Update cron job by company ID (simpler for frontend)
        updateCronJobByCompany: builder.mutation({
            query: ({ companyId, ...data }) => ({
                url: `/cronjobs/company/${companyId}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["CronJobs"],
        }),

        // Toggle specific feature (enable/disable)
        toggleCronJobFeature: builder.mutation({
            query: ({ companyId, feature, enabled, updatedBy }) => ({
                url: `/cronjobs/company/${companyId}/toggle`,
                method: "PUT",
                body: { feature, enabled, updatedBy },
            }),
            invalidatesTags: ["CronJobs"],
        }),

        // Delete cron job configuration
        deleteCronJob: builder.mutation({
            query: ({ cronJobId, deletedBy }) => ({
                url: `/cronjobs/${cronJobId}`,
                method: "DELETE",
                body: { deletedBy },
            }),
            invalidatesTags: ["CronJobs"],
        }),
    }),
});

export const {
    useCreateCronJobMutation,
    useGetCronJobQuery,
    useGetAllCronJobsQuery,
    useUpdateCronJobMutation,
    useUpdateCronJobByCompanyMutation,
    useToggleCronJobFeatureMutation,
    useDeleteCronJobMutation
} = cronJobsApi;