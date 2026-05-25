// const express = require("express");
// const { sheets, SummarySheetId } = require("../../config/googleSheet");

// const router = express.Router();

// router.get("/Summary-main", async (req, res) => {
//   try {
//     if (!SummarySheetId) {
//       return res.status(500).json({
//         success: false,
//         error: "SummarySheetId is not configured",
//       });
//     }

//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: SummarySheetId,
//       range: "All_Bank_Summary!A3:G", // Adjust 1000 → higher if more rows expected
//       valueRenderOption: "FORMATTED_VALUE", // Keeps commas in numbers like "23,292,700.00"
//     });

//     const rows = response.data.values || [];

//     if (rows.length < 2) {
//       return res.json({
//         success: true,
//         message: "Not enough data found in sheet",
//         inTotal: null,
//         outTotal: null,
//         transactions: [],
//       });
//     }

//     // ────────────────────────────────────────────────
//     // TOTAL row → usually the very first row (index 0)
//     // IN total is in column F (index 5), OUT in G (index 6)
//     // ────────────────────────────────────────────────
//     const totalRow = rows[0] || [];

//     let inTotal = totalRow[5] || null; // F column → "IN" Amount total
//     let outTotal = totalRow[6] || null; // G column → "OUT" Expenses total

//     // Fallback: if somehow shifted, check nearby columns
//     if (!inTotal && totalRow[4]) inTotal = totalRow[4];
//     if (!outTotal && totalRow[5]) outTotal = totalRow[5]; // rare case

//     // Optional: clean numbers for calculation (remove commas)
//     let balanceDiff = null;
//     if (inTotal && outTotal) {
//       const inClean = parseFloat(inTotal.toString().replace(/,/g, "")) || 0;
//       const outClean = parseFloat(outTotal.toString().replace(/,/g, "")) || 0;
//       balanceDiff = (inClean - outClean).toFixed(2);
//     }

//     // ────────────────────────────────────────────────
//     // Transactions: start from row 1 (A4 onwards)
//     // ────────────────────────────────────────────────
//     const transactions = rows
//       .slice(1)
//       .filter((row) => {
//         // Keep only rows that have a valid date in column A
//         return (
//           row &&
//           row.length >= 5 &&
//           row[0] &&
//           row[0].trim() !== "" &&
//           !row[0].toLowerCase().includes("total")
//         );
//       })
//       .map((row) => ({
//         date: row[0] || "", // A - DATE
//         siteName: row[1] || "", // B - Site Name
//         vendorName: row[2] || "", // C - Vendor Name
//         bankName: row[3] || "", // D - Bank Name
//         expHead: row[4] || "", // E - Exp Head
//         inAmount: row[5] || "0.00", // F - "IN" Amount
//         outAmount: row[6] || "0.00", // G - "OUT" Expenses
//       })).reverse();
      

//     // Final response
//     res.json({
//       success: true,
//       inTotal: inTotal, // should now be "23,292,700.00" or similar
//       outTotal: outTotal, // "37,944,961.12"
//       netBalance: balanceDiff, // IN - OUT as string with 2 decimals
//       totalTransactions: transactions.length,
//       transactions: transactions,
//       // Optional debug (remove in production)
//       debug: {
//         rowsFetched: rows.length,
//         firstRow: totalRow.slice(0, 7), // first 7 cells of total row
//         sampleTx: transactions[0] ? transactions[0] : null,
//       },
//     });
//   } catch (error) {
//     console.error("Error in /Summary-main:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch bank summary data",
//       details: error.message || "Unknown error",
//     });
//   }
// });





// router.get("/Bank-Balance",async (req,res)=>{
//     try {

//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId:SummarySheetId,
//       range: 'Bank Balance!A2:B',
//     });

//     let rows = response.data.values || [];

//     if (rows.length === 0) {
//       return res.json({ success: true, data: [] });
//     }

  
//     const filteredData = rows
//     //  .filter(row => row[12] && !row[13])
//       .map(row => ({
//         BankName: (row[0] || '').toString().trim(),
//         Balance: (row[1] || '').toString().trim(),
       
//       }));

//     res.json({ success: true, data: filteredData });
//   } catch (error) {
//     console.error('GET /Bank Balnace:', error);
//     res.status(500).json({ success: false, error: 'Failed to fetch data' });
//   }
// })





// router.get("/outStanding", async (req, res) => {
//   try {
//     if (!SummarySheetId) {
//       return res.status(500).json({
//         success: false,
//         error: "SummarySheetId is not configured",
//       });
//     }

//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: SummarySheetId,
//       range: "Out_Standing_Data!A3:J", // ← adjust end row if needed
//       valueRenderOption: "FORMATTED_VALUE",
//     });

//     const rows = response.data.values || [];

//     if (rows.length === 0) {
//       return res.json({
//         success: true,
//         message: "No data found in sheet",
//         totalOutstanding: "0.00",
//         totalNetAmount: "0.00",
//         totalPaidAmount: "0.00",
//         transactions: [],
//       });
//     }

//     // ────────────────────────────────────────────────
//     // Map rows to meaningful objects
//     // Assuming header is already skipped (data starts A3)
//     // ────────────────────────────────────────────────
//     const transactions = rows
//       .filter((row) => {
//         // Skip completely empty rows or total rows
//         if (!row || row.length < 6) return false;
//         const date = (row[0] || "").toString().trim();
//         return date !== "" && !date.toLowerCase().includes("total");
//       })
//       .map((row) => ({
//         date       : row[0] || "",           // A - Date
//         siteName   : row[1] || "",           // B - Site Name
//         vendorName : row[2] || "",           // C - Vendor Name
//         billNo     : row[3] || "", 
//         billDate: row[4] || "",          // D - Bill. No
//         billPDF: row[5] || "",          // D - Bill. No
//         expHead    : row[6] || "",           // E - Exp. Head
//         netAmount  : row[7] || "0.00",       // F - Net Amount
//         paidAmount : row[8] || "0.00",       // G - Paid Amount
//         balance    : row[9] || "0.00",       // H - Balance (most important)
//       }))
//       .reverse(); // newest first (optional — remove if you want oldest first)

//     // ────────────────────────────────────────────────
//     // Calculate aggregates from the data itself
//     // (more reliable than depending on a "total row")
//     // ────────────────────────────────────────────────
//     let totalNet   = 0;
//     let totalPaid  = 0;
//     let totalOut   = 0;

//     transactions.forEach((tx) => {
//       const net   = parseFloat(tx.netAmount.toString().replace(/,/g, ""))   || 0;
//       const paid  = parseFloat(tx.paidAmount.toString().replace(/,/g, ""))  || 0;
//       const bal   = parseFloat(tx.balance.toString().replace(/,/g, ""))     || 0;

//       totalNet  += net;
//       totalPaid += paid;
//       totalOut  += bal;   // ← usually what you want to show as "Outstanding"
//     });

//     const format = (num) => Number(num).toLocaleString("en-IN", {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     });

//     // Final response
//     res.json({
//       success: true,
//       totalNetAmount    : format(totalNet),
//       totalPaidAmount   : format(totalPaid),
//       totalOutstanding  : format(totalOut),      // ← most important value
//       totalTransactions : transactions.length,
//       transactions,
//       // Optional debug info (remove in production)
//       debug: {
//         rowsFetched: rows.length,
//         firstRowSample: rows[0] || null,
//         lastRowSample: rows[rows.length - 1] || null,
//       },
//     });

//   } catch (error) {
//     console.error("Error in /outStanding:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch outstanding data",
//       details: error.message || "Unknown error",
//     });
//   }
// });



// module.exports = router;






const express = require("express");
const { sheets, SummarySheetId } = require("../../config/googleSheet");

const router = express.Router();

router.get("/Summary-main", async (req, res) => {
  try {
    if (!SummarySheetId) {
      return res.status(500).json({
        success: false,
        error: "SummarySheetId is not configured",
      });
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SummarySheetId,
      range: "All_Bank_Summary!A3:G",
      valueRenderOption: "FORMATTED_VALUE",
    });

    const rows = response.data.values || [];

    if (rows.length < 2) {
      return res.json({
        success: true,
        message: "Not enough data found in sheet",
        inTotal: null,
        outTotal: null,
        transactions: [],
      });
    }

    const totalRow = rows[0] || [];
    let inTotal = totalRow[5] || null;
    let outTotal = totalRow[6] || null;

    if (!inTotal && totalRow[4]) inTotal = totalRow[4];
    if (!outTotal && totalRow[5]) outTotal = totalRow[5];

    let balanceDiff = null;
    if (inTotal && outTotal) {
      const inClean = parseFloat(inTotal.toString().replace(/,/g, "")) || 0;
      const outClean = parseFloat(outTotal.toString().replace(/,/g, "")) || 0;
      balanceDiff = (inClean - outClean).toFixed(2);
    }

    const transactions = rows
      .slice(1)
      .filter((row) => {
        return (
          row &&
          row.length >= 5 &&
          row[0] &&
          row[0].trim() !== "" &&
          !row[0].toLowerCase().includes("total")
        );
      })
      .map((row) => ({
        date: row[0] || "",
        siteName: row[1] || "",
        vendorName: row[2] || "",
        bankName: row[3] || "",
        expHead: row[4] || "",
        inAmount: row[5] || "0.00",
        outAmount: row[6] || "0.00",
      }))
      .reverse();

    res.json({
      success: true,
      inTotal: inTotal,
      outTotal: outTotal,
      netBalance: balanceDiff,
      totalTransactions: transactions.length,
      transactions: transactions,
      debug: {
        rowsFetched: rows.length,
        firstRow: totalRow.slice(0, 7),
        sampleTx: transactions[0] ? transactions[0] : null,
      },
    });
  } catch (error) {
    console.error("Error in /Summary-main:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch bank summary data",
      details: error.message || "Unknown error",
    });
  }
});


// ✅ FIXED: "Bank Balance" → "Bank_Balance"
router.get("/Bank-Balance", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SummarySheetId,
      range: "Bank_Balance!A2:B", // ← FIXED (underscore)
    });

    let rows = response.data.values || [];

    if (rows.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const filteredData = rows.map((row) => ({
      BankName: (row[0] || "").toString().trim(),
      Balance: (row[1] || "").toString().trim(),
    }));

    res.json({ success: true, data: filteredData });
  } catch (error) {
    console.error("GET /Bank-Balance:", error);
    res.status(500).json({ success: false, error: "Failed to fetch data" });
  }
});


// ✅ FIXED: "Out_Standing_Data" → "Out Standing Data" (with spaces)
router.get("/outStanding", async (req, res) => {
  try {
    if (!SummarySheetId) {
      return res.status(500).json({
        success: false,
        error: "SummarySheetId is not configured",
      });
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SummarySheetId,
      range: "'Out Standing Data'!A3:K", // ← A to K (11 columns)
      valueRenderOption: "FORMATTED_VALUE",
    });

    const rows = response.data.values || [];

    if (rows.length === 0) {
      return res.json({
        success: true,
        message: "No data found in sheet",
        totalOutstanding: "0.00",
        totalNetAmount: "0.00",
        totalPaidAmount: "0.00",
        transactions: [],
      });
    }

    const transactions = rows
      .filter((row) => {
        if (!row || row.length < 1) return false;
        const date = (row[0] || "").toString().trim();
        return date !== "" && !date.toLowerCase().includes("total");
      })

      .map((row) => ({
        date:       row[0]  || "",      // A - Date
        siteName:   row[1]  || "",      // B - Site Name
        vendorName: row[2]  || "",      // C - Vendor Name
        expHead:    row[3]  || "",      // D - Exp Head
        // row[4] - skip (maybe empty column)
        billNo:     row[5]  || "",      // F - Bill No
        billDate:   row[6]  || "",      // G - Bill Date
        billPDF:    row[7]  || "",      // H - Bill PDF
        netAmount:  row[8]  || "0.00",  // I - Net Amount
        paidAmount: row[9]  || "0.00",  // J - Paid Amount
        balance:    row[10] || "0.00",  // K - Balance
      }))
      .reverse();

    let totalNet = 0;
    let totalPaid = 0;
    let totalOut = 0;

    transactions.forEach((tx) => {
      const net = parseFloat(tx.netAmount.toString().replace(/,/g, "")) || 0;
      const paid = parseFloat(tx.paidAmount.toString().replace(/,/g, "")) || 0;
      const bal = parseFloat(tx.balance.toString().replace(/,/g, "")) || 0;

      totalNet += net;
      totalPaid += paid;
      totalOut += bal;
    });

    const format = (num) =>
      Number(num).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    res.json({
      success: true,
      totalNetAmount: format(totalNet),
      totalPaidAmount: format(totalPaid),
      totalOutstanding: format(totalOut),
      totalTransactions: transactions.length,
      transactions,
      debug: {
        rowsFetched: rows.length,
        firstRowSample: rows[0] || null,
        lastRowSample: rows[rows.length - 1] || null,
      },
    });
  } catch (error) {
    console.error("Error in /outStanding:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch outstanding data",
      details: error.message || "Unknown error",
    });
  }
});

module.exports = router;