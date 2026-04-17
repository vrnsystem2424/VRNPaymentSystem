const express = require('express');
const { sheets, RECONCILITION_ID } = require('../../config/googleSheet');
const router = express.Router();

const { Readable } = require('stream');

// ─────────────────────────────────────────────────────────────
// Helper: Convert any date format to DD/MM/YYYY
// ─────────────────────────────────────────────────────────────
function formatDateToDDMMYYYY(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return '';

  const trimmed = dateStr.trim();
  if (!trimmed) return '';

  const ddmmyyyy = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddmmyyyy) return trimmed;

  const ddmmyyyyDash = trimmed.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (ddmmyyyyDash) return `${ddmmyyyyDash[1]}/${ddmmyyyyDash[2]}/${ddmmyyyyDash[3]}`;

  const yyyymmdd = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (yyyymmdd) return `${yyyymmdd[3]}/${yyyymmdd[2]}/${yyyymmdd[1]}`;

  const yyyymmddSlash = trimmed.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  if (yyyymmddSlash) return `${yyyymmddSlash[3]}/${yyyymmddSlash[2]}/${yyyymmddSlash[1]}`;

  const parsed = new Date(trimmed);
  if (!isNaN(parsed)) {
    return `${String(parsed.getDate()).padStart(2, '0')}/${String(parsed.getMonth() + 1).padStart(2, '0')}/${parsed.getFullYear()}`;
  }

  return trimmed;
}

// ─────────────────────────────────────────────────────────────
// IST Timestamp Helper
// ─────────────────────────────────────────────────────────────
function getISTTimestamp() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);

  const dd = String(istDate.getUTCDate()).padStart(2, '0');
  const mm = String(istDate.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = istDate.getUTCFullYear();
  const hh = String(istDate.getUTCHours()).padStart(2, '0');
  const min = String(istDate.getUTCMinutes()).padStart(2, '0');
  const ss = String(istDate.getUTCSeconds()).padStart(2, '0');

  return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
}

// ─────────────────────────────────────────────────────────────
// UID Generator: A/C To A/C Transfer → TRFXXX
// ─────────────────────────────────────────────────────────────
async function generateUniqueUID() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId : RECONCILITION_ID,
      range: 'A/C To A/C Transfer!B7:B',
    });

    const values = response.data.values;

    if (!values || values.length === 0) {
      return 'TRF00001';
    }

    const lastUID = values[values.length - 1][0];

    if (!lastUID || !lastUID.startsWith('TRF')) {
      return 'TRF00001';
    }

    const lastNumber = parseInt(lastUID.replace('TRF', ''), 10);
    const nextNumber = lastNumber + 1;
    return `TRF${String(nextNumber).padStart(5, '0')}`;
  } catch (error) {
    console.error('Error generating Transfer UID:', error);
    return 'TRF00001';
  }
}

// ─────────────────────────────────────────────────────────────
// UID Generator: Capital_Movement_Form → CAPXXX
// ─────────────────────────────────────────────────────────────
async function generateUniqueCapitalUID() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: RECONCILITION_ID,
      range: 'Capital_Movement_Form!B7:B',
    });

    const values = response.data.values || [];

    // Agar koi data nahi hai to pehla UID
    if (values.length === 0) {
      return 'CAP00001';
    }

    // Last row ka UID le lo (B column)
    const lastUID = values[values.length - 1][0];

    // Agar lastUID valid nahi hai to pehla UID return karo
    if (!lastUID || typeof lastUID !== 'string' || !lastUID.startsWith('CAP')) {
      return 'CAP00001';
    }

    // 'CAP' hata ke number nikaalo
    const lastNumberStr = lastUID.replace('CAP', '').trim();
    const lastNumber = parseInt(lastNumberStr, 10);

    // Agar number valid nahi hai to pehla UID
    if (isNaN(lastNumber)) {
      return 'CAP00001';
    }

    const nextNumber = lastNumber + 1;

    // Yahan change hai → padStart(5, '0') karna hai (5 digits)
    return `CAP${String(nextNumber).padStart(5, '0')}`;

  } catch (error) {
    console.error('Error generating Capital UID:', error);
    return 'CAP00001';
  }
}

// ─────────────────────────────────────────────────────────────
// POST /Bank_Transfer_form → Form 1: A/C To A/C Transfer
// ─────────────────────────────────────────────────────────────
router.post('/Bank_Transfer_form', async (req, res) => {
  try {
    const {
      Transfer_A_C_Name,
      Transfer_Received_A_C_Name,
      Amount,
      PAYMENT_MODE,
      PAYMENT_DETAILS,
      PAYMENT_DATE,
      Remark
    } = req.body;

    if (
      !Transfer_A_C_Name ||
      !Transfer_Received_A_C_Name ||
      !Amount ||
      !PAYMENT_MODE ||
      !PAYMENT_DATE
    ) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    const UID = await generateUniqueUID();
    const cleanTimestamp = getISTTimestamp();

    const rowData = [
      cleanTimestamp,
      UID,
      Transfer_A_C_Name,
      Transfer_Received_A_C_Name,
      Amount,
      PAYMENT_MODE,
      PAYMENT_DETAILS || '',
      formatDateToDDMMYYYY(PAYMENT_DATE),
      Remark || ''
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId : RECONCILITION_ID,
      range: 'A/C To A/C Transfer!A7:I',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData]
      }
    });

    res.status(200).json({
      success: true,
      message: 'Bank transfer data saved successfully',
      data: {
        UID,
        Timestamp: cleanTimestamp,
        ...req.body
      }
    });

  } catch (error) {
    console.error('Error saving bank transfer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save data',
      error: error.message
    });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /Dropdown-Data → Project_Data se dropdown options
// ─────────────────────────────────────────────────────────────
router.get('/Dropdown-Data', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId : RECONCILITION_ID,
      range: 'Project_Data!A2:C',
    });

    const rows = response.data.values || [];

    if (rows.length === 0) {
      return res.json({
        success: true,
        accounts: [],
        capitalMovements: []
      });
    }

    const accountSet = new Set();
    rows.forEach(row => {
      const val = row[1]?.toString().trim();
      if (val) accountSet.add(val);
    });
    const accounts = [...accountSet].sort();

    const movementSet = new Set();
    rows.forEach(row => {
      const val = row[2]?.toString().trim();
      if (val) movementSet.add(val);
    });
    const capitalMovements = [...movementSet].sort();

    res.json({
      success: true,
      accounts,
      capitalMovements
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

// ─────────────────────────────────────────────────────────────
// POST /Captial-A/C → Form 2: Capital Movement Form
// ─────────────────────────────────────────────────────────────
router.post('/Captial-A/C', async (req, res) => {
  try {
    const {
      Capital_Movment,
      Received_Account,
      Amount,
      PAYMENT_MODE,
      PAYMENT_DETAILS = '',
      PAYMENT_DATE = '',
      Remark = ''
    } = req.body;

    if (!Capital_Movment || !Received_Account || !Amount || !PAYMENT_MODE) {
      return res.status(400).json({
        success: false,
        message: 'Capital Movement, Received Account, Amount aur Payment Mode dena zaroori hai'
      });
    }

    const needsTransactionDetails = ['Cheque', 'NEFT', 'RTGS', 'UPI'].includes(PAYMENT_MODE);

    if (needsTransactionDetails) {
      if (!PAYMENT_DATE.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Payment Date dena zaroori hai jab mode Cash nahi hai'
        });
      }
    }

    const UID = await generateUniqueCapitalUID();
    const cleanTimestamp = getISTTimestamp();

    const rowData = [
      cleanTimestamp,
      UID,
      Capital_Movment,
      Received_Account,
      Amount,
      PAYMENT_MODE,
      PAYMENT_DETAILS,
      formatDateToDDMMYYYY(PAYMENT_DATE),
      Remark
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId : RECONCILITION_ID,
      range: 'Capital_Movement_Form!A7:I',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData]
      }
    });

    res.status(200).json({
      success: true,
      message: 'Capital movement saved successfully',
      data: {
        UID,
        Timestamp: cleanTimestamp,
        ...req.body
      }
    });

  } catch (error) {
    console.error('Error saving capital movement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save data',
      error: error.message
    });
  }
});

module.exports = router;