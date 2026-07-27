


// src/features/Actual_Bank_In_Slice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export const ActualBankInSlice = createApi({
  reducerPath: 'actualBankInApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
  }),
  tagTypes: ['ActualBankIn'],
  endpoints: (builder) => ({

    // ── GET: Pending Entries ─────────────────────────────────────────────
    getPendingActualBankIn: builder.query({
      query: () => '/api/payment/GET-Actual-Bank-In',
      providesTags: ['ActualBankIn'],
      transformResponse: (response) => {
        return response.success ? response.data : [];
      },
    }),

    // ── POST: Update with paymentDate ────────────────────────────────────
    updateActualBankIn: builder.mutation({
      query: ({ UID, status, remark, paymentDate }) => ({
        url:    '/api/payment/update-Actual-Bank-In',
        method: 'POST',
        body: {
          UID,
          status,
          remark,
          paymentDate,   // ✅ NEW - T column
        },
      }),
      invalidatesTags: ['ActualBankIn'],
    }),

  }),
});

export const {
  useGetPendingActualBankInQuery,
  useUpdateActualBankInMutation,
} = ActualBankInSlice;

export default ActualBankInSlice;