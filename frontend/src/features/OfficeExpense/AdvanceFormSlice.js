import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const advanceFormApi = createApi({
  reducerPath: "advanceFormApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["AdvanceDropdown", "AdvancePayment"],
  endpoints: (builder) => ({

    // ✅ GET - Dropdown data (Bank, Project, Vendor names)
    getAdvanceDropdown: builder.query({
      query: () => "/api/office/Get-Advance-Dropdown",
      transformResponse: (response) => {
        if (response?.success && response?.type === "dropdown") {
          return {
            bankNames:    response.data.bankNames    || [],
            projectNames: response.data.projectNames || [],
            vendorNames:  response.data.vendorNames  || [],
            counts:       response.counts            || {},
          };
        }
        return {
          bankNames: [],
          projectNames: [],
          vendorNames: [],
          counts: {},
        };
      },
      providesTags: ["AdvanceDropdown"],
    }),

    // ✅ POST - Add new advance payment
    addAdvancePayment: builder.mutation({
      query: (formData) => ({
        url: "/api/office/Post-Advance-Payment",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["AdvanceDropdown"],
    }),

  }),
});

export const {
  useGetAdvanceDropdownQuery,
  useAddAdvancePaymentMutation,
} = advanceFormApi;