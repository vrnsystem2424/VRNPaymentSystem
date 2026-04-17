import React, { useState, useMemo, useEffect } from 'react';
import {
  useGetPendingApprovalsQuery,
  useUpdateApprovalMutation,
} from '../../features/OfficeExpense/approve1Slice';
import { 
  Pencil, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  X,
  FileText
} from 'lucide-react';

export default function Approvel1({ user }) {
  const { data: apiResponse, isLoading, isError, error, refetch } =
    useGetPendingApprovalsQuery();

  const [updateApproval, { isLoading: isSubmitting }] = useUpdateApprovalMutation();
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState('');
  const [revisedAmount, setRevisedAmount] = useState(0);
  const [remark, setRemark] = useState('');

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  // Extract raw data from API response
  const rawData = useMemo(() => {
    if (apiResponse?.data && Array.isArray(apiResponse.data)) {
      return apiResponse.data;
    }
    if (Array.isArray(apiResponse)) {
      return apiResponse;
    }
    return [];
  }, [apiResponse]);

  // Parse all items - NO FILTER
  const parsedItems = useMemo(() => {
    if (!rawData.length) return [];

    return rawData.map((item) => {
      const rawAmount = String(item.Amount || item.amount || '0').replace(/,/g, '');
      const parsedAmount = Number(rawAmount) || 0;

      return {
        OFFBILLUID: String(item.OFFBILLUID || '').trim(),
        uid: String(item.uid || '').trim(),
        office: String(item.OFFICE_NAME_1 || '').trim(),
        payee: String(item.PAYEE_NAME_1 || '').trim(),
        head: String(item.EXPENSES_HEAD_1 || '').trim(),
        subhead: String(item.EXPENSES_SUBHEAD_1 || '').trim(),
        itemName: String(item.ITEM_NAME_1 || '').trim(),
        unit: String(item.UNIT_1 || '').trim(),
        qty: String(item.Qty_1 || item.QTY_1 || '1').trim(),
        amount: parsedAmount,
        raisedBy: String(item.RAISED_BY_1 || '').trim(),
        photo: String(item.Bill_Photo || item.bill_photo || '').trim(),
        originalRemark: String(item.REMARK_1 || '').trim(),
        approvalDoer: String(item.APPROVAL_DOER || item.approval_doer || '').trim(),
      };
    });
  }, [rawData]);

  // Open Modal with selected item
  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setRevisedAmount(item.amount);
    setApprovalStatus('');
    setRemark('');
    setIsModalOpen(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setApprovalStatus('');
    setRemark('');
    setRevisedAmount(0);
  };

  // Submit Approval
  const handleSubmit = async () => {
    if (!selectedItem) return;
    if (!approvalStatus) return alert('Please select approval status');

    try {
      await updateApproval({
        uid: selectedItem.uid,
        OFFBILLUID: selectedItem.OFFBILLUID,
        STATUS_2: approvalStatus,
        REVISED_AMOUNT_3: revisedAmount,
        APPROVAL_DOER_2: selectedItem.approvalDoer,
        REMARK_2: remark.trim(),
      }).unwrap();

      alert('Approval submitted successfully!');
      handleCloseModal();
      refetch();
    } catch (err) {
      alert('Error: ' + (err?.data?.message || err.message || 'Failed'));
      console.error(err);
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Done':
        return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
      case 'Reject':
        return <XCircle className="h-5 w-5 text-rose-600" />;
      default:
        return null;
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading pending approvals...</p>
        </div>
      </div>
    );
  }

  // Error State
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 md:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-indigo-800 bg-clip-text text-transparent mb-2">
              Level 1 Approvals
            </h1>
            <div className="flex flex-wrap items-center gap-4">
              <div className="h-2 w-2 rounded-full bg-indigo-600"></div>
              <p className="text-slate-600 font-medium">
                {parsedItems.length} items pending review
              </p>
            </div>
          </div>

          <button
            onClick={refetch}
            disabled={isSubmitting}
            className="group flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
            <span>Refresh</span>
          </button>
        </div>

        {/* No Data Message */}
        {parsedItems.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">All caught up!</h2>
            <p className="text-slate-600">No pending approvals right now.</p>
          </div>
        )}

        {/* Data Table */}
        {parsedItems.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            
            {/* Table Header Info */}
            <div className="p-6 bg-gradient-to-r from-slate-50 to-indigo-50 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-indigo-600" />
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Pending Bills</h2>
                  <p className="text-sm text-slate-600">Click on pencil icon to approve/reject</p>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-4 text-left font-semibold text-slate-900 uppercase text-xs tracking-wide">S.No</th>
                    <th className="px-4 py-4 text-left font-semibold text-slate-900 uppercase text-xs tracking-wide">Bill UID</th>
                    <th className="px-4 py-4 text-left font-semibold text-slate-900 uppercase text-xs tracking-wide">UID</th>
                    <th className="px-4 py-4 text-left font-semibold text-slate-900 uppercase text-xs tracking-wide">Office</th>
                    <th className="px-4 py-4 text-left font-semibold text-slate-900 uppercase text-xs tracking-wide">Payee</th>
                    <th className="px-4 py-4 text-left font-semibold text-slate-900 uppercase text-xs tracking-wide">Head</th>
                    <th className="px-4 py-4 text-left font-semibold text-slate-900 uppercase text-xs tracking-wide">Subhead</th>
                    <th className="px-4 py-4 text-left font-semibold text-slate-900 uppercase text-xs tracking-wide">Item</th>
                    <th className="px-4 py-4 text-left font-semibold text-slate-900 uppercase text-xs tracking-wide">Qty</th>
                    <th className="px-4 py-4 text-right font-semibold text-slate-900 uppercase text-xs tracking-wide">Amount</th>
                    <th className="px-4 py-4 text-left font-semibold text-slate-900 uppercase text-xs tracking-wide">Raised By</th>
                    <th className="px-4 py-4 text-left font-semibold text-slate-900 uppercase text-xs tracking-wide">Approval Doer</th>
                    <th className="px-4 py-4 text-left font-semibold text-slate-900 uppercase text-xs tracking-wide">Remark</th>
                    <th className="px-4 py-4 text-center font-semibold text-slate-900 uppercase text-xs tracking-wide">Photo</th>
                    <th className="px-4 py-4 text-center font-semibold text-slate-900 uppercase text-xs tracking-wide">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {parsedItems.map((item, index) => (
                    <tr key={item.uid} className="hover:bg-indigo-50/50 transition-colors duration-150">
                      <td className="px-4 py-4 text-slate-600 font-medium">{index + 1}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-700 font-semibold text-xs">
                          {item.OFFBILLUID || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-700 font-medium">{item.uid || '-'}</td>
                      <td className="px-4 py-4 text-slate-700">{item.office || '-'}</td>
                      <td className="px-4 py-4 text-slate-700">{item.payee || '-'}</td>
                      <td className="px-4 py-4 text-slate-700">{item.head || '-'}</td>
                      <td className="px-4 py-4 text-slate-700">{item.subhead || '-'}</td>
                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-900">{item.itemName || '-'}</div>
                      </td>
                      <td className="px-4 py-4 text-slate-700 whitespace-nowrap">
                        {item.qty} {item.unit}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="font-bold text-emerald-600">
                          ₹{item.amount.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-700 text-xs">{item.raisedBy || '-'}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-100 text-purple-700 font-medium text-xs">
                          {item.approvalDoer || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-xs text-slate-600 max-w-[150px] truncate" title={item.originalRemark}>
                          {item.originalRemark || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {item.photo && item.photo !== 'No file uploaded' && item.photo !== '' ? (
                          <a
                            href={item.photo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs">N/A</span>
                        )}
                      </td>
                      
                      {/* Action - Pencil Icon */}
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                          title="Approve/Reject"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-600">
                  Showing <span className="font-semibold">{parsedItems.length}</span> items
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  Total: <span className="text-emerald-600">₹{parsedItems.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✅ MODAL WITH SCROLLING */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseModal}
          ></div>
          
          {/* Modal Container - Centered with padding */}
          <div className="flex min-h-full items-center justify-center p-4">
            
            {/* Modal Content - With max-height and scroll */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
              
              {/* Modal Header - Fixed at top */}
              <div className="flex-shrink-0 p-5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Approval Action</h3>
                    <p className="text-indigo-200 text-sm mt-1">
                      Bill: {selectedItem.OFFBILLUID} • UID: {selectedItem.uid}
                    </p>
                  </div>
                  <button 
                    onClick={handleCloseModal}
                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto">
                
                {/* Item Info */}
                <div className="p-5 bg-slate-50 border-b border-slate-200">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-500">Item Name</p>
                      <p className="font-semibold text-slate-900">{selectedItem.itemName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Payee</p>
                      <p className="font-semibold text-slate-900">{selectedItem.payee || '-'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Office</p>
                      <p className="font-semibold text-slate-900">{selectedItem.office || '-'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Original Amount</p>
                      <p className="font-bold text-emerald-600">₹{selectedItem.amount.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <div className="p-5 space-y-4">
                  
                  {/* Status */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Status <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={approvalStatus}
                        onChange={(e) => setApprovalStatus(e.target.value)}
                        className="w-full px-4 py-3 pr-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900 appearance-none bg-white font-medium"
                      >
                        <option value="">------ Select Status ------</option>
                        <option value="Done">✅ Done (Approve)</option>
                        <option value="Reject">❌ Reject</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        {approvalStatus && getStatusIcon(approvalStatus)}
                      </div>
                    </div>
                  </div>

                  {/* Revised Amount */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Revised Amount
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={revisedAmount}
                      onChange={(e) => setRevisedAmount(Number(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900 font-medium"
                    />
                  </div>

                  {/* Approving As - DISABLED with APPROVAL_DOER from API */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Approving As
                    </label>
                    <input
                      type="text"
                      value={selectedItem.approvalDoer || 'N/A'}
                      disabled
                      className="w-full px-4 py-3 bg-slate-100 border border-slate-300 rounded-xl text-slate-700 font-medium cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Auto-filled from APPROVAL_DOER (read only)
                    </p>
                  </div>

                  {/* Remark */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Remark / Comments
                    </label>
                    <textarea
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                      rows={3}
                      placeholder="Add your comments or reason for rejection..."
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900 placeholder:text-slate-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer - Fixed at bottom */}
              <div className="flex-shrink-0 p-5 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                <button
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl font-semibold border border-slate-300 transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !approvalStatus}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-white min-w-[120px] flex items-center justify-center gap-2 transition-all ${
                    isSubmitting || !approvalStatus
                      ? 'bg-indigo-400 cursor-not-allowed opacity-75'
                      : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Submit</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}