
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const approve1Api = createApi({
  reducerPath: "approve1Api",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["PendingApprovals"],
  endpoints: (builder) => ({
    
    // ── GET pending items ──────────────────────────────────
    getPendingApprovals: builder.query({
      query: () => "/api/office/Get-Approvel-1",
      providesTags: ["PendingApprovals"],
    }),

    // ── POST single record (purana - agar kahi use ho) ────
    updateApproval: builder.mutation({
      query: (approvalData) => ({
        url: "/api/office/Post-Approvel-1",
        method: "POST",
        body: approvalData,
      }),
      invalidatesTags: ["PendingApprovals"],
    }),

    // ── POST bulk records (naya) ───────────────────────────
    // Body: { uids[], STATUS_2, PAYMENT_MODE_3, REMARK_2 }
    bulkUpdateApproval: builder.mutation({
      query: (bulkData) => ({
        url: "/api/office/Post-Approvel-1-Bulk",
        method: "POST",
        body: bulkData,
      }),
      invalidatesTags: ["PendingApprovals"],
    }),

  }),
});

export const {
  useGetPendingApprovalsQuery,
  useUpdateApprovalMutation,
  useBulkUpdateApprovalMutation,  // ✅ naya export
} = approve1Api;