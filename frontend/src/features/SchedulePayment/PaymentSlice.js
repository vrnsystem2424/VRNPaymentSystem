
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const PaymentSlice = createApi({
  reducerPath: 'paymentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BACKEND_URL,
  }),
  tagTypes: ['ReconciliationData', 'BankBalance'], 
  endpoints: (builder) => ({
    getPaymentReconciliation: builder.query({
      query: () => '/api/payment/payment-Reconsilation',
      transformResponse: (response) => response.data || [],
      providesTags: ['ReconciliationData'],
    }),

    getBankClosingBalance: builder.query({
      query: (bankName) => `/api/payment/bank-balance/${encodeURIComponent(bankName)}`,
      providesTags: (result, error, bankName) => [
        { type: 'BankBalance', id: bankName },
      ],
    }),

    updateReconciliation: builder.mutation({
      query: ({ paymentDetails,bankDetails, bankClosingBalanceAfterPayment, status, remark }) => ({
        url: '/api/payment/update-reconciliation',
        method: 'POST',
        body: { paymentDetails,bankDetails, bankClosingBalanceAfterPayment, status, remark },
      }),
      invalidatesTags: ['ReconciliationData'],
    }),
  }),
});

export const {
  useGetPaymentReconciliationQuery,
  useGetBankClosingBalanceQuery,
  useLazyGetBankClosingBalanceQuery, // ← Yeh naya export add kiya (lazy ke liye)
  useUpdateReconciliationMutation,
} = PaymentSlice;



