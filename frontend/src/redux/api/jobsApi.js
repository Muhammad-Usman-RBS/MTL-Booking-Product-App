import { apiSlice } from '../slices/apiSlice';

export const jobsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // ✅ Create a new job (admin assigns to driver)
        createJob: builder.mutation({
            query: (data) => ({
                url: `/jobs/create-job`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Jobs"],
        }),

        // ✅ Get all jobs for a company (admin panel)
        getAllJobs: builder.query({
            query: (companyId) => ({
                url: `/jobs/all-jobs?companyId=${companyId}`,
                method: "GET",
            }),
            providesTags: ["Jobs"],
        }),

        // ✅ Get jobs assigned to a specific driver (driver portal)
        getDriverJobs: builder.query({
            query: ({ companyId, driverId }) => ({
                url: `/jobs/driver-jobs?companyId=${companyId}&driverId=${driverId}`,
                method: "GET",
            }),
            providesTags: ["Jobs"],
        }),

        // ✅ Update job status (driver actions)
        updateJobStatus: builder.mutation({
            query: ({ jobId, jobStatus }) => ({
             url: `/jobs/${jobId}`,
                method: "PUT",
                body: { jobStatus },
            }),
            invalidatesTags: ["Jobs"],
        }),
    }),
});

export const {
    useCreateJobMutation,
    useGetAllJobsQuery,
    useGetDriverJobsQuery,
    useUpdateJobStatusMutation,
} = jobsApi;
