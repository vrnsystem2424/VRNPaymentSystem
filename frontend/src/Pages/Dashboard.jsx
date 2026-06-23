

// // Dashboard.jsx
// import React, { useState, useEffect, useRef } from "react";
// import { BarChart3, DollarSign, LogOut, Menu, X, ChevronDown, Building2, KeyRound } from "lucide-react";
// import { useNavigate, useLocation, Outlet } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { logout } from "../features/Auth/LoginSlice";

// const Dashboard = () => {
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);
//   const [isMobilePaymentDropdownOpen, setIsMobilePaymentDropdownOpen] = useState(false);
//   const [isOfficeDropdownOpen, setIsOfficeDropdownOpen] = useState(false);
//   const [isMobileOfficeDropdownOpen, setIsMobileOfficeDropdownOpen] = useState(false);
//   const [isPossessionDropdownOpen, setIsPossessionDropdownOpen] = useState(false);
//   const [isMobilePossessionDropdownOpen, setIsMobilePossessionDropdownOpen] = useState(false);

//   const dropdownRef = useRef(null);
//   const officeDropdownRef = useRef(null);
//   const possessionDropdownRef = useRef(null);

//   const { token, userType } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const currentUserType = (userType || "").trim().toUpperCase();

//   // === PERMISSION BASED VISIBILITY ===
//   const isAdmin = currentUserType === "ADMIN";
//   const isCRM = currentUserType === "CRM";
//   const isAccounts = currentUserType === "ACCOUNTS";
//   const isFinance = currentUserType === "PAYMENT";
//   const isVRN = currentUserType === "VRN";

//   // Summary
//   const canSeeSummary = isAdmin || isVRN;

//   // Payment Dropdown
//   const canSeePayment = isAdmin || isCRM || isAccounts || isFinance || isVRN;

//   // Office Dropdown
//   const canSeeOffice = isAdmin || isAccounts || isFinance || isVRN;

//   // Individual Menu Items Permissions
//   const canSeeSchedulePayment = isAdmin || isCRM || isAccounts || isFinance || isVRN;
//   const canSeeReconciliation = isAdmin || isFinance || isAccounts;
//   const canSeeActualPaymentIn = isAdmin || isFinance || isAccounts;
//   const canSeeTransferBankToBank = isAdmin || isFinance;
//   const canSeePaymentForm = isAdmin || isFinance;

//   // ✅ NEW - Bank Charges & Interest Permission
//   const canSeeBankChargesInterest = isAdmin || isFinance || isAccounts;

//   const canSeeApprovel = isAdmin || isVRN;
//   const canSeeBillEntry = isAdmin || isAccounts || isFinance;
//   const canSeeExpensesPayment = isAdmin || isAccounts || isFinance;

//   // Possession Permissions
//   const canSeePossession = isAdmin || isCRM;
//   const canSeeAgreement = isAdmin || isCRM;
//   const canSeeRegistry = isAdmin || isCRM;
//   const canSeePossessionEntry = isAdmin || isCRM;
//   const canSeeChannelPartnerPayment = isAdmin || isCRM;

//   // Active state for highlighting
//   const [isSummarySelected, setIsSummarySelected] = useState(false);
//   const [isPaymentSelected, setIsPaymentSelected] = useState(false);
//   const [isOfficeSelected, setIsOfficeSelected] = useState(false);
//   const [isPossessionSelected, setIsPossessionSelected] = useState(false);

//   // Redirect Logic on Dashboard load
//   useEffect(() => {
//     if (!token) {
//       navigate("/");
//       return;
//     }

//     if (location.pathname === "/dashboard" || location.pathname === "/dashboard/") {
//       if (canSeeSummary) {
//         navigate("/dashboard/summary", { replace: true });
//       } else if (canSeePayment) {
//         navigate("/dashboard/SchedulePayment", { replace: true });
//       } else if (canSeeOffice) {
//         navigate("/dashboard/BillEntry", { replace: true });
//       } else if (canSeePossession) {
//         navigate("/dashboard/agreement", { replace: true });
//       } else {
//         navigate("/", { replace: true });
//       }
//     }
//   }, [token, location.pathname, navigate, canSeeSummary, canSeePayment, canSeeOffice, canSeePossession]);

//   // Active menu highlight logic
//   useEffect(() => {
//     const path = location.pathname;

//     setIsSummarySelected(path === "/dashboard/summary");

//     setIsPaymentSelected(
//       path.startsWith("/dashboard/SchedulePayment") ||
//       path.startsWith("/dashboard/Reconciliation") ||
//       path.startsWith("/dashboard/actual-payment-in") ||
//       path.startsWith("/dashboard/transfer-bank-to-bank") ||
//       path.startsWith("/dashboard/form") ||
//       path.startsWith("/dashboard/bankchargesinterest") // ✅ NEW
//     );

//     setIsOfficeSelected(
//       path.startsWith("/dashboard/Approvel1") ||
//       path.startsWith("/dashboard/BillEntry") ||
//       path.startsWith("/dashboard/ExpensesPayment")
//     );

//     setIsPossessionSelected(
//       path.startsWith("/dashboard/agreement") ||
//       path.startsWith("/dashboard/registry") ||
//       path.startsWith("/dashboard/possession-entry") ||
//       path.startsWith("/dashboard/channel-partner-payment")
//     );
//   }, [location.pathname]);

//   // Click outside to close dropdowns
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsPaymentDropdownOpen(false);
//       }
//       if (officeDropdownRef.current && !officeDropdownRef.current.contains(event.target)) {
//         setIsOfficeDropdownOpen(false);
//       }
//       if (possessionDropdownRef.current && !possessionDropdownRef.current.contains(event.target)) {
//         setIsPossessionDropdownOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleLogout = () => {
//     dispatch(logout());
//     navigate("/");
//   };

//   // Navigation Functions
//   const goToSummary = () => {
//     setIsMobileMenuOpen(false);
//     navigate("/dashboard/summary");
//   };

//   const goToSchedulePayment = () => {
//     setIsMobileMenuOpen(false);
//     setIsPaymentDropdownOpen(false);
//     setIsMobilePaymentDropdownOpen(false);
//     navigate("/dashboard/SchedulePayment");
//   };

//   const goToReconciliation = () => {
//     setIsMobileMenuOpen(false);
//     setIsPaymentDropdownOpen(false);
//     setIsMobilePaymentDropdownOpen(false);
//     navigate("/dashboard/Reconciliation");
//   };

//   const goToActualPaymentIn = () => {
//     setIsMobileMenuOpen(false);
//     setIsPaymentDropdownOpen(false);
//     setIsMobilePaymentDropdownOpen(false);
//     navigate("/dashboard/actual-payment-in");
//   };

//   const goToTransferBankToBank = () => {
//     setIsMobileMenuOpen(false);
//     setIsPaymentDropdownOpen(false);
//     setIsMobilePaymentDropdownOpen(false);
//     navigate("/dashboard/transfer-bank-to-bank");
//   };

//   const goToPaymentForm = () => {
//     setIsMobileMenuOpen(false);
//     setIsPaymentDropdownOpen(false);
//     setIsMobilePaymentDropdownOpen(false);
//     navigate("/dashboard/form");
//   };

//   // ✅ NEW - Bank Charges & Interest Navigation
//   const goToBankChargesInterest = () => {
//     setIsMobileMenuOpen(false);
//     setIsPaymentDropdownOpen(false);
//     setIsMobilePaymentDropdownOpen(false);
//     navigate("/dashboard/bankchargesinterest");
//   };

//   const goToApprovel = () => {
//     setIsMobileMenuOpen(false);
//     setIsOfficeDropdownOpen(false);
//     setIsMobileOfficeDropdownOpen(false);
//     navigate("/dashboard/Approvel1");
//   };

//   const goToBillEntry = () => {
//     setIsMobileMenuOpen(false);
//     setIsOfficeDropdownOpen(false);
//     setIsMobileOfficeDropdownOpen(false);
//     navigate("/dashboard/BillEntry");
//   };

//   const goToExpensesPayment = () => {
//     setIsMobileMenuOpen(false);
//     setIsOfficeDropdownOpen(false);
//     setIsMobileOfficeDropdownOpen(false);
//     navigate("/dashboard/ExpensesPayment");
//   };

//   const goToAgreement = () => {
//     setIsMobileMenuOpen(false);
//     setIsPossessionDropdownOpen(false);
//     setIsMobilePossessionDropdownOpen(false);
//     navigate("/dashboard/agreement");
//   };

//   const goToRegistry = () => {
//     setIsMobileMenuOpen(false);
//     setIsPossessionDropdownOpen(false);
//     setIsMobilePossessionDropdownOpen(false);
//     navigate("/dashboard/registry");
//   };

//   const goToPossessionEntry = () => {
//     setIsMobileMenuOpen(false);
//     setIsPossessionDropdownOpen(false);
//     setIsMobilePossessionDropdownOpen(false);
//     navigate("/dashboard/possession-entry");
//   };

//   const goToChannelPartnerPayment = () => {
//     setIsMobileMenuOpen(false);
//     setIsPossessionDropdownOpen(false);
//     setIsMobilePossessionDropdownOpen(false);
//     navigate("/dashboard/channel-partner-payment");
//   };

//   const togglePaymentDropdown = () => {
//     if (!canSeePayment) return;
//     setIsPaymentDropdownOpen(!isPaymentDropdownOpen);
//     setIsOfficeDropdownOpen(false);
//     setIsPossessionDropdownOpen(false);
//   };

//   const toggleOfficeDropdown = () => {
//     if (!canSeeOffice) return;
//     setIsOfficeDropdownOpen(!isOfficeDropdownOpen);
//     setIsPaymentDropdownOpen(false);
//     setIsPossessionDropdownOpen(false);
//   };

//   const togglePossessionDropdown = () => {
//     if (!canSeePossession) return;
//     setIsPossessionDropdownOpen(!isPossessionDropdownOpen);
//     setIsPaymentDropdownOpen(false);
//     setIsOfficeDropdownOpen(false);
//   };

//   const toggleMobilePaymentDropdown = () => {
//     if (!canSeePayment) return;
//     setIsMobilePaymentDropdownOpen(!isMobilePaymentDropdownOpen);
//   };

//   const toggleMobileOfficeDropdown = () => {
//     if (!canSeeOffice) return;
//     setIsMobileOfficeDropdownOpen(!isMobileOfficeDropdownOpen);
//   };

//   const toggleMobilePossessionDropdown = () => {
//     if (!canSeePossession) return;
//     setIsMobilePossessionDropdownOpen(!isMobilePossessionDropdownOpen);
//   };

//   return (
//     <div className="min-h-screen w-full bg-[#1A3263] overflow-x-hidden">
//       {/* NAVBAR */}
//       <nav
//         className="bg-[#1A3263] border-b border-gray-800 fixed top-0 left-0 right-0 z-50"
//         style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)", height: "64px" }}
//       >
//         <div className="w-full px-3 sm:px-4 lg:px-6 h-full">
//           <div className="flex items-center justify-between h-full">
//             <div className="flex items-center gap-3">
//               <h1 className="text-xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
//                 VRN Office
//               </h1>
//             </div>

//             {/* Desktop Menu */}
//             <div className="hidden lg:flex items-center gap-6">

//               {/* Summary */}
//               {canSeeSummary && (
//                 <button
//                   onClick={goToSummary}
//                   className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
//                     isSummarySelected
//                       ? "bg-amber-600 text-white shadow-md"
//                       : "text-gray-300 hover:bg-gray-800"
//                   }`}
//                 >
//                   <BarChart3 size={18} />
//                   Summary
//                 </button>
//               )}

//               {/* Office Dropdown - Desktop */}
//               {canSeeOffice && (
//                 <div className="relative" ref={officeDropdownRef}>
//                   <button
//                     onClick={toggleOfficeDropdown}
//                     className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
//                       isOfficeSelected
//                         ? "bg-blue-600 text-white shadow-md"
//                         : "text-gray-300 hover:bg-gray-800"
//                     }`}
//                   >
//                     <Building2 size={18} />
//                     Office
//                     <ChevronDown
//                       size={16}
//                       className={`transition-transform ${isOfficeDropdownOpen ? "rotate-180" : ""}`}
//                     />
//                   </button>

//                   {isOfficeDropdownOpen && (
//                     <div className="absolute top-full mt-2 right-0 w-56 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden z-50">
//                       {canSeeApprovel && (
//                         <button
//                           onClick={goToApprovel}
//                           className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium border-b border-gray-800"
//                         >
//                           Approval
//                         </button>
//                       )}
//                       {canSeeBillEntry && (
//                         <button
//                           onClick={goToBillEntry}
//                           className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium border-b border-gray-800"
//                         >
//                           Bill Entry
//                         </button>
//                       )}
//                       {canSeeExpensesPayment && (
//                         <button
//                           onClick={goToExpensesPayment}
//                           className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium"
//                         >
//                           Expenses Payment
//                         </button>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* Possession Dropdown - Desktop */}
//               {canSeePossession && (
//                 <div className="relative" ref={possessionDropdownRef}>
//                   <button
//                     onClick={togglePossessionDropdown}
//                     className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
//                       isPossessionSelected
//                         ? "bg-purple-600 text-white shadow-md"
//                         : "text-gray-300 hover:bg-gray-800"
//                     }`}
//                   >
//                     <KeyRound size={18} />
//                     Possession
//                     <ChevronDown
//                       size={16}
//                       className={`transition-transform ${isPossessionDropdownOpen ? "rotate-180" : ""}`}
//                     />
//                   </button>

//                   {isPossessionDropdownOpen && (
//                     <div className="absolute top-full mt-2 right-0 w-64 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden z-50">
//                       {canSeeAgreement && (
//                         <button
//                           onClick={goToAgreement}
//                           className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium border-b border-gray-800"
//                         >
//                           Agreement
//                         </button>
//                       )}
//                       {canSeeRegistry && (
//                         <button
//                           onClick={goToRegistry}
//                           className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium border-b border-gray-800"
//                         >
//                           Registry
//                         </button>
//                       )}
//                       {canSeePossessionEntry && (
//                         <button
//                           onClick={goToPossessionEntry}
//                           className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium border-b border-gray-800"
//                         >
//                           Possession
//                         </button>
//                       )}
//                       {canSeeChannelPartnerPayment && (
//                         <button
//                           onClick={goToChannelPartnerPayment}
//                           className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium"
//                         >
//                           Channel Partner Payment
//                         </button>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* Payment Dropdown - Desktop */}
//               {canSeePayment && (
//                 <div className="relative" ref={dropdownRef}>
//                   <button
//                     onClick={togglePaymentDropdown}
//                     className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
//                       isPaymentSelected
//                         ? "bg-emerald-600 text-white shadow-md"
//                         : "text-gray-300 hover:bg-gray-800"
//                     }`}
//                   >
//                     <DollarSign size={18} />
//                     Payment
//                     <ChevronDown
//                       size={16}
//                       className={`transition-transform ${isPaymentDropdownOpen ? "rotate-180" : ""}`}
//                     />
//                   </button>

//                   {isPaymentDropdownOpen && (
//                     <div className="absolute top-full mt-2 right-0 w-56 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden z-50">
//                       {canSeeSchedulePayment && (
//                         <button
//                           onClick={goToSchedulePayment}
//                           className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium border-b border-gray-800"
//                         >
//                           Schedule Payment
//                         </button>
//                       )}
//                       {canSeeReconciliation && (
//                         <button
//                           onClick={goToReconciliation}
//                           className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium border-b border-gray-800"
//                         >
//                           Reconciliation
//                         </button>
//                       )}
//                       {canSeeActualPaymentIn && (
//                         <button
//                           onClick={goToActualPaymentIn}
//                           className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium border-b border-gray-800"
//                         >
//                           Actual Payment In
//                         </button>
//                       )}
//                       {canSeeTransferBankToBank && (
//                         <button
//                           onClick={goToTransferBankToBank}
//                           className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium border-b border-gray-800"
//                         >
//                           Transfer Bank To Bank
//                         </button>
//                       )}
//                       {canSeePaymentForm && (
//                         <button
//                           onClick={goToPaymentForm}
//                           className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium border-b border-gray-800"
//                         >
//                           Payment Form
//                         </button>
//                       )}

//                       {/* ✅ NEW - Bank Charges & Interest - Desktop */}
//                       {canSeeBankChargesInterest && (
//                         <button
//                           onClick={goToBankChargesInterest}
//                           className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium"
//                         >
//                           Bank Charges & Interest
//                         </button>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>

//             {/* Logout Desktop */}
//             <div className="hidden lg:flex items-center">
//               <button
//                 onClick={handleLogout}
//                 className="flex items-center gap-2 px-5 py-2 text-red-400 hover:text-red-300 hover:bg-gray-900 rounded-lg transition-all text-sm font-medium"
//               >
//                 <LogOut size={18} />
//                 Logout
//               </button>
//             </div>

//             {/* Mobile Hamburger */}
//             <button
//               onClick={() => setIsMobileMenuOpen(true)}
//               className="lg:hidden p-2 rounded-lg hover:bg-gray-800"
//             >
//               <Menu className="w-6 h-6 text-gray-300" />
//             </button>
//           </div>
//         </div>
//       </nav>

//       {/* Mobile Sidebar */}
//       {isMobileMenuOpen && (
//         <>
//           <div
//             className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
//             onClick={() => setIsMobileMenuOpen(false)}
//           />
//           <div className="fixed inset-y-0 right-0 w-72 bg-gray-900 shadow-2xl z-50 lg:hidden">
//             <div className="flex flex-col h-full">
//               <div className="flex items-center justify-between p-5 border-b border-gray-800">
//                 <h2 className="text-lg font-bold text-white">Menu</h2>
//                 <button
//                   onClick={() => setIsMobileMenuOpen(false)}
//                   className="p-2 hover:bg-gray-800 rounded-lg"
//                 >
//                   <X className="w-6 h-6 text-gray-300" />
//                 </button>
//               </div>

//               <div className="flex-1 p-5 space-y-4 overflow-y-auto">
//                 {canSeeSummary && (
//                   <button
//                     onClick={goToSummary}
//                     className={`w-full flex items-center gap-3 px-5 py-4 rounded-lg transition-all ${
//                       isSummarySelected
//                         ? "bg-amber-600/25 text-amber-400 border-l-4 border-amber-500"
//                         : "text-gray-300 hover:bg-gray-800"
//                     }`}
//                   >
//                     <BarChart3 size={22} />
//                     <span className="font-medium">Summary</span>
//                   </button>
//                 )}

//                 {/* Office Dropdown - Mobile */}
//                 {canSeeOffice && (
//                   <div className="w-full">
//                     <button
//                       onClick={toggleMobileOfficeDropdown}
//                       className={`w-full flex items-center justify-between gap-3 px-5 py-4 rounded-lg transition-all ${
//                         isOfficeSelected
//                           ? "bg-blue-600/25 text-blue-400 border-l-4 border-blue-500"
//                           : "text-gray-300 hover:bg-gray-800"
//                       }`}
//                     >
//                       <div className="flex items-center gap-3">
//                         <Building2 size={22} />
//                         <span className="font-medium">Office</span>
//                       </div>
//                       <ChevronDown
//                         size={18}
//                         className={`transition-transform ${isMobileOfficeDropdownOpen ? "rotate-180" : ""}`}
//                       />
//                     </button>

//                     {isMobileOfficeDropdownOpen && (
//                       <div className="mt-2 ml-4 space-y-2">
//                         {canSeeApprovel && (
//                           <button
//                             onClick={goToApprovel}
//                             className="w-full text-left px-5 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-sm"
//                           >
//                             Approval
//                           </button>
//                         )}
//                         {canSeeBillEntry && (
//                           <button
//                             onClick={goToBillEntry}
//                             className="w-full text-left px-5 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-sm"
//                           >
//                             Bill Entry
//                           </button>
//                         )}
//                         {canSeeExpensesPayment && (
//                           <button
//                             onClick={goToExpensesPayment}
//                             className="w-full text-left px-5 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-sm"
//                           >
//                             Expenses Payment
//                           </button>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {/* Possession Dropdown - Mobile */}
//                 {canSeePossession && (
//                   <div className="w-full">
//                     <button
//                       onClick={toggleMobilePossessionDropdown}
//                       className={`w-full flex items-center justify-between gap-3 px-5 py-4 rounded-lg transition-all ${
//                         isPossessionSelected
//                           ? "bg-purple-600/25 text-purple-400 border-l-4 border-purple-500"
//                           : "text-gray-300 hover:bg-gray-800"
//                       }`}
//                     >
//                       <div className="flex items-center gap-3">
//                         <KeyRound size={22} />
//                         <span className="font-medium">Possession</span>
//                       </div>
//                       <ChevronDown
//                         size={18}
//                         className={`transition-transform ${isMobilePossessionDropdownOpen ? "rotate-180" : ""}`}
//                       />
//                     </button>

//                     {isMobilePossessionDropdownOpen && (
//                       <div className="mt-2 ml-4 space-y-2">
//                         {canSeeAgreement && (
//                           <button
//                             onClick={goToAgreement}
//                             className="w-full text-left px-5 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-sm"
//                           >
//                             Agreement
//                           </button>
//                         )}
//                         {canSeeRegistry && (
//                           <button
//                             onClick={goToRegistry}
//                             className="w-full text-left px-5 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-sm"
//                           >
//                             Registry
//                           </button>
//                         )}
//                         {canSeePossessionEntry && (
//                           <button
//                             onClick={goToPossessionEntry}
//                             className="w-full text-left px-5 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-sm"
//                           >
//                             Possession
//                           </button>
//                         )}
//                         {canSeeChannelPartnerPayment && (
//                           <button
//                             onClick={goToChannelPartnerPayment}
//                             className="w-full text-left px-5 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-sm"
//                           >
//                             Channel Partner Payment
//                           </button>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {/* Payment Dropdown - Mobile */}
//                 {canSeePayment && (
//                   <div className="w-full">
//                     <button
//                       onClick={toggleMobilePaymentDropdown}
//                       className={`w-full flex items-center justify-between gap-3 px-5 py-4 rounded-lg transition-all ${
//                         isPaymentSelected
//                           ? "bg-emerald-600/25 text-emerald-400 border-l-4 border-emerald-500"
//                           : "text-gray-300 hover:bg-gray-800"
//                       }`}
//                     >
//                       <div className="flex items-center gap-3">
//                         <DollarSign size={22} />
//                         <span className="font-medium">Payment</span>
//                       </div>
//                       <ChevronDown
//                         size={18}
//                         className={`transition-transform ${isMobilePaymentDropdownOpen ? "rotate-180" : ""}`}
//                       />
//                     </button>

//                     {isMobilePaymentDropdownOpen && (
//                       <div className="mt-2 ml-4 space-y-2">
//                         {canSeeSchedulePayment && (
//                           <button
//                             onClick={goToSchedulePayment}
//                             className="w-full text-left px-5 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-sm"
//                           >
//                             Schedule Payment
//                           </button>
//                         )}
//                         {canSeeReconciliation && (
//                           <button
//                             onClick={goToReconciliation}
//                             className="w-full text-left px-5 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-sm"
//                           >
//                             Reconciliation
//                           </button>
//                         )}
//                         {canSeeActualPaymentIn && (
//                           <button
//                             onClick={goToActualPaymentIn}
//                             className="w-full text-left px-5 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-sm"
//                           >
//                             Actual Payment In
//                           </button>
//                         )}
//                         {canSeeTransferBankToBank && (
//                           <button
//                             onClick={goToTransferBankToBank}
//                             className="w-full text-left px-5 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-sm"
//                           >
//                             Transfer Bank To Bank
//                           </button>
//                         )}
//                         {canSeePaymentForm && (
//                           <button
//                             onClick={goToPaymentForm}
//                             className="w-full text-left px-5 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-sm"
//                           >
//                             Payment Form
//                           </button>
//                         )}

//                         {/* ✅ NEW - Bank Charges & Interest - Mobile */}
//                         {canSeeBankChargesInterest && (
//                           <button
//                             onClick={goToBankChargesInterest}
//                             className="w-full text-left px-5 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-sm"
//                           >
//                             Bank Charges & Interest
//                           </button>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>

//               <div className="p-5 border-t border-gray-800">
//                 <button
//                   onClick={handleLogout}
//                   className="w-full flex items-center justify-center gap-3 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-red-400 transition-colors"
//                 >
//                   <LogOut size={22} />
//                   <span className="font-medium">Logout</span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </>
//       )}

//       {/* Main Content */}
//       <main className="w-full pt-16 px-3 sm:px-4 lg:px-5 pb-4">
//         <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-5rem)] w-full">
//           <Outlet />
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Dashboard;







// Dashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { BarChart3, DollarSign, LogOut, Menu, X, ChevronDown, Building2, KeyRound } from "lucide-react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/Auth/LoginSlice";

const Dashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);
  const [isMobilePaymentDropdownOpen, setIsMobilePaymentDropdownOpen] = useState(false);
  const [isOfficeDropdownOpen, setIsOfficeDropdownOpen] = useState(false);
  const [isMobileOfficeDropdownOpen, setIsMobileOfficeDropdownOpen] = useState(false);
  const [isPossessionDropdownOpen, setIsPossessionDropdownOpen] = useState(false);
  const [isMobilePossessionDropdownOpen, setIsMobilePossessionDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const officeDropdownRef = useRef(null);
  const possessionDropdownRef = useRef(null);

  const { token, userType } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const currentUserType = (userType || "").trim().toUpperCase();

  // === PERMISSION BASED VISIBILITY ===
  const isAdmin = currentUserType === "ADMIN";
  const isCRM = currentUserType === "CRM";
  const isAccounts = currentUserType === "ACCOUNTS";
  const isFinance = currentUserType === "PAYMENT";
  const isVRN = currentUserType === "VRN";

  // Summary
  const canSeeSummary = isAdmin || isVRN;

  // Payment Dropdown
  const canSeePayment = isAdmin || isCRM || isAccounts || isFinance || isVRN;

  // Office Dropdown
  const canSeeOffice = isAdmin || isAccounts || isFinance || isVRN;

  // Individual Menu Items Permissions
  const canSeeSchedulePayment = isAdmin || isCRM || isAccounts || isFinance || isVRN;
  const canSeeReconciliation = isAdmin || isFinance || isAccounts;
  const canSeeActualPaymentIn = isAdmin || isFinance || isAccounts;
  const canSeeTransferBankToBank = isAdmin || isFinance;
  const canSeePaymentForm = isAdmin || isFinance;
  const canSeeBankChargesInterest = isAdmin || isFinance || isAccounts;

  const canSeeApprovel = isAdmin || isVRN;
  const canSeeBillEntry = isAdmin || isAccounts || isFinance;
  const canSeeExpensesPayment = isAdmin || isAccounts || isFinance;

  // ✅ NEW - Advance Form Permission
  const canSeeAdvanceForm = isAdmin || isAccounts || isFinance || isVRN;

  // Possession Permissions
  const canSeePossession = isAdmin || isCRM;
  const canSeeAgreement = isAdmin || isCRM;
  const canSeeRegistry = isAdmin || isCRM;
  const canSeePossessionEntry = isAdmin || isCRM;
  const canSeeChannelPartnerPayment = isAdmin || isCRM;

  // Active state for highlighting
  const [isSummarySelected, setIsSummarySelected] = useState(false);
  const [isPaymentSelected, setIsPaymentSelected] = useState(false);
  const [isOfficeSelected, setIsOfficeSelected] = useState(false);
  const [isPossessionSelected, setIsPossessionSelected] = useState(false);

  // Redirect Logic on Dashboard load
  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    if (location.pathname === "/dashboard" || location.pathname === "/dashboard/") {
      if (canSeeSummary) {
        navigate("/dashboard/summary", { replace: true });
      } else if (canSeePayment) {
        navigate("/dashboard/SchedulePayment", { replace: true });
      } else if (canSeeOffice) {
        navigate("/dashboard/BillEntry", { replace: true });
      } else if (canSeePossession) {
        navigate("/dashboard/agreement", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [token, location.pathname, navigate, canSeeSummary, canSeePayment, canSeeOffice, canSeePossession]);

  // Active menu highlight logic
  useEffect(() => {
    const path = location.pathname;

    setIsSummarySelected(path === "/dashboard/summary");

    setIsPaymentSelected(
      path.startsWith("/dashboard/SchedulePayment") ||
      path.startsWith("/dashboard/Reconciliation") ||
      path.startsWith("/dashboard/actual-payment-in") ||
      path.startsWith("/dashboard/transfer-bank-to-bank") ||
      path.startsWith("/dashboard/form") ||
      path.startsWith("/dashboard/bankchargesinterest")
    );

    // ✅ AdvanceForm bhi office mein add kiya
    setIsOfficeSelected(
      path.startsWith("/dashboard/Approvel1") ||
      path.startsWith("/dashboard/BillEntry") ||
      path.startsWith("/dashboard/ExpensesPayment") ||
      path.startsWith("/dashboard/AdvanceForm")
    );

    setIsPossessionSelected(
      path.startsWith("/dashboard/agreement") ||
      path.startsWith("/dashboard/registry") ||
      path.startsWith("/dashboard/possession-entry") ||
      path.startsWith("/dashboard/channel-partner-payment")
    );
  }, [location.pathname]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsPaymentDropdownOpen(false);
      }
      if (officeDropdownRef.current && !officeDropdownRef.current.contains(event.target)) {
        setIsOfficeDropdownOpen(false);
      }
      if (possessionDropdownRef.current && !possessionDropdownRef.current.contains(event.target)) {
        setIsPossessionDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  // Navigation Functions
  const goToSummary = () => {
    setIsMobileMenuOpen(false);
    navigate("/dashboard/summary");
  };

  const goToSchedulePayment = () => {
    setIsMobileMenuOpen(false);
    setIsPaymentDropdownOpen(false);
    setIsMobilePaymentDropdownOpen(false);
    navigate("/dashboard/SchedulePayment");
  };

  const goToReconciliation = () => {
    setIsMobileMenuOpen(false);
    setIsPaymentDropdownOpen(false);
    setIsMobilePaymentDropdownOpen(false);
    navigate("/dashboard/Reconciliation");
  };

  const goToActualPaymentIn = () => {
    setIsMobileMenuOpen(false);
    setIsPaymentDropdownOpen(false);
    setIsMobilePaymentDropdownOpen(false);
    navigate("/dashboard/actual-payment-in");
  };

  const goToTransferBankToBank = () => {
    setIsMobileMenuOpen(false);
    setIsPaymentDropdownOpen(false);
    setIsMobilePaymentDropdownOpen(false);
    navigate("/dashboard/transfer-bank-to-bank");
  };

  const goToPaymentForm = () => {
    setIsMobileMenuOpen(false);
    setIsPaymentDropdownOpen(false);
    setIsMobilePaymentDropdownOpen(false);
    navigate("/dashboard/form");
  };

  const goToBankChargesInterest = () => {
    setIsMobileMenuOpen(false);
    setIsPaymentDropdownOpen(false);
    setIsMobilePaymentDropdownOpen(false);
    navigate("/dashboard/bankchargesinterest");
  };

  const goToApprovel = () => {
    setIsMobileMenuOpen(false);
    setIsOfficeDropdownOpen(false);
    setIsMobileOfficeDropdownOpen(false);
    navigate("/dashboard/Approvel1");
  };

  const goToBillEntry = () => {
    setIsMobileMenuOpen(false);
    setIsOfficeDropdownOpen(false);
    setIsMobileOfficeDropdownOpen(false);
    navigate("/dashboard/BillEntry");
  };

  const goToExpensesPayment = () => {
    setIsMobileMenuOpen(false);
    setIsOfficeDropdownOpen(false);
    setIsMobileOfficeDropdownOpen(false);
    navigate("/dashboard/ExpensesPayment");
  };

  // ✅ NEW - Advance Form Navigation
  const goToAdvanceForm = () => {
    setIsMobileMenuOpen(false);
    setIsOfficeDropdownOpen(false);
    setIsMobileOfficeDropdownOpen(false);
    navigate("/dashboard/AdvanceForm");
  };

  const goToAgreement = () => {
    setIsMobileMenuOpen(false);
    setIsPossessionDropdownOpen(false);
    setIsMobilePossessionDropdownOpen(false);
    navigate("/dashboard/agreement");
  };

  const goToRegistry = () => {
    setIsMobileMenuOpen(false);
    setIsPossessionDropdownOpen(false);
    setIsMobilePossessionDropdownOpen(false);
    navigate("/dashboard/registry");
  };

  const goToPossessionEntry = () => {
    setIsMobileMenuOpen(false);
    setIsPossessionDropdownOpen(false);
    setIsMobilePossessionDropdownOpen(false);
    navigate("/dashboard/possession-entry");
  };

  const goToChannelPartnerPayment = () => {
    setIsMobileMenuOpen(false);
    setIsPossessionDropdownOpen(false);
    setIsMobilePossessionDropdownOpen(false);
    navigate("/dashboard/channel-partner-payment");
  };

  const togglePaymentDropdown = () => {
    if (!canSeePayment) return;
    setIsPaymentDropdownOpen(!isPaymentDropdownOpen);
    setIsOfficeDropdownOpen(false);
    setIsPossessionDropdownOpen(false);
  };

  const toggleOfficeDropdown = () => {
    if (!canSeeOffice) return;
    setIsOfficeDropdownOpen(!isOfficeDropdownOpen);
    setIsPaymentDropdownOpen(false);
    setIsPossessionDropdownOpen(false);
  };

  const togglePossessionDropdown = () => {
    if (!canSeePossession) return;
    setIsPossessionDropdownOpen(!isPossessionDropdownOpen);
    setIsPaymentDropdownOpen(false);
    setIsOfficeDropdownOpen(false);
  };

  const toggleMobilePaymentDropdown = () => {
    if (!canSeePayment) return;
    setIsMobilePaymentDropdownOpen(!isMobilePaymentDropdownOpen);
  };

  const toggleMobileOfficeDropdown = () => {
    if (!canSeeOffice) return;
    setIsMobileOfficeDropdownOpen(!isMobileOfficeDropdownOpen);
  };

  const toggleMobilePossessionDropdown = () => {
    if (!canSeePossession) return;
    setIsMobilePossessionDropdownOpen(!isMobilePossessionDropdownOpen);
  };

  return (
    <div className="min-h-screen w-full bg-[#1A3263] overflow-x-hidden">
      {/* NAVBAR */}
      <nav
        className="bg-[#1A3263] border-b border-gray-800 fixed top-0 left-0 right-0 z-50"
        style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)", height: "64px" }}
      >
        <div className="w-full px-3 sm:px-4 lg:px-6 h-full">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                VRN Office
              </h1>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-6">

              {/* Summary */}
              {canSeeSummary && (
                <button
                  onClick={goToSummary}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isSummarySelected
                      ? "bg-amber-600 text-white shadow-md"
                      : "text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  <BarChart3 size={18} />
                  Summary
                </button>
              )}

              {/* Office Dropdown - Desktop */}
              {canSeeOffice && (
                <div className="relative" ref={officeDropdownRef}>
                  <button
                    onClick={toggleOfficeDropdown}
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                      isOfficeSelected
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-300 hover:bg-gray-800"
                    }`}
                  >
                    <Building2 size={18} />
                    Office
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${isOfficeDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isOfficeDropdownOpen && (
                    <div className="absolute top-full mt-2 right-0 w-56 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden z-50">
                      {canSeeApprovel && (
                        <button
                          onClick={goToApprovel}
                          className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium border-b border-gray-800"
                        >
                          Approval
                        </button>
                      )}
                      {canSeeBillEntry && (
                        <button
                          onClick={goToBillEntry}
                          className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium border-b border-gray-800"
                        >
                          Bill Entry
                        </button>
                      )}
                      {canSeeExpensesPayment && (
                        <button
                          onClick={goToExpensesPayment}
                          className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium border-b border-gray-800"
                        >
                          Expenses Payment
                        </button>
                      )}

                      {/* ✅ NEW - Advance Form - Desktop */}
                      {canSeeAdvanceForm && (
                        <button
                          onClick={goToAdvanceForm}
                          className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium"
                        >
                          Advance Form
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Possession Dropdown - Desktop */}
              {canSeePossession && (
                <div className="relative" ref={possessionDropdownRef}>
                  <button
                    onClick={togglePossessionDropdown}
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                      isPossessionSelected
                        ? "bg-purple-600 text-white shadow-md"
                        : "text-gray-300 hover:bg-gray-800"
                    }`}
                  >
                    <KeyRound size={18} />
                    Possession
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${isPossessionDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isPossessionDropdownOpen && (
                    <div className="absolute top-full mt-2 right-0 w-64 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden z-50">
                      {canSeeAgreement && (
                        <button
                          onClick={goToAgreement}
                          className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium border-b border-gray-800"
                        >
                          Agreement
                        </button>
                      )}
                      {canSeeRegistry && (
                        <button
                          onClick={goToRegistry}
                          className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium border-b border-gray-800"
                        >
                          Registry
                        </button>
                      )}
                      {canSeePossessionEntry && (
                        <button
                          onClick={goToPossessionEntry}
                          className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium border-b border-gray-800"
                        >
                          Possession
                        </button>
                      )}
                      {canSeeChannelPartnerPayment && (
                        <button
                          onClick={goToChannelPartnerPayment}
                          className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium"
                        >
                          Channel Partner Payment
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Payment Dropdown - Desktop */}
              {canSeePayment && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={togglePaymentDropdown}
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                      isPaymentSelected
                        ? "bg-emerald-600 text-white shadow-md"
                        : "text-gray-300 hover:bg-gray-800"
                    }`}
                  >
                    <DollarSign size={18} />
                    Payment
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${isPaymentDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isPaymentDropdownOpen && (
                    <div className="absolute top-full mt-2 right-0 w-56 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden z-50">
                      {canSeeSchedulePayment && (
                        <button
                          onClick={goToSchedulePayment}
                          className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium border-b border-gray-800"
                        >
                          Schedule Payment
                        </button>
                      )}
                      {canSeeReconciliation && (
                        <button
                          onClick={goToReconciliation}
                          className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium border-b border-gray-800"
                        >
                          Reconciliation
                        </button>
                      )}
                      {canSeeActualPaymentIn && (
                        <button
                          onClick={goToActualPaymentIn}
                          className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium border-b border-gray-800"
                        >
                          Actual Payment In
                        </button>
                      )}
                      {canSeeTransferBankToBank && (
                        <button
                          onClick={goToTransferBankToBank}
                          className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium border-b border-gray-800"
                        >
                          Transfer Bank To Bank
                        </button>
                      )}
                      {canSeePaymentForm && (
                        <button
                          onClick={goToPaymentForm}
                          className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium border-b border-gray-800"
                        >
                          Payment Form
                        </button>
                      )}
                      {canSeeBankChargesInterest && (
                        <button
                          onClick={goToBankChargesInterest}
                          className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium"
                        >
                          Bank Charges & Interest
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Logout Desktop */}
            <div className="hidden lg:flex items-center">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2 text-red-400 hover:text-red-300 hover:bg-gray-900 rounded-lg transition-all text-sm font-medium"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-800"
            >
              <Menu className="w-6 h-6 text-gray-300" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-72 bg-gray-900 shadow-2xl z-50 lg:hidden">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-5 border-b border-gray-800">
                <h2 className="text-lg font-bold text-white">Menu</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-6 h-6 text-gray-300" />
                </button>
              </div>

              <div className="flex-1 p-5 space-y-4 overflow-y-auto">
                {canSeeSummary && (
                  <button
                    onClick={goToSummary}
                    className={`w-full flex items-center gap-3 px-5 py-4 rounded-lg transition-all ${
                      isSummarySelected
                        ? "bg-amber-600/25 text-amber-400 border-l-4 border-amber-500"
                        : "text-gray-300 hover:bg-gray-800"
                    }`}
                  >
                    <BarChart3 size={22} />
                    <span className="font-medium">Summary</span>
                  </button>
                )}

                {/* Office Dropdown - Mobile */}
                {canSeeOffice && (
                  <div className="w-full">
                    <button
                      onClick={toggleMobileOfficeDropdown}
                      className={`w-full flex items-center justify-between gap-3 px-5 py-4 rounded-lg transition-all ${
                        isOfficeSelected
                          ? "bg-blue-600/25 text-blue-400 border-l-4 border-blue-500"
                          : "text-gray-300 hover:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Building2 size={22} />
                        <span className="font-medium">Office</span>
                      </div>
                      <ChevronDown
                        size={18}
                        className={`transition-transform ${isMobileOfficeDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isMobileOfficeDropdownOpen && (
                      <div className="mt-2 ml-4 space-y-2">
                        {canSeeApprovel && (
                          <button
                            onClick={goToApprovel}
                            className="w-full text-left px-5 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-sm"
                          >
                            Approval
                          </button>
                        )}
                        {canSeeBillEntry && (
                          <button
                            onClick={goToBillEntry}
                            className="w-full text-left px-5 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-sm"
                          >
                            Bill Entry
                          </button>
                        )}
                        {canSeeExpensesPayment && (
                          <button
                            onClick={goToExpensesPayment}
                            className="w-full text-left px-5 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-sm"
                          >
                            Expenses Payment
                          </button>
                        )}

                        {/* ✅ NEW - Advance Form - Mobile */}
                        {canSeeAdvanceForm && (
                          <button
                            onClick={goToAdvanceForm}
                            className="w-full text-left px-5 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-sm"
                          >
                            Advance Form
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Possession Dropdown - Mobile */}
                {canSeePossession && (
                  <div className="w-full">
                    <button
                      onClick={toggleMobilePossessionDropdown}
                      className={`w-full flex items-center justify-between gap-3 px-5 py-4 rounded-lg transition-all ${
                        isPossessionSelected
                          ? "bg-purple-600/25 text-purple-400 border-l-4 border-purple-500"
                          : "text-gray-300 hover:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <KeyRound size={22} />
                        <span className="font-medium">Possession</span>
                      </div>
                      <ChevronDown
                        size={18}
                        className={`transition-transform ${isMobilePossessionDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isMobilePossessionDropdownOpen && (
                      <div className="mt-2 ml-4 space-y-2">
                        {canSeeAgreement && (
                          <button
                            onClick={goToAgreement}
                            className="w-full text-left px-5 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-sm"
                          >
                            Agreement
                          </button>
                        )}
                        {canSeeRegistry && (
                          <button
                            onClick={goToRegistry}
                            className="w-full text-left px-5 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-sm"
                          >
                            Registry
                          </button>
                        )}
                        {canSeePossessionEntry && (
                          <button
                            onClick={goToPossessionEntry}
                            className="w-full text-left px-5 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-sm"
                          >
                            Possession
                          </button>
                        )}
                        {canSeeChannelPartnerPayment && (
                          <button
                            onClick={goToChannelPartnerPayment}
                            className="w-full text-left px-5 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-sm"
                          >
                            Channel Partner Payment
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Payment Dropdown - Mobile */}
                {canSeePayment && (
                  <div className="w-full">
                    <button
                      onClick={toggleMobilePaymentDropdown}
                      className={`w-full flex items-center justify-between gap-3 px-5 py-4 rounded-lg transition-all ${
                        isPaymentSelected
                          ? "bg-emerald-600/25 text-emerald-400 border-l-4 border-emerald-500"
                          : "text-gray-300 hover:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <DollarSign size={22} />
                        <span className="font-medium">Payment</span>
                      </div>
                      <ChevronDown
                        size={18}
                        className={`transition-transform ${isMobilePaymentDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isMobilePaymentDropdownOpen && (
                      <div className="mt-2 ml-4 space-y-2">
                        {canSeeSchedulePayment && (
                          <button
                            onClick={goToSchedulePayment}
                            className="w-full text-left px-5 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-sm"
                          >
                            Schedule Payment
                          </button>
                        )}
                        {canSeeReconciliation && (
                          <button
                            onClick={goToReconciliation}
                            className="w-full text-left px-5 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-sm"
                          >
                            Reconciliation
                          </button>
                        )}
                        {canSeeActualPaymentIn && (
                          <button
                            onClick={goToActualPaymentIn}
                            className="w-full text-left px-5 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-sm"
                          >
                            Actual Payment In
                          </button>
                        )}
                        {canSeeTransferBankToBank && (
                          <button
                            onClick={goToTransferBankToBank}
                            className="w-full text-left px-5 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-sm"
                          >
                            Transfer Bank To Bank
                          </button>
                        )}
                        {canSeePaymentForm && (
                          <button
                            onClick={goToPaymentForm}
                            className="w-full text-left px-5 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-sm"
                          >
                            Payment Form
                          </button>
                        )}
                        {canSeeBankChargesInterest && (
                          <button
                            onClick={goToBankChargesInterest}
                            className="w-full text-left px-5 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-sm"
                          >
                            Bank Charges & Interest
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-gray-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-red-400 transition-colors"
                >
                  <LogOut size={22} />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="w-full pt-16 px-3 sm:px-4 lg:px-5 pb-4">
        <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-5rem)] w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;