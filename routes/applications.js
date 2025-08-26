const express = require('express');
const {
  getApplications,
  getApplication,
  createApplication,
  updateApplicationStatus
} = require('../controllers/applicationController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getApplications);
router.get('/:id', protect, getApplication);
router.post('/', protect, createApplication);
router.put('/:id/status', protect, admin, updateApplicationStatus);

module.exports = router;