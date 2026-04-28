
// import React, { useState, useEffect, useRef } from "react";
// import { useGetPendingDimPaymentsQuery, useUpdateDimPaymentMutation } from "../../features/OfficeExpense/paymentSlice";
// import { useGetProjectBankMappingQuery } from "../../features/SchedulePayment/SchedulePaymentSlice";
// import { FaSearch, FaChevronDown, FaTimes, FaCheckCircle, FaMoneyBillWave, FaArrowDown } from "react-icons/fa";

// // ─── helpers ────────────────────────────────────────────────────────────────
// const fmt = (n) =>
//   Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// // ─── Sub-components ──────────────────────────────────────────────────────────
// const InfoChip = ({ label, value, accent }) => (
//   <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
//     <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
//       {label}
//     </span>
//     <span style={{ fontSize: 13, fontWeight: 600, color: accent || "#1e293b" }}>{value || "—"}</span>
//   </div>
// );

// const AmountBadge = ({ label, amount, color }) => (
//   <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", padding: "8px 14px", borderRadius: 10, backgroundColor: color + "18", border: `1px solid ${color}40` }}>
//     <span style={{ fontSize: 10, color: "#64748b", fontWeight: 700, letterSpacing: "0.06em" }}>{label}</span>
//     <span style={{ fontSize: 17, fontWeight: 800, color }}>₹{fmt(amount)}</span>
//   </div>
// );

// // ─── Searchable Dropdown ─────────────────────────────────────────────────────
// const SearchDropdown = ({ label, placeholder, value, onChange, options, displayKey }) => {
//   const [open, setOpen] = useState(false);
//   const [search, setSearch] = useState(value || "");
//   const ref = useRef(null);

//   useEffect(() => { setSearch(value || ""); }, [value]);

//   useEffect(() => {
//     const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   const filtered = options.filter((o) =>
//     (o[displayKey] || "").toString().toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div ref={ref} style={{ position: "relative" }}>
//       <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 6, letterSpacing: "0.07em", textTransform: "uppercase" }}>
//         {label}
//       </label>
//       <div style={{ position: "relative" }}>
//         <input
//           value={search}
//           onFocus={() => setOpen(true)}
//           onChange={(e) => { setSearch(e.target.value); setOpen(true); onChange(""); }}
//           placeholder={placeholder}
//           style={{
//             width: "100%", padding: "11px 40px 11px 14px", borderRadius: 10,
//             border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none",
//             backgroundColor: "white", boxSizing: "border-box",
//             transition: "border-color 0.2s", fontFamily: "inherit",
//           }}
//           onMouseOver={(e) => (e.target.style.borderColor = "#6366f1")}
//           onMouseOut={(e) => (e.target.style.borderColor = open ? "#6366f1" : "#e2e8f0")}
//         />
//         <FaChevronDown style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 11 }} />
//       </div>
//       {open && filtered.length > 0 && (
//         <ul style={{
//           position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
//           backgroundColor: "white", border: "1.5px solid #e2e8f0", borderRadius: 10,
//           maxHeight: 200, overflowY: "auto", zIndex: 200,
//           listStyle: "none", margin: 0, padding: "6px 0",
//           boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
//         }}>
//           {filtered.map((o, i) => (
//             <li
//               key={i}
//               onClick={() => { onChange(o[displayKey].toString()); setSearch(o[displayKey].toString()); setOpen(false); }}
//               style={{
//                 padding: "10px 16px", cursor: "pointer", fontSize: 14, color: "#1e293b",
//                 borderBottom: i < filtered.length - 1 ? "1px solid #f1f5f9" : "none",
//                 transition: "background 0.15s",
//               }}
//               onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f0f4ff")}
//               onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
//             >
//               {o[displayKey]}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// // ─── Main Component ──────────────────────────────────────────────────────────
// const ExpensesPayemnt = () => {
//   const { data: apiData, isLoading, isError, refetch } = useGetPendingDimPaymentsQuery();
//   const [updateDimPayment, { isLoading: isSubmitting }] = useUpdateDimPaymentMutation();

//   // ── Bank Mapping API ──────────────────────────────────────────────────────
//   const {
//     data: bankMappingData,
//     isLoading: isBankLoading,
//     isError: isBankError,
//   } = useGetProjectBankMappingQuery();

//   // ── Bank options from map keys ──────────────────────────────────────────
//   // bankMappingData.map = { "My City A/c": "—", "Signature Heritage HDFC A/c(0431)": "—", ... }
//   // Object.keys() → ["My City A/c", "Signature Heritage HDFC A/c(0431)", ...]
//   const bankOptions = React.useMemo(() => {
//     if (!bankMappingData?.map) return [];
//     return Object.keys(bankMappingData.map);
//   }, [bankMappingData]);

//   const allData = apiData?.data || [];

//   // ── Unique Vendor Names ───────────────────────────────────────────────────
//   const uniqueVendors = [...new Map(
//     allData
//       .filter((d) => d.Vendor_Name_4)
//       .map((d) => [d.Vendor_Name_4, { Vendor_Name_4: d.Vendor_Name_4 }])
//   ).values()];

//   // ── States ───────────────────────────────────────────────────────────────
//   const [selectedVendor, setSelectedVendor] = useState("");
//   const [selectedBillNo, setSelectedBillNo] = useState("");
//   const [showBills, setShowBills] = useState(false);
//   const [filteredBills, setFilteredBills] = useState([]);
//   const [selectedBills, setSelectedBills] = useState([]);
//   const [paidAmounts, setPaidAmounts] = useState({});
//   const [roundups, setRoundups] = useState({});
//   const [remarks, setRemarks] = useState({});

//   // Global payment fields
//   const [bankDetails, setBankDetails] = useState("");
//   const [paymentMode, setPaymentMode] = useState("");
//   const [paymentDetails, setPaymentDetails] = useState("");
//   const [paymentDate, setPaymentDate] = useState("");

//   const paymentSectionRef = useRef(null);

//   // ── Vendor Change Handler ─────────────────────────────────────────────────
//   const handleVendorChange = (val) => {
//     setSelectedVendor(val);
//     setSelectedBillNo("");
//     setShowBills(false);
//     setFilteredBills([]);
//     setSelectedBills([]);
//     setPaidAmounts({});
//     setRoundups({});
//     setRemarks({});
//   };

//   // ── Unique OFFBILLUID filtered by vendor ─────────────────────────────────
//   const billNoOptions = [...new Map(
//     allData
//       .filter((d) => {
//         if (!d.OFFBILLUID) return false;
//         if (selectedVendor) return (d.Vendor_Name_4 || "") === selectedVendor;
//         return true;
//       })
//       .map((d) => [d.OFFBILLUID.toString(), { OFFBILLUID: d.OFFBILLUID.toString() }])
//   ).values()];

//   // ── Filter Handler ────────────────────────────────────────────────────────
//   const handleFilter = () => {
//     if (!selectedVendor && !selectedBillNo)
//       return alert("कृपया Vendor या Office Bill UID में से कम से एक select करें।");

//     const results = allData.filter((d) => {
//       const vendorMatch = selectedVendor ? (d.Vendor_Name_4 || "") === selectedVendor : true;
//       const billMatch = selectedBillNo ? (d.OFFBILLUID || "").toString() === selectedBillNo : true;
//       return vendorMatch && billMatch;
//     });

//     setFilteredBills(results);
//     setShowBills(true);
//     setSelectedBills([]);
//     setPaidAmounts({});
//     setRoundups({});
//     setRemarks({});
//   };

//   // ── Toggle Bill Selection ─────────────────────────────────────────────────
//   const toggleBill = (uid) => {
//     setSelectedBills((prev) => {
//       if (prev.includes(uid)) {
//         setPaidAmounts((p) => { const n = { ...p }; delete n[uid]; return n; });
//         setRoundups((p) => { const n = { ...p }; delete n[uid]; return n; });
//         setRemarks((p) => { const n = { ...p }; delete n[uid]; return n; });
//         return prev.filter((id) => id !== uid);
//       }
//       setPaidAmounts((p) => ({ ...p, [uid]: "" }));
//       setRoundups((p) => ({ ...p, [uid]: 0 }));
//       setRemarks((p) => ({ ...p, [uid]: "" }));
//       return [...prev, uid];
//     });
//   };

//   // ── Round Off Handler ─────────────────────────────────────────────────────
//   const handleRoundupChange = (uid, value) => {
//     let numValue = value === "" ? 0 : parseFloat(value);
//     if (isNaN(numValue)) numValue = 0;
//     if (numValue > 9) numValue = 9;
//     if (numValue < -9) numValue = -9;
//     setRoundups((prev) => ({ ...prev, [uid]: numValue }));
//   };

//   // ── Grand Total ───────────────────────────────────────────────────────────
//   const grandTotal = selectedBills.reduce(
//     (sum, uid) => sum + (Number(paidAmounts[uid]) || 0) + (Number(roundups[uid]) || 0),
//     0
//   );

//   // ── Submit Handler ────────────────────────────────────────────────────────
//   const handleSubmit = async () => {
//     if (selectedBills.length === 0) return alert("कृपया कम से कम एक bill select करें।");
//     if (!bankDetails || !paymentMode || !paymentDetails.trim() || !paymentDate)
//       return alert("सभी Global Payment Details भरें।");

//     const emptyPaid = selectedBills.filter(
//       (uid) =>
//         paidAmounts[uid] === "" ||
//         paidAmounts[uid] === undefined ||
//         isNaN(Number(paidAmounts[uid])) ||
//         roundups[uid] === "" ||
//         roundups[uid] === undefined ||
//         isNaN(Number(roundups[uid]))
//     );
//     if (emptyPaid.length > 0)
//       return alert(`${emptyPaid.length} bill(s) में Paid Amount या Round Off खाली है।`);

//     const zeroPaid = selectedBills.filter(
//       (uid) => Number(paidAmounts[uid] || 0) + Number(roundups[uid] || 0) === 0
//     );
//     if (zeroPaid.length > 0) {
//       const ok = window.confirm(
//         `${zeroPaid.length} bill(s) में effective paid amount 0 है। क्या आप submit करना चाहते हैं?`
//       );
//       if (!ok) return;
//     }

//     try {
//       for (const uid of selectedBills) {
//         const bill = filteredBills.find((b) => b.uid === uid);
//         const netAmount = Number((bill?.NET_AMOUNT_4 || "0").toString().replace(/,/g, "").trim()) || 0;
//         const currentPaid = Number(paidAmounts[uid] || 0);
//         const roundup = Number(roundups[uid] || 0);
//         const effectivePaid = currentPaid + roundup;
//         const balance = netAmount - effectivePaid;

//         await updateDimPayment({
//           uid,
//           STATUS_5: balance <= 0 ? "Done" : "Partial",
//           NET_AMOUNT_5: netAmount,
//           PAID_AMOUNT_5: effectivePaid,
//           BALANCE_AMOUNT_5: balance,
//           BANK_DETAILS_5: bankDetails,
//           PAYMENT_MODE_5: paymentMode,
//           PAYMENT_DETAILS_5: paymentDetails,
//           PAYMENT_DATE_5: paymentDate,
//           Remark_5: remarks[uid] || "",
//         }).unwrap();
//       }

//       alert(`✅ ${selectedBills.length} payment(s) successfully submitted!`);
//       setShowBills(false);
//       setSelectedBills([]);
//       setPaidAmounts({});
//       setRoundups({});
//       setRemarks({});
//       setBankDetails("");
//       setPaymentMode("");
//       setPaymentDetails("");
//       setPaymentDate("");
//       setSelectedVendor("");
//       setSelectedBillNo("");
//       refetch();
//     } catch (err) {
//       alert("Error submitting: " + (err?.data?.message || err?.message || "Unknown error"));
//     }
//   };

//   // ── Loading & Error States ────────────────────────────────────────────────
//   if (isLoading) return (
//     <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", flexDirection: "column", gap: 14 }}>
//       <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #e2e8f0", borderTopColor: "#6366f1", animation: "spin 0.8s linear infinite" }} />
//       <span style={{ color: "#64748b", fontSize: 14 }}>Loading payments…</span>
//       <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
//     </div>
//   );

//   if (isError) return (
//     <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
//       <div style={{ textAlign: "center", color: "#ef4444" }}>
//         <div style={{ fontSize: 40, marginBottom: 8 }}>⚠️</div>
//         <div style={{ fontSize: 16, fontWeight: 600 }}>Failed to load payment data</div>
//       </div>
//     </div>
//   );

//   // ── Main Render ───────────────────────────────────────────────────────────
//   return (
//     <div style={{ padding: "28px 32px", backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
//       <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

//       {/* ── Header ── */}
//       <div style={{ marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//         <div>
//           <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#1e293b", letterSpacing: "-0.5px" }}>
//             <FaMoneyBillWave style={{ color: "#6366f1", marginRight: 10, verticalAlign: "middle" }} />
//             VRN Office Payment
//           </h1>
//           <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
//             {allData.length} pending bill{allData.length !== 1 ? "s" : ""} awaiting payment
//           </p>
//         </div>
//         <div style={{ backgroundColor: "#6366f118", border: "1px solid #6366f130", borderRadius: 10, padding: "8px 18px", fontSize: 13, fontWeight: 600, color: "#6366f1" }}>
//           Stage 5 — Actual Payment
//         </div>
//       </div>

//       {/* ── Filter Card ── */}
//       <div style={{ backgroundColor: "white", borderRadius: 16, padding: "24px 28px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 24, border: "1px solid #f1f5f9" }}>
//         <div style={{ fontSize: 13, fontWeight: 700, color: "#64748b", marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
//           <FaSearch style={{ fontSize: 11, color: "#6366f1" }} />
//           Filter Bills — Select Vendor and/or Office Bill Number
//         </div>

//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 20, alignItems: "flex-end" }}>
//           {/* Vendor Dropdown */}
//           <SearchDropdown
//             label="Vendor Name"
//             placeholder="Search vendor…"
//             value={selectedVendor}
//             onChange={handleVendorChange}
//             options={uniqueVendors}
//             displayKey="Vendor_Name_4"
//           />

//           {/* Bill No Dropdown */}
//           <SearchDropdown
//             label="Office Bill Number"
//             placeholder="Search bill number…"
//             value={selectedBillNo}
//             onChange={setSelectedBillNo}
//             options={billNoOptions}
//             displayKey="OFFBILLUID"
//           />

//           {/* Show Bills Button */}
//           <button
//             onClick={handleFilter}
//             style={{
//               padding: "11px 28px", backgroundColor: "#6366f1", color: "white",
//               border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700,
//               fontSize: 14, display: "flex", alignItems: "center", gap: 8,
//               boxShadow: "0 4px 14px #6366f140", transition: "opacity 0.2s",
//               fontFamily: "inherit", whiteSpace: "nowrap",
//             }}
//             onMouseOver={(e) => (e.currentTarget.style.opacity = "0.88")}
//             onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
//           >
//             <FaSearch style={{ fontSize: 12 }} /> Show Bills
//           </button>
//         </div>

//         {/* Active Filter Chips */}
//         {(selectedVendor || selectedBillNo) && (
//           <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
//             {selectedVendor && (
//               <div style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "#f0f4ff", border: "1px solid #c7d2fe", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 600, color: "#4f46e5" }}>
//                 Vendor: {selectedVendor}
//                 <FaTimes
//                   style={{ fontSize: 10, cursor: "pointer", color: "#6366f1" }}
//                   onClick={() => handleVendorChange("")}
//                 />
//               </div>
//             )}
//             {selectedBillNo && (
//               <div style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "#fefce8", border: "1px solid #fde68a", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 600, color: "#92400e" }}>
//                 Bill No: {selectedBillNo}
//                 <FaTimes
//                   style={{ fontSize: 10, cursor: "pointer", color: "#92400e" }}
//                   onClick={() => setSelectedBillNo("")}
//                 />
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* ── Bills List ── */}
//       {showBills && (
//         <div>
//           {/* Bills List Header */}
//           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
//             <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>
//               {selectedVendor && (
//                 <>Vendor: <span style={{ color: "#6366f1" }}>{selectedVendor}</span></>
//               )}
//               {selectedVendor && selectedBillNo && (
//                 <span style={{ color: "#94a3b8", margin: "0 8px" }}>·</span>
//               )}
//               {selectedBillNo && (
//                 <>Bill No: <span style={{ color: "#f59e0b" }}>{selectedBillNo}</span></>
//               )}
//               <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 500, color: "#94a3b8" }}>
//                 {filteredBills.length} bill{filteredBills.length !== 1 ? "s" : ""} found
//               </span>
//             </div>
//             <button
//               onClick={() => {
//                 setShowBills(false);
//                 setSelectedVendor("");
//                 setSelectedBillNo("");
//                 setSelectedBills([]);
//                 setFilteredBills([]);
//               }}
//               style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 14px", cursor: "pointer", color: "#64748b", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}
//             >
//               <FaTimes style={{ fontSize: 11 }} /> Clear
//             </button>
//           </div>

//           {/* No Bills Found */}
//           {filteredBills.length === 0 ? (
//             <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: 15 }}>
//               No pending bills found for the selected filters.
//             </div>
//           ) : (
//             filteredBills.map((bill) => {
//               const isSelected = selectedBills.includes(bill.uid);
//               const parseAmt = (v) => Number((v || "0").toString().replace(/,/g, "").trim()) || 0;
//               const netAmount = parseAmt(bill.NET_AMOUNT_4);
//               const currentPaid = Number(paidAmounts[bill.uid] || 0);
//               const roundup = Number(roundups[bill.uid] || 0);
//               const effectivePaid = currentPaid + roundup;
//               const balance = netAmount - effectivePaid;
//               const progressPct = netAmount > 0 ? Math.min((effectivePaid / netAmount) * 100, 100) : 0;

//               return (
//                 <div
//                   key={bill.uid}
//                   style={{
//                     backgroundColor: "white", borderRadius: 14, padding: "22px 26px",
//                     marginBottom: 16, border: isSelected ? "2px solid #6366f1" : "1.5px solid #f1f5f9",
//                     boxShadow: isSelected ? "0 0 0 3px #6366f115" : "0 1px 4px rgba(0,0,0,0.05)",
//                     transition: "all 0.2s",
//                   }}
//                 >
//                   {/* Bill Header Row */}
//                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
//                     <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
//                       {/* Checkbox */}
//                       <div
//                         onClick={() => toggleBill(bill.uid)}
//                         style={{
//                           width: 22, height: 22, borderRadius: 6,
//                           border: `2px solid ${isSelected ? "#6366f1" : "#cbd5e1"}`,
//                           backgroundColor: isSelected ? "#6366f1" : "white",
//                           display: "flex", alignItems: "center", justifyContent: "center",
//                           cursor: "pointer", flexShrink: 0, transition: "all 0.15s",
//                         }}
//                       >
//                         {isSelected && <FaCheckCircle style={{ color: "white", fontSize: 12 }} />}
//                       </div>
//                       <div>
//                         <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>
//                           {bill.OFFICE_NAME_1 || bill.Vendor_Name_4}
//                         </div>
//                         <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
//                           {bill.EXPENSES_HEAD_1}{bill.EXPENSES_SUBHEAD_1 ? ` → ${bill.EXPENSES_SUBHEAD_1}` : ""}
//                           {bill.uid && (
//                             <span style={{ marginLeft: 8, color: "#c7d2fe", fontWeight: 600 }}>
//                               UID: {bill.uid}
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                     <AmountBadge label="Bill Amount" amount={netAmount} color="#6366f1" />
//                   </div>

//                   {/* Details Grid */}
//                   <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px 20px", paddingTop: 14, borderTop: "1px solid #f8fafc" }}>
//                     <InfoChip label="Office Bill No" value={bill.OFFBILLUID} accent="#f59e0b" />
//                     <InfoChip label="Item Name" value={bill.ITEM_NAME_1} />
//                     <InfoChip label="Dept" value={bill.DEPARTMENT_1} />
//                     <InfoChip label="Raised By" value={bill.RAISED_BY_1} />
//                     <InfoChip label="Vendor" value={bill.Vendor_Name_4} accent="#6366f1" />
//                     <InfoChip label="Bill No (Vendor)" value={bill.BILL_NO_4} />
//                     <InfoChip label="Bill Date" value={bill.BILL_DATE_4} />
//                     <InfoChip label="GST" value={`CGST: ${bill.CGST_4 || "—"} | SGST: ${bill.SGST_4 || "—"}`} />
//                     <InfoChip label="Planned Date" value={bill.PLANNED_5} accent="#f59e0b" />
//                     <InfoChip label="Payment Mode" value={bill.PAYMENT_MODE_3} />
//                     <InfoChip label="Payee" value={bill.PAYEE_NAME_1} />
//                   </div>

//                   {/* Bill Photo */}
//                   {bill.Bill_Photo && (
//                     <div style={{ marginTop: 14 }}>
//                       <a
//                         href={bill.Bill_Photo} target="_blank" rel="noopener noreferrer"
//                         style={{ fontSize: 12, color: "#6366f1", fontWeight: 600, textDecoration: "none", border: "1px solid #6366f130", borderRadius: 6, padding: "5px 12px", backgroundColor: "#6366f108" }}
//                       >
//                         📎 View Bill Photo
//                       </a>
//                     </div>
//                   )}

//                   {/* ── Per-Bill Payment Inputs ── */}
//                   {isSelected && (
//                     <div style={{ marginTop: 20, padding: "18px 20px", backgroundColor: "#f8f9ff", borderRadius: 12, border: "1px solid #e0e7ff" }}>
//                       <div style={{ fontSize: 13, fontWeight: 700, color: "#4f46e5", marginBottom: 14 }}>
//                         Payment Entry — {bill.ITEM_NAME_1 || bill.uid}
//                       </div>

//                       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
//                         {/* Paid Amount */}
//                         <div>
//                           <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>
//                             PAID AMOUNT ₹
//                           </label>
//                           <input
//                             type="number"
//                             min="0"
//                             max={netAmount}
//                             placeholder="Enter amount"
//                             value={paidAmounts[bill.uid] ?? ""}
//                             onChange={(e) => {
//                               let v = Number(e.target.value);
//                               if (v > netAmount) { alert(`Amount cannot exceed ₹${fmt(netAmount)}`); v = netAmount; }
//                               setPaidAmounts((p) => ({ ...p, [bill.uid]: v }));
//                             }}
//                             style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #a5b4fc", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
//                           />
//                         </div>

//                         {/* Round Off */}
//                         <div>
//                           <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>
//                             ROUND OFF ₹ (+/-)
//                           </label>
//                           <input
//                             type="number"
//                             step="0.01"
//                             min="-9"
//                             max="9"
//                             placeholder="0"
//                             value={roundups[bill.uid] ?? ""}
//                             onChange={(e) => handleRoundupChange(bill.uid, e.target.value)}
//                             style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #fcd34d", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", backgroundColor: "#fffdf0" }}
//                           />
//                         </div>

//                         {/* Balance */}
//                         <div>
//                           <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>
//                             BALANCE ₹
//                           </label>
//                           <input
//                             readOnly
//                             value={fmt(balance)}
//                             style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #fca5a5", fontSize: 14, backgroundColor: "#fff5f5", color: "#dc2626", fontWeight: 700, boxSizing: "border-box", fontFamily: "inherit" }}
//                           />
//                         </div>

//                         {/* Remark */}
//                         <div>
//                           <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>
//                             REMARK
//                           </label>
//                           <input
//                             type="text"
//                             placeholder="Optional remark"
//                             value={remarks[bill.uid] || ""}
//                             onChange={(e) => setRemarks((p) => ({ ...p, [bill.uid]: e.target.value }))}
//                             style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
//                           />
//                         </div>
//                       </div>

//                       {/* Progress Bar */}
//                       {effectivePaid > 0 && (
//                         <div style={{ marginTop: 16 }}>
//                           <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginBottom: 5 }}>
//                             <span>Payment progress</span>
//                             <span>{progressPct.toFixed(1)}%</span>
//                           </div>
//                           <div style={{ height: 6, backgroundColor: "#e0e7ff", borderRadius: 99, overflow: "hidden" }}>
//                             <div style={{ height: "100%", width: `${progressPct}%`, backgroundColor: "#6366f1", borderRadius: 99, transition: "width 0.3s ease" }} />
//                           </div>
//                         </div>
//                       )}

//                       {/* Scroll to Global Payment Button */}
//                       <button
//                         onClick={() => paymentSectionRef.current?.scrollIntoView({ behavior: "smooth" })}
//                         style={{ marginTop: 14, padding: "8px 18px", backgroundColor: "#f0f4ff", border: "1.5px solid #c7d2fe", borderRadius: 8, cursor: "pointer", color: "#4f46e5", fontWeight: 600, fontSize: 12, display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}
//                       >
//                         <FaArrowDown style={{ fontSize: 10 }} /> Go to Global Payment Details
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               );
//             })
//           )}

//           {/* ── Grand Total ── */}
//           {selectedBills.length > 0 && (
//             <div style={{ backgroundColor: "#f0f4ff", border: "1.5px solid #c7d2fe", borderRadius: 14, padding: "16px 24px", marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//               <div style={{ fontSize: 14, fontWeight: 700, color: "#4f46e5" }}>
//                 Grand Total — {selectedBills.length} bill{selectedBills.length > 1 ? "s" : ""} selected
//               </div>
//               <div style={{ fontSize: 24, fontWeight: 800, color: "#4f46e5" }}>
//                 ₹{fmt(grandTotal)}
//               </div>
//             </div>
//           )}

//           {/* ── Global Payment Details ── */}
//           {selectedBills.length > 0 && (
//             <div
//               ref={paymentSectionRef}
//               style={{ backgroundColor: "white", borderRadius: 16, padding: "26px 28px", marginTop: 24, border: "1.5px solid #e0e7ff", boxShadow: "0 4px 16px rgba(99,102,241,0.08)" }}
//             >
//               <div style={{ fontSize: 16, fontWeight: 800, color: "#1e293b", marginBottom: 20 }}>
//                 Global Payment Details
//                 <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 500, color: "#94a3b8" }}>
//                   Applied to all {selectedBills.length} selected bill{selectedBills.length > 1 ? "s" : ""}
//                 </span>
//               </div>

//               <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>

//                 {/* ── Bank Details — Dynamic from API ── */}
//                 <div>
//                   <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>
//                     BANK DETAILS
//                   </label>
//                   <select
//                     value={bankDetails}
//                     onChange={(e) => setBankDetails(e.target.value)}
//                     disabled={isBankLoading}
//                     style={{
//                       width: "100%", padding: "11px 12px", borderRadius: 9,
//                       border: `1.5px solid ${isBankError ? "#fca5a5" : "#e2e8f0"}`,
//                       fontSize: 13, outline: "none", fontFamily: "inherit",
//                       opacity: isBankLoading ? 0.6 : 1,
//                       cursor: isBankLoading ? "wait" : "default",
//                       backgroundColor: isBankLoading ? "#f8fafc" : "white",
//                     }}
//                   >
//                     {/* Placeholder */}
//                     <option value="">
//                       {isBankLoading
//                         ? "⏳ Loading banks…"
//                         : isBankError
//                         ? "⚠️ Load failed — see below"
//                         : "— Select Bank —"}
//                     </option>

//                     {/* ── Dynamic options from API map keys ── */}
//                     {!isBankLoading && !isBankError && bankOptions.map((bank, idx) => (
//                       <option key={idx} value={bank}>{bank}</option>
//                     ))}

//                     {/* ── Static fallback if API fails ── */}
//                     {isBankError && (
//                       <>
//                         <option>Signature Heritage HDFC A/c(0431)</option>
//                         <option>Ultimate Heights A/c</option>
//                         <option>My City A/c</option>
//                         <option>Signature S9 A/c</option>
//                         <option>Ultimate Builder A/C</option>
//                         <option>Ultimate Sky VIlla A/c</option>
//                         <option>VARUN CHAUHAN HDFC(7666)</option>
//                         <option>Signature Paradise A/c(9755)</option>
//                         <option>VRN Petty Cash A/c</option>
//                         <option>VRN INC HDFC A/C(5321)</option>
//                       </>
//                     )}
//                   </select>

//                   {/* Loading indicator */}
//                   {isBankLoading && (
//                     <div style={{ fontSize: 10, color: "#6366f1", marginTop: 4, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
//                       <div style={{ width: 8, height: 8, borderRadius: "50%", border: "1.5px solid #6366f1", borderTopColor: "transparent", animation: "spin 0.6s linear infinite", display: "inline-block" }} />
//                       Fetching bank accounts…
//                     </div>
//                   )}

//                   {/* Error indicator */}
//                   {isBankError && (
//                     <div style={{ fontSize: 10, color: "#ef4444", marginTop: 4, fontWeight: 600 }}>
//                       ⚠️ API error — static list shown as fallback
//                     </div>
//                   )}

//                   {/* Success indicator */}
//                   {!isBankLoading && !isBankError && bankOptions.length > 0 && (
//                     <div style={{ fontSize: 10, color: "#10b981", marginTop: 4, fontWeight: 600 }}>
//                       ✓ {bankOptions.length} accounts loaded
//                     </div>
//                   )}
//                 </div>

//                 {/* ── Payment Mode ── */}
//                 <div>
//                   <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>
//                     PAYMENT MODE
//                   </label>
//                   <select
//                     value={paymentMode}
//                     onChange={(e) => setPaymentMode(e.target.value)}
//                     style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", fontFamily: "inherit" }}
//                   >
//                     <option value="">— Select Mode —</option>
//                     <option>Cheque</option>
//                     <option>NEFT</option>
//                     <option>RTGS</option>
//                     <option>Cash</option>
//                   </select>
//                 </div>

//                 {/* ── Payment Details ── */}
//                 <div>
//                   <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>
//                     {paymentMode === "Cheque" ? "CHEQUE NUMBER" : "PAYMENT DETAILS"}
//                   </label>
//                   <input
//                     type="text"
//                     placeholder={paymentMode === "Cheque" ? "Enter cheque number" : "Ref / UTR / Details"}
//                     value={paymentDetails}
//                     onChange={(e) => setPaymentDetails(e.target.value)}
//                     style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
//                   />
//                 </div>

//                 {/* ── Payment Date ── */}
//                 <div>
//                   <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>
//                     PAYMENT DATE
//                   </label>
//                   <input
//                     type="date"
//                     value={paymentDate}
//                     onChange={(e) => setPaymentDate(e.target.value)}
//                     style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
//                   />
//                 </div>
//               </div>

//               {/* Info Note */}
//               <div style={{ marginTop: 18, padding: "12px 16px", backgroundColor: "#fffbeb", borderRadius: 9, border: "1px solid #fde68a", fontSize: 12, color: "#92400e" }}>
//                 ⚠️ Bank, Payment Mode, Details, और Date सभी selected bills पर apply होंगे। Paid Amount, Round Off और Remark per-bill ऊपर set करें।
//               </div>

//               {/* Submit Button */}
//               <button
//                 onClick={handleSubmit}
//                 disabled={isSubmitting}
//                 style={{
//                   marginTop: 24, padding: "14px 40px",
//                   backgroundColor: isSubmitting ? "#a5b4fc" : "#6366f1",
//                   color: "white", border: "none", borderRadius: 10,
//                   fontWeight: 800, fontSize: 15,
//                   cursor: isSubmitting ? "not-allowed" : "pointer",
//                   boxShadow: "0 4px 16px #6366f135",
//                   fontFamily: "inherit", transition: "background 0.2s",
//                 }}
//                 onMouseOver={(e) => { if (!isSubmitting) e.currentTarget.style.opacity = "0.88"; }}
//                 onMouseOut={(e) => { e.currentTarget.style.opacity = "1"; }}
//               >
//                 {isSubmitting
//                   ? "Submitting…"
//                   : `✓ Submit ${selectedBills.length} Payment${selectedBills.length > 1 ? "s" : ""} — ₹${fmt(grandTotal)}`}
//               </button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ExpensesPayemnt;






// import React, { useState, useEffect, useRef } from "react";
// import { useGetPendingDimPaymentsQuery, useUpdateDimPaymentMutation } from "../../features/OfficeExpense/paymentSlice";
// import { useGetProjectBankMappingQuery } from "../../features/SchedulePayment/SchedulePaymentSlice";
// import { FaSearch, FaChevronDown, FaTimes, FaCheckCircle, FaMoneyBillWave, FaArrowDown } from "react-icons/fa";

// const fmt = (n) =>
//   Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// const InfoChip = ({ label, value, accent }) => (
//   <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
//     <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</span>
//     <span style={{ fontSize: 13, fontWeight: 600, color: accent || "#1e293b" }}>{value || "—"}</span>
//   </div>
// );

// const AmountBadge = ({ label, amount, color }) => (
//   <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", padding: "8px 14px", borderRadius: 10, backgroundColor: color + "18", border: `1px solid ${color}40` }}>
//     <span style={{ fontSize: 10, color: "#64748b", fontWeight: 700, letterSpacing: "0.06em" }}>{label}</span>
//     <span style={{ fontSize: 17, fontWeight: 800, color }}>₹{fmt(amount)}</span>
//   </div>
// );

// // ─── Multi-Select Dropdown ───────────────────────────────────────────────────
// const MultiSelectDropdown = ({ label, placeholder, selectedValues, onChange, options, displayKey }) => {
//   const [open, setOpen] = useState(false);
//   const [search, setSearch] = useState("");
//   const ref = useRef(null);

//   useEffect(() => {
//     const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   const filtered = options.filter((o) =>
//     (o[displayKey] || "").toString().toLowerCase().includes(search.toLowerCase())
//   );

//   const toggleOption = (val) => {
//     if (selectedValues.includes(val)) onChange(selectedValues.filter((v) => v !== val));
//     else onChange([...selectedValues, val]);
//   };

//   const removeChip = (val) => onChange(selectedValues.filter((v) => v !== val));

//   return (
//     <div ref={ref} style={{ position: "relative" }}>
//       <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 6, letterSpacing: "0.07em", textTransform: "uppercase" }}>
//         {label}
//       </label>
//       <div
//         onClick={() => setOpen(true)}
//         style={{
//           minHeight: 44, padding: "6px 40px 6px 10px", borderRadius: 10,
//           border: `1.5px solid ${open ? "#6366f1" : "#e2e8f0"}`,
//           backgroundColor: "white", cursor: "text", boxSizing: "border-box",
//           display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center",
//           transition: "border-color 0.2s",
//         }}
//       >
//         {selectedValues.map((val) => (
//           <div key={val} style={{
//             display: "flex", alignItems: "center", gap: 5, backgroundColor: "#f0f4ff",
//             border: "1px solid #c7d2fe", borderRadius: 20, padding: "3px 10px",
//             fontSize: 12, fontWeight: 600, color: "#4f46e5",
//           }}>
//             {val}
//             <FaTimes style={{ fontSize: 9, cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); removeChip(val); }} />
//           </div>
//         ))}
//         <input
//           value={search}
//           onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
//           placeholder={selectedValues.length === 0 ? placeholder : ""}
//           style={{ border: "none", outline: "none", fontSize: 13, flex: 1, minWidth: 80, backgroundColor: "transparent", fontFamily: "inherit" }}
//         />
//         <FaChevronDown style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 11, pointerEvents: "none" }} />
//       </div>

//       {open && (
//         <ul style={{
//           position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
//           backgroundColor: "white", border: "1.5px solid #e2e8f0", borderRadius: 10,
//           maxHeight: 220, overflowY: "auto", zIndex: 200,
//           listStyle: "none", margin: 0, padding: "6px 0",
//           boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
//         }}>
//           {filtered.length === 0 ? (
//             <li style={{ padding: "10px 16px", fontSize: 13, color: "#94a3b8" }}>No results</li>
//           ) : filtered.map((o, i) => {
//             const val = o[displayKey].toString();
//             const isChecked = selectedValues.includes(val);
//             return (
//               <li key={i} onClick={() => toggleOption(val)}
//                 style={{
//                   padding: "10px 16px", cursor: "pointer", fontSize: 14, color: "#1e293b",
//                   borderBottom: i < filtered.length - 1 ? "1px solid #f1f5f9" : "none",
//                   backgroundColor: isChecked ? "#f0f4ff" : "transparent",
//                   display: "flex", alignItems: "center", gap: 10, transition: "background 0.15s",
//                 }}
//                 onMouseOver={(e) => { if (!isChecked) e.currentTarget.style.backgroundColor = "#f8f9ff"; }}
//                 onMouseOut={(e) => { if (!isChecked) e.currentTarget.style.backgroundColor = "transparent"; }}
//               >
//                 <div style={{
//                   width: 16, height: 16, borderRadius: 4, flexShrink: 0,
//                   border: `2px solid ${isChecked ? "#6366f1" : "#cbd5e1"}`,
//                   backgroundColor: isChecked ? "#6366f1" : "white",
//                   display: "flex", alignItems: "center", justifyContent: "center",
//                 }}>
//                   {isChecked && <FaCheckCircle style={{ color: "white", fontSize: 9 }} />}
//                 </div>
//                 {val}
//               </li>
//             );
//           })}
//         </ul>
//       )}
//     </div>
//   );
// };

// // ─── Main Component ──────────────────────────────────────────────────────────
// const ExpensesPayemnt = () => {
//   const { data: apiData, isLoading, isError, refetch } = useGetPendingDimPaymentsQuery();
//   const [updateDimPayment, { isLoading: isSubmitting }] = useUpdateDimPaymentMutation();
//   const { data: bankMappingData, isLoading: isBankLoading, isError: isBankError } = useGetProjectBankMappingQuery();

//   const bankOptions = React.useMemo(() => {
//     if (!bankMappingData?.map) return [];
//     return Object.keys(bankMappingData.map);
//   }, [bankMappingData]);

//   const allData = apiData?.data || [];

//   const uniqueVendors = [...new Map(
//     allData.filter((d) => d.Vendor_Name_4).map((d) => [d.Vendor_Name_4, { Vendor_Name_4: d.Vendor_Name_4 }])
//   ).values()];

//   const [selectedVendors, setSelectedVendors] = useState([]);
//   const [selectedBillNos, setSelectedBillNos] = useState([]);
//   const [showBills, setShowBills] = useState(false);
//   const [filteredBills, setFilteredBills] = useState([]);
//   const [selectedBills, setSelectedBills] = useState([]);
//   const [paidAmounts, setPaidAmounts] = useState({});
//   const [tdsAmounts, setTdsAmounts] = useState({});
//   const [roundups, setRoundups] = useState({});
//   const [remarks, setRemarks] = useState({});

//   const [bankDetails, setBankDetails] = useState("");
//   const [paymentMode, setPaymentMode] = useState("");
//   const [paymentDetails, setPaymentDetails] = useState("");
//   const [paymentDate, setPaymentDate] = useState("");

//   const paymentSectionRef = useRef(null);

//   const billNoOptions = [...new Map(
//     allData
//       .filter((d) => {
//         if (!d.OFFBILLUID) return false;
//         if (selectedVendors.length > 0) return selectedVendors.includes(d.Vendor_Name_4 || "");
//         return true;
//       })
//       .map((d) => [d.OFFBILLUID.toString(), { OFFBILLUID: d.OFFBILLUID.toString() }])
//   ).values()];

//   const handleFilter = () => {
//     if (selectedVendors.length === 0 && selectedBillNos.length === 0)
//       return alert("कृपया Vendor या Office Bill UID में से कम से एक select करें।");

//     const results = allData.filter((d) => {
//       const vendorMatch = selectedVendors.length > 0 ? selectedVendors.includes(d.Vendor_Name_4 || "") : true;
//       const billMatch = selectedBillNos.length > 0 ? selectedBillNos.includes((d.OFFBILLUID || "").toString()) : true;
//       return vendorMatch && billMatch;
//     });

//     setFilteredBills(results);
//     setShowBills(true);
//     setSelectedBills([]);
//     setPaidAmounts({});
//     setTdsAmounts({});
//     setRoundups({});
//     setRemarks({});
//   };

//   const handleClear = () => {
//     setShowBills(false);
//     setSelectedVendors([]);
//     setSelectedBillNos([]);
//     setSelectedBills([]);
//     setFilteredBills([]);
//     setPaidAmounts({});
//     setTdsAmounts({});
//     setRoundups({});
//     setRemarks({});
//   };

//   const toggleBill = (uid) => {
//     setSelectedBills((prev) => {
//       if (prev.includes(uid)) {
//         setPaidAmounts((p) => { const n = { ...p }; delete n[uid]; return n; });
//         setTdsAmounts((p) => { const n = { ...p }; delete n[uid]; return n; });
//         setRoundups((p) => { const n = { ...p }; delete n[uid]; return n; });
//         setRemarks((p) => { const n = { ...p }; delete n[uid]; return n; });
//         return prev.filter((id) => id !== uid);
//       }
//       setPaidAmounts((p) => ({ ...p, [uid]: "" }));
//       setTdsAmounts((p) => ({ ...p, [uid]: "" }));
//       setRoundups((p) => ({ ...p, [uid]: 0 }));
//       setRemarks((p) => ({ ...p, [uid]: "" }));
//       return [...prev, uid];
//     });
//   };

//   const handleRoundupChange = (uid, value) => {
//     let numValue = value === "" ? 0 : parseFloat(value);
//     if (isNaN(numValue)) numValue = 0;
//     if (numValue > 9) numValue = 9;
//     if (numValue < -9) numValue = -9;
//     setRoundups((prev) => ({ ...prev, [uid]: numValue }));
//   };

//   const grandTotal = selectedBills.reduce(
//     (sum, uid) => sum + (Number(paidAmounts[uid]) || 0) + (Number(roundups[uid]) || 0),
//     0
//   );

//   // ── Submit ────────────────────────────────────────────────────────────────
//   const handleSubmit = async () => {
//     if (selectedBills.length === 0) return alert("कृपया कम से कम एक bill select करें।");
//     if (!bankDetails || !paymentMode || !paymentDetails.trim() || !paymentDate)
//       return alert("सभी Global Payment Details भरें।");

//     const emptyPaid = selectedBills.filter(
//       (uid) => paidAmounts[uid] === "" || paidAmounts[uid] === undefined || isNaN(Number(paidAmounts[uid]))
//     );
//     if (emptyPaid.length > 0) return alert(`${emptyPaid.length} bill(s) में Paid Amount खाली है।`);

//     try {
//       for (const uid of selectedBills) {
//         const bill = filteredBills.find((b) => b.uid === uid);
//         const netAmount = Number((bill?.NET_AMOUNT_4 || "0").toString().replace(/,/g, "").trim()) || 0;
//         const currentPaid = Number(paidAmounts[uid] || 0);
//         const tds = Number(tdsAmounts[uid] || 0);
//         const roundup = Number(roundups[uid] || 0);
//         const effectivePaid = currentPaid + roundup;

//         // ✅ Balance = Paid Amount - TDS
//         const balance = currentPaid - tds;

//         await updateDimPayment({
//           uid,
//           STATUS_5: balance <= 0 ? "Done" : "Partial",
//           NET_AMOUNT_5: netAmount,
//           TDS_5: tds,
//           PAID_AMOUNT_5: effectivePaid,
//           BALANCE_AMOUNT_5: balance,        // ✅ Paid - TDS → BF column
//           BANK_DETAILS_5: bankDetails,
//           PAYMENT_MODE_5: paymentMode,
//           PAYMENT_DETAILS_5: paymentDetails,
//           PAYMENT_DATE_5: paymentDate,
//           Remark_5: remarks[uid] || "",
//         }).unwrap();
//       }

//       alert(`✅ ${selectedBills.length} payment(s) successfully submitted!`);
//       handleClear();
//       setBankDetails("");
//       setPaymentMode("");
//       setPaymentDetails("");
//       setPaymentDate("");
//       refetch();
//     } catch (err) {
//       alert("Error submitting: " + (err?.data?.message || err?.message || "Unknown error"));
//     }
//   };

//   if (isLoading) return (
//     <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", flexDirection: "column", gap: 14 }}>
//       <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #e2e8f0", borderTopColor: "#6366f1", animation: "spin 0.8s linear infinite" }} />
//       <span style={{ color: "#64748b", fontSize: 14 }}>Loading payments…</span>
//       <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
//     </div>
//   );

//   if (isError) return (
//     <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
//       <div style={{ textAlign: "center", color: "#ef4444" }}>
//         <div style={{ fontSize: 40, marginBottom: 8 }}>⚠️</div>
//         <div style={{ fontSize: 16, fontWeight: 600 }}>Failed to load payment data</div>
//       </div>
//     </div>
//   );

//   return (
//     <div style={{ padding: "28px 32px", backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
//       <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

//       {/* Header */}
//       <div style={{ marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//         <div>
//           <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#1e293b", letterSpacing: "-0.5px" }}>
//             <FaMoneyBillWave style={{ color: "#6366f1", marginRight: 10, verticalAlign: "middle" }} />
//             VRN Office Payment
//           </h1>
//           <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
//             {allData.length} pending bill{allData.length !== 1 ? "s" : ""} awaiting payment
//           </p>
//         </div>
//         <div style={{ backgroundColor: "#6366f118", border: "1px solid #6366f130", borderRadius: 10, padding: "8px 18px", fontSize: 13, fontWeight: 600, color: "#6366f1" }}>
//           Stage 5 — Actual Payment
//         </div>
//       </div>

//       {/* Filter Card */}
//       <div style={{ backgroundColor: "white", borderRadius: 16, padding: "24px 28px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 24, border: "1px solid #f1f5f9" }}>
//         <div style={{ fontSize: 13, fontWeight: 700, color: "#64748b", marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
//           <FaSearch style={{ fontSize: 11, color: "#6366f1" }} />
//           Filter Bills — Multiple vendors और bills एक साथ select करें
//         </div>
//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 20, alignItems: "flex-end" }}>
//           <MultiSelectDropdown
//             label="Vendor Name" placeholder="Search & select vendors…"
//             selectedValues={selectedVendors} onChange={setSelectedVendors}
//             options={uniqueVendors} displayKey="Vendor_Name_4"
//           />
//           <MultiSelectDropdown
//             label="Office Bill Number" placeholder="Search & select bill numbers…"
//             selectedValues={selectedBillNos} onChange={setSelectedBillNos}
//             options={billNoOptions} displayKey="OFFBILLUID"
//           />
//           <button onClick={handleFilter}
//             style={{ padding: "11px 28px", backgroundColor: "#6366f1", color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 14px #6366f140", fontFamily: "inherit", whiteSpace: "nowrap" }}
//             onMouseOver={(e) => (e.currentTarget.style.opacity = "0.88")}
//             onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
//           >
//             <FaSearch style={{ fontSize: 12 }} /> Show Bills
//           </button>
//         </div>
//         {(selectedVendors.length > 0 || selectedBillNos.length > 0) && (
//           <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
//             {selectedVendors.length > 0 && (
//               <span style={{ backgroundColor: "#f0f4ff", border: "1px solid #c7d2fe", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600, color: "#4f46e5" }}>
//                 {selectedVendors.length} vendor{selectedVendors.length > 1 ? "s" : ""} selected
//               </span>
//             )}
//             {selectedBillNos.length > 0 && (
//               <span style={{ backgroundColor: "#fefce8", border: "1px solid #fde68a", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600, color: "#92400e" }}>
//                 {selectedBillNos.length} bill{selectedBillNos.length > 1 ? "s" : ""} selected
//               </span>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Bills List */}
//       {showBills && (
//         <div>
//           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
//             <div style={{ fontSize: 14, fontWeight: 600, color: "#64748b" }}>
//               {filteredBills.length} bill{filteredBills.length !== 1 ? "s" : ""} found
//             </div>
//             <button onClick={handleClear}
//               style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 14px", cursor: "pointer", color: "#64748b", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
//               <FaTimes style={{ fontSize: 11 }} /> Clear
//             </button>
//           </div>

//           {filteredBills.length === 0 ? (
//             <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: 15 }}>
//               No pending bills found for the selected filters.
//             </div>
//           ) : filteredBills.map((bill) => {
//             const isSelected = selectedBills.includes(bill.uid);
//             const parseAmt = (v) => Number((v || "0").toString().replace(/,/g, "").trim()) || 0;
//             const netAmount = parseAmt(bill.NET_AMOUNT_4);
//             const currentPaid = Number(paidAmounts[bill.uid] || 0);
//             const tds = Number(tdsAmounts[bill.uid] || 0);
//             const roundup = Number(roundups[bill.uid] || 0);
//             const effectivePaid = currentPaid + roundup;

//             // ✅ Balance = Paid - TDS
//             const balance = currentPaid - tds;
//             const progressPct = netAmount > 0 ? Math.min((effectivePaid / netAmount) * 100, 100) : 0;

//             return (
//               <div key={bill.uid} style={{
//                 backgroundColor: "white", borderRadius: 14, padding: "22px 26px", marginBottom: 16,
//                 border: isSelected ? "2px solid #6366f1" : "1.5px solid #f1f5f9",
//                 boxShadow: isSelected ? "0 0 0 3px #6366f115" : "0 1px 4px rgba(0,0,0,0.05)",
//                 transition: "all 0.2s",
//               }}>
//                 {/* Bill Header */}
//                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
//                   <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
//                     <div onClick={() => toggleBill(bill.uid)} style={{
//                       width: 22, height: 22, borderRadius: 6,
//                       border: `2px solid ${isSelected ? "#6366f1" : "#cbd5e1"}`,
//                       backgroundColor: isSelected ? "#6366f1" : "white",
//                       display: "flex", alignItems: "center", justifyContent: "center",
//                       cursor: "pointer", flexShrink: 0, transition: "all 0.15s",
//                     }}>
//                       {isSelected && <FaCheckCircle style={{ color: "white", fontSize: 12 }} />}
//                     </div>
//                     <div>
//                       <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>{bill.OFFICE_NAME_1 || bill.Vendor_Name_4}</div>
//                       <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
//                         {bill.EXPENSES_HEAD_1}{bill.EXPENSES_SUBHEAD_1 ? ` → ${bill.EXPENSES_SUBHEAD_1}` : ""}
//                         {bill.uid && <span style={{ marginLeft: 8, color: "#c7d2fe", fontWeight: 600 }}>UID: {bill.uid}</span>}
//                       </div>
//                     </div>
//                   </div>
//                   <AmountBadge label="Bill Amount" amount={netAmount} color="#6366f1" />
//                 </div>

//                 {/* Details Grid */}
//                 <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px 20px", paddingTop: 14, borderTop: "1px solid #f8fafc" }}>
//                   <InfoChip label="Office Bill No" value={bill.OFFBILLUID} accent="#f59e0b" />
//                   <InfoChip label="Item Name" value={bill.ITEM_NAME_1} />
//                   <InfoChip label="Dept" value={bill.DEPARTMENT_1} />
//                   <InfoChip label="Raised By" value={bill.RAISED_BY_1} />
//                   <InfoChip label="Vendor" value={bill.Vendor_Name_4} accent="#6366f1" />
//                   <InfoChip label="Bill No (Vendor)" value={bill.BILL_NO_4} />
//                   <InfoChip label="Bill Date" value={bill.BILL_DATE_4} />
//                   <InfoChip label="GST" value={`CGST: ${bill.CGST_4 || "—"} | SGST: ${bill.SGST_4 || "—"}`} />
//                   <InfoChip label="Planned Date" value={bill.PLANNED_5} accent="#f59e0b" />
//                   <InfoChip label="Payment Mode" value={bill.PAYMENT_MODE_3} />
//                   <InfoChip label="Payee" value={bill.PAYEE_NAME_1} />
//                 </div>

//                 {bill.Bill_Photo && (
//                   <div style={{ marginTop: 14 }}>
//                     <a href={bill.Bill_Photo} target="_blank" rel="noopener noreferrer"
//                       style={{ fontSize: 12, color: "#6366f1", fontWeight: 600, textDecoration: "none", border: "1px solid #6366f130", borderRadius: 6, padding: "5px 12px", backgroundColor: "#6366f108" }}>
//                       📎 View Bill Photo
//                     </a>
//                   </div>
//                 )}

//                 {/* ── Payment Inputs ── */}
//                 {isSelected && (
//                   <div style={{ marginTop: 20, padding: "18px 20px", backgroundColor: "#f8f9ff", borderRadius: 12, border: "1px solid #e0e7ff" }}>
//                     <div style={{ fontSize: 13, fontWeight: 700, color: "#4f46e5", marginBottom: 14 }}>
//                       Payment Entry — {bill.ITEM_NAME_1 || bill.uid}
//                     </div>

//                     {/* ✅ 5 columns */}
//                     <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 14 }}>

//                       {/* Paid Amount */}
//                       <div>
//                         <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>PAID AMOUNT ₹</label>
//                         <input
//                           type="number" min="0" placeholder="Enter amount"
//                           value={paidAmounts[bill.uid] ?? ""}
//                           onChange={(e) => setPaidAmounts((p) => ({ ...p, [bill.uid]: Number(e.target.value) }))}
//                           style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #a5b4fc", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
//                         />
//                       </div>

//                       {/* TDS */}
//                       <div>
//                         <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>TDS ₹</label>
//                         <input
//                           type="number" min="0" placeholder="Enter TDS"
//                           value={tdsAmounts[bill.uid] ?? ""}
//                           onChange={(e) => {
//                             let v = Number(e.target.value);
//                             if (isNaN(v) || v < 0) v = 0;
//                             setTdsAmounts((p) => ({ ...p, [bill.uid]: v }));
//                           }}
//                           style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #fbbf24", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", backgroundColor: "#fffdf0" }}
//                         />
//                       </div>

//                       {/* Round Off */}
//                       <div>
//                         <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>ROUND OFF ₹ (+/-)</label>
//                         <input
//                           type="number" step="0.01" min="-9" max="9" placeholder="0"
//                           value={roundups[bill.uid] ?? ""}
//                           onChange={(e) => handleRoundupChange(bill.uid, e.target.value)}
//                           style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #fcd34d", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", backgroundColor: "#fffdf0" }}
//                         />
//                       </div>

//                       {/* ✅ Balance = Paid - TDS */}
//                       <div>
//                         <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>BALANCE ₹ (Paid - TDS)</label>
//                         <input
//                           readOnly value={fmt(balance)}
//                           style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #fca5a5", fontSize: 14, backgroundColor: "#fff5f5", color: "#dc2626", fontWeight: 700, boxSizing: "border-box", fontFamily: "inherit" }}
//                         />
//                       </div>

//                       {/* Remark */}
//                       <div>
//                         <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>REMARK</label>
//                         <input
//                           type="text" placeholder="Optional remark"
//                           value={remarks[bill.uid] || ""}
//                           onChange={(e) => setRemarks((p) => ({ ...p, [bill.uid]: e.target.value }))}
//                           style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
//                         />
//                       </div>
//                     </div>

//                     {/* ✅ Live Summary */}
//                     {(currentPaid > 0 || tds > 0) && (
//                       <div style={{ marginTop: 14, padding: "10px 14px", backgroundColor: "#f0f4ff", borderRadius: 9, border: "1px solid #c7d2fe", display: "flex", gap: 24, fontSize: 12, flexWrap: "wrap" }}>
//                         <span>Net Amount: <strong>₹{fmt(netAmount)}</strong></span>
//                         <span style={{ color: "#4f46e5" }}>Paid: <strong>₹{fmt(currentPaid)}</strong></span>
//                         <span style={{ color: "#d97706" }}>TDS: <strong>₹{fmt(tds)}</strong></span>
//                         <span style={{ color: "#dc2626" }}>Balance (Paid−TDS): <strong>₹{fmt(balance)}</strong></span>
//                       </div>
//                     )}

//                     {/* Progress Bar */}
//                     {effectivePaid > 0 && (
//                       <div style={{ marginTop: 14 }}>
//                         <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginBottom: 5 }}>
//                           <span>Payment progress</span>
//                           <span>{progressPct.toFixed(1)}%</span>
//                         </div>
//                         <div style={{ height: 6, backgroundColor: "#e0e7ff", borderRadius: 99, overflow: "hidden" }}>
//                           <div style={{ height: "100%", width: `${progressPct}%`, backgroundColor: "#6366f1", borderRadius: 99, transition: "width 0.3s ease" }} />
//                         </div>
//                       </div>
//                     )}

//                     <button
//                       onClick={() => paymentSectionRef.current?.scrollIntoView({ behavior: "smooth" })}
//                       style={{ marginTop: 14, padding: "8px 18px", backgroundColor: "#f0f4ff", border: "1.5px solid #c7d2fe", borderRadius: 8, cursor: "pointer", color: "#4f46e5", fontWeight: 600, fontSize: 12, display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}
//                     >
//                       <FaArrowDown style={{ fontSize: 10 }} /> Go to Global Payment Details
//                     </button>
//                   </div>
//                 )}
//               </div>
//             );
//           })}

//           {/* Grand Total */}
//           {selectedBills.length > 0 && (
//             <div style={{ backgroundColor: "#f0f4ff", border: "1.5px solid #c7d2fe", borderRadius: 14, padding: "16px 24px", marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//               <div style={{ fontSize: 14, fontWeight: 700, color: "#4f46e5" }}>
//                 Grand Total — {selectedBills.length} bill{selectedBills.length > 1 ? "s" : ""} selected
//               </div>
//               <div style={{ fontSize: 24, fontWeight: 800, color: "#4f46e5" }}>₹{fmt(grandTotal)}</div>
//             </div>
//           )}

//           {/* Global Payment Details */}
//           {selectedBills.length > 0 && (
//             <div ref={paymentSectionRef}
//               style={{ backgroundColor: "white", borderRadius: 16, padding: "26px 28px", marginTop: 24, border: "1.5px solid #e0e7ff", boxShadow: "0 4px 16px rgba(99,102,241,0.08)" }}>
//               <div style={{ fontSize: 16, fontWeight: 800, color: "#1e293b", marginBottom: 20 }}>
//                 Global Payment Details
//                 <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 500, color: "#94a3b8" }}>
//                   Applied to all {selectedBills.length} selected bill{selectedBills.length > 1 ? "s" : ""}
//                 </span>
//               </div>

//               <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
//                 {/* Bank Details */}
//                 <div>
//                   <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>BANK DETAILS</label>
//                   <select value={bankDetails} onChange={(e) => setBankDetails(e.target.value)} disabled={isBankLoading}
//                     style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: `1.5px solid ${isBankError ? "#fca5a5" : "#e2e8f0"}`, fontSize: 13, outline: "none", fontFamily: "inherit", opacity: isBankLoading ? 0.6 : 1, backgroundColor: isBankLoading ? "#f8fafc" : "white" }}>
//                     <option value="">{isBankLoading ? "⏳ Loading…" : isBankError ? "⚠️ Load failed" : "— Select Bank —"}</option>
//                     {!isBankLoading && !isBankError && bankOptions.map((bank, idx) => <option key={idx} value={bank}>{bank}</option>)}
//                     {isBankError && (<><option>Signature Heritage HDFC A/c(0431)</option><option>My City A/c</option><option>VRN Petty Cash A/c</option></>)}
//                   </select>
//                   {isBankLoading && <div style={{ fontSize: 10, color: "#6366f1", marginTop: 4, fontWeight: 600 }}>Fetching bank accounts…</div>}
//                   {isBankError && <div style={{ fontSize: 10, color: "#ef4444", marginTop: 4, fontWeight: 600 }}>⚠️ API error — static list shown</div>}
//                   {!isBankLoading && !isBankError && bankOptions.length > 0 && <div style={{ fontSize: 10, color: "#10b981", marginTop: 4, fontWeight: 600 }}>✓ {bankOptions.length} accounts loaded</div>}
//                 </div>

//                 {/* Payment Mode */}
//                 <div>
//                   <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>PAYMENT MODE</label>
//                   <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}
//                     style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", fontFamily: "inherit" }}>
//                     <option value="">— Select Mode —</option>
//                     <option>Cheque</option><option>NEFT</option><option>RTGS</option><option>Cash</option>
//                   </select>
//                 </div>

//                 {/* Payment Details */}
//                 <div>
//                   <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>
//                     {paymentMode === "Cheque" ? "CHEQUE NUMBER" : "PAYMENT DETAILS"}
//                   </label>
//                   <input type="text" placeholder={paymentMode === "Cheque" ? "Enter cheque number" : "Ref / UTR / Details"}
//                     value={paymentDetails} onChange={(e) => setPaymentDetails(e.target.value)}
//                     style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
//                 </div>

//                 {/* Payment Date */}
//                 <div>
//                   <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>PAYMENT DATE</label>
//                   <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)}
//                     style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
//                 </div>
//               </div>

//               <div style={{ marginTop: 18, padding: "12px 16px", backgroundColor: "#fffbeb", borderRadius: 9, border: "1px solid #fde68a", fontSize: 12, color: "#92400e" }}>
//                 ⚠️ Bank, Payment Mode, Details, और Date सभी selected bills पर apply होंगे। Paid Amount, TDS, Round Off और Remark per-bill ऊपर set करें।
//               </div>

//               <button onClick={handleSubmit} disabled={isSubmitting}
//                 style={{ marginTop: 24, padding: "14px 40px", backgroundColor: isSubmitting ? "#a5b4fc" : "#6366f1", color: "white", border: "none", borderRadius: 10, fontWeight: 800, fontSize: 15, cursor: isSubmitting ? "not-allowed" : "pointer", boxShadow: "0 4px 16px #6366f135", fontFamily: "inherit" }}
//                 onMouseOver={(e) => { if (!isSubmitting) e.currentTarget.style.opacity = "0.88"; }}
//                 onMouseOut={(e) => { e.currentTarget.style.opacity = "1"; }}
//               >
//                 {isSubmitting ? "Submitting…" : `✓ Submit ${selectedBills.length} Payment${selectedBills.length > 1 ? "s" : ""} — ₹${fmt(grandTotal)}`}
//               </button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ExpensesPayemnt;





import React, { useState, useEffect, useRef } from "react";
import { useGetPendingDimPaymentsQuery, useUpdateDimPaymentMutation } from "../../features/OfficeExpense/paymentSlice";
import { useGetProjectBankMappingQuery } from "../../features/SchedulePayment/SchedulePaymentSlice";
import { FaSearch, FaChevronDown, FaTimes, FaCheckCircle, FaMoneyBillWave, FaArrowDown } from "react-icons/fa";

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const InfoChip = ({ label, value, accent }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
    <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 600, color: accent || "#1e293b" }}>{value || "—"}</span>
  </div>
);

const AmountBadge = ({ label, amount, color }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", padding: "8px 14px", borderRadius: 10, backgroundColor: color + "18", border: `1px solid ${color}40` }}>
    <span style={{ fontSize: 10, color: "#64748b", fontWeight: 700, letterSpacing: "0.06em" }}>{label}</span>
    <span style={{ fontSize: 17, fontWeight: 800, color }}>₹{fmt(amount)}</span>
  </div>
);

// ─── Multi-Select Dropdown (Enhanced) ───────────────────────────────────────
const MultiSelectDropdown = ({ label, placeholder, selectedValues, onChange, options, displayKey }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter((o) =>
    (o[displayKey] || "").toString().toLowerCase().includes(search.toLowerCase())
  );

  const toggleOption = (val) => {
    if (selectedValues.includes(val)) onChange(selectedValues.filter((v) => v !== val));
    else onChange([...selectedValues, val]);
  };

  const removeTag = (val) => onChange(selectedValues.filter((v) => v !== val));

  const selectAll = () => {
    const allVals = filtered.map((o) => o[displayKey].toString());
    onChange([...new Set([...selectedValues, ...allVals])]);
  };

  const clearAll = () => onChange([]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 6, letterSpacing: "0.07em", textTransform: "uppercase" }}>
        {label}
        {selectedValues.length > 0 && (
          <span style={{ marginLeft: 8, backgroundColor: "#6366f1", color: "white", borderRadius: 10, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>
            {selectedValues.length}
          </span>
        )}
      </label>

      {/* Selected Tags */}
      {selectedValues.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8, maxHeight: 80, overflowY: "auto" }}>
          {selectedValues.map((val) => (
            <span key={val} style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              backgroundColor: "#eef2ff", color: "#4f46e5", border: "1px solid #c7d2fe",
              borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 600,
            }}>
              {val}
              <FaTimes onClick={() => removeTag(val)} style={{ fontSize: 9, cursor: "pointer", color: "#6366f1" }} />
            </span>
          ))}
          <span onClick={clearAll} style={{
            display: "inline-flex", alignItems: "center",
            backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca",
            borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer",
          }}>
            Clear All ✕
          </span>
        </div>
      )}

      {/* Search Input */}
      <div style={{ position: "relative" }}>
        <input
          value={search}
          onFocus={() => setOpen(true)}
          onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
          placeholder={selectedValues.length > 0 ? `${selectedValues.length} selected — search more…` : placeholder}
          style={{
            width: "100%", padding: "11px 40px 11px 14px", borderRadius: 10,
            border: open ? "1.5px solid #6366f1" : "1.5px solid #e2e8f0",
            fontSize: 14, outline: "none", backgroundColor: "white",
            boxSizing: "border-box", transition: "border-color 0.2s", fontFamily: "inherit",
          }}
        />
        <FaChevronDown style={{
          position: "absolute", right: 13, top: "50%",
          transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`,
          color: "#94a3b8", fontSize: 11, transition: "transform 0.2s",
        }} />
      </div>

      {/* Dropdown List */}
      {open && (
        <ul style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
          backgroundColor: "white", border: "1.5px solid #e2e8f0", borderRadius: 10,
          maxHeight: 240, overflowY: "auto", zIndex: 200,
          listStyle: "none", margin: 0, padding: 0,
          boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
        }}>
          {/* Select All / Deselect All row */}
          <li style={{ padding: "8px 16px", display: "flex", justifyContent: "space-between", borderBottom: "1.5px solid #f1f5f9", backgroundColor: "#f8fafc" }}>
            <span onClick={selectAll} style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", cursor: "pointer", textDecoration: "underline" }}>
              Select All ({filtered.length})
            </span>
            <span onClick={clearAll} style={{ fontSize: 12, fontWeight: 700, color: "#ef4444", cursor: "pointer", textDecoration: "underline" }}>
              Deselect All
            </span>
          </li>

          {filtered.length === 0 ? (
            <li style={{ padding: "14px 16px", fontSize: 13, color: "#94a3b8", textAlign: "center" }}>No results found</li>
          ) : filtered.map((o, i) => {
            const val = o[displayKey].toString();
            const isChecked = selectedValues.includes(val);
            return (
              <li key={i} onClick={() => toggleOption(val)}
                style={{
                  padding: "10px 16px", cursor: "pointer", fontSize: 14, color: "#1e293b",
                  display: "flex", alignItems: "center", gap: 10,
                  borderBottom: i < filtered.length - 1 ? "1px solid #f1f5f9" : "none",
                  backgroundColor: isChecked ? "#f0f4ff" : "transparent",
                  transition: "background 0.15s",
                }}
                onMouseOver={(e) => { if (!isChecked) e.currentTarget.style.backgroundColor = "#f8fafc"; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = isChecked ? "#f0f4ff" : "transparent"; }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                  border: `2px solid ${isChecked ? "#6366f1" : "#cbd5e1"}`,
                  backgroundColor: isChecked ? "#6366f1" : "white",
                  display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
                }}>
                  {isChecked && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span style={{ fontWeight: isChecked ? 600 : 400 }}>{val}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const ExpensesPayemnt = () => {
  const { data: apiData, isLoading, isError, refetch } = useGetPendingDimPaymentsQuery();
  const [updateDimPayment, { isLoading: isSubmitting }] = useUpdateDimPaymentMutation();
  const { data: bankMappingData, isLoading: isBankLoading, isError: isBankError } = useGetProjectBankMappingQuery();

  const bankOptions = React.useMemo(() => {
    if (!bankMappingData?.map) return [];
    return Object.keys(bankMappingData.map);
  }, [bankMappingData]);

  const allData = apiData?.data || [];

  const uniqueVendors = [...new Map(
    allData.filter((d) => d.Vendor_Name_4).map((d) => [d.Vendor_Name_4, { Vendor_Name_4: d.Vendor_Name_4 }])
  ).values()];

  const [selectedVendors, setSelectedVendors] = useState([]);
  const [selectedBillNos, setSelectedBillNos] = useState([]);
  const [showBills, setShowBills] = useState(false);
  const [filteredBills, setFilteredBills] = useState([]);
  const [selectedBills, setSelectedBills] = useState([]);
  const [paidAmounts, setPaidAmounts] = useState({});
  const [tdsAmounts, setTdsAmounts] = useState({});
  const [roundups, setRoundups] = useState({});
  const [remarks, setRemarks] = useState({});

  const [bankDetails, setBankDetails] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [paymentDate, setPaymentDate] = useState("");

  const paymentSectionRef = useRef(null);

  const billNoOptions = [...new Map(
    allData
      .filter((d) => {
        if (!d.OFFBILLUID) return false;
        if (selectedVendors.length > 0) return selectedVendors.includes(d.Vendor_Name_4 || "");
        return true;
      })
      .map((d) => [d.OFFBILLUID.toString(), { OFFBILLUID: d.OFFBILLUID.toString() }])
  ).values()];

  const handleFilter = () => {
    if (selectedVendors.length === 0 && selectedBillNos.length === 0)
      return alert("कृपया Vendor या Office Bill UID में से कम से एक select करें।");

    const results = allData.filter((d) => {
      const vendorMatch = selectedVendors.length > 0 ? selectedVendors.includes(d.Vendor_Name_4 || "") : true;
      const billMatch = selectedBillNos.length > 0 ? selectedBillNos.includes((d.OFFBILLUID || "").toString()) : true;
      return vendorMatch && billMatch;
    });

    setFilteredBills(results);
    setShowBills(true);
    setSelectedBills([]);
    setPaidAmounts({});
    setTdsAmounts({});
    setRoundups({});
    setRemarks({});
  };

  const handleClear = () => {
    setShowBills(false);
    setSelectedVendors([]);
    setSelectedBillNos([]);
    setSelectedBills([]);
    setFilteredBills([]);
    setPaidAmounts({});
    setTdsAmounts({});
    setRoundups({});
    setRemarks({});
  };

  const toggleBill = (uid) => {
    setSelectedBills((prev) => {
      if (prev.includes(uid)) {
        setPaidAmounts((p) => { const n = { ...p }; delete n[uid]; return n; });
        setTdsAmounts((p) => { const n = { ...p }; delete n[uid]; return n; });
        setRoundups((p) => { const n = { ...p }; delete n[uid]; return n; });
        setRemarks((p) => { const n = { ...p }; delete n[uid]; return n; });
        return prev.filter((id) => id !== uid);
      }
      setPaidAmounts((p) => ({ ...p, [uid]: "" }));
      setTdsAmounts((p) => ({ ...p, [uid]: "" }));
      setRoundups((p) => ({ ...p, [uid]: 0 }));
      setRemarks((p) => ({ ...p, [uid]: "" }));
      return [...prev, uid];
    });
  };

  // ✅ Select All / Deselect All bills
  const selectAllBills = () => {
    const allUids = filteredBills.map((b) => b.uid);
    setSelectedBills(allUids);
    const newPaid = {}, newTds = {}, newRound = {}, newRemarks = {};
    allUids.forEach((uid) => {
      newPaid[uid]    = paidAmounts[uid]  ?? "";
      newTds[uid]     = tdsAmounts[uid]   ?? "";
      newRound[uid]   = roundups[uid]     ?? 0;
      newRemarks[uid] = remarks[uid]      ?? "";
    });
    setPaidAmounts(newPaid);
    setTdsAmounts(newTds);
    setRoundups(newRound);
    setRemarks(newRemarks);
  };

  const deselectAllBills = () => {
    setSelectedBills([]);
    setPaidAmounts({});
    setTdsAmounts({});
    setRoundups({});
    setRemarks({});
  };

  const handleRoundupChange = (uid, value) => {
    let numValue = value === "" ? 0 : parseFloat(value);
    if (isNaN(numValue)) numValue = 0;
    if (numValue > 9) numValue = 9;
    if (numValue < -9) numValue = -9;
    setRoundups((prev) => ({ ...prev, [uid]: numValue }));
  };

  // ✅ Grand Total = sum of (Paid - TDS + RoundOff)
  const grandTotal = selectedBills.reduce((sum, uid) => {
    const paid  = Number(paidAmounts[uid] || 0);
    const tds   = Number(tdsAmounts[uid]  || 0);
    const round = Number(roundups[uid]    || 0);
    return sum + (paid - tds) + round;
  }, 0);

  const handleSubmit = async () => {
    if (selectedBills.length === 0) return alert("कृपया कम से कम एक bill select करें।");
    if (!bankDetails || !paymentMode || !paymentDetails.trim() || !paymentDate)
      return alert("सभी Global Payment Details भरें।");

    const emptyPaid = selectedBills.filter(
      (uid) => paidAmounts[uid] === "" || paidAmounts[uid] === undefined || isNaN(Number(paidAmounts[uid]))
    );
    if (emptyPaid.length > 0) return alert(`${emptyPaid.length} bill(s) में Paid Amount खाली है।`);

    // ✅ TDS validation
    const invalidTds = selectedBills.filter((uid) => {
      const paid = Number(paidAmounts[uid] || 0);
      const tds  = Number(tdsAmounts[uid]  || 0);
      return tds > paid;
    });
    if (invalidTds.length > 0)
      return alert(`${invalidTds.length} bill(s) में TDS, Paid Amount से ज़्यादा है।`);

    try {
      for (const uid of selectedBills) {
        const bill      = filteredBills.find((b) => b.uid === uid);
        const netAmount = Number((bill?.NET_AMOUNT_4 || "0").toString().replace(/,/g, "").trim()) || 0;
        const currentPaid = Number(paidAmounts[uid] || 0);
        const tds         = Number(tdsAmounts[uid]  || 0);
        const roundup     = Number(roundups[uid]    || 0);

        // ✅ Net Payable = Paid - TDS + RoundOff
        const netPayable = (currentPaid - tds) + roundup;

        await updateDimPayment({
          uid,
          STATUS_5:          "Done",
          NET_AMOUNT_5:      netAmount,
          TDS_5:             tds || "",
          PAID_AMOUNT_5:     currentPaid,
          BALANCE_AMOUNT_5:  netPayable,          // ✅ Paid - TDS + RoundOff → BF column
          BANK_DETAILS_5:    bankDetails,
          PAYMENT_MODE_5:    paymentMode,
          PAYMENT_DETAILS_5: paymentDetails,
          PAYMENT_DATE_5:    paymentDate,
          Remark_5:          remarks[uid] || "",
        }).unwrap();
      }

      alert(`✅ ${selectedBills.length} payment(s) successfully submitted!`);
      handleClear();
      setBankDetails(""); setPaymentMode(""); setPaymentDetails(""); setPaymentDate("");
      refetch();
    } catch (err) {
      alert("Error submitting: " + (err?.data?.message || err?.message || "Unknown error"));
    }
  };

  if (isLoading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", flexDirection: "column", gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #e2e8f0", borderTopColor: "#6366f1", animation: "spin 0.8s linear infinite" }} />
      <span style={{ color: "#64748b", fontSize: 14 }}>Loading payments…</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (isError) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
      <div style={{ textAlign: "center", color: "#ef4444" }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>⚠️</div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Failed to load payment data</div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "28px 32px", backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#1e293b", letterSpacing: "-0.5px" }}>
            <FaMoneyBillWave style={{ color: "#6366f1", marginRight: 10, verticalAlign: "middle" }} />
            VRN Office Payment
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
            {allData.length} pending bill{allData.length !== 1 ? "s" : ""} awaiting payment
          </p>
        </div>
        <div style={{ backgroundColor: "#6366f118", border: "1px solid #6366f130", borderRadius: 10, padding: "8px 18px", fontSize: 13, fontWeight: 600, color: "#6366f1" }}>
          Stage 5 — Actual Payment
        </div>
      </div>

      {/* Filter Card */}
      <div style={{ backgroundColor: "white", borderRadius: 16, padding: "24px 28px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 24, border: "1px solid #f1f5f9" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 16 }}>
          🔍 Filter Bills
          <span style={{ fontSize: 12, fontWeight: 400, color: "#94a3b8", marginLeft: 10 }}>
            Vendor और Bill Number select करें (AND logic)
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <MultiSelectDropdown
            label="Vendor Name" placeholder="Search & select vendors…"
            selectedValues={selectedVendors} onChange={setSelectedVendors}
            options={uniqueVendors} displayKey="Vendor_Name_4"
          />
          <MultiSelectDropdown
            label="Office Bill Number" placeholder="Search & select bill numbers…"
            selectedValues={selectedBillNos} onChange={setSelectedBillNos}
            options={billNoOptions} displayKey="OFFBILLUID"
          />
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={handleFilter}
            style={{ padding: "11px 28px", backgroundColor: "#6366f1", color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 14px #6366f140", fontFamily: "inherit" }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.88")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <FaSearch style={{ fontSize: 12 }} /> Show Bills
          </button>

          {(selectedVendors.length > 0 || selectedBillNos.length > 0) && (
            <button onClick={handleClear}
              style={{ padding: "11px 20px", backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
              <FaTimes style={{ fontSize: 11 }} /> Clear Filters
            </button>
          )}

          {(selectedVendors.length > 0 || selectedBillNos.length > 0) && (
            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
              {selectedVendors.length > 0 && `${selectedVendors.length} vendor(s)`}
              {selectedVendors.length > 0 && selectedBillNos.length > 0 && " + "}
              {selectedBillNos.length > 0 && `${selectedBillNos.length} bill(s)`}
              {" selected"}
            </span>
          )}
        </div>
      </div>

      {/* Bills List */}
      {showBills && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>
              Filtered Bills
              <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 500, color: "#94a3b8" }}>
                {filteredBills.length} bill{filteredBills.length !== 1 ? "s" : ""} found
              </span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {filteredBills.length > 0 && (
                <button
                  onClick={selectedBills.length === filteredBills.length ? deselectAllBills : selectAllBills}
                  style={{ background: "none", border: "1px solid #c7d2fe", borderRadius: 8, padding: "7px 14px", cursor: "pointer", color: "#4f46e5", fontWeight: 600, fontSize: 12, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}
                >
                  <FaCheckCircle style={{ fontSize: 11 }} />
                  {selectedBills.length === filteredBills.length ? "Deselect All" : "Select All"}
                </button>
              )}
              <button onClick={handleClear}
                style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 14px", cursor: "pointer", color: "#64748b", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
                <FaTimes style={{ fontSize: 11 }} /> Clear
              </button>
            </div>
          </div>

          {filteredBills.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: 15, backgroundColor: "white", borderRadius: 14, border: "1px solid #f1f5f9" }}>
              No pending bills found for the selected filters.
            </div>
          ) : filteredBills.map((bill) => {
            const isSelected  = selectedBills.includes(bill.uid);
            const parseAmt    = (v) => Number((v || "0").toString().replace(/,/g, "").trim()) || 0;
            const netAmount   = parseAmt(bill.NET_AMOUNT_4);
            const currentPaid = Number(paidAmounts[bill.uid] || 0);
            const tds         = Number(tdsAmounts[bill.uid]  || 0);
            const roundup     = Number(roundups[bill.uid]    || 0);

            // ✅ Net Payable = Paid - TDS + RoundOff
            const netPayable  = (currentPaid - tds) + roundup;
            const progressPct = netAmount > 0 ? Math.min((netPayable / netAmount) * 100, 100) : 0;

            return (
              <div key={bill.uid} style={{
                backgroundColor: "white", borderRadius: 14, padding: "22px 26px", marginBottom: 16,
                border: isSelected ? "2px solid #6366f1" : "1.5px solid #f1f5f9",
                boxShadow: isSelected ? "0 0 0 3px #6366f115" : "0 1px 4px rgba(0,0,0,0.05)",
                transition: "all 0.2s",
              }}>
                {/* Bill Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <div onClick={() => toggleBill(bill.uid)} style={{
                      width: 22, height: 22, borderRadius: 6,
                      border: `2px solid ${isSelected ? "#6366f1" : "#cbd5e1"}`,
                      backgroundColor: isSelected ? "#6366f1" : "white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", flexShrink: 0, transition: "all 0.15s",
                    }}>
                      {isSelected && <FaCheckCircle style={{ color: "white", fontSize: 12 }} />}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>{bill.OFFICE_NAME_1 || bill.Vendor_Name_4}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                        {bill.EXPENSES_HEAD_1}{bill.EXPENSES_SUBHEAD_1 ? ` → ${bill.EXPENSES_SUBHEAD_1}` : ""}
                        {bill.OFFBILLUID && (
                          <span style={{ marginLeft: 8, color: "#f59e0b", fontWeight: 600, backgroundColor: "#fef3c7", padding: "1px 6px", borderRadius: 4, fontSize: 11 }}>
                            {bill.OFFBILLUID}
                          </span>
                        )}
                        {bill.uid && <span style={{ marginLeft: 6, color: "#c7d2fe", fontWeight: 600 }}>UID: {bill.uid}</span>}
                      </div>
                    </div>
                  </div>
                  <AmountBadge label="Bill Amount" amount={netAmount} color="#6366f1" />
                </div>

                {/* Details Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px 20px", paddingTop: 14, borderTop: "1px solid #f8fafc" }}>
                  <InfoChip label="Office Bill No" value={bill.OFFBILLUID} accent="#f59e0b" />
                  <InfoChip label="Item Name" value={bill.ITEM_NAME_1} />
                  <InfoChip label="Dept" value={bill.DEPARTMENT_1} />
                  <InfoChip label="Raised By" value={bill.RAISED_BY_1} />
                  <InfoChip label="Vendor" value={bill.Vendor_Name_4} accent="#6366f1" />
                  <InfoChip label="Bill No (Vendor)" value={bill.BILL_NO_4} />
                  <InfoChip label="Bill Date" value={bill.BILL_DATE_4} />
                  <InfoChip label="GST" value={`CGST: ${bill.CGST_4 || "—"} | SGST: ${bill.SGST_4 || "—"}`} />
                  <InfoChip label="Planned Date" value={bill.PLANNED_5} accent="#f59e0b" />
                  <InfoChip label="Payment Mode" value={bill.PAYMENT_MODE_3} />
                  <InfoChip label="Payee" value={bill.PAYEE_NAME_1} />
                </div>

                {bill.Bill_Photo && (
                  <div style={{ marginTop: 14 }}>
                    <a href={bill.Bill_Photo} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 12, color: "#6366f1", fontWeight: 600, textDecoration: "none", border: "1px solid #6366f130", borderRadius: 6, padding: "5px 12px", backgroundColor: "#6366f108" }}>
                      📎 View Bill Photo
                    </a>
                  </div>
                )}

                {/* Payment Inputs */}
                {isSelected && (
                  <div style={{ marginTop: 20, padding: "18px 20px", backgroundColor: "#f8f9ff", borderRadius: 12, border: "1px solid #e0e7ff" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#4f46e5", marginBottom: 14 }}>
                      Payment Entry — {bill.ITEM_NAME_1 || bill.uid}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 16 }}>

                      {/* 1. Paid Amount */}
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>PAID AMOUNT ₹</label>
                        <input
                          type="number" min="0" placeholder="Enter amount"
                          value={paidAmounts[bill.uid] ?? ""}
                          onChange={(e) => setPaidAmounts((p) => ({ ...p, [bill.uid]: Number(e.target.value) }))}
                          style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #a5b4fc", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                        />
                      </div>

                      {/* 2. TDS */}
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>
                          TDS ₹
                          <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 600, color: "#94a3b8", backgroundColor: "#f1f5f9", borderRadius: 4, padding: "1px 5px" }}>
                            OPTIONAL
                          </span>
                        </label>
                        <input
                          type="number" min="0" placeholder="0 (optional)"
                          value={tdsAmounts[bill.uid] ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") { setTdsAmounts((p) => ({ ...p, [bill.uid]: "" })); return; }
                            let v = Number(val);
                            const paid = Number(paidAmounts[bill.uid] || 0);
                            if (v > paid) {
                              alert(`TDS (₹${v}) Paid Amount (₹${fmt(paid)}) से ज़्यादा नहीं हो सकता`);
                              v = paid;
                            }
                            setTdsAmounts((p) => ({ ...p, [bill.uid]: v }));
                          }}
                          style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #86efac", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", backgroundColor: "#f0fdf4" }}
                        />
                      </div>

                      {/* 3. Round Off */}
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>ROUND OFF ₹ (+/-)</label>
                        <input
                          type="number" step="0.01" min="-9" max="9" placeholder="0"
                          value={roundups[bill.uid] ?? ""}
                          onChange={(e) => handleRoundupChange(bill.uid, e.target.value)}
                          style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #fcd34d", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", backgroundColor: "#fffdf0" }}
                        />
                      </div>

                      {/* 4. Net Payable (readonly) */}
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>NET PAYABLE ₹</label>
                        <input
                          readOnly value={fmt(netPayable)}
                          style={{
                            width: "100%", padding: "10px 12px", borderRadius: 9,
                            border: `1.5px solid ${netPayable > 0 ? "#86efac" : "#fca5a5"}`,
                            fontSize: 14,
                            backgroundColor: netPayable > 0 ? "#f0fdf4" : "#fff5f5",
                            color: netPayable > 0 ? "#16a34a" : "#dc2626",
                            fontWeight: 700, boxSizing: "border-box", fontFamily: "inherit",
                          }}
                        />
                        {tds > 0 && (
                          <div style={{ fontSize: 10, color: "#64748b", marginTop: 4, fontWeight: 600 }}>
                            ₹{fmt(currentPaid)} − ₹{fmt(tds)} TDS
                            {roundup !== 0 && ` ${roundup > 0 ? "+" : ""}${fmt(roundup)}`}
                          </div>
                        )}
                      </div>

                      {/* 5. Remark */}
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>REMARK</label>
                        <input
                          type="text" placeholder="Optional remark"
                          value={remarks[bill.uid] || ""}
                          onChange={(e) => setRemarks((p) => ({ ...p, [bill.uid]: e.target.value }))}
                          style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                        />
                      </div>
                    </div>

                    {/* Summary Row */}
                    {(currentPaid > 0 || tds > 0) && (
                      <div style={{ marginTop: 14, padding: "10px 16px", backgroundColor: "#eef2ff", borderRadius: 8, border: "1px solid #c7d2fe", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, fontSize: 12 }}>
                        <span style={{ color: "#4f46e5", fontWeight: 600 }}>Paid: ₹{fmt(currentPaid)}</span>
                        {tds > 0 && <span style={{ color: "#dc2626", fontWeight: 600 }}>− TDS: ₹{fmt(tds)}</span>}
                        {roundup !== 0 && <span style={{ color: "#f59e0b", fontWeight: 600 }}>{roundup > 0 ? "+" : ""}Round Off: ₹{fmt(roundup)}</span>}
                        <span style={{ color: "#16a34a", fontWeight: 800 }}>= Net Payable: ₹{fmt(netPayable)}</span>
                      </div>
                    )}

                    {/* Progress Bar */}
                    {netPayable > 0 && (
                      <div style={{ marginTop: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginBottom: 5 }}>
                          <span>Payment progress{tds > 0 ? ` (TDS ₹${fmt(tds)} deducted)` : ""}</span>
                          <span>{progressPct.toFixed(1)}%</span>
                        </div>
                        <div style={{ height: 6, backgroundColor: "#e0e7ff", borderRadius: 99, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${progressPct}%`, backgroundColor: "#6366f1", borderRadius: 99, transition: "width 0.3s ease" }} />
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => paymentSectionRef.current?.scrollIntoView({ behavior: "smooth" })}
                      style={{ marginTop: 14, padding: "8px 18px", backgroundColor: "#f0f4ff", border: "1.5px solid #c7d2fe", borderRadius: 8, cursor: "pointer", color: "#4f46e5", fontWeight: 600, fontSize: 12, display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}
                    >
                      <FaArrowDown style={{ fontSize: 10 }} /> Go to Global Payment Details
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Grand Total */}
          {selectedBills.length > 0 && (
            <div style={{ backgroundColor: "#f0f4ff", border: "1.5px solid #c7d2fe", borderRadius: 14, padding: "16px 24px", marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#4f46e5" }}>
                Grand Total — {selectedBills.length} bill{selectedBills.length > 1 ? "s" : ""} selected
                {selectedBills.some((uid) => Number(tdsAmounts[uid] || 0) > 0) && (
                  <span style={{ marginLeft: 12, fontSize: 12, fontWeight: 500, color: "#dc2626" }}>
                    (Total TDS: ₹{fmt(selectedBills.reduce((s, uid) => s + Number(tdsAmounts[uid] || 0), 0))})
                  </span>
                )}
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#4f46e5" }}>₹{fmt(grandTotal)}</div>
            </div>
          )}

          {/* Global Payment Details */}
          {selectedBills.length > 0 && (
            <div ref={paymentSectionRef}
              style={{ backgroundColor: "white", borderRadius: 16, padding: "26px 28px", marginTop: 24, border: "1.5px solid #e0e7ff", boxShadow: "0 4px 16px rgba(99,102,241,0.08)" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#1e293b", marginBottom: 20 }}>
                Global Payment Details
                <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 500, color: "#94a3b8" }}>
                  Applied to all {selectedBills.length} selected bill{selectedBills.length > 1 ? "s" : ""}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
                {/* Bank Details — Dynamic */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>BANK DETAILS</label>
                  <select value={bankDetails} onChange={(e) => setBankDetails(e.target.value)} disabled={isBankLoading}
                    style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: `1.5px solid ${isBankError ? "#fca5a5" : "#e2e8f0"}`, fontSize: 13, outline: "none", fontFamily: "inherit", opacity: isBankLoading ? 0.6 : 1, backgroundColor: isBankLoading ? "#f8fafc" : "white" }}>
                    <option value="">{isBankLoading ? "⏳ Loading…" : isBankError ? "⚠️ Load failed" : "— Select Bank —"}</option>
                    {!isBankLoading && !isBankError && bankOptions.map((bank, idx) => <option key={idx} value={bank}>{bank}</option>)}
                    {isBankError && (<><option>Signature Heritage HDFC A/c(0431)</option><option>My City A/c</option><option>VRN Petty Cash A/c</option></>)}
                  </select>
                  {isBankLoading && <div style={{ fontSize: 10, color: "#6366f1", marginTop: 4, fontWeight: 600 }}>Fetching bank accounts…</div>}
                  {isBankError && <div style={{ fontSize: 10, color: "#ef4444", marginTop: 4, fontWeight: 600 }}>⚠️ API error — static list shown</div>}
                  {!isBankLoading && !isBankError && bankOptions.length > 0 && <div style={{ fontSize: 10, color: "#10b981", marginTop: 4, fontWeight: 600 }}>✓ {bankOptions.length} accounts loaded</div>}
                </div>

                {/* Payment Mode */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>PAYMENT MODE</label>
                  <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}
                    style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", fontFamily: "inherit" }}>
                    <option value="">— Select Mode —</option>
                    <option>Cheque</option><option>NEFT</option><option>RTGS</option><option>Cash</option>
                  </select>
                </div>

                {/* Payment Details */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>
                    {paymentMode === "Cheque" ? "CHEQUE NUMBER" : "PAYMENT DETAILS"}
                  </label>
                  <input type="text" placeholder={paymentMode === "Cheque" ? "Enter cheque number" : "Ref / UTR / Details"}
                    value={paymentDetails} onChange={(e) => setPaymentDetails(e.target.value)}
                    style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
                </div>

                {/* Payment Date */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, letterSpacing: "0.07em" }}>PAYMENT DATE</label>
                  <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)}
                    style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
                </div>
              </div>

              <div style={{ marginTop: 18, padding: "12px 16px", backgroundColor: "#fffbeb", borderRadius: 9, border: "1px solid #fde68a", fontSize: 12, color: "#92400e" }}>
                ⚠️ Bank, Payment Mode, Details, और Date सभी selected bills पर apply होंगे। Paid Amount, TDS, Round Off और Remark per-bill ऊपर set करें।
              </div>

              <button onClick={handleSubmit} disabled={isSubmitting}
                style={{ marginTop: 24, padding: "14px 40px", backgroundColor: isSubmitting ? "#a5b4fc" : "#6366f1", color: "white", border: "none", borderRadius: 10, fontWeight: 800, fontSize: 15, cursor: isSubmitting ? "not-allowed" : "pointer", boxShadow: "0 4px 16px #6366f135", fontFamily: "inherit", transition: "background 0.2s" }}
                onMouseOver={(e) => { if (!isSubmitting) e.currentTarget.style.opacity = "0.88"; }}
                onMouseOut={(e) => { e.currentTarget.style.opacity = "1"; }}
              >
                {isSubmitting ? "Submitting…" : `✓ Submit ${selectedBills.length} Payment${selectedBills.length > 1 ? "s" : ""} — ₹${fmt(grandTotal)}`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpensesPayemnt;