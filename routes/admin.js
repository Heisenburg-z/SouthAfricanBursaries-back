const express = require('express');
const {
  getDashboardStats,
  getRecentActivity,
  bulkOpportunityOperation,
  exportData,
  getAnalytics
} = require('../controllers/ adminController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// All routes require admin authentication
router.use(protect, admin);

// Dashboard statistics
router.get('/stats', getDashboardStats);

// Recent activity
router.get('/activity', getRecentActivity);

// Bulk operations on opportunities
router.post('/opportunities/bulk', bulkOpportunityOperation);

// Export data as CSV
router.get('/export/:type', exportData);

// Analytics data
router.get('/analytics', getAnalytics);

module.exports = router;
