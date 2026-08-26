

const express = require('express');
const router = express.Router();
const { Readable } = require('stream');
const { sheets, drive, OfficeExpenseID } = require('../../config/googleSheet');

// ============================================
// Helper: Upload Photo to Google Drive
// ============================================
async function uploadToGoogleDrive(base64Data, fileName) {
  if (
    !base64Data ||
    typeof base64Data !== 'string' ||
    !base64Data.startsWith('data:')
  ) {
    return '';
  }

  const match = base64Data.match(
    /^data:([a-zA-Z0-9\/\-\+\.]+);base64,(.+)$/
  );
  if (!match) return '';

  const mimeType = match[1] || 'image/jpeg';
  const buffer = Buffer.from(match[2], 'base64');

  try {
    const fileStream = new Readable();
    fileStream.push(buffer);
    fileStream.push(null);

    const res = await drive.files.create({
      resource: {
        name: fileName,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID || 'root'],
      },
      media: { mimeType, body: fileStream },
      fields: 'id',
      supportsAllDrives: true,
    });

    const fileId = res.data.id;

    await drive.permissions.create({
      fileId,
      requestBody: { role: 'reader', type: 'anyone' },
      supportsAllDrives: true,
    });

    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  } catch (error) {
    console.error(`Drive upload failed for ${fileName}:`, error.message);
    return '';
  }
}

// ============================================
// Helper: Get IST Timestamp
// ============================================
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

// ============================================
// Helper: Generate Bill Number ✅ FIXED
// ============================================
async function generateBillNumber() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: OfficeExpenseID,
      range: 'VRN_Office_Expenses!B:B',
    });

    const rows = response.data.values || [];
    let maxNumber = 0;

    console.log(`Total rows fetched: ${rows.length}`);

    // ✅ Row 9 se start (index 8)
    for (let i = 8; i < rows.length; i++) {
      const billNo = rows[i]?.[0];

      // ✅ FIXED: VRN prefix check
      if (billNo && billNo.toString().trim().startsWith('VRN')) {
        const numStr = billNo.toString().trim().replace('VRN', '');
        const num = parseInt(numStr);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    }

    const nextNumber = `VRN${(maxNumber + 1).toString().padStart(4, '0')}`;
    console.log(`✅ Generated Bill Number: ${nextNumber} (max was: ${maxNumber})`);

    return nextNumber;

  } catch (error) {
    console.error('Error generating bill number:', error);
    return 'VRN0001';
  }
}

// ============================================
// Helper: Get Last UID ✅ VERIFIED
// ============================================
async function getLastUID() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: OfficeExpenseID,
      range: 'VRN_Office_Expenses!C:C',
    });

    const rows = response.data.values || [];
    let maxUID = 0;

    // ✅ Row 9 se start (index 8)
    for (let i = 8; i < rows.length; i++) {
      const uid = parseInt(rows[i]?.[0]);
      if (!isNaN(uid) && uid > maxUID) maxUID = uid;
    }

    console.log(`✅ Last UID found: ${maxUID}`);
    return maxUID;

  } catch (error) {
    console.error('Error getting last UID:', error);
    return 0;
  }
}

// ============================================
// Helper: Get Available Rows ✅ VERIFIED
// ============================================
async function getAvailableRows(needed) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: OfficeExpenseID,
      range: 'VRN_Office_Expenses!A:A',
    });

    const rows = response.data.values || [];
    const emptyRows = [];

    // ✅ Row 9 se start (index 8)
    for (let i = 8; i < rows.length; i++) {
      const cellValue = rows[i]?.[0];
      const isEmpty = !cellValue || cellValue.toString().trim() === '';

      if (isEmpty) {
        emptyRows.push(i + 1);
      }

      if (emptyRows.length === needed) break;
    }

    // Agar sheet mein enough empty rows nahi hain
    if (emptyRows.length < needed) {
      const totalRows = Math.max(rows.length, 8);
      const startAppend = totalRows + 1;
      const stillNeeded = needed - emptyRows.length;

      for (let i = 0; i < stillNeeded; i++) {
        emptyRows.push(startAppend + i);
      }
    }

    console.log(`✅ Available rows for ${needed} items:`, emptyRows);
    return emptyRows;

  } catch (error) {
    console.error('Error getting available rows:', error);
    return Array.from({ length: needed }, (_, i) => 9 + i);
  }
}

// ============================================
// GET Route - Dropdown Data
// ============================================
router.get('/Dropdown-Data', async (req, res) => {
  try {
    const {
      action,
      subhead,
      itemName,
      getFormRaised,
      getProjectName
    } = req.query;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: OfficeExpenseID,
      range: 'Project_Data!D4:L',
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'No data found' });
    }

    // Header Row
    let headerRowIndex = 0;
    let headers = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (
        row &&
        row.length > 0 &&
        (row[0] === 'Dimension_Subhead_Name' || row[1] === 'ITEM_NAME')
      ) {
        headerRowIndex = i;
        headers = row;
        break;
      }
    }

    if (headers.length === 0) {
      headerRowIndex = 0;
      headers = [
        'Dimension_Subhead_Name',
        'ITEM_NAME',
        'Unit',
        'SKU CODE',
        '',
        '',
        'Form_Raised_Form',
        '',
        'Project_Name',
      ];
    }

    const dataRows = rows
      .slice(headerRowIndex + 1)
      .filter((row) => row && row.length > 0 && row[0]);

    const subheadIndex     = 0; // D
    const itemNameIndex    = 1; // E
    const unitIndex        = 2; // F
    const skuCodeIndex     = 3; // G
    const formRaisedIndex  = 6; // J
    const projectNameIndex = 8; // L

    // Project Name Dropdown
    if (getProjectName === 'true') {
      const uniqueProjectNames = [
        ...new Set(
          dataRows
            .map((row) => row[projectNameIndex])
            .filter(Boolean)
        ),
      ];
      return res.json({ type: 'projectName', data: uniqueProjectNames });
    }

    // Form Raised by Subhead
    if (getFormRaised === 'true' && subhead) {
      const uniqueFormRaised = [
        ...new Set(
          dataRows
            .filter((row) => row[subheadIndex] === subhead)
            .map((row) => row[formRaisedIndex])
            .filter(Boolean)
        ),
      ];
      return res.json({ type: 'formRaised', data: uniqueFormRaised });
    }

    // All Data
    if (action === 'all-data') {
      const subheadMap = new Map();

      dataRows.forEach((row) => {
        const subheadVal = row[subheadIndex];
        if (!subheadVal) return;

        if (!subheadMap.has(subheadVal)) {
          subheadMap.set(subheadVal, {
            subhead: subheadVal,
            items: [],
            formRaised: new Set(),
          });
        }

        const subheadData = subheadMap.get(subheadVal);
        const itemNameVal = row[itemNameIndex];

        if (itemNameVal) {
          subheadData.items.push({
            itemName:    itemNameVal,
            unit:        row[unitIndex]        || '',
            skuCode:     row[skuCodeIndex]     || '',
            formRaised:  row[formRaisedIndex]  || '',
            projectName: row[projectNameIndex] || '',
          });
        }

        if (row[formRaisedIndex]) {
          subheadData.formRaised.add(row[formRaisedIndex]);
        }
      });

      const allData = Array.from(subheadMap.values()).map((s) => ({
        subhead:    s.subhead,
        items:      s.items,
        formRaised: Array.from(s.formRaised),
      }));

      return res.json({ type: 'all-data', data: allData });
    }

    // Subheads only
    if (!subhead && !itemName) {
      const uniqueSubheads = [
        ...new Set(dataRows.map((row) => row[subheadIndex])),
      ].filter(Boolean);
      return res.json({ type: 'subheads', data: uniqueSubheads });
    }

    // Items by Subhead
    if (subhead && !itemName) {
      const filteredItems = dataRows
        .filter((row) => row[subheadIndex] === subhead)
        .map((row) => ({
          itemName:    row[itemNameIndex],
          unit:        row[unitIndex]        || '',
          skuCode:     row[skuCodeIndex]     || '',
          formRaised:  row[formRaisedIndex]  || '',
          projectName: row[projectNameIndex] || '',
        }))
        .filter((item) => item.itemName);

      return res.json({ type: 'items', data: filteredItems });
    }

    // Item Details
    if (subhead && itemName) {
      const selectedItem = dataRows.find(
        (row) =>
          row[subheadIndex] === subhead &&
          row[itemNameIndex] === itemName
      );

      if (!selectedItem) {
        return res.status(404).json({ error: 'Item not found' });
      }

      return res.json({
        type: 'details',
        data: {
          unit:        selectedItem[unitIndex]        || '',
          skuCode:     selectedItem[skuCodeIndex]     || '',
          formRaised:  selectedItem[formRaisedIndex]  || '',
          projectName: selectedItem[projectNameIndex] || '',
        },
      });
    }

    return res.status(400).json({ error: 'Invalid request' });

  } catch (error) {
    console.error('GET Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
});

// ============================================
// POST Route - Submit Payment Data
// ============================================
router.post('/post-form-data', async (req, res) => {
  try {
    const { officeName, payeeName, expensesHead, items, remarks } = req.body;

    if (
      !officeName ||
      !payeeName ||
      !expensesHead ||
      !items ||
      items.length === 0
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const timestamp = getISTTimestamp();
    const billNumber = await generateBillNumber();
    const lastUID = await getLastUID();
    const availableRows = await getAvailableRows(items.length);

    console.log(
      `billNumber: ${billNumber} | lastUID: ${lastUID} | rows: ${availableRows}`
    );

    const batchData = [];
    const uploadedPhotos = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const rowNum = availableRows[i];
      const uid = lastUID + (i + 1);

      let billPhotoUrl = '';
      if (item.billPhoto && item.billPhoto.startsWith('data:')) {
        const uniqueId = `${billNumber}_uid${uid}_${Date.now()}`;
        billPhotoUrl = await uploadToGoogleDrive(
          item.billPhoto,
          `bill_${uniqueId}.jpg`
        );
        uploadedPhotos.push(billPhotoUrl);
      }

      const rowData = new Array(17).fill('');

      rowData[0]  = timestamp;
      rowData[1]  = billNumber;
      rowData[2]  = uid;
      rowData[3]  = officeName;
      rowData[4]  = payeeName;
      rowData[5]  = item.subhead;
      rowData[6]  = item.itemName;
      rowData[7]  = item.description || '';
      rowData[8]  = item.unit;
      rowData[9]  = item.skuCode;
      rowData[10] = item.quantity;
      rowData[11] = item.amount;
      rowData[12] = '';
      rowData[13] = '';
      rowData[14] = item.formRaisedBy;
      rowData[15] = billPhotoUrl;
      rowData[16] = remarks || '';

      batchData.push({
        range: `VRN_Office_Expenses!A${rowNum}:Q${rowNum}`,
        values: [rowData],
      });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: OfficeExpenseID,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: batchData,
      },
    });

    const totalAmount = items.reduce(
      (sum, item) => sum + (parseFloat(item.amount) || 0),
      0
    );

    return res.status(201).json({
      success: true,
      message: `${items.length} item(s) submitted successfully`,
      data: {
        billNumber,
        timestamp,
        totalItems: items.length,
        totalAmount,
        billPhotos: uploadedPhotos,
      },
    });

  } catch (error) {
    console.error('POST Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
});

module.exports = router;