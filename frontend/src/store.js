// src/app/store.js

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/Auth/LoginSlice';
import { schedulePaymentApi } from '../src/features/SchedulePayment/SchedulePaymentSlice';   
import { PaymentSlice } from './features/SchedulePayment/PaymentSlice';
import { FormSlice } from './features/SchedulePayment/FormSlice';
import { ActualBankInSlice } from './features/SchedulePayment/Actual_Bank_In_Slice';
import { bankTransferApiSlice } from './features/SchedulePayment/bank_to_bank_transfer_slice';



// import {summaryApi} from '../src/features/LeadsSummary/SummarySlice'
import {approve1Api} from './features/OfficeExpense/approve1Slice'
import {billEntryApi} from './features/OfficeExpense/BillEntry'
import {dimPaymentApi} from './features/OfficeExpense/paymentSlice'


export const store = configureStore({
  reducer: {
    auth: authReducer,

    // RTK Query reducers
    [schedulePaymentApi.reducerPath]: schedulePaymentApi.reducer,
    [FormSlice.reducerPath]: FormSlice.reducer,
    [PaymentSlice.reducerPath]: PaymentSlice.reducer,
    [ActualBankInSlice.reducerPath]: ActualBankInSlice.reducer,
    [bankTransferApiSlice.reducerPath]: bankTransferApiSlice.reducer,

    
    [approve1Api.reducerPath]: approve1Api.reducer,
    [billEntryApi.reducerPath]: billEntryApi.reducer,
    [dimPaymentApi.reducerPath]: dimPaymentApi.reducer,
    // [summaryApi.reducerPath]: summaryApi.reducer,

   
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    })
      .concat(schedulePaymentApi.middleware)
      .concat(PaymentSlice.middleware)
      .concat(FormSlice.middleware)
      .concat(ActualBankInSlice.middleware)
      .concat(bankTransferApiSlice.middleware)

      .concat(approve1Api.middleware)
      .concat(billEntryApi.middleware)
      .concat(dimPaymentApi.middleware)
      // .concat(summaryApi.middleware)
      
});

export default store;