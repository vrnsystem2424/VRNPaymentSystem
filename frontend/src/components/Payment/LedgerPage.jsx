import React, { useState, useEffect } from "react";
import {
  Search,
  ArrowLeft,
  Download,
  Share2,
  FileText,
  Loader2,
  User,
  Building2,
  Phone,
  Mail,
  IndianRupee,
  X,
} from "lucide-react";
import {
  useLazySearchLedgerQuery,
  useLazyGetLedgerDataQuery,
} from "../../features/SchedulePayment/LedgerSlice";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const LedgerPage = ({ onBack }) => {
  const [searchTerm, setSearchTerm]           = useState("");
  const [debouncedTerm, setDebouncedTerm]     = useState("");
  const [showResults, setShowResults]         = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [ledgerData, setLedgerData]           = useState(null);

  const [triggerSearch, { data: searchResults = [], isFetching: isSearching }] =
    useLazySearchLedgerQuery();

  const [triggerGetLedger, { isFetching: isLoadingLedger }] =
    useLazyGetLedgerDataQuery();

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedTerm(searchTerm.trim()), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedTerm.length >= 2) {
      triggerSearch(debouncedTerm);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [debouncedTerm, triggerSearch]);

  const handleSelectBooking = async (booking) => {
    setSelectedBooking(booking);
    setSearchTerm(booking.applicantName);
    setShowResults(false);

    try {
      const result = await triggerGetLedger(booking.bookingId).unwrap();
      setLedgerData(result);
    } catch (err) {
      console.error("Ledger load error:", err);
      alert("Failed to load ledger data");
    }
  };

  const handleClearSelection = () => {
    setSelectedBooking(null);
    setLedgerData(null);
    setSearchTerm("");
  };

  const fmtINR = (n) => {
    const num = parseFloat(n) || 0;
    return `Rs. ${num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const fmtDate = (d) => (!d ? "-" : d.toString().trim() || "-");

  // ══════════════════════════════════════════════════════════════════════
  // PDF GENERATION - COMPACT SINGLE PAGE
  // ══════════════════════════════════════════════════════════════════════
 // ══════════════════════════════════════════════════════════════════════
// PDF GENERATION - PROFESSIONAL SINGLE PAGE
// ══════════════════════════════════════════════════════════════════════
const generatePDF = (action = "download") => {
  if (!ledgerData) return null;

  const { booking, paymentHistory, summary } = ledgerData;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth  = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Helper - convert string to number
  const toNum = (v) => parseFloat(String(v || "0").replace(/[^0-9.-]/g, "")) || 0;

  // ═══════════════════════════════════════════════════════════════════
  // COLOR PALETTE
  // ═══════════════════════════════════════════════════════════════════
  const COLORS = {
    primaryDark:   [15, 23, 42],       // Slate-900
    primary:       [30, 41, 59],       // Slate-800
    accent:        [59, 130, 246],     // Blue-500
    accentLight:   [219, 234, 254],    // Blue-100
    accentDark:    [30, 58, 138],      // Blue-900
    success:       [16, 185, 129],     // Emerald-500
    successLight:  [209, 250, 229],    // Emerald-100
    successDark:   [6, 78, 59],        // Emerald-900
    danger:        [220, 38, 38],      // Red-600
    dangerLight:   [254, 226, 226],    // Red-100
    dangerDark:    [127, 29, 29],      // Red-900
    warning:       [245, 158, 11],     // Amber-500
    warningLight:  [254, 243, 199],    // Amber-100
    grayLightest:  [248, 250, 252],    // Slate-50
    grayLight:     [241, 245, 249],    // Slate-100
    grayMedium:    [148, 163, 184],    // Slate-400
    grayDark:      [71, 85, 105],      // Slate-600
    white:         [255, 255, 255],
    border:        [226, 232, 240],    // Slate-200
  };

  // ═══════════════════════════════════════════════════════════════════
  // HEADER BANNER
  // ═══════════════════════════════════════════════════════════════════
  // Main gradient background
  doc.setFillColor(...COLORS.primaryDark);
  doc.rect(0, 0, pageWidth, 28, "F");

  // Accent stripe on top
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, 0, pageWidth, 2, "F");

  // Company name / Title
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT LEDGER", pageWidth / 2, 12, { align: "center" });

  // Subtitle line
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 220, 255);
  doc.text("STATEMENT OF ACCOUNT", pageWidth / 2, 17.5, { align: "center" });

  // Bottom info bar
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 22, pageWidth, 6, "F");

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text(`BOOKING ID: ${booking.bookingId}`, 14, 26);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 220, 255);
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-IN", {
      day:   "2-digit",
      month: "short",
      year:  "numeric",
    })}`,
    pageWidth - 14,
    26,
    { align: "right" }
  );

  let y = 34;

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 1: CUSTOMER & PROPERTY (Two Column Design)
  // ═══════════════════════════════════════════════════════════════════
  // Section heading with accent bar
  doc.setFillColor(...COLORS.accent);
  doc.rect(14, y, 3, 5, "F");
  doc.setTextColor(...COLORS.primaryDark);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("CUSTOMER & PROPERTY DETAILS", 19, y + 3.8);

  y += 7;

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    body: [
      ["Applicant Name", booking.applicantName || "-",  "Booking ID",  booking.bookingId || "-"],
      ["Contact No.",    booking.contact || "-",         "Email",       booking.email || "-"],
      ["Project",        booking.project || "-",         "Unit / Block",`${booking.unitNo || "-"} / ${booking.block || "-"}`],
      ["Unit Type",      booking.unitType || "-",        "Unit Code",   booking.unitCode || "-"],
      ["Size",           `${booking.sizeInSqft || "-"} sqft`, "Per Sqft Rate", booking.perSqftRate ? fmtINR(booking.perSqftRate) : "-"],
    ],
    theme: "grid",
    styles: {
      fontSize:    7.5,
      cellPadding: { top: 1.6, right: 2.5, bottom: 1.6, left: 2.5 },
      textColor:   COLORS.primaryDark,
      lineColor:   COLORS.border,
      lineWidth:   0.15,
    },
    columnStyles: {
      0: {
        fontStyle:  "bold",
        cellWidth:  30,
        fillColor:  COLORS.grayLightest,
        textColor:  COLORS.grayDark,
      },
      1: { cellWidth: 65 },
      2: {
        fontStyle:  "bold",
        cellWidth:  30,
        fillColor:  COLORS.grayLightest,
        textColor:  COLORS.grayDark,
      },
      3: { cellWidth: "auto" },
    },
  });

  y = doc.lastAutoTable.finalY + 5;

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 2: PRICING BREAKDOWN
  // ═══════════════════════════════════════════════════════════════════
  doc.setFillColor(...COLORS.accent);
  doc.rect(14, y, 3, 5, "F");
  doc.setTextColor(...COLORS.primaryDark);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("PRICING BREAKDOWN", 19, y + 3.8);

  y += 7;

  // Merged Water + Electrical
  const waterElectricalTotal =
    toNum(booking.waterCharges) + toNum(booking.electricalCharges);

  // GST - Direct from sheet
  const gstDisplay = booking.gst || "-";

  const pricingRows = [
    ["Basic Price",                    fmtINR(toNum(booking.basicPrice))],
    ["Discount",                        fmtINR(toNum(booking.discount))],
    ["Water + Electrical Charges",     fmtINR(waterElectricalTotal)],
    ["Maintenance",                     fmtINR(toNum(booking.maintenance))],
    ["Park Facing Charges",             fmtINR(toNum(booking.parkFacingCharges))],
    ["Corner Facing Charges",           fmtINR(toNum(booking.cornerFacingCharges))],
    ["GST %",                             gstDisplay],
  ];

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    head: [["Description", "Amount"]],
    body: pricingRows,
    theme: "grid",
    styles: {
      fontSize:    8,
      cellPadding: { top: 2, right: 3, bottom: 2, left: 3 },
      lineColor:   COLORS.border,
      lineWidth:   0.15,
    },
    headStyles: {
      fillColor:   COLORS.primary,
      textColor:   COLORS.white,
      fontStyle:   "bold",
      fontSize:    7.5,
      cellPadding: { top: 2, right: 3, bottom: 2, left: 3 },
    },
    columnStyles: {
      0: { cellWidth: 120, textColor: COLORS.grayDark },
      1: { cellWidth: "auto", halign: "right", fontStyle: "bold", textColor: COLORS.primaryDark },
    },
    alternateRowStyles: {
      fillColor: COLORS.grayLightest,
    },
    // Footer row - Agreement Value
    foot: [
      [
        { content: "AGREEMENT VALUE (TOTAL)", styles: {
          fontStyle: "bold",
          fontSize:  9,
          fillColor: COLORS.accentDark,
          textColor: COLORS.white,
        }},
        { content: fmtINR(booking.agreementValue), styles: {
          fontStyle: "bold",
          fontSize:  9,
          fillColor: COLORS.accentDark,
          textColor: COLORS.white,
          halign:    "right",
        }},
      ],
    ],
    footStyles: {
      cellPadding: { top: 2.5, right: 3, bottom: 2.5, left: 3 },
    },
  });

  y = doc.lastAutoTable.finalY + 5;

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 3: PAYMENT HISTORY
  // ═══════════════════════════════════════════════════════════════════
  doc.setFillColor(...COLORS.success);
  doc.rect(14, y, 3, 5, "F");
  doc.setTextColor(...COLORS.primaryDark);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(`PAYMENT HISTORY  (${paymentHistory.length} ${paymentHistory.length === 1 ? "Transaction" : "Transactions"})`, 19, y + 3.8);

  y += 7;

  if (paymentHistory.length === 0) {
    // Empty state
    doc.setFillColor(...COLORS.grayLightest);
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.15);
    doc.roundedRect(14, y, pageWidth - 28, 12, 1, 1, "FD");

    doc.setTextColor(...COLORS.grayMedium);
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text("No payment transactions recorded yet", pageWidth / 2, y + 7.5, { align: "center" });

    y += 15;
  } else {
    autoTable(doc, {
      startY: y,
      margin: { left: 14, right: 14 },
      head: [["#", "Date", "Mode", "Reference / Bank", "Gross", "Discount", "GST %", "Net Amount"]],
      body: paymentHistory.map((p, idx) => {
        const isRefund = p.status === "refund";
        const gross    = p.grossAmount || 0;
        const net      = p.netAmount || 0;
        const totalGst = (p.cgst || 0) + (p.sgst || 0);
        const discount = toNum(p.discount);

        let payGstPercent = 0;
        if (net > 0 && totalGst > 0) {
          payGstPercent = Math.round((totalGst / net) * 100);
        }
        const payGstDisplay = totalGst > 0
          ? `${payGstPercent}%`
          : "-";

        return [
          { content: idx + 1, styles: { halign: "center", fontStyle: "bold", textColor: COLORS.grayMedium } },
          fmtDate(p.dateOfReceiving),
          { content: p.paymentMode || "-", styles: { fontStyle: "bold" } },
          p.paymentDetails || p.bankName || "-",
          {
            content: isRefund ? `-${fmtINR(gross)}` : fmtINR(gross),
            styles: {
              halign:    "right",
              fontStyle: "bold",
              textColor: isRefund ? COLORS.danger : COLORS.primaryDark,
            },
          },
          {
            content: discount > 0 ? fmtINR(discount) : "-",
            styles:  { halign: "right" },
          },
          { content: payGstDisplay, styles: { halign: "center" } },
          {
            content: isRefund ? `-${fmtINR(net)}` : fmtINR(net),
            styles: {
              halign:    "right",
              fontStyle: "bold",
              textColor: isRefund ? COLORS.danger : COLORS.successDark,
            },
          },
        ];
      }),
      theme: "grid",
      styles: {
        fontSize:    7.5,
        cellPadding: { top: 2, right: 2, bottom: 2, left: 2 },
        lineColor:   COLORS.border,
        lineWidth:   0.15,
      },
      headStyles: {
        fillColor:   COLORS.primary,
        textColor:   COLORS.white,
        fontStyle:   "bold",
        fontSize:    7,
        halign:      "center",
        cellPadding: { top: 2.5, right: 2, bottom: 2.5, left: 2 },
      },
      alternateRowStyles: {
        fillColor: COLORS.grayLightest,
      },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 20 },
        2: { cellWidth: 18 },
        3: { cellWidth: "auto" },
        4: { cellWidth: 24 },
        5: { cellWidth: 20 },
        6: { cellWidth: 14 },
        7: { cellWidth: 26 },
      },
    });

    y = doc.lastAutoTable.finalY + 5;
  }

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 4: FINAL SUMMARY (Highlighted Box)
  // ═══════════════════════════════════════════════════════════════════
  const boxHeight = 32;
  const boxWidth  = pageWidth - 28;
  const boxX      = 14;
  const boxY      = y;

  // Outer border
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.4);
  doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 1.5, 1.5, "S");

  // Header
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(boxX, boxY, boxWidth, 6, 1.5, 1.5, "F");
  doc.rect(boxX, boxY + 3, boxWidth, 3, "F");

  doc.setTextColor(...COLORS.white);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("ACCOUNT SUMMARY", boxX + boxWidth / 2, boxY + 4.2, { align: "center" });

  // Body cells (3 columns)
  const cellWidth = boxWidth / 3;
  const bodyY     = boxY + 6;
  const bodyH     = boxHeight - 6;

  // Divider lines
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.2);
  doc.line(boxX + cellWidth, bodyY + 2, boxX + cellWidth, bodyY + bodyH - 2);
  doc.line(boxX + cellWidth * 2, bodyY + 2, boxX + cellWidth * 2, bodyY + bodyH - 2);

  // Cell 1: Agreement Value
  doc.setTextColor(...COLORS.grayDark);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("AGREEMENT VALUE", boxX + cellWidth / 2, bodyY + 6, { align: "center" });

  doc.setTextColor(...COLORS.accentDark);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(fmtINR(summary.agreementValue), boxX + cellWidth / 2, bodyY + 14, { align: "center" });

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.grayMedium);
  doc.text("Total Contract Value", boxX + cellWidth / 2, bodyY + 19, { align: "center" });

  // Cell 2: Net Received
  doc.setTextColor(...COLORS.grayDark);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("NET RECEIVED", boxX + cellWidth + cellWidth / 2, bodyY + 6, { align: "center" });

  doc.setTextColor(...COLORS.successDark);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(fmtINR(summary.netReceived), boxX + cellWidth + cellWidth / 2, bodyY + 14, { align: "center" });

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.grayMedium);
  const pct = summary.agreementValue > 0
    ? Math.round((summary.netReceived / summary.agreementValue) * 100)
    : 0;
  doc.text(`${pct}% of Agreement Value`, boxX + cellWidth + cellWidth / 2, bodyY + 19, { align: "center" });

  // Cell 3: Balance Due
  doc.setTextColor(...COLORS.grayDark);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("BALANCE DUE", boxX + cellWidth * 2 + cellWidth / 2, bodyY + 6, { align: "center" });

  doc.setTextColor(...COLORS.dangerDark);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(fmtINR(summary.balanceDue), boxX + cellWidth * 2 + cellWidth / 2, bodyY + 14, { align: "center" });

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.grayMedium);
  doc.text("Remaining Payable", boxX + cellWidth * 2 + cellWidth / 2, bodyY + 19, { align: "center" });

  // Bottom highlight bar (if balance)
  if (summary.balanceDue > 0) {
    doc.setFillColor(...COLORS.dangerLight);
    doc.rect(boxX + cellWidth * 2, bodyY + bodyH - 4, cellWidth, 4, "F");
  } else {
    doc.setFillColor(...COLORS.successLight);
    doc.rect(boxX + cellWidth, bodyY + bodyH - 4, cellWidth, 4, "F");
  }

  y = boxY + boxHeight + 4;

  // Progress bar - Payment collection
  if (summary.agreementValue > 0) {
    const progWidth = pageWidth - 28;
    doc.setFillColor(...COLORS.grayLight);
    doc.roundedRect(14, y, progWidth, 3, 1, 1, "F");

    const filledWidth = (progWidth * Math.min(pct, 100)) / 100;
    doc.setFillColor(...COLORS.success);
    doc.roundedRect(14, y, filledWidth, 3, 1, 1, "F");

    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.grayDark);
    doc.text(`Payment Collection Progress: ${pct}%`, pageWidth / 2, y + 6.5, { align: "center" });
  }

  // ═══════════════════════════════════════════════════════════════════
  // FOOTER
  // ═══════════════════════════════════════════════════════════════════
  const footerY = pageHeight - 8;

  // Divider line
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(14, footerY - 3, pageWidth - 14, footerY - 3);

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text(booking.applicantName || "-", 14, footerY);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.grayMedium);
  doc.text(`Booking ID: ${booking.bookingId}`, 14, footerY + 3.5);

  doc.setFontSize(6.5);
  doc.setTextColor(...COLORS.grayMedium);
  doc.setFont("helvetica", "italic");
  doc.text(
    "This is a computer-generated ledger statement",
    pageWidth / 2,
    footerY + 1.5,
    { align: "center" }
  );

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.grayDark);
  doc.text(
    `Generated: ${new Date().toLocaleString("en-IN", {
      day:    "2-digit",
      month:  "short",
      year:   "numeric",
      hour:   "2-digit",
      minute: "2-digit",
    })}`,
    pageWidth - 14,
    footerY + 1.5,
    { align: "right" }
  );

  const filename = `Ledger_${booking.bookingId}_${booking.applicantName.replace(/\s+/g, "_")}.pdf`;

  if (action === "download") {
    doc.save(filename);
  } else if (action === "share") {
    return doc.output("blob");
  } else if (action === "preview") {
    window.open(doc.output("bloburl"), "_blank");
  }

  return { doc, filename };
};

  const handleShare = async () => {
    if (!ledgerData) return;
    const blob = generatePDF("share");
    if (!blob) return;

    const filename = `Ledger_${ledgerData.booking.bookingId}.pdf`;
    const file = new File([blob], filename, { type: "application/pdf" });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          title: `Payment Ledger - ${ledgerData.booking.applicantName}`,
          text:  `Payment ledger for ${ledgerData.booking.bookingId}`,
          files: [file],
        });
      } catch (err) {
        console.log("Share cancelled", err);
      }
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      alert("Sharing not supported on this browser. File downloaded instead.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-screen-xl mx-auto flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-slate-100 transition"
            title="Back to Dashboard"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="text-blue-600" size={22} />
              Payment Ledger Generator
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Search customer to generate ledger PDF
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">

        {/* Search Bar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Search Customer
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type name, booking ID, unit no, contact, email..."
              className="w-full pl-11 pr-11 py-3.5 border-2 border-slate-200 rounded-lg text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
            />
            {searchTerm && (
              <button
                onClick={handleClearSelection}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded"
              >
                <X size={16} className="text-slate-400" />
              </button>
            )}

            {showResults && (
              <div className="absolute z-40 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="p-6 text-center">
                    <Loader2 size={24} className="animate-spin text-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Searching...</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500">
                    No customers found for "{debouncedTerm}"
                  </div>
                ) : (
                  searchResults.map((b) => (
                    <button
                      key={b.bookingId}
                      onClick={() => handleSelectBooking(b)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-slate-100 transition"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800 text-sm">
                          {b.applicantName}
                        </p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-slate-500">
                          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                            {b.bookingId}
                          </span>
                          <span>📱 {b.contact}</span>
                          <span>🏠 {b.unitNo}</span>
                          <span>🏗 {b.project}</span>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {!searchTerm && (
            <p className="text-xs text-slate-400 mt-2">
              💡 Type at least 2 characters to start searching
            </p>
          )}
        </div>

        {isLoadingLedger && (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200 shadow-sm">
            <Loader2 size={40} className="animate-spin text-blue-500 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">Loading ledger data...</p>
          </div>
        )}

        {ledgerData && !isLoadingLedger && (
          <>
            {/* Action Buttons */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-wrap gap-3 sticky top-[73px] z-20">
              <button
                onClick={() => generatePDF("preview")}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-sm transition"
              >
                <FileText size={16} /> Preview PDF
              </button>
              <button
                onClick={() => generatePDF("download")}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition shadow-sm"
              >
                <Download size={16} /> Download PDF
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition shadow-sm"
              >
                <Share2 size={16} /> Share PDF
              </button>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4">
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  <User size={20} /> {ledgerData.booking.applicantName}
                </h2>
                <p className="text-slate-300 text-xs mt-1">
                  Booking ID: <span className="font-mono font-bold text-white">{ledgerData.booking.bookingId}</span>
                </p>
              </div>
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-medium">Contact</p>
                  <p className="font-semibold text-slate-800 flex items-center gap-1"><Phone size={12} /> {ledgerData.booking.contact}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-medium">Email</p>
                  <p className="font-semibold text-slate-800 flex items-center gap-1 truncate"><Mail size={12} /> {ledgerData.booking.email || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-medium">Project</p>
                  <p className="font-semibold text-slate-800 flex items-center gap-1"><Building2 size={12} /> {ledgerData.booking.project}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-medium">Unit</p>
                  <p className="font-semibold text-slate-800">{ledgerData.booking.unitNo} / {ledgerData.booking.block}</p>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-5">
                <p className="text-xs text-blue-600 uppercase font-semibold mb-1">Agreement Value</p>
                <p className="text-xl font-black text-blue-700">{fmtINR(ledgerData.summary.agreementValue)}</p>
              </div>
              <div className="bg-white rounded-xl border border-emerald-200 shadow-sm p-5">
                <p className="text-xs text-emerald-600 uppercase font-semibold mb-1">Net Received</p>
                <p className="text-xl font-black text-emerald-700">{fmtINR(ledgerData.summary.netReceived)}</p>
              </div>
              <div className="bg-white rounded-xl border border-orange-200 shadow-sm p-5">
                <p className="text-xs text-orange-600 uppercase font-semibold mb-1">Total Refunded</p>
                <p className="text-xl font-black text-orange-700">{fmtINR(ledgerData.summary.totalRefunded)}</p>
              </div>
              <div className="bg-white rounded-xl border border-red-200 shadow-sm p-5">
                <p className="text-xs text-red-600 uppercase font-semibold mb-1">Balance Due</p>
                <p className="text-xl font-black text-red-700">{fmtINR(ledgerData.summary.balanceDue)}</p>
              </div>
            </div>

            {/* Payment History Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-blue-700 px-5 py-3">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <IndianRupee size={16} /> Payment History ({ledgerData.paymentHistory.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="text-slate-700">
                      <th className="px-3 py-2.5 text-left font-semibold">#</th>
                      <th className="px-3 py-2.5 text-left font-semibold">Date</th>
                      <th className="px-3 py-2.5 text-left font-semibold">Mode</th>
                      <th className="px-3 py-2.5 text-left font-semibold">Bank / Ref</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Gross</th>
                      <th className="px-3 py-2.5 text-right font-semibold">CGST</th>
                      <th className="px-3 py-2.5 text-right font-semibold">SGST</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Net</th>
                      <th className="px-3 py-2.5 text-center font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ledgerData.paymentHistory.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                          No payment history found
                        </td>
                      </tr>
                    ) : ledgerData.paymentHistory.map((p, i) => {
                      const isRefund = p.status === "refund";
                      return (
                        <tr key={i} className={isRefund ? "bg-orange-50" : "hover:bg-slate-50"}>
                          <td className="px-3 py-2.5 text-slate-500">{i + 1}</td>
                          <td className="px-3 py-2.5 font-medium">{fmtDate(p.dateOfReceiving)}</td>
                          <td className="px-3 py-2.5">
                            <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                              {p.paymentMode || "-"}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="font-medium text-slate-700">{p.bankName || "-"}</div>
                            <div className="text-[10px] text-slate-400">{p.paymentDetails || ""}</div>
                          </td>
                          <td className={`px-3 py-2.5 text-right font-bold ${isRefund ? "text-orange-600" : "text-slate-800"}`}>
                            {isRefund ? "-" : ""}{fmtINR(p.grossAmount)}
                          </td>
                          <td className="px-3 py-2.5 text-right text-orange-600 font-semibold">{fmtINR(p.cgst)}</td>
                          <td className="px-3 py-2.5 text-right text-purple-600 font-semibold">{fmtINR(p.sgst)}</td>
                          <td className={`px-3 py-2.5 text-right font-bold ${isRefund ? "text-orange-700" : "text-emerald-700"}`}>
                            {isRefund ? "-" : ""}{fmtINR(p.netAmount)}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              isRefund                    ? "bg-orange-100 text-orange-700"
                              : p.status === "done"       ? "bg-emerald-100 text-emerald-700"
                              : p.status === "partial"    ? "bg-amber-100 text-amber-700"
                              :                             "bg-slate-100 text-slate-600"
                            }`}>
                              {p.status || "-"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {!selectedBooking && !isLoadingLedger && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-16 text-center">
            <FileText size={48} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Search a customer above to generate their payment ledger</p>
            <p className="text-slate-400 text-xs mt-1">You'll be able to preview, download and share the PDF</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LedgerPage;