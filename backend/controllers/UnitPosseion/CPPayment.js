
// const express = require('express');
// const multer = require('multer');
// const stream = require('stream');
// const { sheets, drive, spreadsheetId } = require('../../config/googleSheet');
// const router = express.Router();

// // Multer setup - ALL file types allowed
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 50 * 1024 * 1024 },
// });

// // Helper - Upload SINGLE file to Google Drive
// async function uploadToDrive(file) {
//   const bufferStream = new stream.PassThrough();
//   bufferStream.end(file.buffer);

//   const response = await drive.files.create({
//     requestBody: {
//       name: `${Date.now()}_${file.originalname}`,
//       mimeType: file.mimetype,
//       parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
//     },
//     media: { mimeType: file.mimetype, body: bufferStream },
//     fields: 'id, webViewLink, webContentLink',
//     supportsAllDrives: true,   // ✅ FIX 4 - Shared Drive
//     supportsTeamDrives: true,
//   });

//   await drive.permissions.create({
//     fileId: response.data.id,
//     requestBody: { role: 'reader', type: 'anyone' },
//     supportsAllDrives: true,   // ✅ FIX 4 - permission
//   });

//   return `https://drive.google.com/file/d/${response.data.id}/view`;
// }

// // Helper - Upload MULTIPLE files to Google Drive
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
//       media: { mimeType: file.mimetype, body: bufferStream },
//       fields: 'id, webViewLink, webContentLink',
//       supportsAllDrives: true,   // ✅ FIX 4 - Shared Drive
//       supportsTeamDrives: true,
//     });

//     await drive.permissions.create({
//       fileId: response.data.id,
//       requestBody: { role: 'reader', type: 'anyone' },
//       supportsAllDrives: true,   // ✅ FIX 4 - permission
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

// // Helper - Find row by ID
// async function findRowByID(searchId) {
//   const response = await sheets.spreadsheets.values.get({
//     spreadsheetId,
//     range: 'Posseion_FMS!A7:AL', // ✅ FIX 1 - AL tak (pehle S tha, AD-AL columns miss ho rahi thi)
//   });

//   const rows = response.data.values || [];
//   if (rows.length === 0) return null;

//   for (let i = 1; i < rows.length; i++) {
//     const row = rows[i];
//     const id = (row[1] || '').toString().trim();
//     if (id === searchId.toString().trim()) {
//       return { rowIndex: i + 7, rowData: row };
//     }
//   }

//   return null;
// }

// // GET - Sabhi Pending records (AD column index 29 = pending)
// router.get('/CPPayment', async (req, res) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Posseion_FMS!A7:AL',
//     });

//     const rows = response.data.values || [];

//     if (rows.length === 0) {
//       return res.status(404).json({ success: false, message: 'No data found' });
//     }

//     const data = rows
//       .slice(1)
//       .map((row, index) => ({ originalRowIndex: index + 8, row }))
//       .filter(({ row }) => {
//         const adColumnValue = (row[29] || '').toString().trim().toLowerCase();
//         return adColumnValue === 'pending'; // AD column = index 29
//       })
//       .map(({ row, originalRowIndex }) => ({
//         rowIndex:                originalRowIndex,
//         applicationDate:         row[0]  || '',
//         id:                      row[1]  || '',
//         applicantName:           row[2]  || '',
//         contact:                 row[3]  || '',
//         currentAddress:          row[4]  || '',
//         project:                 row[5]  || '',
//         product:                 row[6]  || '',
//         block:                   row[7]  || '',
//         unitNo:                  row[8]  || '',
//         unitType:                row[9]  || '',
//         size:                    row[10] || '',
//         unitCode:                row[11] || '',
//         basicPriceAfterDiscount: row[12] || '',
//         agreementValue:          row[13] || '',
//         unitSoldThrough:         row[14] || '',

//         date:                    row[19] || '', // T col
//         Status:                  row[29] || '', // AD col ✅ FIX 2
//         // Channel_Partner_Name:    row[31] || '', // AF col ✅ FIX 2 - was missing
//         // CP_Contact:              row[32] || '', // AG col ✅ FIX 2 - was missing
//         Amount_to_be_Paid:       row[33] || '', // AH col ✅ FIX 2 - was missing
//         Percent_of_Basic_Price:  row[34] || '', // AI col ✅ FIX 2 - was missing
//         Upload_Douc:             row[35] || '', // AJ col ✅ FIX 2
//         Photo:                   row[36] || '', // AK col ✅ FIX 2 - was missing
//         Remarks:                 row[37] || '', // AL col ✅ FIX 2
//       }));

//     return res.status(200).json({
//       success: true,
//       message: 'Pending records fetched successfully',
//       totalRecords: data.length,
//       data,
//     });
//   } catch (error) {
//     console.error('Error fetching data:', error.message);
//     return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
//   }
// });

// // GET - Single record by ID
// router.get('/CPPayment/:id', async (req, res) => {
//   try {
//     const result = await findRowByID(req.params.id);

//     if (!result) {
//       return res.status(404).json({ success: false, message: `No record found with ID: ${req.params.id}` });
//     }

//     const row = result.rowData;

//     return res.status(200).json({
//       success: true,
//       message: 'Record found successfully',
//       data: {
//         rowIndex:                result.rowIndex,
//         applicationDate:         row[0]  || '',
//         id:                      row[1]  || '',
//         applicantName:           row[2]  || '',
//         contact:                 row[3]  || '',
//         currentAddress:          row[4]  || '',
//         project:                 row[5]  || '',
//         product:                 row[6]  || '',
//         block:                   row[7]  || '',
//         unitNo:                  row[8]  || '',
//         unitType:                row[9]  || '',
//         size:                    row[10] || '',
//         unitCode:                row[11] || '',
//         basicPriceAfterDiscount: row[12] || '',
//         agreementValue:          row[13] || '',
//         unitSoldThrough:         row[14] || '',
//         date:                    row[19] || '', // T col
//         Status:                  row[29] || '', // AD col ✅ FIX 3
//         Channel_Partner_Name:    row[31] || '', // AF col ✅ FIX 3
//         CP_Contact:              row[32] || '', // AG col ✅ FIX 3
//         Amount_to_be_Paid:       row[33] || '', // AH col ✅ FIX 3
//         Percent_of_Basic_Price:  row[34] || '', // AI col ✅ FIX 3
//         Upload_Douc:             row[35] || '', // AJ col ✅ FIX 3
//         Photo:                   row[36] || '', // AK col ✅ FIX 3
//         Remarks:                 row[37] || '', // AL col ✅ FIX 3
//       },
//     });
//   } catch (error) {
//     console.error('Error:', error.message);
//     return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
//   }
// });

// // POST - Update by ID
// router.post('/CPPayment', upload.array('documents', 10), async (req, res) => {
//   try {
//     const searchId           = req.body.id || req.body.Id || req.body.ID || null;
//     const status             = req.body.Status              || req.body.status              || '';
//     const channelPartnerName = req.body.Channel_Partner_Name || req.body.channelPartnerName  || req.body.ChannelPartnerName || '';
//     const contact            = req.body.Contact             || req.body.contact             || '';
//     const amountToBePaid     = req.body.Amount_to_be_Paid   || req.body.amountToBePaid      || req.body.AmountToBePaid    || '';
//     const percentOfBasicPrice= req.body.Percent_of_Basic_Price || req.body.percentOfBasicPrice || req.body.PercentOfBasicPrice || '';
//     const remarks            = req.body.Remarks             || req.body.remarks             || '';
//     const manualDocUrl       = req.body.Upload_Douc         || req.body.uploadDouc          || req.body.UploadDouc        || '';
//     const manualPhotoUrl     = req.body.Photo               || req.body.photo               || '';

//     if (!searchId) {
//       return res.status(400).json({ success: false, message: 'id is required to find the record' });
//     }

//     const hasFiles = req.files && req.files.length > 0;

//     if (!status && !channelPartnerName && !contact && !amountToBePaid &&
//         !percentOfBasicPrice && !manualDocUrl && !manualPhotoUrl && !remarks && !hasFiles) {
//       return res.status(400).json({ success: false, message: 'At least one field is required' });
//     }

//     const result = await findRowByID(searchId);

//     if (!result) {
//       return res.status(404).json({ success: false, message: `No record found with ID: ${searchId}` });
//     }

//     const matchedRowIndex = result.rowIndex;
//     let uploadDocUrl  = manualDocUrl;
//     let photoUrl      = manualPhotoUrl;
//     let uploadedFiles = [];

//     if (hasFiles) {
//       try {
//         uploadedFiles = await uploadMultipleToDrive(req.files);

//         const docFiles = uploadedFiles.filter((f) =>
//           f.fileType.includes('pdf') || f.fileType.includes('document') ||
//           f.fileType.includes('sheet') || f.fileType.includes('word')
//         );
//         const photoFiles = uploadedFiles.filter((f) =>
//           f.fileType.includes('image') || f.fileType.includes('jpeg') ||
//           f.fileType.includes('png')   || f.fileType.includes('webp')
//         );
//         const otherFiles = uploadedFiles.filter(
//           (f) => !docFiles.includes(f) && !photoFiles.includes(f)
//         );

//         if (docFiles.length > 0) {
//           const docUrls = docFiles.map((f) => f.url).join(' , ');
//           uploadDocUrl = uploadDocUrl ? `${uploadDocUrl} , ${docUrls}` : docUrls;
//         }
//         if (photoFiles.length > 0) {
//           const photoUrls = photoFiles.map((f) => f.url).join(' , ');
//           photoUrl = photoUrl ? `${photoUrl} , ${photoUrls}` : photoUrls;
//         }
//         if (otherFiles.length > 0) {
//           const otherUrls = otherFiles.map((f) => f.url).join(' , ');
//           uploadDocUrl = uploadDocUrl ? `${uploadDocUrl} , ${otherUrls}` : otherUrls;
//         }
//       } catch (driveError) {
//         console.error('Drive upload error:', driveError.message);
//         return res.status(500).json({
//           success: false,
//           message: 'File upload to Google Drive failed',
//           error: driveError.message,
//         });
//       }
//     }

//     // AE column preserve karo (Time Delay)
//     const existingAE = result.rowData[30] || '';

//     // AD=Status, AE=TimeDelay(preserve), AF=CPName, AG=Contact,
//     // AH=Amount, AI=Percent, AJ=UploadDoc, AK=Photo, AL=Remarks
//     const range = `Posseion_FMS!AD${matchedRowIndex}:AL${matchedRowIndex}`;

//     await sheets.spreadsheets.values.update({
//       spreadsheetId,
//       range,
//       valueInputOption: 'USER_ENTERED',
//       requestBody: {
//         values: [[
//           status,               // AD
//           existingAE,           // AE (keep existing)
//           channelPartnerName,   // AF
//           contact,              // AG
//           amountToBePaid,       // AH
//           percentOfBasicPrice,  // AI
//           uploadDocUrl,         // AJ
//           photoUrl,             // AK
//           remarks,              // AL
//         ]],
//       },
//     });

//     return res.status(200).json({
//       success: true,
//       message: `Data updated successfully for ID: ${searchId}`,
//       data: {
//         id:                     searchId,
//         matchedRow:             matchedRowIndex,
//         applicantName:          result.rowData[2] || '',
//         Status:                 status,
//         Channel_Partner_Name:   channelPartnerName,
//         Contact:                contact,
//         Amount_to_be_Paid:      amountToBePaid,
//         Percent_of_Basic_Price: percentOfBasicPrice,
//         Upload_Douc:            uploadDocUrl,
//         Photo:                  photoUrl,
//         Remarks:                remarks,
//         uploadedFiles,
//         totalFilesUploaded:     uploadedFiles.length,
//         range,
//       },
//     });
//   } catch (error) {
//     console.error('Error updating data:', error.message);
//     return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
//   }
// });

// module.exports = router;








//////////




const express = require('express');
const multer = require('multer');
const stream = require('stream');
const { sheets, drive, spreadsheetId } = require('../../config/googleSheet');
const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

async function uploadToDrive(file) {
  const bufferStream = new stream.PassThrough();
  bufferStream.end(file.buffer);

  const response = await drive.files.create({
    requestBody: {
      name: `${Date.now()}_${file.originalname}`,
      mimeType: file.mimetype,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    },
    media: { mimeType: file.mimetype, body: bufferStream },
    fields: 'id, webViewLink, webContentLink',
    supportsAllDrives: true,
    supportsTeamDrives: true,
  });

  await drive.permissions.create({
    fileId: response.data.id,
    requestBody: { role: 'reader', type: 'anyone' },
    supportsAllDrives: true,
  });

  return `https://drive.google.com/file/d/${response.data.id}/view`;
}

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
      media: { mimeType: file.mimetype, body: bufferStream },
      fields: 'id, webViewLink, webContentLink',
      supportsAllDrives: true,
      supportsTeamDrives: true,
    });

    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: { role: 'reader', type: 'anyone' },
      supportsAllDrives: true,
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

async function findRowByID(searchId) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Posseion_FMS!A7:AL',
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

// GET - Fetch records with smart filter:
// ✅ Pending wale: hamesha dikhao
// ✅ Done wale: sirf tab dikhao jab AK column (Photo, index 36) empty ho
router.get('/CPPayment', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Posseion_FMS!A7:AL',
    });

    const rows = response.data.values || [];

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No data found' });
    }

    const data = rows
      .slice(1)
      .map((row, index) => ({ originalRowIndex: index + 8, row }))
      .filter(({ row }) => {
        const status  = (row[29] || '').toString().trim().toLowerCase(); // AD col
        const photo   = (row[36] || '').toString().trim();               // AK col

        // Pending: hamesha dikhao
        if (status === 'pending') return true;

        // Done: sirf tab dikhao jab photo empty ho
        if (status === 'done' && photo === '') return true;

        return false;
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
        date:                    row[19] || '', // T col
        Status:                  row[29] || '', // AD col
        Channel_Partner_Name:    row[31] || '', // AF col
        CP_Contact:              row[32] || '', // AG col
        Amount_to_be_Paid:       row[33] || '', // AH col
        Percent_of_Basic_Price:  row[34] || '', // AI col
        Upload_Douc:             row[35] || '', // AJ col
        Photo:                   row[36] || '', // AK col
        Remarks:                 row[37] || '', // AL col
      }));

    return res.status(200).json({
      success: true,
      message: 'Records fetched successfully',
      totalRecords: data.length,
      data,
    });
  } catch (error) {
    console.error('Error fetching data:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// GET - Single record by ID
router.get('/CPPayment/:id', async (req, res) => {
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
        date:                    row[19] || '',
        Status:                  row[29] || '',
        Channel_Partner_Name:    row[31] || '',
        CP_Contact:              row[32] || '',
        Amount_to_be_Paid:       row[33] || '',
        Percent_of_Basic_Price:  row[34] || '',
        Upload_Douc:             row[35] || '',
        Photo:                   row[36] || '',
        Remarks:                 row[37] || '',
      },
    });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// POST - Update by ID
router.post('/CPPayment', upload.array('documents', 10), async (req, res) => {
  try {
    const searchId           = req.body.id || req.body.Id || req.body.ID || null;
    const status             = req.body.Status               || req.body.status              || '';
    const channelPartnerName = req.body.Channel_Partner_Name || req.body.channelPartnerName  || req.body.ChannelPartnerName || '';
    const contact            = req.body.Contact              || req.body.contact             || '';
    const amountToBePaid     = req.body.Amount_to_be_Paid    || req.body.amountToBePaid      || req.body.AmountToBePaid    || '';
    const percentOfBasicPrice= req.body.Percent_of_Basic_Price || req.body.percentOfBasicPrice || req.body.PercentOfBasicPrice || '';
    const remarks            = req.body.Remarks              || req.body.remarks             || '';
    const manualDocUrl       = req.body.Upload_Douc          || req.body.uploadDouc          || req.body.UploadDouc        || '';
    const manualPhotoUrl     = req.body.Photo                || req.body.photo               || '';

    if (!searchId) {
      return res.status(400).json({ success: false, message: 'id is required to find the record' });
    }

    const hasFiles = req.files && req.files.length > 0;

    if (!status && !channelPartnerName && !contact && !amountToBePaid &&
        !percentOfBasicPrice && !manualDocUrl && !manualPhotoUrl && !remarks && !hasFiles) {
      return res.status(400).json({ success: false, message: 'At least one field is required' });
    }

    const result = await findRowByID(searchId);

    if (!result) {
      return res.status(404).json({ success: false, message: `No record found with ID: ${searchId}` });
    }

    const matchedRowIndex = result.rowIndex;
    let uploadDocUrl  = manualDocUrl;
    let photoUrl      = manualPhotoUrl;
    let uploadedFiles = [];

    if (hasFiles) {
      try {
        uploadedFiles = await uploadMultipleToDrive(req.files);

        const docFiles = uploadedFiles.filter((f) =>
          f.fileType.includes('pdf') || f.fileType.includes('document') ||
          f.fileType.includes('sheet') || f.fileType.includes('word')
        );
        const photoFiles = uploadedFiles.filter((f) =>
          f.fileType.includes('image') || f.fileType.includes('jpeg') ||
          f.fileType.includes('png')   || f.fileType.includes('webp')
        );
        const otherFiles = uploadedFiles.filter(
          (f) => !docFiles.includes(f) && !photoFiles.includes(f)
        );

        if (docFiles.length > 0) {
          const docUrls = docFiles.map((f) => f.url).join(' , ');
          uploadDocUrl = uploadDocUrl ? `${uploadDocUrl} , ${docUrls}` : docUrls;
        }
        if (photoFiles.length > 0) {
          const photoUrls = photoFiles.map((f) => f.url).join(' , ');
          photoUrl = photoUrl ? `${photoUrl} , ${photoUrls}` : photoUrls;
        }
        if (otherFiles.length > 0) {
          const otherUrls = otherFiles.map((f) => f.url).join(' , ');
          uploadDocUrl = uploadDocUrl ? `${uploadDocUrl} , ${otherUrls}` : otherUrls;
        }
      } catch (driveError) {
        console.error('Drive upload error:', driveError.message);
        return res.status(500).json({
          success: false,
          message: 'File upload to Google Drive failed',
          error: driveError.message,
        });
      }
    }

    const existingAE = result.rowData[30] || '';

    const range = `Posseion_FMS!AD${matchedRowIndex}:AL${matchedRowIndex}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          status,               // AD
          existingAE,           // AE (keep existing)
          channelPartnerName,   // AF
          contact,              // AG
          amountToBePaid,       // AH
          percentOfBasicPrice,  // AI
          uploadDocUrl,         // AJ
          photoUrl,             // AK
          remarks,              // AL
        ]],
      },
    });

    return res.status(200).json({
      success: true,
      message: `Data updated successfully for ID: ${searchId}`,
      data: {
        id:                     searchId,
        matchedRow:             matchedRowIndex,
        applicantName:          result.rowData[2] || '',
        Status:                 status,
        Channel_Partner_Name:   channelPartnerName,
        Contact:                contact,
        Amount_to_be_Paid:      amountToBePaid,
        Percent_of_Basic_Price: percentOfBasicPrice,
        Upload_Douc:            uploadDocUrl,
        Photo:                  photoUrl,
        Remarks:                remarks,
        uploadedFiles,
        totalFilesUploaded:     uploadedFiles.length,
        range,
      },
    });
  } catch (error) {
    console.error('Error updating data:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

module.exports = router;