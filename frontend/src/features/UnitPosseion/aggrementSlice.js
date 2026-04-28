// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// export const aggrementApi = createApi({
//   reducerPath: "aggrementApi",
//   baseQuery: fetchBaseQuery({
//     baseUrl: BASE_URL,
//   }),
//   tagTypes: ["Aggrement"],
//   endpoints: (builder) => ({

//     // ✅ GET - Sabhi Pending records fetch karo
//     getAllAggrements: builder.query({
//       query: () => "/api/UnitPosseionFMS/Aggerement",
//       providesTags: ["Aggrement"],
//     }),

//     // ✅ GET - Single record by ID
//     getAggrementById: builder.query({
//       query: (id) => `/api/UnitPosseionFMS/Aggerement${id}`,
//       providesTags: ["Aggrement"],
//     }),

//     // ✅ POST - Update record (Status, Remarks, File Upload)
//     updateAggrement: builder.mutation({
//       query: ({ id, status, remarks, documentUrl, documents }) => {
//         const formData = new FormData();

//         formData.append("id", id);

//         if (status)      formData.append("Status", status);
//         if (remarks)     formData.append("Remarks", remarks);
//         if (documentUrl) formData.append("Upload_Document_Copy", documentUrl);

//         // Multiple files append
//         if (documents && documents.length > 0) {
//           documents.forEach((file) => {
//             formData.append("documents", file);
//           });
//         }

//         return {
//           url: "/api/UnitPosseionFMS/Aggerement",
//           method: "POST",
//           body: formData,
//         };
//       },
//       invalidatesTags: ["Aggrement"],
//     }),

//   }),
// });

// export const {
//   useGetAllAggrémentsQuery,
//   useGetAggrementByIdQuery,
//   useUpdateAggrementMutation,
// } = aggrementApi;





import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const aggrementApi = createApi({
  reducerPath: "aggrementApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["Aggrement"],
  endpoints: (builder) => ({

    getAllAggrements: builder.query({
      query: () => "/api/UnitPosseionFMS/Aggerement",
      providesTags: ["Aggrement"],
    }),

    getAggrementById: builder.query({
      query: (id) => `/api/UnitPosseionFMS/Aggerement/${id}`,
      providesTags: ["Aggrement"],
    }),

    updateAggrement: builder.mutation({
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
          url: "/api/UnitPosseionFMS/Aggerement",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Aggrement"],
    }),

  }),
});

export const {
  useGetAllAggrementsQuery,
  useGetAggrementByIdQuery,
  useUpdateAggrementMutation,
} = aggrementApi;