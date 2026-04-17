// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// export const summaryApi = createApi({
//   reducerPath: 'summaryApi',

//   baseQuery: fetchBaseQuery({
//     baseUrl: BASE_URL,
//     prepareHeaders: (headers) => {
//       // Auth token chahiye toh yahan add karo
//       // const token = localStorage.getItem('token');
//       // if (token) headers.set('Authorization', `Bearer ${token}`);
//       return headers;
//     },
//   }),

//   tagTypes: ['Summary'],

//   endpoints: (builder) => ({

//     // GET - Summary data fetch karo
//     getSummary: builder.query({
//       query: () => '/api/summary',
//       providesTags: ['Summary'],
//       transformResponse: (response) => response || {},
//     }),

//   }),
// });

// export const {
//   useGetSummaryQuery,
// } = summaryApi;