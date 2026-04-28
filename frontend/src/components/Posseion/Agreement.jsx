// import React, { useState } from "react";
// import {
//   useGetAllAggrémentsQuery,
//   useUpdateAggrementMutation,
// } from "../../features/UnitPosseion/aggrementSlice"; // ✅ apna path adjust karo

// // ─────────────────────────────────────────────
// // STATUS BADGE
// // ─────────────────────────────────────────────
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

// // ─────────────────────────────────────────────
// // UPDATE MODAL
// // ─────────────────────────────────────────────
// const UpdateModal = ({ record, onClose }) => {
//   const [updateAggrement, { isLoading }] = useUpdateAggrementMutation();

//   const [form, setForm] = useState({
//     status:      record?.Status || "",
//     remarks:     record?.Remarks || "",
//     documentUrl: record?.Upload_Document_Copy || "",
//   });
//   const [files, setFiles]     = useState([]);
//   const [toast, setToast]     = useState(null);

//   const showToast = (msg, type = "success") => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 3000);
//   };

//   const handleFileChange = (e) => {
//     setFiles(Array.from(e.target.files));
//   };

//   const handleSubmit = async () => {
//     try {
//       const res = await updateAggrement({
//         id:          record.id,
//         status:      form.status,
//         remarks:     form.remarks,
//         documentUrl: form.documentUrl,
//         documents:   files,
//       });

//       if (res?.data?.success) {
//         showToast("Record successfully update ho gaya! ✅");
//         setTimeout(onClose, 1500);
//       } else {
//         showToast(res?.error?.message || "Update failed ❌", "error");
//       }
//     } catch {
//       showToast("Kuch gadbad ho gayi, dobara try karo", "error");
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">

//         {/* Header */}
//         <div className="bg-gradient-to-r from-slate-700 to-slate-600 px-6 py-4 flex items-center justify-between">
//           <div>
//             <h2 className="text-white font-bold text-lg">Record Update</h2>
//             <p className="text-slate-300 text-xs mt-0.5">ID: {record?.id} — {record?.applicantName}</p>
//           </div>
//           <button
//             onClick={onClose}
//             className="text-slate-300 hover:text-white text-2xl leading-none transition"
//           >
//             ×
//           </button>
//         </div>

//         {/* Body */}
//         <div className="p-6 space-y-4">

//           {/* Status */}
//           <div>
//             <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
//               Status
//             </label>
//             <select
//               value={form.status}
//               onChange={(e) => setForm({ ...form, status: e.target.value })}
//               className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
//             >
//               <option value="">-- Select Status --</option>
//               <option value="Pending">Pending</option>
//               <option value="Done">Done</option>
//               <option value="Approved">Approved</option>
//               <option value="Rejected">Rejected</option>
//             </select>
//           </div>

//           {/* Document URL */}
//           <div>
//             <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
//               Document URL (Optional)
//             </label>
//             <input
//               type="text"
//               placeholder="https://drive.google.com/..."
//               value={form.documentUrl}
//               onChange={(e) => setForm({ ...form, documentUrl: e.target.value })}
//               className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
//             />
//           </div>

//           {/* File Upload */}
//           <div>
//             <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
//               Documents Upload (Max 10)
//             </label>
//             <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-slate-300 rounded-xl py-4 cursor-pointer hover:border-slate-400 bg-slate-50 transition">
//               <span className="text-2xl mb-1">📎</span>
//               <span className="text-xs text-slate-500">
//                 {files.length > 0
//                   ? `${files.length} file(s) selected`
//                   : "Click ya drag karke files upload karo"}
//               </span>
//               <input
//                 type="file"
//                 multiple
//                 className="hidden"
//                 onChange={handleFileChange}
//               />
//             </label>
//             {files.length > 0 && (
//               <ul className="mt-2 space-y-1">
//                 {files.map((f, i) => (
//                   <li key={i} className="text-xs text-slate-500 flex items-center gap-1">
//                     <span>📄</span> {f.name}
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>

//           {/* Remarks */}
//           <div>
//             <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
//               Remarks
//             </label>
//             <textarea
//               rows={3}
//               placeholder="Koi bhi note ya remarks..."
//               value={form.remarks}
//               onChange={(e) => setForm({ ...form, remarks: e.target.value })}
//               className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
//             />
//           </div>

//           {/* Toast */}
//           {toast && (
//             <div
//               className={`rounded-xl px-4 py-2.5 text-sm font-medium text-center ${
//                 toast.type === "error"
//                   ? "bg-red-50 text-red-600 border border-red-200"
//                   : "bg-green-50 text-green-600 border border-green-200"
//               }`}
//             >
//               {toast.msg}
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="px-6 pb-6 flex gap-3">
//           <button
//             onClick={onClose}
//             className="flex-1 border border-slate-200 text-slate-600 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-50 transition"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleSubmit}
//             disabled={isLoading}
//             className="flex-1 bg-slate-700 hover:bg-slate-800 text-white rounded-xl py-2.5 text-sm font-semibold transition disabled:opacity-50"
//           >
//             {isLoading ? "Updating..." : "Update Karo"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─────────────────────────────────────────────
// // MAIN AGREEMENT PAGE
// // ─────────────────────────────────────────────
// const Agreement = () => {
//   const { data, isLoading, isError, error, refetch } = useGetAllAggrémentsQuery();

//   const [search,        setSearch]        = useState("");
//   const [selectedRecord, setSelectedRecord] = useState(null);

//   const records = data?.data || [];

//   // Client-side search
//   const filtered = records.filter((r) => {
//     const q = search.toLowerCase();
//     return (
//       r.applicantName?.toLowerCase().includes(q) ||
//       r.id?.toString().includes(q) ||
//       r.project?.toLowerCase().includes(q) ||
//       r.unitNo?.toLowerCase().includes(q)
//     );
//   });

//   // ── Loading ──
//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-slate-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-10 h-10 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto mb-3" />
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
//             className="bg-slate-700 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-slate-800 transition"
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

//       {/* Update Modal */}
//       {selectedRecord && (
//         <UpdateModal
//           record={selectedRecord}
//           onClose={() => setSelectedRecord(null)}
//         />
//       )}

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

//         {/* Page Header */}
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold text-slate-800">Agreement Management</h1>
//           <p className="text-slate-500 text-sm mt-1">
//             Sabhi pending possession agreements yahan dikhayi denge
//           </p>
//         </div>

//         {/* Stats + Search Bar */}
//         <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-6">

//           {/* Stats */}
//           <div className="flex gap-3">
//             <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-center shadow-sm">
//               <p className="text-xl font-bold text-slate-800">{records.length}</p>
//               <p className="text-xs text-slate-400">Total Records</p>
//             </div>
//             <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-center shadow-sm">
//               <p className="text-xl font-bold text-amber-600">{records.filter(r => r.Status?.toLowerCase() === 'pending').length}</p>
//               <p className="text-xs text-amber-500">Pending</p>
//             </div>
//           </div>

//           {/* Search + Refresh */}
//           <div className="flex gap-2 w-full sm:w-auto">
//             <input
//               type="text"
//               placeholder="ID, naam, project se search karo..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 w-full sm:w-72 shadow-sm"
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

//         {/* Table Card */}
//         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="bg-slate-50 border-b border-slate-200">
//                   {[
//                     "#", "ID", "Applicant Name", "Contact", "Project",
//                     "Block", "Unit No", "Unit Type", "Agreement Value",
//                     "Status", "Date", "Action"
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
//                     <td colSpan={12} className="text-center py-16 text-slate-400 text-sm">
//                       <div className="text-3xl mb-2">📭</div>
//                       Koi record nahi mila
//                     </td>
//                   </tr>
//                 ) : (
//                   filtered.map((item, idx) => (
//                     <tr
//                       key={item.id || idx}
//                       className="hover:bg-slate-50 transition"
//                     >
//                       <td className="px-4 py-3 text-slate-400 text-xs">{idx + 1}</td>
//                       <td className="px-4 py-3 font-mono text-xs text-slate-600">{item.id}</td>
//                       <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{item.applicantName}</td>
//                       <td className="px-4 py-3 text-slate-600">{item.contact}</td>
//                       <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{item.project}</td>
//                       <td className="px-4 py-3 text-slate-600">{item.block}</td>
//                       <td className="px-4 py-3 text-slate-600">{item.unitNo}</td>
//                       <td className="px-4 py-3 text-slate-600">{item.unitType}</td>
//                       <td className="px-4 py-3 text-slate-700 font-medium whitespace-nowrap">
//                         {item.agreementValue
//                           ? `₹ ${Number(item.agreementValue).toLocaleString("en-IN")}`
//                           : "—"}
//                       </td>
//                       <td className="px-4 py-3">
//                         <StatusBadge status={item.Status} />
//                       </td>
//                       <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{item.date || item.applicationDate}</td>
//                       <td className="px-4 py-3">
//                         <button
//                           onClick={() => setSelectedRecord(item)}
//                           className="bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
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

//           {/* Table Footer */}
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

// export default Agreement;





import React, { useState } from "react";
import {
  useGetAllAggrementsQuery,
  useUpdateAggrementMutation,
} from "../../features/UnitPosseion/aggrementSlice";

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
  const [updateAggrement, { isLoading }] = useUpdateAggrementMutation();

  const [form, setForm] = useState({
    status:      record?.Status || "",
    remarks:     record?.Remarks || "",
    documentUrl: record?.Upload_Document_Copy || "",
  });
  const [files, setFiles] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async () => {
    try {
      const res = await updateAggrement({
        id:          record.id,
        status:      form.status,
        remarks:     form.remarks,
        documentUrl: form.documentUrl,
        documents:   files,
      });
      if (res?.data?.success) {
        showToast("Record successfully update ho gaya!");
        setTimeout(onClose, 1500);
      } else {
        showToast(res?.error?.message || "Update failed", "error");
      }
    } catch {
      showToast("Kuch gadbad ho gayi, dobara try karo", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">

        <div className="bg-gradient-to-r from-slate-700 to-slate-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">Record Update</h2>
            <p className="text-slate-300 text-xs mt-0.5">
              ID: {record?.id} — {record?.applicantName}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white text-2xl leading-none">×</button>
        </div>

        <div className="p-6 space-y-4">

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="">-- Select Status --</option>
              <option value=" ">---- Select ----</option>
              <option value="Done">Done</option>
             
            </select>
          </div>

          {/* <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Document URL (Optional)</label>
            <input
              type="text"
              placeholder="https://drive.google.com/..."
              value={form.documentUrl}
              onChange={(e) => setForm({ ...form, documentUrl: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div> */}

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Documents Upload (Max 10)</label>
            <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-slate-300 rounded-xl py-4 cursor-pointer hover:border-slate-400 bg-slate-50 transition">
              <span className="text-2xl mb-1">📎</span>
              <span className="text-xs text-slate-500">
                {files.length > 0 ? `${files.length} file(s) selected` : "Click karke files upload karo"}
              </span>
              <input type="file" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files))} />
            </label>
            {files.length > 0 && (
              <ul className="mt-2 space-y-1">
                {files.map((f, i) => (
                  <li key={i} className="text-xs text-slate-500 flex items-center gap-1">📄 {f.name}</li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Remarks</label>
            <textarea
              rows={3}
              placeholder="Koi bhi note ya remarks..."
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
            />
          </div>

          {toast && (
            <div className={`rounded-xl px-4 py-2.5 text-sm font-medium text-center ${
              toast.type === "error"
                ? "bg-red-50 text-red-600 border border-red-200"
                : "bg-green-50 text-green-600 border border-green-200"
            }`}>
              {toast.msg}
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-50 transition">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={isLoading} className="flex-1 bg-slate-700 hover:bg-slate-800 text-white rounded-xl py-2.5 text-sm font-semibold transition disabled:opacity-50">
            {isLoading ? "Updating..." : "Update Karo"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN PAGE ───────────────────────────────────────────────
const Agreement = () => {
  const { data, isLoading, isError, error, refetch } = useGetAllAggrementsQuery();

  const [search,         setSearch]         = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

  const records  = data?.data || [];
  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.applicantName?.toLowerCase().includes(q) ||
      r.id?.toString().includes(q) ||
      r.project?.toLowerCase().includes(q) ||
      r.unitNo?.toLowerCase().includes(q)
    );
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Data load ho raha hai...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white border border-red-200 rounded-2xl p-8 text-center shadow-sm max-w-sm">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-red-600 font-semibold mb-1">Data load nahi hua</p>
          <p className="text-slate-400 text-xs mb-4">{error?.message}</p>
          <button onClick={refetch} className="bg-slate-700 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-slate-800 transition">
            Dobara Try Karo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {selectedRecord && (
        <UpdateModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Agreement Management</h1>
          <p className="text-slate-500 text-sm mt-1">Sabhi pending possession agreements</p>
        </div>

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
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="ID, naam, project se search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 w-full sm:w-72 shadow-sm"
            />
            <button onClick={refetch} title="Refresh" className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-500 hover:bg-slate-50 shadow-sm transition">
              🔄
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["#","ID","Applicant Name","Contact","Project","Block","Unit No","Unit Type","Agreement Value","Status","Date","Action"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="text-center py-16 text-slate-400 text-sm">
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
                      <td className="px-4 py-3 text-slate-600">{item.contact}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{item.project}</td>
                      <td className="px-4 py-3 text-slate-600">{item.block}</td>
                      <td className="px-4 py-3 text-slate-600">{item.unitNo}</td>
                      <td className="px-4 py-3 text-slate-600">{item.unitType}</td>
                      <td className="px-4 py-3 text-slate-700 font-medium whitespace-nowrap">
                        {item.agreementValue
                          ? `Rs. ${Number(item.agreementValue).toLocaleString("en-IN")}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={item.Status} /></td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{item.date || item.applicationDate}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedRecord(item)}
                          className="bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
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

export default Agreement;