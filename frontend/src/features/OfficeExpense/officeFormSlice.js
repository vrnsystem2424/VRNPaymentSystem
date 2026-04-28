

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const officeFormApi = createApi({
  reducerPath: "officeFormApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["FormData", "PaymentSubmission", "ProjectNames"], // ✅ ProjectNames tag add kiya
  endpoints: (builder) => ({

    // ✅ getAllFormData - OfficeForm.jsx use kar raha hai
    getAllFormData: builder.query({
      query: () => "/api/office/Dropdown-Data?action=all-data",
      transformResponse: (response) => {
        if (response?.type === "all-data") {
          const subheadsList = [];
          const itemsMap = {};
          const formRaisedMap = {};
          const projectNameMap = {}; // ✅ projectName map add kiya

          response.data.forEach((subheadData) => {
            subheadsList.push(subheadData.subhead);
            itemsMap[subheadData.subhead] = subheadData.items;
            formRaisedMap[subheadData.subhead] = subheadData.formRaised;

            // ✅ Har subhead ke items se projectName collect karo
            projectNameMap[subheadData.subhead] = [
              ...new Set(
                subheadData.items
                  .map((item) => item.projectName)
                  .filter(Boolean)
              ),
            ];
          });

          return {
            subheads: subheadsList,
            items: itemsMap,
            formRaised: formRaisedMap,
            projectNames: projectNameMap, // ✅ subhead wise projectNames
            rawData: response.data,
          };
        }

        return {
          subheads: [],
          items: {},
          formRaised: {},
          projectNames: {}, // ✅
          rawData: [],
        };
      },
      providesTags: ["FormData"],
    }),

    // ✅ NEW - Sirf Project Names fetch karo (L column)
    getProjectNames: builder.query({
      query: () => "/api/office/Dropdown-Data?getProjectName=true",
      transformResponse: (response) => {
        if (response?.type === "projectName") {
          return response.data; // ✅ ["Project A", "Project B", ...]
        }
        return [];
      },
      providesTags: ["ProjectNames"],
    }),

    // ✅ submitPayment - OfficeForm.jsx use kar raha hai
    submitPayment: builder.mutation({
      query: (formData) => ({
        url: "/api/office/post-form-data",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["PaymentSubmission"],
    }),

  }),
});

// ✅ Export - sab hooks export karo
export const {
  useGetAllFormDataQuery,
  useGetProjectNamesQuery,  // ✅ naya hook
  useSubmitPaymentMutation,
} = officeFormApi;