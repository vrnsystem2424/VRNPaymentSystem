
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import Summary from "./components/paymentSummary/Summary";
import SchedulePayment from "./components/Payment/SchedulePayment";
import Reconciliation from "./components/Payment/Reconciliation";
import Actual_Payment_in from "./components/Payment/Actual_Payment_in";
import Transfer_bank_To_bank from "./components/Payment/Transfer_bank_To_bank";
import Form from "./components/Payment/Form";
import Approvel1 from "./components/OfficeExpenses/Approvel1";
import BillEntry from "./components/OfficeExpenses/BillEntry";
import ExpensesPayemnt from "./components/OfficeExpenses/ExpensesPayemnt";
import OfficeForm from './components/OfficeExpenses/OfficeForm';


////// Posseion CP

import Agreement from "./components/Posseion/Agreement";
import Registry from "./components/Posseion/Registry";
import ChannelPartnerPayment from "./components/Posseion/ChannelPartnerPayment";
import PossessionEntry from "./components/Posseion/PossessionEntry";



const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  return token ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Login Page */}
        <Route path="/" element={<Login />} />

        {/* ✅ OfficeForm - Login ke bina accessible (dashboard ke bahar) */}
        <Route path="/OfficeForm" element={<OfficeForm />} />

        {/* Protected Dashboard with Nested Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route path="summary" element={<Summary />} />
          <Route path="SchedulePayment" element={<SchedulePayment />} />
          <Route path="reconciliation" element={<Reconciliation />} />
          <Route path="actual-payment-in" element={<Actual_Payment_in />} />
          <Route
            path="transfer-bank-to-bank"
            element={<Transfer_bank_To_bank />}
          />
          <Route path="form" element={<Form />} />
          <Route path="Approvel1" element={<Approvel1 />} />
          <Route path="BillEntry" element={<BillEntry />} />
          <Route path="ExpensesPayment" element={<ExpensesPayemnt />} />

          {/* ✅ Dashboard ke andar bhi rakhna ho to */}
          <Route path="OfficeForm" element={<OfficeForm />} />


        ////////  Posseion CP Section  //////

        <Route path="agreement" element={<Agreement/>}/>
        <Route path="registry" element={<Registry/>}/>
        <Route path="possession-entry" element={<PossessionEntry/>}/>
        <Route path="channel-partner-payment" element={<ChannelPartnerPayment/>}/>

        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;