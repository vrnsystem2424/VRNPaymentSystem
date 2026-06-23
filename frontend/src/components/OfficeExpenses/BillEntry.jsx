


// import React, { useState, useMemo, useEffect } from 'react';
// import {
//   useGetPendingDimExpensesQuery,
//   useUpdateDimExpenseEntryMutation,
// } from '../../features/OfficeExpense/BillEntry'; // adjust path

// import { RefreshCw, Search, X, FileText } from 'lucide-react';

// export default function BillEntry() {
//   const { data: apiResponse, isLoading, isError, refetch } = useGetPendingDimExpensesQuery();
//   const [updateEntry, { isLoading: isSubmitting }] = useUpdateDimExpenseEntryMutation();

//   const [selectedBillId, setSelectedBillId] = useState(''); // this is OFFBILLUID
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);

//   // Form states
//   const [status, setStatus] = useState('');
//   const [vendorName, setVendorName] = useState('');
//   const [billNo, setBillNo] = useState('');
//   const [billDate, setBillDate] = useState('');
//   const [items, setItems] = useState([]); // one object per SHEET ROW (per uid)
//   const [transportWOGST, setTransportWOGST] = useState(0);
//   const [transportGSTPercent, setTransportGSTPercent] = useState(0);
//   const [adjustment, setAdjustment] = useState(0);
//   const [remark, setRemark] = useState('');

//   // ─── Data Preparation ────────────────────────────────────────
//   const rawData = useMemo(() => apiResponse?.data || [], [apiResponse]);

//   const parsedItems = useMemo(() => {
//     return rawData.map(item => ({
//       offBillUID: item.OFFBILLUID?.trim() || '',
//       itemUid: item.uid?.trim() || '',
//       office: item.OFFICE_NAME_1?.trim() || '',
//       payee: item.PAYEE_NAME_1?.trim() || '',
//       itemName: item.ITEM_NAME_1?.trim() || '',
//       plannedAmount: Number(item.Amount?.replace(/,/g, '') || 0),
//       photo: item.Bill_Photo?.trim() || 'No file uploaded',
//     })).filter(i => i.offBillUID && i.itemUid);
//   }, [rawData]);

//   const billGroups = useMemo(() => {
//     const groups = {};
//     parsedItems.forEach(item => {
//       const key = item.offBillUID;
//       if (!groups[key]) groups[key] = [];
//       groups[key].push(item);
//     });
//     return groups;
//   }, [parsedItems]);

//   const filteredBills = useMemo(() => {
//     let bills = Object.keys(billGroups).map(id => ({
//       id,
//       label: `${id} • ${billGroups[id].length} items • ₹${billGroups[id].reduce((s, i) => s + i.plannedAmount, 0).toLocaleString('en-IN')}`,
//       total: billGroups[id].reduce((s, i) => s + i.plannedAmount, 0),
//     })).sort((a, b) => a.id.localeCompare(b.id));

//     if (searchTerm.trim()) {
//       const term = searchTerm.toLowerCase();
//       bills = bills.filter(b => b.id.toLowerCase().includes(term));
//     }
//     return bills;
//   }, [billGroups, searchTerm]);

//   const currentGroup = billGroups[selectedBillId] || [];

//   // When bill selected → init form with per-item data
//   useEffect(() => {
//     if (!selectedBillId || !currentGroup.length) return;

//     const first = currentGroup[0];
//     setVendorName(first.payee || '');
//     setItems(currentGroup.map(it => ({
//       itemUid: it.itemUid,
//       itemName: it.itemName,
//       plannedAmount: it.plannedAmount,   // API value – for disabled Planned Amt column
//       amount: '',                         // Bill Amt – empty, user will fill
//       gstType: 'CGST+SGST',
//       gstPercent: 0,
//       cgstAmt: 0,
//       sgstAmt: 0,
//       igstAmt: 0,
//       rowTotal: 0,
//     })));

//     setStatus('');
//     setBillNo('');
//     setBillDate('');
//     setTransportWOGST(0);
//     setTransportGSTPercent(0);
//     setAdjustment(0);
//     setRemark('');
//   }, [selectedBillId, currentGroup]);

//   // Live GST & total calculation per row
//   useEffect(() => {
//     setItems(prev => prev.map(item => {
//       const base = Number(item.amount) || 0;
//       const rate = Number(item.gstPercent) / 100;
//       let cgstAmt = 0, sgstAmt = 0, igstAmt = 0;

//       if (item.gstType === 'CGST+SGST') {
//         cgstAmt = base * rate / 2;
//         sgstAmt = base * rate / 2;
//       } else if (item.gstType === 'IGST') {
//         igstAmt = base * rate;
//       }

//       const rowTotal = base + cgstAmt + sgstAmt + igstAmt;
//       return { ...item, cgstAmt, sgstAmt, igstAmt, rowTotal };
//     }));
//   }, [items.map(i => `${i.amount}|${i.gstType}|${i.gstPercent}`).join(';')]);

//   const itemsTotal = items.reduce((sum, i) => sum + (i.rowTotal || 0), 0);
//   const transportGSTAmt = transportWOGST * (transportGSTPercent / 100);
//   const grandTotal = itemsTotal + transportWOGST + transportGSTAmt + adjustment;

//  const handleSubmit = async () => {
//   if (!billNo.trim() || !billDate || !status) {
//     alert('Status, Bill No. aur Bill Date mandatory hain');
//     return;
//   }

//   const emptyAmountItems = items.filter(
//     (item) => !item.amount || Number(item.amount) <= 0
//   );

//   if (emptyAmountItems.length > 0) {
//     const uids = emptyAmountItems.map((i) => i.itemUid).join(', ');
//     alert(`In items ka Bill Amt bharna mandatory hai:\n${uids}`);
//     return;
//   }

//   try {
//     const payload = {
//       offBillUID: selectedBillId, // optional, reference ke liye
//       entries: items.map((item, index) => {
//         const isLastRow = index === items.length - 1;

//         const basicAmount = Number(item.amount || 0);
//         const cgst = Number(item.cgstAmt || 0);
//         const sgst = Number(item.sgstAmt || 0);
//         const igst = Number(item.igstAmt || 0);
//         const totalAmount = Number(item.rowTotal || 0);

//         const transportCharge = isLastRow ? Number(transportWOGST || 0) : 0;
//         const transportGST = isLastRow
//           ? Number(transportWOGST || 0) * (Number(transportGSTPercent || 0) / 100)
//           : 0;
//         const adjustmentAmt = isLastRow ? Number(adjustment || 0) : 0;

//         const netAmount = totalAmount + transportCharge + transportGST + adjustmentAmt;

//         return {
//           uid: item.itemUid, // ✅ actual C column UID
//           STATUS_4: status,
//           Vendor_Name_4: vendorName.trim(),
//           BILL_NO_4: billNo.trim(),
//           BILL_DATE_4: billDate,
//           BASIC_AMOUNT_4: basicAmount.toFixed(2),
//           CGST_4: cgst.toFixed(2),
//           SGST_4: sgst.toFixed(2),
//           IGST_4: igst.toFixed(2),
//           TOTAL_AMOUNT_4: totalAmount.toFixed(2),
//           TRASNPORT_CHARGES_4: transportCharge.toFixed(2),
//           Transport_Gst_4: transportGST.toFixed(2),
//           NET_AMOUNT_4: netAmount.toFixed(2),
//           Remark_4: isLastRow ? remark.trim() : '',
//         };
//       }),
//     };

//     console.log('Submitting payload:', payload);

//     await updateEntry(payload).unwrap();

//     alert(`Bill ${selectedBillId} successfully updated (${items.length} items)`);

//     setSelectedBillId('');
//     refetch();
//   } catch (err) {
//     console.error('Update error:', err);
//     const msg = err?.data?.message || err?.message || 'Kuch galat hua';
//     alert(`Update failed: ${msg}`);
//   }
// };
//   // ─── UI ──────────────────────────────────────────────────────
//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
//         <div className="text-center">
//           <div className="inline-block mb-4">
//             <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
//           </div>
//           <p className="text-slate-600 font-medium">Loading final approvals...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
//       <div className="max-w-7xl mx-auto space-y-6">
//         {/* Header + Refresh */}
//         <div className="flex justify-between">
//           <h1 className="text-3xl font-bold text-indigo-900">Bill Entry</h1>
//           <button onClick={refetch} className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow-sm">
//             <RefreshCw size={16} /> Refresh
//           </button>
//         </div>

//         {/* Search / Select Bill */}
//         <div className="bg-white p-6 rounded-xl border shadow-sm">
//           <label className="font-medium block mb-2">Select Bill (OFFBILLUID)</label>
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//             <input
//               value={searchTerm}
//               onChange={e => { setSearchTerm(e.target.value); setIsDropdownOpen(true); }}
//               onFocus={() => setIsDropdownOpen(true)}
//               placeholder="Search bill..."
//               className="w-full pl-10 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"
//             />
//             {isDropdownOpen && filteredBills.length > 0 && (
//               <div className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg max-h-64 overflow-auto z-50">
//                 {filteredBills.map(bill => (
//                   <div
//                     key={bill.id}
//                     className="p-3 hover:bg-indigo-50 cursor-pointer"
//                     onClick={() => {
//                       setSelectedBillId(bill.id);
//                       setSearchTerm('');
//                       setIsDropdownOpen(false);
//                     }}
//                   >
//                     {bill.label}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Bill Entry Form (appears after selection) */}
//         {selectedBillId && currentGroup.length > 0 && (
//           <div className="bg-white rounded-xl border shadow-lg overflow-hidden">
//             <div className="p-5 bg-indigo-50 flex justify-between items-center border-b">
//               <h2 className="text-xl font-bold">Bill Entry – {selectedBillId}</h2>
//               <button onClick={() => setSelectedBillId('')} className="text-gray-600 hover:text-red-600">
//                 <X size={24} />
//               </button>
//             </div>

//             <div className="p-6 space-y-8">
//               {/* Common fields */}
//               <div className="grid md:grid-cols-4 gap-5">
//                 <div>
//                   <label className="block text-sm font-medium mb-1.5">Status *</label>
//                   <select value={status} onChange={e => setStatus(e.target.value)} className="w-full p-2.5 border rounded-lg">
//                     <option value="">-- Select --</option>
//                     <option value="Done">Done</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium mb-1.5">Vendor / Payee *</label>
//                   <input value={vendorName} onChange={e => setVendorName(e.target.value)} className="w-full p-2.5 border rounded-lg" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium mb-1.5">Bill No. *</label>
//                   <input value={billNo} onChange={e => setBillNo(e.target.value)} className="w-full p-2.5 border rounded-lg" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium mb-1.5">Bill Date *</label>
//                   <input type="date" value={billDate} onChange={e => setBillDate(e.target.value)} className="w-full p-2.5 border rounded-lg" />
//                 </div>
//               </div>

//               {/* Items – per row (per uid) */}
//               <div>
//                 <h3 className="font-semibold mb-3">Item Details</h3>
//                 <div className="overflow-x-auto border rounded-lg">
//                   <table className="w-full text-sm min-w-[900px]">
//                     <thead className="bg-gray-100">
//                       <tr>
//                         <th className="p-3 text-left">UID</th>
//                         <th className="p-3 text-left">Item</th>
//                         <th className="p-3 text-right">Planned Amt</th>   {/* disabled, from API */}
//                         <th className="p-3 text-right">Bill Amt</th>      {/* user input */}
//                         <th className="p-3">GST Type</th>
//                         <th className="p-3">GST %</th>
//                         <th className="p-3 text-right">CGST</th>
//                         <th className="p-3 text-right">SGST</th>
//                         <th className="p-3 text-right">IGST</th>
//                         <th className="p-3 text-right">Row Total</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {items.map((item, i) => (
//                         <tr key={item.itemUid} className="border-t">
//                           <td className="p-3">{item.itemUid}</td>
//                           <td className="p-3">{item.itemName}</td>

//                           {/* Planned Amt – disabled, shows API value */}
//                           <td className="p-3 text-right">
//                             <input
//                               type="number"
//                               value={item.plannedAmount ?? ''}
//                               disabled
//                               readOnly
//                               className="w-24 p-1.5 border rounded text-right 
//                                          bg-gray-100 text-gray-700 font-medium
//                                          cursor-not-allowed border-gray-300"
//                             />
//                           </td>

//                           {/* Bill Amt – user input, empty by default */}
//                           <td className="p-3">
//                             <input
//                               type="number"
//                               value={item.amount}
//                               placeholder="0"
//                               onChange={e => {
//                                 const newItems = [...items];
//                                 newItems[i].amount = e.target.value;
//                                 setItems(newItems);
//                               }}
//                               className={`w-24 p-1.5 border rounded text-right
//                                 ${!item.amount || Number(item.amount) <= 0
//                                   ? 'border-red-500 bg-red-50'
//                                   : 'border-gray-300'
//                                 }`}
//                             />
//                           </td>

//                           <td className="p-3">
//                             <select
//                               value={item.gstType}
//                               onChange={e => {
//                                 const newItems = [...items];
//                                 newItems[i].gstType = e.target.value;
//                                 setItems(newItems);
//                               }}
//                               className="w-full p-1.5 border rounded"
//                             >
//                               <option>CGST+SGST</option>
//                               <option>IGST</option>
//                               <option>No GST</option>
//                             </select>
//                           </td>
//                           <td className="p-3">
//                             <select
//                               value={item.gstPercent}
//                               onChange={e => {
//                                 const newItems = [...items];
//                                 newItems[i].gstPercent = Number(e.target.value);
//                                 setItems(newItems);
//                               }}
//                               className="w-full p-1.5 border rounded"
//                             >
//                               <option value={0}>0%</option>
//                               <option value={5}>5%</option>
//                               <option value={12}>12%</option>
//                               <option value={18}>18%</option>
//                               <option value={28}>28%</option>
//                             </select>
//                           </td>
//                           <td className="p-3 text-right">{item.cgstAmt.toFixed(2)}</td>
//                           <td className="p-3 text-right">{item.sgstAmt.toFixed(2)}</td>
//                           <td className="p-3 text-right">{item.igstAmt.toFixed(2)}</td>
//                           <td className="p-3 text-right font-medium">{item.rowTotal.toFixed(2)}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//                 <div className="mt-3 text-right font-semibold">
//                   Items Total: ₹{itemsTotal.toFixed(2)}
//                 </div>
//               </div>

//               {/* Transport + Adjustment + Grand Total */}
//               <div className="grid md:grid-cols-3 gap-6 bg-gray-50 p-6 rounded-xl">
//                 <div>
//                   <label className="block text-sm mb-1.5">Transport (w/o GST)</label>
//                   <input type="number" value={transportWOGST} onChange={e => setTransportWOGST(Number(e.target.value))} className="w-full p-2.5 border rounded-lg" />
//                 </div>
//                 <div>
//                   <label className="block text-sm mb-1.5">GST on Transport %</label>
//                   <select value={transportGSTPercent} onChange={e => setTransportGSTPercent(Number(e.target.value))} className="w-full p-2.5 border rounded-lg">
//                     <option>0</option><option>5</option><option>12</option><option>18</option><option>28</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm mb-1.5">Grand Total</label>
//                   <div className="p-3 bg-indigo-100 text-indigo-900 font-bold rounded-lg text-lg">
//                     ₹{grandTotal.toFixed(2)}
//                   </div>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1.5">Remark</label>
//                 <textarea value={remark} onChange={e => setRemark(e.target.value)} rows={3} className="w-full p-3 border rounded-lg" placeholder="Optional..." />
//               </div>

//               <div className="flex justify-end gap-4">
//                 <button onClick={() => setSelectedBillId('')} className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300">
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleSubmit}
//                   disabled={
//                     isSubmitting ||
//                     !billNo ||
//                     !billDate ||
//                     !status ||
//                     items.some((i) => !i.amount || Number(i.amount) <= 0)
//                   }
//                   className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 flex items-center gap-2"
//                 >
//                   {isSubmitting ? 'Saving...' : <><FileText size={18} /> Submit Bill</>}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }




import React, { useState, useMemo, useEffect } from 'react';
import {
  useGetPendingDimExpensesQuery,
  useUpdateDimExpenseEntryMutation,
} from '../../features/OfficeExpense/BillEntry';

import { RefreshCw, Search, X, FileText } from 'lucide-react';

export default function BillEntry() {
  const {
    data: apiResponse,
    isLoading,
    isError,
    refetch,
  } = useGetPendingDimExpensesQuery();

  const [updateEntry, { isLoading: isSubmitting }] =
    useUpdateDimExpenseEntryMutation();

  const [selectedBillId, setSelectedBillId]   = useState('');
  const [searchTerm, setSearchTerm]           = useState('');
  const [isDropdownOpen, setIsDropdownOpen]   = useState(false);

  const [status, setStatus]                   = useState('');
  const [vendorName, setVendorName]           = useState('');
  const [billNo, setBillNo]                   = useState('');
  const [billDate, setBillDate]               = useState('');
  const [items, setItems]                     = useState([]);
  const [transportWOGST, setTransportWOGST]   = useState('');
  const [transportGSTPercent, setTransportGSTPercent] = useState('');
  const [adjustment, setAdjustment]           = useState('');
  const [remark, setRemark]                   = useState('');

  // ── Raw data from API ────────────────────────────────────
  const rawData = useMemo(() => {
    if (!apiResponse) return [];
    if (Array.isArray(apiResponse)) return apiResponse;
    if (Array.isArray(apiResponse.data)) return apiResponse.data;
    return [];
  }, [apiResponse]);

  // ── Parse items ──────────────────────────────────────────
  const parsedItems = useMemo(() => {
    return rawData.map((item, index) => {
      const offBillUID = (
        item.OFFBILLUID || item.offBillUID || ''
      ).toString().trim();

      const uid = (
        item.uid || item.UID || ''
      ).toString().trim();

      const itemName = (
        item.ITEM_NAME_1 || item.itemName || ''
      ).toString().trim();

      const expensesSubhead = (
        item.EXPENSES_SUBHEAD_1 || ''
      ).toString().trim();

      const payee = (
        item.PAYEE_NAME_1 || ''
      ).toString().trim();

      // Amount parse karo
      let amt = item.Amount || item.amount || 0;
      if (typeof amt === 'string') {
        amt = parseFloat(amt.replace(/,/g, '')) || 0;
      }
      amt = Number(amt) || 0;

      return {
        offBillUID,
        itemUid:         uid,
        payee,
        itemName:        itemName || `Item ${index + 1}`,
        expensesSubhead: expensesSubhead || '-',
        plannedAmount:   amt,
        photo: (item.Bill_Photo || '').toString().trim() || 'No file',
      };
    }).filter(i => i.offBillUID && i.itemUid);
  }, [rawData]);

  // ── Group by OFFBILLUID ──────────────────────────────────
  const billGroups = useMemo(() => {
    const groups = {};
    parsedItems.forEach(item => {
      const key = item.offBillUID;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [parsedItems]);

  // ── Filtered bills for dropdown ──────────────────────────
  const filteredBills = useMemo(() => {
    let bills = Object.keys(billGroups)
      .map(id => ({
        id,
        itemCount: billGroups[id].length,
        total: billGroups[id].reduce(
          (s, i) => s + i.plannedAmount, 0
        ),
      }))
      .sort((a, b) => a.id.localeCompare(b.id));

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      bills = bills.filter(b =>
        b.id.toLowerCase().includes(term)
      );
    }
    return bills;
  }, [billGroups, searchTerm]);

  const currentGroup = billGroups[selectedBillId] || [];

  // ── Bill select hone par form init karo ─────────────────
  useEffect(() => {
    if (!selectedBillId || !currentGroup.length) return;

    const first = currentGroup[0];
    setVendorName(first.payee || '');

    setItems(currentGroup.map(it => ({
      itemUid:         it.itemUid,
      itemName:        it.itemName,
      expensesSubhead: it.expensesSubhead,
      plannedAmount:   it.plannedAmount,
      amount:          '',
      gstType:         'CGST+SGST',
      gstPercent:      0,
      cgstAmt:         0,
      sgstAmt:         0,
      igstAmt:         0,
      rowTotal:        0,
    })));

    setStatus('');
    setBillNo('');
    setBillDate('');
    setTransportWOGST('');
    setTransportGSTPercent('');
    setAdjustment('');
    setRemark('');
  }, [selectedBillId]);

  // ── Live GST calculation ─────────────────────────────────
  useEffect(() => {
    setItems(prev =>
      prev.map(item => {
        const base = Number(item.amount) || 0;
        const rate = (Number(item.gstPercent) || 0) / 100;
        let cgstAmt = 0, sgstAmt = 0, igstAmt = 0;

        if (item.gstType === 'CGST+SGST') {
          cgstAmt = (base * rate) / 2;
          sgstAmt = (base * rate) / 2;
        } else if (item.gstType === 'IGST') {
          igstAmt = base * rate;
        }

        const rowTotal = base + cgstAmt + sgstAmt + igstAmt;
        return { ...item, cgstAmt, sgstAmt, igstAmt, rowTotal };
      })
    );
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    items.map(i =>
      `${i.amount}|${i.gstType}|${i.gstPercent}`
    ).join(';'),
  ]);

  // ── Totals ───────────────────────────────────────────────
  const itemsTotal = items.reduce(
    (sum, i) => sum + (i.rowTotal || 0), 0
  );
  const transportGSTAmt =
    (Number(transportWOGST) || 0) *
    ((Number(transportGSTPercent) || 0) / 100);

  const grandTotal =
    itemsTotal +
    (Number(transportWOGST) || 0) +
    transportGSTAmt +
    (Number(adjustment) || 0);

  // ── Submit ───────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!billNo.trim() || !billDate || !status) {
      alert('Status, Bill No. aur Bill Date mandatory hain');
      return;
    }

    const hasAmount = items.some(i => Number(i.amount) > 0);
    if (!hasAmount) {
      alert('Kam se kam ek item ka Bill Amount enter karo');
      return;
    }

    try {
      const tWOGST  = Number(transportWOGST) || 0;
      const tGSTAmt = tWOGST * ((Number(transportGSTPercent) || 0) / 100);
      const adj     = Number(adjustment) || 0;
      const netAmount = itemsTotal + tWOGST + tGSTAmt + adj;

      // ── Payload (RCC wale format mein) ──────────────────
      const payload = {
        uid:                 selectedBillId,   // OFFBILLUID
        STATUS_4:            status,
        Vendor_Name_4:       vendorName.trim(),
        BILL_NO_4:           billNo.trim(),
        BILL_DATE_4:         billDate,
        TRASNPORT_CHARGES_4: tWOGST.toFixed(2),
        Transport_Gst_4:     tGSTAmt.toFixed(2),
        NET_AMOUNT_4:        netAmount.toFixed(2),
        Remark_4:            remark.trim(),
        items: items.map(item => ({
          itemUid:        item.itemUid,
          BASIC_AMOUNT_4: (Number(item.amount)    || 0).toFixed(2),
          CGST_4:         (item.cgstAmt           || 0).toFixed(2),
          SGST_4:         (item.sgstAmt           || 0).toFixed(2),
          IGST_4:         (item.igstAmt           || 0).toFixed(2),
          TOTAL_AMOUNT_4: (item.rowTotal          || 0).toFixed(2),
        })),
      };

      console.log('VRN Submit payload:', payload);

      await updateEntry(payload).unwrap();

      alert(`✓ Bill ${selectedBillId} successfully updated!`);

      // Reset form
      setSelectedBillId('');
      setSearchTerm('');
      setStatus('');
      setVendorName('');
      setBillNo('');
      setBillDate('');
      setItems([]);
      setTransportWOGST('');
      setTransportGSTPercent('');
      setAdjustment('');
      setRemark('');

      refetch();
    } catch (err) {
      console.error('VRN Submit error:', err);
      alert(
        `Error: ${err?.data?.message || err?.message || 'Kuch galat hua'}`
      );
    }
  };

  // ── Loading ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading bills...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-red-600 mb-3">Failed to load data</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-indigo-900">
              Bill Entry (VRN)
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {parsedItems.length} items across{' '}
              {Object.keys(billGroups).length} bills
            </p>
          </div>
          <button
            onClick={refetch}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {/* Bill Search / Select */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <label className="font-medium block mb-2 text-gray-700">
            Select Bill (OFFBILLUID)
          </label>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder="Search by Bill ID..."
              className="w-full pl-10 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-400"
            />

            {/* Selected badge */}
            {selectedBillId && (
              <div className="mt-2 inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-full text-sm font-medium">
                Selected: {selectedBillId} ({currentGroup.length} items)
                <button
                  onClick={() => setSelectedBillId('')}
                  className="hover:text-red-600"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Dropdown */}
            {isDropdownOpen && filteredBills.length > 0 && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg max-h-64 overflow-auto z-50">
                  {filteredBills.map(bill => (
                    <div
                      key={bill.id}
                      className="p-3 hover:bg-indigo-50 cursor-pointer border-b last:border-0"
                      onClick={() => {
                        setSelectedBillId(bill.id);
                        setSearchTerm('');
                        setIsDropdownOpen(false);
                      }}
                    >
                      <span className="font-medium">{bill.id}</span>
                      <span className="text-gray-500 ml-2">
                        • {bill.itemCount} items •{' '}
                        ₹{bill.total.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {isDropdownOpen &&
              filteredBills.length === 0 &&
              searchTerm && (
                <div className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg p-4 text-gray-500 z-50">
                  No bills found for "{searchTerm}"
                </div>
              )}
          </div>
        </div>

        {/* Bill Entry Form */}
        {selectedBillId && currentGroup.length > 0 && (
          <div className="bg-white rounded-xl border shadow-lg overflow-hidden">

            {/* Form Header */}
            <div className="p-5 bg-indigo-50 flex justify-between items-center border-b">
              <div>
                <h2 className="text-xl font-bold text-indigo-900">
                  Bill: {selectedBillId}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {currentGroup.length} item
                  {currentGroup.length > 1 ? 's' : ''} to process
                </p>
              </div>
              <button
                onClick={() => setSelectedBillId('')}
                className="p-2 hover:bg-indigo-100 rounded-full"
              >
                <X size={24} className="text-gray-500 hover:text-red-600" />
              </button>
            </div>

            <div className="p-6 space-y-8">

              {/* Common Fields */}
              <div className="grid md:grid-cols-4 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="">-- Select Status --</option>
                    <option value="Done">Done</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">
                    Vendor <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={vendorName}
                    onChange={e => setVendorName(e.target.value)}
                    className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">
                    Bill No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={billNo}
                    onChange={e => setBillNo(e.target.value)}
                    placeholder="e.g. INV-001"
                    className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">
                    Bill Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={billDate}
                    onChange={e => setBillDate(e.target.value)}
                    className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FileText size={18} /> Bill Items
                </h3>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-3 text-left">#</th>
                        <th className="p-3 text-left">Item UID</th>
                        <th className="p-3 text-left">Subhead</th>
                        <th className="p-3 text-left">Item Name</th>
                        <th className="p-3 text-right">Planned Amt (₹)</th>
                        <th className="p-3 text-right">Bill Amt (₹)</th>
                        <th className="p-3">GST Type</th>
                        <th className="p-3">GST %</th>
                        <th className="p-3 text-right">CGST</th>
                        <th className="p-3 text-right">SGST</th>
                        <th className="p-3 text-right">IGST</th>
                        <th className="p-3 text-right">Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, i) => (
                        <tr key={i} className="border-t hover:bg-gray-50">
                          <td className="p-3 text-gray-400">{i + 1}</td>
                          <td className="p-3 text-xs text-gray-500">
                            {item.itemUid || '-'}
                          </td>
                          <td className="p-3 text-sm text-gray-600">
                            {item.expensesSubhead || '-'}
                          </td>
                          <td className="p-3 font-medium">{item.itemName}</td>

                          {/* Planned Amount - disabled */}
                          <td className="p-3 text-right">
                            <input
                              type="number"
                              value={item.plannedAmount || 0}
                              disabled
                              className="w-28 p-1.5 border rounded text-right bg-gray-100 text-gray-600 cursor-not-allowed"
                            />
                          </td>

                          {/* Bill Amount - user input */}
                          <td className="p-3">
                            <input
                              type="number"
                              step="0.01"
                              value={item.amount}
                              placeholder="Enter amount"
                              onChange={e => {
                                const newItems = [...items];
                                newItems[i] = {
                                  ...newItems[i],
                                  amount: e.target.value,
                                };
                                setItems(newItems);
                              }}
                              className={`w-28 p-1.5 border rounded text-right outline-none focus:ring-2 focus:ring-indigo-400
                                ${!item.amount || Number(item.amount) <= 0
                                  ? 'border-red-400 bg-red-50'
                                  : 'border-gray-300'
                                }`}
                            />
                          </td>

                          {/* GST Type */}
                          <td className="p-3">
                            <select
                              value={item.gstType}
                              onChange={e => {
                                const newItems = [...items];
                                newItems[i] = {
                                  ...newItems[i],
                                  gstType: e.target.value,
                                  gstPercent:
                                    e.target.value === 'No GST'
                                      ? 0
                                      : item.gstPercent,
                                };
                                setItems(newItems);
                              }}
                              className="p-1.5 border rounded outline-none focus:ring-2 focus:ring-indigo-400"
                            >
                              <option value="CGST+SGST">CGST+SGST</option>
                              <option value="IGST">IGST</option>
                              <option value="No GST">No GST</option>
                            </select>
                          </td>

                          {/* GST % */}
                          <td className="p-3">
                            <select
                              value={item.gstPercent}
                              disabled={item.gstType === 'No GST'}
                              onChange={e => {
                                const newItems = [...items];
                                newItems[i] = {
                                  ...newItems[i],
                                  gstPercent: Number(e.target.value),
                                };
                                setItems(newItems);
                              }}
                              className="p-1.5 border rounded outline-none disabled:bg-gray-100 focus:ring-2 focus:ring-indigo-400"
                            >
                              <option value={0}>0%</option>
                              <option value={5}>5%</option>
                              <option value={12}>12%</option>
                              <option value={18}>18%</option>
                              <option value={28}>28%</option>
                            </select>
                          </td>

                          <td className="p-3 text-right text-green-600">
                            ₹{item.cgstAmt.toFixed(2)}
                          </td>
                          <td className="p-3 text-right text-green-600">
                            ₹{item.sgstAmt.toFixed(2)}
                          </td>
                          <td className="p-3 text-right text-blue-600">
                            ₹{item.igstAmt.toFixed(2)}
                          </td>
                          <td className="p-3 text-right font-semibold text-indigo-700">
                            ₹{item.rowTotal.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 text-right">
                  <span className="font-semibold">Items Subtotal: </span>
                  <span className="text-indigo-700 font-bold text-lg">
                    ₹{itemsTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Transport + Adjustment */}
              <div className="grid md:grid-cols-4 gap-5 bg-gray-50 p-5 rounded-xl">
                <div>
                  <label className="block text-sm mb-1.5 text-gray-700">
                    Transport (Excl. GST)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={transportWOGST}
                    placeholder="0.00"
                    onChange={e => setTransportWOGST(e.target.value)}
                    className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1.5 text-gray-700">
                    Transport GST %
                  </label>
                  <select
                    value={transportGSTPercent}
                    onChange={e => setTransportGSTPercent(e.target.value)}
                    className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="">-- Select --</option>
                    <option value={0}>0%</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1.5 text-gray-700">
                    Transport GST Amount
                  </label>
                  <div className="p-2.5 bg-white border rounded-lg font-medium">
                    ₹{transportGSTAmt.toFixed(2)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-1.5 text-gray-700">
                    Adjustment
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={adjustment}
                    placeholder="0.00"
                    onChange={e => setAdjustment(e.target.value)}
                    className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>

              {/* Grand Total */}
              <div className="bg-indigo-50 p-4 rounded-xl flex justify-between items-center">
                <span className="text-lg font-bold text-indigo-900">
                  GRAND TOTAL:
                </span>
                <span className="text-3xl font-bold text-indigo-700">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>

              {/* Remark */}
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">
                  Remark (Optional)
                </label>
                <textarea
                  value={remark}
                  onChange={e => setRemark(e.target.value)}
                  rows={2}
                  placeholder="Any additional notes..."
                  className="w-full p-3 border rounded-lg outline-none resize-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-4 border-t">
                <button
                  onClick={() => {
                    setSelectedBillId('');
                    setSearchTerm('');
                  }}
                  className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={
                    isSubmitting || !billNo || !billDate || !status
                  }
                  className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FileText size={18} /> Submit Bill
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Empty states */}
        {!selectedBillId && Object.keys(billGroups).length > 0 && (
          <div className="bg-white rounded-xl border shadow-sm p-12 text-center">
            <FileText size={48} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-700">
              No Bill Selected
            </h3>
            <p className="text-gray-500 mt-1">
              Search and select a bill from the dropdown above
            </p>
          </div>
        )}

        {Object.keys(billGroups).length === 0 && !isLoading && (
          <div className="bg-white rounded-xl border shadow-sm p-12 text-center">
            <p className="text-gray-500">No pending bills found</p>
            <button
              onClick={refetch}
              className="mt-3 text-indigo-600 hover:text-indigo-700"
            >
              Refresh
            </button>
          </div>
        )}

      </div>
    </div>
  );
}