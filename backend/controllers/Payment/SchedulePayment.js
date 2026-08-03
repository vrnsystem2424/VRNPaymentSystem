


const express = require('express');
const { sheets, spreadsheetId } = require('../../config/googleSheet');
const router = express.Router();


router.get('/Schedule-Payment', async (req, res) => {
  try {
    // 1. Fetch FMS data (main source)
    const fmsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Copy of FMS!A8:AB',
    });
    const fmsRows = fmsResponse.data.values || [];

    if (fmsRows.length === 0) {
      return res.json({ success: true, data: [], note: "No data in FMS sheet" });
    }

    // 2. Fetch Bookings sheet → Booking ID (A) aur Amount Received (AN)
    const bookingsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Bookings!A:AN',
    });
    const bookingsRows = bookingsResponse.data.values || [];

    const bookingAmountMap = new Map();
    bookingsRows.forEach((row, idx) => {
      if (idx === 0) return;
      if (row.length < 40) return;
      let bookingId = (row[0] || '').trim().replace(/\s+/g, ' ');
      const amountReceived = (row[39] || '').trim();
      if (bookingId && amountReceived !== '') {
        bookingAmountMap.set(bookingId, amountReceived);
      }
    });

    console.log(`Bookings sheet se ${bookingAmountMap.size} valid records loaded`);

    // 3. Fetch Payment sheet → Done + Partial + Refund + WorkNotDone — AC tak
    const paymentsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Payment!A2:AC',
    });
    const paymentsRows = paymentsResponse.data.values || [];

    const paymentMap = new Map();

    paymentsRows.forEach(row => {
      if (row.length < 22) return;

      const bookingId = (row[0] || '').trim();
      const paymentId = (row[1] || '').trim();
      if (!bookingId || !paymentId) return;

      const key = `${paymentId}|${bookingId}`;
      if (!paymentMap.has(key)) paymentMap.set(key, []);

      // Net Amount — W column (index 22)
      const netAmountStr = (row[22] || '').trim().replace(/[^0-9.-]/g, '');
      const netAmount = parseFloat(netAmountStr);

      // Gross Amount — AB column (index 27)
      const grossAmountStr = (row[27] || '').trim().replace(/[^0-9.-]/g, '');
      const grossAmount = parseFloat(grossAmountStr);

      // Status — Q column (index 16)
      const statusFromQ = (row[16] || '').trim().toLowerCase();

      // AC column (index 28) — refund / worknotdone status override
      const statusFromAC = (row[28] || '').trim().toLowerCase();

      // Final status: AC column override agar refund ya worknotdone hai
      let finalStatus = statusFromQ;
      if (statusFromAC === 'refund' || statusFromAC === 'refund payment') {
        finalStatus = statusFromAC;
      } else if (statusFromAC === 'worknotdone' || statusFromAC === 'work not done') {
        finalStatus = 'worknotdone';
      }

      const amountToUse = netAmount > 0 ? netAmount : grossAmount;

      if (!isNaN(amountToUse) && amountToUse > 0) {
        paymentMap.get(key).push({
          previousReceviedAmountDate: (row[21] || '').trim(),
          PreviousAmount: netAmountStr || '0',
          grossAmount: grossAmountStr || '0',
          cgst: (row[25] || '0').trim(),
          sgst: (row[26] || '0').trim(),
          NextDate: (row[23] || '').trim(),
          previousRemark: (row[24] || '').trim(),
          status: finalStatus,
          statusAC: statusFromAC,
        });
      }
    });

    // 4. Fetch Scoring sheet → follow-up history (sirf pending)
    const scoringResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Scoring!A2:I',
    });
    const scoringRows = scoringResponse.data.values || [];

    const scoringMap = new Map();
    scoringRows.forEach(row => {
      if (row.length < 9) return;
      const bookingId = (row[1] || '').trim();
      const paymentId = (row[2] || '').trim();
      if (!bookingId || !paymentId) return;

      const key = `${paymentId}|${bookingId}`;
      if (!scoringMap.has(key)) scoringMap.set(key, []);

      scoringMap.get(key).push({
        timestamp: (row[0] || '').trim(),
        schedules: (row[3] || '').trim(),
        dateOfFollowup: (row[4] || '').trim(),
        nextDateOfFollowup: (row[5] || '').trim(),
        followupCount: (row[6] || '').trim(),
        remark: (row[7] || '').trim(),
        status: (row[8] || '').trim(),
      });
    });

    // 5. Combine everything - ✅ SKIP rows where V column is 'cancelled'
    const filteredData = fmsRows
      .filter(row => {
        // ✅ V column (index 21) - Skip if cancelled
        const vColumnStatus = (row[21] || '').toString().trim().toLowerCase();
        if (vColumnStatus === 'cancelled' || vColumnStatus === 'cancel') {
          return false;   // Skip this row - don't send to frontend
        }
        return true;
      })
      .map(row => {
        let bookingId = (row[0] || '').trim().replace(/\s+/g, ' ');
        const paymentId = (row[1] || '').trim();
        const key = `${paymentId}|${bookingId}`;
        const bookingAmount = bookingAmountMap.get(bookingId) || "-";

        return {
          Planned: (row[19] || '').trim(),
          bookingId,
          paymentId,
          applicantName: (row[2] || '').trim(),
          contact: (row[3] || '').trim(),
          email: (row[4] || '').trim(),
          CurrentAddress: (row[5] || '').trim(),
          agreementValue: (row[6] || '').trim(),
          bookingAmount,
          Project: (row[8] || '').trim(),
          unitCode: (row[9] || '').trim(),
          block: (row[10] || '').trim(),
          unitNo: (row[11] || '').trim(),
          unitType: (row[12] || '').trim(),
          size: (row[13] || '').trim(),
          projectType: (row[14] || '').trim(),
          Date: (row[15] || '').trim(),
          Amount: (row[16] || '').trim(),
          BalanceToRecive: (row[17] || '').trim(),
          SurPlusAmount: (row[18] || '').trim(),
          Actual: (row[18] || '').trim(),
          FollowUp: (row[26] || '').trim(),
          vStatus: (row[21] || '').trim(),   // ✅ For reference
          previousPayments: paymentMap.get(key) || [],
          followUpHistory: scoringMap.get(key) || [],
        };
      });

    console.log(`Total FMS rows: ${fmsRows.length}, After filtering cancelled: ${filteredData.length}`);

    res.json({
      success: true,
      data: filteredData,
      debug_summary: {
        totalFmsRows: fmsRows.length,
        activeRows: filteredData.length,
        cancelledSkipped: fmsRows.length - filteredData.length,
        bookings_records_loaded: bookingAmountMap.size,
        sample_booking_ids: Array.from(bookingAmountMap.keys()).slice(0, 5)
      }
    });

  } catch (error) {
    console.error('GET /Schedule-Payment error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch schedule payment data',
      details: error.message,
    });
  }
});



router.post('/update-Schedule-payment', async (req, res) => {
  try {
    const {
      paymentId = '',
      status = '',
      lastDateOfReceiving = '',
      amountReceived = '',
      nextDate = '',
      remark = '',
      bankName = '',
      paymentMode = '',
      paymentDetails = '',
      Planned = '',
      bookingId = '',
      applicantName = '',
      contact = '',
      email = '',
      CurrentAddress = '',
      agreementValue = '',
      bookingAmount = '',
      Project_Name = '',
      unitCode = '',
      block = '',
      unitNo = '',
      unitType = '',
      size = '',
      projectType = '',
      Date: submissionDate = '',
      gstPercent = '0',
      cgst = '0',
      sgst = '0',
      netAmount = '0',
      tdsAmount = '0'
    } = req.body;

    if (!paymentId?.trim() || !bookingId?.trim()) {
      return res.status(400).json({ success: false, message: 'paymentId aur bookingId zaroori hain' });
    }

    console.log('Request body:', req.body);

    const trimmedPaymentId = paymentId.trim();
    const targetBookingId = bookingId.trim();
    const normalizedStatus = (status || '').trim().toLowerCase();

    console.log(`Processing: paymentId=${trimmedPaymentId} | bookingId=${targetBookingId} | status=${normalizedStatus}`);

    let effectiveNextDate = (nextDate || '').trim();

    const doneStatuses = ['done', 'completed', 'paid', 'complete', 'refund', 'refund payment'];
    const isDone = doneStatuses.includes(normalizedStatus);
    const isRefund = normalizedStatus === 'refund' || normalizedStatus === 'refund payment';
    const isWorkNotDone = normalizedStatus === 'worknotdone' || normalizedStatus === 'work not done';
    const isCancelled = normalizedStatus === 'cancelled' || normalizedStatus === 'cancel';

    if (isWorkNotDone) {
      effectiveNextDate = tdsAmount || '0';
    } else if (isCancelled) {
      effectiveNextDate = '-';
    } else if (isDone) {
      effectiveNextDate = '-';
    } else if ((normalizedStatus === 'partial' || normalizedStatus === 'pending') && !effectiveNextDate.trim()) {
      console.warn(`Warning: ${normalizedStatus} status but nextDate is empty`);
    }

    const safeNetAmount = netAmount ? String(netAmount) : '0';
    const safeAmountReceived = amountReceived ? String(amountReceived) : '0';
    const safeCgst = cgst ? String(cgst) : '0';
    const safeSgst = sgst ? String(sgst) : '0';
    const safeTdsAmount = tdsAmount ? String(tdsAmount) : '0';

    // 1. FMS Update
    const fmsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Copy of FMS!A8:AB',
    });

    const fmsRows = fmsResponse.data.values || [];
    const fmsRowIndex = fmsRows.findIndex(row => (row[1] || '').trim() === trimmedPaymentId);

    let fmsRowNum = null;
    const fmsUpdates = [];
    let followupCount = '0';

    if (fmsRowIndex !== -1) {
      fmsRowNum = 8 + fmsRowIndex;
      const row = fmsRows[fmsRowIndex];

      followupCount = (row[25] || '0').trim();
      let newFollowup = parseInt(followupCount, 10) || 0;
      newFollowup += 1;
      followupCount = newFollowup.toString();

      if (isRefund) {
        // ─── REFUND FLOW ───
        const prevRefundInAB = parseFloat(row[27] || '0') || 0;
        const newRefundAmount = parseFloat(safeAmountReceived) || 0;
        const totalRefundAB = prevRefundInAB + newRefundAmount;

        const fields = [
          { col: 'V', val: normalizedStatus },
          { col: 'W', val: lastDateOfReceiving.trim() || '' },
          { col: 'Y', val: effectiveNextDate },
          { col: 'Z', val: remark?.trim() || '' },
          { col: 'AA', val: followupCount },
          { col: 'AB', val: totalRefundAB.toString() },
        ];

        fields.forEach(({ col, val }) => {
          fmsUpdates.push({ range: `Copy of FMS!${col}${fmsRowNum}`, values: [[val]] });
        });

        console.log(`REFUND → AB updated: total=${totalRefundAB}`);

      } else if (isWorkNotDone) {
        // ─── WORK NOT DONE FLOW ───
        const prevReceived = parseFloat(row[23] || '0') || 0;
        const newNetAmount = parseFloat(safeNetAmount) || 0;
        const totalReceived = prevReceived + newNetAmount;

        const fields = [
          { col: 'V', val: 'worknotdone' },
          { col: 'W', val: lastDateOfReceiving.trim() || '' },
          { col: 'X', val: totalReceived.toString() },
          { col: 'Y', val: safeTdsAmount },
          { col: 'Z', val: remark?.trim() || '' },
          { col: 'AA', val: followupCount },
        ];

        fields.forEach(({ col, val }) => {
          fmsUpdates.push({ range: `Copy of FMS!${col}${fmsRowNum}`, values: [[val]] });
        });

        console.log(`WORK NOT DONE → total=${totalReceived}`);

      } else if (isCancelled) {
        // ═══════════════════════════════════════════════════════════════
        // ✅ CANCELLED FLOW - Cancel ALL schedules of the same booking
        // ═══════════════════════════════════════════════════════════════
        console.log(`\n═══════════════════════════════════════`);
        console.log(`🚫 CANCELLED → Finding all schedules for booking: ${targetBookingId}`);

        // Find ALL rows with same booking ID (column A - index 0)
        const allBookingRows = [];
        fmsRows.forEach((row, idx) => {
          const rowBookingId = (row[0] || '').toString().trim().replace(/\s+/g, ' ');
          if (rowBookingId === targetBookingId) {
            const actualRowNum = 8 + idx;
            allBookingRows.push({
              rowNum:    actualRowNum,
              paymentId: (row[1] || '').toString().trim(),
              planned:   (row[19] || '').toString().trim(),
            });
          }
        });

        console.log(`📋 Found ${allBookingRows.length} schedules for booking ${targetBookingId}:`);
        allBookingRows.forEach(r => {
          console.log(`  → Row ${r.rowNum}: Payment ${r.paymentId} | Planned: ${r.planned}`);
        });

        // Mark V column = 'cancelled' for ALL these rows
        allBookingRows.forEach(({ rowNum }) => {
          fmsUpdates.push({
            range:  `Copy of FMS!V${rowNum}`,
            values: [['cancelled']],
          });
          fmsUpdates.push({
            range:  `Copy of FMS!W${rowNum}`,
            values: [[lastDateOfReceiving.trim() || '']],
          });
          fmsUpdates.push({
            range:  `Copy of FMS!Z${rowNum}`,
            values: [[remark?.trim() || 'Payment cancelled']],
          });
          fmsUpdates.push({
            range:  `Copy of FMS!AA${rowNum}`,
            values: [[followupCount]],
          });
        });

        console.log(`✅ ${allBookingRows.length} rows will be marked as 'cancelled'`);
        console.log(`═══════════════════════════════════════\n`);

      } else {
        // ─── NORMAL FLOW (Done / Partial / Pending) ───
        const prevReceived = parseFloat(row[23] || '0') || 0;
        const newNetAmount = parseFloat(safeNetAmount) || 0;
        const totalReceived = prevReceived + newNetAmount;

        const fields = [
          { col: 'V', val: normalizedStatus },
          { col: 'W', val: lastDateOfReceiving.trim() || '' },
          { col: 'X', val: totalReceived.toString() },
          { col: 'Y', val: effectiveNextDate },
          { col: 'Z', val: remark?.trim() || '' },
          { col: 'AA', val: followupCount },
        ];

        fields.forEach(({ col, val }) => {
          fmsUpdates.push({ range: `Copy of FMS!${col}${fmsRowNum}`, values: [[val]] });
        });

        console.log(`NORMAL → X: total=${totalReceived}`);
      }
    } else {
      followupCount = '1';
      console.log(`Payment ID not found in FMS: ${trimmedPaymentId}`);
    }

   
const shouldAppendPayment = isDone || normalizedStatus === 'partial' || isWorkNotDone || isRefund;

    if (shouldAppendPayment) {
      let acColumnValue = '';
      if (isRefund) acColumnValue = 'refund';
      if (isWorkNotDone) acColumnValue = 'worknotdone';

      const paymentRow = [
        targetBookingId,
        trimmedPaymentId,
        applicantName || '',
        contact || '',
        email || '',
        CurrentAddress || '',
        agreementValue || '',
        bookingAmount || '',
        Project_Name || '',
        unitCode || '',
        block || '',
        unitNo || '',
        unitType || '',
        size || '',
        (projectType || '').trim(),
        Planned || '',
        normalizedStatus || '',
        '',
        bankName?.trim() || '',
        paymentMode?.trim() || '',
        paymentDetails?.trim() || '',
        lastDateOfReceiving.trim() || '',
        safeNetAmount,
        effectiveNextDate,
        remark?.trim() || '',
        safeCgst,
        safeSgst,
        safeAmountReceived,
        acColumnValue,
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Payment!A:AC',
        valueInputOption: 'USER_ENTERED',
        resource: { values: [paymentRow] }
      });

      console.log(`Payment row appended for status: ${normalizedStatus}`);
    } else {
      console.log(`Skipping Payment append — status is ${normalizedStatus}`);
    }

    // 3. Scoring append — SIRF pending pe
    const shouldLogToScoring = normalizedStatus === 'pending';

    if (shouldLogToScoring) {
      const now = new Date();
      const timestamp = [
        String(now.getDate()).padStart(2, '0'),
        String(now.getMonth() + 1).padStart(2, '0'),
        now.getFullYear()
      ].join('/') + ' ' + [
        String(now.getHours()).padStart(2, '0'),
        String(now.getMinutes()).padStart(2, '0'),
        String(now.getSeconds()).padStart(2, '0')
      ].join(':');

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Scoring!A:I',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[
            timestamp,
            targetBookingId,
            trimmedPaymentId,
            projectType || '',
            Planned || '',
            effectiveNextDate,
            followupCount,
            remark || '',
            normalizedStatus
          ]]
        }
      });

      console.log(`Scoring row appended for pending status`);
    } else {
      console.log(`Skipping Scoring append — only pending status logs to Scoring sheet`);
    }

    // 4. FMS batch update
    if (fmsUpdates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        resource: {
          valueInputOption: 'USER_ENTERED',
          data: fmsUpdates
        }
      });

      console.log(`FMS batch update done: ${fmsUpdates.length} cell updates`);
    }

    // ✅ Custom message for cancelled (show count)
    let successMessage = 'Payment action recorded successfully';
    if (isRefund) successMessage = 'Refund processed successfully';
    else if (isWorkNotDone) successMessage = 'Work Not Done recorded successfully';
    else if (isCancelled) {
      // Count how many rows got cancelled
      const cancelCount = fmsUpdates.filter(u => u.range.includes('!V')).length;
      successMessage = `Booking cancelled successfully! ${cancelCount} schedule(s) marked as cancelled.`;
    }

    res.json({
      success: true,
      message: successMessage,
      paymentId: trimmedPaymentId,
      bookingId: targetBookingId,
      fmsRow: fmsRowNum || 'Not found',
      followupCount,
      status: normalizedStatus,
      isRefund,
      isWorkNotDone,
      isCancelled,
      nextDate: effectiveNextDate,
      lastDateReceived: lastDateOfReceiving || 'Not provided',
      cancelledSchedulesCount: isCancelled
        ? fmsUpdates.filter(u => u.range.includes('!V')).length
        : 0,
      gstDetails: {
        gstPercent: gstPercent || '0',
        cgst: safeCgst,
        sgst: safeSgst,
        netAmount: safeNetAmount,
        grossAmount: safeAmountReceived,
        tdsAmount: isWorkNotDone ? safeTdsAmount : '0'
      }
    });

  } catch (error) {
    console.error('POST /update-Schedule-payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

router.get('/project-bank-mapping', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Project_Data!B2:B',
    });

    const rows = response.data.values || [];

    if (rows.length === 0) {
      return res.json({ success: true, data: [], message: 'No project data found in Project_Data sheet' });
    }

    const projectBankList = rows
      .filter(row => row && row[0] && row[0].toString().trim() !== '')
      .map(row => ({
        project: (row[0] || '').trim(),
        bankAccount: (row[1] || '').trim() || '—',
      }))
      .sort((a, b) => a.project.localeCompare(b.project));

    const projectToBankMap = {};
    projectBankList.forEach(item => { projectToBankMap[item.project] = item.bankAccount; });

    res.json({
      success: true,
      data: projectBankList,
      projectToBankMap,
      count: projectBankList.length
    });

  } catch (error) {
    console.error('GET /project-bank-mapping error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project-bank mapping',
      details: error.message
    });
  }
});



// ══════════════════════════════════════════════════════════════════════════
// GET: Search Bookings for Ledger (Autocomplete)
// ══════════════════════════════════════════════════════════════════════════
router.get('/ledger-search', async (req, res) => {
  try {
    const { query = '' } = req.query;
    const searchTerm = query.toString().trim().toLowerCase();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Bookings!A2:AE',
    });

    const rows = response.data.values || [];

    if (rows.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const allBookings = rows.map((row) => ({
      bookingId:        (row[0]  || '').toString().trim(),
      applicationDate:  (row[1]  || '').toString().trim(),
      applicantName:    (row[2]  || '').toString().trim(),
      fatherHusbandName:(row[3]  || '').toString().trim(),
      contact:          (row[4]  || '').toString().trim(),
      email:            (row[5]  || '').toString().trim(),
      currentAddress:   (row[6]  || '').toString().trim(),
      panCard:          (row[7]  || '').toString().trim(),
      aadharCard:       (row[8]  || '').toString().trim(),
      project:          (row[9]  || '').toString().trim(),
      product:          (row[10] || '').toString().trim(),
      block:            (row[11] || '').toString().trim(),
      unitNo:           (row[12] || '').toString().trim(),
      unitType:         (row[13] || '').toString().trim(),
      sizeInSqft:       (row[14] || '').toString().trim(),
      perSqftRate:      (row[15] || '').toString().trim(),
      unitCode:         (row[16] || '').toString().trim(),
    })).filter(b => b.bookingId);

    let filtered = allBookings;
    if (searchTerm) {
      filtered = allBookings.filter((b) =>
        b.bookingId.toLowerCase().includes(searchTerm)     ||
        b.applicantName.toLowerCase().includes(searchTerm) ||
        b.contact.toLowerCase().includes(searchTerm)       ||
        b.email.toLowerCase().includes(searchTerm)         ||
        b.unitNo.toLowerCase().includes(searchTerm)        ||
        b.unitCode.toLowerCase().includes(searchTerm)      ||
        b.project.toLowerCase().includes(searchTerm)
      );
    }

    res.json({
      success: true,
      data: filtered.slice(0, 50),
    });

  } catch (error) {
    console.error('GET /ledger-search error:', error);
    res.status(500).json({
      success: false,
      error:   'Failed to search bookings',
      details: error.message,
    });
  }
});

// ══════════════════════════════════════════════════════════════════════════
// GET: Get Full Ledger Data for a Booking
// ══════════════════════════════════════════════════════════════════════════
router.get('/ledger-data/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const trimmedBookingId = bookingId.trim();

    if (!trimmedBookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required',
      });
    }

    const bookingsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Bookings!A2:AE',
    });
    const bookingsRows = bookingsResponse.data.values || [];

    const bookingRow = bookingsRows.find(
      (r) => (r[0] || '').toString().trim() === trimmedBookingId
    );

    if (!bookingRow) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    const bookingDetails = {
      bookingId:            (bookingRow[0]  || '').toString().trim(),
      applicationDate:      (bookingRow[1]  || '').toString().trim(),
      applicantName:        (bookingRow[2]  || '').toString().trim(),
      fatherHusbandName:    (bookingRow[3]  || '').toString().trim(),
      contact:              (bookingRow[4]  || '').toString().trim(),
      email:                (bookingRow[5]  || '').toString().trim(),
      currentAddress:       (bookingRow[6]  || '').toString().trim(),
      panCard:              (bookingRow[7]  || '').toString().trim(),
      aadharCard:           (bookingRow[8]  || '').toString().trim(),
      project:              (bookingRow[9]  || '').toString().trim(),
      product:              (bookingRow[10] || '').toString().trim(),
      block:                (bookingRow[11] || '').toString().trim(),
      unitNo:               (bookingRow[12] || '').toString().trim(),
      unitType:             (bookingRow[13] || '').toString().trim(),
      sizeInSqft:           (bookingRow[14] || '').toString().trim(),
      perSqftRate:          (bookingRow[15] || '').toString().trim(),
      unitCode:             (bookingRow[16] || '').toString().trim(),
      basicPrice:           (bookingRow[17] || '').toString().trim(),
      discount:             (bookingRow[18] || '').toString().trim(),
      waterCharges:         (bookingRow[19] || '').toString().trim(),
      electricalCharges:    (bookingRow[20] || '').toString().trim(),
      maintenance:          (bookingRow[21] || '').toString().trim(),
      parkFacingCharges:    (bookingRow[22] || '').toString().trim(),
      cornerFacingCharges:  (bookingRow[23] || '').toString().trim(),
      gst:                  (bookingRow[24] || '').toString().trim(),
      agreementValue:       (bookingRow[25] || '').toString().trim(),
      bookingAmount:        (bookingRow[26] || '').toString().trim(),
      balanceToReceive:     (bookingRow[27] || '').toString().trim(),
      paymentType:          (bookingRow[28] || '').toString().trim(),
      noOfSchedules:        (bookingRow[29] || '').toString().trim(),
      invoiceNumber:        (bookingRow[30] || '').toString().trim(),
    };

    const paymentsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Payment!A2:AC',
    });
    const paymentsRows = paymentsResponse.data.values || [];

    const paymentHistory = paymentsRows
      .filter((row) => (row[0] || '').toString().trim() === trimmedBookingId)
      .map((row) => {
        const netAmountStr   = (row[22] || '').toString().trim().replace(/[^0-9.-]/g, '');
        const grossAmountStr = (row[27] || '').toString().trim().replace(/[^0-9.-]/g, '');
        const statusFromQ    = (row[16] || '').toString().trim().toLowerCase();
        const statusFromAC   = (row[28] || '').toString().trim().toLowerCase();

        let finalStatus = statusFromQ;
        if (statusFromAC === 'refund' || statusFromAC === 'refund payment') {
          finalStatus = 'refund';
        } else if (statusFromAC === 'worknotdone' || statusFromAC === 'work not done') {
          finalStatus = 'worknotdone';
        }

        return {
          bookingId:      (row[0]  || '').toString().trim(),
          paymentId:      (row[1]  || '').toString().trim(),
          planned:        (row[15] || '').toString().trim(),
          status:         finalStatus,
          bankName:       (row[18] || '').toString().trim(),
          paymentMode:    (row[19] || '').toString().trim(),
          paymentDetails: (row[20] || '').toString().trim(),
          dateOfReceiving:(row[21] || '').toString().trim(),
          netAmount:      parseFloat(netAmountStr)   || 0,
          nextDateOrTds:  (row[23] || '').toString().trim(),
          remark:         (row[24] || '').toString().trim(),
          cgst:           parseFloat((row[25] || '0').toString().replace(/[^0-9.-]/g, '')) || 0,
          sgst:           parseFloat((row[26] || '0').toString().replace(/[^0-9.-]/g, '')) || 0,
          grossAmount:    parseFloat(grossAmountStr) || 0,
        };
      });

    const totalGrossReceived = paymentHistory
      .filter((p) => p.status !== 'refund')
      .reduce((s, p) => s + p.grossAmount, 0);

    const totalNetReceived = paymentHistory
      .filter((p) => p.status !== 'refund')
      .reduce((s, p) => s + p.netAmount, 0);

    const totalRefunded = paymentHistory
      .filter((p) => p.status === 'refund')
      .reduce((s, p) => s + p.grossAmount, 0);

    const totalCgst = paymentHistory
      .filter((p) => p.status !== 'refund')
      .reduce((s, p) => s + p.cgst, 0);

    const totalSgst = paymentHistory
      .filter((p) => p.status !== 'refund')
      .reduce((s, p) => s + p.sgst, 0);

    const agreementValueNum = parseFloat(
      (bookingDetails.agreementValue || '0').toString().replace(/[^0-9.-]/g, '')
    ) || 0;

    const netReceived = totalGrossReceived - totalRefunded;
    const balanceDue  = Math.max(0, agreementValueNum - netReceived);

    res.json({
      success: true,
      data: {
        booking:         bookingDetails,
        paymentHistory:  paymentHistory.sort((a, b) => {
          const parseD = (d) => {
            if (!d) return 0;
            if (d.includes('/')) {
              const [dd, mm, yyyy] = d.split('/');
              return new Date(yyyy, mm - 1, dd).getTime();
            }
            return new Date(d).getTime();
          };
          return parseD(a.dateOfReceiving) - parseD(b.dateOfReceiving);
        }),
        summary: {
          agreementValue:    agreementValueNum,
          totalGrossReceived,
          totalNetReceived,
          totalRefunded,
          totalCgst,
          totalSgst,
          netReceived,
          balanceDue,
          paymentCount:      paymentHistory.length,
        },
      },
    });

  } catch (error) {
    console.error('GET /ledger-data error:', error);
    res.status(500).json({
      success: false,
      error:   'Failed to fetch ledger data',
      details: error.message,
    });
  }
});


module.exports = router;