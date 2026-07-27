
const express = require('express');
const { sheets, RECONCILITION_ID } = require('../../config/googleSheet')
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
    console.log('H3 Value:', bankClosingBalance);

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
  console.log('═══════════════════════════════════');
  console.log('📥 FULL req.body:', JSON.stringify(req.body, null, 2));
  console.log('📥 KEYS:', Object.keys(req.body || {}));
  console.log('═══════════════════════════════════');

  try {
    const {
      particulars,                      // B column
      paidAmount,                       // G column
      paymentDetails,                   // D column
      bankDetails,                      // C column
      bankClosingBalanceAfterPayment,   // F column
      status,                           // E column
      remark,                           // (optional)
      paymentDate,                      // ✅ NEW - H column
    } = req.body;

    console.log('🟢 particulars:', particulars);
    console.log('🟢 paidAmount:', paidAmount);
    console.log('🟢 paymentDate:', paymentDate);

    // ── Validation ──────────────────────────────────────────────────────
    if (!paymentDetails?.toString().trim() || !bankDetails?.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: 'paymentDetails and bankDetails are required',
      });
    }

    // ── Timestamp (IST) ──────────────────────────────────────────────────
    const now = new Date();
    const dd   = String(now.getDate()).padStart(2, '0');
    const mm   = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const hh   = String(now.getHours()).padStart(2, '0');
    const min  = String(now.getMinutes()).padStart(2, '0');
    const ss   = String(now.getSeconds()).padStart(2, '0');
    const timeStamp = `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;

    // ── Format Payment Date (YYYY-MM-DD → DD/MM/YYYY) for H Column ──────
    let formattedPaymentDate = '';
    if (paymentDate && paymentDate.toString().trim()) {
      const rawDate = paymentDate.toString().trim();
      if (rawDate.includes('-') && rawDate.split('-')[0].length === 4) {
        // YYYY-MM-DD → DD/MM/YYYY
        const [y, mo, d] = rawDate.split('-');
        formattedPaymentDate = `${d}/${mo}/${y}`;
      } else {
        formattedPaymentDate = rawDate;
      }
    }

    console.log('📅 Payment Date (H column):', formattedPaymentDate);

    // ── Find Next Empty Row ──────────────────────────────────────────────
    const actualOutResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: RECONCILITION_ID,
      range: 'Actual Out!A5:H',              // ✅ Range extended to H
    });

    const existingRows  = actualOutResponse.data.values || [];
    const nextRowNumber = 5 + existingRows.length;

    console.log('📍 Writing to row:', nextRowNumber);

    // ── Row Data (A to H) ────────────────────────────────────────────────
    const rowData = [
      timeStamp,                                              // A - Timestamp
      String(particulars || '').trim(),                       // B - Particulars
      String(bankDetails || '').trim(),                       // C - Bank Detail
      String(paymentDetails || '').trim(),                    // D - Payment Detail
      String(status || '').trim(),                            // E - Status
      String(bankClosingBalanceAfterPayment || '').trim(),    // F - Closing Balance
      String(paidAmount || '').trim(),                        // G - Paid Amount
      formattedPaymentDate,                                   // H - Payment Date ✅
    ];

    console.log('📝 Row data being written:', rowData);

    // ── Write to Sheet ───────────────────────────────────────────────────
    await sheets.spreadsheets.values.update({
      spreadsheetId: RECONCILITION_ID,
      range: `Actual Out!A${nextRowNumber}:H${nextRowNumber}`,   // ✅ A to H
      valueInputOption: 'USER_ENTERED',
      resource: { values: [rowData] },
    });

    console.log('✅ Saved successfully');

    res.json({
      success: true,
      message: `Saved at row ${nextRowNumber}`,
      row:     nextRowNumber,
      savedData: {
        A_TimeStamp:      timeStamp,
        B_Particulars:    particulars,
        C_BankDetail:     bankDetails,
        D_PaymentDetail:  paymentDetails,
        E_Status:         status,
        F_ClosingBalance: bankClosingBalanceAfterPayment,
        G_PaidAmount:     paidAmount,
        H_PaymentDate:    formattedPaymentDate,
      },
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save data',
      error:   error.message,
    });
  }
});

module.exports = router;