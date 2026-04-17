import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const billEntryApi = createApi({
  reducerPath: "billEntryApi",
  baseQuery: fetchBaseQuery({
     baseUrl: BASE_URL, 
  }),
  tagTypes: ["PendingDimExpenses"],     // separate tag so it doesn't clash with others
  endpoints: (builder) => ({
    // GET — list of pending Dimension Office Payment entries
    // (PLANNED_4 has value, ACTUAL_4 is empty)
    getPendingDimExpenses: builder.query({
      query: () => "/api/office/Get-Expenses-Entry",
      providesTags: ["PendingDimExpenses"],
    }),

    // POST — update stage 4 (actual bill / payment entry) fields
    updateDimExpenseEntry: builder.mutation({
      query: (entryData) => ({
        url: "/api/office/Post-Expenses-Entry",
        method: "POST",
        body: entryData,
        // Expected fields (at minimum uid is required):
        // {
        //   uid: "OFFBILL123",
        //   STATUS_4:          "Paid" | "Rejected" | etc.
        //   Vendor_Name_4:     "ABC Suppliers",
        //   BILL_NO_4:         "INV/2025/456",
        //   BILL_DATE_4:       "2025-03-07",
        //   BASIC_AMOUNT_4:    24500,
        //   CGST_4:            2205,
        //   SGST_4:            2205,
        //   IGST_4:            0,
        //   TOTAL_AMOUNT_4:    28910,
        //   TRASNPORT_CHARGES_4: 1200,
        //   Transport_Gst_4:   216,
        //   NET_AMOUNT_4:      30326,
        //   Remark_4:          "Paid via bank transfer"
        // }
      }),
      invalidatesTags: ["PendingDimExpenses"],   // auto-refresh list after update
    }),
  }),
});

export const {
  useGetPendingDimExpensesQuery,
  useUpdateDimExpenseEntryMutation,
} = billEntryApi;