// const express = require('express');
// const router = express.Router();
// const { sheets, OfficeExpenseID } = require('../../config/googleSheet');

// // ─── Helper: Fetch Advance Payments ──────────────────────────
// const fetchAdvancePayments = async () => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: OfficeExpenseID,
//       range: 'Advance_Payment!A2:H',
//     });
//     const rows = response.data.values || [];
//     const advanceMap = {};
    
//     rows.forEach((row) => {
//       const projectName = (row[1] || '').toString().trim();
//       const vendorName  = (row[2] || '').toString().trim();
//       const paidAmount  = Number((row[3] || '0').toString().replace(/,/g, '')) || 0;
      
//       if (projectName && vendorName) {
//         const key = `${projectName.toLowerCase()}||${vendorName.toLowerCase()}`;
//         if (!advanceMap[key]) advanceMap[key] = { total: 0, entries: [] };
//         advanceMap[key].total += paidAmount;
//         advanceMap[key].entries.push({
//           timestamp: row[0], project: projectName, vendor: vendorName,
//           amount: paidAmount, bank: row[4], mode: row[5], details: row[6], date: row[7],
//         });
//       }
//     });
//     return advanceMap;
//   } catch (err) {
//     console.error('Fetch advance error:', err);
//     return {};
//   }
// };

// // ─── Helper: Fetch Payment_Sheet (A to O) ────────────────────
// const fetchPaymentSheetData = async () => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: OfficeExpenseID,
//       range: 'Payment_Sheet!A2:O',
//     });
//     const rows = response.data.values || [];
    
//     /*
//      * Payment_Sheet columns (Updated - TDS at I):
//      * A(0)  = Timestamp
//      * B(1)  = Planned_5
//      * C(2)  = Office_Bill_No    ← Match key
//      * D(3)  = Vendor_Name
//      * E(4)  = BILL_NO_4
//      * F(5)  = BILL_DATE_4
//      * G(6)  = Net_Amount_5
//      * H(7)  = PAID_AMOUNT_5     ← Bill credit (full paid amount)
//      * I(8)  = TDS               ← NEW
//      * J(9)  = BALANCE_AMOUNT_5
//      * K(10) = BANK_DETAILS_5
//      * L(11) = PAYMENT_MODE_5
//      * M(12) = PAYMENT_DETAILS_5
//      * N(13) = PAYMENT DATE_5
//      * O(14) = GRAND_TOTAL       ← Actual bank transfer (Paid - TDS + RoundOff)
//      */
    
//     const paymentMap = {};
    
//     rows.forEach((row) => {
//       const officeBillNo = (row[2] || '').toString().trim();
//       const paidAmount   = Number((row[7]  || '0').toString().replace(/,/g, '')) || 0; // H = Bill credit
//       const tdsAmount    = Number((row[8]  || '0').toString().replace(/,/g, '')) || 0; // I = TDS
//       const grandTotal   = Number((row[14] || '0').toString().replace(/,/g, '')) || 0; // O = Bank transfer
      
//       if (officeBillNo) {
//         if (!paymentMap[officeBillNo]) paymentMap[officeBillNo] = { total: 0, entries: [] };
        
//         // ✅ Total = PAID amount (bill credit), NOT grand total
//         paymentMap[officeBillNo].total += paidAmount;
//         paymentMap[officeBillNo].entries.push({
//           timestamp: row[0], planned: row[1], officeBill: officeBillNo,
//           vendor: row[3], billNo: row[4], billDate: row[5],
//           netAmount: row[6], paidAmount, tds: tdsAmount,
//           balance: row[9], bank: row[10], mode: row[11],
//           details: row[12], date: row[13], grandTotal,
//         });
//       }
//     });
    
//     return paymentMap;
//   } catch (err) {
//     console.error('Fetch Payment_Sheet error:', err);
//     return {};
//   }
// };

// // ─── Helper: Append to Payment_Sheet (A to O) ────────────────
// const appendToPaymentSheet = async (paymentData) => {
//   try {
//     const now = new Date();
//     const pad = (n) => String(n).padStart(2, '0');
//     const timestamp = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

//     // ✅ A to O (15 columns) - TDS at I
//     const rowData = [
//       timestamp,                                    // A - Timestamp
//       paymentData.PLANNED_5 || '',                  // B - Planned_5
//       paymentData.OFFBILLUID || '',                 // C - Office_Bill_No
//       paymentData.Vendor_Name_4 || '',              // D - Vendor_Name
//       paymentData.BILL_NO_4 || '',                  // E - BILL_NO_4
//       paymentData.BILL_DATE_4 || '',                // F - BILL_DATE_4
//       paymentData.NET_AMOUNT_5 || '',               // G - Net_Amount_5
//       paymentData.PAID_AMOUNT_5 || '',              // H - PAID_AMOUNT_5 (bill credit)
//       paymentData.TDS_5 || '',                      // I - TDS ← NEW
//       paymentData.BALANCE_AMOUNT_5 || '',           // J - BALANCE_AMOUNT_5
//       paymentData.BANK_DETAILS_5 || '',             // K - BANK_DETAILS_5
//       paymentData.PAYMENT_MODE_5 || '',             // L - PAYMENT_MODE_5
//       paymentData.PAYMENT_DETAILS_5 || '',          // M - PAYMENT_DETAILS_5
//       paymentData.PAYMENT_DATE_5 || '',             // N - PAYMENT DATE_5
//       paymentData.GRAND_TOTAL || '',                // O - GRAND_TOTAL (bank transfer)
//     ];

//     const response = await sheets.spreadsheets.values.append({
//       spreadsheetId: OfficeExpenseID,
//       range: 'Payment_Sheet!A:O',
//       valueInputOption: 'USER_ENTERED',
//       insertDataOption: 'INSERT_ROWS',
//       resource: { values: [rowData] },
//     });

//     console.log(`✓ Payment_Sheet entry added`);
//     return { success: true, range: response.data.updates?.updatedRange };
//   } catch (err) {
//     console.error('Payment_Sheet append error:', err.message);
//     return { success: false, error: err.message };
//   }
// };

// // ─── GET Route ───────────────────────────────────────────────
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

//     /*
//      * VRN_Office_Expenses Stage 5 columns:
//      * BE(56) = PLANNED_5
//      * BF(57) = ACTUAL_5
//      * BG(58) = STATUS_5
//      * BH(59) = TIME_DELAY_5
//      * BI(60) = PAID_AMOUNT_5    ← SKIP (don't use)
//      * BJ(61) = TDS_Amount
//      * BK(62) = Net_Amount_5     ← Cumulative Paid Amount
//      * BL(63) = BANK_DETAILS_5
//      * BM(64) = PAYMENT_MODE_5
//      * BN(65) = PAYMENT_DETAILS_5
//      * BO(66) = PAYMENT DATE_5
//      * BP(67) = Remark_5
//      */

//     const filteredData = rows
//       .filter((row) => {
//         const planned = row[56];  // BE
//         const status  = (row[58] || '').toString().trim(); // BG
//         return planned && (status === '' || status.toLowerCase() === 'partial');
//       })
//       .map((row) => {
//         const projectName  = (row[3] || '').toString().trim();
//         const vendorName   = (row[38] || '').toString().trim();
//         const officeBillNo = (row[1] || '').toString().trim();
        
//         const netAmount = Number((row[52] || '0').toString().replace(/,/g, '')) || 0; // BA = NET_AMOUNT_4
        
//         // ✅ Advance (matched by project + vendor)
//         const advanceKey  = `${projectName.toLowerCase()}||${vendorName.toLowerCase()}`;
//         const advanceInfo = advanceMap[advanceKey] || { total: 0, entries: [] };
        
//         // ✅ Previous payments (matched by Office Bill No)
//         const paymentInfo = paymentMap[officeBillNo] || { total: 0, entries: [] };
        
//         // ✅ ALREADY PAID = Advance + Payment_Sheet paid amounts
//         const alreadyPaid = advanceInfo.total + paymentInfo.total;
//         const balance     = Math.max(0, netAmount - alreadyPaid);
//         const isPartial   = alreadyPaid > 0 && alreadyPaid < netAmount;

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
//           NET_AMOUNT_4: (row[52] || '').toString().trim(),  // BA
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

// // ─── POST Route ──────────────────────────────────────────────
// router.post('/Post-Payment', async (req, res) => {
//   try {
//     const {
//       uid,
//       OFFBILLUID,
//       Vendor_Name_4,
//       BILL_NO_4,
//       BILL_DATE_4,
//       PLANNED_5,
//       NET_AMOUNT_5,
//       TDS_5,
//       PAID_AMOUNT_5,          // ✅ Bill credit (full paid amount)
//       CUMULATIVE_PAID_5,      // ✅ Already paid + current paid (for BK)
//       BALANCE_AMOUNT_5,
//       BANK_DETAILS_5,
//       PAYMENT_MODE_5,
//       PAYMENT_DETAILS_5,
//       PAYMENT_DATE_5,
//       Remark_5,
//       IS_PARTIAL,
//       GRAND_TOTAL,            // ✅ Bank transfer (Paid - TDS + RoundOff)
//     } = req.body;

//     console.log('=== Payment POST ===');
//     console.log('UID:', uid, '| Paid:', PAID_AMOUNT_5, '| TDS:', TDS_5, '| Grand:', GRAND_TOTAL);

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
//       return res.status(404).json({ success: false, message: 'Row not found', searchedFor: trimmedUid });
//     }

//     const sheetRowNumber = 7 + rowIndex;
//     const status = IS_PARTIAL ? 'Partial' : 'Done';

//     /*
//      * ✅ CORRECT COLUMN MAPPING:
//      * BG(58) = STATUS_5           → Done / Partial
//      * BI(60) = SKIP               → DON'T TOUCH
//      * BJ(61) = TDS_Amount         → TDS value
//      * BK(62) = Cumulative Paid    → alreadyPaid + currentPaid (keeps adding)
//      * BL(63) = BANK_DETAILS_5
//      * BM(64) = PAYMENT_MODE_5
//      * BN(65) = PAYMENT_DETAILS_5
//      * BO(66) = PAYMENT DATE_5
//      * BP(67) = Remark_5
//      */
//     const updates = [
//       { range: `VRN_Office_Expenses!BG${sheetRowNumber}`, values: [[status]] },
//       // BI = SKIP ❌
//       { range: `VRN_Office_Expenses!BJ${sheetRowNumber}`, values: [[TDS_5 || '']] },
//       { range: `VRN_Office_Expenses!BK${sheetRowNumber}`, values: [[CUMULATIVE_PAID_5 || '']] },  // ✅ Cumulative
//       { range: `VRN_Office_Expenses!BL${sheetRowNumber}`, values: [[BANK_DETAILS_5 || '']] },
//       { range: `VRN_Office_Expenses!BM${sheetRowNumber}`, values: [[PAYMENT_MODE_5 || '']] },
//       { range: `VRN_Office_Expenses!BN${sheetRowNumber}`, values: [[PAYMENT_DETAILS_5 || '']] },
//       { range: `VRN_Office_Expenses!BO${sheetRowNumber}`, values: [[PAYMENT_DATE_5 || '']] },
//       { range: `VRN_Office_Expenses!BP${sheetRowNumber}`, values: [[Remark_5 || '']] },
//     ];

//     const validUpdates = updates.filter((u) => u.values[0][0] !== '');

//     if (validUpdates.length === 0) {
//       return res.status(400).json({ success: false, message: 'No valid fields to update' });
//     }

//     // STEP 1: Update main sheet
//     await sheets.spreadsheets.values.batchUpdate({
//       spreadsheetId: OfficeExpenseID,
//       resource: { valueInputOption: 'USER_ENTERED', data: validUpdates },
//     });

//     console.log(`✅ Row ${sheetRowNumber} | Status: ${status} | BK: ${CUMULATIVE_PAID_5}`);

//     // STEP 2: Append to Payment_Sheet (A to O with TDS at I)
//     const paymentSheetResult = await appendToPaymentSheet({
//       PLANNED_5,
//       OFFBILLUID,
//       Vendor_Name_4,
//       BILL_NO_4,
//       BILL_DATE_4,
//       NET_AMOUNT_5,
//       PAID_AMOUNT_5,       // H = Bill credit
//       TDS_5,               // I = TDS ← NEW
//       BALANCE_AMOUNT_5,    // J = Balance
//       BANK_DETAILS_5,      // K
//       PAYMENT_MODE_5,      // L
//       PAYMENT_DETAILS_5,   // M
//       PAYMENT_DATE_5,      // N
//       GRAND_TOTAL,         // O = Bank transfer
//     });

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

// ─── Helper: Fetch Advance Payments ──────────────────────────
const fetchAdvancePayments = async () => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: OfficeExpenseID,
      range: 'Advance_Payment!A2:H',
    });
    const rows = response.data.values || [];
    const advanceMap = {};
    
    rows.forEach((row) => {
      const projectName = (row[1] || '').toString().trim();
      const vendorName  = (row[2] || '').toString().trim();
      const paidAmount  = Number((row[3] || '0').toString().replace(/,/g, '')) || 0;
      
      if (projectName && vendorName) {
        const key = `${projectName.toLowerCase()}||${vendorName.toLowerCase()}`;
        if (!advanceMap[key]) advanceMap[key] = { total: 0, entries: [] };
        advanceMap[key].total += paidAmount;
        advanceMap[key].entries.push({
          timestamp: row[0], project: projectName, vendor: vendorName,
          amount: paidAmount, bank: row[4], mode: row[5], details: row[6], date: row[7],
        });
      }
    });
    return advanceMap;
  } catch (err) {
    console.error('Fetch advance error:', err);
    return {};
  }
};

// ─── Helper: Fetch Payment_Sheet ─────────────────────────────
const fetchPaymentSheetData = async () => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: OfficeExpenseID,
      range: 'Payment_Sheet!A2:O',
    });
    const rows = response.data.values || [];
    
    /*
     * Payment_Sheet columns (Final):
     * A(0)  = Timestamp
     * B(1)  = Planned_5
     * C(2)  = Office_Bill_No    ← Match key
     * D(3)  = Vendor_Name
     * E(4)  = BILL_NO_4
     * F(5)  = BILL_DATE_4
     * G(6)  = Net_Amount_5      ← EMPTY (skip)
     * H(7)  = PAID_AMOUNT_5     ← Net Payable (bank transfer) ✅
     * I(8)  = TDS
     * J(9)  = BALANCE_AMOUNT_5
     * K(10) = BANK_DETAILS_5
     * L(11) = PAYMENT_MODE_5
     * M(12) = PAYMENT_DETAILS_5
     * N(13) = PAYMENT DATE_5
     * O(14) = GRAND_TOTAL
     */
    
    const paymentMap = {};
    
    rows.forEach((row) => {
      const officeBillNo = (row[2] || '').toString().trim();
      const paidAmount   = Number((row[7]  || '0').toString().replace(/,/g, '')) || 0; // H = Net Payable
      const tdsAmount    = Number((row[8]  || '0').toString().replace(/,/g, '')) || 0; // I = TDS
      const grandTotal   = Number((row[14] || '0').toString().replace(/,/g, '')) || 0; // O
      
      if (officeBillNo) {
        if (!paymentMap[officeBillNo]) paymentMap[officeBillNo] = { total: 0, entries: [] };
        
        // ✅ Total = Paid + TDS (yeh actual bill credit hai)
        // Kyunki H mein Net Payable hai (Paid - TDS), to bill credit ke liye TDS wapas add karna padega
        const billCredit = paidAmount + tdsAmount;
        paymentMap[officeBillNo].total += billCredit;
        
        paymentMap[officeBillNo].entries.push({
          timestamp: row[0], planned: row[1], officeBill: officeBillNo,
          vendor: row[3], billNo: row[4], billDate: row[5],
          netAmount: row[6], paidAmount, tds: tdsAmount,
          balance: row[9], bank: row[10], mode: row[11],
          details: row[12], date: row[13], grandTotal,
          billCredit, // ✅ Actual bill amount credited
        });
      }
    });
    
    return paymentMap;
  } catch (err) {
    console.error('Fetch Payment_Sheet error:', err);
    return {};
  }
};

// ─── Helper: Append to Payment_Sheet ─────────────────────────
const appendToPaymentSheet = async (paymentData) => {
  try {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timestamp = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    /*
     * ✅ UPDATED Payment_Sheet mapping:
     * A = Timestamp (auto)
     * B = Planned_5
     * C = Office_Bill_No
     * D = Vendor_Name
     * E = BILL_NO_4
     * F = BILL_DATE_4
     * G = EMPTY ❌ (Net_Amount_5 skip)
     * H = PAID_AMOUNT_5 (Net Payable - bank transfer amount) ✅
     * I = TDS
     * J = BALANCE_AMOUNT_5
     * K = BANK_DETAILS_5
     * L = PAYMENT_MODE_5
     * M = PAYMENT_DETAILS_5
     * N = PAYMENT DATE_5
     * O = GRAND_TOTAL
     */
    const rowData = [
      timestamp,                                    // A
      paymentData.PLANNED_5 || '',                  // B
      paymentData.OFFBILLUID || '',                 // C
      paymentData.Vendor_Name_4 || '',              // D
      paymentData.BILL_NO_4 || '',                  // E
      paymentData.BILL_DATE_4 || '',                // F
      '',                                           // G ← EMPTY ✅
      paymentData.NET_PAYABLE || '',                // H ← Net Payable ✅
      paymentData.TDS_5 || '',                      // I
      paymentData.BALANCE_AMOUNT_5 || '',           // J
      paymentData.BANK_DETAILS_5 || '',             // K
      paymentData.PAYMENT_MODE_5 || '',             // L
      paymentData.PAYMENT_DETAILS_5 || '',          // M
      paymentData.PAYMENT_DATE_5 || '',             // N
      paymentData.GRAND_TOTAL || '',                // O
    ];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: OfficeExpenseID,
      range: 'Payment_Sheet!A:O',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: { values: [rowData] },
    });

    console.log(`✓ Payment_Sheet entry added | H (Net Payable): ${paymentData.NET_PAYABLE}`);
    return { success: true, range: response.data.updates?.updatedRange };
  } catch (err) {
    console.error('Payment_Sheet append error:', err.message);
    return { success: false, error: err.message };
  }
};

// ─── GET Route ───────────────────────────────────────────────
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
        const status  = (row[58] || '').toString().trim();
        return planned && (status === '' || status.toLowerCase() === 'partial');
      })
      .map((row) => {
        const projectName  = (row[3] || '').toString().trim();
        const vendorName   = (row[38] || '').toString().trim();
        const officeBillNo = (row[1] || '').toString().trim();
        
        const netAmount = Number((row[52] || '0').toString().replace(/,/g, '')) || 0;
        
        const advanceKey  = `${projectName.toLowerCase()}||${vendorName.toLowerCase()}`;
        const advanceInfo = advanceMap[advanceKey] || { total: 0, entries: [] };
        const paymentInfo = paymentMap[officeBillNo] || { total: 0, entries: [] };
        
        // ✅ ALREADY PAID = Advance + Payment_Sheet bill credits
        const alreadyPaid = advanceInfo.total + paymentInfo.total;
        const balance     = Math.max(0, netAmount - alreadyPaid);
        const isPartial   = alreadyPaid > 0 && alreadyPaid < netAmount;

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

// ─── POST Route ──────────────────────────────────────────────
router.post('/Post-Payment', async (req, res) => {
  try {
    const {
      uid,
      OFFBILLUID,
      Vendor_Name_4,
      BILL_NO_4,
      BILL_DATE_4,
      PLANNED_5,
      NET_AMOUNT_5,
      TDS_5,
      PAID_AMOUNT_5,
      CUMULATIVE_PAID_5,
      BALANCE_AMOUNT_5,
      BANK_DETAILS_5,
      PAYMENT_MODE_5,
      PAYMENT_DETAILS_5,
      PAYMENT_DATE_5,
      Remark_5,
      IS_PARTIAL,
      GRAND_TOTAL,
      NET_PAYABLE,             // ✅ NEW - Net Payable for H column
    } = req.body;

    console.log('=== Payment POST ===');
    console.log('UID:', uid, '| Paid:', PAID_AMOUNT_5, '| TDS:', TDS_5, '| NetPayable:', NET_PAYABLE);

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
      return res.status(404).json({ success: false, message: 'Row not found', searchedFor: trimmedUid });
    }

    const sheetRowNumber = 7 + rowIndex;
    const status = IS_PARTIAL ? 'Partial' : 'Done';

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

    if (validUpdates.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    // STEP 1: Update main sheet
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: OfficeExpenseID,
      resource: { valueInputOption: 'USER_ENTERED', data: validUpdates },
    });

    console.log(`✅ Main row ${sheetRowNumber} | Status: ${status}`);

    // STEP 2: Append to Payment_Sheet (G empty, H = Net Payable)
    const paymentSheetResult = await appendToPaymentSheet({
      PLANNED_5,
      OFFBILLUID,
      Vendor_Name_4,
      BILL_NO_4,
      BILL_DATE_4,
      // G = empty
      NET_PAYABLE,         // ✅ H = Net Payable (bank transfer amount)
      TDS_5,               // I
      BALANCE_AMOUNT_5,    // J
      BANK_DETAILS_5,      // K
      PAYMENT_MODE_5,      // L
      PAYMENT_DETAILS_5,   // M
      PAYMENT_DATE_5,      // N
      GRAND_TOTAL,         // O
    });

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