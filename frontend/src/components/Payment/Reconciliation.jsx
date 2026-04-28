import React, { useState, useEffect, useMemo } from "react";
import {
  useGetPaymentReconciliationQuery,
  useGetBankClosingBalanceQuery,
  useLazyGetBankClosingBalanceQuery,
  useUpdateReconciliationMutation,
} from "../../features/SchedulePayment/PaymentSlice";
import { X, Building, Search, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import { PaymentSlice } from "../../features/SchedulePayment/PaymentSlice";
import Swal from 'sweetalert2';

const Reconciliation = () => {
  const dispatch = useDispatch();
  const [triggerBankBalance] = useLazyGetBankClosingBalanceQuery();

  const {
    data: reconciliationData = [],
    isLoading,
  } = useGetPaymentReconciliationQuery();

  // ────────────────────────────────────────────────
  // Your existing states & logic (unchanged)
  // ────────────────────────────────────────────────
  const [selectedBank, setSelectedBank] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    BANK_CLOSING_BALANCE: "",
    Remark: "",
    Status: "---- Select ----- ",
  });
  const [saveStatus, setSaveStatus] = useState('');

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    let day, month, year;
    if (dateStr.includes('-')) [year, month, day] = dateStr.split('-');
    else if (dateStr.includes('/')) [day, month, year] = dateStr.split('/');
    else return null;
    const formatted = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const date = new Date(formatted);
    return isNaN(date.getTime()) ? null : date;
  };

  const uniqueBanks = useMemo(() => {
    return [...new Set(reconciliationData.map(item => item.bankDetails).filter(Boolean))];
  }, [reconciliationData]);

  const { 
    data: mainBankData = {}, 
    isLoading: isMainBankLoading 
  } = useGetBankClosingBalanceQuery(selectedBank, { skip: !selectedBank });

  const { 
    data: modalBankData = {}, 
    isLoading: isModalBankLoading 
  } = useGetBankClosingBalanceQuery(selectedItem?.bankDetails, {
    skip: !selectedItem?.bankDetails || !isModalOpen,
  });

  const [updateReconciliation, { isLoading: isSaving }] = useUpdateReconciliationMutation();

  const bankSpecificStats = useMemo(() => {
    if (!selectedBank) return { totalPaid: 0, count: 0, finalProjected: 0 };

    const bankItems = reconciliationData.filter(item => item.bankDetails === selectedBank);
    const totalPaid = bankItems.reduce((sum, item) => {
      const amt = Number(item.paidAmount?.replace(/[₹,]/g, "") || 0);
      return sum + (isNaN(amt) ? 0 : amt);
    }, 0);

    const currentE3 = Number(mainBankData?.bankClosingBalance?.replace(/[₹,]/g, "") || 0);
    const finalProjected = currentE3 - totalPaid;

    return { totalPaid, count: bankItems.length, finalProjected };
  }, [selectedBank, reconciliationData, mainBankData]);


  const totalPendingAmount = useMemo(() => {
    return reconciliationData.reduce((sum, item) => {
      const amountStr = (item.paidAmount || "0").replace(/[₹,]/g, "").trim();
      const amount = Number(amountStr);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
  }, [reconciliationData]);

  // Debounce + filtering logic remains exactly the same
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (!selectedBank) {
      setFilteredData([]);
      return;
    }
    let data = reconciliationData.filter(item => item.bankDetails === selectedBank);

    if (filterFromDate || filterToDate) {
      if (filterFromDate) {
        const from = parseDate(filterFromDate);
        if (from) data = data.filter(item => {
          const billDate = parseDate(item.paymentDate);
          return billDate && billDate >= from;
        });
      }
      if (filterToDate) {
        const to = parseDate(filterToDate);
        if (to) {
          to.setHours(23, 59, 59, 999);
          data = data.filter(item => {
            const billDate = parseDate(item.paymentDate);
            return billDate && billDate <= to;
          });
        }
      }
    }

    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      data = data.filter(item => {
        return (
          (item.uid?.toLowerCase().includes(term)) ||
          (item.contractorName?.toLowerCase().includes(term)) ||
          (item.bankDetails?.toLowerCase().includes(term)) ||
          (item.paymentDetails?.toLowerCase().includes(term)) ||
          (item.paymentMode?.toLowerCase().includes(term)) ||
          (item.ExpHead?.toLowerCase().includes(term)) ||
          (item.paymentDate?.toLowerCase().includes(term)) ||
          (item.timestamp?.toLowerCase().includes(term)) ||
          (item.planned2?.toLowerCase().includes(term)) ||
          (item.paidAmount?.replace(/[₹,]/g, "").includes(term))
        );
      });
    }
    setFilteredData(data);
  }, [selectedBank, reconciliationData, debouncedSearchTerm, filterFromDate, filterToDate]);

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setEditForm({
      BANK_CLOSING_BALANCE: "",
      Remark: item.Remark || "",
      Status: item.Status || "---- Select -----",
    });
    setSaveStatus('');
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (isModalOpen && selectedItem && modalBankData?.bankClosingBalance) {
      const originalBalance = Number(modalBankData.bankClosingBalance.replace(/[₹,]/g, ""));
      const paidAmount = Number(selectedItem.paidAmount.replace(/[₹,]/g, ""));
      const remaining = (originalBalance - paidAmount).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
      });
      setEditForm(prev => ({ ...prev, BANK_CLOSING_BALANCE: `₹${remaining}` }));
    }
  }, [modalBankData, isModalOpen, selectedItem]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setSaveStatus('');
    setEditForm({
      BANK_CLOSING_BALANCE: "",
      Remark: "",
      Status: "---- Select ----- ",
    });
  };

  const handleSaveReconciliation = async (e) => {
    e.preventDefault();

    if (editForm.Status === "---- Select -----") {
      Swal.fire({
        icon: "warning",
        title: "Status Required",
        text: "Please select a valid Status!",
        confirmButtonColor: "#6366f1",
      });
      return;
    }

    Swal.fire({
      title: "Saving Reconciliation...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const payload = {
      paymentDetails: selectedItem.paymentDetails.trim(),
      bankDetails: selectedItem.bankDetails.trim(),
      bankClosingBalanceAfterPayment: editForm.BANK_CLOSING_BALANCE.replace("₹", "").trim(),
      status: editForm.Status,
      remark: editForm.Remark.trim(),
    };

    try {
      await updateReconciliation(payload).unwrap();

      const bankName = selectedItem.bankDetails;

      if (selectedBank && bankName === selectedBank) {
        await triggerBankBalance(bankName, { forceRefetch: true }).unwrap();
        await new Promise(resolve => setTimeout(resolve, 6000));
        await triggerBankBalance(bankName, { forceRefetch: true }).unwrap();
      }

      dispatch(PaymentSlice.util.invalidateTags([{ type: 'BankBalance', id: bankName }]));

      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Reconciliation saved successfully!",
        confirmButtonColor: "#10b981",
        timer: 2200,
        showConfirmButton: false,
      });

      handleModalClose();
    } catch (error) {
      console.error("Save failed:", error);
      let errorMessage = "Something went wrong! Please try again.";
      if (error?.data?.message) errorMessage = error.data.message;
      else if (error?.error) errorMessage = error.error;

      Swal.fire({
        icon: "error",
        title: "Save Failed",
        text: errorMessage,
        confirmButtonColor: "#ef4444",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-800 font-medium">Loading reconciliation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden py-8 px-4 sm:px-6 lg:px-8 xl:px-10 w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
      style={{ scrollBehavior: "smooth" }}
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow bg-purple-300"></div>
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse-slow bg-blue-300" style={{ animationDelay: "3s" }}></div>
        <div className="absolute -bottom-32 left-1/3 w-[450px] h-[450px] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow bg-indigo-300" style={{ animationDelay: "6s" }}></div>
      </div> 

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-indigo-400 opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${10 + Math.random() * 15}s linear infinite`,
              animationDelay: `${Math.random() * 12}s`,
            }}
          />
        ))}
      </div>

      {/* Main content wrapper */}
      <div className="relative z-10 space-y-8">
        {/* Header section */}
        <div className="rounded-2xl border shadow-xl w-full p-6 sm:p-8 lg:p-10 xl:p-12 bg-white/80 backdrop-blur-sm border-indigo-200/60">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-700 bg-clip-text text-transparent flex items-center gap-3">
                <Building className="w-10 h-10 text-indigo-600" />
                Payment Reconciliation
              </h1>
              <p className="mt-2 text-lg text-indigo-600/80">
                Bank Wise Matching & Reconciliation
              </p>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              {/* Entries count */}
              <div className="px-5 py-2.5 rounded-full font-semibold text-sm shadow-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                {reconciliationData.length} Pending
              </div>

              {/* Total Pending Amount */}
              <div className="px-6 py-2.5 rounded-full font-semibold text-base shadow-lg bg-amber-100 text-amber-900 border border-amber-300">
                Total to Pay: ₹{totalPendingAmount.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {/* Bank Selection */}
        <div className="rounded-xl border p-4 shadow-lg bg-white/70 backdrop-blur-sm border-indigo-200/60">
          <select
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            className="w-full md:w-96 rounded-lg px-4 py-3 border-2 focus:ring-2 transition-all bg-white text-gray-900 border-gray-300 hover:border-indigo-400 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none"
          >
            <option value="">─── Select Bank Account ───</option>
            {uniqueBanks.map((bank) => (
              <option key={bank} value={bank}>{bank}</option>
            ))}
          </select>
        </div>

        {selectedBank && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl border shadow-xl bg-white/80 backdrop-blur-sm border-indigo-200/60">
                <p className="text-sm uppercase tracking-wide mb-1 text-indigo-600 font-medium">Current Balance</p>
                <p className="text-3xl font-bold text-gray-900">
                  {isMainBankLoading ? "..." : `₹${mainBankData?.bankClosingBalance || "0"}`}
                </p>
              </div>

              <div className="p-6 rounded-2xl border shadow-xl bg-white/80 backdrop-blur-sm border-indigo-200/60">
                <p className="text-sm uppercase tracking-wide mb-1 text-indigo-600 font-medium">Pending Entries</p>
                <p className="text-3xl font-bold text-amber-600">{bankSpecificStats.count}</p>
              </div>

              <div className="p-6 rounded-2xl border shadow-xl bg-white/80 backdrop-blur-sm border-indigo-200/60">
                <p className="text-sm uppercase tracking-wide mb-1 text-indigo-600 font-medium">Total Paid</p>
                <p className="text-3xl font-bold text-rose-600">
                  ₹{bankSpecificStats.totalPaid.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="p-6 rounded-2xl border shadow-xl bg-emerald-50/80 backdrop-blur-sm border-emerald-200/60">
                <p className="text-sm uppercase tracking-wide mb-1 text-emerald-700 font-medium">Projected Balance</p>
                <p className="text-3xl font-bold text-emerald-700">
                  ₹{bankSpecificStats.finalProjected.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="rounded-2xl border shadow-xl p-6 bg-white/80 backdrop-blur-sm border-indigo-200/60">
              <div className="space-y-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by UID, Contractor, Amount, Date, Bank..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-10 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all bg-white border-gray-300 hover:border-indigo-400 text-gray-900 placeholder-gray-400 focus:ring-indigo-400 focus:border-indigo-400 shadow-sm hover:shadow-md"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">From Payment Date</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 bg-white border-gray-300 text-gray-900 focus:ring-indigo-400 focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">To Payment Date</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 bg-white border-gray-300 text-gray-900 focus:ring-indigo-400 focus:border-indigo-400"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setFilterFromDate(fromDate);
                        setFilterToDate(toDate);
                      }}
                      className="w-full px-6 py-3 rounded-xl font-medium shadow-md transition-all bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white hover:shadow-lg"
                    >
                      Apply Date Filter
                    </button>
                  </div>
                </div>

                {(searchTerm || filterFromDate || filterToDate) && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setFromDate("");
                        setToDate("");
                        setFilterFromDate("");
                        setFilterToDate("");
                      }}
                      className="text-sm font-medium text-red-600 hover:text-red-500 transition"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Table container */}
            <div className="rounded-2xl border overflow-hidden shadow-xl bg-white/80 backdrop-blur-sm border-indigo-200/60">
              <div className="p-6 md:p-8 lg:p-10 border-b bg-gradient-to-r from-indigo-100 to-purple-100 border-indigo-200/40">
                <h3 className="text-2xl lg:text-3xl font-bold flex items-center gap-3 text-gray-900">
                  <FileText className="w-7 h-7 text-indigo-600" />
                  Reconciliation Entries
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-max">
                  <thead className="bg-gray-100/80">
                    <tr>
                      {["Timestamp", "UID", "Particulars", "Paid Amount", "Bank", "Mode", "Payment Details", "Payment Date", "Exp Head", "Planned 2", "Action"]
                        .map(h => (
                          <th key={h} className="px-6 py-4 text-left text-sm lg:text-base font-semibold uppercase tracking-wider text-gray-700">
                            {h}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/50">
                    {filteredData.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="px-6 py-12 text-center text-lg text-gray-500">
                          No matching records found
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((item) => (
                        <tr
                          key={item.uid || item.paymentDetails}
                          className="hover:bg-indigo-50/50 transition-colors"
                        >
                          <td className="px-6 py-5 font-medium text-indigo-700">{item.uid}</td>
                          <td className="px-6 py-5 text-gray-700">{item.timestamp || "-"}</td>
                          <td className="px-6 py-5 text-gray-800">{item.contractorName || "-"}</td>
                          <td className="px-6 py-5 font-medium text-emerald-700">
                            ₹{item.paidAmount || "0"}
                          </td>
                          <td className="px-6 py-5 text-gray-700">{item.bankDetails || "-"}</td>
                          <td className="px-6 py-5 text-gray-700">{item.paymentMode || "-"}</td>
                          <td className="px-6 py-5 max-w-md truncate text-gray-800">{item.paymentDetails || "-"}</td>
                          <td className="px-6 py-5 text-gray-700">{item.paymentDate || "-"}</td>
                          <td className="px-6 py-5 text-gray-700">{item.ExpHead || "-"}</td>
                          <td className="px-6 py-5 text-gray-700">{item.planned2 || "-"}</td>
                          <td className="px-6 py-5 text-center">
                            <button
                              onClick={() => handleEditClick(item)}
                              className="px-5 py-2.5 rounded-lg font-medium shadow-md transition-all flex items-center gap-2 mx-auto bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white hover:shadow-lg"
                            >
                              <FileText className="w-4 h-4" />
                              Reconcile
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && selectedItem && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="rounded-2xl shadow-2xl w-full max-w-2xl border overflow-hidden bg-white border-indigo-200">
              <div className="p-6 border-b flex justify-between items-center bg-gradient-to-r from-indigo-500 to-purple-500 border-indigo-200">
                <h3 className="text-2xl font-bold text-white">Reconcile Transaction</h3>
                <button onClick={handleModalClose} className="text-white/80 hover:text-white transition">
                  <X className="w-7 h-7" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Status messages */}
                {saveStatus === "success" && (
                  <div className="flex items-center gap-3 p-4 rounded-xl border bg-emerald-100 border-emerald-200 text-emerald-800">
                    <CheckCircle className="w-6 h-6" />
                    Successfully reconciled!
                  </div>
                )}
                {saveStatus === "error" && (
                  <div className="flex items-center gap-3 p-4 rounded-xl border bg-rose-100 border-rose-200 text-rose-800">
                    <AlertCircle className="w-6 h-6" />
                    Failed to save. Please try again.
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="p-5 rounded-xl border bg-gray-50 border-gray-200">
                    <p className="text-sm uppercase mb-1 text-gray-500 font-medium">Bank</p>
                    <p className="text-xl font-medium text-gray-900">{selectedItem.bankDetails}</p>
                  </div>
                  <div className="p-5 rounded-xl border bg-cyan-50 border-cyan-200">
                    <p className="text-sm uppercase mb-1 text-cyan-600 font-medium">E3 Balance</p>
                    <p className="text-xl font-bold text-cyan-700">
                      {isModalBankLoading ? "..." : `₹${modalBankData.bankClosingBalance || "0"}`}
                    </p>
                  </div>
                  <div className="p-5 rounded-xl border bg-rose-50 border-rose-200">
                    <p className="text-sm uppercase mb-1 text-rose-600 font-medium">Paid Amount</p>
                    <p className="text-xl font-bold text-rose-700">₹{selectedItem.paidAmount}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Auto-calculated Closing Balance
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={editForm.BANK_CLOSING_BALANCE}
                    className="w-full px-5 py-4 rounded-xl font-bold text-xl bg-emerald-50 border-2 border-emerald-200 text-emerald-700"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Remark</label>
                    <textarea
                      value={editForm.Remark}
                      onChange={(e) => setEditForm({ ...editForm, Remark: e.target.value })}
                      rows={3}
                      className="w-full px-5 py-4 rounded-xl resize-none focus:outline-none focus:ring-2 border-2 bg-white border-gray-300 text-gray-900 focus:ring-indigo-400 focus:border-indigo-400"
                      placeholder="Add remark if needed..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Reconciliation Status</label>
                    <select
                      value={editForm.Status}
                      onChange={(e) => setEditForm({ ...editForm, Status: e.target.value })}
                      className="w-full px-5 py-4 rounded-xl focus:outline-none focus:ring-2 border-2 bg-white border-gray-300 text-gray-900 focus:ring-indigo-400 focus:border-indigo-400"
                    >
                      <option value="---- Select ----- ">──── Select Status ────</option>
                      <option value="Done">Done</option>
                      <option value="Cancel">Cancel</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleModalClose}
                    className="px-8 py-3 rounded-xl font-medium transition bg-gray-200 hover:bg-gray-300 text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveReconciliation}
                    disabled={saveStatus === "saving" || isSaving || saveStatus === "success"}
                    className={`px-8 py-3 rounded-xl font-medium flex items-center gap-2 min-w-[180px] justify-center transition-all shadow-md
                      ${saveStatus === "success"
                        ? "bg-emerald-600 text-white shadow-emerald-300/50"
                        : saveStatus === "saving" || isSaving
                        ? "bg-indigo-400 text-white cursor-not-allowed"
                        : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white hover:shadow-lg"}`}
                  >
                    {saveStatus === "saving" || isSaving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : saveStatus === "success" ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Saved
                      </>
                    ) : (
                      "Save Reconciliation"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global styles */}
      
    </div>
  );
};

export default Reconciliation;






/////////////////////////

