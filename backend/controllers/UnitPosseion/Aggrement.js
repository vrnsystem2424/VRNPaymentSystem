
// const express = require('express');
// const multer = require('multer');
// const stream = require('stream');
// const { sheets, drive, spreadsheetId } = require('../../config/googleSheet');
// const router = express.Router();

// // ✅ Multer setup - ALL file types allowed
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
//   // No fileFilter = sab file types allowed
// });

// // ✅ Helper - Upload file to Google Drive
// async function uploadToDrive(file) {
//   const bufferStream = new stream.PassThrough();
//   bufferStream.end(file.buffer);

//   const response = await drive.files.create({
//     requestBody: {
//       name: `${Date.now()}_${file.originalname}`,
//       mimeType: file.mimetype,
//       parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
//     },
//     media: {
//       mimeType: file.mimetype,
//       body: bufferStream,
//     },
//     fields: 'id, webViewLink, webContentLink',
//   });

//   // Make file public - anyone can view
//   await drive.permissions.create({
//     fileId: response.data.id,
//     requestBody: {
//       role: 'reader',
//       type: 'anyone',
//     },
//   });

//   const fileUrl = `https://drive.google.com/file/d/${response.data.id}/view`;
//   return fileUrl;
// }

// // ✅ Helper - Upload MULTIPLE files to Google Drive
// async function uploadMultipleToDrive(files) {
//   const urls = [];

//   for (const file of files) {
//     const bufferStream = new stream.PassThrough();
//     bufferStream.end(file.buffer);

//     const response = await drive.files.create({
//       requestBody: {
//         name: `${Date.now()}_${file.originalname}`,
//         mimeType: file.mimetype,
//         parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
//       },
//       media: {
//         mimeType: file.mimetype,
//         body: bufferStream,
//       },
//       fields: 'id, webViewLink, webContentLink',
//     });

//     // Make file public
//     await drive.permissions.create({
//       fileId: response.data.id,
//       requestBody: {
//         role: 'reader',
//         type: 'anyone',
//       },
//     });

//     urls.push({
//       fileName: file.originalname,
//       fileType: file.mimetype,
//       fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
//       url: `https://drive.google.com/file/d/${response.data.id}/view`,
//     });
//   }

//   return urls;
// }

// // ✅ Helper - Find row by ID
// async function findRowByID(searchId) {
//   const response = await sheets.spreadsheets.values.get({
//     spreadsheetId,
//     range: 'Posseion_FMS!A7:S',
//   });

//   const rows = response.data.values || [];

//   if (rows.length === 0) return null;

//   for (let i = 1; i < rows.length; i++) {
//     const row = rows[i];
//     const id = (row[1] || '').toString().trim();

//     if (id === searchId.toString().trim()) {
//       return {
//         rowIndex: i + 7,
//         rowData: row,
//       };
//     }
//   }

//   return null;
// }

// // ✅ GET - Fetch all data



// router.get('/Aggerement', async (req, res) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Posseion_FMS!A7:S',
//     });

//     const rows = response.data.values || [];

//     if (rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'No data found',
//       });
//     }

//     const dataRows = rows.slice(1);

//     const data = dataRows
//       .map((row, index) => ({
//         originalRowIndex: index + 8,
//         row,
//       }))
//       // ✅ Q column (index 16) check - Sirf "Pending" wale rows
//       .filter(({ row }) => {
//         const qColumnValue = (row[16] || '').toString().trim().toLowerCase();
//         return qColumnValue === 'pending';
//       })
//       .map(({ row, originalRowIndex }) => ({
//         rowIndex:                 originalRowIndex,
//         applicationDate:          row[0]  || '',
//         id:                       row[1]  || '',
//         applicantName:            row[2]  || '',
//         contact:                  row[3]  || '',
//         currentAddress:           row[4]  || '',
//         project:                  row[5]  || '',
//         product:                  row[6]  || '',
//         block:                    row[7]  || '',
//         unitNo:                   row[8]  || '',
//         unitType:                 row[9]  || '',
//         size:                     row[10] || '',
//         unitCode:                 row[11] || '',
//         basicPriceAfterDiscount:  row[12] || '',
//         agreementValue:           row[13] || '',
//         unitSoldThrough:          row[14] || '',
//         date:                     row[15] || '',
//         Status:                   row[16] || '', // Q column
//         Upload_Document_Copy:     row[17] || '',
//         Remarks:                  row[18] || '',
//       }));

//     return res.status(200).json({
//       success: true,
//       message: 'Pending records fetched successfully',
//       totalRecords: data.length,
//       data,
//     });
//   } catch (error) {
//     console.error('Error fetching data:', error.message);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: error.message,
//     });
//   }
// });




// // ✅ GET - Fetch single record by ID
// router.get('/Aggerement/:id', async (req, res) => {
//   try {
//     const searchId = req.params.id;
//     const result = await findRowByID(searchId);

//     if (!result) {
//       return res.status(404).json({
//         success: false,
//         message: `No record found with ID: ${searchId}`,
//       });
//     }

//     const row = result.rowData;

//     const data = {
//       rowIndex:                 result.rowIndex,
//       applicationDate:          row[0]  || '',
//       id:                       row[1]  || '',
//       applicantName:            row[2]  || '',
//       contact:                  row[3]  || '',
//       currentAddress:           row[4]  || '',
//       project:                  row[5]  || '',
//       product:                  row[6]  || '',
//       block:                    row[7]  || '',
//       unitNo:                   row[8]  || '',
//       unitType:                 row[9]  || '',
//       size:                     row[10] || '',
//       unitCode:                 row[11] || '',
//       basicPriceAfterDiscount:  row[12] || '',
//       agreementValue:           row[13] || '',
//       unitSoldThrough:          row[14] || '',
//       date:                     row[15] || '',
//       Status:                   row[16] || '',
//       Upload_Document_Copy:     row[17] || '',
//       Remarks:                  row[18] || '',
//     };

//     return res.status(200).json({
//       success: true,
//       message: 'Record found successfully',
//       data,
//     });
//   } catch (error) {
//     console.error('Error:', error.message);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: error.message,
//     });
//   }
// });

// // ✅ POST - Update by ID (Multiple Files + Any File Type)
// router.post('/Aggerement', upload.array('documents', 10), async (req, res) => {
//   try {
//     // ✅ Get fields from body
//     const searchId =
//       req.body.id ||
//       req.body.Id ||
//       req.body.ID ||
//       null;

//     const status =
//       req.body.Status ||
//       req.body.status ||
//       '';

//     const remarks =
//       req.body.Remarks ||
//       req.body.remarks ||
//       '';

//     const manualDocUrl =
//       req.body.Upload_Document_Copy ||
//       req.body.uploadDocumentCopy ||
//       req.body.documentUrl ||
//       '';

//     // ✅ ID Validation
//     if (!searchId) {
//       return res.status(400).json({
//         success: false,
//         message: 'id is required to find the record',
//       });
//     }

//     // ✅ At least one field check
//     const hasFiles = req.files && req.files.length > 0;
//     if (!status && !remarks && !manualDocUrl && !hasFiles) {
//       return res.status(400).json({
//         success: false,
//         message: 'At least one field (Status, Upload_Document_Copy, Remarks, documents) is required',
//       });
//     }

//     // ✅ Find row by ID
//     const result = await findRowByID(searchId);

//     if (!result) {
//       return res.status(404).json({
//         success: false,
//         message: `No record found with ID: ${searchId}`,
//       });
//     }

//     const matchedRowIndex = result.rowIndex;

//     let documentUrl = manualDocUrl;
//     let uploadedFiles = [];

//     // ✅ Multiple files upload to Google Drive
//     if (hasFiles) {
//       try {
//         uploadedFiles = await uploadMultipleToDrive(req.files);
//         // Saari file URLs comma separated store hongi sheet me
//         const allUrls = uploadedFiles.map((f) => f.url).join(' , ');
//         documentUrl = documentUrl ? `${documentUrl} , ${allUrls}` : allUrls;
//       } catch (driveError) {
//         console.error('Drive upload error:', driveError.message);
//         return res.status(500).json({
//           success: false,
//           message: 'File upload to Google Drive failed',
//           error: driveError.message,
//         });
//       }
//     }

//     // ✅ Sheet update Q, R, S columns
//     const range = `Posseion_FMS!Q${matchedRowIndex}:S${matchedRowIndex}`;

//     await sheets.spreadsheets.values.update({
//       spreadsheetId,
//       range,
//       valueInputOption: 'USER_ENTERED',
//       requestBody: {
//         values: [[status, documentUrl, remarks]],
//       },
//     });

//     return res.status(200).json({
//       success: true,
//       message: `Data updated successfully for ID: ${searchId}`,
//       data: {
//         id:                   searchId,
//         matchedRow:           matchedRowIndex,
//         applicantName:        result.rowData[2] || '',
//         Status:               status,
//         Upload_Document_Copy: documentUrl,
//         Remarks:              remarks,
//         uploadedFiles:        uploadedFiles,
//         totalFilesUploaded:   uploadedFiles.length,
//         range,
//       },
//     });
//   } catch (error) {
//     console.error('Error updating data:', error.message);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: error.message,
//     });
//   }
// });

// module.exports = router; 



const express = require('express');
const multer = require('multer');
const stream = require('stream');
const { sheets, drive, spreadsheetId } = require('../../config/googleSheet');
const router = express.Router();

// Multer setup - ALL file types allowed
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
});

// Helper - Upload SINGLE file to Google Drive
async function uploadToDrive(file) {
  const bufferStream = new stream.PassThrough();
  bufferStream.end(file.buffer);

  const response = await drive.files.create({
    requestBody: {
      name: `${Date.now()}_${file.originalname}`,
      mimeType: file.mimetype,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    },
    media: {
      mimeType: file.mimetype,
      body: bufferStream,
    },
    fields: 'id, webViewLink, webContentLink',
    supportsAllDrives: true,        // ✅ FIX 1 - Shared Drive support
    supportsTeamDrives: true,       // ✅ FIX 1 - backward compat
  });

  await drive.permissions.create({
    fileId: response.data.id,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
    supportsAllDrives: true,        // ✅ FIX 2 - permission ke liye bhi zaroori
  });

  return `https://drive.google.com/file/d/${response.data.id}/view`;
}

// Helper - Upload MULTIPLE files to Google Drive
async function uploadMultipleToDrive(files) {
  const urls = [];

  for (const file of files) {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(file.buffer);

    const response = await drive.files.create({
      requestBody: {
        name: `${Date.now()}_${file.originalname}`,
        mimeType: file.mimetype,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      },
      media: {
        mimeType: file.mimetype,
        body: bufferStream,
      },
      fields: 'id, webViewLink, webContentLink',
      supportsAllDrives: true,      // ✅ FIX 3 - Shared Drive support
      supportsTeamDrives: true,     // ✅ FIX 3 - backward compat
    });

    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
      supportsAllDrives: true,      // ✅ FIX 3 - permission ke liye bhi
    });

    urls.push({
      fileName: file.originalname,
      fileType: file.mimetype,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      url: `https://drive.google.com/file/d/${response.data.id}/view`,
    });
  }

  return urls;
}

// Helper - Find row by ID
async function findRowByID(searchId) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Posseion_FMS!A7:S',
  });

  const rows = response.data.values || [];
  if (rows.length === 0) return null;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const id = (row[1] || '').toString().trim();
    if (id === searchId.toString().trim()) {
      return { rowIndex: i + 7, rowData: row };
    }
  }

  return null;
}

// GET - Fetch all Pending records
router.get('/Aggerement', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Posseion_FMS!A7:S',
    });

    const rows = response.data.values || [];

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No data found' });
    }

    const data = rows
      .slice(1)
      .map((row, index) => ({ originalRowIndex: index + 8, row }))
      .filter(({ row }) => {
        const qColumnValue = (row[16] || '').toString().trim().toLowerCase();
        return qColumnValue === 'pending';
      })
      .map(({ row, originalRowIndex }) => ({
        rowIndex:                originalRowIndex,
        applicationDate:         row[0]  || '',
        id:                      row[1]  || '',
        applicantName:           row[2]  || '',
        contact:                 row[3]  || '',
        currentAddress:          row[4]  || '',
        project:                 row[5]  || '',
        product:                 row[6]  || '',
        block:                   row[7]  || '',
        unitNo:                  row[8]  || '',
        unitType:                row[9]  || '',
        size:                    row[10] || '',
        unitCode:                row[11] || '',
        basicPriceAfterDiscount: row[12] || '',
        agreementValue:          row[13] || '',
        unitSoldThrough:         row[14] || '',
        date:                    row[15] || '',
        Status:                  row[16] || '',
        Upload_Document_Copy:    row[17] || '',
        Remarks:                 row[18] || '',
      }));

    return res.status(200).json({
      success: true,
      message: 'Pending records fetched successfully',
      totalRecords: data.length,
      data,
    });
  } catch (error) {
    console.error('Error fetching data:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// GET - Fetch single record by ID
router.get('/Aggerement/:id', async (req, res) => {
  try {
    const result = await findRowByID(req.params.id);

    if (!result) {
      return res.status(404).json({ success: false, message: `No record found with ID: ${req.params.id}` });
    }

    const row = result.rowData;

    return res.status(200).json({
      success: true,
      message: 'Record found successfully',
      data: {
        rowIndex:                result.rowIndex,
        applicationDate:         row[0]  || '',
        id:                      row[1]  || '',
        applicantName:           row[2]  || '',
        contact:                 row[3]  || '',
        currentAddress:          row[4]  || '',
        project:                 row[5]  || '',
        product:                 row[6]  || '',
        block:                   row[7]  || '',
        unitNo:                  row[8]  || '',
        unitType:                row[9]  || '',
        size:                    row[10] || '',
        unitCode:                row[11] || '',
        basicPriceAfterDiscount: row[12] || '',
        agreementValue:          row[13] || '',
        unitSoldThrough:         row[14] || '',
        date:                    row[15] || '',
        Status:                  row[16] || '',
        Upload_Document_Copy:    row[17] || '',
        Remarks:                 row[18] || '',
      },
    });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// POST - Update by ID (Multiple Files + Any File Type)
router.post('/Aggerement', upload.array('documents', 10), async (req, res) => {
  try {
    const searchId   = req.body.id || req.body.Id || req.body.ID || null;
    const status     = req.body.Status   || req.body.status   || '';
    const remarks    = req.body.Remarks  || req.body.remarks  || '';
    const manualDocUrl = req.body.Upload_Document_Copy || req.body.uploadDocumentCopy || req.body.documentUrl || '';

    if (!searchId) {
      return res.status(400).json({ success: false, message: 'id is required to find the record' });
    }

    const hasFiles = req.files && req.files.length > 0;

    if (!status && !remarks && !manualDocUrl && !hasFiles) {
      return res.status(400).json({
        success: false,
        message: 'At least one field (Status, Upload_Document_Copy, Remarks, documents) is required',
      });
    }

    const result = await findRowByID(searchId);

    if (!result) {
      return res.status(404).json({ success: false, message: `No record found with ID: ${searchId}` });
    }

    const matchedRowIndex = result.rowIndex;
    let documentUrl = manualDocUrl;
    let uploadedFiles = [];

    if (hasFiles) {
      try {
        uploadedFiles = await uploadMultipleToDrive(req.files);
        const allUrls = uploadedFiles.map((f) => f.url).join(' , ');
        documentUrl = documentUrl ? `${documentUrl} , ${allUrls}` : allUrls;
      } catch (driveError) {
        console.error('Drive upload error:', driveError.message);
        return res.status(500).json({
          success: false,
          message: 'File upload to Google Drive failed',
          error: driveError.message,
        });
      }
    }

    const range = `Posseion_FMS!Q${matchedRowIndex}:S${matchedRowIndex}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[status, documentUrl, remarks]] },
    });

    return res.status(200).json({
      success: true,
      message: `Data updated successfully for ID: ${searchId}`,
      data: {
        id:                   searchId,
        matchedRow:           matchedRowIndex,
        applicantName:        result.rowData[2] || '',
        Status:               status,
        Upload_Document_Copy: documentUrl,
        Remarks:              remarks,
        uploadedFiles,
        totalFilesUploaded:   uploadedFiles.length,
        range,
      },
    });
  } catch (error) {
    console.error('Error updating data:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

module.exports = router;