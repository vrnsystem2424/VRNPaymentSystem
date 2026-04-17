import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const FormSlice = createApi({
  reducerPath: 'formApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BACKEND_URL,
  }),

  tagTypes: ['BankTransfer', 'CapitalMovement', 'Dropdown'],

  endpoints: (builder) => ({

    // 1. Bank Transfer Form Submit
    submitBankTransfer: builder.mutation({
      query: (transferData) => ({
        url: '/api/payment/Bank_Transfer_form',
        method: 'POST',
        body: transferData,
      }),
      invalidatesTags: ['BankTransfer'],
    }),

    // 2. Capital Movement Form Submit
    submitCapitalMovement: builder.mutation({
      query: (capitalData) => ({
        url: '/api/payment/Captial-A/C',
        method: 'POST',
        body: capitalData,
      }),
      invalidatesTags: ['CapitalMovement'],
    }),

    // 3. Dropdown Data
    getDropdownData: builder.query({
      query: () => '/api/payment/Dropdown-Data',
      transformResponse: (response) => {
        if (response.success) {
          return {
            accounts: response.accounts || [],
            capitalMovements: response.capitalMovements || [],
          };
        }
        return { accounts: [], capitalMovements: [] };
      },
      keepUnusedDataFor: 60 * 60,
      providesTags: ['Dropdown'],
    }),

  }),
});

export const {
  useSubmitBankTransferMutation,
  useSubmitCapitalMovementMutation,
  useGetDropdownDataQuery,
} = FormSlice;

export default FormSlice;