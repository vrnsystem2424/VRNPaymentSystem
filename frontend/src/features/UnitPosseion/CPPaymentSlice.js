import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const cpPaymentApi = createApi({
  reducerPath: "cpPaymentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["CPPayment"],
  endpoints: (builder) => ({

    // GET - Sabhi Pending records (AD column = pending)
    getAllCPPayments: builder.query({
      query: () => "/api/UnitPosseionFMS/CPPayment",
      providesTags: ["CPPayment"],
    }),

    // GET - Single record by ID
    getCPPaymentById: builder.query({
      query: (id) => `/api/UnitPosseionFMS/CPPayment/${id}`,
      providesTags: ["CPPayment"],
    }),

    // POST - Update record
    // Sheet cols: AD=Status, AE=TimeDelay(preserved),
    // AF=CPName, AG=Contact, AH=Amount, AI=Percent,
    // AJ=UploadDoc, AK=Photo, AL=Remarks
    updateCPPayment: builder.mutation({
      query: ({
        id,
        status,
        channelPartnerName,
        contact,
        amountToBePaid,
        percentOfBasicPrice,
        remarks,
        documentUrl,
        photoUrl,
        documents,
      }) => {
        const formData = new FormData();

        formData.append("id", id);

        if (status)              formData.append("Status", status);
        if (channelPartnerName)  formData.append("Channel_Partner_Name", channelPartnerName);
        if (contact)             formData.append("Contact", contact);
        if (amountToBePaid)      formData.append("Amount_to_be_Paid", amountToBePaid);
        if (percentOfBasicPrice) formData.append("Percent_of_Basic_Price", percentOfBasicPrice);
        if (remarks)             formData.append("Remarks", remarks);
        if (documentUrl)         formData.append("Upload_Douc", documentUrl);
        if (photoUrl)            formData.append("Photo", photoUrl);

        // Multiple files - max 10
        // PDF/Word -> AJ (Upload_Douc), Images -> AK (Photo)
        if (documents && documents.length > 0) {
          documents.forEach((file) => formData.append("documents", file));
        }

        return {
          url: "/api/UnitPosseionFMS/CPPayment",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["CPPayment"],
    }),

  }),
});

export const {
  useGetAllCPPaymentsQuery,
  useGetCPPaymentByIdQuery,
  useUpdateCPPaymentMutation,
} = cpPaymentApi;