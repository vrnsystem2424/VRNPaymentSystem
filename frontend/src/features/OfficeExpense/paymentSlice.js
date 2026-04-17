
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';


export const dimPaymentApi = createApi({
  reducerPath: "dimPaymentApi",
  baseQuery: fetchBaseQuery({
   baseUrl: BASE_URL,       // ← yaha use karo
  }),
  tagTypes: ["PendingDimPayments"],
  endpoints: (builder) => ({
    getPendingDimPayments: builder.query({
      query: () => "/api/office/Get-Payment",
      providesTags: ["PendingDimPayments"],
    }),
    updateDimPayment: builder.mutation({
      query: (paymentData) => ({
        url: "/api/office/Post-Payment",
        method: "POST",
        body: paymentData,
      }),
      invalidatesTags: ["PendingDimPayments"],
    }),
  }),
});

export const {
  useGetPendingDimPaymentsQuery,
  useUpdateDimPaymentMutation,
} = dimPaymentApi;