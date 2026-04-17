// src/features/Actual_Bank_In_Slice.js

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Backend base URL .env se le rahe hain (VITE ke saath)
const baseUrl = import.meta.env.VITE_BACKEND_URL;

export const ActualBankInSlice = createApi({
  reducerPath: 'actualBankInApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    // Agar future mein auth token add karna ho to yahan kar sakte ho
    // prepareHeaders: (headers) => {
    //   const token = localStorage.getItem('token');
    //   if (token) headers.set('Authorization', `Bearer ${token}`);
    //   return headers;
    // },
  }),
  tagTypes: ['ActualBankIn'], // Cache invalidate ke liye
  endpoints: (builder) => ({
    // GET: Pending Actual Bank In entries (jo planned hai lekin actual nahi)
    getPendingActualBankIn: builder.query({
      query: () => '/api/payment/GET-Actual-Bank-In',
      providesTags: ['ActualBankIn'],
      transformResponse: (response) => {
        return response.success ? response.data : [];
      },
    }),

    // POST: Actual Bank In update (status + remark)
    updateActualBankIn: builder.mutation({
      query: ({ UID, status, remark }) => ({
        url: '/api/payment/update-Actual-Bank-In',
        method: 'POST',
        body: { UID, status, remark },
      }),
      invalidatesTags: ['ActualBankIn'], // Update ke baad list auto-refresh ho jayegi
    }),
  }),
});

// Exported hooks – component mein directly use karo
export const {
  useGetPendingActualBankInQuery,
  useUpdateActualBankInMutation,
} = ActualBankInSlice;

// Reducer export (store mein add karne ke liye)
export default ActualBankInSlice;