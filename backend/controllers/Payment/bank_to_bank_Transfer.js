const express = require('express');
const { sheets, RECONCILITION_ID } = require('../../config/googleSheet');
const router = express.Router();



router.get('/GET-Actual-Transfer-In-Out', async (req, res) => {
  try {
    // Fetch columns A to L starting from row 7 (A7:L)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId : RECONCILITION_ID,
      range: 'A/C To A/C Transfer!A7:M',
    });

    let rows = response.data.values || [];

    if (rows.length === 0) {
      return res.json({ success: true, data: [] });
    }

  
    const filteredData = rows
     .filter(row => row[11] && !row[12])
      .map(row => ({
        timestamp: (row[0] || '').toString().trim(),
        uid: (row[1] || '').toString().trim(),
        Transfer_A_C_Name: (row[2] || '').toString().trim(),
        Transfer_Received_A_C_Name: (row[3] || '').toString().trim(),
        Amount: (row[4] || '').toString().trim(),
        PaymentMode: (row[5] || '').toString().trim(),
        PAYMENT_DETAILS: (row[6] || '').toString().trim(),
        PAYMENT_DATE: (row[7] || '').toString().trim(),
        Remark:(row[8] || '').toString().trim(),
        planned2: (row[11] || '').toString().trim(),
        actual2: (row[12] || '').toString().trim(),
      }));

    res.json({ success: true, data: filteredData });
  } catch (error) {
    console.error('GET /GET-Actual-Transfer-In-Out:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch data' });
  }
});



router.post('/update-Actual-bank-To-bank', async (req, res) => {
  console.log('Received body:', req.body); // Debug

  try {
    const { UID, status, remark } = req.body;

    if (!UID || !UID.trim()) {
      return res.status(400).json({ success: false, message: 'UID is required' });
    }

    const trimmedUID = UID.trim().toUpperCase(); // IN001 ko consistent banane ke liye

    // Sheet se UID column (B7 se neeche) fetch karo
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId : RECONCILITION_ID,
      range: 'A/C To A/C Transfer!B7:B', // Sirf UID column
    });

    const uidRows = response.data.values || [];

    // UID match karne wali row ka index find karo
    const rowIndex = uidRows.findIndex(row => {
      if (!row[0]) return false;
      return row[0].toString().trim().toUpperCase() === trimmedUID;
    });

    if (rowIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Row not found with this UID',
        searchedUID: UID 
      });
    }

    const sheetRowNumber = 7 + rowIndex; // Actual row number in sheet

    // Status (Column O) aur Remark (Column Q) update karo
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId : RECONCILITION_ID,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data: [
          { range: `A/C To A/C Transfer!N${sheetRowNumber}`, values: [[status || '']] },
          { range: `A/C To A/C Transfer!P${sheetRowNumber}`, values: [[remark || '']] }
        ]
      }
    });

    res.json({ 
      success: true, 
      message: 'Actual Bank In updated successfully',
      updatedUID: UID,
      row: sheetRowNumber
    });

  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});


module.exports = router;