import React, { useState, useEffect, useRef } from "react";
import { useGetPendingDimPaymentsQuery, useUpdateDimPaymentMutation } from "../../features/OfficeExpense/paymentSlice";
import { useGetProjectBankMappingQuery } from "../../features/SchedulePayment/SchedulePaymentSlice";
import { FaSearch, FaChevronDown, FaTimes, FaCheckCircle, FaMoneyBillWave, FaArrowDown, FaExclamationTriangle } from "react-icons/fa";

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
          <span style={{ marginLeft: 8, backgroundColor: "#6366f1", color: "white", borderRadius: 10, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>{selectedValues.length}</span>
        )}
      </label>
      {selectedValues.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8, maxHeight: 80, overflowY: "auto" }}>
          {selectedValues.map((val) => (
            <span key={val} style={{ display: "inline-flex", alignItems: "center", gap: 4, backgroundColor: "#eef2ff", color: "#4f46e5", border: "1px solid #c7d2fe", borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>
              {val}<FaTimes onClick={() => removeTag(val)} style={{ fontSize: 9, cursor: "pointer", color: "#6366f1" }} />
            </span>
          ))}
          <span onClick={clearAll} style={{ display: "inline-flex", alignItems: "center", backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Clear All ✕</span>
        </div>
      )}
      <div style={{ position: "relative" }}>
        <input value={search} onFocus={() => setOpen(true)} onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
          placeholder={selectedValues.length > 0 ? `${selectedValues.length} selected — search more…` : placeholder}
          style={{ width: "100%", padding: "11px 40px 11px 14px", borderRadius: 10, border: open ? "1.5px solid #6366f1" : "1.5px solid #e2e8f0", fontSize: 14, outline: "none", backgroundColor: "white", boxSizing: "border-box", fontFamily: "inherit" }} />
        <FaChevronDown style={{ position: "absolute", right: 13, top: "50%", transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`, color: "#94a3b8", fontSize: 11 }} />
      </div>
      {open && (
        <ul style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, backgroundColor: "white", border: "1.5px solid #e2e8f0", borderRadius: 10, maxHeight: 240, overflowY: "auto", zIndex: 200, listStyle: "none", margin: 0, padding: 0, boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}>
          <li style={{ padding: "8px 16px", display: "flex", justifyContent: "space-between", borderBottom: "1.5px solid #f1f5f9", backgroundColor: "#f8fafc" }}>
            <span onClick={selectAll} style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", cursor: "pointer", textDecoration: "underline" }}>Select All ({filtered.length})</span>
            <span onClick={clearAll} style={{ fontSize: 12, fontWeight: 700, color: "#ef4444", cursor: "pointer", textDecoration: "underline" }}>Deselect All</span>
          </li>
          {filtered.length === 0 ? (
            <li style={{ padding: "14px 16px", fontSize: 13, color: "#94a3b8", textAlign: "center" }}>No results found</li>
          ) : filtered.map((o, i) => {
            const val = o[displayKey].toString();
            const isChecked = selectedValues.includes(val);
            return (
              <li key={i} onClick={() => toggleOption(val)} style={{ padding: "10px 16px", cursor: "pointer", fontSize: 14, color: "#1e293b", display: "flex", alignItems: "center", gap: 10, borderBottom: i < filtered.length - 1 ? "1px solid #f1f5f9" : "none", backgroundColor: isChecked ? "#f0f4ff" : "transparent" }}
                onMouseOver={(e) => { if (!isChecked) e.currentTarget.style.backgroundColor = "#f8fafc"; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = isChecked ? "#f0f4ff" : "transparent"; }}>
                <div style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0, border: `2px solid ${isChecked ? "#6366f1" : "#cbd5e1"}`, backgroundColor: isChecked ? "#6366f1" : "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isChecked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
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

const ExpensesPayemnt = () => {
  const { data: apiData, isLoading, isError, refetch } = useGetPendingDimPaymentsQuery();
  const [updateDimPayment, { isLoading: isSubmitting }] = useUpdateDimPaymentMutation();
  const { data: bankMappingData, isLoading: isBankLoading, isError: isBankError } = useGetProjectBankMappingQuery();

  const bankOptions = React.useMemo(() => {
    if (!bankMappingData?.map) return [];
    return Object.keys(bankMappingData.map);
  }, [bankMappingData]);

  const allData = apiData?.data || [];
  const uniqueVendors = [...new Map(allData.filter((d) => d.Vendor_Name_4).map((d) => [d.Vendor_Name_4, { Vendor_Name_4: d.Vendor_Name_4 }])).values()];

  const [selectedVendors, setSelectedVendors] = useState([]);
  const [selectedBillNos, setSelectedBillNos] = useState([]);
  const [showBills, setShowBills] = useState(false);
  const [filteredBills, setFilteredBills] = useState([]);
  const [selectedBills, setSelectedBills] = useState([]);
  const [paidAmounts, setPaidAmounts] = useState({});
  const [tdsAmounts, setTdsAmounts] = useState({});
  const [roundups, setRoundups] = useState({});
  const [remarks, setRemarks] = useState({});
  const [partialMode, setPartialMode] = useState({});

  const [bankDetails, setBankDetails] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const paymentSectionRef = useRef(null);

  const billNoOptions = [...new Map(
    allData.filter((d) => {
      if (!d.OFFBILLUID) return false;
      if (selectedVendors.length > 0) return selectedVendors.includes(d.Vendor_Name_4 || "");
      return true;
    }).map((d) => [d.OFFBILLUID.toString(), { OFFBILLUID: d.OFFBILLUID.toString() }])
  ).values()];

  const handleFilter = () => {
    if (selectedVendors.length === 0 && selectedBillNos.length === 0) return alert("Vendor ya Bill Number select karein");
    const results = allData.filter((d) => {
      const vm = selectedVendors.length > 0 ? selectedVendors.includes(d.Vendor_Name_4 || "") : true;
      const bm = selectedBillNos.length > 0 ? selectedBillNos.includes((d.OFFBILLUID || "").toString()) : true;
      return vm && bm;
    });
    setFilteredBills(results); setShowBills(true); setSelectedBills([]); setPaidAmounts({}); setTdsAmounts({}); setRoundups({}); setRemarks({}); setPartialMode({});
  };

  const handleClear = () => {
    setShowBills(false); setSelectedVendors([]); setSelectedBillNos([]); setSelectedBills([]); setFilteredBills([]); setPaidAmounts({}); setTdsAmounts({}); setRoundups({}); setRemarks({}); setPartialMode({});
  };

  const toggleBill = (uid) => {
    setSelectedBills((prev) => {
      if (prev.includes(uid)) {
        setPaidAmounts((p) => { const n = { ...p }; delete n[uid]; return n; });
        setTdsAmounts((p) => { const n = { ...p }; delete n[uid]; return n; });
        setRoundups((p) => { const n = { ...p }; delete n[uid]; return n; });
        setRemarks((p) => { const n = { ...p }; delete n[uid]; return n; });
        setPartialMode((p) => { const n = { ...p }; delete n[uid]; return n; });
        return prev.filter((id) => id !== uid);
      }
      setPaidAmounts((p) => ({ ...p, [uid]: "" })); setTdsAmounts((p) => ({ ...p, [uid]: "" }));
      setRoundups((p) => ({ ...p, [uid]: 0 })); setRemarks((p) => ({ ...p, [uid]: "" }));
      setPartialMode((p) => ({ ...p, [uid]: false }));
      return [...prev, uid];
    });
  };

  const selectAllBills = () => {
    const allUids = filteredBills.map((b) => b.uid);
    setSelectedBills(allUids);
    const nP = {}, nT = {}, nR = {}, nRe = {}, nPa = {};
    allUids.forEach((uid) => { nP[uid] = paidAmounts[uid] ?? ""; nT[uid] = tdsAmounts[uid] ?? ""; nR[uid] = roundups[uid] ?? 0; nRe[uid] = remarks[uid] ?? ""; nPa[uid] = partialMode[uid] ?? false; });
    setPaidAmounts(nP); setTdsAmounts(nT); setRoundups(nR); setRemarks(nRe); setPartialMode(nPa);
  };

  const deselectAllBills = () => { setSelectedBills([]); setPaidAmounts({}); setTdsAmounts({}); setRoundups({}); setRemarks({}); setPartialMode({}); };

  const handleRoundupChange = (uid, value) => {
    let v = value === "" ? 0 : parseFloat(value);
    if (isNaN(v)) v = 0;
    if (v > 9) v = 9; if (v < -9) v = -9;
    setRoundups((prev) => ({ ...prev, [uid]: v }));
  };

  /*
   * ✅ TDS LOGIC:
   * Paid Amount = Bill ke against credit (bill balance se minus hoga)
   * TDS = Paid amount se cut (bank transfer ke liye)
   * Net Payable = Paid - TDS + RoundOff (jo actually bank se jayega)
   * 
   * Example:
   * Bill: ₹10,000 | Already Paid: ₹3,000
   * Paid: ₹5,000 → Bill credit = ₹5,000 → New balance = ₹2,000
   * TDS: ₹500 → Bank transfer = ₹4,500
   */

  // ✅ Grand Total = sum of bank transfers (Paid - TDS + RoundOff)
  const grandTotal = selectedBills.reduce((sum, uid) => {
    const paid  = Number(paidAmounts[uid] || 0);
    const tds   = Number(tdsAmounts[uid]  || 0);
    const round = Number(roundups[uid]    || 0);
    return sum + (paid - tds) + round;
  }, 0);

  // ✅ Paid validation: can't exceed bill balance
  const handlePaidAmountChange = (uid, value) => {
    const bill = filteredBills.find(b => b.uid === uid);
    if (!bill) return;
    const netAmount   = Number((bill.NET_AMOUNT_4 || "0").toString().replace(/,/g, "")) || 0;
    const alreadyPaid = Number(bill.ALREADY_PAID || 0);
    const newPaid     = Number(value) || 0;
    const maxAllowed  = netAmount - alreadyPaid;
    
    if (newPaid > maxAllowed && maxAllowed >= 0) {
      alert(`⚠️ Max Allowed: ₹${fmt(maxAllowed)}\n\nBill: ₹${fmt(netAmount)}\nAlready Paid: ₹${fmt(alreadyPaid)}`);
      setPaidAmounts((p) => ({ ...p, [uid]: maxAllowed }));
      return;
    }
    setPaidAmounts((p) => ({ ...p, [uid]: value }));
  };

  // ✅ SUBMIT - Correct payload
  const handleSubmit = async () => {
  if (selectedBills.length === 0) return alert("कम से कम एक bill select करें");
  if (!bankDetails || !paymentMode || !paymentDetails.trim() || !paymentDate) return alert("सभी Global Payment Details भरें");

  const emptyPaid = selectedBills.filter((uid) => paidAmounts[uid] === "" || paidAmounts[uid] === undefined || isNaN(Number(paidAmounts[uid])));
  if (emptyPaid.length > 0) return alert(`${emptyPaid.length} bill(s) में Paid Amount खाली है`);

  const invalidTds = selectedBills.filter((uid) => Number(tdsAmounts[uid] || 0) > Number(paidAmounts[uid] || 0));
  if (invalidTds.length > 0) return alert(`${invalidTds.length} bill(s) में TDS > Paid Amount`);

  const overpaid = selectedBills.filter((uid) => {
    const bill = filteredBills.find(b => b.uid === uid);
    if (!bill) return false;
    const netAmount   = Number((bill.NET_AMOUNT_4 || "0").toString().replace(/,/g, "")) || 0;
    const alreadyPaid = Number(bill.ALREADY_PAID || 0);
    const currentPaid = Number(paidAmounts[uid] || 0);
    return (alreadyPaid + currentPaid) > netAmount + 0.01;
  });
  if (overpaid.length > 0) return alert(`⚠️ ${overpaid.length} bill(s) mein total Bill Amount se zyada hai!`);

  try {
    for (const uid of selectedBills) {
      const bill        = filteredBills.find((b) => b.uid === uid);
      const netAmount   = Number((bill?.NET_AMOUNT_4 || "0").toString().replace(/,/g, "")) || 0;
      const alreadyPaid = Number(bill?.ALREADY_PAID || 0);
      const currentPaid = Number(paidAmounts[uid] || 0);
      const tds         = Number(tdsAmounts[uid]  || 0);
      const roundup     = Number(roundups[uid]    || 0);

      const cumulativePaid   = alreadyPaid + currentPaid;
      const balanceRemaining = Math.max(0, netAmount - cumulativePaid);
      
      // ✅ Bank transfer / Net Payable
      const bankTransfer = (currentPaid - tds) + roundup;
      
      const isPartial = partialMode[uid] || (cumulativePaid < netAmount - 0.01);

      await updateDimPayment({
        uid,
        NET_AMOUNT_5:        netAmount,
        TDS_5:               tds || "",
        PAID_AMOUNT_5:       currentPaid,
        CUMULATIVE_PAID_5:   cumulativePaid,
        BALANCE_AMOUNT_5:    balanceRemaining,
        BANK_DETAILS_5:      bankDetails,
        PAYMENT_MODE_5:      paymentMode,
        PAYMENT_DETAILS_5:   paymentDetails,
        PAYMENT_DATE_5:      paymentDate,
        Remark_5:            remarks[uid] || "",
        IS_PARTIAL:          isPartial,

        // Payment_Sheet fields
        OFFBILLUID:    bill?.OFFBILLUID || "",
        Vendor_Name_4: bill?.Vendor_Name_4 || "",
        BILL_NO_4:     bill?.BILL_NO_4 || "",
        BILL_DATE_4:   bill?.BILL_DATE_4 || "",
        PLANNED_5:     bill?.PLANNED_5 || "",
        NET_PAYABLE:   bankTransfer,           // ✅ NEW - H column mein jayega
        GRAND_TOTAL:   bankTransfer,           // O column
      }).unwrap();
    }

    alert(`✅ ${selectedBills.length} payment(s) submitted successfully!`);
    handleClear();
    setBankDetails(""); setPaymentMode(""); setPaymentDetails(""); setPaymentDate("");
    refetch();
  } catch (err) {
    alert("Error: " + (err?.data?.message || err?.message || "Unknown"));
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

      <div style={{ marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#1e293b", letterSpacing: "-0.5px" }}>
            <FaMoneyBillWave style={{ color: "#6366f1", marginRight: 10, verticalAlign: "middle" }} />
            VRN Office Payment
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
            {allData.length} pending • {allData.filter(b => b.IS_PARTIAL).length} partial
          </p>
        </div>
        <div style={{ backgroundColor: "#6366f118", border: "1px solid #6366f130", borderRadius: 10, padding: "8px 18px", fontSize: 13, fontWeight: 600, color: "#6366f1" }}>
          Stage 5 — Payment
        </div>
      </div>

      <div style={{ backgroundColor: "white", borderRadius: 16, padding: "24px 28px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 24, border: "1px solid #f1f5f9" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 16 }}>🔍 Filter Bills</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <MultiSelectDropdown label="Vendor Name" placeholder="Search vendors…" selectedValues={selectedVendors} onChange={setSelectedVendors} options={uniqueVendors} displayKey="Vendor_Name_4" />
          <MultiSelectDropdown label="Office Bill Number" placeholder="Search bill numbers…" selectedValues={selectedBillNos} onChange={setSelectedBillNos} options={billNoOptions} displayKey="OFFBILLUID" />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={handleFilter} style={{ padding: "11px 28px", backgroundColor: "#6366f1", color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit" }}>
            <FaSearch style={{ fontSize: 12 }} /> Show Bills
          </button>
          {(selectedVendors.length > 0 || selectedBillNos.length > 0) && (
            <button onClick={handleClear} style={{ padding: "11px 20px", backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "inherit" }}>
              <FaTimes style={{ fontSize: 11 }} /> Clear
            </button>
          )}
        </div>
      </div>

      {showBills && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>
              Bills <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 500, color: "#94a3b8" }}>{filteredBills.length} found</span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {filteredBills.length > 0 && (
                <button onClick={selectedBills.length === filteredBills.length ? deselectAllBills : selectAllBills} style={{ background: "none", border: "1px solid #c7d2fe", borderRadius: 8, padding: "7px 14px", cursor: "pointer", color: "#4f46e5", fontWeight: 600, fontSize: 12, fontFamily: "inherit" }}>
                  <FaCheckCircle style={{ fontSize: 11, marginRight: 4 }} />
                  {selectedBills.length === filteredBills.length ? "Deselect All" : "Select All"}
                </button>
              )}
              <button onClick={handleClear} style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 14px", cursor: "pointer", color: "#64748b", fontWeight: 600, fontSize: 13, fontFamily: "inherit" }}>
                <FaTimes style={{ fontSize: 11 }} /> Clear
              </button>
            </div>
          </div>

          {filteredBills.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: 15, backgroundColor: "white", borderRadius: 14, border: "1px solid #f1f5f9" }}>No bills found</div>
          ) : filteredBills.map((bill) => {
            const isSelected  = selectedBills.includes(bill.uid);
            const parseAmt    = (v) => Number((v || "0").toString().replace(/,/g, "")) || 0;
            const netAmount   = parseAmt(bill.NET_AMOUNT_4);
            const alreadyPaid = Number(bill.ALREADY_PAID || 0);
            const advTotal    = Number(bill.ADVANCE_TOTAL || 0);
            const pstTotal    = Number(bill.PAYMENT_SHEET_TOTAL || 0);
            const currentPaid = Number(paidAmounts[bill.uid] || 0);
            const tds         = Number(tdsAmounts[bill.uid]  || 0);
            const roundup     = Number(roundups[bill.uid]    || 0);

            // ✅ Bank transfer = Paid - TDS + RoundOff
            const netPayable   = (currentPaid - tds) + roundup;
            
            // ✅ Bill credit = Paid amount (full, TDS doesn't reduce bill)
            const totalBillCredit  = alreadyPaid + currentPaid;
            const remainingAfter   = Math.max(0, netAmount - totalBillCredit);
            const maxAllowedPaid   = Math.max(0, netAmount - alreadyPaid);
            const isFullyPaidAfter = totalBillCredit >= netAmount - 0.01;
            const isOverpaid       = totalBillCredit > netAmount + 0.01;
            const billBalance      = Number(bill.BALANCE_AMOUNT || netAmount);

            return (
              <div key={bill.uid} style={{
                backgroundColor: "white", borderRadius: 14, padding: "22px 26px", marginBottom: 16,
                border: isSelected ? "2px solid #6366f1" : bill.IS_PARTIAL ? "2px solid #fbbf24" : "1.5px solid #f1f5f9",
                boxShadow: isSelected ? "0 0 0 3px #6366f115" : "0 1px 4px rgba(0,0,0,0.05)",
              }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div onClick={() => toggleBill(bill.uid)} style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${isSelected ? "#6366f1" : "#cbd5e1"}`, backgroundColor: isSelected ? "#6366f1" : "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, marginTop: 2 }}>
                      {isSelected && <FaCheckCircle style={{ color: "white", fontSize: 12 }} />}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>{bill.OFFICE_NAME_1 || bill.Vendor_Name_4}</div>
                        {bill.IS_PARTIAL && <span style={{ backgroundColor: "#fef3c7", color: "#d97706", border: "1px solid #fde68a", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>⚡ PARTIAL</span>}
                      </div>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                        {bill.EXPENSES_HEAD_1}{bill.EXPENSES_SUBHEAD_1 ? ` → ${bill.EXPENSES_SUBHEAD_1}` : ""}
                        {bill.OFFBILLUID && <span style={{ marginLeft: 8, color: "#f59e0b", fontWeight: 600, backgroundColor: "#fef3c7", padding: "1px 6px", borderRadius: 4, fontSize: 11 }}>{bill.OFFBILLUID}</span>}
                        {bill.uid && <span style={{ marginLeft: 6, color: "#c7d2fe", fontWeight: 600 }}>UID: {bill.uid}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <AmountBadge label="Bill Amount" amount={netAmount} color="#6366f1" />
                    {alreadyPaid > 0 && (
                      <>
                        <AmountBadge label="Already Paid" amount={alreadyPaid} color="#10b981" />
                        <AmountBadge label="Balance Due" amount={billBalance} color="#ef4444" />
                      </>
                    )}
                  </div>
                </div>

                {/* Payment History - Simple one line */}
                {(advTotal > 0 || pstTotal > 0) && (
                  <div style={{ marginBottom: 16, padding: "10px 14px", backgroundColor: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", fontSize: 12 }}>
                    <span style={{ color: "#64748b", fontWeight: 600 }}>📋 History:</span>
                    {advTotal > 0 && <span style={{ color: "#1e40af", fontWeight: 600 }}>💰 Advance: <b>₹{fmt(advTotal)}</b> ({bill.ADVANCE_ENTRIES?.length} entries)</span>}
                    {pstTotal > 0 && <span style={{ color: "#15803d", fontWeight: 600 }}>🟢 Paid: <b>₹{fmt(pstTotal)}</b> ({bill.PAYMENT_SHEET_ENTRIES?.length} payments)</span>}
                    <span style={{ color: "#dc2626", fontWeight: 700, borderLeft: "1px solid #cbd5e1", paddingLeft: 12 }}>
                      Total: ₹{fmt(alreadyPaid)} / ₹{fmt(netAmount)}
                    </span>
                  </div>
                )}

                {/* Details Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px 20px", paddingTop: 14, borderTop: "1px solid #f8fafc" }}>
                  <InfoChip label="Office Bill No" value={bill.OFFBILLUID} accent="#f59e0b" />
                  <InfoChip label="Item Name" value={bill.ITEM_NAME_1} />
                  <InfoChip label="Dept" value={bill.DEPARTMENT_1} />
                  <InfoChip label="Raised By" value={bill.RAISED_BY_1} />
                  <InfoChip label="Vendor" value={bill.Vendor_Name_4} accent="#6366f1" />
                  <InfoChip label="Bill No (Vendor)" value={bill.BILL_NO_4} />
                  <InfoChip label="Bill Date" value={bill.BILL_DATE_4} />
                  <InfoChip label="GST" value={`C: ${bill.CGST_4 || "—"} | S: ${bill.SGST_4 || "—"}`} />
                  <InfoChip label="Planned Date" value={bill.PLANNED_5} accent="#f59e0b" />
                  <InfoChip label="Payee" value={bill.PAYEE_NAME_1} />
                </div>

                {bill.Bill_Photo && (
                  <div style={{ marginTop: 14 }}>
                    <a href={bill.Bill_Photo} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#6366f1", fontWeight: 600, textDecoration: "none", border: "1px solid #6366f130", borderRadius: 6, padding: "5px 12px", backgroundColor: "#6366f108" }}>📎 View Bill Photo</a>
                  </div>
                )}

                {/* Payment Entry */}
                {isSelected && (
                  <div style={{ marginTop: 20, padding: "18px 20px", backgroundColor: "#f8f9ff", borderRadius: 12, border: "1px solid #e0e7ff" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#4f46e5", marginBottom: 14 }}>
                      Payment Entry — {bill.ITEM_NAME_1 || bill.uid}
                    </div>

                    {/* Partial Toggle */}
                    <div style={{ marginBottom: 14, padding: "10px 14px", backgroundColor: partialMode[bill.uid] ? "#fef3c7" : "#fffbeb", borderRadius: 8, border: `1px solid ${partialMode[bill.uid] ? "#f59e0b" : "#fde68a"}`, display: "flex", alignItems: "center", gap: 10 }}>
                      <input type="checkbox" id={`partial-${bill.uid}`} checked={partialMode[bill.uid] || false} onChange={(e) => setPartialMode((p) => ({ ...p, [bill.uid]: e.target.checked }))} style={{ width: 16, height: 16, cursor: "pointer" }} />
                      <label htmlFor={`partial-${bill.uid}`} style={{ fontSize: 13, fontWeight: 600, color: "#92400e", cursor: "pointer", flex: 1 }}>
                        ⚡ Mark as Partial Payment
                      </label>
                    </div>

                    {/* Status Banner */}
                    {currentPaid > 0 && (
                      <div style={{
                        marginBottom: 14, padding: "10px 14px",
                        backgroundColor: isOverpaid ? "#fee2e2" : isFullyPaidAfter && !partialMode[bill.uid] ? "#dcfce7" : "#fef3c7",
                        borderRadius: 8, border: `1.5px solid ${isOverpaid ? "#fca5a5" : isFullyPaidAfter && !partialMode[bill.uid] ? "#86efac" : "#fde68a"}`,
                        fontSize: 12, fontWeight: 600,
                        color: isOverpaid ? "#dc2626" : isFullyPaidAfter && !partialMode[bill.uid] ? "#15803d" : "#92400e",
                      }}>
                        {isOverpaid ? (
                          <><FaExclamationTriangle style={{ marginRight: 6 }} />OVERPAYMENT! Total ₹{fmt(totalBillCredit)} exceeds Bill ₹{fmt(netAmount)}</>
                        ) : isFullyPaidAfter && !partialMode[bill.uid] ? (
                          <>✅ Bill <b>FULLY PAID</b> → Status: Done</>
                        ) : (
                          <>⚡ ₹{fmt(remainingAfter)} remaining → Status: Partial</>
                        )}
                      </div>
                    )}

                    {/* 5 Inputs Only */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 16 }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6 }}>
                          PAID AMOUNT ₹
                          {alreadyPaid > 0 && <span style={{ marginLeft: 4, fontSize: 9, color: "#16a34a", backgroundColor: "#dcfce7", borderRadius: 4, padding: "1px 5px" }}>MAX ₹{fmt(maxAllowedPaid)}</span>}
                        </label>
                        <input type="number" min="0" placeholder="Enter amount" value={paidAmounts[bill.uid] ?? ""}
                          onChange={(e) => handlePaidAmountChange(bill.uid, e.target.value)}
                          style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1.5px solid ${isOverpaid ? "#ef4444" : "#a5b4fc"}`, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
                      </div>

                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6 }}>
                          TDS ₹ <span style={{ fontSize: 9, color: "#94a3b8", backgroundColor: "#f1f5f9", borderRadius: 4, padding: "1px 5px" }}>OPTIONAL</span>
                        </label>
                        <input type="number" min="0" placeholder="0" value={tdsAmounts[bill.uid] ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") { setTdsAmounts((p) => ({ ...p, [bill.uid]: "" })); return; }
                            let v = Number(val);
                            const paid = Number(paidAmounts[bill.uid] || 0);
                            if (v > paid) { alert(`TDS ₹${v} > Paid ₹${fmt(paid)}`); v = paid; }
                            setTdsAmounts((p) => ({ ...p, [bill.uid]: v }));
                          }}
                          style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #86efac", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", backgroundColor: "#f0fdf4" }} />
                      </div>

                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6 }}>ROUND OFF (+/-)</label>
                        <input type="number" step="0.01" min="-9" max="9" placeholder="0" value={roundups[bill.uid] ?? ""}
                          onChange={(e) => handleRoundupChange(bill.uid, e.target.value)}
                          style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #fcd34d", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", backgroundColor: "#fffdf0" }} />
                      </div>

                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6 }}>NET PAYABLE ₹</label>
                        <input readOnly value={fmt(netPayable)}
                          style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1.5px solid ${netPayable > 0 ? "#86efac" : "#fca5a5"}`, fontSize: 14, backgroundColor: netPayable > 0 ? "#f0fdf4" : "#fff5f5", color: netPayable > 0 ? "#16a34a" : "#dc2626", fontWeight: 700, boxSizing: "border-box", fontFamily: "inherit" }} />
                        {tds > 0 && <div style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>₹{fmt(currentPaid)} − ₹{fmt(tds)} TDS {roundup !== 0 && `${roundup > 0 ? "+" : ""}${fmt(roundup)}`}</div>}
                      </div>

                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6 }}>REMARK</label>
                        <input type="text" placeholder="Optional" value={remarks[bill.uid] || ""}
                          onChange={(e) => setRemarks((p) => ({ ...p, [bill.uid]: e.target.value }))}
                          style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
                      </div>
                    </div>

                    {/* Summary */}
                    {(currentPaid > 0 || tds > 0) && (
                      <div style={{ marginTop: 14, padding: "10px 16px", backgroundColor: "#eef2ff", borderRadius: 8, border: "1px solid #c7d2fe", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, fontSize: 12 }}>
                        <span style={{ color: "#4f46e5", fontWeight: 600 }}>Bill Credit: ₹{fmt(currentPaid)}</span>
                        {tds > 0 && <span style={{ color: "#dc2626", fontWeight: 600 }}>TDS: ₹{fmt(tds)}</span>}
                        {roundup !== 0 && <span style={{ color: "#f59e0b", fontWeight: 600 }}>Round: {roundup > 0 ? "+" : ""}{fmt(roundup)}</span>}
                        <span style={{ color: "#16a34a", fontWeight: 800 }}>Bank Transfer: ₹{fmt(netPayable)}</span>
                        {alreadyPaid > 0 && <span style={{ color: "#7c3aed", fontWeight: 700, borderLeft: "1px solid #c7d2fe", paddingLeft: 12 }}>Bill: ₹{fmt(totalBillCredit)} / ₹{fmt(netAmount)}</span>}
                      </div>
                    )}

                    <button onClick={() => paymentSectionRef.current?.scrollIntoView({ behavior: "smooth" })} style={{ marginTop: 14, padding: "8px 18px", backgroundColor: "#f0f4ff", border: "1.5px solid #c7d2fe", borderRadius: 8, cursor: "pointer", color: "#4f46e5", fontWeight: 600, fontSize: 12, fontFamily: "inherit" }}>
                      <FaArrowDown style={{ fontSize: 10, marginRight: 6 }} />Go to Payment Details
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
                Grand Total — {selectedBills.length} bill{selectedBills.length > 1 ? "s" : ""}
                {selectedBills.some((uid) => Number(tdsAmounts[uid] || 0) > 0) && (
                  <span style={{ marginLeft: 12, fontSize: 12, color: "#dc2626" }}>(TDS: ₹{fmt(selectedBills.reduce((s, uid) => s + Number(tdsAmounts[uid] || 0), 0))})</span>
                )}
                {selectedBills.some((uid) => partialMode[uid]) && (
                  <span style={{ marginLeft: 12, fontSize: 12, color: "#d97706" }}>⚡ {selectedBills.filter((uid) => partialMode[uid]).length} Partial</span>
                )}
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#4f46e5" }}>₹{fmt(grandTotal)}</div>
            </div>
          )}

          {/* Global Payment Details */}
          {selectedBills.length > 0 && (
            <div ref={paymentSectionRef} style={{ backgroundColor: "white", borderRadius: 16, padding: "26px 28px", marginTop: 24, border: "1.5px solid #e0e7ff", boxShadow: "0 4px 16px rgba(99,102,241,0.08)" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#1e293b", marginBottom: 20 }}>
                Global Payment Details
                <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 500, color: "#94a3b8" }}>For {selectedBills.length} bills</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6 }}>BANK DETAILS</label>
                  <select value={bankDetails} onChange={(e) => setBankDetails(e.target.value)} disabled={isBankLoading}
                    style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: `1.5px solid ${isBankError ? "#fca5a5" : "#e2e8f0"}`, fontSize: 13, outline: "none", fontFamily: "inherit" }}>
                    <option value="">{isBankLoading ? "⏳ Loading…" : isBankError ? "⚠️ Error" : "— Select Bank —"}</option>
                    {!isBankLoading && !isBankError && bankOptions.map((bank, idx) => <option key={idx} value={bank}>{bank}</option>)}
                    {isBankError && (<><option>HDFC A/c(0431)</option><option>My City A/c</option></>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6 }}>PAYMENT MODE</label>
                  <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}
                    style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", fontFamily: "inherit" }}>
                    <option value="">— Select —</option>
                    <option>Cheque</option><option>NEFT</option><option>RTGS</option><option>Cash</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6 }}>{paymentMode === "Cheque" ? "CHEQUE NUMBER" : "PAYMENT DETAILS"}</label>
                  <input type="text" placeholder={paymentMode === "Cheque" ? "Cheque no." : "Ref / UTR"} value={paymentDetails} onChange={(e) => setPaymentDetails(e.target.value)}
                    style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6 }}>PAYMENT DATE</label>
                  <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)}
                    style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
                </div>
              </div>

              <div style={{ marginTop: 18, padding: "12px 16px", backgroundColor: "#fffbeb", borderRadius: 9, border: "1px solid #fde68a", fontSize: 12, color: "#92400e" }}>
                💡 <b>Paid Amount</b> = Bill se minus hoga | <b>TDS</b> = Paid se cut (bank transfer ke liye) | <b>Net Payable</b> = Paid − TDS + RoundOff
              </div>

              <button onClick={handleSubmit} disabled={isSubmitting} style={{ marginTop: 24, padding: "14px 40px", backgroundColor: isSubmitting ? "#a5b4fc" : "#6366f1", color: "white", border: "none", borderRadius: 10, fontWeight: 800, fontSize: 15, cursor: isSubmitting ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
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