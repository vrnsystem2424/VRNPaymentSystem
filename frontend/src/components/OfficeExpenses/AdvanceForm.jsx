import React, { useState } from 'react';
import {
  useGetAdvanceDropdownQuery,
  useAddAdvancePaymentMutation,
} from '../../features/OfficeExpense/AdvanceFormSlice';
import {
  RefreshCw,
  DollarSign,
  Calendar,
  Building2,
  CreditCard,
  FileText,
  CheckCircle,
  User,
} from 'lucide-react';

export default function AdvanceForm() {
  // ✅ Dropdown data fetch
  const {
    data: dropdownData,
    isLoading: isLoadingDropdown,
    isError,
    refetch,
  } = useGetAdvanceDropdownQuery();

  const [addAdvancePayment, { isLoading: isSubmitting }] =
    useAddAdvancePaymentMutation();

  // Extract dropdown arrays
  const bankNames    = dropdownData?.bankNames    || [];
  const projectNames = dropdownData?.projectNames || [];
  const vendorNames  = dropdownData?.vendorNames  || [];

  // Form state
  const [formData, setFormData] = useState({
    Project_Name: '',
    VENDOR_NAME: '',
    PAID_AMOUNT: '',
    BANK_DETAILS: '',
    PAYMENT_MODE: '',
    PAYMENT_DETAILS: '',
    PAYMENT_DATE: '',
  });

  const resetForm = () => {
    setFormData({
      Project_Name: '',
      VENDOR_NAME: '',
      PAID_AMOUNT: '',
      BANK_DETAILS: '',
      PAYMENT_MODE: '',
      PAYMENT_DETAILS: '',
      PAYMENT_DATE: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.Project_Name.trim()) {
      alert('Project Name is required');
      return;
    }
    if (!formData.VENDOR_NAME.trim()) {
      alert('Vendor Name is required');
      return;
    }
    if (!formData.PAID_AMOUNT || Number(formData.PAID_AMOUNT) <= 0) {
      alert('Valid Paid Amount is required');
      return;
    }

    try {
      await addAdvancePayment(formData).unwrap();
      alert('✓ Advance Payment added successfully!');
      resetForm();
      refetch();
    } catch (err) {
      console.error('Submit error:', err);
      alert(
        `Error: ${err?.data?.message || err?.message || 'Something went wrong'}`
      );
    }
  };

  // ── Loading ────────────────────────────────────────────────
  if (isLoadingDropdown) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dropdown data...</p>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-red-600 mb-3">Failed to load dropdown data</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-indigo-900 flex items-center gap-2">
              <DollarSign size={32} />
              Advance Payment Form
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {bankNames.length} Banks • {projectNames.length} Projects •{' '}
              {vendorNames.length} Vendors loaded
            </p>
          </div>

          <button
            onClick={refetch}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl border shadow-lg overflow-hidden">
          <div className="p-5 bg-indigo-50 border-b">
            <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
              <FileText size={22} />
              New Advance Payment Entry
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Fill the details below. Timestamp will be added automatically.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">

            <div className="grid md:grid-cols-2 gap-5">

              {/* ✅ Project Name - DROPDOWN (L column) */}
              <div>
                <label className="flex items-center gap-1 text-sm font-medium mb-1.5 text-gray-700">
                  <Building2 size={14} />
                  Project Name <span className="text-red-500">*</span>
                </label>
                <select
                  name="Project_Name"
                  value={formData.Project_Name}
                  onChange={handleChange}
                  className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-400"
                  required
                >
                  <option value="">-- Select Project --</option>
                  {projectNames.map((project, idx) => (
                    <option key={idx} value={project}>
                      {project}
                    </option>
                  ))}
                </select>
                {projectNames.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    No projects found in sheet
                  </p>
                )}
              </div>

              {/* ✅ Vendor Name - DROPDOWN (M column) */}
              <div>
                <label className="flex items-center gap-1 text-sm font-medium mb-1.5 text-gray-700">
                  <User size={14} />
                  Vendor Name <span className="text-red-500">*</span>
                </label>
                <select
                  name="VENDOR_NAME"
                  value={formData.VENDOR_NAME}
                  onChange={handleChange}
                  className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-400"
                  required
                >
                  <option value="">-- Select Vendor --</option>
                  {vendorNames.map((vendor, idx) => (
                    <option key={idx} value={vendor}>
                      {vendor}
                    </option>
                  ))}
                </select>
                {vendorNames.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    No vendors found in sheet
                  </p>
                )}
              </div>

              {/* Paid Amount */}
              <div>
                <label className="flex items-center gap-1 text-sm font-medium mb-1.5 text-gray-700">
                  <DollarSign size={14} />
                  Paid Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="PAID_AMOUNT"
                  value={formData.PAID_AMOUNT}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-400"
                  required
                />
              </div>

              {/* Payment Date */}
              <div>
                <label className="flex items-center gap-1 text-sm font-medium mb-1.5 text-gray-700">
                  <Calendar size={14} />
                  Payment Date
                </label>
                <input
                  type="date"
                  name="PAYMENT_DATE"
                  value={formData.PAYMENT_DATE}
                  onChange={handleChange}
                  className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              {/* ✅ Bank Details - DROPDOWN (A column) */}
              <div>
                <label className="flex items-center gap-1 text-sm font-medium mb-1.5 text-gray-700">
                  <CreditCard size={14} />
                  Bank Details
                </label>
                <select
                  name="BANK_DETAILS"
                  value={formData.BANK_DETAILS}
                  onChange={handleChange}
                  className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="">-- Select Bank --</option>
                  {bankNames.map((bank, idx) => (
                    <option key={idx} value={bank}>
                      {bank}
                    </option>
                  ))}
                </select>
                {bankNames.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    No banks found in sheet
                  </p>
                )}
              </div>

              {/* Payment Mode */}
              <div>
                <label className="text-sm font-medium mb-1.5 text-gray-700 block">
                  Payment Mode
                </label>
                <select
                  name="PAYMENT_MODE"
                  value={formData.PAYMENT_MODE}
                  onChange={handleChange}
                  className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="">-- Select Mode --</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="NEFT">NEFT</option>
                  <option value="RTGS">RTGS</option>
                </select>
              </div>

            </div>

            {/* Payment Details - Full Width */}
            <div>
              <label className="flex items-center gap-1 text-sm font-medium mb-1.5 text-gray-700">
                <FileText size={14} />
                Payment Details / Remarks
              </label>
              <textarea
                name="PAYMENT_DETAILS"
                value={formData.PAYMENT_DETAILS}
                onChange={handleChange}
                rows={3}
                placeholder="Transaction ID, cheque no., or any other details..."
                className="w-full p-3 border rounded-lg outline-none resize-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2.5 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Submit Payment
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}