const express = require('express');
const router = express.Router();
const { sheets, OfficeExpenseID } = require('../../config/googleSheet'); // path adjust karo

// ─── GET Route - Dropdown Data (A, L, M columns) ─────────────
router.get('/Get-Advance-Dropdown', async (req, res) => {
  try {
    if (!OfficeExpenseID) {
      return res.status(500).json({
        success: false,
        error: 'spreadsheetId is not configured',
      });
    }

    // Sirf A se M tak fetch karo (B-K wagaira beech wala bhi aayega, but use sirf A, L, M)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: OfficeExpenseID,
      range: 'Project_Data!A3:M',
    });

    const rows = response.data.values || [];

    if (rows.length === 0) {
      return res.json({
        success: true,
        type: 'dropdown',
        data: {
          bankNames: [],
          projectNames: [],
          vendorNames: [],
        },
      });
    }

    // ── Extract & deduplicate column data ──────────────────
    const bankNamesSet    = new Set();
    const projectNamesSet = new Set();
    const vendorNamesSet  = new Set();

    rows.forEach((row) => {
      const bank    = (row[0]  || '').toString().trim();  // A column - index 0
      const project = (row[11] || '').toString().trim();  // L column - index 11
      const vendor  = (row[12] || '').toString().trim();  // M column - index 12

      if (bank)    bankNamesSet.add(bank);
      if (project) projectNamesSet.add(project);
      if (vendor)  vendorNamesSet.add(vendor);
    });

    // Convert sets to sorted arrays
    const bankNames    = [...bankNamesSet].sort();
    const projectNames = [...projectNamesSet].sort();
    const vendorNames  = [...vendorNamesSet].sort();

    return res.json({
      success: true,
      type: 'dropdown',
      data: {
        bankNames,
        projectNames,
        vendorNames,
      },
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

// ─── POST Route - Add new advance payment entry ──────────────
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

    console.log('=== Advance Payment POST Request ===');
    console.log('Body:', req.body);

    // Validation
    if (!Project_Name || !VENDOR_NAME || !PAID_AMOUNT) {
      return res.status(400).json({
        success: false,
        message: 'Project_Name, VENDOR_NAME aur PAID_AMOUNT mandatory hain',
      });
    }

    // Auto timestamp
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timestamp = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    // Row data (A to H)
    const rowData = [
      timestamp,                              // A - Timestamp
      String(Project_Name).trim(),           // B - Project_Name
      String(VENDOR_NAME).trim(),            // C - VENDOR_NAME
      String(PAID_AMOUNT).trim(),            // D - PAID_AMOUNT
      String(BANK_DETAILS || '').trim(),     // E - BANK_DETAILS
      String(PAYMENT_MODE || '').trim(),     // F - PAYMENT_MODE
      String(PAYMENT_DETAILS || '').trim(),  // G - PAYMENT_DETAILS
      String(PAYMENT_DATE || '').trim(),     // H - PAYMENT_DATE
    ];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: OfficeExpenseID,
      range: 'Advance_Payment!A:H',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: { values: [rowData] },
    });

    console.log('✓ Advance Payment added successfully');

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