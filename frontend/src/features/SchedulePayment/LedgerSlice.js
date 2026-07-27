// src/features/SchedulePayment/LedgerSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const ledgerApi = createApi({
  reducerPath: 'ledgerApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ['Ledger'],
  endpoints: (builder) => ({

    // Search bookings for autocomplete
    searchLedger: builder.query({
      query: (searchQuery = '') =>
        `/api/payment/ledger-search?query=${encodeURIComponent(searchQuery)}`,
      transformResponse: (response) => (response?.success ? response.data : []),
    }),

    // Get full ledger data for one booking
    getLedgerData: builder.query({
      query: (bookingId) =>
        `/api/payment/ledger-data/${encodeURIComponent(bookingId)}`,
      transformResponse: (response) => (response?.success ? response.data : null),
    }),

  }),
});

export const {
  useSearchLedgerQuery,
  useLazySearchLedgerQuery,
  useGetLedgerDataQuery,
  useLazyGetLedgerDataQuery,
} = ledgerApi;

export default ledgerApi;