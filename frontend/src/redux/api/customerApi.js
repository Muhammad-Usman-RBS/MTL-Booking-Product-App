import { apiSlice } from "../apiSlice";

export const customerApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createCustomer: builder.mutation({
            query: (formData) => ({
                url: "/customer/create-customer",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: ['CustomerList'],
        }),
        getCustomers: builder.query({
            query: () => ({
                url: "/customer/customers",
                method: "GET",
            }),
            providesTags: ['CustomerList'],
        }),
        getCustomer: builder.query({
            query: (id) => ({
                url: `/customer/customer/${id}`,
                method: "GET",
            }),
        }),
        updateCustomer: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/customer/customer/${id}`,
                method: "PUT",
                body: formData,
            }),
            invalidatesTags: ['CustomerList'],
        }),
        deleteCustomer: builder.mutation({
            query: (id) => ({
                url: `/customer/customer/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ['CustomerList'],
        }),
    }),
});

export const {
    useCreateCustomerMutation,
    useGetCustomersQuery,
    useGetCustomerQuery,
    useUpdateCustomerMutation,
    useDeleteCustomerMutation,
} = customerApi;
