import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const approve1Api = createApi({
  reducerPath: "approve1Api",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,  // ✅ Correct - lowercase 'u'
  }),
  tagTypes: ["PendingApprovals"],
  endpoints: (builder) => ({
    // GET pending items for approval
    getPendingApprovals: builder.query({
      query: () => "/api/office/Get-Approvel-1",
      providesTags: ["PendingApprovals"],
    }),

    // POST - approve / update one record
    updateApproval: builder.mutation({
      query: (approvalData) => ({
        url: "/api/office/Post-Approvel-1",
        method: "POST",
        body: approvalData,
      }),
      invalidatesTags: ["PendingApprovals"],
    }),
  }),
});

export const {
  useGetPendingApprovalsQuery,
  useUpdateApprovalMutation,
} = approve1Api;