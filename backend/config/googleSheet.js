const { google } = require('googleapis');

const credentials = {
  type: process.env.GOOGLE_TYPE,
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : '',
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  auth_uri: process.env.GOOGLE_AUTH_URI,
  token_uri: process.env.GOOGLE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.GOOGLE_UNIVERSE_DOMAIN,
};

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive', // Added Drive scope
  ],
});

const sheets = google.sheets({ version: 'v4', auth });
const drive = google.drive({ version: "v3", auth, supportsAllDrives: true });
const spreadsheetId = process.env.SPREADSHEET_ID;
const workSpredSheetId = process.env.SPREADSHEETWORKSHEET_ID
// const totalLeadsSheetId = process.env.SPREADSHEET_TOTAL_LEADS
const QualifideLeadsSheetId = process.env.SPREADSHEET_TOTAL_LEADS

const RECONCILITION_ID= process.env.SPREADSHEET_RECONCILITION
const OfficeExpenseID= process.env.SPREADSHEET_OfficeExpenses

module.exports = { sheets, drive, spreadsheetId ,workSpredSheetId,QualifideLeadsSheetId,RECONCILITION_ID,OfficeExpenseID}; // Export drive


