import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// VITE project mein .env se base URL (VITE_ prefix compulsory)
const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const bankTransferApiSlice = createApi({
  reducerPath: 'bankTransferApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Transfers'], // Ab sirf Transfers tag ki zarurat hai
  endpoints: (builder) => ({
    // 1. Pending Transfers List
    getPendingTransfers: builder.query({
      query: () => '/api/payment/GET-Actual-Transfer-In-Out',
      providesTags: ['Transfers'],
      transformResponse: (response) => {
        return response.success ? response.data : [];
      },
    }),

    // 2. Update Actual Bank Status & Remark
    updateActualBankTransfer: builder.mutation({
      query: ({ UID, status, remark }) => ({
        url: '/api/payment/update-Actual-bank-To-bank',
        method: 'POST',
        body: { UID, status, remark },
      }),
      invalidatesTags: ['Transfers'],
    }),
  }),
});

// Exported hooks
export const {
  useGetPendingTransfersQuery,
  useUpdateActualBankTransferMutation,
} = bankTransferApiSlice;

// Reducer export for store
export default bankTransferApiSlice;