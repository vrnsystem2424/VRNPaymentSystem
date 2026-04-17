



import React, { useState } from 'react';
import {
  useSubmitCapitalMovementMutation,
  useSubmitBankTransferMutation,
  useGetDropdownDataQuery
} from '../../features/SchedulePayment/FormSlice';
import Swal from 'sweetalert2';

const Form = () => {
  const [activeTab, setActiveTab] = useState('transfer');

  const [submitCapitalMovement, {
    isLoading: isSubmittingCapital,
    isError: capitalError,
    error: capitalErr,
  }] = useSubmitCapitalMovementMutation();

  const [submitBankTransfer, {
    isLoading: isSubmittingTransfer,
    isError: transferError,
    error: transferErr,
  }] = useSubmitBankTransferMutation();

  const {
    data: dropdownData,
    isLoading: isDropdownLoading,
  } = useGetDropdownDataQuery();

  const accounts = dropdownData?.accounts || [];
  const capitalMovements = dropdownData?.capitalMovements || [];

  const [capitalFormData, setCapitalFormData] = useState({
    Capital_Movment: '',
    Received_Account: '',
    Amount: '',
    PAYMENT_MODE: '',
    PAYMENT_DETAILS: '',
    PAYMENT_DATE: '',
    Remark: '',
  });

  const [transferFormData, setTransferFormData] = useState({
    Transfer_A_C_Name: '',
    Transfer_Received_A_C_Name: '',
    Amount: '',
    PAYMENT_MODE: '',
    PAYMENT_DETAILS: '',
    PAYMENT_DATE: '',
    Remark: '',
  });

  const showCapitalTransactionDetails = ['Cheque', 'NEFT', 'RTGS', 'UPI'].includes(capitalFormData.PAYMENT_MODE);
  const showTransferTransactionDetails = ['Cheque', 'NEFT', 'RTGS'].includes(transferFormData.PAYMENT_MODE);

  const handleCapitalChange = (e) => {
    const { name, value } = e.target;
    setCapitalFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTransferChange = (e) => {
    const { name, value } = e.target;
    setTransferFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCapitalSubmit = async () => {
    if (!capitalFormData.Capital_Movment) {
      return Swal.fire({ icon: 'warning', title: 'Required', text: 'Capital Movement is required' });
    }
    if (!capitalFormData.Received_Account) {
      return Swal.fire({ icon: 'warning', title: 'Required', text: 'Received Account is required' });
    }
    if (!capitalFormData.Amount || Number(capitalFormData.Amount) <= 0) {
      return Swal.fire({ icon: 'warning', title: 'Invalid Amount', text: 'Valid Amount is required' });
    }
    if (!capitalFormData.PAYMENT_MODE) {
      return Swal.fire({ icon: 'warning', title: 'Required', text: 'Payment Mode is required' });
    }
    if (showCapitalTransactionDetails && (!capitalFormData.PAYMENT_DETAILS?.trim() || !capitalFormData.PAYMENT_DATE?.trim())) {
      return Swal.fire({ icon: 'warning', title: 'Required', text: 'Payment Details and Date are required for selected mode' });
    }

    try {
      const result = await submitCapitalMovement(capitalFormData).unwrap();

      Swal.fire({
        icon: 'success',
        title: 'Capital Entry Saved!',
        text: `UID: ${result.data?.UID || 'Generated'}`,
        confirmButtonColor: '#10b981',
        timer: 2500,
        showConfirmButton: false,
      });

      setCapitalFormData({
        Capital_Movment: '',
        Received_Account: '',
        Amount: '',
        PAYMENT_MODE: '',
        PAYMENT_DETAILS: '',
        PAYMENT_DATE: '',
        Remark: '',
      });
    } catch (err) {
      console.error('Capital movement error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: err?.data?.message || 'Failed to save capital movement.',
      });
    }
  };

  const handleTransferSubmit = async () => {
    if (!transferFormData.Transfer_A_C_Name) {
      return Swal.fire({ icon: 'warning', title: 'Required', text: 'From Account is required' });
    }
    if (!transferFormData.Transfer_Received_A_C_Name) {
      return Swal.fire({ icon: 'warning', title: 'Required', text: 'To Account is required' });
    }
    if (transferFormData.Transfer_A_C_Name === transferFormData.Transfer_Received_A_C_Name) {
      return Swal.fire({ icon: 'warning', title: 'Invalid', text: 'From and To accounts cannot be the same' });
    }
    if (!transferFormData.Amount || Number(transferFormData.Amount) <= 0) {
      return Swal.fire({ icon: 'warning', title: 'Invalid Amount', text: 'Valid Amount is required' });
    }
    if (!transferFormData.PAYMENT_MODE) {
      return Swal.fire({ icon: 'warning', title: 'Required', text: 'Payment Mode is required' });
    }
    if (showTransferTransactionDetails && (!transferFormData.PAYMENT_DETAILS?.trim() || !transferFormData.PAYMENT_DATE?.trim())) {
      return Swal.fire({ icon: 'warning', title: 'Required', text: 'Payment Details / UTR and Date are required for selected mode' });
    }

    try {
      const payload = {
        Transfer_A_C_Name: transferFormData.Transfer_A_C_Name,
        Transfer_Received_A_C_Name: transferFormData.Transfer_Received_A_C_Name,
        Amount: Number(transferFormData.Amount),
        PAYMENT_MODE: transferFormData.PAYMENT_MODE,
        PAYMENT_DETAILS: transferFormData.PAYMENT_DETAILS || '',
        PAYMENT_DATE: transferFormData.PAYMENT_DATE || '',
        Remark: transferFormData.Remark || '',
      };

      const result = await submitBankTransfer(payload).unwrap();

      Swal.fire({
        icon: 'success',
        title: 'Bank Transfer Saved!',
        text: `UID: ${result?.data?.UID || 'Generated'}`,
        confirmButtonColor: '#10b981',
        timer: 2500,
        showConfirmButton: false,
      });

      setTransferFormData({
        Transfer_A_C_Name: '',
        Transfer_Received_A_C_Name: '',
        Amount: '',
        PAYMENT_MODE: '',
        PAYMENT_DETAILS: '',
        PAYMENT_DATE: '',
        Remark: '',
      });
    } catch (err) {
      console.error('Bank transfer error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: err?.data?.message || 'Failed to submit bank transfer.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-8 px-4 sm:px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-gray-200 overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-6 py-8 sm:px-10 md:px-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white text-center">
              Payment Management
            </h2>
            <p className="text-center mt-3 text-indigo-100 text-base sm:text-lg">
              Manage bank transfer and capital account entries
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab('transfer')}
              className={`flex-1 py-4 text-center font-semibold text-base sm:text-lg transition-all duration-200 ${
                activeTab === 'transfer'
                  ? 'bg-white text-indigo-700 border-b-4 border-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
              }`}
            >
              Bank Transfer
            </button>

            <button
              onClick={() => setActiveTab('capital')}
              className={`flex-1 py-4 text-center font-semibold text-base sm:text-lg transition-all duration-200 ${
                activeTab === 'capital'
                  ? 'bg-white text-amber-700 border-b-4 border-amber-500 shadow-sm'
                  : 'text-gray-600 hover:bg-amber-50 hover:text-amber-700'
              }`}
            >
              Capital A/C
            </button>
          </div>

          <div className="p-6 sm:p-8 md:p-10 lg:p-12">

            {/* BANK TRANSFER */}
            {activeTab === 'transfer' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Transfer A/C Name (From) <span className="text-red-500">*</span>
                    </label>
                    {isDropdownLoading ? (
                      <div className="text-indigo-600 italic">Loading accounts...</div>
                    ) : (
                      <select
                        name="Transfer_A_C_Name"
                        value={transferFormData.Transfer_A_C_Name}
                        onChange={handleTransferChange}
                        className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                      >
                        <option value="">-- Select Account --</option>
                        {accounts.map((acc, i) => (
                          <option key={i} value={acc}>{acc}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Transfer Received A/C Name (To) <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="Transfer_Received_A_C_Name"
                      value={transferFormData.Transfer_Received_A_C_Name}
                      onChange={handleTransferChange}
                      className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                    >
                      <option value="">-- Select Account --</option>
                      {accounts.map((acc, i) => (
                        <option key={i} value={acc}>{acc}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                      <input
                        type="number"
                        name="Amount"
                        value={transferFormData.Amount}
                        onChange={handleTransferChange}
                        min="1"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full pl-10 pr-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Payment Mode <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="PAYMENT_MODE"
                      value={transferFormData.PAYMENT_MODE}
                      onChange={handleTransferChange}
                      className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                    >
                      <option value="">---- Select ----</option>
                      <option value="Cheque">Cheque</option>
                      <option value="NEFT">NEFT</option>
                      <option value="RTGS">RTGS</option>
                    </select>
                  </div>
                </div>

                {showTransferTransactionDetails && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-indigo-50 border border-indigo-100 rounded-2xl">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        {transferFormData.PAYMENT_MODE === 'Cheque' ? 'Cheque No' : 'UTR No / Ref No'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="PAYMENT_DETAILS"
                        value={transferFormData.PAYMENT_DETAILS}
                        onChange={handleTransferChange}
                        className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Payment Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="PAYMENT_DATE"
                        value={transferFormData.PAYMENT_DATE}
                        onChange={handleTransferChange}
                        className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Remark (Optional)
                  </label>
                  <textarea
                    name="Remark"
                    value={transferFormData.Remark}
                    onChange={handleTransferChange}
                    rows="4"
                    placeholder="Any additional notes..."
                    className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 resize-y min-h-[120px]"
                  />
                </div>

                <button
                  onClick={handleTransferSubmit}
                  disabled={isSubmittingTransfer}
                  className={`w-full py-4 rounded-2xl text-white font-bold text-lg transition-all shadow-lg ${
                    isSubmittingTransfer
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700'
                  }`}
                >
                  {isSubmittingTransfer ? 'Submitting Transfer...' : '✓ Submit Bank Transfer'}
                </button>

                {transferError && (
                  <div className="p-5 border border-red-200 rounded-2xl bg-red-50 text-center">
                    <p className="font-semibold text-red-700">
                      ✗ {transferErr?.data?.message || 'Failed to submit transfer'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* CAPITAL A/C */}
            {activeTab === 'capital' && (
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Capital Movement <span className="text-red-500">*</span>
                  </label>
                  {isDropdownLoading ? (
                    <div className="text-indigo-600 italic">Loading movements...</div>
                  ) : (
                    <select
                      name="Capital_Movment"
                      value={capitalFormData.Capital_Movment}
                      onChange={handleCapitalChange}
                      className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-800"
                    >
                      <option value="">-- Select Movement --</option>
                      {capitalMovements.map((item, i) => (
                        <option key={i} value={item}>{item}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Received Account <span className="text-red-500">*</span>
                  </label>
                  {isDropdownLoading ? (
                    <div className="text-indigo-600 italic">Loading accounts...</div>
                  ) : (
                    <select
                      name="Received_Account"
                      value={capitalFormData.Received_Account}
                      onChange={handleCapitalChange}
                      className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-800"
                    >
                      <option value="">-- Select Account --</option>
                      {accounts.map((acc, i) => (
                        <option key={i} value={acc}>{acc}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                      <input
                        type="number"
                        name="Amount"
                        value={capitalFormData.Amount}
                        onChange={handleCapitalChange}
                        min="1"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full pl-10 pr-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Payment Mode <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="PAYMENT_MODE"
                      value={capitalFormData.PAYMENT_MODE}
                      onChange={handleCapitalChange}
                      className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-800"
                    >
                      <option value="">---- Select ----</option>
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                      <option value="NEFT">NEFT</option>
                      <option value="RTGS">RTGS</option>
                      <option value="UPI">UPI</option>
                    </select>
                  </div>
                </div>

                {showCapitalTransactionDetails && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-amber-50 border border-amber-100 rounded-2xl">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        {capitalFormData.PAYMENT_MODE === 'Cheque' ? 'Cheque No' : 'Payment Details / UTR No'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="PAYMENT_DETAILS"
                        value={capitalFormData.PAYMENT_DETAILS}
                        onChange={handleCapitalChange}
                        className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-800"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Payment Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="PAYMENT_DATE"
                        value={capitalFormData.PAYMENT_DATE}
                        onChange={handleCapitalChange}
                        className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-800"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Remark (Optional)
                  </label>
                  <textarea
                    name="Remark"
                    value={capitalFormData.Remark}
                    onChange={handleCapitalChange}
                    rows="4"
                    placeholder="Any additional notes or reference..."
                    className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-800 resize-y min-h-[120px]"
                  />
                </div>

                <button
                  onClick={handleCapitalSubmit}
                  disabled={isSubmittingCapital}
                  className={`w-full py-4 rounded-2xl text-white font-bold text-lg transition-all shadow-lg ${
                    isSubmittingCapital
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600'
                  }`}
                >
                  {isSubmittingCapital ? 'Saving Capital Entry...' : '✓ Save Capital Movement'}
                </button>

                {capitalError && (
                  <div className="p-5 border border-red-200 rounded-2xl bg-red-50 text-center">
                    <p className="font-semibold text-red-700">
                      ✗ {capitalErr?.data?.message || 'Failed to save capital entry'}
                    </p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Form;