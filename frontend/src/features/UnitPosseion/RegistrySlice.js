import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const registryApi = createApi({
  reducerPath: "registryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["Registry"],
  endpoints: (builder) => ({

    // GET - Sabhi Pending records (U column = pending)
    getAllRegistry: builder.query({
      query: () => "/api/UnitPosseionFMS/Registry",
      providesTags: ["Registry"],
    }),

    // GET - Single record by ID
    getRegistryById: builder.query({
      query: (id) => `/api/UnitPosseionFMS/Registry/${id}`,
      providesTags: ["Registry"],
    }),

    // POST - Update record (Status, Remarks, File Upload)
    // Sheet columns: U=Status, V=Upload_Document_Copy, W=Remarks
    updateRegistry: builder.mutation({
      query: ({ id, status, remarks, documentUrl, documents }) => {
        const formData = new FormData();

        formData.append("id", id);

        if (status)      formData.append("Status", status);
        if (remarks)     formData.append("Remarks", remarks);
        if (documentUrl) formData.append("Upload_Document_Copy", documentUrl);

        if (documents && documents.length > 0) {
          documents.forEach((file) => formData.append("documents", file));
        }

        return {
          url: "/api/UnitPosseionFMS/Registry",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Registry"],
    }),

  }),
});

export const {
  useGetAllRegistryQuery,
  useGetRegistryByIdQuery,
  useUpdateRegistryMutation,
} = registryApi;