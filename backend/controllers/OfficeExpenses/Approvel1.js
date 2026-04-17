const express = require('express');
const router = express.Router();
const { sheets, OfficeExpenseID } = require('../../config/googleSheet'); // path adjust karo

// GET route
router.get('/Get-Approvel-1', async (req, res) => {
  try {
    if (!OfficeExpenseID) {
      return res.status(500).json({
        success: false,
        error: "spreadsheetId is not configured",
      });
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId : OfficeExpenseID,
      range: "VRN_Office_Expenses!A7:V",
    });

    let rows = response.data.values || [];

    if (rows.length === 0) {
      return res.json({
        success: true,
        message: "No data found",
        data: [],
      });
    }

    const filteredData = rows
      .filter((row) => row[20] && !row[21])
      .map((row) => ({
        OFFBILLUID: (row[1] || "").toString().trim(),
        uid: (row[2] || "").toString().trim(),
        OFFICE_NAME_1: (row[3] || "").toString().trim(),
        PAYEE_NAME_1: (row[4] || "").toString().trim(),
        EXPENSES_HEAD_1: (row[5] || "").toString().trim(),
        EXPENSES_SUBHEAD_1: (row[6] || "").toString().trim(),
        ITEM_NAME_1: (row[7] || "").toString().trim(),
        UNIT_1: (row[8] || "").toString().trim(),
        SKU_CODE_1: (row[9] || "").toString().trim(),
        Qty_1: (row[10] || "").toString().trim(),
        Amount: (row[11] || "").toString().trim(),
        DEPARTMENT_1: (row[12] || "").toString().trim(),
        APPROVAL_DOER: (row[13] || "").toString().trim(),
        RAISED_BY_1: (row[14] || "").toString().trim(),
        Bill_Photo: (row[15] || "").toString().trim(),
        REMARK_1: (row[16] || "").toString().trim(),
        PLANNED_2: (row[20] || "").toString().trim(),
        ACTUAL_2: (row[21] || "").toString().trim(),
      }));

    return res.json({
      success: true,
      totalRecords: filteredData.length,
      data: filteredData,
    });
  } catch (error) {
    console.error("DIM Approve1 GET Error:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch office expenses data",
      details: error.message,
    });
  }
});

// POST route
router.post('/Post-Approvel-1', async (req, res) => {
  try {
    const { uid, STATUS_2, REVISED_AMOUNT_3, APPROVAL_DOER_2, REMARK_2 } = req.body;

    console.log("Received update body:", req.body);

    if (!uid) {
      return res.status(400).json({
        success: false,
        message: "UID is required",
      });
    }

    const trimmedUid = uid.toString().trim();

    const findResponse = await sheets.spreadsheets.values.get({
      spreadsheetId : OfficeExpenseID,
      range: "VRN_Office_Expenses!C7:C",
    });

    const values = findResponse.data.values || [];

    const rowIndex = values.findIndex((row) => {
      if (row.length === 0) return false;
      const sheetValue = row[0] ? row[0].toString().trim() : "";
      return sheetValue === trimmedUid;
    });

    if (rowIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Row not found with this UID",
        searchedFor: uid,
      });
    }

    const sheetRowNumber = 7 + rowIndex;

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId : OfficeExpenseID,
      resource: {
        valueInputOption: "USER_ENTERED",
        data: [
          {
            range: `VRN_Office_Expenses!W${sheetRowNumber}`,
            values: [[STATUS_2 || ""]],
          },
          {
            range: `VRN_Office_Expenses!Y${sheetRowNumber}`,
            values: [[REVISED_AMOUNT_3 || ""]],
          },
          {
            range: `VRN_Office_Expenses!Z${sheetRowNumber}`,
            values: [[APPROVAL_DOER_2 || ""]],
          },
          {
            range: `VRN_Office_Expenses!AA${sheetRowNumber}`,
            values: [[REMARK_2 || ""]],
          },
        ],
      },
    });

    return res.json({
      success: true,
      message: "Data updated successfully",
    });
  } catch (error) {
    console.error("DIM Approve1 POST Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;