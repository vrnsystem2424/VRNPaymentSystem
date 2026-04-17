

// server.js
const express = require('express');
const { google } = require('googleapis');
const { validateEnv } = require('./config/env');
const cors = require("cors");

const Login = require('./Router/auth')

///// Payment ///////
const SchedulePayment = require('./controllers/Payment/SchedulePayment')
const PaymentReconcilition  = require('./controllers/Payment/Reconcilition')
const Form = require('./controllers/Payment/Form')
const Actual_Bank_In= require('./controllers/Payment/Actual_Bank_In')
const Bank_to_bank_transfer=require('./controllers/Payment/bank_to_bank_Transfer')


const leadsSummary= require('./controllers/Leads/LeadsSummary')
const officeExpenses = require('./controllers/OfficeExpenses/Approvel1')
const BillEntry= require('./controllers/OfficeExpenses/BillEntry')
const paymentOfficeExpenses= require('./controllers/OfficeExpenses/Payment')

const app = express();
// 1. CORS (Pehle daalo)
app.use(cors({
  origin: process.env.CLIENT_URL || '*', // Ya 'http://localhost:3000'
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 2. Body Parsing (Sirf Ek Baar + 10MB Limit)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. Handle OPTIONS Preflight (Safe & Working)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }
  next();
});

// 4. Validate Environment
validateEnv();


app.use('/api',Login)

app.use('/api/office',officeExpenses)
app.use('/api/office',BillEntry)
app.use('/api/office',paymentOfficeExpenses)


app.use('/api/payment', SchedulePayment)
app.use('/api/payment',PaymentReconcilition)
app.use('/api/payment',Form)
app.use('/api/payment',Actual_Bank_In)
app.use('/api/payment',Bank_to_bank_transfer)
app.use('/api', leadsSummary)



// 7. Health Check
app.get('/', (req, res) => {
  res.json({ message: 'FMS Backend Running!', time: new Date().toISOString() });
});

// 8. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`CORS enabled for: ${process.env.CLIENT_URL || 'all origins'}`);
});



