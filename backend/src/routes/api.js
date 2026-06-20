/**
 * NexaCore Sentinel AI: API Routes
 * Location: backend/src/routes/api.js
 */

const express = require('express');
const router = express.Router();

const dashboard = require('../controllers/dashboard');
const customer = require('../controllers/customer');
const alert = require('../controllers/alert');
const report = require('../controllers/report');

// Dashboard
router.get('/dashboard/stats', dashboard.getStats);

// Customers
router.get('/customers', customer.getAllCustomers);
router.get('/customers/:id', customer.getCustomerById);
router.post('/customers/:id/refresh', customer.refreshPredictions);

// Alerts
router.get('/alerts', alert.getAlerts);
router.put('/alerts/:id', alert.updateAlertStatus);

// Reports
router.get('/reports/revenue', report.getRevenueReport);
router.get('/reports/risk-summary', report.getRiskSummary);

module.exports = router;
