
const express = require('express');
const { sheets, RECONCILITION_ID } = require('../../config/googleSheet');
const router = express.Router();

router.get('/payment-Reconsilation', async (req, res) => {
  try {
    // Fetch columns A to L starting from row 7 (A7:L)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId : RECONCILITION_ID,
      range: 'Out_FMS!A8:M',
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
        contractorName: (row[2] || '').toString().trim(),
        paidAmount: (row[3] || '').toString().trim(),
        bankDetails: (row[4] || '').toString().trim(),
        paymentMode: (row[5] || '').toString().trim(),
        paymentDetails: (row[6] || '').toString().trim(),
        paymentDate: (row[7] || '').toString().trim(),
        ExpHead: (row[8] || '').toString().trim(),
        planned2: (row[11] || '').toString().trim(),
        actual2: (row[12] || '').toString().trim(),
      }));

    res.json({ success: true, data: filteredData });
  } catch (error) {
    console.error('GET /payment-Reconsilation:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch data' });
  }
});

router.get('/bank-balance/:bankName', async (req, res) => {
  try {
    const { bankName } = req.params;
    console.log('Requested Bank:', bankName);

    // Sheet name ko single quotes mein wrap karo (safe way)
    const range = `'${bankName}'!H3`;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId : RECONCILITION_ID,
      range,
    });

    const bankClosingBalance = response.data.values?.[0]?.[0] || 'Not Found';

    console.log('Fetched Range:', range);
    console.log('F3 Value:', bankClosingBalance);

    // Hamesha success: true bhejo agar koi error nahi hai
    res.status(200).json({
      success: true,
      bankName: bankName,
      bankClosingBalance: bankClosingBalance.toString().trim(),
    });
  } catch (error) {
    console.error('Bank balance API error:', error.message);
    // Agar error hai tabhi success: false bhejo
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bank balance',
      error: error.message,
    });
  }
});





router.post('/update-reconciliation', async (req, res) => {
  console.log('Received body:', req.body);

  try {
    const {
      paymentDetails,
      bankDetails,                      // ← नया field
      bankClosingBalanceAfterPayment,
      status,
      remark
    } = req.body;

    if (!paymentDetails?.trim() || !bankDetails?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Both Payment Details and Bank Details are required'
      });
    }

    const trimmedPayment = paymentDetails.trim().toLowerCase();
    const trimmedBank    = bankDetails.trim().toLowerCase();

    // Google Sheet से data लाओ
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId : RECONCILITION_ID,
      range: 'Out_FMS!A7:Q',   // या जितना ज़रूरी हो
    });

    const rows = response.data.values || [];

    // दोनों conditions match करने वाली row ढूंढो
    const rowIndex = rows.findIndex(row => {
      const sheetPayment = (row[6] || '').toString().trim().toLowerCase();  // column G → index 6
      const sheetBank    = (row[4] || '').toString().trim().toLowerCase();  // column E → index 4 (Bank name वाला column)

      return sheetPayment === trimmedPayment && sheetBank === trimmedBank;
    });

    if (rowIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'No matching row found with both Payment Details and Bank Details',
        searchedPayment: trimmedPayment,
        searchedBank: trimmedBank
      });
    }

    const sheetRowNumber = 7 + rowIndex;  // A7 से शुरू है
    console.log(`Matched row: ${sheetRowNumber} (0-based index ${rowIndex})`);

    // अब update करो (एक-एक करके safe तरीके से)

    // Column P → Bank Closing Balance After Payment
    await sheets.spreadsheets.values.update({
      spreadsheetId : RECONCILITION_ID,
      range: `Out_FMS!P${sheetRowNumber}`,
      valueInputOption: 'RAW',
      resource: { values: [[bankClosingBalanceAfterPayment || '']] }
    });

    // Column N → Status
    await sheets.spreadsheets.values.update({
      spreadsheetId : RECONCILITION_ID,
      range: `Out_FMS!N${sheetRowNumber}`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [[status || '']] }
    });

    // Column Q → Remark
    await sheets.spreadsheets.values.update({
      spreadsheetId : RECONCILITION_ID,
      range: `Out_FMS!Q${sheetRowNumber}`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [[remark || '']] }
    });

    res.json({
      success: true,
      message: `Row ${sheetRowNumber} updated successfully`,
      row: sheetRowNumber,
      updatedFields: {
        P: bankClosingBalanceAfterPayment,
        N: status,
        Q: remark
      }
    });

  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Update failed',
      error: error.message
    });
  }
});



module.exports = router;