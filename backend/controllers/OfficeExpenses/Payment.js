




// const express = require('express');
// const router = express.Router();
// const { sheets, OfficeExpenseID } = require('../../config/googleSheet');

// // ═══════════════════════════════════════════════════════════
// // Helper: Fetch Advance from Payment_Sheet (P = "Advance")
// // Match: D column (Vendor)
// // Amount: H column, Remaining: J column
// // ═══════════════════════════════════════════════════════════
// const fetchAdvancePayments = async () => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: OfficeExpenseID,
//       range: 'Payment_Sheet!A2:P',
//     });
//     const rows = response.data.values || [];
//     const advanceMap = {};

//     rows.forEach((row) => {
//       const colP = (row[15] || '').toString().trim();
//       if (colP !== 'Advance') return;

//       const vendorName = (row[3] || '').toString().trim();
//       const paidAmount = Number((row[7] || '0').toString().replace(/,/g, '')) || 0;

//       // J = remaining balance
//       const balanceStr = (row[9] || '').toString().replace(/,/g, '').trim();
//       let advanceRemaining = 0;
//       if (balanceStr !== '' && !isNaN(parseFloat(balanceStr))) {
//         advanceRemaining = parseFloat(balanceStr);
//       } else {
//         advanceRemaining = paidAmount;
//       }

//       if (vendorName && advanceRemaining > 0) {
//         const key = vendorName.toLowerCase();
//         if (!advanceMap[key]) advanceMap[key] = { total: 0, entries: [] };
//         advanceMap[key].total += advanceRemaining;
//         advanceMap[key].entries.push({
//           timestamp: row[0], vendor: vendorName,
//           amount: advanceRemaining, bank: row[10], mode: row[11],
//           details: row[12], date: row[13],
//         });
//       }
//     });

//     console.log(`[Advance Map] Entries: ${Object.keys(advanceMap).length}`);
//     return advanceMap;
//   } catch (err) {
//     console.error('Fetch advance error:', err);
//     return {};
//   }
// };

// // ═══════════════════════════════════════════════════════════
// // Helper: Fetch Previous Payments (P ≠ "Advance")
// // Match: C column (Office Bill No)
// // ═══════════════════════════════════════════════════════════
// const fetchPaymentSheetData = async () => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: OfficeExpenseID,
//       range: 'Payment_Sheet!A2:P',
//     });
//     const rows = response.data.values || [];
//     const paymentMap = {};

//     rows.forEach((row) => {
//       const colP = (row[15] || '').toString().trim();
//       if (colP === 'Advance') return;

//       const officeBillNo = (row[2] || '').toString().trim();
//       const paidAmount = Number((row[7] || '0').toString().replace(/,/g, '')) || 0;
//       const tdsAmount = Number((row[8] || '0').toString().replace(/,/g, '')) || 0;
//       const grandTotal = Number((row[14] || '0').toString().replace(/,/g, '')) || 0;

//       if (officeBillNo) {
//         if (!paymentMap[officeBillNo]) paymentMap[officeBillNo] = { total: 0, entries: [] };

//         const billCredit = paidAmount + tdsAmount;
//         paymentMap[officeBillNo].total += billCredit;

//         paymentMap[officeBillNo].entries.push({
//           timestamp: row[0], planned: row[1], officeBill: officeBillNo,
//           vendor: row[3], billNo: row[4], billDate: row[5],
//           netAmount: row[6], paidAmount, tds: tdsAmount,
//           balance: row[9], bank: row[10], mode: row[11],
//           details: row[12], date: row[13], grandTotal, billCredit,
//         });
//       }
//     });

//     return paymentMap;
//   } catch (err) {
//     console.error('Fetch Payment_Sheet error:', err);
//     return {};
//   }
// };

// // ═══════════════════════════════════════════════════════════
// // Helper: Append Normal Payment to Payment_Sheet
// // ═══════════════════════════════════════════════════════════
// const appendToPaymentSheet = async (paymentData) => {
//   try {
//     const now = new Date();
//     const pad = (n) => String(n).padStart(2, '0');
//     const timestamp = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

//     const rowData = [
//       timestamp,
//       paymentData.PLANNED_5 || '',
//       paymentData.OFFBILLUID || '',
//       paymentData.Vendor_Name_4 || '',
//       paymentData.BILL_NO_4 || '',
//       paymentData.BILL_DATE_4 || '',
//       '',
//       paymentData.NET_PAYABLE || '',
//       paymentData.TDS_5 || '',
//       paymentData.BALANCE_AMOUNT_5 || '',
//       paymentData.BANK_DETAILS_5 || '',
//       paymentData.PAYMENT_MODE_5 || '',
//       paymentData.PAYMENT_DETAILS_5 || '',
//       paymentData.PAYMENT_DATE_5 || '',
//       paymentData.GRAND_TOTAL || '',
//       '',
//     ];

//     const response = await sheets.spreadsheets.values.append({
//       spreadsheetId: OfficeExpenseID,
//       range: 'Payment_Sheet!A:P',
//       valueInputOption: 'USER_ENTERED',
//       insertDataOption: 'INSERT_ROWS',
//       resource: { values: [rowData] },
//     });

//     return { success: true, range: response.data.updates?.updatedRange };
//   } catch (err) {
//     console.error('Payment_Sheet append error:', err.message);
//     return { success: false, error: err.message };
//   }
// };

// // ═══════════════════════════════════════════════════════════
// // GET Route — Fetch Bills + Advance + Previous
// // ═══════════════════════════════════════════════════════════
// router.get('/Get-Payment', async (req, res) => {
//   try {
//     if (!OfficeExpenseID) {
//       return res.status(500).json({ success: false, error: 'spreadsheetId not configured' });
//     }

//     const [mainResponse, advanceMap, paymentMap] = await Promise.all([
//       sheets.spreadsheets.values.get({
//         spreadsheetId: OfficeExpenseID,
//         range: 'VRN_Office_Expenses!A8:BP',
//       }),
//       fetchAdvancePayments(),
//       fetchPaymentSheetData(),
//     ]);

//     const rows = mainResponse.data.values || [];

//     if (rows.length === 0) {
//       return res.json({ success: true, message: 'No data found', data: [] });
//     }

//     const filteredData = rows
//       .filter((row) => {
//         const planned = row[56];
//         const status = (row[58] || '').toString().trim();
//         return planned && (status === '' || status.toLowerCase() === 'partial');
//       })
//       .map((row) => {
//         const projectName = (row[3] || '').toString().trim();
//         const vendorName = (row[38] || '').toString().trim();
//         const officeBillNo = (row[1] || '').toString().trim();

//         const netAmount = Number((row[52] || '0').toString().replace(/,/g, '')) || 0;

//         // ✅ Advance match by vendor
//         const advanceKey = vendorName.toLowerCase();
//         const advanceInfo = advanceMap[advanceKey] || { total: 0, entries: [] };

//         // ✅ Previous payment match by bill no
//         const paymentInfo = paymentMap[officeBillNo] || { total: 0, entries: [] };

//         const alreadyPaid = advanceInfo.total + paymentInfo.total;
//         const balance = Math.max(0, netAmount - alreadyPaid);
//         const isPartial = alreadyPaid > 0 && alreadyPaid < netAmount;

//         return {
//           OFFBILLUID: officeBillNo,
//           uid: (row[2] || '').toString().trim(),
//           OFFICE_NAME_1: projectName,
//           PAYEE_NAME_1: (row[4] || '').toString().trim(),
//           EXPENSES_HEAD_1: (row[5] || '').toString().trim(),
//           EXPENSES_SUBHEAD_1: (row[6] || '').toString().trim(),
//           ITEM_NAME_1: (row[7] || '').toString().trim(),
//           UNIT_1: (row[8] || '').toString().trim(),
//           SKU_CODE_1: (row[9] || '').toString().trim(),
//           Qty_1: (row[10] || '').toString().trim(),
//           Amount: (row[24] || '').toString().trim(),
//           DEPARTMENT_1: (row[12] || '').toString().trim(),
//           APPROVAL_DOER: (row[13] || '').toString().trim(),
//           RAISED_BY_1: (row[14] || '').toString().trim(),
//           Bill_Photo: (row[15] || '').toString().trim(),
//           PAYMENT_MODE_3: (row[31] || '').toString().trim(),
//           Vendor_Name_4: vendorName,
//           BILL_NO_4: (row[39] || '').toString().trim(),
//           BILL_DATE_4: (row[40] || '').toString().trim(),
//           BASIC_AMOUNT: (row[41] || '').toString().trim(),
//           CGST_4: (row[42] || '').toString().trim(),
//           SGST_4: (row[43] || '').toString().trim(),
//           IGST_4: (row[44] || '').toString().trim(),
//           TOTAL_AMOUNT_4: (row[45] || '').toString().trim(),
//           TRASNPORT_CHARGES_4: (row[50] || '').toString().trim(),
//           Transport_Gst_4: (row[51] || '').toString().trim(),
//           NET_AMOUNT_4: (row[52] || '').toString().trim(),
//           REMARK_4: (row[53] || '').toString().trim(),
//           PLANNED_5: (row[56] || '').toString().trim(),
//           ACTUAL_5: (row[57] || '').toString().trim(),
//           STATUS_5: (row[58] || '').toString().trim(),

//           ALREADY_PAID: alreadyPaid,
//           BALANCE_AMOUNT: balance,
//           IS_PARTIAL: isPartial,

//           PAYMENT_SHEET_TOTAL: paymentInfo.total,
//           PAYMENT_SHEET_ENTRIES: paymentInfo.entries,
//           HAS_PAYMENT_HISTORY: paymentInfo.total > 0,

//           ADVANCE_TOTAL: advanceInfo.total,
//           ADVANCE_ENTRIES: advanceInfo.entries,
//           HAS_ADVANCE: advanceInfo.total > 0,
//         };
//       });

//     return res.json({ success: true, totalRecords: filteredData.length, data: filteredData });
//   } catch (error) {
//     console.error('Payment GET Error:', error.message);
//     return res.status(500).json({ success: false, error: 'Failed to fetch', details: error.message });
//   }
// });

// // ═══════════════════════════════════════════════════════════
// // POST Route — Submit Payment + Advance Deduction
// // ═══════════════════════════════════════════════════════════
// router.post('/Post-Payment', async (req, res) => {
//   try {
//     const {
//       uid, OFFBILLUID, Vendor_Name_4, BILL_NO_4, BILL_DATE_4,
//       PLANNED_5, NET_AMOUNT_5, TDS_5, PAID_AMOUNT_5,
//       CUMULATIVE_PAID_5, BALANCE_AMOUNT_5, BANK_DETAILS_5,
//       PAYMENT_MODE_5, PAYMENT_DETAILS_5, PAYMENT_DATE_5,
//       Remark_5, IS_PARTIAL, GRAND_TOTAL, NET_PAYABLE,
//     } = req.body;

//     if (!uid) {
//       return res.status(400).json({ success: false, message: 'UID is required' });
//     }

//     const trimmedUid = String(uid).trim();

//     const getResponse = await sheets.spreadsheets.values.get({
//       spreadsheetId: OfficeExpenseID,
//       range: 'VRN_Office_Expenses!C7:C',
//     });

//     const values = getResponse.data.values || [];
//     const rowIndex = values.findIndex((row) => {
//       const cell = row && row[0] ? String(row[0]).trim() : '';
//       return cell === trimmedUid;
//     });

//     if (rowIndex === -1) {
//       return res.status(404).json({ success: false, message: 'Row not found' });
//     }

//     const sheetRowNumber = 7 + rowIndex;
//     const status = IS_PARTIAL ? 'Partial' : 'Done';

//     const updates = [
//       { range: `VRN_Office_Expenses!BG${sheetRowNumber}`, values: [[status]] },
//       { range: `VRN_Office_Expenses!BJ${sheetRowNumber}`, values: [[TDS_5 || '']] },
//       { range: `VRN_Office_Expenses!BK${sheetRowNumber}`, values: [[CUMULATIVE_PAID_5 || '']] },
//       { range: `VRN_Office_Expenses!BL${sheetRowNumber}`, values: [[BANK_DETAILS_5 || '']] },
//       { range: `VRN_Office_Expenses!BM${sheetRowNumber}`, values: [[PAYMENT_MODE_5 || '']] },
//       { range: `VRN_Office_Expenses!BN${sheetRowNumber}`, values: [[PAYMENT_DETAILS_5 || '']] },
//       { range: `VRN_Office_Expenses!BO${sheetRowNumber}`, values: [[PAYMENT_DATE_5 || '']] },
//       { range: `VRN_Office_Expenses!BP${sheetRowNumber}`, values: [[Remark_5 || '']] },
//     ];

//     const validUpdates = updates.filter((u) => u.values[0][0] !== '');

//     // Step 1: Update main sheet
//     if (validUpdates.length > 0) {
//       await sheets.spreadsheets.values.batchUpdate({
//         spreadsheetId: OfficeExpenseID,
//         resource: { valueInputOption: 'USER_ENTERED', data: validUpdates },
//       });
//     }

//     // Step 2: Append to Payment_Sheet
//     const paymentSheetResult = await appendToPaymentSheet({
//       PLANNED_5, OFFBILLUID, Vendor_Name_4, BILL_NO_4, BILL_DATE_4,
//       NET_PAYABLE, TDS_5, BALANCE_AMOUNT_5, BANK_DETAILS_5,
//       PAYMENT_MODE_5, PAYMENT_DETAILS_5, PAYMENT_DATE_5, GRAND_TOTAL,
//     });

//     // Step 3: Advance J column deduction
//     try {
//       const advResponse = await sheets.spreadsheets.values.get({
//         spreadsheetId: OfficeExpenseID,
//         range: 'Payment_Sheet!A2:P',
//       });

//       const advRows = advResponse.data.values || [];
//       const advUpdates = [];
//       const billVendor = (Vendor_Name_4 || '').toString().trim().toLowerCase();

//       if (billVendor) {
//         let remainingToDeduct = Number(NET_PAYABLE || 0);

//         for (let i = 0; i < advRows.length; i++) {
//           if (remainingToDeduct <= 0) break;
//           const aRow = advRows[i];
//           if (!aRow) continue;

//           const colP = (aRow[15] || '').toString().trim();
//           if (colP !== 'Advance') continue;

//           const rowVendor = (aRow[3] || '').toString().trim().toLowerCase();
//           if (rowVendor !== billVendor) continue;

//           const hValue = parseFloat((aRow[7] || '0').toString().replace(/,/g, '')) || 0;
//           const jValue = (aRow[9] || '').toString().replace(/,/g, '').trim();
//           const currentBalance = (jValue !== '' && !isNaN(parseFloat(jValue))) ? parseFloat(jValue) : hValue;

//           if (currentBalance <= 0) continue;

//           const deductAmount = Math.min(remainingToDeduct, currentBalance);
//           const newBalance = currentBalance - deductAmount;
//           remainingToDeduct -= deductAmount;

//           advUpdates.push({
//             range: `Payment_Sheet!J${i + 2}`,
//             values: [[newBalance]],
//           });
//         }

//         if (advUpdates.length > 0) {
//           await sheets.spreadsheets.values.batchUpdate({
//             spreadsheetId: OfficeExpenseID,
//             resource: { valueInputOption: 'USER_ENTERED', data: advUpdates },
//           });
//         }
//       }
//     } catch (advErr) {
//       console.error('Advance update error:', advErr.message);
//     }

//     return res.json({
//       success: true,
//       message: `Payment ${IS_PARTIAL ? 'partial' : 'fully'} updated`,
//       updatedRow: sheetRowNumber,
//       status,
//       isPartial: IS_PARTIAL,
//       paymentSheetEntry: paymentSheetResult,
//     });

//   } catch (error) {
//     console.error('Payment POST Error:', error);
//     return res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// });

// module.exports = router;





const express = require('express');
const router = express.Router();
const { sheets, OfficeExpenseID } = require('../../config/googleSheet');

// ═══════════════════════════════════════════════════════════
// Helper: Fetch Advance from Payment_Sheet (P = "Advance")
// Match: D = Vendor  +  T = Project Name (fallback if T empty)
// ═══════════════════════════════════════════════════════════
const fetchAdvancePayments = async () => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: OfficeExpenseID,
      range: 'Payment_Sheet!A2:T', // ✅ P तक की जगह T तक (Project Name के लिए)
    });
    const rows = response.data.values || [];
    const advanceMap = {};

    rows.forEach((row) => {
      const colP = (row[15] || '').toString().trim();
      if (colP !== 'Advance') return;

      const vendorName = (row[3] || '').toString().trim();
      const paidAmount = Number((row[7] || '0').toString().replace(/,/g, '')) || 0;
      const projectName = (row[19] || '').toString().trim(); // ✅ T column

      // J = remaining balance
      const balanceStr = (row[9] || '').toString().replace(/,/g, '').trim();
      let advanceRemaining = 0;
      if (balanceStr !== '' && !isNaN(parseFloat(balanceStr))) {
        advanceRemaining = parseFloat(balanceStr);
      } else {
        advanceRemaining = paidAmount;
      }

      if (vendorName && advanceRemaining > 0) {
        const key = vendorName.toLowerCase();
        if (!advanceMap[key]) advanceMap[key] = { total: 0, entries: [] };
        advanceMap[key].total += advanceRemaining;
        advanceMap[key].entries.push({
          timestamp: row[0],
          vendor: vendorName,
          amount: advanceRemaining,
          bank: row[10],
          mode: row[11],
          details: row[12],
          date: row[13],
          project: projectName, // ✅
        });
      }
    });

    console.log(`[Advance Map] Entries: ${Object.keys(advanceMap).length}`);
    return advanceMap;
  } catch (err) {
    console.error('Fetch advance error:', err);
    return {};
  }
};

// ═══════════════════════════════════════════════════════════
// Helper: Fetch Previous Payments (P ≠ "Advance")
// Match: C column (Office Bill No)  — SAME AS BEFORE
// ═══════════════════════════════════════════════════════════
const fetchPaymentSheetData = async () => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: OfficeExpenseID,
      range: 'Payment_Sheet!A2:P',
    });
    const rows = response.data.values || [];
    const paymentMap = {};

    rows.forEach((row) => {
      const colP = (row[15] || '').toString().trim();
      if (colP === 'Advance') return;

      const officeBillNo = (row[2] || '').toString().trim();
      const paidAmount = Number((row[7] || '0').toString().replace(/,/g, '')) || 0;
      const tdsAmount = Number((row[8] || '0').toString().replace(/,/g, '')) || 0;
      const grandTotal = Number((row[14] || '0').toString().replace(/,/g, '')) || 0;

      if (officeBillNo) {
        if (!paymentMap[officeBillNo]) paymentMap[officeBillNo] = { total: 0, entries: [] };

        const billCredit = paidAmount + tdsAmount;
        paymentMap[officeBillNo].total += billCredit;

        paymentMap[officeBillNo].entries.push({
          timestamp: row[0], planned: row[1], officeBill: officeBillNo,
          vendor: row[3], billNo: row[4], billDate: row[5],
          netAmount: row[6], paidAmount, tds: tdsAmount,
          balance: row[9], bank: row[10], mode: row[11],
          details: row[12], date: row[13], grandTotal, billCredit,
        });
      }
    });

    return paymentMap;
  } catch (err) {
    console.error('Fetch Payment_Sheet error:', err);
    return {};
  }
};

// ═══════════════════════════════════════════════════════════
// Helper: Write Normal Payment → Payment_Sheet (A to T)
// SAME data as before, सिर्फ T में Project Name add
// ═══════════════════════════════════════════════════════════
const appendToPaymentSheet = async (paymentData) => {
  try {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timestamp = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    // ✅ Original columns A–P SAME, फिर Q,R,S empty, T = Project
    const rowData = [
      timestamp,                            // A
      paymentData.PLANNED_5 || '',          // B
      paymentData.OFFBILLUID || '',         // C
      paymentData.Vendor_Name_4 || '',      // D
      paymentData.BILL_NO_4 || '',          // E
      paymentData.BILL_DATE_4 || '',        // F
      '',                                   // G
      paymentData.NET_PAYABLE || '',        // H  ← Paid / Net Payable (SAME AS BEFORE)
      paymentData.TDS_5 || '',              // I
      paymentData.BALANCE_AMOUNT_5 || '',   // J
      paymentData.BANK_DETAILS_5 || '',     // K
      paymentData.PAYMENT_MODE_5 || '',     // L
      paymentData.PAYMENT_DETAILS_5 || '',  // M
      paymentData.PAYMENT_DATE_5 || '',     // N
      paymentData.GRAND_TOTAL || '',        // O
      '',                                   // P
      '',                                   // Q
      '',                                   // R
      '',                                   // S
      paymentData.OFFICE_NAME_1 || '',      // T ← Project Name ONLY NEW
    ];

    // Empty row ढूँढो, insert मत करो
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId: OfficeExpenseID,
      range: 'Payment_Sheet!A:A',
    });
    const rows = sheetData.data.values || [];
    let targetRow = rows.length + 1;
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i] || !rows[i][0] || String(rows[i][0]).trim() === '') {
        targetRow = i + 1;
        break;
      }
    }

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: OfficeExpenseID,
      range: `Payment_Sheet!A${targetRow}:T${targetRow}`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [rowData] },
    });

    return { success: true, range: response.data.updates?.updatedRange || response.data.updatedRange };
  } catch (err) {
    console.error('Payment_Sheet write error:', err.message);
    return { success: false, error: err.message };
  }
};

// ═══════════════════════════════════════════════════════════
// GET Route — SAME AS BEFORE + Project match on advance
// ═══════════════════════════════════════════════════════════
router.get('/Get-Payment', async (req, res) => {
  try {
    if (!OfficeExpenseID) {
      return res.status(500).json({ success: false, error: 'spreadsheetId not configured' });
    }

    const [mainResponse, advanceMap, paymentMap] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: OfficeExpenseID,
        range: 'VRN_Office_Expenses!A8:BP',
      }),
      fetchAdvancePayments(),
      fetchPaymentSheetData(),
    ]);

    const rows = mainResponse.data.values || [];

    if (rows.length === 0) {
      return res.json({ success: true, message: 'No data found', data: [] });
    }

    const filteredData = rows
      .filter((row) => {
        const planned = row[56];
        const status = (row[58] || '').toString().trim();
        return planned && (status === '' || status.toLowerCase() === 'partial');
      })
      .map((row) => {
        const projectName = (row[3] || '').toString().trim();
        const vendorName = (row[38] || '').toString().trim();
        const officeBillNo = (row[1] || '').toString().trim();
        const netAmount = Number((row[52] || '0').toString().replace(/,/g, '')) || 0;

        // ✅ Advance: Vendor match + Project match (T). पुराना data (T खाली) भी चलेगा
        const advanceKey = vendorName.toLowerCase();
        const vendorAdvances = advanceMap[advanceKey];
        const advanceInfo = { total: 0, entries: [] };

        if (vendorAdvances && vendorAdvances.entries) {
          vendorAdvances.entries.forEach((entry) => {
            const entryProject = (entry.project || '').toString().trim().toLowerCase();
            const billProject = projectName.toLowerCase();
            // T खाली = पुराना advance → vendor से ही match
            // T भरा = vendor + project दोनों match
            if (!entryProject || entryProject === billProject) {
              advanceInfo.total += entry.amount;
              advanceInfo.entries.push(entry);
            }
          });
        }

        const paymentInfo = paymentMap[officeBillNo] || { total: 0, entries: [] };
        const alreadyPaid = advanceInfo.total + paymentInfo.total;
        const balance = Math.max(0, netAmount - alreadyPaid);
        const isPartial = alreadyPaid > 0 && alreadyPaid < netAmount;

        return {
          OFFBILLUID: officeBillNo,
          uid: (row[2] || '').toString().trim(),
          OFFICE_NAME_1: projectName,
          PAYEE_NAME_1: (row[4] || '').toString().trim(),
          EXPENSES_HEAD_1: (row[5] || '').toString().trim(),
          EXPENSES_SUBHEAD_1: (row[6] || '').toString().trim(),
          ITEM_NAME_1: (row[7] || '').toString().trim(),
          UNIT_1: (row[8] || '').toString().trim(),
          SKU_CODE_1: (row[9] || '').toString().trim(),
          Qty_1: (row[10] || '').toString().trim(),
          Amount: (row[24] || '').toString().trim(),
          DEPARTMENT_1: (row[12] || '').toString().trim(),
          APPROVAL_DOER: (row[13] || '').toString().trim(),
          RAISED_BY_1: (row[14] || '').toString().trim(),
          Bill_Photo: (row[15] || '').toString().trim(),
          PAYMENT_MODE_3: (row[31] || '').toString().trim(),
          Vendor_Name_4: vendorName,
          BILL_NO_4: (row[39] || '').toString().trim(),
          BILL_DATE_4: (row[40] || '').toString().trim(),
          BASIC_AMOUNT: (row[41] || '').toString().trim(),
          CGST_4: (row[42] || '').toString().trim(),
          SGST_4: (row[43] || '').toString().trim(),
          IGST_4: (row[44] || '').toString().trim(),
          TOTAL_AMOUNT_4: (row[45] || '').toString().trim(),
          TRASNPORT_CHARGES_4: (row[50] || '').toString().trim(),
          Transport_Gst_4: (row[51] || '').toString().trim(),
          NET_AMOUNT_4: (row[52] || '').toString().trim(),
          REMARK_4: (row[53] || '').toString().trim(),
          PLANNED_5: (row[56] || '').toString().trim(),
          ACTUAL_5: (row[57] || '').toString().trim(),
          STATUS_5: (row[58] || '').toString().trim(),

          ALREADY_PAID: alreadyPaid,
          BALANCE_AMOUNT: balance,
          IS_PARTIAL: isPartial,

          PAYMENT_SHEET_TOTAL: paymentInfo.total,
          PAYMENT_SHEET_ENTRIES: paymentInfo.entries,
          HAS_PAYMENT_HISTORY: paymentInfo.total > 0,

          ADVANCE_TOTAL: advanceInfo.total,
          ADVANCE_ENTRIES: advanceInfo.entries,
          HAS_ADVANCE: advanceInfo.total > 0,
        };
      });

    return res.json({ success: true, totalRecords: filteredData.length, data: filteredData });
  } catch (error) {
    console.error('Payment GET Error:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch', details: error.message });
  }
});

// ═══════════════════════════════════════════════════════════
// POST Route — Submit Payment + Advance Deduction
// SAME AS BEFORE, सिर्फ T column + project match add
// ═══════════════════════════════════════════════════════════
router.post('/Post-Payment', async (req, res) => {
  try {
    const {
      uid, OFFBILLUID, Vendor_Name_4, BILL_NO_4, BILL_DATE_4,
      PLANNED_5, NET_AMOUNT_5, TDS_5, PAID_AMOUNT_5,
      CUMULATIVE_PAID_5, BALANCE_AMOUNT_5, BANK_DETAILS_5,
      PAYMENT_MODE_5, PAYMENT_DETAILS_5, PAYMENT_DATE_5,
      Remark_5, IS_PARTIAL, GRAND_TOTAL, NET_PAYABLE,
      OFFICE_NAME_1, // ✅ NEW - Project Name for column T
    } = req.body;

    console.log('=== Post-Payment ===', { uid, NET_PAYABLE, PAID_AMOUNT_5, OFFICE_NAME_1 });

    if (!uid) {
      return res.status(400).json({ success: false, message: 'UID is required' });
    }

    const trimmedUid = String(uid).trim();

    const getResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: OfficeExpenseID,
      range: 'VRN_Office_Expenses!C7:C',
    });

    const values = getResponse.data.values || [];
    const rowIndex = values.findIndex((row) => {
      const cell = row && row[0] ? String(row[0]).trim() : '';
      return cell === trimmedUid;
    });

    if (rowIndex === -1) {
      return res.status(404).json({ success: false, message: 'Row not found' });
    }

    const sheetRowNumber = 7 + rowIndex;
    const status = IS_PARTIAL ? 'Partial' : 'Done';

    // ✅ Main sheet update — EXACTLY SAME AS BEFORE
    const updates = [
      { range: `VRN_Office_Expenses!BG${sheetRowNumber}`, values: [[status]] },
      { range: `VRN_Office_Expenses!BJ${sheetRowNumber}`, values: [[TDS_5 || '']] },
      { range: `VRN_Office_Expenses!BK${sheetRowNumber}`, values: [[CUMULATIVE_PAID_5 || '']] },
      { range: `VRN_Office_Expenses!BL${sheetRowNumber}`, values: [[BANK_DETAILS_5 || '']] },
      { range: `VRN_Office_Expenses!BM${sheetRowNumber}`, values: [[PAYMENT_MODE_5 || '']] },
      { range: `VRN_Office_Expenses!BN${sheetRowNumber}`, values: [[PAYMENT_DETAILS_5 || '']] },
      { range: `VRN_Office_Expenses!BO${sheetRowNumber}`, values: [[PAYMENT_DATE_5 || '']] },
      { range: `VRN_Office_Expenses!BP${sheetRowNumber}`, values: [[Remark_5 || '']] },
    ];

    const validUpdates = updates.filter((u) => u.values[0][0] !== '');

    if (validUpdates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: OfficeExpenseID,
        resource: { valueInputOption: 'USER_ENTERED', data: validUpdates },
      });
    }

    // Step 2: Payment_Sheet में लिखो (H = NET_PAYABLE — SAME AS BEFORE)
    const paymentSheetResult = await appendToPaymentSheet({
      PLANNED_5,
      OFFBILLUID,
      Vendor_Name_4,
      BILL_NO_4,
      BILL_DATE_4,
      NET_PAYABLE,        // ✅ H column — पहले जैसा
      TDS_5,
      BALANCE_AMOUNT_5,
      BANK_DETAILS_5,
      PAYMENT_MODE_5,
      PAYMENT_DETAILS_5,
      PAYMENT_DATE_5,
      GRAND_TOTAL,
      OFFICE_NAME_1,      // ✅ T column only
    });

    // Step 3: Advance J column deduction — Vendor + Project match
    try {
      const advResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: OfficeExpenseID,
        range: 'Payment_Sheet!A2:T',
      });

      const advRows = advResponse.data.values || [];
      const advUpdates = [];
      const billVendor = (Vendor_Name_4 || '').toString().trim().toLowerCase();
      const billProject = (OFFICE_NAME_1 || '').toString().trim().toLowerCase();

      if (billVendor) {
        // ✅ पहले जैसा — NET_PAYABLE से deduct
        let remainingToDeduct = Number(NET_PAYABLE || 0);

        for (let i = 0; i < advRows.length; i++) {
          if (remainingToDeduct <= 0) break;
          const aRow = advRows[i];
          if (!aRow) continue;

          const colP = (aRow[15] || '').toString().trim();
          if (colP !== 'Advance') continue;

          const rowVendor = (aRow[3] || '').toString().trim().toLowerCase();
          if (rowVendor !== billVendor) continue;

          // ✅ NEW: Project match (T खाली हो तो skip मत करो — पुराना data)
          const rowProject = (aRow[19] || '').toString().trim().toLowerCase();
          if (rowProject && billProject && rowProject !== billProject) continue;

          const hValue = parseFloat((aRow[7] || '0').toString().replace(/,/g, '')) || 0;
          const jValue = (aRow[9] || '').toString().replace(/,/g, '').trim();
          const currentBalance = (jValue !== '' && !isNaN(parseFloat(jValue))) ? parseFloat(jValue) : hValue;

          if (currentBalance <= 0) continue;

          const deductAmount = Math.min(remainingToDeduct, currentBalance);
          const newBalance = currentBalance - deductAmount;
          remainingToDeduct -= deductAmount;

          advUpdates.push({
            range: `Payment_Sheet!J${i + 2}`,
            values: [[newBalance]],
          });
        }

        if (advUpdates.length > 0) {
          await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: OfficeExpenseID,
            resource: { valueInputOption: 'USER_ENTERED', data: advUpdates },
          });
        }
      }
    } catch (advErr) {
      console.error('Advance update error:', advErr.message);
    }

    return res.json({
      success: true,
      message: `Payment ${IS_PARTIAL ? 'partial' : 'fully'} updated`,
      updatedRow: sheetRowNumber,
      status,
      isPartial: IS_PARTIAL,
      paymentSheetEntry: paymentSheetResult,
    });

  } catch (error) {
    console.error('Payment POST Error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════
// POST Route — Advance Payment (A to T, empty row update)
// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
// POST Route — Submit Normal / Advance Covered Payment
// ═══════════════════════════════════════════════════════════
router.post('/Post-Payment', async (req, res) => {
  try {
    const {
      uid, OFFBILLUID, Vendor_Name_4, BILL_NO_4, BILL_DATE_4,
      PLANNED_5, NET_AMOUNT_5, TDS_5, PAID_AMOUNT_5,
      CUMULATIVE_PAID_5, BALANCE_AMOUNT_5, BANK_DETAILS_5,
      PAYMENT_MODE_5, PAYMENT_DETAILS_5, PAYMENT_DATE_5,
      Remark_5, IS_PARTIAL, GRAND_TOTAL, NET_PAYABLE,
      OFFICE_NAME_1, // Project Name for Column T
    } = req.body;

    console.log('=== Post-Payment Request ===', { uid, PAID_AMOUNT_5, NET_PAYABLE, OFFICE_NAME_1 });

    if (!uid) {
      return res.status(400).json({ success: false, message: 'UID is required' });
    }

    const trimmedUid = String(uid).trim();

    // 1. Find Row in VRN_Office_Expenses
    const getResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: OfficeExpenseID,
      range: 'VRN_Office_Expenses!C7:C',
    });

    const values = getResponse.data.values || [];
    const rowIndex = values.findIndex((row) => {
      const cell = row && row[0] ? String(row[0]).trim() : '';
      return cell === trimmedUid;
    });

    if (rowIndex === -1) {
      return res.status(404).json({ success: false, message: 'Row not found in Main Sheet' });
    }

    const sheetRowNumber = 7 + rowIndex;
    const status = IS_PARTIAL ? 'Partial' : 'Done';

    // 2. Update Main Sheet Status
    const updates = [
      { range: `VRN_Office_Expenses!BG${sheetRowNumber}`, values: [[status]] },
      { range: `VRN_Office_Expenses!BJ${sheetRowNumber}`, values: [[TDS_5 || '']] },
      { range: `VRN_Office_Expenses!BK${sheetRowNumber}`, values: [[CUMULATIVE_PAID_5 || '']] },
      { range: `VRN_Office_Expenses!BL${sheetRowNumber}`, values: [[BANK_DETAILS_5 || '']] },
      { range: `VRN_Office_Expenses!BM${sheetRowNumber}`, values: [[PAYMENT_MODE_5 || '']] },
      { range: `VRN_Office_Expenses!BN${sheetRowNumber}`, values: [[PAYMENT_DETAILS_5 || '']] },
      { range: `VRN_Office_Expenses!BO${sheetRowNumber}`, values: [[PAYMENT_DATE_5 || '']] },
      { range: `VRN_Office_Expenses!BP${sheetRowNumber}`, values: [[Remark_5 || '']] },
    ];

    const validUpdates = updates.filter((u) => u.values[0][0] !== '');
    if (validUpdates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: OfficeExpenseID,
        resource: { valueInputOption: 'USER_ENTERED', data: validUpdates },
      });
    }

    // 3. Write Payment Row to Payment_Sheet (Column H me Paid Amount jayega)
    // Agar Advance se paid hai to PAID_AMOUNT_5 jayega H col me
    const actualPaidAmount = Number(PAID_AMOUNT_5) > 0 ? PAID_AMOUNT_5 : NET_PAYABLE;

    const paymentSheetResult = await appendToPaymentSheet({
      PLANNED_5,
      OFFBILLUID,
      Vendor_Name_4,
      BILL_NO_4,
      BILL_DATE_4,
      NET_PAYABLE: actualPaidAmount, // ✅ Column H me 73000 jayega
      TDS_5,
      BALANCE_AMOUNT_5,
      BANK_DETAILS_5,
      PAYMENT_MODE_5,
      PAYMENT_DETAILS_5,
      PAYMENT_DATE_5,
      GRAND_TOTAL,
      OFFICE_NAME_1, // ✅ Column T me Project Name
    });

    // 4. Advance J Column Deduction (Vendor + Project Match)
    try {
      const advResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: OfficeExpenseID,
        range: 'Payment_Sheet!A2:T',
      });

      const advRows = advResponse.data.values || [];
      const advUpdates = [];
      const billVendor = (Vendor_Name_4 || '').toString().trim().toLowerCase();
      const billProject = (OFFICE_NAME_1 || '').toString().trim().toLowerCase();

      // ✅ FIX: Deduction Amount ab PAID_AMOUNT_5 (₹73,000) se hoga, 0 se nahi!
      let remainingToDeduct = Number(actualPaidAmount || 0);

      if (billVendor && remainingToDeduct > 0) {
        for (let i = 0; i < advRows.length; i++) {
          if (remainingToDeduct <= 0) break;
          const aRow = advRows[i];
          if (!aRow) continue;

          const colP = (aRow[15] || '').toString().trim();
          if (colP !== 'Advance') continue; // Sirf Advance row me ghatana hai

          const rowVendor = (aRow[3] || '').toString().trim().toLowerCase();
          const rowProject = (aRow[19] || '').toString().trim().toLowerCase(); // Column T

          // Vendor match check
          if (rowVendor !== billVendor) continue;

          // Project match check (agar col T me project hai to same hona chahiye, khali hai to legacy fallback)
          if (rowProject && billProject && rowProject !== billProject) continue;

          const hValue = parseFloat((aRow[7] || '0').toString().replace(/,/g, '')) || 0; // Col H (Total Advance)
          const jValue = (aRow[9] || '').toString().replace(/,/g, '').trim(); // Col J (Remaining)
          const currentBalance = (jValue !== '' && !isNaN(parseFloat(jValue))) ? parseFloat(jValue) : hValue;

          if (currentBalance <= 0) continue;

          const deductAmount = Math.min(remainingToDeduct, currentBalance);
          const newBalance = currentBalance - deductAmount; // 1,00,000 - 73,000 = 27,000
          remainingToDeduct -= deductAmount;

          advUpdates.push({
            range: `Payment_Sheet!J${i + 2}`, // ✅ Column J (Index 9) me update hoga
            values: [[newBalance]],
          });
        }

        if (advUpdates.length > 0) {
          await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: OfficeExpenseID,
            resource: { valueInputOption: 'USER_ENTERED', data: advUpdates },
          });
          console.log(`✓ Advance J column deducted successfully!`);
        }
      }
    } catch (advErr) {
      console.error('Advance update error:', advErr.message);
    }

    return res.json({
      success: true,
      message: `Payment ${IS_PARTIAL ? 'partial' : 'fully'} updated`,
      updatedRow: sheetRowNumber,
      status,
      isPartial: IS_PARTIAL,
      paymentSheetEntry: paymentSheetResult,
    });

  } catch (error) {
    console.error('Payment POST Error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;