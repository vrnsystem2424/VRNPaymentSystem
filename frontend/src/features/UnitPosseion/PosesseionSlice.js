import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const posesseionApi = createApi({
  reducerPath: "posesseionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["Posesseion"],
  endpoints: (builder) => ({

    // GET - Sabhi Pending records (Y column = pending)
    getAllPosesseions: builder.query({
      query: () => "/api/UnitPosseionFMS/Posesseion",
      providesTags: ["Posesseion"],
    }),

    // GET - Single record by ID
    getPosesseionById: builder.query({
      query: (id) => `/api/UnitPosseionFMS/Posesseion/${id}`,
      providesTags: ["Posesseion"],
    }),

    // POST - Update record (Status, Remarks, File Upload)
    // Sheet columns: Y=Status, Z=Upload_Document_Copy, AA=Remarks
    updatePosesseion: builder.mutation({
      query: ({ id, status, remarks, documentUrl, documents }) => {
        const formData = new FormData();

        formData.append("id", id);

        if (status)      formData.append("Status", status);
        if (remarks)     formData.append("Remarks", remarks);
        if (documentUrl) formData.append("Upload_Document_Copy", documentUrl);

        // Multiple files - max 10
        if (documents && documents.length > 0) {
          documents.forEach((file) => formData.append("documents", file));
        }

        return {
          url: "/api/UnitPosseionFMS/Posesseion",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Posesseion"],
    }),

  }),
});

export const {
  useGetAllPosesseionsQuery,
  useGetPosesseionByIdQuery,
  useUpdatePosesseionMutation,
} = posesseionApi;