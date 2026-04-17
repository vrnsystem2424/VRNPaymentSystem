
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const schedulePaymentApi = createApi({
  reducerPath: 'schedulePaymentApi',

  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      // If you need auth token later, add here
      // const token = localStorage.getItem('token');
      // if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ['SchedulePayments', 'ProjectBankMapping'], // ← added new tag

  endpoints: (builder) => ({
    // GET all schedule payments
    getSchedulePayments: builder.query({
      query: () => '/api/payment/Schedule-Payment',
      providesTags: ['SchedulePayments'],
      transformResponse: (response) => response?.data || [],
    }),

    // POST - Update / Append payment schedule
    updateSchedulePayment: builder.mutation({
      query: (body) => ({
        url: '/api/payment/update-Schedule-payment',
        method: 'POST',
        body, // send all fields: paymentId, status, amountReceived, etc.
      }),
      invalidatesTags: ['SchedulePayments'], // auto-refetch list after update
    }),

    // ────────────────────────────────────────────────
    // NEW ENDPOINT: Get Project → Bank Account Mapping
    // Useful for dropdowns in payment forms
    // ────────────────────────────────────────────────
    getProjectBankMapping: builder.query({
      query: () => '/api/payment/project-bank-mapping',
      providesTags: ['ProjectBankMapping'],
      transformResponse: (response) => {
        if (!response?.success) return { list: [], map: {} };
        return {
          list: response.data || [],                    // array of { project, bankAccount }
          map: response.projectToBankMap || {},         // object: { "Ultimate Heights": "Ultimate Heights A/c", ... }
          count: response.count || 0
        };
      },
      // Optional: keepFresh / cache longer since this data changes very rarely
      keepUnusedDataFor: 3600, // 1 hour (in seconds)
    }),
  }),
});

export const {
  useGetSchedulePaymentsQuery,
  useUpdateSchedulePaymentMutation,
  useGetProjectBankMappingQuery,          // ← new hook added
} = schedulePaymentApi;


