

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const mainSummaryApi = createApi({
  reducerPath: 'mainSummaryApi',

  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),

  tagTypes: ['BankSummary', 'BankBalance', 'Outstanding'],   // ← added new tag

  endpoints: (builder) => ({
    // ────────────────────────────────────────────────
    // Existing endpoints ...
    // ────────────────────────────────────────────────
    getMainBankSummary: builder.query({
      query: () => '/apiSummary/Summary-main',
      providesTags: ['BankSummary'],
      transformResponse: (response) => {
        if (response?.success) {
          return {
            inTotal: response.inTotal || null,
            outTotal: response.outTotal || null,
            netBalance: response.netBalance || null,
            transactions: response.transactions || [],
            totalTransactions: response.totalTransactions || 0,
            debug: response.debug || null,
            message: response.message || '',
          };
        }
        return {
          inTotal: null,
          outTotal: null,
          netBalance: null,
          transactions: [],
          totalTransactions: 0,
          message: response?.error || 'Failed to load bank summary',
        };
      },
    }),

    getBankBalances: builder.query({
      query: () => '/apiSummary/Bank-Balance',
      providesTags: ['BankBalance'],
      transformResponse: (response) => {
        if (response?.success) {
          return {
            balances: response.data || [],
            totalBanks: (response.data || []).length,
            message: response.message || '',
          };
        }
        return {
          balances: [],
          totalBanks: 0,
          message: response?.error || 'Failed to load bank balances',
        };
      },
    }),

    // ────────────────────────────────────────────────
    // NEW: Outstanding Bills / Pending Payments
    // ────────────────────────────────────────────────
    getOutstanding: builder.query({
      query: () => '/apiSummary/outStanding',          // ← match your route name
      providesTags: ['Outstanding'],

      transformResponse: (response) => {
        if (response?.success) {
          return {
            totalOutstanding : response.totalOutstanding  || "0.00",
            totalNetAmount   : response.totalNetAmount    || "0.00",
            totalPaidAmount  : response.totalPaidAmount   || "0.00",
            totalTransactions: response.totalTransactions || 0,
            transactions     : response.transactions      || [],
            message          : response.message           || '',
            // optional debug
            debug            : response.debug             || null,
          };
        }

        return {
          totalOutstanding : "0.00",
          totalNetAmount   : "0.00",
          totalPaidAmount  : "0.00",
          totalTransactions: 0,
          transactions     : [],
          message          : response?.error || 'Failed to load outstanding data',
        };
      },
    }),
  }),
});

// Auto-generated hooks
export const {
  useGetMainBankSummaryQuery,
  useLazyGetMainBankSummaryQuery,
  useGetBankBalancesQuery,
  useLazyGetBankBalancesQuery,
  useGetOutstandingQuery,           // ← new
  useLazyGetOutstandingQuery,       // ← new (if you need manual trigger)
} = mainSummaryApi;

export default mainSummaryApi;