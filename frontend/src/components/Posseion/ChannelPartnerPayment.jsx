


// import React, { useState } from "react";
// import {
//   useGetAllCPPaymentsQuery,
//   useUpdateCPPaymentMutation,
// } from "../../features/UnitPosseion/CPPaymentSlice";

// // ─── STATUS BADGE ────────────────────────────────────────────
// const StatusBadge = ({ status }) => {
//   const s = (status || "").toLowerCase();
//   const styles = {
//     pending:  "bg-amber-100 text-amber-700 border border-amber-200",
//     done:     "bg-green-100 text-green-700 border border-green-200",
//     approved: "bg-blue-100  text-blue-700  border border-blue-200",
//     rejected: "bg-red-100   text-red-700   border border-red-200",
//   };
//   const cls = styles[s] || "bg-gray-100 text-gray-600 border border-gray-200";
//   return (
//     <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
//       {status || "—"}
//     </span>
//   );
// };

// // ─── UPDATE MODAL ────────────────────────────────────────────
// const UpdateModal = ({ record, onClose }) => {
//   const [updateCPPayment, { isLoading }] = useUpdateCPPaymentMutation();

//   const agreementValue = parseFloat((record?.agreementValue || "0").toString().replace(/,/g, "")) || 0;

//   const [form, setForm] = useState({
//     status:              record?.Status               || "",
//     channelPartnerName:  record?.Channel_Partner_Name  || "",
//     contact:             record?.CP_Contact            || "",
//     amountToBePaid:      record?.Amount_to_be_Paid     || "",
//     percentOfBasicPrice: record?.Percent_of_Basic_Price || "",
//     remarks:             record?.Remarks               || "",
//   });



//   // Separate file states for doc and photo
//   const [docFiles,   setDocFiles]   = useState([]);
//   const [photoFiles, setPhotoFiles] = useState([]);
//   const [toast,      setToast]      = useState(null);

//   const showToast = (msg, type = "success") => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 3000);
//   };

//   // Auto-calculate % when amount changes
//   const handleAmountChange = (val) => {
//     const amt = parseFloat(val.replace(/,/g, "")) || 0;
//     const pct = agreementValue > 0 ? ((amt / agreementValue) * 100).toFixed(2) : "";
//     setForm((prev) => ({ ...prev, amountToBePaid: val, percentOfBasicPrice: pct }));
//   };

//   const handleSubmit = async () => {
//     try {
//       // Combine both file arrays - backend separates by mimetype
//       const allFiles = [...docFiles, ...photoFiles];

//       const res = await updateCPPayment({
//         id:                  record.id,
//         status:              form.status,
//         channelPartnerName:  form.channelPartnerName,
//         contact:             form.contact,
//         amountToBePaid:      form.amountToBePaid,
//         percentOfBasicPrice: form.percentOfBasicPrice,
//         remarks:             form.remarks,
//         documents:           allFiles,
//       });
//       if (res?.data?.success) {
//         showToast("Record successfully update ho gaya!");
//         setTimeout(onClose, 1500);
//       } else {
//         showToast(res?.error?.message || "Update failed", "error");
//       }
//     } catch {
//       showToast("Kuch gadbad ho gayi, dobara try karo", "error");
//     }
//   };

//   const inputCls = "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-400";

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] flex flex-col">

//         {/* Header */}
//         <div className="bg-gradient-to-r from-purple-700 to-purple-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
//           <div>
//             <h2 className="text-white font-bold text-lg">CP Payment Update</h2>
//             <p className="text-purple-200 text-xs mt-0.5">
//               ID: {record?.id} — {record?.applicantName}
//             </p>
//           </div>
//           <button onClick={onClose} className="text-purple-200 hover:text-white text-2xl leading-none transition">
//             x
//           </button>
//         </div>

//         {/* Info Strip */}
//         <div className="bg-purple-50 px-6 py-3 grid grid-cols-4 gap-3 border-b border-purple-100 flex-shrink-0">
//           <div>
//             <p className="text-xs text-purple-400 font-semibold uppercase tracking-wide">Project</p>
//             <p className="text-sm text-purple-800 font-medium truncate">{record?.project || "—"}</p>
//           </div>
//           <div>
//             <p className="text-xs text-purple-400 font-semibold uppercase tracking-wide">Unit No</p>
//             <p className="text-sm text-purple-800 font-medium">{record?.unitNo || "—"}</p>
//           </div>
//           <div>
//             <p className="text-xs text-purple-400 font-semibold uppercase tracking-wide">Block</p>
//             <p className="text-sm text-purple-800 font-medium">{record?.block || "—"}</p>
//           </div>
//           <div>
//             <p className="text-xs text-purple-400 font-semibold uppercase tracking-wide">Agr. Value</p>
//             <p className="text-sm text-purple-800 font-medium">
//               {agreementValue ? `Rs.${agreementValue.toLocaleString("en-IN")}` : "—"}
//             </p>
//           </div>
//         </div>

//         {/* Scrollable Body */}
//         <div className="p-6 space-y-4 overflow-y-auto flex-1">

//           {/* Status */}
//           <div>
//             <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Status</label>
//             <select
//               value={form.status}
//               onChange={(e) => setForm({ ...form, status: e.target.value })}
//               className={inputCls}
//             >
//               <option value="">-- Select Status --</option>
//               <option value="Pending">Pending</option>
//               <option value="Done">Done</option>
//               <option value="Approved">Approved</option>
//               <option value="Rejected">Rejected</option>
//             </select>
//           </div>

//           {/* CP Name + Contact */}
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Channel Partner Name</label>
//               <input
//                 type="text"
//                 placeholder="CP ka naam..."
//                 value={form.channelPartnerName}
//                 onChange={(e) => setForm({ ...form, channelPartnerName: e.target.value })}
//                 className={inputCls}
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">CP Contact</label>
//               <input
//                 type="text"
//                 placeholder="Contact number..."
//                 value={form.contact}
//                 onChange={(e) => setForm({ ...form, contact: e.target.value })}
//                 className={inputCls}
//               />
//             </div>
//           </div>

//           {/* Amount + Auto % */}
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
//                 Amount to be Paid
//               </label>
//               <input
//                 type="number"
//                 placeholder="Amount dalte hi % auto-calculate hoga..."
//                 value={form.amountToBePaid}
//                 onChange={(e) => handleAmountChange(e.target.value)}
//                 className={inputCls}
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
//                 % of Basic Price
//                 <span className="ml-1 text-purple-400 normal-case font-normal">(auto-calculated)</span>
//               </label>
//               <div className="relative">
//                 <input
//                   type="text"
//                   readOnly
//                   value={form.percentOfBasicPrice ? `${form.percentOfBasicPrice}%` : ""}
//                   placeholder="Amount dalne par auto fill hoga"
//                   className={`${inputCls} bg-purple-50 text-purple-700 font-semibold cursor-not-allowed`}
//                 />
//                 {form.percentOfBasicPrice && (
//                   <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-purple-400">✓ auto</span>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Document Upload */}
//           <div>
//             <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
//               Document Upload — PDF / Word (AJ Column)
//             </label>
//             <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-slate-300 rounded-xl py-3 cursor-pointer hover:border-purple-400 bg-slate-50 transition">
//               <span className="text-xl mb-0.5">📄</span>
//               <span className="text-xs text-slate-500">
//                 {docFiles.length > 0 ? `${docFiles.length} document(s) selected` : "PDF ya Word files choose karo"}
//               </span>
//               <input
//                 type="file"
//                 multiple
//                 accept=".pdf,.doc,.docx,.xls,.xlsx"
//                 className="hidden"
//                 onChange={(e) => setDocFiles(Array.from(e.target.files))}
//               />
//             </label>
//             {docFiles.length > 0 && (
//               <ul className="mt-1.5 space-y-1">
//                 {docFiles.map((f, i) => (
//                   <li key={i} className="text-xs text-slate-500 flex items-center gap-1">📄 {f.name}</li>
//                 ))}
//               </ul>
//             )}
//           </div>

//           {/* Photo Upload */}
//           <div>
//             <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
//               Photo Upload — Images (AK Column)
//             </label>
//             <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-slate-300 rounded-xl py-3 cursor-pointer hover:border-purple-400 bg-slate-50 transition">
//               <span className="text-xl mb-0.5">🖼️</span>
//               <span className="text-xs text-slate-500">
//                 {photoFiles.length > 0 ? `${photoFiles.length} photo(s) selected` : "JPG, PNG, WEBP photos choose karo"}
//               </span>
//               <input
//                 type="file"
//                 multiple
//                 accept="image/*"
//                 className="hidden"
//                 onChange={(e) => setPhotoFiles(Array.from(e.target.files))}
//               />
//             </label>
//             {photoFiles.length > 0 && (
//               <ul className="mt-1.5 space-y-1">
//                 {photoFiles.map((f, i) => (
//                   <li key={i} className="text-xs text-slate-500 flex items-center gap-1">🖼️ {f.name}</li>
//                 ))}
//               </ul>
//             )}
//           </div>

//           {/* Remarks */}
//           <div>
//             <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Remarks</label>
//             <textarea
//               rows={3}
//               placeholder="Koi bhi note ya remarks..."
//               value={form.remarks}
//               onChange={(e) => setForm({ ...form, remarks: e.target.value })}
//               className={`${inputCls} resize-none`}
//             />
//           </div>

//           {/* Toast */}
//           {toast && (
//             <div className={`rounded-xl px-4 py-2.5 text-sm font-medium text-center ${
//               toast.type === "error"
//                 ? "bg-red-50 text-red-600 border border-red-200"
//                 : "bg-green-50 text-green-600 border border-green-200"
//             }`}>
//               {toast.msg}
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="px-6 pb-6 pt-2 flex gap-3 flex-shrink-0 border-t border-slate-100">
//           <button
//             onClick={onClose}
//             className="flex-1 border border-slate-200 text-slate-600 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-50 transition"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleSubmit}
//             disabled={isLoading}
//             className="flex-1 bg-purple-700 hover:bg-purple-800 text-white rounded-xl py-2.5 text-sm font-semibold transition disabled:opacity-50"
//           >
//             {isLoading ? "Updating..." : "Update Karo"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─── MAIN PAGE ───────────────────────────────────────────────
// const ChannelPartnerPayment = () => {
//   const { data, isLoading, isError, error, refetch } = useGetAllCPPaymentsQuery();

//   const [search,         setSearch]         = useState("");
//   const [selectedRecord, setSelectedRecord] = useState(null);

//   const records  = data?.data || [];

//   const filtered = records.filter((r) => {
//     const q = search.toLowerCase();
//     return (
//       r.applicantName?.toLowerCase().includes(q) ||
//       r.id?.toString().includes(q) ||
//       r.project?.toLowerCase().includes(q) ||
//       r.unitNo?.toLowerCase().includes(q) ||
//       r.Channel_Partner_Name?.toLowerCase().includes(q)
//     );
//   });

//   // ── Loading ──
//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-slate-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3" />
//           <p className="text-slate-500 text-sm">Data load ho raha hai...</p>
//         </div>
//       </div>
//     );
//   }

//   // ── Error ──
//   if (isError) {
//     return (
//       <div className="min-h-screen bg-slate-50 flex items-center justify-center">
//         <div className="bg-white border border-red-200 rounded-2xl p-8 text-center shadow-sm max-w-sm">
//           <div className="text-4xl mb-3">⚠️</div>
//           <p className="text-red-600 font-semibold mb-1">Data load nahi hua</p>
//           <p className="text-slate-400 text-xs mb-4">{error?.message}</p>
//           <button
//             onClick={refetch}
//             className="bg-purple-700 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-purple-800 transition"
//           >
//             Dobara Try Karo
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // ── Main Page ──
//   return (
//     <div className="min-h-screen bg-slate-50">

//       {selectedRecord && (
//         <UpdateModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
//       )}

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

//         {/* Page Header */}
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold text-slate-800">Channel Partner Payment</h1>
//           <p className="text-slate-500 text-sm mt-1">Sabhi pending CP payment records yahan dikhayi denge</p>
//         </div>

//         {/* Stats + Search */}
//         <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-6">
//           <div className="flex gap-3">
//             <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-center shadow-sm">
//               <p className="text-xl font-bold text-slate-800">{records.length}</p>
//               <p className="text-xs text-slate-400">Total Records</p>
//             </div>
//             <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-center shadow-sm">
//               <p className="text-xl font-bold text-amber-600">
//                 {records.filter((r) => r.Status?.toLowerCase() === "pending").length}
//               </p>
//               <p className="text-xs text-amber-500">Pending</p>
//             </div>
//             <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-center shadow-sm">
//               <p className="text-xl font-bold text-green-600">
//                 {records.filter((r) => r.Status?.toLowerCase() === "done").length}
//               </p>
//               <p className="text-xs text-green-500">Done</p>
//             </div>
//           </div>

//           <div className="flex gap-2 w-full sm:w-auto">
//             <input
//               type="text"
//               placeholder="ID, naam, project, CP name se search..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 w-full sm:w-72 shadow-sm"
//             />
//             <button
//               onClick={refetch}
//               title="Refresh"
//               className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-500 hover:bg-slate-50 shadow-sm transition"
//             >
//               🔄
//             </button>
//           </div>
//         </div>

//         {/* Table */}
//         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="bg-slate-50 border-b border-slate-200">
//                   {[
//                     "#", "ID", "Applicant Name", "Project", "Block",
//                     "Unit No", "Agreement Value", "CP Name",
//                     "CP Contact", "Amount to Pay", "% Basic",
//                     "Date", "Status", "Action"
//                   ].map((h) => (
//                     <th
//                       key={h}
//                       className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
//                     >
//                       {h}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100">
//                 {filtered.length === 0 ? (
//                   <tr>
//                     <td colSpan={14} className="text-center py-16 text-slate-400 text-sm">
//                       <div className="text-3xl mb-2">📭</div>
//                       Koi record nahi mila
//                     </td>
//                   </tr>
//                 ) : (
//                   filtered.map((item, idx) => (
//                     <tr key={item.id || idx} className="hover:bg-slate-50 transition">
//                       <td className="px-4 py-3 text-slate-400 text-xs">{idx + 1}</td>
//                       <td className="px-4 py-3 font-mono text-xs text-slate-600">{item.id}</td>
//                       <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{item.applicantName}</td>
//                       <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{item.project}</td>
//                       <td className="px-4 py-3 text-slate-600">{item.block}</td>
//                       <td className="px-4 py-3 text-slate-600">{item.unitNo}</td>
//                       <td className="px-4 py-3 text-slate-700 font-medium whitespace-nowrap">
//                         {item.agreementValue
//                           ? `Rs. ${Number(item.agreementValue).toLocaleString("en-IN")}`
//                           : "—"}
//                       </td>
//                       <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{item.Channel_Partner_Name || "—"}</td>
//                       <td className="px-4 py-3 text-slate-600">{item.CP_Contact || "—"}</td>
//                       <td className="px-4 py-3 text-slate-700 font-medium whitespace-nowrap">
//                         {item.Amount_to_be_Paid
//                           ? `Rs. ${Number(item.Amount_to_be_Paid).toLocaleString("en-IN")}`
//                           : "—"}
//                       </td>
//                       <td className="px-4 py-3 text-slate-600">
//                         {item.Percent_of_Basic_Price ? `${item.Percent_of_Basic_Price}%` : "—"}
//                       </td>
//                       <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{item.date}</td>
//                       <td className="px-4 py-3"><StatusBadge status={item.Status} /></td>
//                       <td className="px-4 py-3">
//                         <button
//                           onClick={() => setSelectedRecord(item)}
//                           className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
//                         >
//                           Update
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {filtered.length > 0 && (
//             <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
//               {filtered.length} records dikh rahe hain
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChannelPartnerPayment;




///////// 





import React, { useState } from "react";
import {
  useGetAllCPPaymentsQuery,
  useUpdateCPPaymentMutation,
} from "../../features/UnitPosseion/CPPaymentSlice";

// ─── STATUS BADGE ────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const s = (status || "").toLowerCase();
  const styles = {
    pending:  "bg-amber-100 text-amber-700 border border-amber-200",
    done:     "bg-green-100 text-green-700 border border-green-200",
    approved: "bg-blue-100  text-blue-700  border border-blue-200",
    rejected: "bg-red-100   text-red-700   border border-red-200",
  };
  const cls = styles[s] || "bg-gray-100 text-gray-600 border border-gray-200";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {status || "—"}
    </span>
  );
};

// ─── UPDATE MODAL ────────────────────────────────────────────
const UpdateModal = ({ record, onClose }) => {
  const [updateCPPayment, { isLoading }] = useUpdateCPPaymentMutation();

  const isDone = (record?.Status || "").toLowerCase() === "done";
  const agreementValue = parseFloat((record?.agreementValue || "0").toString().replace(/,/g, "")) || 0;

  const [form, setForm] = useState({
    status:              record?.Status               || "",
    channelPartnerName:  record?.Channel_Partner_Name  || "",
    contact:             record?.CP_Contact            || "",
    amountToBePaid:      record?.Amount_to_be_Paid     || "",
    percentOfBasicPrice: record?.Percent_of_Basic_Price || "",
    remarks:             record?.Remarks               || "",
  });

  const [docFiles,   setDocFiles]   = useState([]);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [toast,      setToast]      = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Auto-calculate % when amount changes (only for Pending)
  const handleAmountChange = (val) => {
    const amt = parseFloat(val.replace(/,/g, "")) || 0;
    const pct = agreementValue > 0 ? ((amt / agreementValue) * 100).toFixed(2) : "";
    setForm((prev) => ({ ...prev, amountToBePaid: val, percentOfBasicPrice: pct }));
  };

  const handleSubmit = async () => {
    try {
      let payload;

      if (isDone) {
        // Done mode: sirf photo bhejo, baaki sab existing values preserve
        payload = {
          id:                  record.id,
          status:              record.Status,
          channelPartnerName:  record.Channel_Partner_Name || "",
          contact:             record.CP_Contact           || "",
          amountToBePaid:      record.Amount_to_be_Paid    || "",
          percentOfBasicPrice: record.Percent_of_Basic_Price || "",
          remarks:             record.Remarks              || "",
          documentUrl:         record.Upload_Douc          || "",
          documents:           photoFiles, // sirf photos
        };
      } else {
        // Pending mode: sab kuch bhejo
        const allFiles = [...docFiles, ...photoFiles];
        payload = {
          id:                  record.id,
          status:              form.status,
          channelPartnerName:  form.channelPartnerName,
          contact:             form.contact,
          amountToBePaid:      form.amountToBePaid,
          percentOfBasicPrice: form.percentOfBasicPrice,
          remarks:             form.remarks,
          documents:           allFiles,
        };
      }

      const res = await updateCPPayment(payload);

      if (res?.data?.success) {
        showToast(isDone ? "Photo successfully upload ho gayi!" : "Record successfully update ho gaya!");
        setTimeout(onClose, 1500);
      } else {
        showToast(res?.error?.message || "Update failed", "error");
      }
    } catch {
      showToast("Kuch gadbad ho gayi, dobara try karo", "error");
    }
  };

  const inputCls     = "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-400";
  const readonlyCls  = "w-full border border-slate-100 rounded-xl px-4 py-2.5 text-sm text-slate-400 bg-slate-100 cursor-not-allowed select-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between flex-shrink-0 bg-gradient-to-r ${isDone ? "from-green-700 to-green-600" : "from-purple-700 to-purple-600"}`}>
          <div>
            <h2 className="text-white font-bold text-lg">
              {isDone ? "📸 Photo Upload (Done Record)" : "CP Payment Update"}
            </h2>
            <p className={`text-xs mt-0.5 ${isDone ? "text-green-200" : "text-purple-200"}`}>
              ID: {record?.id} — {record?.applicantName}
              {isDone && <span className="ml-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">Done</span>}
            </p>
          </div>
          <button onClick={onClose} className={`text-2xl leading-none transition ${isDone ? "text-green-200 hover:text-white" : "text-purple-200 hover:text-white"}`}>
            x
          </button>
        </div>

        {/* Info Strip */}
        <div className={`px-6 py-3 grid grid-cols-4 gap-3 border-b flex-shrink-0 ${isDone ? "bg-green-50 border-green-100" : "bg-purple-50 border-purple-100"}`}>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide ${isDone ? "text-green-400" : "text-purple-400"}`}>Project</p>
            <p className={`text-sm font-medium truncate ${isDone ? "text-green-800" : "text-purple-800"}`}>{record?.project || "—"}</p>
          </div>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide ${isDone ? "text-green-400" : "text-purple-400"}`}>Unit No</p>
            <p className={`text-sm font-medium ${isDone ? "text-green-800" : "text-purple-800"}`}>{record?.unitNo || "—"}</p>
          </div>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide ${isDone ? "text-green-400" : "text-purple-400"}`}>Block</p>
            <p className={`text-sm font-medium ${isDone ? "text-green-800" : "text-purple-800"}`}>{record?.block || "—"}</p>
          </div>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide ${isDone ? "text-green-400" : "text-purple-400"}`}>Agr. Value</p>
            <p className={`text-sm font-medium ${isDone ? "text-green-800" : "text-purple-800"}`}>
              {agreementValue ? `Rs.${agreementValue.toLocaleString("en-IN")}` : "—"}
            </p>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">

          {/* Done mode banner */}
          {isDone && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
              <p className="font-semibold mb-0.5">✅ Yeh record Done hai</p>
              <p className="text-xs text-green-600">Sirf Photo upload kar sakte ho — baaki sab fields locked hain</p>
            </div>
          )}

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Status</label>
            {isDone ? (
              <div className={readonlyCls}>Done</div>
            ) : (
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
                <option value="">-- Select Status --</option>
                <option value="Pending">Pending</option>
                <option value="Done">Done</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            )}
          </div>

          {/* CP Name + Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Channel Partner Name</label>
              <input
                type="text"
                readOnly={isDone}
                placeholder="CP ka naam..."
                value={isDone ? (record?.Channel_Partner_Name || "—") : form.channelPartnerName}
                onChange={(e) => !isDone && setForm({ ...form, channelPartnerName: e.target.value })}
                className={isDone ? readonlyCls : inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">CP Contact</label>
              <input
                type="text"
                readOnly={isDone}
                placeholder="Contact number..."
                value={isDone ? (record?.CP_Contact || "—") : form.contact}
                onChange={(e) => !isDone && setForm({ ...form, contact: e.target.value })}
                className={isDone ? readonlyCls : inputCls}
              />
            </div>
          </div>

          {/* Amount + Auto % */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Amount to be Paid</label>
              <input
                type={isDone ? "text" : "number"}
                readOnly={isDone}
                placeholder="Amount dalte hi % auto-calculate hoga..."
                value={isDone ? (record?.Amount_to_be_Paid || "—") : form.amountToBePaid}
                onChange={(e) => !isDone && handleAmountChange(e.target.value)}
                className={isDone ? readonlyCls : inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                % of Basic Price
                {!isDone && <span className="ml-1 text-purple-400 normal-case font-normal">(auto-calculated)</span>}
              </label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={isDone
                    ? (record?.Percent_of_Basic_Price ? `${record.Percent_of_Basic_Price}%` : "—")
                    : (form.percentOfBasicPrice ? `${form.percentOfBasicPrice}%` : "")
                  }
                  placeholder="Amount dalne par auto fill hoga"
                  className={isDone ? readonlyCls : `${inputCls} bg-purple-50 text-purple-700 font-semibold cursor-not-allowed`}
                />
                {!isDone && form.percentOfBasicPrice && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-purple-400">✓ auto</span>
                )}
              </div>
            </div>
          </div>

          {/* Document Upload - sirf Pending me */}
          {!isDone && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                Document Upload — PDF / Word (AJ Column)
              </label>
              <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-slate-300 rounded-xl py-3 cursor-pointer hover:border-purple-400 bg-slate-50 transition">
                <span className="text-xl mb-0.5">📄</span>
                <span className="text-xs text-slate-500">
                  {docFiles.length > 0 ? `${docFiles.length} document(s) selected` : "PDF ya Word files choose karo"}
                </span>
                <input type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx" className="hidden" onChange={(e) => setDocFiles(Array.from(e.target.files))} />
              </label>
              {docFiles.length > 0 && (
                <ul className="mt-1.5 space-y-1">
                  {docFiles.map((f, i) => <li key={i} className="text-xs text-slate-500 flex items-center gap-1">📄 {f.name}</li>)}
                </ul>
              )}
            </div>
          )}

          {/* Photo Upload - hamesha visible */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
              Photo Upload — Images (AK Column)
              {isDone && <span className="ml-2 text-green-500 normal-case font-normal">← Yahi sirf edit ho sakta hai</span>}
            </label>
            <label className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl py-3 cursor-pointer transition ${isDone ? "border-green-300 hover:border-green-500 bg-green-50" : "border-slate-300 hover:border-purple-400 bg-slate-50"}`}>
              <span className="text-xl mb-0.5">🖼️</span>
              <span className="text-xs text-slate-500">
                {photoFiles.length > 0 ? `${photoFiles.length} photo(s) selected` : "JPG, PNG, WEBP photos choose karo"}
              </span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => setPhotoFiles(Array.from(e.target.files))} />
            </label>
            {photoFiles.length > 0 && (
              <ul className="mt-1.5 space-y-1">
                {photoFiles.map((f, i) => <li key={i} className="text-xs text-slate-500 flex items-center gap-1">🖼️ {f.name}</li>)}
              </ul>
            )}
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Remarks</label>
            <textarea
              rows={3}
              readOnly={isDone}
              placeholder="Koi bhi note ya remarks..."
              value={isDone ? (record?.Remarks || "—") : form.remarks}
              onChange={(e) => !isDone && setForm({ ...form, remarks: e.target.value })}
              className={`${isDone ? readonlyCls : inputCls} resize-none`}
            />
          </div>

          {/* Toast */}
          {toast && (
            <div className={`rounded-xl px-4 py-2.5 text-sm font-medium text-center ${
              toast.type === "error" ? "bg-red-50 text-red-600 border border-red-200" : "bg-green-50 text-green-600 border border-green-200"
            }`}>
              {toast.msg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 flex gap-3 flex-shrink-0 border-t border-slate-100">
          <button onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-50 transition">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || (isDone && photoFiles.length === 0)}
            className={`flex-1 text-white rounded-xl py-2.5 text-sm font-semibold transition disabled:opacity-50 ${isDone ? "bg-green-700 hover:bg-green-800" : "bg-purple-700 hover:bg-purple-800"}`}
          >
            {isLoading ? "Uploading..." : isDone ? "Photo Upload Karo" : "Update Karo"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN PAGE ───────────────────────────────────────────────
const ChannelPartnerPayment = () => {
  const { data, isLoading, isError, error, refetch } = useGetAllCPPaymentsQuery();

  const [search,         setSearch]         = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

  const records  = data?.data || [];

  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.applicantName?.toLowerCase().includes(q) ||
      r.id?.toString().includes(q) ||
      r.project?.toLowerCase().includes(q) ||
      r.unitNo?.toLowerCase().includes(q) ||
      r.Channel_Partner_Name?.toLowerCase().includes(q)
    );
  });

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Data load ho raha hai...</p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white border border-red-200 rounded-2xl p-8 text-center shadow-sm max-w-sm">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-red-600 font-semibold mb-1">Data load nahi hua</p>
          <p className="text-slate-400 text-xs mb-4">{error?.message}</p>
          <button
            onClick={refetch}
            className="bg-purple-700 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-purple-800 transition"
          >
            Dobara Try Karo
          </button>
        </div>
      </div>
    );
  }

  // ── Main Page ──
  return (
    <div className="min-h-screen bg-slate-50">

      {selectedRecord && (
        <UpdateModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Channel Partner Payment</h1>
          <p className="text-slate-500 text-sm mt-1">Sabhi pending CP payment records yahan dikhayi denge</p>
        </div>

        {/* Stats + Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-6">
          <div className="flex gap-3">
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-center shadow-sm">
              <p className="text-xl font-bold text-slate-800">{records.length}</p>
              <p className="text-xs text-slate-400">Total Records</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-center shadow-sm">
              <p className="text-xl font-bold text-amber-600">
                {records.filter((r) => r.Status?.toLowerCase() === "pending").length}
              </p>
              <p className="text-xs text-amber-500">Pending</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-center shadow-sm">
              <p className="text-xl font-bold text-green-600">
                {records.filter((r) => r.Status?.toLowerCase() === "done").length}
              </p>
              <p className="text-xs text-green-500">Done</p>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="ID, naam, project, CP name se search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 w-full sm:w-72 shadow-sm"
            />
            <button
              onClick={refetch}
              title="Refresh"
              className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-500 hover:bg-slate-50 shadow-sm transition"
            >
              🔄
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {[
                    "#", "ID", "Applicant Name", "Project", "Block",
                    "Unit No", "Agreement Value", "CP Name",
                    "CP Contact", "Amount to Pay", "% Basic",
                    "Date", "Status", "Action"
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="text-center py-16 text-slate-400 text-sm">
                      <div className="text-3xl mb-2">📭</div>
                      Koi record nahi mila
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 text-slate-400 text-xs">{idx + 1}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">{item.id}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{item.applicantName}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{item.project}</td>
                      <td className="px-4 py-3 text-slate-600">{item.block}</td>
                      <td className="px-4 py-3 text-slate-600">{item.unitNo}</td>
                      <td className="px-4 py-3 text-slate-700 font-medium whitespace-nowrap">
                        {item.agreementValue
                          ? `Rs. ${Number(item.agreementValue).toLocaleString("en-IN")}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{item.Channel_Partner_Name || "—"}</td>
                      <td className="px-4 py-3 text-slate-600">{item.CP_Contact || "—"}</td>
                      <td className="px-4 py-3 text-slate-700 font-medium whitespace-nowrap">
                        {item.Amount_to_be_Paid
                          ? `Rs. ${Number(item.Amount_to_be_Paid).toLocaleString("en-IN")}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {item.Percent_of_Basic_Price ? `${item.Percent_of_Basic_Price}%` : "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{item.date}</td>
                      <td className="px-4 py-3"><StatusBadge status={item.Status} /></td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedRecord(item)}
                          className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
              {filtered.length} records dikh rahe hain
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelPartnerPayment;