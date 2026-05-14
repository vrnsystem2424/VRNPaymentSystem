
import React, { useState, useMemo } from 'react';
import {
  useGetPendingApprovalsQuery,
  useBulkUpdateApprovalMutation,
} from '../../features/OfficeExpense/approve1Slice';
import {
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  ChevronDown,
  Package,
  Building2,
  User,
  IndianRupee,
  Layers,
  CreditCard,
  Banknote,
} from 'lucide-react';

export default function Approvel1({ user }) {
  const { data: apiResponse, isLoading, isError, error, refetch } =
    useGetPendingApprovalsQuery();

  const [bulkUpdateApproval, { isLoading: isSubmitting }] =
    useBulkUpdateApprovalMutation();

  // Form State
  const [selectedBillUID, setSelectedBillUID]   = useState('');
  const [approvalStatus,  setApprovalStatus]    = useState('');
  const [paymentMode,     setPaymentMode]       = useState('');
  const [remark,          setRemark]            = useState('');
  const [submitResults,   setSubmitResults]     = useState([]);

  // ── Raw Data ──────────────────────────────────────────────
  const rawData = useMemo(() => {
    if (apiResponse?.data && Array.isArray(apiResponse.data)) return apiResponse.data;
    if (Array.isArray(apiResponse)) return apiResponse;
    return [];
  }, [apiResponse]);

  // ── Parse Items ───────────────────────────────────────────
  const parsedItems = useMemo(() => {
    if (!rawData.length) return [];
    return rawData.map((item) => {
      const rawAmount = String(item.Amount || item.amount || '0').replace(/,/g, '');
      return {
        OFFBILLUID:    String(item.OFFBILLUID    || '').trim(),
        uid:           String(item.uid           || '').trim(),
        office:        String(item.OFFICE_NAME_1 || '').trim(),
        payee:         String(item.PAYEE_NAME_1  || '').trim(),
        head:          String(item.EXPENSES_HEAD_1    || '').trim(),
        subhead:       String(item.EXPENSES_SUBHEAD_1 || '').trim(),
        itemName:      String(item.ITEM_NAME_1   || '').trim(),
        unit:          String(item.UNIT_1        || '').trim(),
        qty:           String(item.Qty_1 || item.QTY_1 || '1').trim(),
        amount:        Number(rawAmount) || 0,
        raisedBy:      String(item.RAISED_BY_1   || '').trim(),
        photo:         String(item.Bill_Photo || item.bill_photo || '').trim(),
        originalRemark:String(item.REMARK_1      || '').trim(),
        approvalDoer:  String(item.APPROVAL_DOER || item.approval_doer || '').trim(),
      };
    });
  }, [rawData]);

  // ── Unique Bill UIDs ──────────────────────────────────────
  const uniqueBillUIDs = useMemo(() => {
    const seen = new Set();
    return parsedItems
      .filter((item) => {
        if (item.OFFBILLUID && !seen.has(item.OFFBILLUID)) {
          seen.add(item.OFFBILLUID);
          return true;
        }
        return false;
      })
      .map((item) => ({
        OFFBILLUID: item.OFFBILLUID,
        office:     item.office,
        payee:      item.payee,
        count:      parsedItems.filter((i) => i.OFFBILLUID === item.OFFBILLUID).length,
      }));
  }, [parsedItems]);

  // ── Items for selected Bill UID ───────────────────────────
  const selectedItems = useMemo(() => {
    if (!selectedBillUID) return [];
    return parsedItems.filter((item) => item.OFFBILLUID === selectedBillUID);
  }, [parsedItems, selectedBillUID]);

  const selectedTotal = useMemo(
    () => selectedItems.reduce((sum, i) => sum + i.amount, 0),
    [selectedItems]
  );

  // Reset form on Bill UID change
  const handleBillUIDChange = (val) => {
    setSelectedBillUID(val);
    setApprovalStatus('');
    setPaymentMode('');
    setRemark('');
    setSubmitResults([]);
  };

  // ── Bulk Submit ───────────────────────────────────────────
  const handleBulkSubmit = async () => {
    if (!selectedBillUID)       return alert('Please select a Bill UID first');
    if (!approvalStatus)        return alert('Please select Approval Status');
    if (!paymentMode)           return alert('Please select Payment Mode');
    if (selectedItems.length === 0) return alert('No items found for selected Bill UID');

    try {
      const response = await bulkUpdateApproval({
        uids:           selectedItems.map((item) => item.uid),
        STATUS_2:       approvalStatus,
        PAYMENT_MODE_3: paymentMode,
        REMARK_2:       remark.trim(),
      }).unwrap();

      setSubmitResults(response.results || []);

      if (response.errorCount === 0) {
        alert(`✅ All ${response.successCount} items submitted successfully!`);
        handleBillUIDChange('');
        refetch();
      } else {
        alert(`⚠️ ${response.successCount} succeeded, ${response.errorCount} failed`);
        refetch();
      }
    } catch (err) {
      alert('Error: ' + (err?.data?.message || err.message || 'Failed'));
      console.error(err);
    }
  };

  // ── Loading ───────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading pending approvals...</p>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-rose-200 shadow-xl p-6 max-w-md">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Error Loading Data</h3>
              <p className="text-sm text-slate-600">
                {error?.data?.error || error?.message || 'Failed to load pending approvals'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main UI ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 md:px-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-indigo-800 bg-clip-text text-transparent mb-2">
              Level 1 Approvals
            </h1>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-indigo-600" />
              <p className="text-slate-600 font-medium">
                {parsedItems.length} items • {uniqueBillUIDs.length} bills pending
              </p>
            </div>
          </div>
          <button
            onClick={refetch}
            disabled={isSubmitting}
            className="group flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
            Refresh
          </button>
        </div>

        {/* No Data */}
        {parsedItems.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">All caught up!</h2>
            <p className="text-slate-600">No pending approvals right now.</p>
          </div>
        )}

        {parsedItems.length > 0 && (
          <>
            {/* ═══ STEP 1 — Bill UID Selector ═══ */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Step Header */}
              <div className="p-5 bg-gradient-to-r from-indigo-600 to-indigo-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Select Bill UID</h2>
                    <p className="text-indigo-200 text-sm">
                      Choose a bill — all its line items will be actioned together
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Bill UID <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedBillUID}
                      onChange={(e) => handleBillUIDChange(e.target.value)}
                      className="w-full px-4 py-3.5 pr-10 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900 appearance-none bg-white font-medium text-base transition-colors hover:border-indigo-300"
                    >
                      <option value="">── Select Bill UID ──</option>
                      {uniqueBillUIDs.map((bill) => (
                        <option key={bill.OFFBILLUID} value={bill.OFFBILLUID}>
                          {bill.OFFBILLUID}  |  {bill.office}  |  {bill.payee}  |  {bill.count} item{bill.count > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Quick-select pills */}
                <div className="flex flex-wrap gap-2">
                  {uniqueBillUIDs.map((bill) => (
                    <button
                      key={bill.OFFBILLUID}
                      onClick={() => handleBillUIDChange(bill.OFFBILLUID)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                        selectedBillUID === bill.OFFBILLUID
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                      }`}
                    >
                      <FileText className="h-3 w-3" />
                      {bill.OFFBILLUID}
                      <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                        selectedBillUID === bill.OFFBILLUID
                          ? 'bg-white/20 text-white'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {bill.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ═══ STEP 2 — Items Preview Table ═══ */}
            {selectedItems.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Step Header */}
                <div className="p-5 bg-gradient-to-r from-slate-600 to-slate-700">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                        2
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">
                          Items Under Bill: {selectedBillUID}
                        </h2>
                        <p className="text-slate-300 text-sm">
                          {selectedItems.length} line items will be actioned together
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-xs">Total Amount</p>
                      <p className="text-emerald-400 font-bold text-2xl">
                        ₹{selectedTotal.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Info Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-y sm:divide-y-0 divide-slate-100 border-b border-slate-200">
                  {[
                    { icon: <Building2 className="h-5 w-5 text-indigo-400" />, label: 'Office',     value: selectedItems[0]?.office    },
                    { icon: <User       className="h-5 w-5 text-purple-400" />, label: 'Payee',      value: selectedItems[0]?.payee     },
                    { icon: <Layers     className="h-5 w-5 text-amber-400"  />, label: 'Raised By',  value: selectedItems[0]?.raisedBy  },
                    { icon: <IndianRupee className="h-5 w-5 text-emerald-400"/>,label: 'Total',
                      value: `₹${selectedTotal.toLocaleString('en-IN')}` },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="p-4 flex items-center gap-3">
                      {icon}
                      <div>
                        <p className="text-xs text-slate-500">{label}</p>
                        <p className="font-semibold text-slate-800 text-sm truncate">{value || '-'}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        {['#','UID','Item','Head / Subhead','Qty & Unit','Amount','Remark','Doer','Photo',
                          ...(submitResults.length > 0 ? ['Result'] : [])
                        ].map((h) => (
                          <th key={h} className="px-4 py-3 text-left font-semibold text-slate-600 uppercase text-xs tracking-wide whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedItems.map((item, idx) => {
                        const result = submitResults.find((r) => r.uid === item.uid);
                        return (
                          <tr
                            key={item.uid}
                            className={`transition-colors ${
                              result?.status === 'success' ? 'bg-emerald-50' :
                              result?.status === 'error'   ? 'bg-rose-50'    :
                              'hover:bg-indigo-50/40'
                            }`}
                          >
                            <td className="px-4 py-3 text-slate-500 font-medium">{idx + 1}</td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 font-mono font-semibold text-xs">
                                {item.uid}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                              {item.itemName || '-'}
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-slate-700 text-xs">{item.head}</div>
                              <div className="text-slate-500 text-xs">{item.subhead}</div>
                            </td>
                            <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                              {item.qty} {item.unit}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-emerald-600 whitespace-nowrap">
                              ₹{item.amount.toLocaleString('en-IN')}
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-xs text-slate-600 max-w-[120px] truncate" title={item.originalRemark}>
                                {item.originalRemark || '-'}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 font-medium text-xs">
                                {item.approvalDoer || '-'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {item.photo && item.photo !== 'No file uploaded' && item.photo !== '' ? (
                                <a
                                  href={item.photo}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors"
                                >
                                  View
                                </a>
                              ) : (
                                <span className="text-slate-400 text-xs">N/A</span>
                              )}
                            </td>
                            {submitResults.length > 0 && (
                              <td className="px-4 py-3 text-center">
                                {result?.status === 'success' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold">
                                    <CheckCircle2 className="h-3.5 w-3.5" /> Done
                                  </span>
                                ) : result?.status === 'error' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold" title={result.message}>
                                    <XCircle className="h-3.5 w-3.5" /> Failed
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-xs">–</span>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 border-t-2 border-slate-200">
                        <td colSpan={5} className="px-4 py-3 text-right font-semibold text-slate-700">
                          Grand Total:
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-600 text-base">
                          ₹{selectedTotal.toLocaleString('en-IN')}
                        </td>
                        <td colSpan={submitResults.length > 0 ? 4 : 3} />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* ═══ STEP 3 — Bulk Action Form ═══ */}
            {selectedItems.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Step Header */}
                <div className="p-5 bg-gradient-to-r from-emerald-600 to-emerald-700">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                      3
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Bulk Action</h2>
                      <p className="text-emerald-200 text-sm">
                        Applies to all {selectedItems.length} items under Bill {selectedBillUID}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* ── Approval Status ── */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Approval Status <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={approvalStatus}
                          onChange={(e) => setApprovalStatus(e.target.value)}
                          className="w-full px-4 py-3 pr-10 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 appearance-none bg-white font-medium transition-colors hover:border-emerald-300"
                        >
                          <option value="">── Select Status ──</option>
                          <option value="Done">✅ Done (Approve)</option>
                          <option value="Reject">❌ Reject</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                      </div>
                      {/* Badge preview */}
                      {approvalStatus && (
                        <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold ${
                          approvalStatus === 'Done'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                          {approvalStatus === 'Done'
                            ? <CheckCircle2 className="h-4 w-4" />
                            : <XCircle className="h-4 w-4" />}
                          Mark all as: {approvalStatus}
                        </div>
                      )}
                    </div>

                    {/* ── Payment Mode ── */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Payment Mode <span className="text-rose-500">*</span>
                      </label>

                      {/* Two big toggle buttons */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* BANK */}
                        <button
                          type="button"
                          onClick={() => setPaymentMode('BANK')}
                          className={`flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-xl border-2 font-semibold text-sm transition-all duration-200 ${
                            paymentMode === 'BANK'
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg scale-105'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50'
                          }`}
                        >
                          <CreditCard className={`h-6 w-6 ${paymentMode === 'BANK' ? 'text-white' : 'text-indigo-400'}`} />
                          BANK
                        </button>

                        {/* CASH */}
                        <button
                          type="button"
                          onClick={() => setPaymentMode('CASH')}
                          className={`flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-xl border-2 font-semibold text-sm transition-all duration-200 ${
                            paymentMode === 'CASH'
                              ? 'bg-amber-500 border-amber-500 text-white shadow-lg scale-105'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300 hover:bg-amber-50'
                          }`}
                        >
                          <Banknote className={`h-6 w-6 ${paymentMode === 'CASH' ? 'text-white' : 'text-amber-400'}`} />
                          CASH
                        </button>
                      </div>

                      {/* Selected badge */}
                      {paymentMode && (
                        <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold ${
                          paymentMode === 'BANK'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {paymentMode === 'BANK'
                            ? <CreditCard className="h-4 w-4" />
                            : <Banknote className="h-4 w-4" />}
                          Payment via {paymentMode}
                        </div>
                      )}
                    </div>

                    {/* ── Remark ── full width ── */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Remark / Comments{' '}
                        <span className="text-slate-400 font-normal text-xs">(optional)</span>
                      </label>
                      <textarea
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        rows={3}
                        placeholder="Add comments or reason (optional)..."
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 placeholder:text-slate-400 resize-none transition-colors hover:border-emerald-300"
                      />
                    </div>
                  </div>

                  {/* Submission Summary Box */}
                  {approvalStatus && paymentMode && (
                    <div className={`mt-5 p-4 rounded-xl border-2 ${
                      approvalStatus === 'Done'
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-rose-50 border-rose-200'
                    }`}>
                      <p className={`text-sm font-bold mb-3 ${
                        approvalStatus === 'Done' ? 'text-emerald-800' : 'text-rose-800'
                      }`}>
                        📋 Submission Summary
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                        <div>
                          <p className="text-slate-500 mb-0.5">Bill UID</p>
                          <p className="font-bold text-slate-800">{selectedBillUID}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-0.5">Items Count</p>
                          <p className="font-bold text-slate-800">{selectedItems.length}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-0.5">Status</p>
                          <p className={`font-bold ${
                            approvalStatus === 'Done' ? 'text-emerald-700' : 'text-rose-700'
                          }`}>
                            {approvalStatus}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-0.5">Payment Mode</p>
                          <p className={`font-bold ${
                            paymentMode === 'BANK' ? 'text-indigo-700' : 'text-amber-700'
                          }`}>
                            {paymentMode}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-5 flex flex-col sm:flex-row justify-end gap-3">
                    <button
                      onClick={() => handleBillUIDChange('')}
                      className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold border-2 border-slate-200 transition-colors"
                    >
                      Clear Selection
                    </button>

                    <button
                      onClick={handleBulkSubmit}
                      disabled={isSubmitting || !approvalStatus || !paymentMode}
                      className={`px-8 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 min-w-[200px] transition-all text-base ${
                        isSubmitting || !approvalStatus || !paymentMode
                          ? 'bg-slate-300 cursor-not-allowed'
                          : approvalStatus === 'Done'
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl hover:scale-105'
                            : 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-lg hover:shadow-xl hover:scale-105'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processing {selectedItems.length} items...</span>
                        </>
                      ) : (
                        <>
                          {approvalStatus === 'Done'
                            ? <CheckCircle2 className="h-5 w-5" />
                            : approvalStatus === 'Reject'
                              ? <XCircle className="h-5 w-5" />
                              : <Package className="h-5 w-5" />}
                          <span>
                            {approvalStatus === 'Done'   ? 'Approve'
                              : approvalStatus === 'Reject' ? 'Reject'
                              : 'Submit'}{' '}
                            All {selectedItems.length} Items
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}