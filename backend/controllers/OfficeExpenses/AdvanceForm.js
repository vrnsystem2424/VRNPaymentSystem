// const express = require('express');
// const router = express.Router();
// const { sheets, OfficeExpenseID } = require('../../config/googleSheet'); // path adjust karo

// // ─── GET Route - Dropdown Data (A, L, M columns) ─────────────
// router.get('/Get-Advance-Dropdown', async (req, res) => {
//   try {
//     if (!OfficeExpenseID) {
//       return res.status(500).json({
//         success: false,
//         error: 'spreadsheetId is not configured',
//       });
//     }

//     // Sirf A se M tak fetch karo (B-K wagaira beech wala bhi aayega, but use sirf A, L, M)
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: OfficeExpenseID,
//       range: 'Project_Data!A3:M',
//     });

//     const rows = response.data.values || [];

//     if (rows.length === 0) {
//       return res.json({
//         success: true,
//         type: 'dropdown',
//         data: {
//           bankNames: [],
//           projectNames: [],
//           vendorNames: [],
//         },
//       });
//     }

//     // ── Extract & deduplicate column data ──────────────────
//     const bankNamesSet    = new Set();
//     const projectNamesSet = new Set();
//     const vendorNamesSet  = new Set();

//     rows.forEach((row) => {
//       const bank    = (row[0]  || '').toString().trim();  // A column - index 0
//       const project = (row[11] || '').toString().trim();  // L column - index 11
//       const vendor  = (row[12] || '').toString().trim();  // M column - index 12

//       if (bank)    bankNamesSet.add(bank);
//       if (project) projectNamesSet.add(project);
//       if (vendor)  vendorNamesSet.add(vendor);
//     });

//     // Convert sets to sorted arrays
//     const bankNames    = [...bankNamesSet].sort();
//     const projectNames = [...projectNamesSet].sort();
//     const vendorNames  = [...vendorNamesSet].sort();

//     return res.json({
//       success: true,
//       type: 'dropdown',
//       data: {
//         bankNames,
//         projectNames,
//         vendorNames,
//       },
//       counts: {
//         bankNames: bankNames.length,
//         projectNames: projectNames.length,
//         vendorNames: vendorNames.length,
//       },
//     });

//   } catch (error) {
//     console.error('Advance Dropdown GET Error:', error.message);
//     return res.status(500).json({
//       success: false,
//       error: 'Failed to fetch dropdown data',
//       details: error.message,
//     });
//   }
// });


// // ─── POST Route - Add new advance payment entry ──────────────


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

//     console.log('=== Advance Payment POST Request ===');
//     console.log('Body:', req.body);

//     // Validation
//     if (!Project_Name || !VENDOR_NAME || !PAID_AMOUNT) {
//       return res.status(400).json({
//         success: false,
//         message: 'Project_Name, VENDOR_NAME aur PAID_AMOUNT mandatory hain',
//       });
//     }

//     // Auto timestamp
//     const now = new Date();
//     const pad = (n) => String(n).padStart(2, '0');
//     const timestamp = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

//     // Row data (A to H)
    
//     const rowData = [
//       timestamp,                              // A - Timestamp
//       String(Project_Name).trim(),           // B - Project_Name
//       String(VENDOR_NAME).trim(),            // C - VENDOR_NAME
//       String(PAID_AMOUNT).trim(),            // D - PAID_AMOUNT
//       String(BANK_DETAILS || '').trim(),     // E - BANK_DETAILS
//       String(PAYMENT_MODE || '').trim(),     // F - PAYMENT_MODE
//       String(PAYMENT_DETAILS || '').trim(),  // G - PAYMENT_DETAILS
//       String(PAYMENT_DATE || '').trim(),     // H - PAYMENT_DATE
//     ];



//     const response = await sheets.spreadsheets.values.append({
//       spreadsheetId: OfficeExpenseID,
//       range: 'Payment_Sheet!A:H',
//       valueInputOption: 'USER_ENTERED',
//       insertDataOption: 'INSERT_ROWS',
//       resource: { values: [rowData] },
//     });

//     console.log('✓ Advance Payment added successfully');

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

// module.exports = router;






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

    // ✅ Payment_Sheet (A to P):
    // A = Timestamp
    // B = Planned_5 (empty)
    // C = Office_Bill_No → Project_Name (for matching)
    // D = Vendor_Name
    // E = BILL_NO_4 (empty)
    // F = BILL_DATE_4 (empty)
    // G = Payble_Amount_5 (empty)
    // H = PAID_AMOUNT_5 (advance amount)
    // I = TDS (empty)
    // J = BALANCE_AMOUNT_5 (advance remaining)
    // K = BANK_DETAILS_5
    // L = PAYMENT_MODE_5
    // M = PAYMENT_DETAILS_5
    // N = PAYMENT DATE_5
    // O = GRAND_TOTAL (empty)
    // P = Exp._Head → "Advance"

    const rowData = [
      timestamp,                              // A
      '',                                     // B
      '',                                      // C - Project Name
      String(VENDOR_NAME).trim(),             // D - Vendor
      '',                                     // E
      '',                                     // F
      '',                                     // G
      String(PAID_AMOUNT).trim(),             // H - Paid Amount
      '',                                     // I
      String(PAID_AMOUNT).trim(),             // J - Balance (same initially)
      String(BANK_DETAILS || '').trim(),      // K
      String(PAYMENT_MODE || '').trim(),      // L
      String(PAYMENT_DETAILS || '').trim(),   // M
      String(PAYMENT_DATE || '').trim(),      // N
      '',                                     // O
      'Advance',                              // P - Exp._Head = "Advance" ✅
    ];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: OfficeExpenseID,
      range: 'Payment_Sheet!A:P',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: { values: [rowData] },
    });

    console.log('✓ Advance → Payment_Sheet (P = Advance)');

    return res.json({
      success: true,
      message: 'Advance Payment added successfully',
      timestamp,
      updatedRange: response.data.updates?.updatedRange,
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