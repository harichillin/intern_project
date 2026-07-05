const express = require('express');
const router = express.Router();

const dashboard   = require('../controllers/dashboard');
const customer    = require('../controllers/customer');
const alert       = require('../controllers/alert');
const report      = require('../controllers/report');
const notes       = require('../controllers/notes');
const transaction = require('../controllers/transaction');
const ml          = require('../controllers/ml');

// Dashboard
router.get('/dashboard/stats',   dashboard.getStats);
router.get('/dashboard/heatmap', dashboard.getHeatmap);

// Customers
router.get('/customers',                    customer.getAllCustomers);
router.get('/customers/:id',                customer.getCustomerById);
router.post('/customers/:id/refresh',       customer.refreshPredictions);
router.post('/customers/bulk-outreach',     customer.bulkOutreach);

// Notes
router.get('/customers/:id/notes',          notes.getNotes);
router.post('/customers/:id/notes',         notes.addNote);
router.delete('/notes/:noteId',             notes.deleteNote);

// Alerts
router.get('/alerts',           alert.getAlerts);
router.put('/alerts/:id',       alert.updateAlertStatus);

// Reports
router.get('/reports/revenue',        report.getRevenueReport);
router.get('/reports/risk-summary',   report.getRiskSummary);
router.get('/reports/city-breakdown', report.getCityBreakdown);

// Transactions
router.get('/transactions/feed', transaction.getLiveFeed);

// ML / System
router.post('/ml/retrain',    ml.retrainModels);
router.get('/ml/health',      ml.getSystemHealth);

module.exports = router;
