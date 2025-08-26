const express = require('express');
const {
  getOpportunities,
  getOpportunity,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity
} = require('../controllers/opportunityController');
const { protect, admin } = require('../middleware/auth');
const { validateOpportunity } = require('../middleware/validation');

const router = express.Router();

router.get('/', getOpportunities);
router.get('/:id', getOpportunity);
router.post('/', protect, admin, validateOpportunity, createOpportunity);
router.put('/:id', protect, admin, validateOpportunity, updateOpportunity);
router.delete('/:id', protect, admin, deleteOpportunity);

module.exports = router;