import React, { useState } from "react";
import {
  useGetPendingTransfersQuery,
  useUpdateActualBankTransferMutation,
} from '../../features/SchedulePayment/bank_to_bank_transfer_slice';
import { X, FileText, Loader2 } from "lucide-react";
import Swal from 'sweetalert2';

const Transfer_bank_To_bank = () => {
  const {
    data: pendingTransfers = [],
    isLoading,
    isError,
    refetch,
  } = useGetPendingTransfersQuery();

  const [updateActualBankTransfer, { isLoading: isUpdating }] = useUpdateActualBankTransferMutation();

  const [selectedRow, setSelectedRow] = useState(null);
  const [status, setStatus] = useState("");
  const [remark, setRemark] = useState("");

  const openUpdateModal = (row) => {
    setSelectedRow(row);
    setStatus("");
    setRemark("");
  };

  const closeModal = () => {
    setSelectedRow(null);
    setStatus("");
    setRemark("");
  };

  const handleUpdate = async () => {
    if (!status.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Status Required',
        text: 'Please enter a status',
        confirmButtonColor: '#6366f1',
      });
      return;
    }

    Swal.fire({
      title: 'Updating...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      await updateActualBankTransfer({
        UID: selectedRow.uid,
        status: status.trim(),
        remark: remark.trim(),
      }).unwrap();

      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Actual Bank Transfer updated successfully!',
        confirmButtonColor: '#10b981',
        timer: 2200,
        showConfirmButton: false,
      });

      closeModal();
      refetch();
    } catch (err) {
      console.error('Update failed:', err);

      let errorMessage = 'Something went wrong. Please try again.';
      if (err?.data?.message) errorMessage = err.data.message;
      else if (err?.error) errorMessage = err.error;

      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: errorMessage,
        confirmButtonColor: '#ef4444',
      });
    }
  };

  const totalAmount = pendingTransfers.reduce((sum, item) => {
    return sum + Number(item.Amount?.replace(/[₹,]/g, "") || 0);
  }, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-14 h-14 animate-spin text-indigo-600" />
          <p className="text-lg font-semibold text-indigo-700">
            Loading pending transfers...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        <div className="text-center max-w-md bg-white border border-red-100 shadow-xl rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-3 text-red-600">
            Error loading data
          </h2>
          <p className="mb-6 text-gray-600">
            Unable to fetch pending bank transfers.
          </p>
          <button
            onClick={refetch}
            className="px-8 py-3 rounded-xl font-medium shadow-md bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (pendingTransfers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        <div className="text-center max-w-md bg-white border border-gray-200 shadow-xl rounded-2xl p-8">
          <h2 className="text-3xl font-bold mb-3 text-indigo-700">
            No Pending Transfers
          </h2>
          <p className="mb-6 text-gray-600">
            All bank-to-bank transfers have been updated with actual status.
          </p>
          <button
            onClick={refetch}
            className="px-8 py-3 rounded-xl font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300 transition"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 xl:px-10 w-full bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="w-full space-y-8">

        {/* Header */}
        <div className="rounded-3xl border border-gray-200 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.08)] w-full p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-10">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Bank to Bank Transfer
              </h1>
              <p className="mt-2 text-base sm:text-lg text-gray-600">
                Pending Actual Updates • {pendingTransfers.length} records
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-emerald-200 shadow-md min-w-[280px] lg:min-w-[360px] bg-gradient-to-br from-emerald-50 to-teal-50 text-center lg:text-left">
              <p className="text-xs uppercase tracking-wider font-semibold mb-2 text-emerald-700">
                Total Pending Amount
              </p>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-700">
                ₹{totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-3xl border border-gray-200 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.06)] w-full">
          <table className="w-full min-w-[1400px] border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white">
                {[
                  "Planned",
                  "UID",
                  "From A/c",
                  "To A/c",
                  "Amount",
                  "Mode",
                  "Details",
                  "Date",
                  "Remark",
                  "Action",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-5 lg:px-6 text-left text-sm font-semibold uppercase tracking-wider whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {pendingTransfers.map((row) => (
                <tr
                  key={row.uid}
                  className="hover:bg-indigo-50/50 transition-colors duration-150"
                >
                  <td className="px-4 py-5 lg:px-6 text-center">
                    <span className="inline-block px-3 py-1.5 text-sm rounded-lg border bg-amber-50 text-amber-700 border-amber-200">
                      {row.planned2 || "-"}
                    </span>
                  </td>

                  <td className="px-4 py-5 lg:px-6">
                    <span className="inline-block px-3 py-1.5 text-sm rounded-lg font-medium border bg-indigo-50 text-indigo-700 border-indigo-200">
                      {row.uid}
                    </span>
                  </td>

                  <td
                    className="px-4 py-5 lg:px-6 text-gray-800 max-w-xs lg:max-w-md truncate"
                    title={row.Transfer_A_C_Name}
                  >
                    {row.Transfer_A_C_Name || "-"}
                  </td>

                  <td
                    className="px-4 py-5 lg:px-6 text-gray-800 max-w-xs lg:max-w-md truncate"
                    title={row.Transfer_Received_A_C_Name}
                  >
                    {row.Transfer_Received_A_C_Name || "-"}
                  </td>

                  <td className="px-4 py-5 lg:px-6 text-emerald-600 font-semibold text-base lg:text-lg">
                    ₹{row.Amount || "0"}
                  </td>

                  <td className="px-4 py-5 lg:px-6">
                    <span className="inline-block px-3 py-1.5 text-sm rounded-lg border bg-purple-50 text-purple-700 border-purple-200">
                      {row.PaymentMode || "-"}
                    </span>
                  </td>

                  <td className="px-4 py-5 lg:px-6 text-gray-800 max-w-md truncate text-base">
                    {row.PAYMENT_DETAILS || "-"}
                  </td>

                  <td className="px-4 py-5 lg:px-6 text-gray-700 text-base">
                    {row.PAYMENT_DATE || "-"}
                  </td>

                  <td className="px-4 py-5 lg:px-6 text-gray-800 max-w-xs lg:max-w-md truncate text-base">
                    {row.Remark || "-"}
                  </td>

                  <td className="px-4 py-5 lg:px-6 text-center">
                    <button
                      onClick={() => openUpdateModal(row)}
                      className="p-3 rounded-xl transition shadow-md hover:scale-105 bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600"
                      title="Update Status"
                    >
                      <FileText className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selectedRow && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="rounded-3xl shadow-2xl w-full max-w-3xl border border-gray-200 overflow-hidden bg-white">
            <div className="p-6 lg:p-8 flex justify-between items-center border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
              <h3 className="text-2xl lg:text-3xl font-bold text-indigo-800">
                Update Actual Bank Transfer
              </h3>
              <button
                onClick={closeModal}
                className="transition p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-7 h-7" />
              </button>
            </div>

            <div className="p-6 lg:p-8 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl border border-gray-200 bg-gray-50">
                  <p className="text-sm uppercase mb-2 text-gray-500">UID</p>
                  <p className="text-xl font-semibold break-all text-indigo-700">
                    {selectedRow.uid}
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-gray-200 bg-gray-50">
                  <p className="text-sm uppercase mb-2 text-gray-500">Amount</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    ₹{selectedRow.Amount}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-800 mb-3">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">──── Select Status ────</option>
                  <option value="Done">Done</option>
                  <option value="Cancel">Cancel</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-800 mb-3">
                  Remark (optional)
                </label>
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  rows={4}
                  placeholder="Add any note or reason..."
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  onClick={closeModal}
                  className="px-8 py-3 rounded-xl transition text-base font-medium bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  Cancel
                </button>

                <button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className={`px-10 py-3 rounded-xl font-medium flex items-center justify-center gap-3 transition-all text-base min-w-[180px] ${
                    isUpdating
                      ? 'bg-indigo-300 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md'
                  }`}
                >
                  {isUpdating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Status"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transfer_bank_To_bank;