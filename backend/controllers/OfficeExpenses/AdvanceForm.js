



const express = require('express');
const router = express.Router();
const { sheets, OfficeExpenseID } = require('../../config/googleSheet');

// ─── GET Route - Dropdown Data (A, L, M columns) ─────────────
router.get('/Get-Advance-Dropdown', async (req, res) => {
  try {
    if (!OfficeExpenseID) {
      return res.status(500).json({
        success: false,
        error: 'spreadsheetId is not configured',
      });
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: OfficeExpenseID,
      range: 'Project_Data!A3:M',
    });

    const rows = response.data.values || [];

    if (rows.length === 0) {
      return res.json({
        success: true,
        type: 'dropdown',
        data: { bankNames: [], projectNames: [], vendorNames: [] },
      });
    }

    const bankNamesSet = new Set();
    const projectNamesSet = new Set();
    const vendorNamesSet = new Set();

    rows.forEach((row) => {
      const bank = (row[0] || '').toString().trim();
      const project = (row[11] || '').toString().trim();
      const vendor = (row[12] || '').toString().trim();

      if (bank) bankNamesSet.add(bank);
      if (project) projectNamesSet.add(project);
      if (vendor) vendorNamesSet.add(vendor);
    });

    const bankNames = [...bankNamesSet].sort();
    const projectNames = [...projectNamesSet].sort();
    const vendorNames = [...vendorNamesSet].sort();

    return res.json({
      success: true,
      type: 'dropdown',
      data: { bankNames, projectNames, vendorNames },
      counts: {
        bankNames: bankNames.length,
        projectNames: projectNames.length,
        vendorNames: vendorNames.length,
      },
    });

  } catch (error) {
    console.error('Advance Dropdown GET Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch dropdown data',
      details: error.message,
    });
  }
});

// ─── POST Route - Advance Payment → Payment_Sheet ────────────
// router.post('/Post-Advance-Payment', async (req, res) => {
//   try {
//     const {
//       Project_Name,
//       VENDOR_NAME,
//       PAID_AMOUNT,
//       BANK_DETAILS,
//       PAYMENT_MODE,
//       PAYMENT_DETAILS,
//       PAYMENT_DATE,
//     } = req.body;

//     console.log('=== Advance Payment POST ===');
//     console.log('Body:', req.body);

//     if (!Project_Name || !VENDOR_NAME || !PAID_AMOUNT) {
//       return res.status(400).json({
//         success: false,
//         message: 'Project_Name, VENDOR_NAME aur PAID_AMOUNT mandatory hain',
//       });
//     }

//     const now = new Date();
//     const pad = (n) => String(n).padStart(2, '0');
//     const timestamp = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

//     // ✅ Payment_Sheet (A to P):
//     // A = Timestamp
//     // B = Planned_5 (empty)
//     // C = Office_Bill_No → Project_Name (for matching)
//     // D = Vendor_Name
//     // E = BILL_NO_4 (empty)
//     // F = BILL_DATE_4 (empty)
//     // G = Payble_Amount_5 (empty)
//     // H = PAID_AMOUNT_5 (advance amount)
//     // I = TDS (empty)
//     // J = BALANCE_AMOUNT_5 (advance remaining)
//     // K = BANK_DETAILS_5
//     // L = PAYMENT_MODE_5
//     // M = PAYMENT_DETAILS_5
//     // N = PAYMENT DATE_5
//     // O = GRAND_TOTAL (empty)
//     // P = Exp._Head → "Advance"

//     const rowData = [
//       timestamp,                              // A
//       '',                                     // B
//       '',                                      // C - Project Name
//       String(VENDOR_NAME).trim(),             // D - Vendor
//       '',                                     // E
//       '',                                     // F
//       '',                                     // G
//       String(PAID_AMOUNT).trim(),             // H - Paid Amount
//       '',                                     // I
//       String(PAID_AMOUNT).trim(),             // J - Balance (same initially)
//       String(BANK_DETAILS || '').trim(),      // K
//       String(PAYMENT_MODE || '').trim(),      // L
//       String(PAYMENT_DETAILS || '').trim(),   // M
//       String(PAYMENT_DATE || '').trim(),      // N
//       '',                                     // O
//       'Advance',                              // P - Exp._Head = "Advance" ✅
//     ];

//     const response = await sheets.spreadsheets.values.append({
//       spreadsheetId: OfficeExpenseID,
//       range: 'Payment_Sheet!A:P',
//       valueInputOption: 'USER_ENTERED',
//       insertDataOption: 'INSERT_ROWS',
//       resource: { values: [rowData] },
//     });

//     console.log('✓ Advance → Payment_Sheet (P = Advance)');

//     return res.json({
//       success: true,
//       message: 'Advance Payment added successfully',
//       timestamp,
//       updatedRange: response.data.updates?.updatedRange,
//     });

//   } catch (error) {
//     console.error('Advance Payment POST Error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error occurred',
//       error: error.message,
//     });
//   }
// });


router.post('/Post-Advance-Payment', async (req, res) => {
  try {
    const {
      Project_Name,
      VENDOR_NAME,
      PAID_AMOUNT,
      BANK_DETAILS,
      PAYMENT_MODE,
      PAYMENT_DETAILS,
      PAYMENT_DATE,
    } = req.body;

    console.log('=== Advance Payment POST ===');
    console.log('Body:', req.body);

    if (!Project_Name || !VENDOR_NAME || !PAID_AMOUNT) {
      return res.status(400).json({
        success: false,
        message: 'Project_Name, VENDOR_NAME aur PAID_AMOUNT mandatory hain',
      });
    }

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timestamp = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    // 1️⃣ Sheet का डेटा रीड करके पहली Empty Row ढूँढना
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId: OfficeExpenseID,
      range: 'Payment_Sheet!A:T',
    });

    const rows = sheetData.data.values || [];
    let targetRowIndex = -1;

    // Header (Row 1) को छोड़कर Row 2 (index 1) से चेक करना
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      // Row खाली है अगर row exist न करे या उसके सभी cells ब्लैंक हों
      const isEmpty = !row || row.length === 0 || row.every((cell) => !cell || cell.toString().trim() === '');
      
      if (isEmpty) {
        targetRowIndex = i + 1; // Google Sheets 1-based index (Row Number)
        break;
      }
    }

    // अगर बीच में कोई empty row नहीं मिली, तो डेटा के तुरंत बाद वाली row लेंगे
    if (targetRowIndex === -1) {
      targetRowIndex = rows.length + 1;
    }

    console.log(`Target Empty Row Found at Row: ${targetRowIndex}`);

    // 2️⃣ Column Data (A to T)
    const rowData = [
      timestamp,                              // A - Timestamp
      '',                                     // B
      '',                                     // C
      String(VENDOR_NAME).trim(),             // D - Vendor Name
      '',                                     // E
      '',                                     // F
      '',                                     // G
      String(PAID_AMOUNT).trim(),             // H - Paid Amount
      '',                                     // I
      String(PAID_AMOUNT).trim(),             // J - Balance Amount
      String(BANK_DETAILS || '').trim(),      // K - Bank Details
      String(PAYMENT_MODE || '').trim(),      // L - Payment Mode
      String(PAYMENT_DETAILS || '').trim(),   // M - Payment Details
      String(PAYMENT_DATE || '').trim(),      // N - Payment Date
      '',                                     // O
      'Advance',                              // P - Exp._Head ("Advance")
      '',                                     // Q
      '',                                     // R
      '',                                     // S
      String(Project_Name).trim(),            // T - Project Name ✅
    ];

    // 3️⃣ Row insert करने के बजाय specific empty row में UPDATE करना
    const updateRange = `Payment_Sheet!A${targetRowIndex}:T${targetRowIndex}`;

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: OfficeExpenseID,
      range: updateRange,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [rowData] },
    });

    console.log(`✓ Data updated successfully in row: ${targetRowIndex}`);

    return res.json({
      success: true,
      message: 'Advance Payment added successfully',
      targetRow: targetRowIndex,
      updatedRange: response.data.updatedRange,
    });

  } catch (error) {
    console.error('Advance Payment POST Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error occurred',
      error: error.message,
    });
  }
});


module.exports = router;