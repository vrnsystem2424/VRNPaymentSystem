
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

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
  tagTypes: ['Transfers'],
  endpoints: (builder) => ({

    // ── GET: Pending Transfers ──────────────────────────────────────────
    getPendingTransfers: builder.query({
      query: () => '/api/payment/GET-Actual-Transfer-In-Out',
      providesTags: ['Transfers'],
      transformResponse: (response) => {
        return response.success ? response.data : [];
      },
    }),

    // ── POST: Update with paymentDate ───────────────────────────────────
    updateActualBankTransfer: builder.mutation({
      query: ({ UID, status, remark, paymentDate }) => ({
        url:    '/api/payment/update-Actual-bank-To-bank',
        method: 'POST',
        body: {
          UID,
          status,
          remark,
          paymentDate,   // ✅ NEW - Q column
        },
      }),
      invalidatesTags: ['Transfers'],
    }),

  }),
});

export const {
  useGetPendingTransfersQuery,
  useUpdateActualBankTransferMutation,
} = bankTransferApiSlice;

export default bankTransferApiSlice;