// const express = require('express');
// const router = express.Router();
// const { sheets, OfficeExpenseID } = require('../../config/googleSheet'); // path adjust karo

// // GET route
// router.get('/Get-Expenses-Entry', async (req, res) => {
//   try {
//     if (!OfficeExpenseID) {
//       return res.status(500).json({
//         success: false,
//         error: 'spreadsheetId is not configured',
//       });
//     }

//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: OfficeExpenseID,
//       range: 'VRN_Office_Expenses!A8:AJ',
//     });

//     let rows = response.data.values || [];

//     if (rows.length === 0) {
//       return res.json({
//         success: true,
//         message: 'No data found',
//         data: [],
//       });
//     }

//     const filteredData = rows
//       .filter((row) => row[34] && !row[35])
//       .map((row) => ({
//         OFFBILLUID: (row[1] || '').toString().trim(),
//         uid: (row[2] || '').toString().trim(),
//         OFFICE_NAME_1: (row[3] || '').toString().trim(),
//         PAYEE_NAME_1: (row[4] || '').toString().trim(),
//         EXPENSES_HEAD_1: (row[5] || '').toString().trim(),
//         EXPENSES_SUBHEAD_1: (row[6] || '').toString().trim(),
//         ITEM_NAME_1: (row[7] || '').toString().trim(),
//         UNIT_1: (row[8] || '').toString().trim(),
//         SKU_CODE_1: (row[9] || '').toString().trim(),
//         Qty_1: (row[10] || '').toString().trim(),
//         Amount: (row[11] || '').toString().trim(),
//         DEPARTMENT_1: (row[12] || '').toString().trim(),
//         APPROVAL_DOER: (row[13] || '').toString().trim(),
//         RAISED_BY_1: (row[14] || '').toString().trim(),
//         Bill_Photo: (row[15] || '').toString().trim(),
//         PAYMENT_MODE_3: (row[31] || '').toString().trim(),
//         REMARK_3: (row[32] || '').toString().trim(),
//         PLANNED_4: (row[34] || '').toString().trim(),
//         ACTUAL_4: (row[35] || '').toString().trim(),
//       }));

//     return res.json({
//       success: true,
//       totalRecords: filteredData.length,
//       data: filteredData,
//     });
//   } catch (error) {
//     console.error('Expenses Entry GET Error:', error.message);
//     return res.status(500).json({
//       success: false,
//       error: 'Failed to fetch office expenses data',
//       details: error.message,
//     });
//   }
// });

// // POST route
// // router.post('/Post-Expenses-Entry', async (req, res) => {
// //   try {
// //     const {
// //       uid,
// //       STATUS_4,
// //       Vendor_Name_4,
// //       BILL_NO_4,
// //       BILL_DATE_4,
// //       BASIC_AMOUNT_4,
// //       CGST_4,
// //       SGST_4,
// //       IGST_4,
// //       TOTAL_AMOUNT_4,
// //       TRASNPORT_CHARGES_4,
// //       Transport_Gst_4,
// //       NET_AMOUNT_4,
// //       Remark_4,
// //     } = req.body;

// //     console.log('Received body:', req.body);

// //     if (!uid) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'uid (Bill No) is required',
// //       });
// //     }

// //     const trimmedBillNo = String(uid).trim();

// //     const response = await sheets.spreadsheets.values.get({
// //       spreadsheetId: OfficeExpenseID,
// //       range: 'VRN_Office_Expenses!B7:B',
// //     });

// //     const rows = response.data.values || [];

// //     if (rows.length === 0) {
// //       return res.status(404).json({
// //         success: false,
// //         message: 'No data in sheet',
// //       });
// //     }

// //     // Sab matching rows collect karo
// //     const matchingRows = [];
// //     rows.forEach((row, index) => {
// //       if (row && row[0]) {
// //         const cellValue = String(row[0]).trim();
// //         if (cellValue === trimmedBillNo) {
// //           matchingRows.push({
// //             rowIndex: index,
// //             rowNumber: 7 + index,
// //           });
// //         }
// //       }
// //     });

// //     if (matchingRows.length === 0) {
// //       return res.status(404).json({
// //         success: false,
// //         message: 'No matching Bill No found',
// //         searchedFor: trimmedBillNo,
// //       });
// //     }

// //     // Last row
// //     const lastRow = matchingRows[matchingRows.length - 1];
// //     const lastRowNumber = lastRow.rowNumber;

// //     console.log(`Found ${matchingRows.length} matches → last row: ${lastRowNumber}`);

// //     const requests = [];

// //     // 1. SABHI matching rows mein STATUS_4 update kar do
// //     if (STATUS_4 !== undefined && STATUS_4 !== null && STATUS_4 !== '') {
// //       matchingRows.forEach(({ rowNumber }) => {
// //         requests.push({
// //           range: `VRN_Office_Expenses!AK${rowNumber}`,
// //           values: [[STATUS_4]],
// //         });
// //       });
// //     }

// //     // 2. Sirf LAST row mein baaki fields update kar do
// //     const addLastOnly = (colLetter, value) => {
// //       if (value !== undefined && value !== null && value !== '') {
// //         requests.push({
// //           range: `VRN_Office_Expenses!${colLetter}${lastRowNumber}`,
// //           values: [[value]],
// //         });
// //       }
// //     };

// //     addLastOnly('AM', Vendor_Name_4);
// //     addLastOnly('AN', BILL_NO_4);
// //     addLastOnly('AO', BILL_DATE_4);
// //     addLastOnly('AP', BASIC_AMOUNT_4);
// //     addLastOnly('AQ', CGST_4);
// //     addLastOnly('AR', SGST_4);
// //     addLastOnly('AS', IGST_4);
// //     addLastOnly('AT', TOTAL_AMOUNT_4);
// //     addLastOnly('AU', TRASNPORT_CHARGES_4);
// //     addLastOnly('AV', Transport_Gst_4);
// //     addLastOnly('AW', NET_AMOUNT_4);
// //     addLastOnly('AX', Remark_4);

// //     if (requests.length === 0) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'No fields to update',
// //       });
// //     }

// //     await sheets.spreadsheets.values.batchUpdate({
// //       spreadsheetId: OfficeExpenseID,
// //       resource: {
// //         valueInputOption: 'USER_ENTERED',
// //         data: requests,
// //       },
// //     });

// //     return res.json({
// //       success: true,
// //       message: 'Data updated: STATUS_4 sabhi rows mein, baaki sirf last row mein',
// //       updatedRows: matchingRows.length,
// //       lastRow: lastRowNumber,
// //       statusValueUsed: STATUS_4 || '(not provided)',
// //     });
// //   } catch (error) {
// //     console.error('Expenses Entry POST Error:', error);
// //     return res.status(500).json({
// //       success: false,
// //       message: 'Server error',
// //       error: error.message,
// //     });
// //   }
// // });




// router.post('/Post-Expenses-Entry', async (req, res) => {
//   try {
//     console.log('Received body:', req.body);

//     const { entries, offBillUID } = req.body;

//     if (!entries || !Array.isArray(entries) || entries.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'entries array is required',
//       });
//     }

//     // C column se UID values fetch karo
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: OfficeExpenseID,
//       range: 'VRN_Office_Expenses!C7:C',
//     });

//     const rows = response.data.values || [];

//     if (rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'No data found in sheet',
//       });
//     }

//     // UID -> rowNumber map
//     const uidRowMap = new Map();

//     rows.forEach((row, index) => {
//       if (row && row[0] !== undefined && row[0] !== null && row[0] !== '') {
//         const sheetUid = String(row[0]).trim();
//         const rowNumber = 7 + index;
//         uidRowMap.set(sheetUid, rowNumber);
//       }
//     });

//     const requests = [];
//     const results = [];

//     const addField = (colLetter, rowNumber, value) => {
//       if (value !== undefined && value !== null && value !== '') {
//         requests.push({
//           range: `VRN_Office_Expenses!${colLetter}${rowNumber}`,
//           values: [[value]],
//         });
//       }
//     };

//     for (const entry of entries) {
//       const {
//         uid,
//         STATUS_4,
//         Vendor_Name_4,
//         BILL_NO_4,
//         BILL_DATE_4,
//         BASIC_AMOUNT_4,
//         CGST_4,
//         SGST_4,
//         IGST_4,
//         TOTAL_AMOUNT_4,
//         TRASNPORT_CHARGES_4,
//         Transport_Gst_4,
//         NET_AMOUNT_4,
//         Remark_4,
//       } = entry;

//       if (!uid) {
//         results.push({
//           uid: null,
//           success: false,
//           message: 'uid missing in one entry',
//         });
//         continue;
//       }

//       const trimmedUID = String(uid).trim();
//       const matchedRowNumber = uidRowMap.get(trimmedUID);

//       if (!matchedRowNumber) {
//         results.push({
//           uid: trimmedUID,
//           success: false,
//           message: 'No matching UID found in C column',
//         });
//         continue;
//       }

//       // Is UID ki row me update karo
//       addField('AK', matchedRowNumber, STATUS_4);
//       addField('AM', matchedRowNumber, Vendor_Name_4);
//       addField('AN', matchedRowNumber, BILL_NO_4);
//       addField('AO', matchedRowNumber, BILL_DATE_4);
//       addField('AP', matchedRowNumber, BASIC_AMOUNT_4);
//       addField('AQ', matchedRowNumber, CGST_4);
//       addField('AR', matchedRowNumber, SGST_4);
//       addField('AS', matchedRowNumber, IGST_4);
//       addField('AT', matchedRowNumber, TOTAL_AMOUNT_4);
//       addField('AU', matchedRowNumber, TRASNPORT_CHARGES_4);
//       addField('AV', matchedRowNumber, Transport_Gst_4);
//       addField('AW', matchedRowNumber, NET_AMOUNT_4);
//       addField('AX', matchedRowNumber, Remark_4);

//       results.push({
//         uid: trimmedUID,
//         rowNumber: matchedRowNumber,
//         success: true,
//       });
//     }

//     if (requests.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'No valid rows found to update',
//         results,
//       });
//     }

//     await sheets.spreadsheets.values.batchUpdate({
//       spreadsheetId: OfficeExpenseID,
//       resource: {
//         valueInputOption: 'USER_ENTERED',
//         data: requests,
//       },
//     });

//     return res.json({
//       success: true,
//       message: 'Entries updated successfully',
//       offBillUID: offBillUID || null,
//       updatedCount: results.filter(r => r.success).length,
//       results,
//     });
//   } catch (error) {
//     console.error('Expenses Entry POST Error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message,
//     });
//   }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const { sheets, OfficeExpenseID } = require('../../config/googleSheet');

// ─── GET Route ───────────────────────────────────────────────
router.get('/Get-Expenses-Entry', async (req, res) => {
  try {
    if (!OfficeExpenseID) {
      return res.status(500).json({
        success: false,
        error: 'spreadsheetId is not configured',
      });
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: OfficeExpenseID,
      range: 'VRN_Office_Expenses!A8:AJ',
    });

    let rows = response.data.values || [];

    if (rows.length === 0) {
      return res.json({
        success: true,
        message: 'No data found',
        data: [],
      });
    }

    // VRN: row[34] = AI (PLANNED_4), row[35] = AJ (ACTUAL_4)
    const filteredData = rows
      .filter((row) => row[34] && !row[35])
      .map((row) => ({
        OFFBILLUID:         (row[1]  || '').toString().trim(),
        uid:                (row[2]  || '').toString().trim(),
        OFFICE_NAME_1:      (row[3]  || '').toString().trim(),
        PAYEE_NAME_1:       (row[4]  || '').toString().trim(),
        EXPENSES_HEAD_1:    (row[5]  || '').toString().trim(),
        EXPENSES_SUBHEAD_1: (row[6]  || '').toString().trim(),
        ITEM_NAME_1:        (row[7]  || '').toString().trim(),
        UNIT_1:             (row[8]  || '').toString().trim(),
        SKU_CODE_1:         (row[9]  || '').toString().trim(),
        Qty_1:              (row[10] || '').toString().trim(),
        Amount:             (row[11] || '').toString().trim(),
        DEPARTMENT_1:       (row[12] || '').toString().trim(),
        APPROVAL_DOER:      (row[13] || '').toString().trim(),
        RAISED_BY_1:        (row[14] || '').toString().trim(),
        Bill_Photo:         (row[15] || '').toString().trim(),
        PAYMENT_MODE_3:     (row[31] || '').toString().trim(),
        REMARK_3:           (row[32] || '').toString().trim(),
        PLANNED_4:          (row[34] || '').toString().trim(),
        ACTUAL_4:           (row[35] || '').toString().trim(),
      }));

    return res.json({
      success: true,
      totalRecords: filteredData.length,
      data: filteredData,
    });

  } catch (error) {
    console.error('VRN Expenses Entry GET Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch VRN office expenses data',
      details: error.message,
    });
  }
});

// ─── POST Route ──────────────────────────────────────────────
router.post('/Post-Expenses-Entry', async (req, res) => {
  try {
    const {
      uid,
      STATUS_4,
      Vendor_Name_4,
      BILL_NO_4,
      BILL_DATE_4,
      TRASNPORT_CHARGES_4,
      Transport_Gst_4,
      NET_AMOUNT_4,
      Remark_4,
      items,
    } = req.body;

    console.log('=== VRN POST Request ===');
    console.log('OFFBILLUID:', uid);
    console.log('Items count:', items?.length);

    if (!uid) {
      return res.status(400).json({
        success: false,
        message: 'uid (OFFBILLUID) is required',
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'items array is required and cannot be empty',
      });
    }

    // Fetch sheet data (A to BB covers all needed columns)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: OfficeExpenseID,
      range: 'VRN_Office_Expenses!A7:BB',
    });

    const rows = response.data.values || [];

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No data found in sheet',
      });
    }

    // Find all rows matching this OFFBILLUID
    const billGroupRows = [];
    rows.forEach((row, index) => {
      const rowOffBillUID = row[1] ? String(row[1]).trim() : '';
      if (rowOffBillUID === String(uid).trim()) {
        billGroupRows.push({
          rowNumber: 7 + index,
          itemUid: row[2] ? String(row[2]).trim() : '',
        });
      }
    });

    console.log(`VRN OFFBILLUID "${uid}" → ${billGroupRows.length} rows found`);

    if (billGroupRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No rows found for OFFBILLUID: ${uid}`,
      });
    }

    // itemUid → rowNumber map
    const uidToRowNumber = {};
    billGroupRows.forEach(row => {
      if (row.itemUid) {
        uidToRowNumber[row.itemUid] = row.rowNumber;
      }
    });

    // Last row (totals yahan jayenge)
    const sortedRows = [...billGroupRows].sort(
      (a, b) => a.rowNumber - b.rowNumber
    );
    const lastRowNumber = sortedRows[sortedRows.length - 1].rowNumber;

    // Calculate totals
    let totalBasicAmount = 0;
    let totalCGST        = 0;
    let totalSGST        = 0;
    let totalIGST        = 0;
    let totalRowAmount   = 0;

    items.forEach(item => {
      totalBasicAmount += Number(item.BASIC_AMOUNT_4)  || 0;
      totalCGST        += Number(item.CGST_4)          || 0;
      totalSGST        += Number(item.SGST_4)          || 0;
      totalIGST        += Number(item.IGST_4)          || 0;
      totalRowAmount   += Number(item.TOTAL_AMOUNT_4)  || 0;
    });

    const requests     = [];
    const notFoundUids = [];

    const addToRow = (colLetter, rowNum, value) => {
      if (value !== undefined && value !== null && value !== '') {
        requests.push({
          range:  `VRN_Office_Expenses!${colLetter}${rowNum}`,
          values: [[value]],
        });
      }
    };

    // ═══════════════════════════════════════════════════════════════
    // VRN COLUMN MAPPING (AI to BB)
    //
    // AI = PLANNED_4              (already filled - skip)
    // AJ = ACTUAL_4               (skip)
    // AK = STATUS_4               ★ per item row
    // AL = TIME DELAY 4           (skip - formula?)
    // AM = Vendor_Name_4          ★ per item row
    // AN = BILL_NO_4              ★ per item row
    // AO = BILL_DATE_4            ★ per item row
    // AP = BASIC_AMOUNT_4         ★ per item row
    // AQ = CGST_4                 ★ per item row
    // AR = SGST_4                 ★ per item row
    // AS = IGST_4                 ★ per item row
    // AT = TOTAL_AMOUNT_4         ★ per item row
    //
    // LAST ROW ONLY (Totals + Transport + Net + Remark):
    // AU = Total_Bill_Amount_4    (sum of AP)
    // AV = Total_CGST_4           (sum of AQ)
    // AW = Total_SGST_4           (sum of AR)
    // AX = Total_IGST_4           (sum of AS)
    // AY = TRASNPORT_CHARGES_4
    // AZ = Transport_Gst_4
    // BA = NET_AMOUNT_4
    // BB = Remark_4
    // ═══════════════════════════════════════════════════════════════

    // Per-item updates
    items.forEach(item => {
      const itemUid = String(item.itemUid || '').trim();
      if (!itemUid) return;

      const targetRow = uidToRowNumber[itemUid];
      if (!targetRow) {
        notFoundUids.push(itemUid);
        return;
      }

      console.log(`VRN: itemUid "${itemUid}" → Row ${targetRow}`);

      // Per-item columns
      addToRow('AK', targetRow, STATUS_4);
      addToRow('AM', targetRow, Vendor_Name_4);
      addToRow('AN', targetRow, BILL_NO_4);
      addToRow('AO', targetRow, BILL_DATE_4);
      addToRow('AP', targetRow, item.BASIC_AMOUNT_4);
      addToRow('AQ', targetRow, item.CGST_4);
      addToRow('AR', targetRow, item.SGST_4);
      addToRow('AS', targetRow, item.IGST_4);
      addToRow('AT', targetRow, item.TOTAL_AMOUNT_4);
    });

    // Last row only - Totals + Transport + Net + Remark
    console.log(`VRN: Adding totals/transport/net to last row: ${lastRowNumber}`);

    addToRow('AU', lastRowNumber, totalBasicAmount.toFixed(2)); // Total_Bill_Amount_4
    addToRow('AV', lastRowNumber, totalCGST.toFixed(2));        // Total_CGST_4
    addToRow('AW', lastRowNumber, totalSGST.toFixed(2));        // Total_SGST_4
    addToRow('AX', lastRowNumber, totalIGST.toFixed(2));        // Total_IGST_4

    if (TRASNPORT_CHARGES_4) {
      addToRow('AY', lastRowNumber, TRASNPORT_CHARGES_4);       // TRASNPORT_CHARGES_4
    }
    if (Transport_Gst_4) {
      addToRow('AZ', lastRowNumber, Transport_Gst_4);           // Transport_Gst_4
    }
    if (NET_AMOUNT_4) {
      addToRow('BA', lastRowNumber, NET_AMOUNT_4);              // NET_AMOUNT_4
    }
    if (Remark_4) {
      addToRow('BB', lastRowNumber, Remark_4);                  // Remark_4
    }

    if (requests.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No matching rows found to update',
        notFoundUids,
      });
    }

    // Batch update
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: OfficeExpenseID,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data: requests,
      },
    });

    console.log(`✓ VRN update complete: ${requests.length} cells updated`);

    return res.json({
      success:      true,
      message:      `VRN Bill updated successfully for ${items.length} items`,
      offBillUID:   uid,
      billNo:       BILL_NO_4,
      updatedItems: items.length - notFoundUids.length,
      notFoundUids: notFoundUids.length > 0 ? notFoundUids : undefined,
      totals: {
        totalBasicAmount: totalBasicAmount.toFixed(2),
        totalCGST:        totalCGST.toFixed(2),
        totalSGST:        totalSGST.toFixed(2),
        totalIGST:        totalIGST.toFixed(2),
        totalRowAmount:   totalRowAmount.toFixed(2),
        lastRowNumber,
      },
    });

  } catch (error) {
    console.error('VRN Expenses Entry POST Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error occurred',
      error:   error.message,
    });
  }
});

module.exports = router;