
const express = require('express');
const { sheets, RECONCILITION_ID } = require('../../config/googleSheet');
const router = express.Router();



router.get('/Bank-Interest-Dropdown-Data', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId:RECONCILITION_ID,
      range: 'Project_Data!A2:B',  
    });

    const rows = response.data.values || [];
    
    // Column A - Project Names
    const projectNames = rows
      .map(row => row[0]?.toString().trim())
      .filter(val => val);

    // Column B - Bank Accounts
    const accounts = rows
      .map(row => row[1]?.toString().trim())
      .filter(val => val);

    res.json({
      success: true,
      projectNames,  
      accounts
    });

  } catch (error) {
    console.error('Error fetching dropdown data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dropdown data',
      error: error.message
    });
  }
});

// POST - Add Bank Interest & Charges Data
// router.post('/Bank-Interest-Add', async (req, res) => {
//   try {
//     const {
//       projectName,
//       bankPayment,
//       chargesInterestDetails,
//       bankName,
//       amount,
//       paymentMode,
//       paymentDate,
//       remark
//     } = req.body;

//     // Validation
//     if (
//       !projectName ||
//       !bankPayment ||
//       !chargesInterestDetails ||
//       !bankName ||
//       !amount ||
//       !paymentMode ||
//       !paymentDate
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: 'Required fields: projectName, bankPayment, chargesInterestDetails, bankName, amount, paymentMode, paymentDate'
//       });
//     }

//     const existingData = await sheets.spreadsheets.values.get({
//       spreadsheetId: RECONCILITION_ID,
//       range: 'Bank_Intrest_&_Charges!A2:K',
//     });

//     const rows = existingData.data.values || [];

//     // UID generation (Column B = index 1)
//     let maxUID = 0;
//     rows.forEach(row => {
//       const uid = row[1]?.toString().trim();
//       if (uid) {
//         const num = parseInt(uid, 10);
//         if (!isNaN(num) && num > maxUID) {
//           maxUID = num;
//         }
//       }
//     });

//     const newUID = String(maxUID + 1).padStart(4, '0');

//     const uidExists = rows.some(row => row[1]?.toString().trim() === newUID);
//     if (uidExists) {
//       return res.status(400).json({
//         success: false,
//         message: `UID ${newUID} already exists in sheet`
//       });
//     }

//     // PAYMENT_DETAILS generation (Column I = index 8) ✅ fixed
//     let maxPaymentNum = 0;
//     rows.forEach(row => {
//       const paymentDetails = row[8]?.toString().trim();
//       if (paymentDetails && paymentDetails.startsWith('IC')) {
//         const num = parseInt(paymentDetails.replace('IC', ''), 10);
//         if (!isNaN(num) && num > maxPaymentNum) {
//           maxPaymentNum = num;
//         }
//       }
//     });

//     const newPaymentDetails = 'IC' + String(maxPaymentNum + 1).padStart(4, '0');

//     const paymentDetailsExists = rows.some(
//       row => row[8]?.toString().trim() === newPaymentDetails
//     );

//     if (paymentDetailsExists) {
//       return res.status(400).json({
//         success: false,
//         message: `PAYMENT_DETAILS ${newPaymentDetails} already exists in sheet`
//       });
//     }

//     // India timestamp
//     const indiaTime = new Date().toLocaleString('en-GB', {
//       timeZone: 'Asia/Kolkata',
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit',
//       hour12: false
//     }).replace(',', '');

//     const newRow = [
//       indiaTime,              // A
//       newUID,                 // B
//       projectName,            // C
//       bankPayment,            // D
//       chargesInterestDetails, // E
//       bankName,               // F
//       amount,                 // G
//       paymentMode,            // H
//       newPaymentDetails,      // I
//       paymentDate,            // J
//       remark || ''            // K
//     ];

//     await sheets.spreadsheets.values.append({
//       spreadsheetId: RECONCILITION_ID,
//       range: 'Bank_Intrest_&_Charges!A2:K',
//       valueInputOption: 'USER_ENTERED',
//       insertDataOption: 'INSERT_ROWS',
//       requestBody: {
//         values: [newRow]
//       }
//     });

//     res.status(201).json({
//       success: true,
//       message: 'Data added successfully',
//       data: {
//         timestamp: indiaTime,
//         uid: newUID,
//         projectName,
//         bankPayment,
//         chargesInterestDetails,
//         bankName,
//         amount,
//         paymentMode,
//         paymentDetails: newPaymentDetails,
//         paymentDate,
//         remark: remark || ''
//       }
//     });

//   } catch (error) {
//     console.error('Error adding bank interest data:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to add data',
//       error: error.message
//     });
//   }
// });


router.post('/Bank-Interest-Add', async (req, res) => {
  try {
    const {
      projectName,
      bankPayment,
      chargesInterestDetails,
      bankName,
      amount,
      paymentMode,
      paymentDate,
      remark
    } = req.body;

    // Validation
    if (
      !projectName ||
      !bankPayment ||
      !chargesInterestDetails ||
      !bankName ||
      !amount ||
      !paymentMode ||
      !paymentDate
    ) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: projectName, bankPayment, chargesInterestDetails, bankName, amount, paymentMode, paymentDate'
      });
    }

    // Fetch existing data - large range taaki saari rows aayein (empty bhi)
    const existingData = await sheets.spreadsheets.values.get({
      spreadsheetId: RECONCILITION_ID,
      range: 'Bank_Intrest_&_Charges!A2:K1000',
    });

    const rows = existingData.data.values || [];

    // UID generation (Column B = index 1) - sirf filled rows se
    let maxUID = 0;
    rows.forEach(row => {
      const uid = row[1]?.toString().trim();
      if (uid) {
        const num = parseInt(uid, 10);
        if (!isNaN(num) && num > maxUID) {
          maxUID = num;
        }
      }
    });

    const newUID = String(maxUID + 1).padStart(4, '0');

    const uidExists = rows.some(row => row[1]?.toString().trim() === newUID);
    if (uidExists) {
      return res.status(400).json({
        success: false,
        message: `UID ${newUID} already exists in sheet`
      });
    }

    // PAYMENT_DETAILS generation (Column I = index 8)
    let maxPaymentNum = 0;
    rows.forEach(row => {
      const paymentDetails = row[8]?.toString().trim();
      if (paymentDetails && paymentDetails.startsWith('IC')) {
        const num = parseInt(paymentDetails.replace('IC', ''), 10);
        if (!isNaN(num) && num > maxPaymentNum) {
          maxPaymentNum = num;
        }
      }
    });

    const newPaymentDetails = 'IC' + String(maxPaymentNum + 1).padStart(4, '0');

    const paymentDetailsExists = rows.some(
      row => row[8]?.toString().trim() === newPaymentDetails
    );

    if (paymentDetailsExists) {
      return res.status(400).json({
        success: false,
        message: `PAYMENT_DETAILS ${newPaymentDetails} already exists in sheet`
      });
    }

    // India timestamp
    const indiaTime = new Date().toLocaleString('en-GB', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(',', '');

    const newRow = [
      indiaTime,              // A
      newUID,                 // B
      projectName,            // C
      bankPayment,            // D
      chargesInterestDetails, // E
      bankName,               // F
      amount,                 // G
      paymentMode,            // H
      newPaymentDetails,      // I
      paymentDate,            // J
      remark || ''            // K
    ];

    // ✅ Pehli empty row dhundho (jisme Column A bhi empty ho)
    let emptyRowIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      // Row bilkul empty ho ya Column A empty ho
      const isEmptyRow = !row || row.length === 0 || !row[0]?.toString().trim();
      if (isEmptyRow) {
        emptyRowIndex = i;
        break;
      }
    }

    let targetRowNumber;

    if (emptyRowIndex !== -1) {
      // ✅ Empty row mili - Row number = emptyRowIndex + 2 (1 for header, 1 for 0-index)
      targetRowNumber = emptyRowIndex + 2;

      await sheets.spreadsheets.values.update({
        spreadsheetId: RECONCILITION_ID,
        range: `Bank_Intrest_&_Charges!A${targetRowNumber}:K${targetRowNumber}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [newRow]
        }
      });

    } else {
      // ✅ Koi empty row nahi mili - sabse neeche nayi row add karo
      // Last filled row ke baad row number
      targetRowNumber = rows.length + 2;

      await sheets.spreadsheets.values.update({
        spreadsheetId: RECONCILITION_ID,
        range: `Bank_Intrest_&_Charges!A${targetRowNumber}:K${targetRowNumber}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [newRow]
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Data added successfully',
      data: {
        timestamp: indiaTime,
        uid: newUID,
        projectName,
        bankPayment,
        chargesInterestDetails,
        bankName,
        amount,
        paymentMode,
        paymentDetails: newPaymentDetails,
        paymentDate,
        remark: remark || ''
      }
    });

  } catch (error) {
    console.error('Error adding bank interest data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add data',
      error: error.message
    });
  }
});

module.exports = router;